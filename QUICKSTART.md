# BookTutor — 5-Minute Local Setup

**Everything you need is in this zip. No external accounts required for local testing.**

## 1. Extract & Start Backend

```bash
unzip booktutor-app.zip
cd booktutor/backend

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
cd booktutor/frontend

# Set up (one-time)
npm install

# Run
npm run dev
```

✓ App on `http://localhost:3000`

## 3. Test It

1. **Sign up:** Use any email + 8-char password
2. **Upload:** Drag a PDF (or download a book PDF online)
3. **Wait:** 10-30s, then check dashboard
4. **Review:** Click "Review N Cards" and rate flashcards (Again/Hard/Good/Easy)
5. **Verify:** Next review dates update automatically (SM-2 working!)

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

**Frontend blank:**
- Check browser console (F12 → Console tab)
- Make sure backend is running on 8000

**Insight generation seems slow:**
Without Groq key, it's fast. With Groq key (first call), it takes 10-20s while LLM generates — subsequent books are cached.

**"Could not extract text from PDF":**
This PDF is image-only (scanned). The MVP only handles text-based PDFs. Try another PDF or find a digital/text-based version.

## Next: Deploy to Production

Once you've tested locally, see `DEPLOY.md` for Railway/Vercel deployment (free tier, ~5 mins).

## Architecture at a Glance

```
┌─────────────────┐
│   Frontend      │  Login → Dashboard (daily insights) → Review flashcards
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
booktutor/
├── backend/                  # FastAPI server
│   ├── app/
│   │   ├── main.py          # Entry point
│   │   ├── api/             # Routes (auth, books, reviews, daily)
│   │   ├── services/        # Business logic (ingestion, LLM, SM-2)
│   │   ├── models/          # SQLAlchemy models
│   │   ├── core/            # Config, security (JWT, bcrypt)
│   │   └── db/              # Database setup
│   ├── requirements.txt      # Python deps
│   ├── Dockerfile           # For production
│   └── .env.example         # Environment template
│
├── frontend/                # Next.js React app
│   ├── app/                 # Pages (login, signup, dashboard, review)
│   ├── components/          # UI (BookUpload, DailyDigest, Flashcard)
│   ├── lib/                 # API client, types
│   ├── public/              # PWA manifest, service worker
│   ├── package.json
│   └── .env.local.example
│
├── README.md                # Overview
├── DEPLOY.md                # Production deployment
├── SECURITY.md              # Security checklist
└── QUICKSTART.md            # This file
```

---

**That's it.** You now have a working MVP of an AI-powered learning platform. The backend is production-grade (auth, error handling, rate-limiting-ready), and the frontend is a PWA (installable on phones).

Extend it using the separate prompt files, or just use it as-is to test the core loop.

Good luck! 🚀
