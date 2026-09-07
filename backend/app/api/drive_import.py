"""
Google Drive import. Requires a Google Cloud project with the Drive API
enabled and a valid OAuth access token from the frontend's Drive Picker flow
(the frontend obtains this via Google Identity Services — this endpoint
never stores Google credentials server-side beyond the single request).
See GOOGLE_DRIVE.md for the Cloud Console setup steps.
"""
import logging

import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import require_active_access
from app.core.config import settings
from app.db.base import get_db
from app.models.models import Book, Flashcard, Insight, ReviewState, User
from app.services.ingestion import IngestionError, chunk_text, extract_text_layer, run_ocr
from app.services.llm_pipeline import process_section

logger = logging.getLogger("booktutor.drive_import")
router = APIRouter(prefix="/books", tags=["books"])

DRIVE_API = "https://www.googleapis.com/drive/v3/files"


class DriveImportRequest(BaseModel):
    file_ids: list[str]
    access_token: str  # short-lived OAuth token from the frontend picker, not stored


@router.post("/import-drive")
def import_from_drive(
    payload: DriveImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_access),
):
    if not payload.file_ids:
        raise HTTPException(400, "No files selected")

    results = []
    for file_id in payload.file_ids:
        results.append(_import_single_drive_file(file_id, payload.access_token, db, current_user))
    return {"results": results}


def _import_single_drive_file(file_id: str, access_token: str, db: Session, current_user: User) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        meta_resp = requests.get(
            f"{DRIVE_API}/{file_id}", headers=headers,
            params={"fields": "name,mimeType"}, timeout=15,
        )
        meta_resp.raise_for_status()
        meta = meta_resp.json()
        name, mime_type = meta["name"], meta["mimeType"]

        if mime_type == "application/vnd.google-apps.document":
            # Google Docs-native file — export as plain text, skip PDF parsing entirely
            content_resp = requests.get(
                f"{DRIVE_API}/{file_id}/export", headers=headers,
                params={"mimeType": "text/plain"}, timeout=30,
            )
            content_resp.raise_for_status()
            text = content_resp.text
        elif mime_type == "application/pdf":
            content_resp = requests.get(f"{DRIVE_API}/{file_id}", headers=headers, params={"alt": "media"}, timeout=30)
            content_resp.raise_for_status()
            text, is_scanned = extract_text_layer(content_resp.content, name)
            if is_scanned:
                text = run_ocr(content_resp.content, name)
        else:
            return {"filename": name, "status": "failed", "error": f"Unsupported file type: {mime_type}"}

        return _run_pipeline(name, text, db, current_user)

    except IngestionError as e:
        return {"filename": file_id, "status": "failed", "error": str(e)}
    except requests.HTTPError as e:
        logger.warning("Drive API error for %s: %s", file_id, e)
        return {"filename": file_id, "status": "failed", "error": "Couldn't access this file in Drive — check sharing permissions."}
    except Exception:
        logger.exception("Unexpected error importing Drive file %s", file_id)
        return {"filename": file_id, "status": "failed", "error": "An unexpected error occurred."}


def _run_pipeline(title: str, text: str, db: Session, current_user: User) -> dict:
    book = Book(user_id=current_user.id, title=title.rsplit(".", 1)[0], filename=title, status="processing")
    db.add(book)
    db.commit()
    db.refresh(book)

    sections = chunk_text(text)
    if not sections:
        book.status = "failed"
        book.error_message = "No usable text found in this file."
        db.commit()
        return {"filename": title, "status": "failed", "book_id": book.id, "error": book.error_message}

    order_index = 0
    for section in sections:
        result = process_section(section)
        for insight in result["insights"]:
            db.add(Insight(book_id=book.id, text=insight["text"], type=insight.get("type", "concept"), order_index=order_index))
            order_index += 1
        for card in result["flashcards"]:
            flashcard = Flashcard(book_id=book.id, front=card["front"], back=card["back"])
            db.add(flashcard)
            db.flush()
            db.add(ReviewState(flashcard_id=flashcard.id, user_id=current_user.id))

    book.status = "ready"
    db.commit()
    return {"filename": title, "status": "ready", "book_id": book.id}
