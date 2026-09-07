"""
Local-disk file storage for uploaded documents, streamed to disk in chunks
rather than loaded fully into memory — this matters once uploads can be
hundreds of MB (see MAX_UPLOAD_MB). Storage is private: files live outside
any static/public directory and are only ever served back through an
authenticated, ownership-checked endpoint (see books.py) — never a raw
public URL.

Note: this is local filesystem storage, appropriate for a single-server
deployment. Multi-server or serverless deployments would need this swapped
for object storage (S3/GCS/R2) — the function signatures here are written
so that swap only touches this one file, not the callers.
"""
import logging
import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings

logger = logging.getLogger("booktutor.file_storage")

CHUNK_SIZE = 1024 * 1024  # 1MB read chunks while streaming to disk


class UploadTooLarge(Exception):
    def __init__(self, limit_mb: int):
        self.limit_mb = limit_mb
        super().__init__(f"File exceeds {limit_mb}MB limit.")


def _storage_dir() -> Path:
    path = Path(settings.UPLOAD_STORAGE_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def save_upload_streamed(file: UploadFile, user_id: str) -> tuple[str, int]:
    """Streams an UploadFile to disk in chunks, enforcing the size limit
    during the stream (not after fully buffering it in memory). Returns
    (file_path, size_bytes). Raises UploadTooLarge if the limit is exceeded
    partway through — the partial file is cleaned up before raising."""
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    user_dir = _storage_dir() / user_id
    user_dir.mkdir(parents=True, exist_ok=True)

    # Random filename on disk — never trust the client-supplied filename for
    # the actual path (path traversal defense); original name is kept only
    # as display metadata in the DB.
    safe_name = f"{uuid.uuid4()}.pdf"
    dest_path = user_dir / safe_name

    total = 0
    try:
        with open(dest_path, "wb") as out:
            while chunk := file.file.read(CHUNK_SIZE):
                total += len(chunk)
                if total > max_bytes:
                    raise UploadTooLarge(settings.MAX_UPLOAD_MB)
                out.write(chunk)
    except UploadTooLarge:
        dest_path.unlink(missing_ok=True)
        raise
    except Exception:
        dest_path.unlink(missing_ok=True)
        raise

    return str(dest_path), total


def read_file_bytes(file_path: str) -> bytes:
    with open(file_path, "rb") as f:
        return f.read()


def delete_file(file_path: str | None) -> None:
    """Best-effort delete — a missing file is not an error (e.g. if it was
    already cleaned up, or predates this storage system)."""
    if not file_path:
        return
    try:
        Path(file_path).unlink(missing_ok=True)
    except Exception:
        logger.warning("Failed to delete file at %s (non-fatal)", file_path, exc_info=True)


def path_belongs_to_user(file_path: str, user_id: str) -> bool:
    """Defense-in-depth check: confirms a stored file_path actually lives
    under this user's storage subdirectory before any read/delete — even
    though the DB row is already scoped by user_id, this catches the case
    of a file_path ever being manipulated or mismatched."""
    try:
        resolved = Path(file_path).resolve()
        expected_prefix = (_storage_dir() / user_id).resolve()
        return resolved.is_relative_to(expected_prefix)
    except Exception:
        return False
