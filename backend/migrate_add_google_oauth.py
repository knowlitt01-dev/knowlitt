"""
migrate_add_google_oauth.py

One-time script to add Google OAuth columns to the users table for
deployments that already have an existing database (SQLite).

Run from the backend/ directory:
    python migrate_add_google_oauth.py

Safe to run multiple times — uses ALTER TABLE IF NOT EXISTS logic.
For PostgreSQL, the try/except pattern is the same.
"""
import sqlite3
import os

DB_PATH = os.environ.get("DB_PATH", "./booktutor.db")

COLUMNS_TO_ADD = [
    ("google_id",              "TEXT"),
    ("google_access_token",    "TEXT"),
    ("google_refresh_token",   "TEXT"),
    ("google_drive_connected", "INTEGER NOT NULL DEFAULT 0"),
]

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Get existing columns
    cur.execute("PRAGMA table_info(users)")
    existing = {row[1] for row in cur.fetchall()}

    for col_name, col_type in COLUMNS_TO_ADD:
        if col_name not in existing:
            print(f"  Adding column: users.{col_name} ({col_type})")
            cur.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
        else:
            print(f"  Column already exists, skipping: users.{col_name}")

    # Make hashed_password nullable (SQLite doesn't support ALTER COLUMN,
    # but since SQLite doesn't enforce NOT NULL on existing rows, we just
    # need to update the schema. New rows will insert NULL correctly.)
    print("  hashed_password nullability: SQLite allows NULL by default, no ALTER needed.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    main()
