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
            # Use faster model for development, GPT-4 for production
            if os.getenv("ENVIRONMENT", "").lower() == "production":
                return os.getenv("OPENAI_MODEL", "gpt-4")
            else:
                return os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")  # Faster for dev
        elif self.provider == LLMProvider.OLLAMA:
            # Use smaller, faster model for development
            if os.getenv("ENVIRONMENT", "").lower() == "production":
                return os.getenv("OLLAMA_MODEL", "llama3.2:3b")
            else:
                return os.getenv("OLLAMA_MODEL", "llama3.2:1b")  # Faster for dev

    def _get_environment_info(self) -> str:
        """Get environment information for logging"""
        env = os.getenv("ENVIRONMENT", "development").lower()
        if env == "production":
            return "🚀 PRODUCTION"
        else:
            return "🔧 DEVELOPMENT"

    async def generate_analysis(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate property analysis using the configured LLM provider"""
        print(f"🤖 Starting LLM generation with {self.provider.value}")
        try:
            if self.provider == LLMProvider.OPENAI:
                result = await self._generate_openai(prompt)
                print(f"🤖 OpenAI result: {result}")
                return result
            elif self.provider == LLMProvider.OLLAMA:
                result = await self._generate_ollama(prompt)
                print(f"🤖 Ollama result: {result}")
                return result
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
                        "content": "You are an expert real estate analyst. Provide concise, actionable insights. Focus on key points only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,  # Lower temperature for faster, more consistent responses
                max_tokens=800,  # Further reduced for faster response
                timeout=15,  # Reduced timeout for faster failure
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
                            "content": "You are an expert real estate analyst. Provide concise, actionable insights. Focus on key points only.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    options={
                        "temperature": 0.2,  # Lower temperature for faster responses
                        "num_predict": 800,  # Further reduced for faster response
                        "num_ctx": 2048,  # Reduced context window for speed
                    },
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
        """Parse JSON from LLM response with improved error handling"""
        try:
            # Clean the response text
            analysis_text = analysis_text.strip()

            # Look for JSON in the response
            json_start = analysis_text.find("{")
            json_end = analysis_text.rfind("}") + 1

            if json_start != -1 and json_end != 0:
                json_text = analysis_text[json_start:json_end]
                analysis_json = json.loads(json_text)
                print(f"✅ Successfully parsed JSON: {list(analysis_json.keys())}")
                return analysis_json
            else:
                print(
                    f"❌ No JSON found in LLM response. Text: {analysis_text[:200]}..."
                )
                return None

        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON from LLM response: {e}")
            print(f"Raw response: {analysis_text[:200]}...")
            return None
        except Exception as e:
            print(f"❌ Unexpected error parsing JSON: {e}")
            return None

    def get_provider_info(self) -> Dict[str, str]:
        """Get information about the current LLM provider"""
        return {
            "provider": self.provider.value,
            "model": self.model,
            "environment": self.environment,
            "status": "available",
        }
