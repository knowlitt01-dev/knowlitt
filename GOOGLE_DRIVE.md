# Setting Up Google Drive Import

The Drive import flow is fully built (backend endpoint + frontend picker). Until you add
Google credentials, the "Import from Google Drive" button shows a clear setup message
instead of failing.

## Setup (10 minutes)

1. Go to **console.cloud.google.com**, create a new project (or use an existing one).
2. Enable two APIs (APIs & Services → Library):
   - **Google Drive API**
   - **Google Picker API**
3. Create credentials (APIs & Services → Credentials):
   - **API Key** — restrict it to the Picker API for safety
   - **OAuth 2.0 Client ID** (type: Web application) — add your frontend URL
     (`http://localhost:3000` for dev, your Vercel URL for production) to
     **Authorized JavaScript origins**
4. In `frontend/.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   NEXT_PUBLIC_GOOGLE_API_KEY=your-api-key
   ```
5. Restart the frontend dev server. The "Import from Google Drive" button on the
   dashboard will now open Google's file picker.

## What's supported

- PDF files — same extraction pipeline as local uploads (same error handling for
  scanned/corrupted PDFs)
- Google Docs-native files — auto-exported to plain text before processing
- Multiple files selected at once, each processed independently

## OAuth consent screen note

While your app is in "Testing" mode in Google Cloud Console, only email addresses you've
explicitly added as test users can complete the OAuth flow. To let any user import from
Drive, you'll need to submit the app for Google's verification review (required once you
request the Drive scope for a public app) — this is Google's process, not something in
this codebase.
