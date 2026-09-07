from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.base import get_db
from app.models.models import Book, SupportTicket, User

router = APIRouter(prefix="/admin", tags=["admin"])


# ---------- Support tickets ----------

class TicketUpdateRequest(BaseModel):
    status: str | None = None
    admin_notes: str | None = None


@router.get("/support/tickets")
def list_all_tickets(status: str | None = None, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    q = db.query(SupportTicket, User).join(User, SupportTicket.user_id == User.id)
    if status:
        q = q.filter(SupportTicket.status == status)
    rows = q.order_by(SupportTicket.created_at.desc()).all()
    return [
        {
            "id": t.id, "subject": t.subject, "message": t.message, "status": t.status,
            "admin_notes": t.admin_notes, "created_at": t.created_at,
            "user_email": u.email, "user_id": u.id,
        }
        for t, u in rows
    ]


@router.patch("/support/tickets/{ticket_id}")
def update_ticket(ticket_id: str, payload: TicketUpdateRequest, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    ticket = db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    if payload.status:
        ticket.status = payload.status
    if payload.admin_notes is not None:
        ticket.admin_notes = payload.admin_notes
    db.commit()
    return {"id": ticket.id, "status": ticket.status}


# ---------- User management ----------

@router.get("/users")
def list_users(search: str | None = None, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    q = db.query(User)
    if search:
        q = q.filter(User.email.ilike(f"%{search}%"))
    users = q.order_by(User.created_at.desc()).limit(200).all()
    return [
        {
            "id": u.id, "email": u.email, "created_at": u.created_at,
            "subscription_status": u.subscription_status,
            "book_count": db.query(func.count(Book.id)).filter(Book.user_id == u.id).scalar(),
        }
        for u in users
    ]


@router.post("/users/{user_id}/extend-trial")
def extend_trial(user_id: str, days: int = 7, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.trial_started_at = user.trial_started_at + timedelta(days=days)
    if user.subscription_status == "expired":
        user.subscription_status = "trialing"
    db.commit()
    return {"user_id": user.id, "trial_started_at": user.trial_started_at}


@router.post("/users/{user_id}/set-subscription-status")
def set_subscription_status(user_id: str, status: str, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    if status not in ("trialing", "active", "expired", "cancelled"):
        raise HTTPException(400, "Invalid status")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.subscription_status = status
    db.commit()
    return {"user_id": user.id, "subscription_status": user.subscription_status}


# ---------- Analytics ----------

@router.get("/analytics/overview")
def analytics_overview(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    active_subs = db.query(func.count(User.id)).filter(User.subscription_status == "active").scalar()
    trialing = db.query(func.count(User.id)).filter(User.subscription_status == "trialing").scalar()
    cancelled = db.query(func.count(User.id)).filter(User.subscription_status.in_(["expired", "cancelled"])).scalar()
    total_books = db.query(func.count(Book.id)).scalar()
    failed_books = db.query(func.count(Book.id)).filter(Book.status == "failed").scalar()
    open_tickets = db.query(func.count(SupportTicket.id)).filter(SupportTicket.status == "open").scalar()

    return {
        "total_users": total_users,
        "active_subscriptions": active_subs,
        "trialing_users": trialing,
        "churned_users": cancelled,
        "trial_to_paid_rate": round(active_subs / total_users, 3) if total_users else 0,
        "total_books_uploaded": total_books,
        "book_processing_failure_rate": round(failed_books / total_books, 3) if total_books else 0,
        "open_support_tickets": open_tickets,
    }


@router.get("/analytics/signups-over-time")
def signups_over_time(days: int = 30, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(func.date(User.created_at).label("day"), func.count(User.id).label("count"))
        .filter(User.created_at >= since)
        .group_by("day")
        .order_by("day")
        .all()
    )
    return [{"date": str(r.day), "signups": r.count} for r in rows]
