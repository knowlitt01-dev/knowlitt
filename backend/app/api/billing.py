import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.base import get_db
from app.models.models import User
from app.services import billing
from app.services.access_control import trial_days_remaining

logger = logging.getLogger("booktutor.billing_api")
router = APIRouter(prefix="/billing", tags=["billing"])


class CreateSubscriptionRequest(BaseModel):
    plan: str  # "monthly" | "yearly"


@router.get("/status")
def billing_status(current_user: User = Depends(get_current_user)):
    return {
        "subscription_status": current_user.subscription_status,
        "subscription_plan": current_user.subscription_plan,
        "trial_days_remaining": trial_days_remaining(current_user),
        "razorpay_configured": bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET),
    }


@router.post("/create-subscription")
def create_subscription(
    payload: CreateSubscriptionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.plan not in ("monthly", "yearly"):
        raise HTTPException(400, "Invalid plan — must be 'monthly' or 'yearly'")

    plan_id = {
        "monthly": settings.RAZORPAY_PLAN_ID_MONTHLY,
        "yearly": settings.RAZORPAY_PLAN_ID_YEARLY,
    }[payload.plan]

    if not plan_id:
        raise HTTPException(
            501,
            "Razorpay isn't configured yet. Add RAZORPAY_PLAN_ID_MONTHLY / "
            "RAZORPAY_PLAN_ID_YEARLY to backend/.env — see BILLING.md.",
        )

    try:
        customer_id = billing.create_or_get_customer(current_user.email, current_user.razorpay_customer_id)
        current_user.razorpay_customer_id = customer_id
        subscription = billing.create_subscription(customer_id, plan_id)
        current_user.razorpay_subscription_id = subscription["id"]
        db.commit()
        return {
            "subscription_id": subscription["id"],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            "short_url": subscription.get("short_url"),
        }
    except billing.BillingNotConfigured as e:
        raise HTTPException(501, str(e))
    except Exception as e:
        logger.exception("Failed to create subscription")
        raise HTTPException(500, "Couldn't start checkout — please try again.")


@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not billing.verify_webhook_signature(body, signature):
        logger.warning("Rejected webhook with invalid signature")
        raise HTTPException(400, "Invalid webhook signature")

    payload = await request.json()
    event = payload.get("event", "")
    sub_entity = payload.get("payload", {}).get("subscription", {}).get("entity", {})
    razorpay_sub_id = sub_entity.get("id")

    if not razorpay_sub_id:
        return {"status": "ignored"}

    user = db.query(User).filter(User.razorpay_subscription_id == razorpay_sub_id).first()
    if not user:
        logger.warning("Webhook for unknown subscription %s", razorpay_sub_id)
        return {"status": "ignored"}

    if event in ("subscription.activated", "subscription.charged"):
        user.subscription_status = "active"
        # Simple 32-day rolling window; a real deployment should read the
        # actual next billing date from sub_entity["current_end"].
        user.subscription_expires_at = datetime.now(timezone.utc) + timedelta(days=32)
    elif event in ("subscription.cancelled",):
        user.subscription_status = "cancelled"
    elif event in ("subscription.halted",):
        user.subscription_status = "expired"

    db.commit()
    return {"status": "processed"}
