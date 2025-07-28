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

    zillow_location = listing.get("address", "Unknown location")
    short_desc = listing.get("description", "No description available.")

    # Prompt for GPT-4
    prompt = (
        f"You are a helpful assistant analyzing real estate listings.\n\n"
        f"Listing Address: {zillow_location}\n"
        f"Description: {short_desc}\n\n"
        "Based on this information, return:\n"
        "- A 2-sentence summary\n"
        "- A score from 0 to 100 for investment potential\n"
        "- 3 strengths\n"
        "- 3 weaknesses\n"
        "- 3 hidden issues\n"
        "- 3 follow-up questions\n\n"
        "Respond in valid JSON format:\n"
        "{\n"
        '  "summary": "",\n'
        '  "score": 0,\n'
        '  "strengths": ["", "", ""],\n'
        '  "weaknesses": ["", "", ""],\n'
        '  "hidden_issues": ["", "", ""],\n'
        '  "follow_ups": ["", "", ""]\n'
        "}"
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

        return {
            "location": zillow_location,
            "short_description": short_desc,
            **parsed,  # includes summary, score, strengths, etc.
        }

    except Exception as e:
        return {"error": str(e)}
