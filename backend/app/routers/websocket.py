"""
WebSocket endpoints for real-time analysis progress updates
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
from ..services.async_processor import async_processor, AnalysisJob
from ..middleware.auth import get_current_user


router = APIRouter()


# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    # Remove broken connections
                    self.active_connections[user_id].remove(connection)


manager = ConnectionManager()


@router.websocket("/ws/analysis/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time analysis updates"""
    await manager.connect(websocket, user_id)

    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "subscribe_job":
                job_id = message.get("job_id")
                if job_id:
                    # Subscribe to job updates
                    await subscribe_to_job_updates(websocket, user_id, job_id)

            elif message.get("type") == "unsubscribe_job":
                job_id = message.get("job_id")
                if job_id:
                    # Unsubscribe from job updates
                    await unsubscribe_from_job_updates(websocket, user_id, job_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


async def subscribe_to_job_updates(websocket: WebSocket, user_id: str, job_id: str):
    """Subscribe to updates for a specific job"""
    job = await async_processor.get_job_status(job_id)

    if not job or job.user_id != user_id:
        await websocket.send_text(
            json.dumps({"type": "error", "message": "Job not found or access denied"})
        )
        return

    # Send current job status
    await websocket.send_text(
        json.dumps(
            {
                "type": "job_update",
                "job_id": job_id,
                "data": {
                    "status": job.status.value,
                    "progress": job.progress,
                    "current_section": job.current_section,
                    "results": job.results,
                    "error_message": job.error_message,
                    "updated_at": job.updated_at.isoformat(),
                },
            }
        )
    )

    # Set up progress callback for this job
    async def progress_callback(job: AnalysisJob):
        if job.id == job_id:
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "job_update",
                        "job_id": job_id,
                        "data": {
                            "status": job.status.value,
                            "progress": job.progress,
                            "current_section": job.current_section,
                            "results": job.results,
                            "error_message": job.error_message,
                            "updated_at": job.updated_at.isoformat(),
                        },
                    }
                )
            )

    # Add callback to the processor
    if job_id not in async_processor.progress_callbacks:
        async_processor.progress_callbacks[job_id] = []
    async_processor.progress_callbacks[job_id].append(progress_callback)


async def unsubscribe_from_job_updates(websocket: WebSocket, user_id: str, job_id: str):
    """Unsubscribe from job updates"""
    # Remove callback (implementation depends on how callbacks are stored)
    pass


@router.post("/analysis/async")
async def start_async_analysis(
    request: dict, current_user: dict = Depends(get_current_user)
):
    """Start an async analysis job"""
    try:
        property_address = request.get("property_address")
        property_title = request.get("property_title", property_address)
        manual_data = request.get("manual_data")

        if not property_address:
            return {"error": "Property address is required"}

        # Convert manual_data to ManualPropertyData if provided
        manual_data_obj = None
        if manual_data:
            from ..models import ManualPropertyData

            manual_data_obj = ManualPropertyData(**manual_data)

        # Submit job
        job_id = await async_processor.submit_analysis_job(
            user_id=current_user["id"],
            property_address=property_address,
            property_title=property_title,
            manual_data=manual_data_obj,
        )

        return {
            "success": True,
            "job_id": job_id,
            "websocket_url": f"/ws/analysis/{current_user['id']}",
        }

    except Exception as e:
        return {"error": str(e)}


@router.get("/analysis/job/{job_id}")
async def get_job_status(job_id: str, current_user: dict = Depends(get_current_user)):
    """Get the status of an analysis job"""
    try:
        job = await async_processor.get_job_status(job_id)

        if not job or job.user_id != current_user["id"]:
            return {"error": "Job not found or access denied"}

        return {
            "success": True,
            "job": {
                "id": job.id,
                "status": job.status.value,
                "progress": job.progress,
                "current_section": job.current_section,
                "results": job.results,
                "error_message": job.error_message,
                "created_at": job.created_at.isoformat(),
                "updated_at": job.updated_at.isoformat(),
                "estimated_completion": job.estimated_completion.isoformat()
                if job.estimated_completion
                else None,
            },
        }

    except Exception as e:
        return {"error": str(e)}


@router.delete("/analysis/job/{job_id}")
async def cancel_job(job_id: str, current_user: dict = Depends(get_current_user)):
    """Cancel an analysis job"""
    try:
        success = await async_processor.cancel_job(job_id, current_user["id"])

        if success:
            return {"success": True, "message": "Job cancelled"}
        else:
            return {"error": "Job not found, access denied, or cannot be cancelled"}

    except Exception as e:
        return {"error": str(e)}


@router.get("/analysis/stats")
async def get_processor_stats():
    """Get processor statistics (admin endpoint)"""
    try:
        stats = async_processor.get_job_statistics()

        return {"success": True, "processor_stats": stats, "cache_enabled": False}

    except Exception as e:
        return {"error": str(e)}
