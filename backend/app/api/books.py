import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_active_access
from app.core.config import settings
from app.db.base import get_db
from app.models.models import Book, Flashcard, Insight, ReviewState, User
from app.services import file_storage
from app.services.ingestion import IngestionError, chunk_text, extract_text_layer, run_ocr
from app.services.llm_pipeline import process_section

logger = logging.getLogger("booktutor.books")
router = APIRouter(prefix="/books", tags=["books"])


@router.post("/upload")
def upload_books(files: list[UploadFile], db: Session = Depends(get_db), current_user: User = Depends(require_active_access)):
    """Accepts multiple files in one request; each is processed independently
    so one bad file doesn't fail the whole batch."""
    results = []
    for file in files:
        results.append(_process_single_upload(file, db, current_user))
    return {"results": results}


def _process_single_upload(file: UploadFile, db: Session, current_user: User) -> dict:
    if not file.filename.lower().endswith(".pdf"):
        return {
            "filename": file.filename, "status": "failed",
            "error": "Only PDF is supported in this build.", "error_code": "unsupported_format",
        }

    title = file.filename.rsplit(".", 1)[0]
    book = Book(user_id=current_user.id, title=title, filename=file.filename, status="uploading")
    db.add(book)
    db.commit()
    db.refresh(book)

    # --- Stream to disk (status: uploading) ---
    try:
        file_path, size_bytes = file_storage.save_upload_streamed(file, current_user.id)
        book.file_path = file_path
        book.status = "extracting"
        db.commit()
    except file_storage.UploadTooLarge as e:
        book.status = "failed"
        book.error_code = "file_too_large"
        book.error_message = f"File exceeds the {e.limit_mb}MB limit."
        db.commit()
        return {"filename": file.filename, "status": "failed", "book_id": book.id, "error": book.error_message, "error_code": book.error_code}
    except Exception:
        logger.exception("Upload streaming failed for %s", file.filename)
        book.status = "failed"
        book.error_code = "upload_failed"
        book.error_message = "Something went wrong while uploading this file. Please try again."
        db.commit()
        return {"filename": file.filename, "status": "failed", "book_id": book.id, "error": book.error_message, "error_code": book.error_code}

    # --- Extract text, OCR fallback, LLM pipeline ---
    try:
        raw = file_storage.read_file_bytes(file_path)
        text, is_scanned = extract_text_layer(raw, file.filename)

        if is_scanned:
            book.is_scanned = True
            book.status = "ocr_processing"
            db.commit()
            text = run_ocr(raw, file.filename)

        book.status = "processing"
        db.commit()

        sections = chunk_text(text)
        if not sections:
            raise IngestionError("No usable text sections found in this file.", code="no_content_found")

        order_index = 0
        for section in sections:
            result = process_section(section)
            for insight in result["insights"]:
                db.add(Insight(
                    book_id=book.id,
                    text=insight["text"],
                    type=insight.get("type", "concept"),
                    order_index=order_index,
                ))
                order_index += 1
            for card in result["flashcards"]:
                flashcard = Flashcard(book_id=book.id, front=card["front"], back=card["back"])
                db.add(flashcard)
                db.flush()  # get flashcard.id before creating review_state
                db.add(ReviewState(flashcard_id=flashcard.id, user_id=current_user.id))

        book.status = "ready"
        db.commit()
        return {"filename": file.filename, "status": "ready", "book_id": book.id, "is_scanned": book.is_scanned}

    except IngestionError as e:
        logger.warning("Ingestion failed for %s: %s", file.filename, e)
        book.status = "failed"
        book.error_code = e.code
        book.error_message = str(e)
        db.commit()
        return {"filename": file.filename, "status": "failed", "book_id": book.id, "error": str(e), "error_code": e.code}
    except Exception:
        logger.exception("Unexpected error processing %s", file.filename)
        book.status = "failed"
        book.error_code = "processing_failed"
        book.error_message = "An unexpected error occurred while processing this file."
        db.commit()
        return {"filename": file.filename, "status": "failed", "book_id": book.id, "error": book.error_message, "error_code": book.error_code}


@router.get("")
def list_books(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    books = db.query(Book).filter(Book.user_id == current_user.id).order_by(Book.created_at.desc()).all()
    return [
        {
            "id": b.id, "title": b.title, "author": b.author, "status": b.status,
            "is_scanned": b.is_scanned, "error_message": b.error_message,
            "error_code": b.error_code, "created_at": b.created_at,
        }
        for b in books
    ]


@router.get("/{book_id}/status")
def book_status(book_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Scoped by user_id server-side — a user cannot poll another user's book
    # status by guessing an id (this is the same authorization pattern used
    # for delete below).
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(404, "Book not found")
    return {
        "id": book.id, "status": book.status, "is_scanned": book.is_scanned,
        "error_message": book.error_message, "error_code": book.error_code,
    }


@router.delete("/{book_id}")
def delete_book(book_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Deletes a book and everything derived from it. Authorization is
    server-side and non-negotiable: the query below filters by both book_id
    AND the authenticated user's id, so a user can never delete another
    user's book even if they know or guess its id — this is not a
    frontend-only check."""
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        # Deliberately the same 404 whether the book doesn't exist or
        # belongs to someone else — this avoids leaking which book ids are
        # valid to an attacker probing ids that aren't theirs.
        raise HTTPException(404, "Book not found")

    file_storage.delete_file(book.file_path)

    # ORM-level delete triggers the cascade="all, delete-orphan" relationships
    # already defined on Book (insights, flashcards) and on Flashcard
    # (review_state) — this removes every derived row, not just the Book row.
    db.delete(book)
    db.commit()

    return {"status": "deleted", "book_id": book_id}
