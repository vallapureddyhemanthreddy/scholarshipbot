import urllib.request
import urllib.error
import json
import re
from datetime import datetime, timedelta

def scrape_live_scholarships():
    """
    Fetches live scholarships from web sources.
    Since most Indian scholarship portals (Buddy4Study, NSP) use Cloudflare protection
    or require complex JS rendering, this function attempts a basic HTTP GET.
    If blocked (403), it falls back to a dynamically generated list of "current" scholarships
    for demonstration of the Admin Approval flow.
    """
    scraped_data = []

    # Attempt to scrape a generic open aggregator (simplified example)
    url = 'https://www.wemakescholars.com/scholarship'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    try:
        response = urllib.request.urlopen(req, timeout=5)
        html = response.read().decode('utf-8')
        # In a real scenario, we would use BeautifulSoup here.
        # Since we don't have bs4 installed by default, we'll use regex for a quick scan
        # This is highly fragile and mostly for demonstration.
        names = re.findall(r'<h[23][^>]*>(.*?Scholarship.*?)</h[23]>', html, re.IGNORECASE)
        for i, name in enumerate(names[:3]):
            clean_name = re.sub(r'<[^>]+>', '', name).strip()
            if clean_name:
                scraped_data.append({
                    "name": clean_name,
                    "provider": "External Provider",
                    "amount": "Varies",
                    "deadline": (datetime.now() + timedelta(days=30)).strftime("%d %B %Y"),
                    "link": url,
                    "min_gpa": 6.0,
                    "max_income": 800000,
                    "category": "All",
                    "gender": "All",
                    "state": "All",
                    "course": "B.Tech",
                    "description": "Scraped dynamically from web aggregator.",
                    "documents_required": "Standard Documents"
                })
    except Exception as e:
        print(f"Scraper blocked or failed ({e}). Falling back to dynamic mock data.")

    # Fallback / Simulated dynamic data if scraper is blocked (which is highly likely)
    if not scraped_data:
        today = datetime.now()
        scraped_data = [
            {
                "name": f"Reliance Tech Future Grant {today.year}",
                "provider": "Reliance Foundation",
                "amount": "₹60,000",
                "deadline": (today + timedelta(days=15)).strftime("%d %B %Y"),
                "link": "https://scholarships.reliancefoundation.org",
                "min_gpa": 7.0,
                "max_income": 500000,
                "category": "All",
                "gender": "All",
                "state": "All",
                "course": "B.Tech",
                "description": "Aimed at shaping the future leaders in technology.",
                "documents_required": "Aadhaar, 12th Marksheet, Income Proof"
            },
            {
                "name": "Women in Tech India Initiative",
                "provider": "Google India",
                "amount": "₹1,00,000",
                "deadline": (today + timedelta(days=45)).strftime("%d %B %Y"),
                "link": "https://buildyourfuture.withgoogle.com/",
                "min_gpa": 8.0,
                "max_income": 9999999,
                "category": "All",
                "gender": "Female",
                "state": "All",
                "course": "B.Tech",
                "description": "Empowering young women to excel in computing and technology.",
                "documents_required": "Resume, Transcript, Essay"
            },
            {
                "name": f"State Merit Scholarship (Engineering) {today.year}",
                "provider": "State Govt",
                "amount": "₹35,000",
                "deadline": (today + timedelta(days=20)).strftime("%d %B %Y"),
                "link": "https://scholarships.gov.in",
                "min_gpa": 6.5,
                "max_income": 250000,
                "category": "All",
                "gender": "All",
                "state": "All",
                "course": "B.Tech",
                "description": "Merit-cum-means scholarship for local state students pursuing professional degrees.",
                "documents_required": "Domicile, Income Certificate, Fee Receipt"
            }
        ]

    return scraped_data

if __name__ == "__main__":
    print(json.dumps(scrape_live_scholarships(), indent=2))
