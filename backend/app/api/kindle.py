import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.models import KindleHighlight, User
from app.services.kindle_import import parse_clippings

logger = logging.getLogger("booktutor.kindle")
router = APIRouter(prefix="/kindle", tags=["kindle"])

MAX_CLIPPINGS_MB = 10  # My Clippings.txt files are plain text, always small


@router.get("/status")
def kindle_status(current_user: User = Depends(get_current_user)):
    return {
        "connected": current_user.kindle_last_imported_at is not None,
        "last_imported_at": current_user.kindle_last_imported_at,
        "sync_available": False,
        "note": (
            "Amazon doesn't provide a public API for third-party apps to sync a Kindle "
            "library automatically. You can still bring your highlights in by uploading "
            "your My Clippings.txt export from your device — see how below."
        ),
    }


@router.post("/import-clippings")
def import_clippings(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".txt"):
        raise HTTPException(400, "Please upload your My Clippings.txt file.")

    raw_bytes = file.file.read()
    if len(raw_bytes) > MAX_CLIPPINGS_MB * 1024 * 1024:
        raise HTTPException(400, f"File exceeds the {MAX_CLIPPINGS_MB}MB limit for a clippings file.")

    try:
        raw_text = raw_bytes.decode("utf-8-sig")  # Kindle exports with a BOM
    except UnicodeDecodeError:
        raise HTTPException(400, "Couldn't read this file — it doesn't look like a valid My Clippings.txt export.")

    parsed = parse_clippings(raw_text)
    if not parsed:
        raise HTTPException(400, "No highlights found in this file. Make sure it's an unmodified My Clippings.txt export.")

    for entry in parsed:
        db.add(KindleHighlight(
            user_id=current_user.id,
            book_title=entry["book_title"],
            book_author=entry["book_author"],
            highlight_text=entry["highlight_text"],
            location=entry["location"],
            highlighted_at=entry["highlighted_at"],
        ))

    current_user.kindle_last_imported_at = datetime.now(timezone.utc)
    db.commit()

    return {"status": "imported", "highlight_count": len(parsed)}


@router.get("/highlights")
def list_highlights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    highlights = (
        db.query(KindleHighlight)
        .filter(KindleHighlight.user_id == current_user.id)
        .order_by(KindleHighlight.book_title, KindleHighlight.highlighted_at)
        .all()
    )
    return [
        {
            "id": h.id, "book_title": h.book_title, "book_author": h.book_author,
            "highlight_text": h.highlight_text, "location": h.location,
            "highlighted_at": h.highlighted_at,
        }
        for h in highlights
    ]


@router.delete("/disconnect")
def disconnect_kindle(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Clears imported highlights and resets connection state — scoped to
    the authenticated user only."""
    db.query(KindleHighlight).filter(KindleHighlight.user_id == current_user.id).delete()
    current_user.kindle_last_imported_at = None
    db.commit()
    return {"status": "disconnected"}
