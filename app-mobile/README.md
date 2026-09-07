# BookTutor Mobile (Expo / React Native)

Same FastAPI backend as the web app — this is the native iOS/Android app, built with
Expo so you can test it on a real phone in minutes with zero native build tooling.

## What's here

- Login/signup (SecureStore-backed token storage — more secure than the web's localStorage)
- Dashboard: PDF upload via native document picker, book list, daily digest
- Flashcard review with SM-2 ratings
- Settings: Telegram/WhatsApp connect, subscription status, support tickets

Every screen talks to the same backend endpoints as the web app — same auth, same trial
gating, same SM-2 logic. Nothing is duplicated; this is a second frontend on shared
backend logic, not a separate product.

## Quick Start

### 1. Start the backend (from the project root, not this folder)

```bash
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0
```

Use `--host 0.0.0.0` (not the default `127.0.0.1`) so your phone can reach it over your
local network.

### 2. Point the app at your backend

```bash
cp .env.example .env
```

Edit `.env` and set `EXPO_PUBLIC_API_URL` to your computer's local network IP (not
`localhost` — your phone can't resolve that), e.g.:
```
EXPO_PUBLIC_API_URL=http://192.168.1.42:8000
```
Find your IP with `ipconfig` (Windows) or `ifconfig`/`ip addr` (Mac/Linux).

### 3. Install dependencies and start

```bash
npm install
npx expo start
```

This opens a QR code in your terminal. Install the **Expo Go** app on your phone
(App Store / Play Store, free), then scan the QR code — the app loads directly, no
build step, no App Store submission needed for testing.

### 4. Test on web too (optional)

```bash
npx expo start --web
```

Same codebase, runs in a browser tab — useful for quick UI iteration without a phone.

## Building a real installable app (App Store / Play Store)

Testing via Expo Go is instant, but a real installable app needs Expo's build service
(EAS), which requires a free Expo account:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview   # unsigned APK, installable directly
eas build --platform ios --profile preview        # requires an Apple Developer account ($99/yr)
```

Android's preview build gives you a direct-install `.apk` for free — no Play Store needed
to test on a real device. iOS requires an Apple Developer account either way, even for
personal testing (Apple's restriction, not Expo's).

For full store submission (`eas submit`), see Expo's docs — this needs your own Apple/
Google developer accounts either way, so it's not something that can be pre-configured
here.

## Notes on what's NOT included

- App icons/splash screens are Expo's defaults — replace `assets/icon.png` etc. before
  a real store submission
- Push notifications (`expo-notifications`) is installed but not wired to a notification
  server yet — the web app's Telegram/WhatsApp channels work today; native push via
  Expo's push service is a reasonable next add
- No offline caching — every screen fetches fresh from the backend each time
