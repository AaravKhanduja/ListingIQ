"""
LLM Service for ListingIQ
Supports both Ollama (dev) and OpenAI (prod) based on environment configuration
"""

import os
import json
from typing import Dict, Any, Optional
import openai
import ollama
from enum import Enum


class LLMProvider(Enum):
    OLLAMA = "ollama"
    OPENAI = "openai"


class LLMService:
    """Service for LLM interactions with fallback support"""

    def __init__(self):
        self.provider = self._get_provider()
        self.model = self._get_model()
        self.environment = self._get_environment_info()

        # Initialize clients based on provider
        if self.provider == LLMProvider.OPENAI:
            self.openai_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        elif self.provider == LLMProvider.OLLAMA:
            # Ollama client is synchronous, we'll handle async in the methods
            pass

        print(
            f"{self.environment} - Using {self.provider.value.upper()} with model: {self.model}"
        )

    def _get_provider(self) -> LLMProvider:
        """Determine which LLM provider to use"""
        # Check environment variable first
        provider_env = os.getenv("LLM_PROVIDER", "").lower()

        if provider_env == "ollama":
            return LLMProvider.OLLAMA
        elif provider_env == "openai":
            return LLMProvider.OPENAI

        # Auto-detect based on environment
        if os.getenv("ENVIRONMENT", "").lower() == "production":
            # Production: Use OpenAI if API key is available
            if os.getenv("OPENAI_API_KEY"):
                return LLMProvider.OPENAI
            else:
                print(
                    "⚠️ Warning: Production environment detected but no OpenAI API key found"
                )
                return LLMProvider.OLLAMA
        else:
            # Development: Default to Ollama
            return LLMProvider.OLLAMA

    def _get_model(self) -> str:
        """Get the model name based on provider"""
        if self.provider == LLMProvider.OPENAI:
            return os.getenv("OPENAI_MODEL", "gpt-4")
        elif self.provider == LLMProvider.OLLAMA:
            return os.getenv("OLLAMA_MODEL", "llama3.2:3b")

    def _get_environment_info(self) -> str:
        """Get environment information for logging"""
        env = os.getenv("ENVIRONMENT", "development").lower()
        if env == "production":
            return "🚀 PRODUCTION"
        else:
            return "🔧 DEVELOPMENT"

    async def generate_analysis(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate property analysis using the configured LLM provider"""
        try:
            if self.provider == LLMProvider.OPENAI:
                return await self._generate_openai(prompt)
            elif self.provider == LLMProvider.OLLAMA:
                return await self._generate_ollama(prompt)
        except Exception as e:
            print(f"❌ LLM generation error ({self.provider.value}): {e}")
            return None

    async def _generate_openai(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate analysis using OpenAI"""
        try:
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert real estate investment analyst with decades of experience evaluating properties across all markets. You excel at identifying key strengths, potential weaknesses, hidden risks, and critical questions that buyers should ask. Your analysis is always data-driven, practical, and actionable. You focus on providing insights that help investors make informed decisions.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=2000,
            )

            analysis_text = response.choices[0].message.content.strip()
            return self._parse_json_response(analysis_text)

        except Exception as e:
            print(f"❌ OpenAI API error: {e}")
            return None

    async def _generate_ollama(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate analysis using Ollama"""
        try:
            # Ollama is synchronous, so we run it in a thread
            import asyncio

            def _ollama_generate():
                response = ollama.chat(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert real estate investment analyst with decades of experience evaluating properties across all markets. You excel at identifying key strengths, potential weaknesses, hidden risks, and critical questions that buyers should ask. Your analysis is always data-driven, practical, and actionable. You focus on providing insights that help investors make informed decisions.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    options={"temperature": 0.3, "num_predict": 2000},
                )
                return response["message"]["content"]

            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            analysis_text = await loop.run_in_executor(None, _ollama_generate)

            return self._parse_json_response(analysis_text)

        except Exception as e:
            print(f"❌ Ollama API error: {e}")
            return None

    def _parse_json_response(self, analysis_text: str) -> Optional[Dict[str, Any]]:
        """Parse JSON from LLM response"""
        try:
            # Look for JSON in the response
            json_start = analysis_text.find("{")
            json_end = analysis_text.rfind("}") + 1

            if json_start != -1 and json_end != 0:
                analysis_json = json.loads(analysis_text[json_start:json_end])
                return analysis_json
            else:
                print("❌ No JSON found in LLM response")
                return None

        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON from LLM response: {e}")
            return None

    def get_provider_info(self) -> Dict[str, str]:
        """Get information about the current LLM provider"""
        return {
            "provider": self.provider.value,
            "model": self.model,
            "environment": self.environment,
            "status": "available",
        }
