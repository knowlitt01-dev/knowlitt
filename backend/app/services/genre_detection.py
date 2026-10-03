"""
Genre detection for uploaded books.

Uses the book title, author (if available) and the first ~4 000 characters of
extracted text to classify the book as "fiction" or "non-fiction" plus a
sub-genre label.  The result also sets `content_mode`:

  * fiction     → "companion"   (story / world-building companion prompts)
  * non-fiction → "extraction"  (fact / insight extraction prompts)

If GROQ_API_KEY is set the classification is done by Llama 3.3 70B (one
cheap, fast call).  Without a key a keyword heuristic is used — good enough
for dev / demo purposes.
"""
import json
import logging
import re

import requests

from app.core.config import settings

logger = logging.getLogger("booktutor.genre_detection")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

# Characters of extracted text sent to the LLM for classification
_SAMPLE_CHARS = 4000

_GENRE_SYSTEM_PROMPT = """\
You are a book genre classifier.

Given a book title, optional author name, and an excerpt from the first pages,
classify the book and return ONLY valid JSON — no markdown fences, no extra text.

Use exactly this schema:
{
  "genre": "fiction" | "non-fiction",
  "sub_genre": "<one of the labels below>",
  "confidence": <0.0-1.0>,
  "reasoning": "<one short sentence>"
}

Allowed sub_genre labels:
  fiction:      "literary fiction" | "thriller" | "mystery" | "science fiction" |
                "fantasy" | "romance" | "historical fiction" | "horror" | "adventure" |
                "short stories" | "graphic novel" | "other fiction"
  non-fiction:  "self-help" | "biography" | "autobiography" | "memoir" | "business" |
                "science" | "history" | "philosophy" | "technology" | "psychology" |
                "economics" | "politics" | "health & wellness" | "travel" |
                "religion & spirituality" | "education" | "reference" | "other non-fiction"

Rules:
- Academic textbooks, technical manuals, and study guides are NON-FICTION.
- If unsure, lean toward the most common genre for books of that topic.
- Provide a confidence score: 0.9+ for clear cases, 0.6-0.89 for moderate, below 0.6 for ambiguous.
"""


def _call_groq_classify(title: str, author: str | None, text_sample: str) -> dict | None:
    """Call Groq LLM to classify the book genre.  Returns the parsed dict or None on failure."""
    if not settings.GROQ_API_KEY:
        return None

    user_content = f"Title: {title}\n"
    if author:
        user_content += f"Author: {author}\n"
    user_content += f"\nFirst pages excerpt:\n{text_sample[:_SAMPLE_CHARS]}"

    try:
        resp = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": _GENRE_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                "temperature": 0.1,   # low temp → deterministic classification
                "max_tokens": 200,
            },
            timeout=20,
        )
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"]
        # Strip any accidental markdown fences
        raw = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
        return json.loads(raw)
    except Exception as exc:
        logger.warning("Groq genre-classification failed, will use heuristic: %s", exc)
        return None


# --------------------------------------------------------------------------
# Keyword heuristic fallback
# --------------------------------------------------------------------------

_FICTION_WORDS = {
    "novel", "story", "fiction", "tales", "saga", "chronicles",
    "chapter one", "chapter 1", "prologue", "epilogue",
    "she said", "he said", "they said", "whispered", "shouted",
    "protagonist", "narrator", "once upon",
}

_NON_FICTION_WORDS = {
    "introduction", "preface", "abstract", "chapter", "section",
    "figure", "table", "reference", "bibliography", "index",
    "methodology", "conclusion", "summary", "foreword",
    "copyright", "isbn", "published by", "all rights reserved",
    "how to", "guide", "learn", "teach", "study", "research",
    "theory", "analysis", "data", "evidence", "study",
}

# Title keywords that strongly signal non-fiction
_NF_TITLE_SIGNALS = {
    "guide", "handbook", "manual", "textbook", "introduction to",
    "how to", "learn", "mastering", "principles of", "theory",
    "the complete", "biography", "autobiography", "memoir",
    "history of", "science of", "art of", "way of",
}

