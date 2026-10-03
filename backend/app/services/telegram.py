"""
Telegram notification channel. Requires your own TELEGRAM_BOT_TOKEN in .env
(get one free from @BotFather on Telegram — takes 30 seconds, no approval
process). Without it, send calls are skipped with a warning log rather than
crashing. See NOTIFICATIONS.md for setup.
"""
import logging

import requests

from app.core.config import settings

logger = logging.getLogger("booktutor.telegram")

TELEGRAM_API = "https://api.telegram.org/bot{token}/{method}"


def is_configured() -> bool:
    return bool(settings.TELEGRAM_BOT_TOKEN)


def send_message(chat_id: str, text: str) -> bool:
    if not is_configured():
        logger.warning("TELEGRAM_BOT_TOKEN not set — skipping Telegram send")
        return False
    try:
        resp = requests.post(
            TELEGRAM_API.format(token=settings.TELEGRAM_BOT_TOKEN, method="sendMessage"),
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=15,
        )
        resp.raise_for_status()
        return True
    except Exception as e:
        logger.warning("Telegram send failed for chat_id=%s: %s", chat_id, e)
        return False


def format_daily_message(
    insight_count: int,
    due_count: int,
    content_mode: str = "extraction",
    book_title: str | None = None,
    section_title: str | None = None,
    recap_teaser: str | None = None,
) -> str:
    if content_mode == "companion":
        section_str = f"Today: read {section_title}" if section_title else "Today's reading assignment is ready"
        book_str = f" for *{book_title}*" if book_title else ""
        recap_str = f"\n*Last time:* {recap_teaser}" if recap_teaser else ""
        return (
            f"📖 *{section_str}*{book_str}\n"
            f"{recap_str}\n\n"
            f"• {due_count} reflection question{'s' if due_count != 1 else ''} ready\n\n"
            f"_Never lose your place — you do the reading, we handle the pacing._"
        )
    else:
        return (
            f"🧠 *Today's key points are ready* 📚\n\n"
            f"• {insight_count} new insight{'s' if insight_count != 1 else ''}\n"
            f"• {due_count} card{'s' if due_count != 1 else ''} due for review\n\n"
            f"Absorb every idea in this book, a little each day."
        )

