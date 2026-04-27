import sqlite3
import os

# DB is in the root directory relative to this script
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'scholarships.db')

names_to_delete = [
    "Legrand Empowering Scholarship Program",
    "Sitaram Jindal Foundation Scholarship",
    "RRD 'We Care' Scholarship for Engineering",
    "Buddy4Study - HDFC Bank Parivartan",
    "Begum Hazrat Mahal National Scholarship",
    "Prime Minister's Scholarship Scheme (PMSS)",
    "Adobe Women-in-Technology Scholarship",
    "LIC HFL Vidyadhan Scholarship",
    "Tata Capital Pankh Scholarship"
]

def delete_scholarships():
    print(f"Connecting to database at: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print("Database file not found!")
        return
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    for name in names_to_delete:
        c.execute("DELETE FROM scholarships WHERE name = ?", (name,))
        if c.rowcount > 0:
            print(f"Deleted: {name}")
        else:
            # Try with --(EXPIRED) just in case
            alt_name = name + "--(EXPIRED)"
            c.execute("DELETE FROM scholarships WHERE name = ?", (alt_name,))
            if c.rowcount > 0:
                print(f"Deleted: {alt_name}")
            else:
                print(f"Not found: {name}")
    
    conn.commit()
    conn.close()
    print("Done.")

if __name__ == "__main__":
    delete_scholarships()
