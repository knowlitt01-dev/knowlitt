"""
Parses a My Clippings.txt file — the standard export format every Kindle
device produces (Settings > My Clippings, or the file at the root of the
device when connected via USB). This is the only legitimate way to import
Kindle content without a public Amazon sync API — see KINDLE.md.
"""
import re
from datetime import datetime

ENTRY_SEPARATOR = "=========="


def parse_clippings(raw_text: str) -> list[dict]:
    """Returns a list of {book_title, book_author, highlight_text, location,
    highlighted_at}. Skips bookmark-only entries (no text) and malformed
    blocks rather than failing the whole import over one bad entry."""
    entries = [e.strip() for e in raw_text.split(ENTRY_SEPARATOR) if e.strip()]
    results = []

    for entry in entries:
        lines = [l for l in entry.split("\n") if l.strip()]
        if len(lines) < 2:
            continue  # malformed block — skip, don't fail the whole import

        title_line = lines[0].strip()
        meta_line = lines[1].strip()
        highlight_text = "\n".join(lines[2:]).strip()

        if not highlight_text:
            continue  # bookmark entry, no actual highlight text

        # "Book Title (Author Name)" — author is optional
        author_match = re.search(r"\(([^)]+)\)\s*$", title_line)
        book_author = author_match.group(1) if author_match else None
        book_title = re.sub(r"\s*\([^)]+\)\s*$", "", title_line).strip()

        location_match = re.search(r"(?:Location|page) ([\d\-]+)", meta_line, re.IGNORECASE)
        location = location_match.group(1) if location_match else None

        date_match = re.search(r"Added on (.+)$", meta_line)
        highlighted_at = None
        if date_match:
            try:
                # Kindle's format: "Added on Monday, 1 January 2026 09:15:00"
                highlighted_at = datetime.strptime(
                    date_match.group(1).strip(), "%A, %d %B %Y %H:%M:%S"
                )
            except ValueError:
                pass  # date parsing is best-effort — don't fail the import over it

        results.append({
            "book_title": book_title or "Unknown",
            "book_author": book_author,
            "highlight_text": highlight_text,
            "location": location,
            "highlighted_at": highlighted_at,
        })

    return results
