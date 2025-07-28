from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class AnalyzeRequest(BaseModel):
    description: str


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    prompt = (
        f"Given this real estate listing: '{request.description}', "
        "what are the 3 key strengths, 3 weaknesses, 3 hidden issues, and 3 follow-up questions a buyer should ask?\n\n"
        "You MUST respond in raw JSON format with double quotes and keys as:\n"
        '{ "strengths": [...], "weaknesses": [...], "hidden_issues": [...], "follow_ups": [...] }'
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content.strip()

        # Try to parse the response to JSON
        parsed = json.loads(content)
        return parsed

    except Exception as e:
        return {"error": str(e)}
