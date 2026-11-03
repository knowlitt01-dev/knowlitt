"""
Migration: add reading_levels, user_level_progress, book_summaries tables,
and add page_number/source_text columns to flashcards and insights.
Run from the backend folder: python migrate_add_roadmap.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "booktutor.db")

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database file not found at {DB_PATH}, nothing to migrate.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS reading_levels (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL REFERENCES books(id),
            level_index INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            level_type TEXT NOT NULL DEFAULT 'reading',
            xp_points INTEGER NOT NULL DEFAULT 10,
            section_start INTEGER NOT NULL DEFAULT 0,
            section_end INTEGER NOT NULL DEFAULT 0
        )""")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_reading_levels_book_id ON reading_levels(book_id)")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_level_progress (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            book_id TEXT NOT NULL REFERENCES books(id),
            level_id TEXT NOT NULL REFERENCES reading_levels(id),
            state TEXT NOT NULL DEFAULT 'available',
            completed_at TEXT,
            xp_earned INTEGER NOT NULL DEFAULT 0
        )""")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_ulp_user_id ON user_level_progress(user_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_ulp_book_id ON user_level_progress(book_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_ulp_level_id ON user_level_progress(level_id)")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS book_summaries (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL REFERENCES books(id),
            depth TEXT NOT NULL DEFAULT 'detailed',
            content TEXT NOT NULL,
            generated_at TEXT NOT NULL
        )""")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_book_summaries_book_id ON book_summaries(book_id)")

    for tbl, col, ctype in [
        ("flashcards", "page_number", "INTEGER"),
        ("flashcards", "source_text", "TEXT"),
        ("insights", "page_number", "INTEGER"),
        ("insights", "source_text", "TEXT"),
    ]:
        try:
            cur.execute(f"ALTER TABLE {tbl} ADD COLUMN {col} {ctype}")
            print(f"  + {tbl}.{col}")
        except sqlite3.OperationalError:
            print(f"  = {tbl}.{col} already exists")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()

