"""
Upgraded LLM pipeline for non-fiction extraction.

Key improvements over v1:
- Richer system prompt: requires concrete, actionable insights — not summaries
- Book-level context (title + genre) is injected so the LLM understands what
  kind of content it is working with (self-help vs science vs business, etc.)
- Structured output schema enforces quality (insight type must match content)
- Flashcards are Cloze-style AND question-answer style for better recall
- Retry on parse failure (up to 2 attempts) before falling back to heuristic
- Section text cap raised to 8 000 chars so fewer API calls are needed for
  large books while staying inside Llama-3.3-70B's context window
- Offline heuristic improved: extracts multi-sentence conceptual statements
  rather than fill-in-the-blank (which was near-useless)
"""
import json
import logging
import re

import requests

from app.core.config import settings

logger = logging.getLogger("knowlit.llm_pipeline")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

# ─────────────────────────────────────────────────────────────────────────────
# System prompt — the single biggest lever for output quality
# ─────────────────────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """\
You are an expert knowledge-extraction engine. Your job is to distill the most valuable, non-obvious, and actionable ideas from a section of a non-fiction book.

You will receive:
  - Book title and genre (for context)
  - A section of the book text (~1 000–8 000 characters)

You must return ONLY valid JSON — no markdown fences, no preamble — matching EXACTLY:
{
  "insights": [
    {
      "text": "<insight text — see rules below>",
      "type": "concept|example|framework|quote|statistic|counterintuitive"
    }
  ],
  "flashcards": [
    {
      "front": "<question or prompt>",
      "back": "<concise answer — 1-3 sentences max>"
    }
  ]
}

INSIGHT RULES (apply all):
1. Each insight must be a COMPLETE, STANDALONE idea a reader can use without re-reading the section.
2. Insights must be SPECIFIC — include names, numbers, percentages, or examples when present.
3. NO generic summaries like "The author discusses X". Extract the actual idea.
4. Choose the most precise type:
   - "concept"       — a core principle or mental model
   - "example"       — a real-world case that illustrates a concept
   - "framework"     — a structured method, system, or model (e.g. 2×2 matrix, steps)
   - "quote"         — a verbatim or near-verbatim memorable sentence from the text
   - "statistic"     — a number, study result, or data point
   - "counterintuitive" — something that contradicts common sense or default assumptions
5. Produce 3–5 insights. Prioritise quality over quantity — drop weak ideas.

FLASHCARD RULES:
1. Each flashcard must TEST a specific, memorable idea from the insights above.
2. Front: phrase as a question ("What does X mean?", "What is the key finding of…?")
   OR a cloze prompt ("The _____ effect refers to…").
3. Back: the direct, precise answer. Do NOT repeat the question. Max 3 sentences.
4. Produce 2–4 flashcards. Do not create flashcards for ideas already obvious from the question.
"""


def _call_groq(section_text: str, book_title: str = "", sub_genre: str = "") -> dict | None:
    if not settings.GROQ_API_KEY:
        return None

    # Build user message with book context
    context_lines = []
    if book_title:
        context_lines.append(f"Book title: {book_title}")
    if sub_genre:
        context_lines.append(f"Genre: {sub_genre}")
    context_lines.append("")
    context_lines.append("--- SECTION TEXT ---")
    context_lines.append(section_text[:8000])
    user_content = "\n".join(context_lines)

    for attempt in range(2):  # retry once on parse failure
        try:
            resp = requests.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": _SYSTEM_PROMPT},
                        {"role": "user", "content": user_content},
                    ],
                    "temperature": 0.35,
                    "max_tokens": 1200,
                },
                timeout=45,
            )
            resp.raise_for_status()
            raw = resp.json()["choices"][0]["message"]["content"]
            # Strip any accidental markdown fences
            raw = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
            parsed = json.loads(raw)
            # Validate structure
            if "insights" in parsed and "flashcards" in parsed:
                return parsed
            logger.warning("Groq response missing required keys (attempt %d), retrying", attempt + 1)
        except json.JSONDecodeError as e:
            logger.warning("Groq response was not valid JSON (attempt %d): %s", attempt + 1, e)
        except Exception as e:
            logger.warning("Groq call failed (attempt %d): %s", attempt + 1, e)
            break  # network error — don't retry

    return None


def _fallback_extract(section_text: str) -> dict:
    """
    Improved offline heuristic — used when GROQ_API_KEY is not set.

    Instead of fill-in-the-blank (which produced near-useless cards), this:
    - Picks sentences that are long, assertive statements (no questions, no conjunctions at start)
    - Groups consecutive short sentences into richer insight blocks
    - Generates proper Q&A flashcards from identified key sentences
    """
    sentences = re.split(r"(?<=[.!?])\s+", section_text.strip())
    # Filter: meaningful, assertive sentences that aren't headings or too short
    candidates = [
        s.strip() for s in sentences
        if 70 <= len(s.strip()) <= 350
        and not s.strip().endswith("?")
        and not s.strip().lower().startswith(("but ", "and ", "or ", "so ", "yet "))
    ]

    # Deduplicate near-identical sentences
    seen: set[str] = set()
    unique_candidates: list[str] = []
    for s in candidates:
        key = re.sub(r"\s+", " ", s.lower())[:60]
        if key not in seen:
            seen.add(key)
            unique_candidates.append(s)

    picked = unique_candidates[:5] if unique_candidates else sentences[:3]

    insights = []
    for s in picked:
        # Assign a type heuristically
        if re.search(r"\d+%|\d+ (percent|times|x |fold)", s, re.I):
            itype = "statistic"
        elif re.search(r"for example|such as|instance|case|story of", s, re.I):
            itype = "example"
        elif re.search(r"step|phase|stage|framework|model|matrix|method|process", s, re.I):
            itype = "framework"
        elif re.search(r"surprisingly|contrary|despite|paradox|counterintuitive|myth", s, re.I):
            itype = "counterintuitive"
        else:
            itype = "concept"
        insights.append({"text": s, "type": itype})

    flashcards = []
    for s in picked[:3]:
        # Find the key subject/noun phrase (first 4 words) and form a question
        words = s.split()
        if len(words) >= 8:
            # Extract a keyword to form a question around
            key_words = " ".join(words[:5]).rstrip(",:;")
            flashcards.append({
                "front": f"What is the key idea related to: \"{key_words}…\"?",
                "back": s,
            })

    return {"insights": insights, "flashcards": flashcards}


def process_section(
    section_text: str,
    book_title: str = "",
    sub_genre: str = "",
) -> dict:
    """
    Main entry point. Tries Groq first, falls back to offline heuristic.

    Args:
        section_text: The chunk of book text to process.
        book_title:   Optional book title for context injection.
        sub_genre:    Optional sub-genre label (e.g. "self-help", "science").

    Returns dict with keys "insights" and "flashcards".
    """
    result = _call_groq(section_text, book_title=book_title, sub_genre=sub_genre)
    if result is None:
        result = _fallback_extract(section_text)
    result.setdefault("insights", [])
    result.setdefault("flashcards", [])
    return result
