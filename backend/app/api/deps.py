from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.base import get_db
from app.models.models import User
from app.services.access_control import has_active_access, trial_days_remaining

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    user_id = decode_access_token(creds.credentials)
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


def require_active_access(current_user: User = Depends(get_current_user)) -> User:
    """Gate for endpoints that need an active trial or paid subscription.
    Kept separate from get_current_user so auth/billing endpoints themselves
    stay reachable even once a trial has expired."""
    if not has_active_access(current_user):
        raise HTTPException(
            status_code=402,
            detail={
                "error": "trial_expired",
                "message": "Your free trial has ended. Subscribe to keep using BookTutor.",
            },
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return current_user
