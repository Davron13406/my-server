import os
from pathlib import Path
from psycopg import connect

url = os.environ.get("DATABASE_URL")
if not url:
    raise SystemExit("DATABASE_URL is missing")
schema = (Path(__file__).parent / "db" / "schema.sql").read_text(encoding="utf-8")
with connect(url, autocommit=True) as conn:
    conn.execute(schema)
print("FitQuest database schema initialized.")
