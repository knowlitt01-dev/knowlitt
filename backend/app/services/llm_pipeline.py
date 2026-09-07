"""
Generates insights + flashcards from book sections.

If GROQ_API_KEY is set, uses Groq's free-tier API (Llama 3.3 70B) for real
extraction. If not set, falls back to a simple offline heuristic so the app
is fully runnable with zero external accounts — the fallback is clearly
lower quality and meant for local testing only, not production use.
"""
import json
import logging
import re

import requests

from app.core.config import settings

logger = logging.getLogger("booktutor.llm_pipeline")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are extracting study material from a book section.
Return ONLY valid JSON, no markdown fences, no preamble, matching exactly:
{
  "insights": [
    {"text": "...", "type": "concept|example|quote|framework"}
  ],
  "flashcards": [
    {"front": "...", "back": "..."}
  ]
}
Produce 2-4 insights and 2-3 flashcards per section. Insights should be
specific and non-obvious, not generic chapter summaries. Flashcards should
test recall of a specific fact or idea from the insights."""


def _call_groq(section_text: str) -> dict | None:
    if not settings.GROQ_API_KEY:
        return None
    try:
        resp = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": section_text[:6000]},
                ],
                "temperature": 0.4,
            },
            timeout=30,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        content = re.sub(r"^```(json)?|```$", "", content.strip(), flags=re.MULTILINE).strip()
        return json.loads(content)
    except Exception as e:
        logger.warning("Groq call failed, falling back to heuristic: %s", e)
        return None


def _fallback_extract(section_text: str) -> dict:
    """Offline heuristic: picks a few substantial sentences as 'insights' and
    turns them into fill-in-the-blank-style flashcards. Not a real
    substitute for LLM extraction — swap in a GROQ_API_KEY for real use."""
    sentences = re.split(r"(?<=[.!?])\s+", section_text)
    candidates = [s.strip() for s in sentences if 60 <= len(s.strip()) <= 240]
    picked = candidates[:4] if candidates else sentences[:2]

    insights = [{"text": s, "type": "concept"} for s in picked]
    flashcards = []
    for s in picked[:3]:
        words = s.split()
        if len(words) > 6:
            blank_idx = len(words) // 2
            answer = words[blank_idx].strip(".,;:")
            front_words = words.copy()
            front_words[blank_idx] = "____"
            flashcards.append({"front": " ".join(front_words), "back": answer})
    return {"insights": insights, "flashcards": flashcards}


def process_section(section_text: str) -> dict:
    result = _call_groq(section_text)
    if result is None:
        result = _fallback_extract(section_text)
    result.setdefault("insights", [])
    result.setdefault("flashcards", [])
    return result
