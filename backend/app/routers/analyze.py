from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
from typing import Optional

from app.services.zillow import fetch_zillow_listing

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class AnalyzeRequest(BaseModel):
    location: Optional[str] = (
        None  # e.g., "Maywood, NJ" or "123 Spring Valley Rd, Maywood, NJ"
    )
    listing_text: Optional[str] = None  # Direct listing description text
    input_type: Optional[str] = "auto"  # "location", "text", or "auto"


def detect_input_type(location: Optional[str], listing_text: Optional[str]) -> str:
    """Detect the type of input provided"""
    if listing_text and len(listing_text.strip()) > 50:
        return "text"
    elif location and location.strip():
        return "location"
    else:
        return "unknown"


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    # Determine input type
    input_type = request.input_type
    if input_type == "auto":
        input_type = detect_input_type(request.location, request.listing_text)

    if input_type == "unknown":
        return {
            "error": "Please provide either a property location or listing description text."
        }

    # Handle text-based analysis
    if input_type == "text":
        return await analyze_listing_text(request.listing_text)

    # Handle location-based analysis
    elif input_type == "location":
        return await analyze_location(request.location)

    return {"error": "Invalid input type"}


async def analyze_listing_text(listing_text: str):
    """Analyze direct listing text without external API calls"""

    # Prompt for GPT-4 with listing text
    prompt = (
        f"You are a helpful assistant analyzing real estate listings.\n\n"
        f"Listing Description:\n{listing_text}\n\n"
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
                    "content": "You are a helpful real estate assistant. Analyze the provided listing text and provide insights for potential investors.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content.strip()
        parsed = json.loads(content)

        return {
            "location": "Manual Listing Analysis",
            "short_description": listing_text[:200] + "..."
            if len(listing_text) > 200
            else listing_text,
            "input_type": "text",
            **parsed,  # includes summary, score, strengths, etc.
        }

    except Exception as e:
        return {"error": str(e)}


async def analyze_location(location: str):
    """Analyze location using external APIs"""
    listing = await fetch_zillow_listing(location)

    if not listing:
        return {
            "error": "No listing found for that location. Please try another address or paste the full description manually.",
            "suggestion": "You can paste the listing description directly in the text input field.",
        }

    # Extract information from the improved listing data
    zillow_location = listing.get("address", "Unknown location")
    short_desc = listing.get("description", "No description available.")

    # Additional property details for better analysis
    price = listing.get("price")
    bedrooms = listing.get("bedrooms")
    bathrooms = listing.get("bathrooms")
    square_feet = listing.get("square_feet")
    property_type = listing.get("property_type")
    year_built = listing.get("year_built")

    # Create a comprehensive description for GPT analysis
    property_info = f"Address: {zillow_location}\n"
    if price:
        property_info += f"Price: ${price:,}\n"
    if bedrooms:
        property_info += f"Bedrooms: {bedrooms}\n"
    if bathrooms:
        property_info += f"Bathrooms: {bathrooms}\n"
    if square_feet:
        property_info += f"Square Feet: {square_feet:,}\n"
    if property_type:
        property_info += f"Property Type: {property_type}\n"
    if year_built:
        property_info += f"Year Built: {year_built}\n"

    property_info += f"\nDescription: {short_desc}"

    # Enhanced prompt for GPT-4 with more comprehensive property information
    prompt = (
        f"You are a helpful assistant analyzing real estate listings.\n\n"
        f"Property Information:\n{property_info}\n\n"
        "Based on this information, provide a comprehensive analysis including:\n"
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
                    "content": "You are a helpful real estate assistant with expertise in property investment analysis. Consider factors like location, price, property condition, market trends, and investment potential.",
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
            "input_type": "location",
            "property_details": {
                "price": price,
                "bedrooms": bedrooms,
                "bathrooms": bathrooms,
                "square_feet": square_feet,
                "property_type": property_type,
                "year_built": year_built,
            },
            **parsed,  # includes summary, score, strengths, etc.
        }

    except Exception as e:
        return {"error": str(e)}
