from typing import Optional

from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[list[dict]] = None,
    ):
        super().__init__(status_code=status_code, detail={
            "error": {
                "code": code,
                "message": message,
                "details": details or [],
            }
        })
        self.code = code


class NotFoundException(AppException):
    def __init__(self, entity: str, entity_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=f"{entity} with id '{entity_id}' not found",
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Not authenticated"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message,
        )


class ValidationException(AppException):
    def __init__(self, message: str, details: Optional[list[dict]] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message=message,
            details=details,
        )


class ConflictException(AppException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            message=message,
        )
