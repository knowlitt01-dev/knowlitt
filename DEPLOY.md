# BookTutor Deployment Guide

This guide covers running the app locally for testing and deploying to production.

## Local Development (5 minutes)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git (if cloning)

### Backend

```bash
cd backend

# Set up environment
cp .env.example .env
# Edit .env if needed (defaults work locally)

# Install Python dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload

# Server runs on http://localhost:8000
# Try http://localhost:8000/health to verify
```

**Optional:** To improve insight quality, add a free Groq API key:
1. Sign up at https://console.groq.com (free tier available)
2. Add to `.env`: `GROQ_API_KEY=your_key_here`
3. Restart the server

Without Groq, the app still works using an offline fallback (lower quality but fully functional).

### Frontend

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000 in your browser
```

### Test the Full Loop

1. Click "Sign up" and create an account
2. Upload a PDF (included test files in `/test-pdfs` if available, or any book PDF)
3. Wait 10-30 seconds for processing
4. Check "Today's Lesson" on the dashboard
5. Click "Review N Cards" and rate flashcards
6. Confirm next-review-dates update (SM-2 scheduler working)

---

## Production Deployment

### Option 1: Railway (Recommended for Beginners)

Railway is the simplest — free tier includes 500 MB storage, auto-deploys from GitHub.

#### Backend

1. Push your code to GitHub
2. Go to **railway.app**, sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `booktutor` repo
5. Railway auto-detects the Python backend, builds it
6. Set environment variables in Railway's dashboard:
   ```
   DATABASE_URL=sqlite:///booktutor.db
   JWT_SECRET=<any-long-random-string>
   GROQ_API_KEY=<optional, for better insights>
   FRONTEND_ORIGIN=https://<your-frontend-domain>.vercel.app
   ```
7. Deploy — get your backend URL (e.g., `https://booktutor-api-abc123.railway.app`)

#### Frontend

1. Go to **vercel.com**, sign in with GitHub
2. Click **New Project** → **Import Git Repository**
3. Select your `booktutor` repo, choose `frontend/` as root directory
4. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://<your-backend-railway-url>
   ```
5. Deploy — get your frontend URL (e.g., `https://booktutor-abc123.vercel.app`)

**Update backend's `FRONTEND_ORIGIN`** to this Vercel URL (Railway dashboard → Variables).

### Option 2: Docker + Any VPS (AWS, DigitalOcean, Linode)

If you prefer full control:

```bash
# Build and run locally with docker-compose first
docker-compose up

# Then deploy the docker-compose.yml to your VPS with the right env vars set
```

---

## Accessing the Live App

Once deployed:
1. Visit your frontend URL
2. Sign up with an email and password
3. Upload a PDF to test
4. Check settings for toggle options (Telegram, WhatsApp, etc. via extension prompts)

---

## Troubleshooting

**Backend won't start:** Check that `requirements.txt` has been installed and `GROQ_API_KEY` (if set) is valid.

**Frontend blank on load:** Check browser console for errors. Usually means `NEXT_PUBLIC_API_URL` is wrong or backend isn't running.

**Uploads fail silently:** Check backend logs for PDF parsing errors. Scanned/image-only PDFs aren't supported (see README for OCR extension prompt).

**"Already an account with this email":** Use a different email or reset the database (`rm backend/booktutor.db`, restart server).

---

## Next Steps

- See `README.md` for feature list and architecture
- See `booktutor-daily-prompts.md` for day-by-day build instructions (reference only, this zip is already built)
- See `booktutor-growth-subscription-prompts.md` for extending with Telegram, WhatsApp, Razorpay subscriptions, etc.

---

## Support

This is an MVP built from prompts in one session. For bugs or questions on specific features, refer to the respective prompt file that covers that feature — each prompt includes context and caveats.
