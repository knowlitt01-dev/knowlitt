from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./booktutor.db"
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    GROQ_API_KEY: str = ""
    # Comma-separated list of allowed CORS origins.
    # Covers: Next.js (3000), Expo web bundler (8081), Expo Go / dev-client on device.
    # In production set this env var to your actual domain(s).
    FRONTEND_ORIGIN: str = (
        "http://localhost:3000,"
        "http://localhost:8081,"
        "http://localhost:8082,"
        "http://127.0.0.1:3000,"
        "http://127.0.0.1:8081,"
        "http://127.0.0.1:8082,"
        "exp://localhost:8081,"
        "exp://localhost:8082,"
        "exp://127.0.0.1:8081,"
        "exp://127.0.0.1:8082"
    )
    MAX_UPLOAD_MB: int = 500
    UPLOAD_STORAGE_DIR: str = "./storage/uploads"

    # Telegram (free, no approval needed — get a token from @BotFather)
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_BOT_USERNAME: str = ""

    # WhatsApp (Meta Cloud API — requires business verification + template approval)
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_TEMPLATE_NAME: str = "daily_lesson_ready"

    # Razorpay (subscription billing)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    RAZORPAY_PLAN_ID_MONTHLY: str = ""
    RAZORPAY_PLAN_ID_YEARLY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
