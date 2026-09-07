"""
Razorpay subscription billing.

Requires your own Razorpay account + API keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
RAZORPAY_WEBHOOK_SECRET, RAZORPAY_PLAN_ID_MONTHLY, RAZORPAY_PLAN_ID_YEARLY) in .env.
Without these set, /billing/* endpoints return a clear 501 "not configured" instead
of crashing — see BILLING.md for setup steps.
"""
import hashlib
import hmac
import logging

import requests

from app.core.config import settings

logger = logging.getLogger("booktutor.billing")

RAZORPAY_API = "https://api.razorpay.com/v1"


class BillingNotConfigured(Exception):
    pass


def _auth():
    if not (settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET):
        raise BillingNotConfigured(
            "Razorpay isn't configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET "
            "to backend/.env — see BILLING.md."
        )
    return (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)


def create_or_get_customer(user_email: str, existing_customer_id: str | None) -> str:
    if existing_customer_id:
        return existing_customer_id
    resp = requests.post(
        f"{RAZORPAY_API}/customers",
        auth=_auth(),
        json={"email": user_email},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["id"]


def create_subscription(customer_id: str, plan_id: str) -> dict:
    resp = requests.post(
        f"{RAZORPAY_API}/subscriptions",
        auth=_auth(),
        json={
            "plan_id": plan_id,
            "customer_notify": 1,
            "total_count": 120,  # effectively "until cancelled" for monthly/yearly
            "notes": {"customer_id": customer_id},
        },
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def verify_webhook_signature(body: bytes, signature: str) -> bool:
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        logger.error("RAZORPAY_WEBHOOK_SECRET not set — rejecting webhook")
        return False
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
