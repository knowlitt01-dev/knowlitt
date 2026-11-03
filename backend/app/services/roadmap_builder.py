"""
Generates reading levels (roadmap milestones) for a book based on its insights.
"""
import math
from sqlalchemy.orm import Session
from app.models.models import Book, Insight, ReadingLevel


def build_roadmap_for_book(book: Book, db: Session) -> list[ReadingLevel]:
    """
    Auto-generate ReadingLevel rows for a book from its insights.
    Idempotent — if levels already exist, returns them without recreating.
    """
    existing = db.query(ReadingLevel).filter(ReadingLevel.book_id == book.id).order_by(ReadingLevel.level_index).all()
    if existing:
        return existing

    insights = (
        db.query(Insight)
        .filter(Insight.book_id == book.id)
        .order_by(Insight.order_index)
        .all()
    )

    levels = []
    level_index = 0
    total = len(insights)

    if total == 0:
        placeholders = [
            ("Introduction & Foundations", "reading", 10),
            ("Core Concepts", "reading", 15),
            ("Key Arguments & Evidence", "reading", 20),
            ("Section Summary", "summary", 20),
            ("Knowledge Assessment", "quiz", 50),
        ]
        for title, ltype, xp in placeholders:
            level = ReadingLevel(
                book_id=book.id,
                level_index=level_index,
                title=title,
                description=title,
                level_type=ltype,
                xp_points=xp,
                section_start=0,
                section_end=0,
            )
            db.add(level)
            levels.append(level)
            level_index += 1
        db.commit()
        return levels

    # Determine number of reading groups (1 per ~8 insights, min 2, max 6)
    reading_groups = max(2, min(6, math.ceil(total / 8)))
    chunk_size = math.ceil(total / reading_groups)

    for group_i in range(reading_groups):
        start = group_i * chunk_size
        end = min(start + chunk_size, total) - 1

        if group_i == 0:
            title = "Introduction & Foundations"
        elif group_i == reading_groups - 1:
            title = "Final Concepts & Synthesis"
        else:
            title = f"Core Concepts — Part {group_i + 1}"

        level = ReadingLevel(
            book_id=book.id,
            level_index=level_index,
            title=title,
            description=f"Insights {start + 1}–{end + 1} of {total}",
            level_type="reading",
            xp_points=10 + group_i * 5,
            section_start=start,
            section_end=end,
        )
        db.add(level)
        levels.append(level)
        level_index += 1

        # Insert a summary milestone after every 2 reading sections
        if (group_i + 1) % 2 == 0 or group_i == reading_groups - 1:
            summary_level = ReadingLevel(
                book_id=book.id,
                level_index=level_index,
                title="Section Summary & Review",
                description="Consolidate what you've learned so far",
                level_type="summary",
                xp_points=20,
                section_start=max(0, start - chunk_size),
                section_end=end,
            )
            db.add(summary_level)
            levels.append(summary_level)
            level_index += 1

    # Final quiz milestone
    quiz_level = ReadingLevel(
        book_id=book.id,
        level_index=level_index,
        title="Knowledge Assessment",
        description="Test your understanding of the entire book",
        level_type="quiz",
        xp_points=50,
        section_start=0,
        section_end=total - 1,
    )
    db.add(quiz_level)
    levels.append(quiz_level)

    db.commit()
    return levels

