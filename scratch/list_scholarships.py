import sqlite3
import os

# DB is in the root directory relative to this script
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'scholarships.db')

def list_scholarships():
    print(f"Checking database at: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print("Database file not found!")
        return
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT name FROM scholarships")
    rows = c.fetchall()
    for row in rows:
        print(row[0])
    conn.close()

if __name__ == "__main__":
    list_scholarships()
