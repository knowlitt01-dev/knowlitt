# Setting Up Telegram & WhatsApp Notifications

Both channels are fully built and wired into the app — daily digest generation already
calls them. Until you add credentials below, they show a clear "not configured" message
in Settings instead of failing silently. Nothing else in the app is affected either way.

---

## Telegram (5 minutes, free, no approval needed)

1. Open Telegram, search for **@BotFather**, start a chat.
2. Send `/newbot`, follow the prompts (choose a name and a username ending in `bot`).
3. BotFather gives you a token like `123456789:AAH...`. Copy it.
4. In `backend/.env`:
   ```
   TELEGRAM_BOT_TOKEN=123456789:AAH...
   TELEGRAM_BOT_USERNAME=your_bot_username_here
   ```
5. Register the webhook (run once, replace both placeholders):
   ```bash
   curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<YOUR_BACKEND_URL>/telegram/webhook"
   ```
   `<YOUR_BACKEND_URL>` must be a public HTTPS URL — this won't work against `localhost`.
   Once deployed to Railway/Render, use that URL.
6. Restart the backend. In the app, go to Settings → Telegram → Connect, and it'll open
   Telegram with a working deep link.

---

## WhatsApp (requires Meta Business verification — budget 1-2 days)

WhatsApp only lets you message users who've messaged you first, *unless* you use an
approved **template message** — which is what this integration uses for daily digests.

1. Create a Meta Business Account + WhatsApp Business Account at business.facebook.com.
2. In Meta's **WhatsApp Manager**, get a test phone number (free, works immediately for
   a few pre-approved test recipients) or register your own business number.
3. Create and submit a **utility template** for approval. Example:
   > Hi {{1}}, your daily BookTutor lesson is ready: {{2}} new insights and {{3}} cards due.
   
   Approval usually takes minutes to a couple of days.
4. From the Meta developer app dashboard, get:
   - Phone Number ID
   - A permanent access token
5. In `backend/.env`:
   ```
   WHATSAPP_PHONE_NUMBER_ID=<your phone number id>
   WHATSAPP_ACCESS_TOKEN=<your access token>
   WHATSAPP_TEMPLATE_NAME=daily_lesson_ready
   ```
6. Restart the backend. In Settings, users can now connect a WhatsApp number.

**Cost note:** utility template messages aren't free — roughly ₹0.12/message in India as
of mid-2026. Check Meta's current rate card before launch; it's changed before.

**Test-number limitation:** until you complete business verification, only a handful of
phone numbers you've pre-registered in Meta's dashboard can actually receive messages.
