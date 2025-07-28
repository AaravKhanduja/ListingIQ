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

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        data = response.json()
        if not data.get("results"):
            return None
        return data["results"][0]  # return the first matching listing
