# Setting Up Razorpay Subscriptions

The 7-day free trial works automatically with zero configuration — every new signup starts
in `trialing` status and the backend blocks upload/review/daily-generation once 7 days pass
(existing data stays viewable). The subscription/paywall piece needs your own Razorpay
account to actually process payments; until then, the Upgrade page shows a clear
"not set up yet" message instead of a broken checkout.

## Setup (15-20 minutes)

1. Sign up at **razorpay.com** (test mode works with zero KYC to start building).
2. From the Razorpay Dashboard → Settings → API Keys, generate a **Key ID** and **Key
   Secret** (use Test Mode keys while developing).
3. Create two **Plans** under Subscriptions → Plans:
   - A monthly plan (e.g. ₹199/month)
   - A yearly plan (e.g. ₹1,899/year)
   
   Copy each plan's ID (looks like `plan_ABC123`).
4. In `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_PLAN_ID_MONTHLY=plan_...
   RAZORPAY_PLAN_ID_YEARLY=plan_...
   ```
5. Set up the webhook (critical — this is how the backend learns a payment succeeded):
   - Dashboard → Settings → Webhooks → Add New Webhook
   - URL: `<YOUR_BACKEND_URL>/billing/webhook`
   - Active events: `subscription.activated`, `subscription.charged`,
     `subscription.cancelled`, `subscription.halted`
   - Copy the **Webhook Secret** shown, add to `.env`:
     ```
     RAZORPAY_WEBHOOK_SECRET=...
     ```
6. Restart the backend. Test with Razorpay's test card numbers (available in their docs)
   before going live.
7. When ready for real payments, switch to Live Mode keys and repeat steps 2-5 with live
   credentials.

## What's already built

- 7-day trial enforced server-side (can't be bypassed by editing frontend state)
- `/billing/status` — trial days remaining, subscription state
- `/billing/create-subscription` — starts Razorpay Checkout
- `/billing/webhook` — **signature-verified** (rejects unsigned/forged requests with 400)
- Admin panel: manually extend a user's trial or flip subscription status (for support
  cases or webhook failures)

## Testing the paywall without waiting 7 real days

```python
# In a Python shell with the backend's venv active, from backend/:
from app.db.base import SessionLocal
from app.models.models import User
from datetime import datetime, timedelta, timezone

db = SessionLocal()
user = db.query(User).filter(User.email == "test@example.com").first()
user.trial_started_at = datetime.now(timezone.utc) - timedelta(days=10)
db.commit()
```
Then try uploading a book — you should get a 402 with a clear "trial expired" message.
