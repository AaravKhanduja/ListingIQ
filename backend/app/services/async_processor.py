"""
Async processing system for property analysis
Handles background jobs with real-time progress updates
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Callable
from enum import Enum
from dataclasses import dataclass
from ..models import ManualPropertyData
from ..services.llm_service import LLMService

# Caching removed for now
from ..services.optimized_prompts import OptimizedPrompts


class JobStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class AnalysisJob:
    """Represents an analysis job"""

    id: str
    user_id: str
    property_address: str
    property_title: str
    manual_data: Optional[Dict[str, Any]]
    status: JobStatus
    progress: int  # 0-100
    current_section: Optional[str]
    results: Dict[str, Any]
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime
    estimated_completion: Optional[datetime]


class AsyncAnalysisProcessor:
    """Handles async analysis processing with progress tracking"""

    def __init__(self):
        self.jobs: Dict[str, AnalysisJob] = {}
        self.job_queue: asyncio.Queue = asyncio.Queue()
        self.workers: List[asyncio.Task] = []
        self.progress_callbacks: Dict[str, List[Callable]] = {}
        self.max_workers = 3  # Configurable
        self.is_running = False

    async def start(self):
        """Start the async processor"""
        if self.is_running:
            return

        self.is_running = True

        # Start worker tasks
        for i in range(self.max_workers):
            worker = asyncio.create_task(self._worker(f"worker-{i}"))
            self.workers.append(worker)

        print(f"Started {self.max_workers} analysis workers")

    async def stop(self):
        """Stop the async processor"""
        self.is_running = False

        # Cancel all workers
        for worker in self.workers:
            worker.cancel()

        # Wait for workers to finish
        await asyncio.gather(*self.workers, return_exceptions=True)
        self.workers.clear()

        print("Stopped analysis workers")

    async def submit_analysis_job(
        self,
        user_id: str,
        property_address: str,
        property_title: str,
        manual_data: Optional[ManualPropertyData],
        progress_callback: Optional[Callable] = None,
    ) -> str:
        """Submit a new analysis job"""

        # No caching - always generate fresh analysis

        # Create new job
        job_id = str(uuid.uuid4())
        job = AnalysisJob(
            id=job_id,
            user_id=user_id,
            property_address=property_address,
            property_title=property_title,
            manual_data=manual_data,
            status=JobStatus.PENDING,
            progress=0,
            current_section=None,
            results={},
            error_message=None,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            estimated_completion=datetime.now() + timedelta(minutes=2),
        )

        self.jobs[job_id] = job

        # Add progress callback if provided
        if progress_callback:
            if job_id not in self.progress_callbacks:
                self.progress_callbacks[job_id] = []
            self.progress_callbacks[job_id].append(progress_callback)

        # Add to queue
        await self.job_queue.put(job_id)

        return job_id

    async def get_job_status(self, job_id: str) -> Optional[AnalysisJob]:
        """Get current job status"""
        return self.jobs.get(job_id)

    async def cancel_job(self, job_id: str, user_id: str) -> bool:
        """Cancel a job (only if user owns it)"""
        job = self.jobs.get(job_id)
        if not job or job.user_id != user_id:
            return False

        if job.status in [JobStatus.PENDING, JobStatus.IN_PROGRESS]:
            job.status = JobStatus.CANCELLED
            job.updated_at = datetime.now()
            return True

        return False

    async def _worker(self, worker_name: str):
        """Worker task that processes jobs"""
        while self.is_running:
            try:
                # Get job from queue
                job_id = await asyncio.wait_for(self.job_queue.get(), timeout=1.0)
                job = self.jobs.get(job_id)

                if not job or job.status == JobStatus.CANCELLED:
                    continue

                # Process the job
                await self._process_job(job, worker_name)

            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"Worker {worker_name} error: {e}")
                await asyncio.sleep(1)

    async def _process_job(self, job: AnalysisJob, worker_name: str):
        """Process a single analysis job"""
        try:
            job.status = JobStatus.IN_PROGRESS
            job.updated_at = datetime.now()
            await self._notify_progress(job)

            llm_service = LLMService()
            manual_data_obj = (
                ManualPropertyData(**job.manual_data) if job.manual_data else None
            )

            # Get optimized prompts
            prompts = OptimizedPrompts.get_all_prompts(
                job.property_address, manual_data_obj
            )

            # Process each section
            sections = [
                ("summary", "Property Summary"),
                ("strengths", "Key Strengths"),
                ("research_areas", "Research Areas"),
                ("risks", "Hidden Risks"),
                ("questions", "Realtor Questions"),
                ("market_analysis", "Market Analysis"),
                ("investment_potential", "Investment Potential"),
                ("renovation_analysis", "Renovation Analysis"),
            ]

            total_sections = len(sections)

            for i, (section_key, section_name) in enumerate(sections):
                if job.status == JobStatus.CANCELLED:
                    return

                job.current_section = section_name
                job.progress = int((i / total_sections) * 100)
                job.updated_at = datetime.now()
                await self._notify_progress(job)

                # Generate analysis for this section
                prompt = prompts[section_key]
                section_result = await llm_service.generate_analysis(prompt)

                if section_result:
                    job.results[section_key] = section_result
                else:
                    # Fallback data if LLM fails
                    job.results[section_key] = self._get_fallback_data(section_key)

                # Small delay to prevent overwhelming the LLM
                await asyncio.sleep(0.5)

            # Mark as completed
            job.status = JobStatus.COMPLETED
            job.progress = 100
            job.current_section = "Complete"
            job.updated_at = datetime.now()
            job.estimated_completion = datetime.now()

            # No caching - results are fresh for each analysis

            await self._notify_progress(job)

        except Exception as e:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            job.updated_at = datetime.now()
            await self._notify_progress(job)

    def _get_fallback_data(self, section_key: str) -> Dict[str, Any]:
        """Get fallback data when LLM fails"""
        fallbacks = {
            "summary": {
                "summary": "Analysis based on provided information",
                "overall_score": 75,
            },
            "strengths": {"strengths": ["Property analysis completed"]},
            "research_areas": {"weaknesses": ["Additional research recommended"]},
            "risks": {"hidden_risks": ["Property condition unknown"]},
            "questions": {"questions": ["What additional information do you need?"]},
            "market_analysis": {
                "trends": "Market analysis unavailable",
                "comparables": "No comparable data",
                "appreciation_potential": "Requires research",
            },
            "investment_potential": {
                "rental_income": "Requires market research",
                "cash_flow": "Analysis unavailable",
                "roi_projections": "Requires research",
                "appreciation_timeline": "Unknown",
            },
            "renovation_analysis": {
                "estimated_costs": "Assessment needed",
                "priority_improvements": ["Property inspection required"],
                "renovation_roi": "Analysis unavailable",
            },
        }
        return fallbacks.get(section_key, {})

    async def _notify_progress(self, job: AnalysisJob):
        """Notify progress callbacks"""
        callbacks = self.progress_callbacks.get(job.id, [])
        for callback in callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(job)
                else:
                    callback(job)
            except Exception as e:
                print(f"Progress callback error: {e}")

    def get_job_statistics(self) -> Dict[str, Any]:
        """Get processor statistics"""
        total_jobs = len(self.jobs)
        status_counts = {}

        for status in JobStatus:
            status_counts[status.value] = sum(
                1 for job in self.jobs.values() if job.status == status
            )

        return {
            "total_jobs": total_jobs,
            "status_counts": status_counts,
            "active_workers": len(self.workers),
            "queue_size": self.job_queue.qsize(),
            "is_running": self.is_running,
            "cache_enabled": False,
        }

    def cleanup_old_jobs(self, max_age_hours: int = 24):
        """Clean up old completed/failed jobs"""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        jobs_to_remove = []

        for job_id, job in self.jobs.items():
            if (
                job.status
                in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]
                and job.updated_at < cutoff_time
            ):
                jobs_to_remove.append(job_id)

        for job_id in jobs_to_remove:
            del self.jobs[job_id]
            if job_id in self.progress_callbacks:
                del self.progress_callbacks[job_id]

        return len(jobs_to_remove)


# Global processor instance
async_processor = AsyncAnalysisProcessor()
