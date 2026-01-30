from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.schemas import *
from app.database import worklog_service
from app.auth import get_current_user, require_master

router = APIRouter(prefix="/worklogs", tags=["worklogs"])

@router.post("/", response_model=WorkLogResponse)
async def create_work_log(
    log_data: WorkLogCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new work log entry"""
    try:
        return await worklog_service.create_log(log_data, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[WorkLogResponse])
async def get_work_logs(
    ship_id: Optional[str] = Query(None),
    status: Optional[WorkLogStatus] = Query(None),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get work logs with filtering based on role"""
    try:
        # Crew can only see their own logs
        if current_user.role == UserRole.CREW:
            logs = await worklog_service.get_logs_by_crew(current_user.id)
            if status:
                logs = [log for log in logs if log.status == status]
            return logs
        
        # Staff can only see logs for their assigned vessel
        if current_user.role == UserRole.STAFF:
            if not current_user.ship_id:
                return []  # No vessel assigned
            logs = await worklog_service.get_logs_by_ship(current_user.ship_id, status)
            return logs
        
        # Master can see all logs
        if ship_id:
            logs = await worklog_service.get_logs_by_ship(ship_id, status)
        else:
            logs = await worklog_service.get_all_logs(status)
        
        return logs
    except Exception as e:
        # Log the error
        print(f"Error in get_work_logs: {str(e)}")
        # Return empty list instead of error to prevent 500
        return []

@router.get("/{log_id}", response_model=WorkLogResponse)
async def get_work_log(
    log_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific work log"""
    log = await worklog_service.get_log_by_id(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Work log not found")
    
    # Crew can only access their own logs
    if current_user.role == UserRole.CREW and log.crew_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this log")
    
    return log

@router.post("/{log_id}/approve", response_model=WorkLogResponse)
async def approve_work_log(
    log_id: str,
    current_user: UserResponse = Depends(require_master)
):
    """Approve a work log (Master only)"""
    log = await worklog_service.get_log_by_id(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Work log not found")
    
    if log.status != WorkLogStatus.PENDING:
        raise HTTPException(status_code=400, detail="Log is not pending approval")
    
    updated_log = await worklog_service.approve_log(log_id, current_user.id)
    if not updated_log:
        raise HTTPException(status_code=500, detail="Failed to approve log")
    
    return updated_log

@router.post("/{log_id}/reject", response_model=WorkLogResponse)
async def reject_work_log(
    log_id: str,
    current_user: UserResponse = Depends(require_master)
):
    """Reject a work log (Master only)"""
    log = await worklog_service.get_log_by_id(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Work log not found")
    
    if log.status != WorkLogStatus.PENDING:
        raise HTTPException(status_code=400, detail="Log is not pending approval")
    
    updated_log = await worklog_service.reject_log(log_id, current_user.id)
    if not updated_log:
        raise HTTPException(status_code=500, detail="Failed to reject log")
    
    return updated_log

@router.put("/{log_id}", response_model=WorkLogResponse)
async def update_work_log(
    log_id: str,
    log_data: WorkLogUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a work log"""
    log = await worklog_service.get_log_by_id(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Work log not found")
    
    # Crew can only update their own pending logs
    if current_user.role == UserRole.CREW:
        if log.crew_id != current_user.id:
            raise HTTPException(status_code=403, detail="Can only update your own logs")
        if log.status != WorkLogStatus.PENDING:
            raise HTTPException(status_code=400, detail="Can only update pending logs")
    
    update_data = {k: v for k, v in log_data.dict(exclude_unset=True).items() if v is not None}
    
    # Convert enum values to strings
    for key, value in update_data.items():
        if hasattr(value, 'value'):
            update_data[key] = value.value
    
    updated_log = await worklog_service.update_log(log_id, update_data)
    if not updated_log:
        raise HTTPException(status_code=500, detail="Failed to update log")
    
    return updated_log

@router.delete("/{log_id}")
async def delete_work_log(
    log_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a work log"""
    log = await worklog_service.get_log_by_id(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Work log not found")
    
    # Crew can only delete their own pending logs
    if current_user.role == UserRole.CREW:
        if log.crew_id != current_user.id:
            raise HTTPException(status_code=403, detail="Can only delete your own logs")
        if log.status != WorkLogStatus.PENDING:
            raise HTTPException(status_code=400, detail="Can only delete pending logs")
    
    # Master can delete any log
    deleted = await worklog_service.delete_log(log_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete log")
    
    return {"message": "Work log deleted successfully"}
