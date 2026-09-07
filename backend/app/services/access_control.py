"""Trial + subscription access gating. See BILLING.md for setup."""
from datetime import datetime, timedelta, timezone

from app.models.models import User

TRIAL_DAYS = 7


def _aware(dt: datetime) -> datetime:
    """SQLite sometimes returns naive datetimes; normalize to UTC-aware."""
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def trial_days_remaining(user: User) -> int:
    started = _aware(user.trial_started_at)
    elapsed = datetime.now(timezone.utc) - started
    remaining = TRIAL_DAYS - elapsed.days
    return max(0, remaining)


def has_active_access(user: User) -> bool:
    if user.subscription_status == "active":
        if user.subscription_expires_at is None:
            return True
        return _aware(user.subscription_expires_at) > datetime.now(timezone.utc)

    if user.subscription_status == "trialing":
        return trial_days_remaining(user) > 0

    return False  # expired | cancelled
