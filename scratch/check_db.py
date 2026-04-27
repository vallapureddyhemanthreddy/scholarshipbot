import sqlite3
import os

DB_PATH = 'scholarships.db'
if not os.path.exists(DB_PATH):
    print("Database not found")
else:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name FROM scholarships ORDER BY id DESC LIMIT 5")
    rows = c.fetchall()
    for row in rows:
        print(row)
    conn.close()
