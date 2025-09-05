import os
from typing import List, Optional
from app.models import PropertyAnalysis
from datetime import datetime
import json


class DatabaseService:
    def __init__(self):
        self.storage_file = "local_analyses.json"
        self._ensure_storage_file()

    def _ensure_storage_file(self):
        """Ensure the storage file exists"""
        if not os.path.exists(self.storage_file):
            with open(self.storage_file, "w") as f:
                json.dump([], f)

    async def save_analysis(self, analysis: PropertyAnalysis) -> PropertyAnalysis:
        """Save a property analysis to local storage"""
        return await self._save_to_local(analysis)

    async def get_analysis_by_address(self, address: str) -> Optional[PropertyAnalysis]:
        """Get analysis by property address"""
        return await self._get_from_local(address)

    async def get_recent_analyses(self, limit: int = 10) -> List[PropertyAnalysis]:
        """Get recent analyses"""
        return await self._get_recent_from_local(limit)

    async def delete_analysis(self, analysis_id: str) -> bool:
        """Delete an analysis by ID"""
        return await self._delete_from_local(analysis_id)

    # Local storage methods
    async def _save_to_local(self, analysis: PropertyAnalysis) -> PropertyAnalysis:
        """Save analysis to local JSON file"""
        analyses = await self._load_local_analyses()

        # Add ID and timestamps
        analysis.id = f"local_{len(analyses) + 1}"
        analysis.created_at = datetime.utcnow()
        analysis.updated_at = datetime.utcnow()

        analyses.append(analysis.model_dump())
        await self._save_local_analyses(analyses)

        return analysis

    async def _get_from_local(self, address: str) -> Optional[PropertyAnalysis]:
        """Get analysis by address from local storage"""
        analyses = await self._load_local_analyses()

        for analysis_data in analyses:
            if analysis_data.get("property_address") == address:
                return PropertyAnalysis(**analysis_data)
        return None

    async def _get_recent_from_local(self, limit: int = 10) -> List[PropertyAnalysis]:
        """Get recent analyses from local storage"""
        analyses = await self._load_local_analyses()

        # Sort by created_at and take the most recent
        sorted_analyses = sorted(
            analyses, key=lambda x: x.get("created_at", ""), reverse=True
        )[:limit]

        return [PropertyAnalysis(**analysis) for analysis in sorted_analyses]

    async def _delete_from_local(self, analysis_id: str) -> bool:
        """Delete analysis by ID from local storage"""
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
            with open(self.storage_file, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    async def _save_local_analyses(self, analyses: List[dict]):
        """Save analyses to local JSON file"""
        with open(self.storage_file, "w") as f:
            json.dump(analyses, f, default=str, indent=2)
