from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

from app.services.zillow import fetch_zillow_listing

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class AnalyzeRequest(BaseModel):
    location: str  # e.g., "Maywood, NJ" or "123 Spring Valley Rd, Maywood, NJ"


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    listing = await fetch_zillow_listing(request.location)

    if not listing:
        return {
            "error": "No listing found for that location. Please try another address or paste the full description manually."
        }

    # Construct GPT-friendly description
    desc = f"""
    Address: {listing.get("address")}
    Price: {listing.get("price")}
    Bedrooms: {listing.get("beds")}
    Bathrooms: {listing.get("baths")}
    Lot Area: {listing.get("lotArea")}
    Type: {listing.get("statusText")}
    Description: {listing.get("description")}
    """

    prompt = (
        f"Analyze the following real estate listing:\n\n{desc}\n\n"
        "Give exactly 3 strengths, 3 weaknesses, 3 hidden issues, and 3 follow-up questions a buyer should ask.\n"
        "Respond in valid JSON with double quotes using this schema:\n"
        '{ "strengths": ["", "", ""], "weaknesses": ["", "", ""], "hidden_issues": ["", "", ""], "follow_ups": ["", "", ""] }'
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful real estate assistant.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content.strip()
        parsed = json.loads(content)
        return parsed

    except Exception as e:
        return {"error": str(e)}
