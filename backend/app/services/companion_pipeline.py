"""
Companion pipeline — fiction content generation.

Processes a fiction book once at upload time.  The full text is split into
reading segments (≈ 3 000 chars each, same as the extraction pipeline).
For each segment we generate four types of Insight rows:

  recap               — spoiler-free summary of everything UP TO this point
  character_reminder  — 1-2 characters or context notes relevant to the
                        UPCOMING segment (never reveals what happens)
  hook                — a single non-spoiler teaser sentence
  reflection          — 1-2 open-ended questions about what was just read

Critically, the LLM is given ONLY the text up to and including the current
segment, never anything beyond it.  This enforces the no-spoiler guarantee
at the data level, not just at the prompt level.

Each call is independent and cheap (small context window).  Results are
cached as Insight rows so the daily scheduler can deliver them in order
without re-calling the LLM — same scheduling contract as the extraction
pipeline.

Fallback: if GROQ_API_KEY is not set, a structured heuristic produces
plausible placeholder content so the app remains testable locally.
"""
import json
import logging
import re

import requests

from app.core.config import settings

logger = logging.getLogger("booktutor.companion_pipeline")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

# How many characters of preceding context to send as "story so far"
# for the recap prompt.  Keeps token usage bounded.
_RECAP_CONTEXT_CHARS = 6000

_COMPANION_SYSTEM = """\
You are a reading companion for a fiction book.

You will receive:
  - The book's title and author
  - "Story so far" — everything the reader has read UP TO AND INCLUDING today's segment
  - "Today's segment" — what the reader will read today (the current section)

Your job is to help the reader engage deeply WITHOUT spoiling anything beyond what they have already read.

Return ONLY valid JSON, no markdown fences, no preamble, matching exactly:
{
  "recap": "<2-3 sentence plain-language summary of the story SO FAR — never mentions events in today's segment or later>",
  "character_reminders": [
    "<one sentence reminding the reader about a character or world-detail relevant to today's reading>"
  ],
  "hook": "<one intriguing, non-spoiler sentence that hints at the themes or mood of today's segment WITHOUT revealing plot>",
  "reflections": [
    "<one open-ended question about what the reader has already read — no spoilers>"
  ]
}

Rules:
- The recap must cover ONLY events the reader has already read (i.e. everything before today's segment).
- character_reminders: 1-2 items. Focus on characters or world-building facts established before today.
- hook: one sentence only. Tease mood/theme, NEVER plot.
- reflections: 1-2 items. Questions should prompt personal reflection on what they've read so far.
- Never refer to events, characters, or twists that appear ONLY in today's segment or later chapters.
- Tone: warm, curious, encouraging — like a thoughtful book-club friend.
"""


def _build_companion_prompt(
    title: str,
    author: str | None,
    story_so_far: str,
    todays_segment: str,
) -> str:
    parts = [f"Book: {title}"]
    if author:
        parts.append(f"Author: {author}")
    parts.append(f"\n--- Story so far (everything read before today) ---\n{story_so_far[-_RECAP_CONTEXT_CHARS:]}")
    parts.append(f"\n--- Today's segment (what the reader will read today) ---\n{todays_segment[:3000]}")
    return "\n".join(parts)


