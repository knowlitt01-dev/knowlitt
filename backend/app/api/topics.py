import re
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.models import Topic, TopicFollow, TopicSearchLog, User

router = APIRouter(prefix="/topics", tags=["topics"])

TRENDING_WINDOW_DAYS = 7
TRENDING_LIMIT = 10


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "topic"


class TopicFollowRequest(BaseModel):
    name: str


def _get_or_create_topic(db: Session, name: str) -> Topic:
    """No hardcoded topic list — a topic is created the first time anyone
    searches for or follows it, per the requirement that this be dynamic."""
    name = name.strip()
    if not name or len(name) > 100:
        raise HTTPException(400, "Topic name must be between 1 and 100 characters")

    slug = _slugify(name)
    topic = db.query(Topic).filter(Topic.slug == slug).first()
    if topic:
        return topic

    topic = Topic(name=name, slug=slug)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.get("/search")
def search_topics(q: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Logs the search (feeds trending) and returns matching existing topics
    plus whether `q` itself would be a valid new topic to follow."""
    q = q.strip()
    if not q:
        return {"results": [], "exact_match": None}

    db.add(TopicSearchLog(topic_name=q, user_id=current_user.id))
    db.commit()

    matches = db.query(Topic).filter(Topic.name.ilike(f"%{q}%")).order_by(Topic.follower_count.desc()).limit(10).all()
    return {
        "results": [{"id": t.id, "name": t.name, "slug": t.slug, "follower_count": t.follower_count} for t in matches],
        "exact_match": next((t.name for t in matches if t.name.lower() == q.lower()), None),
    }


@router.get("/trending")
def trending_topics(db: Session = Depends(get_db)):
    """Computed from real search activity in the trailing window — not a
    hardcoded list. Falls back to most-followed topics if there's not
    enough recent search activity yet (e.g. a fresh install)."""
    since = datetime.now(timezone.utc) - timedelta(days=TRENDING_WINDOW_DAYS)
    rows = (
        db.query(TopicSearchLog.topic_name, func.count(TopicSearchLog.id).label("search_count"))
        .filter(TopicSearchLog.created_at >= since)
        .group_by(TopicSearchLog.topic_name)
        .order_by(func.count(TopicSearchLog.id).desc())
        .limit(TRENDING_LIMIT)
        .all()
    )
    if rows:
        return {"source": "recent_searches", "topics": [{"name": r.topic_name, "search_count": r.search_count} for r in rows]}

    # Fallback: most-followed topics overall, for a fresh install with no search history yet
    top_followed = db.query(Topic).order_by(Topic.follower_count.desc()).limit(TRENDING_LIMIT).all()
    return {
        "source": "most_followed",
        "topics": [{"name": t.name, "follower_count": t.follower_count} for t in top_followed],
    }


@router.post("/follow")
def follow_topic(payload: TopicFollowRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    topic = _get_or_create_topic(db, payload.name)

    existing = db.query(TopicFollow).filter(TopicFollow.user_id == current_user.id, TopicFollow.topic_id == topic.id).first()
    if existing:
        return {"topic_id": topic.id, "name": topic.name, "following": True}

    db.add(TopicFollow(user_id=current_user.id, topic_id=topic.id))
    topic.follower_count += 1
    db.commit()
    return {"topic_id": topic.id, "name": topic.name, "following": True}


@router.delete("/follow/{topic_id}")
def unfollow_topic(topic_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Scoped by user_id — a user can only ever unfollow their own follow
    # record, never someone else's, even if they guess a topic_id + another
    # user's follow relationship.
    follow = db.query(TopicFollow).filter(TopicFollow.user_id == current_user.id, TopicFollow.topic_id == topic_id).first()
    if not follow:
        raise HTTPException(404, "You're not following this topic")

    topic = db.get(Topic, topic_id)
    if topic and topic.follower_count > 0:
        topic.follower_count -= 1

    db.delete(follow)
    db.commit()
    return {"status": "unfollowed", "topic_id": topic_id}


@router.get("/following")
def list_followed_topics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(TopicFollow, Topic)
        .join(Topic, TopicFollow.topic_id == Topic.id)
        .filter(TopicFollow.user_id == current_user.id)
        .order_by(TopicFollow.created_at.desc())
        .all()
    )
    return [
        {"topic_id": t.id, "name": t.name, "slug": t.slug, "follower_count": t.follower_count, "followed_at": f.created_at}
        for f, t in rows
    ]
