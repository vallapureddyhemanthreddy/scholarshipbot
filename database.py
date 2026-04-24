import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), 'scholarships.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS scholarships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        min_gpa REAL DEFAULT 0,
        max_income REAL DEFAULT 99999999,
        category TEXT DEFAULT 'All',
        gender TEXT DEFAULT 'All',
        state TEXT DEFAULT 'All',
        deadline TEXT,
        amount TEXT,
        link TEXT,
        description TEXT,
        documents_required TEXT,
        course TEXT DEFAULT 'All',
        min_year INTEGER DEFAULT 1,
        max_year INTEGER DEFAULT 5
    )''')

    c.execute("SELECT COUNT(*) FROM scholarships")
    count = c.fetchone()[0]

    if count == 0:
        scholarships = [
            (
                "Central Sector Scheme of Scholarships",
                "Ministry of Education, Government of India",
                8.0, 800000, "All", "All", "All",
                "31 October 2026",
                "₹12,000/year (Fresher) - ₹20,000/year (PG)",
                "https://scholarships.gov.in",
                "For college & university students who scored above 80th percentile in Class XII. Covers first degree courses up to 3 years, B.Tech/BE up to 4 years.",
                "12th Marksheet, Income Certificate, Aadhaar, Bank Passbook, College Enrollment Letter",
                "All", 1, 4
            ),
            (
                "Post Matric Scholarship for SC Students",
                "Ministry of Social Justice & Empowerment",
                0.0, 250000, "SC", "All", "All",
                "15 November 2026",
                "₹570 - ₹1,200/month + maintenance allowance",
                "https://scholarships.gov.in",
                "Scholarship for Scheduled Caste students pursuing post-matriculation or post-secondary courses. Covers tuition fees and maintenance allowance.",
                "Caste Certificate, Income Certificate, Mark Sheets, Aadhaar, Bank Passbook",
                "All", 1, 5
            ),
            (
                "Begum Hazrat Mahal National Scholarship",
                "Maulana Azad Education Foundation",
                5.0, 200000, "All", "Female", "All",
                "30 September 2026",
                "₹5,000 - ₹6,000/year",
                "https://maef.net.in",
                "For meritorious girls from minority communities (Muslim, Christian, Sikh, Buddhist, Zoroastrian, Jain) studying in Class IX to XII and beyond.",
                "Minority Community Certificate, Income Certificate, Mark Sheets, Aadhaar, Bank Account",
                "All", 1, 4
            ),
            (
                "AICTE Pragati Scholarship for Girls",
                "All India Council for Technical Education (AICTE)",
                0.0, 800000, "All", "Female", "All",
                "31 October 2026",
                "₹50,000/year",
                "https://www.aicte-india.org/bureaus/bs/pragati",
                "For girl students pursuing technical education (degree/diploma). One scholarship per family. Covers tuition fee and incidentals.",
                "Aadhaar, Income Certificate, Fee Receipt, Bank Passbook, Enrollment Proof",
                "B.Tech", 1, 4
            ),
            (
                "National Fellowship and Scholarship for Higher Education of ST Students",
                "Ministry of Tribal Affairs",
                0.0, 600000, "ST", "All", "All",
                "31 December 2026",
                "₹3,000 - ₹10,000/month",
                "https://tribal.nic.in",
                "Scholarship for Scheduled Tribe students who have passed class XII and seeking admission in graduation/post-graduation in recognized institutions.",
                "ST Certificate, Income Certificate, Aadhaar, Class XII Marksheet, Bank Passbook",
                "All", 1, 5
            ),
            (
                "Prime Minister's Scholarship Scheme (PMSS)",
                "Ministry of Home Affairs",
                6.0, 999999, "All", "All", "All",
                "31 October 2026",
                "₹2,500 - ₹3,000/month",
                "https://ksb.gov.in/pmss.htm",
                "For wards and widows of Ex-Servicemen/Ex-Coast Guard personnel. Applicable for professional degree courses like B.Tech, MBBS, BDS, BCA, MBA.",
                "Ex-Serviceman Certificate, Mark Sheets, Income Certificate, Bank Passbook, Aadhaar",
                "All", 1, 5
            ),
            (
                "Inspire Scholarship (SHE)",
                "Department of Science & Technology (DST)",
                8.5, 999999, "All", "All", "All",
                "30 November 2026",
                "₹80,000/year + ₹20,000 mentorship grant",
                "https://online-inspire.gov.in",
                "Scholarship for Excellence in Science & Technology. For students who scored top 1% in Class XII and pursuing Natural/Basic Sciences at B.Sc/B.S/Integrated M.Sc level.",
                "Class XII Marksheet, Merit Certificate, Aadhaar, Bank Passbook",
                "B.Sc", 1, 3
            ),
            (
                "Vidyasaarathi Scholarship",
                "National Securities Depository Limited (NSDL)",
                7.0, 600000, "All", "All", "All",
                "Rolling Deadline",
                "₹10,000 - ₹50,000/year",
                "https://www.vidyasaarathi.co.in",
                "Multiple scholarships for students from economically weaker sections pursuing professional courses. Several corporate-sponsored schemes available.",
                "Income Certificate, Mark Sheets, Aadhaar, Bank Passbook, Enrollment Letter",
                "All", 1, 4
            ),
            (
                "Post Matric Scholarship for OBC Students",
                "Ministry of Social Justice & Empowerment",
                0.0, 100000, "OBC", "All", "All",
                "31 October 2026",
                "₹350 - ₹1,000/month + tuition fee",
                "https://scholarships.gov.in",
                "Financial assistance to OBC students for pursuing post-matriculation or post-secondary education. State-wise implementation.",
                "OBC Certificate, Income Certificate, Mark Sheets, Aadhaar, Bank Passbook",
                "All", 1, 5
            ),
            (
                "Ishan Uday Special Scholarship for North East",
                "University Grants Commission (UGC)",
                7.5, 450000, "All", "All", "North East",
                "30 September 2026",
                "₹5,400 - ₹7,800/month",
                "https://ishan.ugc.ac.in",
                "For students domiciled in North Eastern states pursuing general degree courses, technical and professional courses from recognized institutions.",
                "Domicile Certificate of NE State, Income Certificate, Mark Sheets, Aadhaar",
                "All", 1, 4
            ),
            (
                "Reliance Foundation Undergraduate Scholarships",
                "Reliance Foundation",
                7.5, 300000, "All", "All", "All",
                "30 November 2026",
                "₹2,00,000 over 4 years",
                "https://www.reliancefoundation.org/scholarships",
                "For meritorious students from low-income families pursuing UG courses in STEM or Arts/Humanities. Includes academic excellence and leadership modules.",
                "Income Certificate, Mark Sheets, Aadhaar, Enrollment Letter, Bank Account",
                "All", 1, 1
            ),
            (
                "HDFC Bank Parivartan's ECS Scholarship",
                "HDFC Bank",
                6.0, 250000, "All", "All", "All",
                "31 August 2026",
                "₹75,000/year",
                "https://www.buddy4study.com/page/hdfc-bank-parivartans-ecs-scholarship",
                "For meritorious students from economically disadvantaged families. Covers education costs including tuition, hostel, and other fees.",
                "Income Certificate, Mark Sheets, Aadhaar, Fee Structure, Bank Account",
                "All", 1, 4
            ),
            (
                "Tata Capital Pankh Scholarship",
                "Tata Capital",
                6.0, 250000, "All", "All", "All",
                "15 October 2026",
                "Up to ₹50,000/year",
                "https://www.buddy4study.com/page/tata-capital-pankh-scholarship-programme",
                "Supporting meritorious students from financially weaker sections to pursue professional courses. Available for both UG and diploma students.",
                "Income Certificate, Mark Sheets, Aadhaar, College ID, Bank Passbook",
                "All", 1, 4
            ),
            (
                "Maulana Azad National Fellowship",
                "Ministry of Minority Affairs",
                0.0, 600000, "All", "All", "All",
                "31 December 2026",
                "₹25,000 - ₹28,000/month (PhD) + contingency grant",
                "https://maef.net.in",
                "For minority community students (Muslim, Christian, Buddhist, Sikh, Zoroastrian, Jain) pursuing M.Phil and PhD in Indian universities.",
                "Minority Certificate, Aadhaar, NET/JRF Score, Bank Account, Enrollment Letter",
                "PhD", 1, 5
            ),
            (
                "Sitaram Jindal Foundation Scholarship",
                "Sitaram Jindal Foundation",
                6.5, 400000, "All", "All", "All",
                "31 December 2026",
                "₹500 - ₹2,500/month",
                "https://www.sitaramjindalfoundation.org/scholarships-for-students-in-bangalore-india.php",
                "For students pursuing higher education in various fields. Merit-cum-means scholarship for UG/PG students.",
                "Income Certificate, Mark Sheets, Aadhaar, Bank Account, Fee Receipt",
                "All", 1, 4
            ),
            (
                "Buddy4Study - HDFC Bank Parivartan",
                "HDFC Bank & Buddy4Study",
                6.0, 250000, "All", "All", "All",
                "30 September 2026",
                "Up to ₹75,000",
                "https://www.buddy4study.com",
                "Part of HDFC Bank's CSR initiative to support students from underprivileged backgrounds.",
                "Income Certificate, Mark Sheets, Aadhaar, Proof of Admission",
                "All", 1, 3
            ),
            (
                "L'Oréal India For Young Women In Science Scholarship",
                "L'Oréal India",
                8.5, 600000, "All", "Female", "All",
                "15 October 2026",
                "₹2,50,000 for graduation",
                "https://www.for-young-women-in-science.co.in",
                "To support young women who want to pursue higher education in any scientific field.",
                "12th Marksheet, Income Certificate, Age Proof, Admission Letter",
                "B.Sc", 1, 1
            ),
            (
                "LIC HFL Vidyadhan Scholarship",
                "LIC Housing Finance Limited",
                6.0, 360000, "All", "All", "All",
                "30 September 2026",
                "₹10,000 - ₹20,000/year",
                "https://www.lichousing.com",
                "For students from Class 10 to PG level. Priority given to students who lost breadwinners.",
                "Income Certificate, Mark Sheets, Aadhaar, Bank Account",
                "All", 1, 3
            ),
            (
                "Adobe Women-in-Technology Scholarship",
                "Adobe India",
                8.0, 9999999, "All", "Female", "All",
                "30 November 2026",
                "Tuition fee + Internship opportunity",
                "https://www.adobe.com/in/university-relations/scholarship.html",
                "To recognize outstanding female students in the field of Computer Science/Engineering.",
                "Resume, Transcripts, Recommendation Letters, Essay",
                "B.Tech", 2, 4
            ),
            (
                "Google Generation Scholarship (Asia Pacific)",
                "Google",
                8.5, 9999999, "All", "Female", "All",
                "March 2026",
                "$1,000 USD",
                "https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship-apac/",
                "Supporting female students in computer science to excel in technology and become leaders.",
                "Resume, Transcripts, Essay, Coding Assessment",
                "B.Tech", 1, 2
            ),
            (
                "Kotak Kanya Scholarship",
                "Kotak Education Foundation",
                7.5, 320000, "All", "Female", "All",
                "30 September 2026",
                "₹1,50,000/year",
                "https://kotakeducation.org/kotak-kanya-scholarship/",
                "Support meritorious girl students from underprivileged families for professional graduation.",
                "Income Certificate, Mark Sheets, Fee Receipt, IT Return/Form 16",
                "B.Tech", 1, 1
            ),
            (
                "NSP Pre-Matric Scholarship for Minorities",
                "Ministry of Minority Affairs",
                5.0, 100000, "All", "All", "All",
                "15 November 2026",
                "₹1,000 - ₹5,000/year",
                "https://scholarships.gov.in",
                "For students from minority communities (Muslim, Christian, Sikh, etc.) studying in Class 1 to 10.",
                "Minority Certificate, Income Certificate, Marksheet, Aadhaar",
                "All", 1, 1
            ),
            (
                "Tata Trust Medical and Healthcare Scholarships",
                "Tata Trusts",
                6.5, 500000, "All", "All", "All",
                "November 2026",
                "Covers tuition fees",
                "https://www.tatatrusts.org",
                "For students pursuing undergraduate or postgraduate medical/healthcare courses.",
                "Marksheets, Fee Receipt, Income Proof, Aadhaar",
                "MBBS", 1, 5
            ),
            (
                "ONGC Scholarship for SC/ST Students",
                "ONGC Foundation",
                6.0, 450000, "SC/ST", "All", "All",
                "October 2026",
                "₹48,000/year",
                "https://www.ongcscholar.org",
                "For SC/ST students pursuing professional courses in Engineering, MBBS, MBA, or Geology.",
                "Caste Certificate, Income Certificate, Marksheets, Aadhaar",
                "B.Tech", 1, 1
            ),
            (
                "Keep India Smiling Foundational Scholarship",
                "Colgate-Palmolive (India) Ltd",
                6.0, 500000, "All", "All", "All",
                "30 June 2026",
                "₹30,000/year for 4 years",
                "https://www.buddy4study.com/page/keep-india-smiling-foundational-scholarship-programme",
                "Open for students enrolled in any recognized engineering degree (B.Tech/B.E). Focus on providing foundational support to meritorious students.",
                "Income Certificate, Class 12 Marksheet, Fee Receipt, Aadhaar",
                "B.Tech", 1, 1
            ),
            (
                "Samsung Star Scholar Programme",
                "Samsung India",
                6.0, 600000, "All", "All", "All",
                "15 July 2026",
                "Up to ₹2,00,000/year (Covers full tuition)",
                "https://www.samsung.com/in/microsite/sapne-hue-bade/star-scholar/",
                "Exclusive scholarship for students graduating from Jawahar Navodaya Vidyalaya (JNV) schools, currently pursuing B.Tech/Dual Degree at NITs/IITs.",
                "JNV Certificate, JEE Advanced/Main Rank Card, Income Certificate",
                "B.Tech", 1, 4
            ),
            (
                "Cognizant Vidyadhan Scholarship",
                "Cognizant Foundation",
                7.5, 300000, "All", "All", "All",
                "31 May 2026",
                "₹60,000/year",
                "https://www.vidyadhan.org/apply",
                "Aimed at supporting exceptionally bright students from economically challenged families who have completed 12th grade and wish to pursue Engineering.",
                "Class 10/12 Marksheets, Income Certificate, Photograph",
                "B.Tech", 1, 1
            ),
            (
                "RRD 'We Care' Scholarship for Engineering",
                "RR Donnelley",
                6.5, 500000, "All", "All", "All",
                "15 June 2026",
                "₹50,000/year",
                "https://www.buddy4study.com/page/rrd-we-care-scholarship",
                "CSR initiative to support students pursuing B.E./B.Tech courses, specifically targeting those from marginalized backgrounds to complete their degree.",
                "Admission Letter, Income Proof, Aadhaar, Bank Details",
                "B.Tech", 1, 4
            ),
            (
                "Foundation For Excellence (FFE) Scholarship",
                "FFE India Trust",
                7.0, 300000, "All", "All", "All",
                "31 August 2026",
                "₹40,000/year",
                "https://ffe.org/apply/",
                "Awarded to academically gifted but financially constrained students enrolled in 1st year B.Tech/B.E/MBBS. Requires excellent entrance exam ranks.",
                "Rank Card (State/National), Income Certificate, 12th Marksheet",
                "B.Tech", 1, 1
            ),
            (
                "Santoor Women's Scholarship",
                "Wipro Cares",
                6.0, 9999999, "All", "Female", "Andhra Pradesh",
                "31 August 2026",
                "₹24,000/year",
                "https://www.santoorscholarships.com/",
                "Exclusively for young women from AP, Telangana, and Karnataka who have completed 12th from a local government school and are pursuing professional degrees like Engineering.",
                "Govt School Pass Certificate, Aadhaar, College ID",
                "B.Tech", 1, 4
            ),
            (
                "Nikon Scholarship Program",
                "Nikon India",
                6.0, 600000, "All", "All", "All",
                "31 May 2026",
                "₹1,00,000",
                "https://www.buddy4study.com/page/nikon-scholarship-program",
                "Aimed at empowering students pursuing photography-related courses or professional degree courses including B.Tech. Strong preference for technical innovation.",
                "Class 12 Marksheet, Income Certificate, ID Proof",
                "B.Tech", 1, 4
            ),
            (
                "Legrand Empowering Scholarship Program",
                "Legrand",
                7.0, 500000, "All", "Female", "All",
                "15 July 2026",
                "60% of tuition fee or ₹60,000/year",
                "https://www.legrand.co.in/empowering-scholarship",
                "Designed for meritorious girl students, specially-abled students, and transgender students pursuing B.Tech, B.Arch, or other technical degrees.",
                "Income Certificate, Class 10/12 Marksheets, College Fee Receipt",
                "B.Tech", 1, 4
            ),
            (
                "JSW UDAAN Scholarship for Engineering",
                "JSW Foundation",
                6.0, 800000, "All", "All", "All",
                "30 June 2026",
                "Up to ₹50,000",
                "https://www.vidyasaarathi.co.in/Vidyasaarathi/scholarship",
                "Encouraging youth residing near JSW plant locations (and open pan-India) to pursue undergraduate technical education.",
                "Domicile Certificate, Income Proof, Admission Letter, Marksheets",
                "B.Tech", 1, 4
            ),
            (
                "Mi Scholarship for Higher Education",
                "Xiaomi India",
                7.0, 300000, "All", "All", "All",
                "31 May 2026",
                "₹5,800 to ₹10,000",
                "https://www.buddy4study.com/page/mi-scholarship",
                "Financial assistance for Class 11, 12, and undergraduate students (including B.Tech) to ensure continuity in education without financial burden.",
                "Income Certificate, Previous Year Marksheet, Bank Passbook",
                "B.Tech", 1, 4
            ),
        ]


        c.executemany('''INSERT INTO scholarships 
            (name, provider, min_gpa, max_income, category, gender, state, deadline, amount, link, description, documents_required, course, min_year, max_year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', scholarships)

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'User'
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS user_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        scholarship_id INTEGER NOT NULL,
        status TEXT DEFAULT 'Saved',
        added_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(scholarship_id) REFERENCES scholarships(id)
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')

    c.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
                  ('admin', 'admin@scholarbot.com', generate_password_hash('admin'), 'Admin'))

    conn.commit()
    conn.close()

