from fastapi import FastAPI
from app.routers import analyze
import os
from dotenv import load_dotenv
import openai

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

app.include_router(analyze.router, prefix="/api")
