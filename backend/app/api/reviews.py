from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_active_access
from app.db.base import get_db
from app.models.models import Flashcard, ReviewState, User
from app.services.sm2 import ReviewStateData, update_review_state

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewRequest(BaseModel):
    response: str  # again|hard|good|easy


@router.get("/due")
def get_due_cards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(ReviewState, Flashcard)
        .join(Flashcard, ReviewState.flashcard_id == Flashcard.id)
        .filter(ReviewState.user_id == current_user.id, ReviewState.next_review_date <= date.today())
        .all()
    )
    return [
        {"card_id": fc.id, "front": fc.front, "back": fc.back, "next_review_date": rs.next_review_date}
        for rs, fc in rows
    ]


@router.post("/{card_id}")
def submit_review(card_id: str, payload: ReviewRequest, db: Session = Depends(get_db), current_user: User = Depends(require_active_access)):
    state = (
        db.query(ReviewState)
        .filter(ReviewState.flashcard_id == card_id, ReviewState.user_id == current_user.id)
        .first()
    )
    if not state:
        raise HTTPException(404, "Review state not found for this card")

    try:
        current = ReviewStateData(
            ease_factor=state.ease_factor,
            interval=state.interval,
            repetitions=state.repetitions,
            next_review_date=state.next_review_date,
        )
        updated = update_review_state(current, payload.response)
    except ValueError as e:
        raise HTTPException(400, str(e))

    state.ease_factor = updated.ease_factor
    state.interval = updated.interval
    state.repetitions = updated.repetitions
    state.next_review_date = updated.next_review_date
    db.commit()

    return {
        "card_id": card_id,
        "ease_factor": state.ease_factor,
        "interval": state.interval,
        "next_review_date": state.next_review_date,
    }
