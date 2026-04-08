import requests

def fetch_aqi_data(city="Delhi"):

    url = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"

    params = {
        "format": "json",
        "limit": 1000
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        records = data.get("records", [])

        for r in records:
            if r.get("city", "").lower() == city.lower():
                pm25 = r.get("pm2_5")
                if pm25 in (None, ""):
                    return None
                return float(pm25)

    except Exception as e:
        print("AQI Fetch Error:", e)

    return None
    
