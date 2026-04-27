import sqlite3
import os

# DB is in the root directory relative to this script
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'scholarships.db')

def delete_junk():
    print(f"Connecting to database at: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print("Database file not found!")
        return
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute("DELETE FROM scholarships WHERE name = 'Check your Eligibility toScholarships & Loans'")
    if c.rowcount > 0:
        print("Deleted junk entry: Check your Eligibility toScholarships & Loans")
    else:
        print("Junk entry not found.")
    
    conn.commit()
    conn.close()
    print("Done.")

if __name__ == "__main__":
    delete_junk()
