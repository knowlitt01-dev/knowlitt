# Kindle Integration — What's Actually Possible

## The honest limitation

Amazon does not provide a public API for third-party apps to sync a user's Kindle
library, highlights, or reading activity automatically. This isn't a gap in this
codebase — it's a real restriction on Amazon's side. Tools that claim to "sync your
Kindle" either:
- Screen-scrape Amazon's Kindle Reader web app (fragile, breaks whenever Amazon changes
  their frontend, and violates Amazon's Terms of Service), or
- Have the user manually export and upload their own data

This app does the second, honest option.

## What's actually built: My Clippings.txt import

Every Kindle device automatically maintains a file called `My Clippings.txt` containing
every highlight, note, and bookmark the user has made — across every book, regardless of
where it was purchased.

**How a user gets this file:**
1. Connect their Kindle to a computer via USB
2. The device appears as a drive; `My Clippings.txt` is at its root
3. Copy the file off, upload it to BookTutor via Settings → Integrations → Connect Kindle

The backend (`app/services/kindle_import.py`) parses this file for real — tested against
the actual Kindle export format, including correctly skipping bookmark-only entries (no
highlight text) and handling missing author/date fields gracefully.

## What this enables

- All existing highlights/notes from a user's Kindle library, imported in one upload
- Grouped by book title and author
- Location/page number preserved
- Original highlight timestamp preserved (when Amazon's export includes it)

## What this does NOT do

- **No automatic/ongoing sync** — a new highlight made after import won't appear until
  the user re-uploads an updated `My Clippings.txt`
- **No book content import** — clippings are highlights/notes only, not full book text
  (Kindle's DRM prevents that regardless of API access)
- **No "connect your Amazon account" OAuth flow** — there is nothing on Amazon's side to
  OAuth into for this purpose

## Note on DRM-free downloads (as of Jan 2026)

Amazon began allowing DRM-free EPUB/PDF downloads for eligible purchased titles in
January 2026 (publisher opt-in required). For books where this applies, a user could
download the actual EPUB/PDF and upload it to BookTutor through the normal book upload
flow — getting real content processing (insights, flashcards), not just highlights. This
is separate from the Kindle Highlights import above and isn't automated — the user
downloads from Amazon's site themselves and uploads it like any other book.

## If you later want real sync

The only way to get closer to automatic sync would be through Amazon's official
publishing-side APIs (KDP), which are for authors/publishers distributing content, not
for readers accessing their own library — not applicable here. There is no consumer-side
alternative to watch for; this has been a stable limitation for years, not a temporary
gap.