def get_all_scholarships_summary():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id, name, provider, amount, category, gender, state FROM scholarships")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_scholarships_full():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM scholarships ORDER BY id")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_scholarship_by_id(sid, data):
    conn = get_db()
    c = conn.cursor()
    c.execute('''UPDATE scholarships SET
        name=?, provider=?, min_gpa=?, max_income=?, category=?, gender=?,
        state=?, deadline=?, amount=?, link=?, description=?, documents_required=?,
        course=?, min_year=?, max_year=?
        WHERE id=?''', (
            data.get('name'), data.get('provider'),
            float(data.get('min_gpa') or 0), float(data.get('max_income') or 99999999),
            data.get('category', 'All'), data.get('gender', 'All'), data.get('state', 'All'),
            data.get('deadline', ''), data.get('amount', ''), data.get('link', ''),
            data.get('description', ''), data.get('documents_required', ''),
            data.get('course', 'All'), int(data.get('min_year') or 1), int(data.get('max_year') or 5),
            sid
        ))
    conn.commit()
    conn.close()


def match_scholarships(user_profile):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM scholarships")
    all_scholarships = c.fetchall()
    conn.close()

    matches = []
    gpa = user_profile.get('gpa', 0)
    income = user_profile.get('income', 999999)
    category = user_profile.get('category', 'General')
    gender = user_profile.get('gender', 'Male')
    state = user_profile.get('state', '')
    course = user_profile.get('course', '')
    year = user_profile.get('year', 1)

    for s in all_scholarships:
        reasons = []
        eligible = True

        if gpa < s['min_gpa']:
            eligible = False
        else:
            if s['min_gpa'] > 0:
                reasons.append(f"✅ GPA {gpa}/10 meets minimum {s['min_gpa']}/10")

        if income > s['max_income']:
            eligible = False
        else:
            if s['max_income'] < 99999999:
                inc_lakh = round(s['max_income'] / 100000, 1)
                reasons.append(f"✅ Income within ₹{inc_lakh}L limit")

        sch_category = s['category']
        if sch_category != 'All':
            if sch_category != category:
                eligible = False
            else:
                reasons.append(f"✅ {category} category eligible")

        sch_gender = s['gender']
        if sch_gender != 'All':
            if sch_gender != gender:
                eligible = False
            else:
                reasons.append(f"✅ Open for {gender} students")

        sch_state = s['state']
        if sch_state not in ('All', 'North East'):
            if state.lower() != sch_state.lower():
                eligible = False
            else:
                reasons.append(f"✅ Available in {state}")
        elif sch_state == 'North East':
            ne_states = ['Assam', 'Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Tripura', 'Arunachal Pradesh', 'Sikkim']
            if state not in ne_states:
                eligible = False
            else:
                reasons.append(f"✅ NE state domicile qualifies")

        sch_course = s['course']
        if sch_course != 'All' and course:
            if sch_course.lower() not in course.lower() and course.lower() not in sch_course.lower():
                eligible = False
            else:
                reasons.append(f"✅ Available for {course} students")

        if not (s['min_year'] <= year <= s['max_year']):
            eligible = False

        if eligible:
            # Calculate Match Score (%)
            score = 70 # Base score for being eligible
            
            # GPA Bonus (Up to +15%)
            if s['min_gpa'] > 0:
                diff = gpa - s['min_gpa']
                score += min(15, int(diff * 5))
            
            # Income Bonus (Up to +15% for very low income)
            if s['max_income'] < 99999999:
                ratio = income / s['max_income']
                if ratio < 0.3: score += 15
                elif ratio < 0.6: score += 10
                elif ratio < 0.8: score += 5
            
            # State/Gender focus bonus
            if s['state'] != 'All': score += 5
            if s['gender'] != 'All': score += 5
            
            score = min(98, score) # Cap at 98%
            
            reasons.insert(0, f"🔥 {score}% Match Strength")

            matches.append({
                'id': s['id'],
                'name': s['name'],
                'provider': s['provider'],
                'amount': s['amount'],
                'deadline': s['deadline'],
                'link': s['link'],
                'description': s['description'],
                'documents_required': s['documents_required'],
                'reasons': reasons,
                'score': score
            })

    # Sort matches by score descending
    matches.sort(key=lambda x: x['score'], reverse=True)
    return matches

