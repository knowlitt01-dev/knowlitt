import uuid
from datetime import date, datetime, timezone

from sqlalchemy import (Boolean, Date, DateTime, Float, ForeignKey, Integer,
                         String, Text)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def gen_id() -> str:
    return str(uuid.uuid4())


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    # Trial / subscription
    trial_started_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)
    subscription_status: Mapped[str] = mapped_column(String, default="trialing")  # trialing|active|expired|cancelled
    subscription_plan: Mapped[str | None] = mapped_column(String, nullable=True)
    subscription_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    razorpay_customer_id: Mapped[str | None] = mapped_column(String, nullable=True)
    razorpay_subscription_id: Mapped[str | None] = mapped_column(String, nullable=True)

    # Notification channels (configured but require the account owner's own
    # credentials in .env to actually send — see NOTIFICATIONS.md)
    telegram_chat_id: Mapped[str | None] = mapped_column(String, nullable=True)
    telegram_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    whatsapp_number: Mapped[str | None] = mapped_column(String, nullable=True)
    whatsapp_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    # Kindle: there is no public Amazon API for third-party sync (see
    # KINDLE.md) — this only tracks whether the user has ever imported a
    # My Clippings.txt export, which is the one legitimate integration path.
    kindle_last_imported_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    books: Mapped[list["Book"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String)
    author: Mapped[str | None] = mapped_column(String, nullable=True)
    filename: Mapped[str] = mapped_column(String)
    file_path: Mapped[str | None] = mapped_column(String, nullable=True)  # for cleanup on delete
    # uploading|extracting|ocr_processing|processing|ready|failed
    status: Mapped[str] = mapped_column(String, default="uploading")
    is_scanned: Mapped[bool] = mapped_column(Boolean, default=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_code: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)

    owner: Mapped["User"] = relationship(back_populates="books")
    insights: Mapped[list["Insight"]] = relationship(back_populates="book", cascade="all, delete-orphan")
    flashcards: Mapped[list["Flashcard"]] = relationship(back_populates="book", cascade="all, delete-orphan")


class Insight(Base):
    __tablename__ = "insights"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    book_id: Mapped[str] = mapped_column(String, ForeignKey("books.id"))
    text: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String, default="concept")  # concept|example|quote|framework
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)

    book: Mapped["Book"] = relationship(back_populates="insights")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    book_id: Mapped[str] = mapped_column(String, ForeignKey("books.id"))
    front: Mapped[str] = mapped_column(Text)
    back: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)

    book: Mapped["Book"] = relationship(back_populates="flashcards")
    review_state: Mapped["ReviewState"] = relationship(back_populates="flashcard", uselist=False, cascade="all, delete-orphan")


class ReviewState(Base):
    __tablename__ = "review_state"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    flashcard_id: Mapped[str] = mapped_column(String, ForeignKey("flashcards.id"), unique=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    interval: Mapped[int] = mapped_column(Integer, default=0)
    repetitions: Mapped[int] = mapped_column(Integer, default=0)
    next_review_date: Mapped[date] = mapped_column(Date, default=date.today)

    flashcard: Mapped["Flashcard"] = relationship(back_populates="review_state")


class DailyPackage(Base):
    __tablename__ = "daily_packages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    date: Mapped[date] = mapped_column(Date, default=date.today)
    insight_ids: Mapped[str] = mapped_column(Text)  # comma-separated ids
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    subject: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String, default="open")  # open|in_progress|resolved
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, onupdate=now_utc)

    user: Mapped["User"] = relationship()


class Topic(Base):
    """A followable subject. Created lazily the first time anyone follows or
    searches for it — no hardcoded topic list, per the requirement that this
    not be a fixed set."""
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    follower_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)


class TopicFollow(Base):
    """Join table — one row per (user, topic) they follow. Uniqueness is
    enforced at the API layer (see topics.py) since SQLite's composite
    unique constraints need explicit UniqueConstraint, kept simple here."""
    __tablename__ = "topic_follows"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    topic_id: Mapped[str] = mapped_column(String, ForeignKey("topics.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)

    topic: Mapped["Topic"] = relationship()


class KindleHighlight(Base):
    """A single highlight/note parsed from a user-uploaded My Clippings.txt
    export. This is the only real Kindle integration possible without a
    public Amazon API — see KINDLE.md for why."""
    __tablename__ = "kindle_highlights"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    book_title: Mapped[str] = mapped_column(String)
    book_author: Mapped[str | None] = mapped_column(String, nullable=True)
    highlight_text: Mapped[str] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    highlighted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    imported_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc)


class TopicSearchLog(Base):
    """Every topic search/view, used to compute trending topics from real
    activity instead of a fake/hardcoded trending list."""
    __tablename__ = "topic_search_log"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_id)
    topic_name: Mapped[str] = mapped_column(String, index=True)
    user_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, index=True)
