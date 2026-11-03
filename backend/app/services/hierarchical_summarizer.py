"""
Hierarchical summarization service.
Divides book text into chunks -> section summaries -> book-level summary.
"""
import logging
import re
import requests
from app.core.config import settings

logger = logging.getLogger("booktutor.summarizer")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


def _call_groq_summary(prompt: str, system: str, max_tokens: int = 1500) -> str | None:
    if not settings.GROQ_API_KEY:
        return None
    try:
        resp = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
                "max_tokens": max_tokens,
            },
            timeout=60,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.warning("Groq summary call failed: %s", e)
        return None


_CHUNK_SYSTEM = """You are an expert summarizer. Given a passage from a book, extract the most important ideas:
1. Main thesis or argument
2. Key concepts and definitions  
3. Important facts, statistics, or evidence
4. Examples or case studies
5. Actionable takeaways
Be concise and faithful to the source. Do not invent content."""

_BOOK_SYSTEM_QUICK = "Produce a 3-5 sentence quick overview based on these section summaries. Focus on the single most important insight from each section."

_BOOK_SYSTEM_DETAILED = "Produce a detailed book summary (400-700 words) covering: main thesis, key ideas per section, important arguments and evidence, and the author's conclusions."

_BOOK_SYSTEM_COMPREHENSIVE = """Produce comprehensive study notes (800-1500 words) covering:
- Main thesis and objectives
- Core concepts and definitions  
- Supporting arguments and reasoning
- Important facts, statistics, and named examples
- Cause-and-effect relationships
- Exceptions and caveats
- Actionable conclusions and takeaways
Preserve specific names, numbers, and examples from the source."""


def generate_summary(book_title: str, sections: list[str], depth: str = "detailed") -> str:
    """
    Generate a summary at the requested depth.
    depth: 'quick' | 'detailed' | 'comprehensive'
    """
    if not sections:
        return f"No content available to summarize for '{book_title}'."

    # Step 1: Summarize each chunk
    chunk_summaries: list[str] = []
    for i, section in enumerate(sections):
        prompt = f"Book: {book_title}\n\nPassage {i + 1}:\n{section[:6000]}"
        summary = _call_groq_summary(prompt, _CHUNK_SYSTEM, max_tokens=500)
        if summary:
            chunk_summaries.append(summary)
        else:
            sentences = re.split(r'(?<=[.!?])\s+', section.strip())
            chunk_summaries.append(" ".join(sentences[:3]))

    # Step 2: Merge into book-level summary
    merged_input = "\n\n---\n\n".join(
        f"Section {i + 1}:\n{s}" for i, s in enumerate(chunk_summaries)
    )

    if depth == "quick":
        system, max_tokens = _BOOK_SYSTEM_QUICK, 300
    elif depth == "comprehensive":
        system, max_tokens = _BOOK_SYSTEM_COMPREHENSIVE, 2000
    else:
        system, max_tokens = _BOOK_SYSTEM_DETAILED, 1000

    prompt = f"Book: {book_title}\n\nSection summaries:\n\n{merged_input[:12000]}"
    final_summary = _call_groq_summary(prompt, system, max_tokens=max_tokens)

    if not final_summary:
        final_summary = f"# {book_title} — Summary\n\n" + "\n\n".join(chunk_summaries[:6])

    return final_summary