def create_user(username, email, password):
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'User')", 
                  (username, email, generate_password_hash(password)))
        conn.commit()
        success = True
    except sqlite3.IntegrityError:
        success = False # email already exists
    conn.close()
    return success

def get_user_by_email(email):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()
    return dict(user) if user else None

def verify_user(email, password):
    user = get_user_by_email(email)
    if user and check_password_hash(user['password_hash'], password):
        return user
    return None

def add_new_scholarship(data):
    conn = get_db()
    c = conn.cursor()
    c.execute('''INSERT INTO scholarships 
        (name, provider, min_gpa, max_income, category, gender, state, deadline, amount, link, description, documents_required, course, min_year, max_year)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
            data.get('name'), data.get('provider'), float(data.get('min_gpa') or 0), 
            float(data.get('max_income') or 99999999), data.get('category', 'All'), 
            data.get('gender', 'All'), data.get('state', 'All'), data.get('deadline', ''),
            data.get('amount', ''), data.get('link', ''), data.get('description', ''), 
            data.get('documents_required', ''), data.get('course', 'All'), 
            int(data.get('min_year') or 1), int(data.get('max_year') or 5)
        ))
    conn.commit()
    conn.close()

def delete_scholarship_by_id(sid):
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM scholarships WHERE id = ?", (sid,))
    conn.commit()
    conn.close()

# ── USER APPLICATIONS TRACKING ──
def track_scholarship(user_id, scholarship_id, status='Saved'):
    conn = get_db()
    c = conn.cursor()
    # Check if exists
    c.execute("SELECT id FROM user_applications WHERE user_id=? AND scholarship_id=?", (user_id, scholarship_id))
    row = c.fetchone()
    if row:
        c.execute("UPDATE user_applications SET status=? WHERE id=?", (status, row['id']))
    else:
        c.execute("INSERT INTO user_applications (user_id, scholarship_id, status) VALUES (?, ?, ?)", 
                  (user_id, scholarship_id, status))
    conn.commit()
    conn.close()

def get_tracked_scholarships(user_id):
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        SELECT a.id as track_id, a.status, a.added_on, s.* 
        FROM user_applications a
        JOIN scholarships s ON a.scholarship_id = s.id
        WHERE a.user_id = ?
        ORDER BY a.added_on DESC
    ''', (user_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── NOTIFICATIONS ──
def add_notification(user_id, message, ntype='info'):
    conn = get_db()
    c = conn.cursor()
    # Prevent duplicate identical messages for same user within 24 hours
    c.execute("SELECT id FROM notifications WHERE user_id=? AND message=? AND created_at > datetime('now', '-1 day')", (user_id, message))
    if not c.fetchone():
        c.execute("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)", (user_id, message, ntype))
        conn.commit()
    conn.close()

def get_notifications(user_id, limit=10):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT ?", (user_id, limit))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def mark_notifications_read(user_id):
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE notifications SET is_read=1 WHERE user_id=?", (user_id,))
    conn.commit()
    conn.close()


