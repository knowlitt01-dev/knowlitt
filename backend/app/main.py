import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api import admin, auth, billing, books, daily, drive_import, kindle, notifications, reviews, support, topics
from app.core.config import settings
from app.db.base import Base, engine

logging.basicConfig(level=logging.INFO)

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="BookTutor API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    # Parse the comma-separated env var into a list
    allow_origins=[o.strip() for o in settings.FRONTEND_ORIGIN.split(",") if o.strip()],
    # Also permit any LAN IP (192.168.x.x or 10.x.x.x) so Expo on a real device works
    allow_origin_regex=r"https?://(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(reviews.router)
app.include_router(daily.router)
app.include_router(billing.router)
app.include_router(notifications.router)
app.include_router(support.router)
app.include_router(admin.router)
app.include_router(drive_import.router)
app.include_router(topics.router)
app.include_router(kindle.router)


@app.exception_handler(402)
async def payment_required_handler(request: Request, exc):
    return JSONResponse(status_code=402, content=exc.detail if hasattr(exc, "detail") else {"error": "payment_required"})


@app.get("/health")
def health():
    return {"status": "ok"}
