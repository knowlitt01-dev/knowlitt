"""SM-2 spaced repetition algorithm (same scheduling logic as Anki)."""
from dataclasses import dataclass
from datetime import date, timedelta

RESPONSE_QUALITY = {"again": 0, "hard": 3, "good": 4, "easy": 5}


@dataclass
class ReviewStateData:
    ease_factor: float
    interval: int
    repetitions: int
    next_review_date: date


def update_review_state(state: ReviewStateData, response: str) -> ReviewStateData:
    if response not in RESPONSE_QUALITY:
        raise ValueError(f"Invalid response: {response}")

    quality = RESPONSE_QUALITY[response]
    ease = state.ease_factor
    reps = state.repetitions
    interval = state.interval

    if quality < 3:
        reps = 0
        interval = 1
    else:
        if reps == 0:
            interval = 1
        elif reps == 1:
            interval = 6
        else:
            interval = round(interval * ease)
        reps += 1

    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ease = max(1.3, ease)

    return ReviewStateData(
        ease_factor=round(ease, 2),
        interval=interval,
        repetitions=reps,
        next_review_date=date.today() + timedelta(days=interval),
    )
