"""
Roadmap API — reading level progression per book.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.models import Book, Insight, ReadingLevel, UserLevelProgress, User
from app.services.roadmap_builder import build_roadmap_for_book

router = APIRouter(prefix="/books", tags=["roadmap"])


@router.get("/{book_id}/roadmap")
def get_roadmap(
    book_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the roadmap levels for a book with the user's progress state."""
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(404, "Book not found")

    if book.status != "ready":
        raise HTTPException(400, f"Book is still {book.status}. Roadmap available once processing is complete.")

    levels = build_roadmap_for_book(book, db)

    # Load user progress
    progress_map: dict[str, UserLevelProgress] = {}
    for prog in db.query(UserLevelProgress).filter(
        UserLevelProgress.user_id == current_user.id,
        UserLevelProgress.book_id == book_id,
    ).all():
        progress_map[prog.level_id] = prog

    sorted_levels = sorted(levels, key=lambda l: l.level_index)
    result_levels = []
    for i, level in enumerate(sorted_levels):
        prog = progress_map.get(level.id)

        if prog:
            state = prog.state
        elif i == 0:
            state = "available"
        else:
            prev_level = sorted_levels[i - 1]
            prev_prog = progress_map.get(prev_level.id)
            state = "available" if (prev_prog and prev_prog.state == "completed") else "locked"

        result_levels.append({
            "id": level.id,
            "level_index": level.level_index,
            "title": level.title,
            "description": level.description,
            "level_type": level.level_type,
            "xp_points": level.xp_points,
            "section_start": level.section_start,
            "section_end": level.section_end,
            "state": state,
            "completed_at": prog.completed_at.isoformat() if prog and prog.completed_at else None,
        })

    total_xp = sum(l.xp_points for l in levels)
    earned_xp = sum(p.xp_earned for p in progress_map.values() if p.state == "completed")
    completed_count = sum(1 for p in progress_map.values() if p.state == "completed")

    return {
        "book_id": book_id,
        "book_title": book.title,
        "book_author": book.author,
        "total_levels": len(levels),
        "completed_levels": completed_count,
        "total_xp": total_xp,
        "earned_xp": earned_xp,
        "progress_percent": round((completed_count / len(levels)) * 100) if levels else 0,
        "levels": result_levels,
    }


@router.get("/{book_id}/roadmap/{level_id}/content")
def get_level_content(
    book_id: str,
    level_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the insights/content for a specific level."""
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(404, "Book not found")

    level = db.query(ReadingLevel).filter(
        ReadingLevel.id == level_id, ReadingLevel.book_id == book_id
    ).first()
    if not level:
        raise HTTPException(404, "Level not found")

    insights = (
        db.query(Insight)
        .filter(Insight.book_id == book_id)
        .order_by(Insight.order_index)
        .offset(level.section_start)
        .limit(level.section_end - level.section_start + 1)
        .all()
    )

    # Mark as in_progress
    prog = db.query(UserLevelProgress).filter(
        UserLevelProgress.user_id == current_user.id,
        UserLevelProgress.level_id == level_id,
    ).first()

    if not prog:
        prog = UserLevelProgress(
            user_id=current_user.id, book_id=book_id,
            level_id=level_id, state="in_progress",
        )
        db.add(prog)
        db.commit()
    elif prog.state == "available":
        prog.state = "in_progress"
        db.commit()

    return {
        "level": {
            "id": level.id, "title": level.title,
            "description": level.description,
            "level_type": level.level_type,
            "xp_points": level.xp_points,
        },
        "insights": [
            {
                "id": ins.id, "text": ins.text,
                "type": ins.type, "page_number": ins.page_number,
            }
            for ins in insights
        ],
        "state": prog.state,
    }


@router.post("/{book_id}/roadmap/{level_id}/complete")
def complete_level(
    book_id: str,
    level_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a level as completed and unlock the next one."""
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(404, "Book not found")

    level = db.query(ReadingLevel).filter(
        ReadingLevel.id == level_id, ReadingLevel.book_id == book_id
    ).first()
    if not level:
        raise HTTPException(404, "Level not found")

    prog = db.query(UserLevelProgress).filter(
        UserLevelProgress.user_id == current_user.id,
        UserLevelProgress.level_id == level_id,
    ).first()

    if not prog:
        prog = UserLevelProgress(
            user_id=current_user.id, book_id=book_id, level_id=level_id,
        )
        db.add(prog)

    prog.state = "completed"
    prog.completed_at = datetime.now(timezone.utc)
    prog.xp_earned = level.xp_points
    db.commit()

    # Unlock next level
    all_levels = (
        db.query(ReadingLevel)
        .filter(ReadingLevel.book_id == book_id)
        .order_by(ReadingLevel.level_index)
        .all()
    )
    next_level = next((l for l in all_levels if l.level_index == level.level_index + 1), None)
    next_level_id = None
    if next_level:
        next_prog = db.query(UserLevelProgress).filter(
            UserLevelProgress.user_id == current_user.id,
            UserLevelProgress.level_id == next_level.id,
        ).first()
        if not next_prog:
            next_prog = UserLevelProgress(
                user_id=current_user.id, book_id=book_id,
                level_id=next_level.id, state="available",
            )
            db.add(next_prog)
            db.commit()
        next_level_id = next_level.id

    earned_xp = sum(
        p.xp_earned for p in db.query(UserLevelProgress).filter(
            UserLevelProgress.user_id == current_user.id,
            UserLevelProgress.book_id == book_id,
            UserLevelProgress.state == "completed",
        ).all()
    )

    return {
        "completed": True,
        "xp_earned": level.xp_points,
        "total_xp": earned_xp,
        "next_level_id": next_level_id,
    }


@router.get("/{book_id}/page/{page_number}")
def get_book_page(
    book_id: str,
    page_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return text or a base64 image for a specific page from the book PDF."""
    import base64
    from io import BytesIO
    from app.services import file_storage

    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(404, "Book not found")
    if not book.file_path:
        raise HTTPException(404, "Original file not available")

    try:
        from pypdf import PdfReader
        pdf_bytes = file_storage.read_file_bytes(book.file_path)
        reader = PdfReader(BytesIO(pdf_bytes))
        total_pages = len(reader.pages)

        if page_number < 1 or page_number > total_pages:
            raise HTTPException(400, f"Page {page_number} out of range (1-{total_pages})")

        # Try pdf2image for a rendered image
        try:
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(
                pdf_bytes, dpi=150, first_page=page_number, last_page=page_number
            )
            if images:
                buf = BytesIO()
                images[0].save(buf, format="PNG")
                return {
                    "page_number": page_number,
                    "total_pages": total_pages,
                    "image_b64": base64.b64encode(buf.getvalue()).decode(),
                    "type": "image",
                }
        except Exception:
            pass

        # Fallback: return extracted text
        page_text = reader.pages[page_number - 1].extract_text() or "(No text on this page)"
        return {
            "page_number": page_number,
            "total_pages": total_pages,
            "text": page_text,
            "type": "text",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to read page: {e}")