def _call_groq_companion(prompt: str) -> dict | None:
    if not settings.GROQ_API_KEY:
        return None
    try:
        resp = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": _COMPANION_SYSTEM},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.6,
                "max_tokens": 600,
            },
            timeout=40,
        )
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"]
        raw = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
        return json.loads(raw)
    except Exception as exc:
        logger.warning("Groq companion call failed, using fallback: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Fallback heuristic (no API key)
# ---------------------------------------------------------------------------

def _fallback_companion(
    title: str,
    segment_idx: int,
    story_so_far: str,
    todays_segment: str,
) -> dict:
    """Produces structured placeholder content for local/offline testing."""
    # Extract a few sentences from the story so far for the recap
    sentences = re.split(r"(?<=[.!?])\s+", story_so_far.strip())
    recap_sentences = [s.strip() for s in sentences if 30 < len(s.strip()) < 200][-3:]
    recap = " ".join(recap_sentences) if recap_sentences else (
        f"The story has been unfolding across {segment_idx} reading session(s)."
    )

    # Pull character-ish names (capitalised words that aren't the start of a sentence)
    names = re.findall(r"(?<=[a-z] )[A-Z][a-z]{2,}", story_so_far)
    unique_names = list(dict.fromkeys(names))[:2]
    char_reminder = (
        f"Remember {unique_names[0]} — they have been central to the story so far."
        if unique_names else
        "Keep track of the key characters introduced in these early chapters."
    )

    hook = (
        f"Today's reading continues the tension building in '{title}' — "
        "pay attention to the mood shifts."
    )

    # Simple reflection from first substantial sentence of story_so_far
    first_q_sentence = next(
        (s.strip() for s in sentences if len(s.strip()) > 40),
        "the events so far"
    )
    reflection = f"How do you think the events in this section will shape what comes next?"

    return {
        "recap": recap,
        "character_reminders": [char_reminder],
        "hook": hook,
        "reflections": [reflection],
    }


# ---------------------------------------------------------------------------
# Public API — called by books.py once per book upload
# ---------------------------------------------------------------------------

def process_companion_book(
    title: str,
    author: str | None,
    sections: list[str],
) -> list[dict]:
    """
    Process all sections of a fiction book through the companion pipeline.

    Returns a flat list of Insight-shaped dicts ready to be persisted:
      {
        "text":          str,
        "type":          "recap" | "character_reminder" | "hook" | "reflection",
        "pipeline":      "companion",
        "section_index": int,   # 0-based reading segment
        "order_index":   int,   # global sort order for daily scheduler
      }

    Guarantees:
    - The LLM (or fallback) is ONLY given text up to and including the
      current section — never anything beyond it.
    - Each section maps to one day's reading block in the scheduler.
    """
    all_insights: list[dict] = []
    order_index = 0
    story_so_far = ""  # accumulates as we process sections in order

    for seg_idx, segment in enumerate(sections):
        logger.info(
            "Companion pipeline: processing segment %d/%d for '%s'",
            seg_idx + 1, len(sections), title,
        )

        prompt = _build_companion_prompt(title, author, story_so_far, segment)
        result = _call_groq_companion(prompt) or _fallback_companion(
            title, seg_idx, story_so_far, segment
        )

        # --- recap ---
        recap_text = result.get("recap", "").strip()
        if recap_text:
            all_insights.append({
                "text": recap_text,
                "type": "recap",
                "pipeline": "companion",
                "section_index": seg_idx,
                "order_index": order_index,
            })
            order_index += 1

        # --- character reminders (1-2) ---
        for reminder in (result.get("character_reminders") or [])[:2]:
            if reminder and reminder.strip():
                all_insights.append({
                    "text": reminder.strip(),
                    "type": "character_reminder",
                    "pipeline": "companion",
                    "section_index": seg_idx,
                    "order_index": order_index,
                })
                order_index += 1

        # --- hook (exactly 1) ---
        hook_text = result.get("hook", "").strip()
        if hook_text:
            all_insights.append({
                "text": hook_text,
                "type": "hook",
                "pipeline": "companion",
                "section_index": seg_idx,
                "order_index": order_index,
            })
            order_index += 1

        # --- reflection questions (1-2) ---
        for question in (result.get("reflections") or [])[:2]:
            if question and question.strip():
                all_insights.append({
                    "text": question.strip(),
                    "type": "reflection",
                    "pipeline": "companion",
                    "section_index": seg_idx,
                    "order_index": order_index,
                })
                order_index += 1

        # Advance the story-so-far window — ONLY after processing this segment
        story_so_far += "\n" + segment

    logger.info(
        "Companion pipeline complete for '%s': %d segments → %d insight rows",
        title, len(sections), len(all_insights),
    )
    return all_insights
