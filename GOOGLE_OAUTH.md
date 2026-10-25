# Google OAuth Setup (Sign in with Google + Drive Auto-Connect)

This guide sets up **Sign in with Google** authentication AND automatic Google Drive access — once a user logs in with Google, their Drive is automatically connected for importing PDFs without any extra steps.

## What This Unlocks

| Without Google OAuth | With Google OAuth |
|---|---|
| Email/password only | Sign in with Google (one click) |
| Drive Picker: user must manually grant & paste token | Drive auto-connected after login |
| No persistent Drive access | Drive token stored server-side, refreshed automatically |

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New project"**
3. Name it `knowlit` (or anything you like) → **Create**

## Step 2: Enable Required APIs

In your new project:

1. Go to **APIs & Services → Library**
2. Search for and enable:
   - **Google Drive API**
   - **Google People API** (for user profile info)

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** (works for any Google account) → **Create**
3. Fill in:
   - **App name**: `Knowlit`
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click **Save and Continue** through the Scopes and Test Users screens
5. Add your own Google account as a **Test user** (required while app is in testing)

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `Knowlit Web`
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/auth/google/callback` ← for local dev
   - `https://your-production-domain.com/auth/google/callback` ← for production
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

## Step 5: Add to `.env`

In `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
FRONTEND_URL=http://localhost:3000
```

In `frontend/.env.local` (no changes needed — the frontend just calls the backend).

## Step 6: Restart the Backend

```bash
# With Docker
docker compose up --build -d

# Or locally
uvicorn app.main:app --reload
```

## How It Works

```
User clicks "Sign in with Google"
        ↓
Frontend redirects to: GET /auth/google/authorize
        ↓
Backend redirects to Google consent screen
        ↓
User grants consent (openid + email + profile + drive.readonly)
        ↓
Google redirects to: GET /auth/google/callback?code=…
        ↓
Backend exchanges code for access_token + refresh_token
Backend upserts User (creates account if new, links if existing)
Backend stores tokens → google_drive_connected = True
Backend issues JWT
        ↓
Backend redirects to: /auth/google/callback?token=<jwt>&drive=1
        ↓
Frontend stores JWT in localStorage → user is logged in
Drive is now auto-connected — no extra steps
```

## Scopes Requested

| Scope | Why |
|---|---|
| `openid` | Required for Google Identity |
| `email` | To create/find the user account |
| `profile` | For display name (future use) |
| `drive.readonly` | To list and download files from Drive |

> **Note:** `drive.readonly` is a "sensitive" scope. While your app is in testing mode (up to 100 users), this works fine. For production with 100+ users, you'll need to go through Google's OAuth verification process.

## Production Notes

- Change `FRONTEND_URL` in `.env` to your production domain
- Add the production redirect URI to Google Cloud Console
- For real user data, submit your app for Google's OAuth verification
- Consider encrypting `google_refresh_token` at rest using a KMS solution

## Troubleshooting

**"Access blocked: This app's request is invalid"**
→ Check that the redirect URI in Google Console exactly matches what's in `.env` (including http vs https, trailing slash, etc.)

**"Error 400: redirect_uri_mismatch"**
→ The redirect URI sent to Google doesn't match any registered URI. Check `FRONTEND_URL` in `.env`.

**Drive import fails with 401 after login**
→ The access token expired. The backend auto-refreshes using the stored refresh_token. If it still fails, the user should log out and log in with Google again to get a fresh refresh_token.

**"Sign in with Google" button does nothing / shows 501**
→ `GOOGLE_CLIENT_ID` is not set in the backend `.env`. Add it and restart.
