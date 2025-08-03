import os
from typing import List, Optional
from app.models import PropertyAnalysis
from datetime import datetime
import json

# Try to import Supabase, but don't fail if it's not available
try:
    from supabase import create_client, Client

    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️ Supabase not installed. Install with: pip install supabase")


class DatabaseService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        # Check if Supabase is configured and available
        if SUPABASE_AVAILABLE and supabase_url and supabase_key:
            try:
                self.supabase: Client = create_client(supabase_url, supabase_key)
                self.use_supabase = True
                print("✅ Supabase connected successfully")
            except Exception as e:
                print(f"⚠️ Supabase connection failed: {e}")
                self.use_supabase = False
        else:
            if not SUPABASE_AVAILABLE:
                print("⚠️ Supabase not installed, using local storage fallback")
            else:
                print("⚠️ Supabase not configured, using local storage fallback")
            self.use_supabase = False

    async def save_analysis(self, analysis: PropertyAnalysis) -> PropertyAnalysis:
        """Save a property analysis to the database or local storage"""
        if self.use_supabase:
            return await self._save_to_supabase(analysis)
        else:
            return await self._save_to_local(analysis)

    async def get_analysis_by_address(self, address: str) -> Optional[PropertyAnalysis]:
        """Get analysis by property address"""
        if self.use_supabase:
            return await self._get_from_supabase(address)
        else:
            return await self._get_from_local(address)

    async def get_recent_analyses(self, limit: int = 10) -> List[PropertyAnalysis]:
        """Get recent analyses"""
        if self.use_supabase:
            return await self._get_recent_from_supabase(limit)
        else:
            return await self._get_recent_from_local(limit)

    async def delete_analysis(self, analysis_id: str) -> bool:
        """Delete an analysis by ID"""
        if self.use_supabase:
            return await self._delete_from_supabase(analysis_id)
        else:
            return await self._delete_from_local(analysis_id)

    # Supabase methods
    async def _save_to_supabase(self, analysis: PropertyAnalysis) -> PropertyAnalysis:
        data = analysis.model_dump(exclude={"id", "created_at", "updated_at"})
        data["created_at"] = datetime.utcnow().isoformat()
        data["updated_at"] = datetime.utcnow().isoformat()

        result = self.supabase.table("property_analyses").insert(data).execute()

        if result.data:
            saved_analysis = result.data[0]
            return PropertyAnalysis(**saved_analysis)
        else:
            raise Exception("Failed to save analysis")

    async def _get_from_supabase(self, address: str) -> Optional[PropertyAnalysis]:
        result = (
            self.supabase.table("property_analyses")
            .select("*")
            .eq("property_address", address)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if result.data:
            return PropertyAnalysis(**result.data[0])
        return None

    async def _get_recent_from_supabase(
        self, limit: int = 10
    ) -> List[PropertyAnalysis]:
        result = (
            self.supabase.table("property_analyses")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        return [PropertyAnalysis(**analysis) for analysis in result.data]

    async def _delete_from_supabase(self, analysis_id: str) -> bool:
        result = (
            self.supabase.table("property_analyses")
            .delete()
            .eq("id", analysis_id)
            .execute()
        )

        return len(result.data) > 0

    # Local storage methods (fallback)
    async def _save_to_local(self, analysis: PropertyAnalysis) -> PropertyAnalysis:
        # Create a simple file-based storage
        analyses = await self._load_local_analyses()

        # Add ID and timestamps
        analysis.id = f"local_{len(analyses) + 1}"
        analysis.created_at = datetime.utcnow()
        analysis.updated_at = datetime.utcnow()

        analyses.append(analysis.model_dump())
        await self._save_local_analyses(analyses)

        return analysis

    async def _get_from_local(self, address: str) -> Optional[PropertyAnalysis]:
        analyses = await self._load_local_analyses()

        for analysis_data in analyses:
            if analysis_data.get("property_address") == address:
                return PropertyAnalysis(**analysis_data)
        return None

    async def _get_recent_from_local(self, limit: int = 10) -> List[PropertyAnalysis]:
        analyses = await self._load_local_analyses()

        # Sort by created_at and take the most recent
        sorted_analyses = sorted(
            analyses, key=lambda x: x.get("created_at", ""), reverse=True
        )[:limit]

        return [PropertyAnalysis(**analysis) for analysis in sorted_analyses]

    async def _delete_from_local(self, analysis_id: str) -> bool:
        analyses = await self._load_local_analyses()

        for i, analysis in enumerate(analyses):
            if analysis.get("id") == analysis_id:
                analyses.pop(i)
                await self._save_local_analyses(analyses)
                return True

        return False

    async def _load_local_analyses(self) -> List[dict]:
        """Load analyses from local JSON file"""
        try:
            with open("local_analyses.json", "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    async def _save_local_analyses(self, analyses: List[dict]):
        """Save analyses to local JSON file"""
        with open("local_analyses.json", "w") as f:
            json.dump(analyses, f, default=str, indent=2)
