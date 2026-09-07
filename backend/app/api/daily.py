import logging
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_active_access
from app.db.base import get_db
from app.models.models import Book, DailyPackage, Insight, User
from app.services import telegram, whatsapp

router = APIRouter(prefix="/daily", tags=["daily"])

INSIGHTS_PER_DAY = 6


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

    # Generate: pull undelivered insights across this user's books, oldest book first.
    undelivered = (
        db.query(Insight)
        .join(Book, Insight.book_id == Book.id)
        .filter(Book.user_id == current_user.id, Book.status == "ready", Insight.delivered.is_(False))
        .order_by(Book.created_at.asc(), Insight.order_index.asc())
        .limit(INSIGHTS_PER_DAY)
        .all()
    )

    for insight in undelivered:
        insight.delivered = True

    package = DailyPackage(
        user_id=current_user.id,
        date=date.today(),
        insight_ids=",".join(i.id for i in undelivered),
    )
    db.add(package)
    db.commit()

    _send_channel_notifications(current_user, len(undelivered))

    return _format_package(undelivered)


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
        logging.getLogger("booktutor.daily").exception("Notification send failed (non-fatal)")


def _format_package(insights: list[Insight]) -> dict:
    return {
        "date": str(date.today()),
        "insights": [
            {"id": i.id, "text": i.text, "type": i.type, "book_id": i.book_id}
            for i in insights
        ],
        "count": len(insights),
    }
