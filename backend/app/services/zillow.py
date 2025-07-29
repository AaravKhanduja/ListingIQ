"""
Zillow API service for fetching property listings and details.

This module provides functions to search for properties and retrieve detailed
property information using the Zillow RapidAPI endpoints.
"""

import os
import httpx
from dotenv import load_dotenv
from typing import Optional, Dict, Any

load_dotenv()

# API Configuration
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = "zillow-com1.p.rapidapi.com"

# API Headers
API_HEADERS = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
}

# HTTP Client Configuration
TIMEOUT = 30.0


async def fetch_zillow_listing(location: str) -> Optional[Dict[str, Any]]:
    """
    Fetch comprehensive Zillow listing information for a given location.

    This function performs a two-step process:
    1. Search for properties by location
    2. Retrieve detailed information for the best match

    Args:
        location: Property address or location string

    Returns:
        Dictionary containing property details or None if not found

    Raises:
        Exception: If API calls fail
    """
    try:
        # Step 1: Search for property
        search_result = await _search_property(location)
        if not search_result:
            print(f"❌ No properties found for location: {location}")
            return None

        # Step 2: Get detailed property information
        property_details = await _get_property_details(search_result)
        if not property_details:
            print("❌ Could not fetch property details, returning search result")
            return search_result

        return property_details

    except Exception as e:
        print(f"🔥 Error fetching Zillow listing: {str(e)}")
        return None


async def _search_property(location: str) -> Optional[Dict[str, Any]]:
    """
    Search for properties by location using the propertyExtendedSearch endpoint.

    Args:
        location: Property address or location string

    Returns:
        Dictionary containing search result or None if not found
    """
    url = f"https://{RAPIDAPI_HOST}/propertyExtendedSearch"

    params = {"location": location, "page": 1, "status_type": "ForSale"}

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url, headers=API_HEADERS, params=params)
            print(f"🌐 Zillow Search URL: {response.url}")
            print(f"📦 Search Status Code: {response.status_code}")

            response.raise_for_status()
            data = response.json()

            if not isinstance(data, list) or len(data) == 0:
                print("❌ No search results found")
                return None

            first_result = data[0]
            address = first_result.get("address", "Unknown address")
            print(f"✅ Found property: {address}")
            return first_result

    except Exception as e:
        print(f"🔥 Error in property search: {str(e)}")
        return None


async def _get_property_details(
    search_result: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Get detailed property information using the propertyDetails endpoint.

    Args:
        search_result: Dictionary containing search result with zpid

    Returns:
        Dictionary containing detailed property information or search result as fallback
    """
    property_id = search_result.get("zpid")
    if not property_id:
        print("❌ No property ID found in search result")
        return search_result

    url = f"https://{RAPIDAPI_HOST}/propertyDetails"
    params = {"zpid": property_id}

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url, headers=API_HEADERS, params=params)
            print(f"🌐 Property Details URL: {response.url}")
            print(f"📦 Details Status Code: {response.status_code}")

            response.raise_for_status()
            details = response.json()

            # Merge search result with detailed information
            merged_result = {**search_result, **details}

            return _extract_property_data(merged_result, property_id)

    except Exception as e:
        print(f"🔥 Error fetching property details: {str(e)}")
        return search_result


def _extract_property_data(
    property_data: Dict[str, Any], property_id: str
) -> Dict[str, Any]:
    """
    Extract and format key property information from API response.

    Args:
        property_data: Raw property data from API
        property_id: Zillow property ID

    Returns:
        Dictionary containing formatted property information
    """
    return {
        "address": property_data.get("address", "Unknown"),
        "description": _extract_description(property_data),
        "price": property_data.get("price"),
        "bedrooms": property_data.get("bedrooms"),
        "bathrooms": property_data.get("bathrooms"),
        "square_feet": property_data.get("square_feet"),
        "lot_size": property_data.get("lot_size"),
        "year_built": property_data.get("year_built"),
        "property_type": property_data.get("property_type"),
        "zpid": property_id,
        "raw_data": property_data,  # Keep raw data for debugging
    }


def _extract_description(property_data: Dict[str, Any]) -> str:
    """
    Extract and format property description from various possible fields.

    Args:
        property_data: Property data dictionary

    Returns:
        Formatted property description string
    """
    description_parts = []

    # Try different possible description fields
    description_fields = [
        "description",
        "homeDescription",
        "propertyDescription",
        "listingDescription",
        "remarks",
        "publicRemarks",
    ]

    for field in description_fields:
        if property_data.get(field):
            description_parts.append(str(property_data[field]))

    # If no description found, create one from available data
    if not description_parts:
        basic_info = []

        if property_data.get("bedrooms"):
            basic_info.append(f"{property_data['bedrooms']} bedroom")
        if property_data.get("bathrooms"):
            basic_info.append(f"{property_data['bathrooms']} bathroom")
        if property_data.get("square_feet"):
            basic_info.append(f"{property_data['square_feet']} sq ft")
        if property_data.get("property_type"):
            basic_info.append(property_data["property_type"])

        if basic_info:
            description_parts.append(f"Property features: {', '.join(basic_info)}")
        else:
            description_parts.append("Property details available upon request.")

    return " ".join(description_parts)


async def fetch_property_by_zpid(zpid: str) -> Optional[Dict[str, Any]]:
    """
    Fetch property details directly by Zillow Property ID (ZPID).

    Args:
        zpid: Zillow Property ID

    Returns:
        Dictionary containing property details or None if not found
    """
    return await _get_property_details({"zpid": zpid})
