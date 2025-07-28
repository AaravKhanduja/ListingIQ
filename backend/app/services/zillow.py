import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = "zillow-com1.p.rapidapi.com"


async def fetch_zillow_listing(location: str):
    url = f"https://{RAPIDAPI_HOST}/propertyExtendedSearch"
    headers = {"X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": RAPIDAPI_HOST}
    params = {"location": location}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)
            print("🌐 Zillow API URL:", response.url)
            print("📦 Status Code:", response.status_code)
            print("📤 Raw Response Text:", response.text[:1000])

            response.raise_for_status()
            data = response.json()

            if not isinstance(data, list) or len(data) == 0:
                print("❌ No listings found.")
                return None

            return data[0]  # ✅ first listing in the list

    except Exception as e:
        print("🔥 Error in Zillow fetch:", str(e))
        return None
