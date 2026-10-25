# Knowlit — Frontend

Next.js 14 (App Router) web app and PWA for the Knowlit learning platform.

## Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom design tokens
- **Icons:** Lucide React
- **Fonts:** Inter (sans), Playfair Display (serif) via Google Fonts
- **Auth:** JWT stored in `localStorage`, managed by `AuthProvider` context
- **API:** Thin REST client in `lib/api.ts` pointing at the FastAPI backend

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout (fonts, AuthProvider, PWA scripts)
│   ├── page.tsx            # Home: shows OnboardingLanding OR Dashboard
│   ├── globals.css         # Design tokens + global styles
│   ├── login/              # /login — sign in page
│   ├── signup/             # /signup — create account
│   ├── books/              # /books — library & PDF upload
│   ├── review/             # /review — flashcard review (SM-2)
│   ├── roadmap/            # /roadmap — learning roadmap
│   ├── discover/           # /discover — book discovery
│   ├── connectors/         # /connectors — Google Drive / Kindle
│   ├── upgrade/            # /upgrade — subscription plans
│   ├── profile/            # /profile — user settings
│   ├── admin/              # /admin/* — admin panel
│   └── welcome/            # /welcome — onboarding alias
├── components/
│   ├── AppShell.tsx        # Sidebar + mobile header layout for auth pages
│   ├── AuthProvider.tsx    # Auth context: user, login, signup, logout
│   ├── OnboardingLanding.tsx  # Public landing page carousel
│   ├── BookUpload.tsx      # Drag-and-drop PDF uploader
│   ├── DailyDigest.tsx     # Today's reading digest card
│   ├── Flashcard.tsx       # Individual flashcard component
│   └── ShareCard.tsx       # Shareable insight card
├── lib/
│   └── api.ts              # REST API client with JWT auth
├── public/
│   ├── illustrations/      # Onboarding artwork images
│   ├── manifest.json       # PWA manifest
│   └── sw.js              # Service worker
├── tailwind.config.js
├── next.config.js
└── .env.local.example
```

## Routing & Auth Logic

**Public routes** (no auth required):
- `/` — Shows `OnboardingLanding` if not logged in, Dashboard if logged in
- `/login`, `/signup`, `/welcome`

**Protected routes** (redirect to `/login` if not authenticated):
- `/books`, `/review`, `/roadmap`, `/discover`, `/connectors`, `/upgrade`, `/profile`, `/admin/*`

The `AuthProvider` resolves the JWT token via `GET /auth/me` on mount. While auth is loading, pages show a spinner. After resolution, unauthenticated users on protected pages are redirected to `/login`.

## Development

```bash
# Install
npm install

# Copy env
cp .env.local.example .env.local

# Run dev server
npm run dev
```

App will be at `http://localhost:3000`. The backend should be running at `http://localhost:8000`.

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Design Tokens

Key colors (defined in `tailwind.config.js` and `globals.css`):

| Token | Value | Usage |
|---|---|---|
| `#111111` | Near-black | Primary text, CTAs |
| `#F5A623` | Amber/gold | Accent, icons, highlights |
| `#C2720F` | Dark amber | Accent text, links |
| `#F4F4F6` | Off-white | App background |
| `#E4E4E7` | Light gray | Borders, dividers |
| `#FFE9C9` | Light amber | Badge backgrounds |

## Build & Deploy

```bash
# Production build
npm run build

# Preview build locally
npm start
```

For Vercel deployment, see the root `DEPLOY.md`.
