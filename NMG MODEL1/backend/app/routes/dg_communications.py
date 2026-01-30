from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.schemas import *
from app.database import dg_communication_service
from app.auth import get_current_user, require_master, require_staff_or_master

router = APIRouter(prefix="/dg-communications", tags=["dg-communications"])

@router.post("/", response_model=DGCommunicationResponse)
async def create_communication(
    data: DGCommunicationCreate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Create a new DG communication"""
    try:
        return await dg_communication_service.create_communication(data, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[DGCommunicationResponse])
async def get_communications(
    comm_type: Optional[DGCommunicationType] = Query(None),
    status: Optional[DGCommunicationStatus] = Query(None),
    category: Optional[DGCommunicationCategory] = Query(None),
    ship_id: Optional[str] = Query(None),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get DG communications with filtering based on role"""
    # Staff can only see communications for their assigned vessel
    if current_user.role == UserRole.STAFF:
        if not current_user.ship_id:
            return []  # No vessel assigned
        ship_id = current_user.ship_id
    
    # Crew can only see communications for their assigned vessel
    if current_user.role == UserRole.CREW:
        if not current_user.ship_id:
            return []  # No vessel assigned
        ship_id = current_user.ship_id
    
    return await dg_communication_service.get_all_communications(
        comm_type=comm_type,
        status=status,
        category=category,
        ship_id=ship_id
    )

@router.get("/stats")
async def get_stats(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get DG communication statistics"""
    # For staff/crew, filter stats by their assigned vessel
    if current_user.role in [UserRole.STAFF, UserRole.CREW]:
        if current_user.ship_id:
            return await dg_communication_service.get_stats(ship_id=current_user.ship_id)
        return {"total": 0, "pending": 0, "in_progress": 0, "completed": 0}
    return await dg_communication_service.get_stats()

@router.get("/{comm_id}", response_model=DGCommunicationResponse)
async def get_communication(
    comm_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific DG communication"""
    communication = await dg_communication_service.get_communication_by_id(comm_id)
    if not communication:
        raise HTTPException(status_code=404, detail="Communication not found")
    return communication

@router.put("/{comm_id}", response_model=DGCommunicationResponse)
async def update_communication(
    comm_id: str,
    data: DGCommunicationUpdate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Update a DG communication"""
    communication = await dg_communication_service.get_communication_by_id(comm_id)
    if not communication:
        raise HTTPException(status_code=404, detail="Communication not found")
    
    update_data = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    
    # Convert enum values to strings
    for key, value in update_data.items():
        if hasattr(value, 'value'):
            update_data[key] = value.value
    
    updated = await dg_communication_service.update_communication(comm_id, update_data)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update communication")
    
    return updated

@router.post("/{comm_id}/respond", response_model=DGCommunicationResponse)
async def add_response(
    comm_id: str,
    data: DGResponseCreate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Add a response to a DG communication"""
    communication = await dg_communication_service.get_communication_by_id(comm_id)
    if not communication:
        raise HTTPException(status_code=404, detail="Communication not found")
    
    updated = await dg_communication_service.add_response(
        comm_id, 
        data.response, 
        data.mark_completed
    )
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to add response")
    
    return updated

@router.post("/{comm_id}/complete", response_model=DGCommunicationResponse)
async def mark_completed(
    comm_id: str,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Mark a DG communication as completed"""
    communication = await dg_communication_service.get_communication_by_id(comm_id)
    if not communication:
        raise HTTPException(status_code=404, detail="Communication not found")
    
    updated = await dg_communication_service.update_communication(
        comm_id, 
        {"status": DGCommunicationStatus.COMPLETED.value}
    )
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update status")
    
    return updated

@router.delete("/{comm_id}")
async def delete_communication(
    comm_id: str,
    current_user: UserResponse = Depends(require_master)
):
    """Delete a DG communication (Master only)"""
    deleted = await dg_communication_service.delete_communication(comm_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Communication not found")
    
    return {"message": "Communication deleted successfully"}
