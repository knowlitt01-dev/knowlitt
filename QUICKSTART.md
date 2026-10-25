# Knowlit — 5-Minute Local Setup

**Everything you need is in this repo. No external accounts required for local testing.**

## 1. Start Backend

```bash
cd knowlitt/backend

# Set up (one-time)
cp .env.example .env
pip install -r requirements.txt

# Run
uvicorn app.main:app --reload
```

✓ Server on `http://localhost:8000`  
✓ Open `http://localhost:8000/docs` for API docs (Swagger)

## 2. Start Frontend (New Terminal)

```bash
cd knowlitt/frontend

# Set up (one-time)
npm install

# Run
npm run dev
```

✓ App on `http://localhost:3000`

## 3. Test It

1. **Landing page:** `localhost:3000` shows an onboarding carousel
2. **Sign up:** Click "Get started" → use any email + 8-char password
3. **Upload:** Go to `/books`, drag a PDF (or download a book PDF online)
4. **Wait:** 10–30s for AI processing, then check the dashboard
5. **Review:** Click "Review N Cards" and rate flashcards (Again / Mastered)
6. **Verify:** Next review dates update automatically (SM-2 working!)

## Optional: Better Insights

Get a free Groq API key:
1. Go to https://console.groq.com
2. Sign up (free, no card needed)
3. Copy your API key
4. In `backend/.env`, add: `GROQ_API_KEY=your_key_here`
5. Restart backend

Now insights are LLM-generated instead of simple heuristics. Same app, much better UX.

## Troubleshooting

**Backend won't start:**
```bash
# Make sure requirements installed
pip install -r requirements.txt
```

**Frontend shows blank page or 404 chunks:**
```bash
# Clear stale build cache and restart
cd frontend
Remove-Item -Recurse -Force .next   # PowerShell
# or: rm -rf .next                  # bash/macOS
npm run dev
```

**Still seeing old pages after UI update:**
The Next.js `.next/` build cache may be stale. Delete it and restart (`npm run dev`).

**"Could not extract text from PDF":**
This PDF is image-only (scanned). Only text-based PDFs are supported. Try a different file.

**Insight generation seems slow:**
Without Groq key, it's fast. With Groq key (first call), it takes 10–20s while LLM generates — subsequent books are cached.

## Next: Deploy to Production

Once you've tested locally, see `DEPLOY.md` for Railway/Vercel deployment (free tier, ~5 mins).

## Architecture at a Glance

```
┌─────────────────┐
│   Frontend      │  Landing → Login/Signup → Dashboard → Review → Roadmap
│  (Next.js PWA)  │
└────────┬────────┘
         │ HTTP (Bearer JWT)
         │
┌────────▼────────────────────┐
│      Backend (FastAPI)       │
│                              │
│ ┌─────────────────────────┐  │
│ │  Auth & File Upload     │  │
│ │  (PDF extraction)       │  │
│ └────────┬────────────────┘  │
│          │                   │
│ ┌────────▼────────────────┐  │
│ │ Insight Generation      │  │
│ │ (Groq API or heuristic) │  │
│ └────────┬────────────────┘  │
│          │                   │
│ ┌────────▼────────────────┐  │
│ │ SM-2 Scheduler          │  │
│ │ (spaced repetition)     │  │
│ └────────────────────────┘  │
│                              │
│ SQLite DB (local)            │
└──────────────────────────────┘
```

## File Structure

```
knowlitt/
├── backend/                  # FastAPI server
│   ├── app/
│   │   ├── main.py          # Entry point
│   │   ├── api/             # Routes (auth, books, reviews, daily, admin)
│   │   ├── services/        # Business logic (ingestion, LLM, SM-2)
│   │   ├── models/          # SQLAlchemy models
│   │   ├── core/            # Config, security (JWT, bcrypt)
│   │   └── db/              # Database setup
│   ├── requirements.txt      # Python deps
│   ├── Dockerfile           # For production
│   └── .env.example         # Environment template
│
├── frontend/                # Next.js 14 React app (PWA)
│   ├── app/                 # App Router pages
│   │   ├── page.tsx         # Home (landing or dashboard depending on auth)
│   │   ├── login/           # Sign in
│   │   ├── signup/          # Create account
│   │   ├── books/           # Book library & upload
│   │   ├── review/          # Flashcard review session
│   │   ├── roadmap/         # Learning roadmap
│   │   ├── discover/        # Book discovery
│   │   ├── connectors/      # Google Drive / Kindle
│   │   ├── upgrade/         # Plans & billing
│   │   ├── profile/         # User profile
│   │   ├── admin/           # Admin panel
│   │   └── welcome/         # Onboarding alias
│   ├── components/          # Shared UI components
│   │   ├── AppShell.tsx     # Sidebar layout for authenticated pages
│   │   ├── AuthProvider.tsx # Auth context (JWT, login, signup, logout)
│   │   ├── OnboardingLanding.tsx  # Landing page carousel
│   │   └── ...
│   ├── lib/                 # API client (lib/api.ts)
│   ├── public/              # PWA manifest, service worker, illustrations
│   ├── package.json
│   └── .env.local.example
│
├── app-mobile/              # Expo/React Native (iOS + Android + web)
├── README.md                # Overview (this file's parent)
├── DEPLOY.md                # Production deployment
├── SECURITY.md              # Security checklist
├── BILLING.md               # Razorpay setup
├── NOTIFICATIONS.md         # Telegram & WhatsApp setup
├── GOOGLE_DRIVE.md          # Google Drive integration
└── QUICKSTART.md            # This file
```

---

**That's it.** You now have a working AI-powered learning platform. The backend is production-grade (auth, error handling, rate-limiting-ready), and the frontend is a PWA (installable on phones).

Good luck! 🚀
