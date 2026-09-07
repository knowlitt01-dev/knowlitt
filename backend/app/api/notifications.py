import logging
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.base import get_db
from app.models.models import User
from app.services import telegram, whatsapp

logger = logging.getLogger("booktutor.notifications_api")
router = APIRouter(tags=["notifications"])

# In-memory link-code -> user_id map for the Telegram /start deep-link flow.
# Fine for a single-instance MVP; move to the DB/Redis if you scale to
# multiple backend instances.
_pending_telegram_links: dict[str, str] = {}


class WhatsAppUpdateRequest(BaseModel):
    phone_number: str | None = None
    enabled: bool


@router.get("/users/me/telegram/link-code")
def get_telegram_link_code(current_user: User = Depends(get_current_user)):
    code = secrets.token_urlsafe(12)
    _pending_telegram_links[code] = current_user.id
    bot_username = settings.TELEGRAM_BOT_USERNAME or "your_bot_here"
    return {
        "deep_link": f"https://t.me/{bot_username}?start={code}",
        "configured": telegram.is_configured(),
    }


@router.get("/users/me/telegram/status")
def telegram_status(current_user: User = Depends(get_current_user)):
    return {"enabled": current_user.telegram_enabled}


@router.post("/telegram/webhook")
async def telegram_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    message = payload.get("message", {})
    text = message.get("text", "")
    chat_id = message.get("chat", {}).get("id")

    if text.startswith("/start") and chat_id:
        parts = text.split(maxsplit=1)
        code = parts[1] if len(parts) > 1 else None
        user_id = _pending_telegram_links.pop(code, None) if code else None
        if user_id:
            user = db.get(User, user_id)
            if user:
                user.telegram_chat_id = str(chat_id)
                user.telegram_enabled = True
                db.commit()
                telegram.send_message(str(chat_id), "✅ Telegram connected to BookTutor!")
        else:
            telegram.send_message(
                str(chat_id),
                "This link code has expired. Go back to the app and tap 'Connect Telegram' again.",
            )
    return {"status": "ok"}


@router.patch("/users/me/whatsapp")
def update_whatsapp(
    payload: WhatsAppUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.enabled and payload.phone_number:
        if not payload.phone_number.startswith("+"):
            raise HTTPException(400, "Phone number must be in E.164 format, e.g. +91XXXXXXXXXX")
        current_user.whatsapp_number = payload.phone_number
    current_user.whatsapp_enabled = payload.enabled
    db.commit()
    return {"whatsapp_enabled": current_user.whatsapp_enabled, "configured": whatsapp.is_configured()}
