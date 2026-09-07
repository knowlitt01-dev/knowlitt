# Backend Upgrade — What's Done vs. Pending

This tracks progress against the "Upgrade My Existing Web App" spec. Backend work below
is built AND live-tested against a running server (not just written) — see each item's
note for what was verified.

## ✅ Done and tested

**PDF/OCR processing**
- Real OCR via Tesseract (`app/services/ingestion.py`) — tested against an actual
  image-only PDF: correctly detected no text layer, ran OCR, extracted genuine readable
  text, and that content flowed through to real insights.
- Granular status states: `uploading → extracting → ocr_processing/processing → ready/failed`
- Stable error codes (`corrupted_file`, `password_protected`, `ocr_page_limit_exceeded`,
  etc.) instead of parsing error strings
- Regression-tested: normal text PDFs still process identically to before

**Delete book**
- `DELETE /books/{id}` — tested: cross-user delete attempt correctly rejected (404),
  legitimate owner's delete succeeds, cascades to insights/flashcards/review_state (zero
  orphaned rows confirmed), and the file is actually removed from disk

**Upload limit**
- Raised to 500MB, enforced during a streamed disk write (not loaded fully into memory —
  this was a real scalability fix, not just a config change)
- Path-traversal protection on stored file paths

**Topic-follow system**
- `POST /topics/follow`, `DELETE /topics/follow/{id}`, `GET /topics/following`,
  `GET /topics/search`, `GET /topics/trending` — all tested live
- No hardcoded topic list — topics are created on first follow/search
- Trending computed from real search-log activity in the last 7 days, with a
  most-followed fallback for a fresh install
- Cross-user unfollow correctly rejected (tested)

**Kindle integration**
- Researched first: confirmed Amazon has no public sync API (see `KINDLE.md`)
- Built the one legitimate path: `My Clippings.txt` upload/parse
- Tested live: real Kindle export format parsed correctly, including skipping
  bookmark-only entries, missing-author handling, timestamp parsing
- Cross-user isolation and disconnect tested

**Dockerfile**
- Added `tesseract-ocr` + `poppler-utils` system packages (required for OCR)
- Note: this Dockerfile has NOT been build-tested with `docker build` in this
  environment (no Docker available here) — the apt package names are standard/correct,
  but verify with a real `docker build` before deploying.

## ⛔ Not started yet

- **Frontend UI** for all of the above: delete confirmation modal, granular upload
  progress states, topic browse/follow/trending pages, Kindle connect screen
- **Landing page** (hero, how-it-works, features, topic-selection section)
- **Auth UI upgrade** (forgot password, password reset flow, email verification)
- **Security pass** specifically re-reviewing this session's new endpoints (rate limiting
  on the new routes, input validation edge cases, security headers/CSP)
- **Mobile app parity** — the Expo app does not yet have delete/OCR-status/topics/Kindle
  screens; it still reflects the pre-upgrade feature set

## Migration note

The `Book` model gained new columns (`author`, `file_path`, `is_scanned`, `error_code`)
and the status values changed (`processing` → the new multi-state flow). If you have an
existing `booktutor.db` with data, either delete it and let the app recreate the schema
fresh (SQLite dev default), or write a migration — this build uses `create_all()` on
startup, which adds new tables but does NOT alter existing table columns.