# Sub-genre heuristics: (keyword_set, sub_genre_label)
_NF_SUB_GENRE_RULES: list[tuple[set[str], str]] = [
    ({"startup", "entrepreneur", "business", "management", "leadership", "strategy", "marketing", "sales"}, "business"),
    ({"self-help", "habits", "mindset", "productivity", "success", "motivation", "personal development"}, "self-help"),
    ({"biography", "life of", "story of", "memoir"}, "biography"),
    ({"history", "war", "empire", "civilization", "ancient"}, "history"),
    ({"science", "physics", "chemistry", "biology", "evolution", "quantum"}, "science"),
    ({"technology", "software", "programming", "algorithm", "computer", "data science", "machine learning", "ai", "artificial intelligence"}, "technology"),
    ({"psychology", "behavior", "cognitive", "mental", "brain", "mind"}, "psychology"),
    ({"philosophy", "ethics", "consciousness", "metaphysics"}, "philosophy"),
    ({"economics", "economy", "market", "finance", "wealth", "investment"}, "economics"),
    ({"health", "wellness", "nutrition", "diet", "fitness", "medicine"}, "health & wellness"),
    ({"religion", "spiritual", "god", "faith", "meditation", "buddhism", "islam", "hinduism", "christianity"}, "religion & spirituality"),
]

_FICTION_SUB_GENRE_RULES: list[tuple[set[str], str]] = [
    ({"thriller", "detective", "crime", "murder", "spy", "secret agent"}, "thriller"),
    ({"mystery", "clue", "suspect", "detective", "whodunit"}, "mystery"),
    ({"fantasy", "dragon", "magic", "wizard", "sword", "kingdom", "elf", "dwarf"}, "fantasy"),
    ({"science fiction", "sci-fi", "spaceship", "alien", "robot", "dystopia", "futuristic"}, "science fiction"),
    ({"romance", "love story", "heart", "passion", "soulmate"}, "romance"),
    ({"horror", "ghost", "haunted", "vampire", "zombie", "terror", "dread"}, "horror"),
    ({"historical", "century", "victorian", "medieval", "war", "regiment"}, "historical fiction"),
]


def _heuristic_classify(title: str, author: str | None, text_sample: str) -> dict:
    """Pure-Python fallback when Groq is unavailable."""
    combined = (title + " " + (author or "") + " " + text_sample[:2000]).lower()
    title_lower = title.lower()

    fiction_score = sum(1 for w in _FICTION_WORDS if w in combined)
    nf_score = sum(1 for w in _NON_FICTION_WORDS if w in combined)
    nf_title_bonus = sum(2 for w in _NF_TITLE_SIGNALS if w in title_lower)
    nf_score += nf_title_bonus

    if nf_score >= fiction_score:
        genre = "non-fiction"
        sub_genre = "other non-fiction"
        for keywords, label in _NF_SUB_GENRE_RULES:
            if any(kw in combined for kw in keywords):
                sub_genre = label
                break
    else:
        genre = "fiction"
        sub_genre = "other fiction"
        for keywords, label in _FICTION_SUB_GENRE_RULES:
            if any(kw in combined for kw in keywords):
                sub_genre = label
                break

    confidence = 0.55  # heuristic is inherently uncertain
    return {
        "genre": genre,
        "sub_genre": sub_genre,
        "confidence": confidence,
        "reasoning": "Classified using keyword heuristic (no GROQ_API_KEY set).",
    }


# --------------------------------------------------------------------------
# Public API
# --------------------------------------------------------------------------

def detect_genre(title: str, author: str | None, text_sample: str) -> dict:
    """
    Classify the book genre.

    Returns a dict:
    {
        "genre":        "fiction" | "non-fiction",
        "sub_genre":    str,
        "content_mode": "companion" | "extraction",
        "confidence":   float,
        "reasoning":    str,
    }

    Never raises — on any error returns a safe default ("non-fiction" /
    "extraction") so the upload pipeline is never blocked by a failed
    classification.
    """
    try:
        result = _call_groq_classify(title, author, text_sample) or _heuristic_classify(title, author, text_sample)
        genre = result.get("genre", "non-fiction")
        # Normalise casing / aliases
        if genre.lower() in ("fiction", "novel"):
            genre = "fiction"
        else:
            genre = "non-fiction"

        content_mode = "companion" if genre == "fiction" else "extraction"

        logger.info(
            "Genre detection for '%s': genre=%s sub_genre=%s mode=%s confidence=%.2f — %s",
            title,
            genre,
            result.get("sub_genre", "unknown"),
            content_mode,
            result.get("confidence", 0.0),
            result.get("reasoning", ""),
        )

        return {
            "genre": genre,
            "sub_genre": result.get("sub_genre", "unknown"),
            "content_mode": content_mode,
            "confidence": result.get("confidence", 0.55),
            "reasoning": result.get("reasoning", ""),
        }
    except Exception as exc:
        logger.exception("Genre detection failed entirely for '%s': %s — defaulting to non-fiction/extraction", title, exc)
        return {
            "genre": "non-fiction",
            "sub_genre": "unknown",
            "content_mode": "extraction",
            "confidence": 0.0,
            "reasoning": "Classification error; defaulted to non-fiction.",
        }
