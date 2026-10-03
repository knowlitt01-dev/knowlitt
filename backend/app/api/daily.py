import logging
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_active_access
from app.db.base import get_db
from app.models.models import Book, DailyPackage, Insight, User
from app.services import telegram, whatsapp

router = APIRouter(prefix="/daily", tags=["daily"])

logger = logging.getLogger("booktutor.daily")

# How many insight *rows* to pull per day.
# For extraction: each row is one standalone insight (concept / example / …).
# For companion:  rows are grouped by section_index and delivered together —
#   one full reading-session worth of content (recap + reminders + hook +
#   reflections) counts as COMPANION_INSIGHTS_PER_DAY "slots".
EXTRACTION_INSIGHTS_PER_DAY = 6
COMPANION_SECTIONS_PER_DAY = 1   # one reading segment's worth of content per day


@router.get("/today")
def get_today(db: Session = Depends(get_db), current_user: User = Depends(require_active_access)):
    existing = (
        db.query(DailyPackage)
        .filter(DailyPackage.user_id == current_user.id, DailyPackage.date == date.today())
        .first()
    )
    if existing:
        ids = existing.insight_ids.split(",") if existing.insight_ids else []
        insights = db.query(Insight).filter(Insight.id.in_(ids)).all() if ids else []
        return _format_package(insights)

    # ── Build today's package ─────────────────────────────────────────────
    # Pull from all ready books belonging to the user, oldest first.
    # Within each book, respect content_mode:
    #   extraction → grab up to EXTRACTION_INSIGHTS_PER_DAY undelivered rows
    #   companion  → grab all undelivered rows for the NEXT undelivered section_index

    all_insights: list[Insight] = []

    ready_books = (
        db.query(Book)
        .filter(Book.user_id == current_user.id, Book.status == "ready")
        .order_by(Book.created_at.asc())
        .all()
    )

    remaining_slots = EXTRACTION_INSIGHTS_PER_DAY   # shared budget across all books

    for book in ready_books:
        if remaining_slots <= 0:
            break

        if book.content_mode == "companion":
            # Find the lowest undelivered section_index for this book
            next_section = (
                db.query(Insight.section_index)
                .filter(
                    Insight.book_id == book.id,
                    Insight.pipeline == "companion",
                    Insight.delivered.is_(False),
                )
                .order_by(Insight.section_index.asc())
                .first()
            )
            if next_section is None:
                continue   # book fully consumed

            section_idx = next_section[0]
            # Pull all rows for that section, ordered by order_index
            section_rows = (
                db.query(Insight)
                .filter(
                    Insight.book_id == book.id,
                    Insight.pipeline == "companion",
                    Insight.section_index == section_idx,
                    Insight.delivered.is_(False),
                )
                .order_by(Insight.order_index.asc())
                .all()
            )
            all_insights.extend(section_rows)
            # Companion content counts as 1 slot regardless of how many rows
            remaining_slots -= 1

        else:
            # Extraction: pull up to remaining_slots undelivered rows
            extraction_rows = (
                db.query(Insight)
                .filter(
                    Insight.book_id == book.id,
                    Insight.pipeline == "extraction",
                    Insight.delivered.is_(False),
                )
                .order_by(Insight.order_index.asc())
                .limit(remaining_slots)
                .all()
            )
            all_insights.extend(extraction_rows)
            remaining_slots -= len(extraction_rows)

    # Mark delivered
    for insight in all_insights:
        insight.delivered = True

    package = DailyPackage(
        user_id=current_user.id,
        date=date.today(),
        insight_ids=",".join(i.id for i in all_insights),
    )
    db.add(package)
    db.commit()

    _send_channel_notifications(current_user, len(all_insights))

    return _format_package(all_insights)


def _send_channel_notifications(user: User, insight_count: int) -> None:
    """Best-effort — a failed notification should never break digest
    generation itself. Each channel is independently toggleable."""
    if insight_count == 0:
        return
    try:
        due_count = 0  # avoid an extra query here; approximate is fine for the notification text
        if user.telegram_enabled and user.telegram_chat_id:
            telegram.send_message(user.telegram_chat_id, telegram.format_daily_message(insight_count, due_count))
        if user.whatsapp_enabled and user.whatsapp_number:
            whatsapp.send_template(user.whatsapp_number, [str(insight_count), str(due_count)])
    except Exception:
        logger.exception("Notification send failed (non-fatal)")


def _format_package(insights: list[Insight]) -> dict:
    """
    Serialize insights for the API response.

    Extraction insights are flat items (same as before).
    Companion insights for the same section_index are grouped into a
    reading_session block so the frontend can render them as a unified card.

    Response shape:
    {
      "date": "...",
      "count": N,
      "insights": [
        // extraction rows — unchanged shape:
        {"id": "...", "text": "...", "type": "concept", "pipeline": "extraction", "book_id": "..."},
        // companion rows — same row shape but type is recap|character_reminder|hook|reflection
        {"id": "...", "text": "...", "type": "recap", "pipeline": "companion",
         "section_index": 0, "book_id": "..."},
        ...
      ],
      "reading_sessions": [
        // one entry per companion section_index delivered today, for structured UX:
        {
          "book_id": "...",
          "section_index": 0,
          "recap": "...",
          "character_reminders": ["..."],
          "hook": "...",
          "reflections": ["..."]
        }
      ]
    }

    `reading_sessions` is [] when no companion books were included today.
    The flat `insights` list is always present for backward compatibility.
    """
    flat = [
        {
            "id": i.id,
            "text": i.text,
            "type": i.type,
            "pipeline": i.pipeline,
            "section_index": i.section_index,
            "book_id": i.book_id,
        }
        for i in insights
    ]

    # Build structured reading_sessions for companion insights
    # Group by (book_id, section_index)
    sessions: dict[tuple[str, int], dict] = {}
    for i in insights:
        if i.pipeline != "companion":
            continue
        key = (i.book_id, i.section_index)
        if key not in sessions:
            sessions[key] = {
                "book_id": i.book_id,
                "section_index": i.section_index,
                "recap": "",
                "character_reminders": [],
                "hook": "",
                "reflections": [],
            }
        s = sessions[key]
        if i.type == "recap":
            s["recap"] = i.text
        elif i.type == "character_reminder":
            s["character_reminders"].append(i.text)
        elif i.type == "hook":
            s["hook"] = i.text
        elif i.type == "reflection":
            s["reflections"].append(i.text)

    return {
        "date": str(date.today()),
        "insights": flat,
        "count": len(flat),
        "reading_sessions": list(sessions.values()),
    }
