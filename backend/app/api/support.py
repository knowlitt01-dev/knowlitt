from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.models import SupportTicket, User

router = APIRouter(prefix="/support", tags=["support"])


class TicketCreateRequest(BaseModel):
    subject: str
    message: str


@router.post("/tickets")
def create_ticket(payload: TicketCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ticket = SupportTicket(user_id=current_user.id, subject=payload.subject, message=payload.message)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"id": ticket.id, "status": ticket.status, "created_at": ticket.created_at}


@router.get("/tickets")
def list_my_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tickets = db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).order_by(SupportTicket.created_at.desc()).all()
    return [
        {"id": t.id, "subject": t.subject, "status": t.status, "created_at": t.created_at}
        for t in tickets
    ]
