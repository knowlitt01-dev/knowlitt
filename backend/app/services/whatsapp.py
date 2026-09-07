"""
WhatsApp notification channel via Meta's Cloud API. Requires your own
WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_TEMPLATE_NAME
in .env, plus an approved utility template from Meta Business Manager
(review can take a day or two — this is Meta's process, not something that
can be skipped). Without these set, send calls are skipped with a warning
log rather than crashing. See NOTIFICATIONS.md for setup.
"""
import logging

import requests

from app.core.config import settings

logger = logging.getLogger("booktutor.whatsapp")

GRAPH_API = "https://graph.facebook.com/v20.0"


def is_configured() -> bool:
    return bool(settings.WHATSAPP_PHONE_NUMBER_ID and settings.WHATSAPP_ACCESS_TOKEN)


def send_template(phone_number: str, params: list[str]) -> bool:
    if not is_configured():
        logger.warning("WhatsApp not configured — skipping send to %s", phone_number)
        return False
    try:
        resp = requests.post(
            f"{GRAPH_API}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages",
            headers={"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"},
            json={
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "template",
                "template": {
                    "name": settings.WHATSAPP_TEMPLATE_NAME,
                    "language": {"code": "en"},
                    "components": [{
                        "type": "body",
                        "parameters": [{"type": "text", "text": p} for p in params],
                    }],
                },
            },
            timeout=15,
        )
        resp.raise_for_status()
        return True
    except Exception as e:
        logger.warning("WhatsApp send failed for %s: %s", phone_number, e)
        return False
