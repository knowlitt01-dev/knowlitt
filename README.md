# BookTutor

A progressive learning platform that delivers daily insights and spaced-repetition flashcards from books you upload — with multi-channel delivery, a 7-day trial + subscription model, a full admin panel, web app, and a native mobile app.

## Project Structure

```
booktutor/
├── backend/      # FastAPI — shared by both web and mobile
├── frontend/     # Next.js web app
└── app-mobile/   # Expo/React Native app (iOS + Android + web)
```

One backend serves both frontends identically — same auth, same trial gating, same
SM-2 logic. See `app-mobile/README.md` for mobile-specific setup.

## Features

**Core loop**
- Multi-file PDF upload (local or Google Drive) with real-time processing
- AI-powered insights (Groq's free tier, with an offline fallback so it always runs)
- Spaced repetition via SM-2 (same algorithm as Anki)
- Daily digest of unread insights, delivered fresh each day
- Flashcard review sessions with 4-button SM-2 ratings
- Shareable insight cards for Instagram/WhatsApp/Twitter
- PWA — installable on phones, works offline via service worker

**Growth & retention**
- Telegram notifications (free, no approval process)
- WhatsApp notifications (Meta Cloud API, requires business verification)
- Google Drive import (multi-file, with Google Docs export support)

**Business**
- 7-day free trial → Razorpay subscription, enforced server-side
- Admin panel: support tickets, user management, analytics dashboard

**Security**
- JWT auth with bcrypt, server-side user isolation on every endpoint (no IDOR)
- Rate limiting on auth + upload endpoints
- Signature-verified webhooks (Razorpay)
- Locked-down CORS, no secrets in code, non-root Docker user

## Tech Stack

**Backend:** FastAPI, SQLAlchemy, SQLite/PostgreSQL, Groq API, Razorpay, Meta Cloud API, Telegram Bot API
**Frontend:** Next.js, React, Tailwind CSS, TypeScript

## Quick Start

See `QUICKSTART.md` for a 5-minute local setup — the core app (auth, upload, daily digest,
review) runs with **zero external accounts**.

## Optional Features Setup

Each of these is fully built and wired in — they just need your own credentials to become
functional. Without them, the relevant UI shows a clear "not configured" message instead
of breaking.

| Feature | Guide | Time to set up |
|---|---|---|
| Better insight quality | `.env.example` → `GROQ_API_KEY` | 2 min (free) |
| Telegram notifications | `NOTIFICATIONS.md` | 5 min (free) |
| WhatsApp notifications | `NOTIFICATIONS.md` | 1-2 days (Meta approval) |
| Google Drive import | `GOOGLE_DRIVE.md` | 10 min (free) |
| Subscriptions/paywall | `BILLING.md` | 15-20 min |

## Admin Panel

Once you have an account, promote yourself to admin directly in the database:

```python
from app.db.base import SessionLocal
from app.models.models import User
db = SessionLocal()
user = db.query(User).filter(User.email == "you@example.com").first()
user.is_admin = True
db.commit()
```

Then visit `/admin/analytics`, `/admin/support`, or `/admin/users` in the app.

## Deployment

See `DEPLOY.md` for Railway (backend) + Vercel (frontend) deployment — free tier, ~10 min.

## Security

See `SECURITY.md` for the pre-production checklist. The core security properties
(user isolation, no IDOR, webhook verification, rate limiting) are already built and
tested — this doc covers what to add before real payment traffic.

## What's Genuinely Not Included

- **EPUB support, OCR for scanned PDFs** — the ingestion pipeline is structured to add
  these, but they're not built. PDF-only for now.
- **Cross-book deduplication, content progression (surface → advanced)** — the schema
  supports adding these; not implemented.
- **Kindle/Goodreads import, referral system** — discussed as growth ideas, not built.

## License

Provided as-is for learning and personal use.
