import logging
import json
from datetime import datetime
from typing import Any, Dict, Optional
import os


class StructuredLogger:
    def __init__(self, name: str = "listingiq"):
        self.logger = logging.getLogger(name)
        self.setup_logging()

    def setup_logging(self):
        """Setup logging configuration based on environment"""
        environment = os.getenv("ENVIRONMENT", "development")

        if environment == "production":
            # Production: JSON structured logging
            formatter = logging.Formatter(
                '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}'
            )
            level = logging.INFO
        else:
            # Development: Human readable
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
            level = logging.DEBUG

        handler = logging.StreamHandler()
        handler.setFormatter(formatter)

        self.logger.addHandler(handler)
        self.logger.setLevel(level)

    def log_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration: float,
        user_id: Optional[str] = None,
    ):
        """Log HTTP request details"""
        log_data = {
            "type": "http_request",
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": round(duration * 1000, 2),
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if status_code >= 400:
            self.logger.error(json.dumps(log_data))
        else:
            self.logger.info(json.dumps(log_data))

    def log_auth_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        success: bool = True,
        error: Optional[str] = None,
    ):
        """Log authentication events"""
        log_data = {
            "type": "auth_event",
            "event": event_type,
            "user_id": user_id,
            "success": success,
            "error": error,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if success:
            self.logger.info(json.dumps(log_data))
        else:
            self.logger.warning(json.dumps(log_data))

    def log_analysis_event(
        self,
        event_type: str,
        user_id: str,
        property_address: str,
        success: bool = True,
        error: Optional[str] = None,
    ):
        """Log analysis events"""
        log_data = {
            "type": "analysis_event",
            "event": event_type,
            "user_id": user_id,
            "property_address": property_address,
            "success": success,
            "error": error,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if success:
            self.logger.info(json.dumps(log_data))
        else:
            self.logger.error(json.dumps(log_data))

    def log_error(self, error: Exception, context: Optional[Dict[str, Any]] = None):
        """Log errors with context"""
        log_data = {
            "type": "error",
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context or {},
            "timestamp": datetime.utcnow().isoformat(),
        }

        self.logger.error(json.dumps(log_data))


# Global logger instance
logger = StructuredLogger()
