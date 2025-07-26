from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analyze

import os
from dotenv import load_dotenv

import openai

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
