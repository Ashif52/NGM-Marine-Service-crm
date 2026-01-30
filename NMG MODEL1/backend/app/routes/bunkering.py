from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.schemas import *
from app.database import bunkering_service
from app.auth import get_current_user, require_master, require_staff_or_master

router = APIRouter(prefix="/bunkering", tags=["bunkering"])

@router.post("/", response_model=BunkeringResponse)
async def create_bunkering_operation(
    data: BunkeringCreate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Create a new bunkering operation"""
    try:
        return await bunkering_service.create_operation(data, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[BunkeringResponse])
async def get_bunkering_operations(
    ship_id: Optional[str] = Query(None),
    status: Optional[BunkeringStatus] = Query(None),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get bunkering operations with filtering"""
    try:
        print(f"[DEBUG] Bunkering API request - User: {current_user.name}, Role: {current_user.role}, Requested ship_id: {ship_id}")
        
        # Crew and Staff can only see their assigned vessel's operations
        if current_user.role in [UserRole.CREW, UserRole.STAFF]:
            if current_user.ship_id:
                print(f"[DEBUG] Staff/Crew user accessing own ship: {current_user.ship_id}")
                return await bunkering_service.get_all_operations(ship_id=current_user.ship_id, status=status)
            print(f"[DEBUG] Staff/Crew user has no assigned ship")
            return []
        
        # Master can see all operations
        print(f"[DEBUG] Master user accessing ship_id: {ship_id}")
        return await bunkering_service.get_all_operations(ship_id=ship_id, status=status)
    except Exception as e:
        print(f"[ERROR] Exception in get_bunkering_operations: {str(e)}")
        # Return empty list instead of throwing a 500 error
        return []

@router.get("/{operation_id}", response_model=BunkeringResponse)
async def get_bunkering_operation(
    operation_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific bunkering operation"""
    operation = await bunkering_service.get_operation_by_id(operation_id)
    if not operation:
        raise HTTPException(status_code=404, detail="Operation not found")
    
    # Crew can only access their ship's operations
    if current_user.role == UserRole.CREW and operation.ship_id != current_user.ship_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return operation

@router.put("/{operation_id}", response_model=BunkeringResponse)
async def update_bunkering_operation(
    operation_id: str,
    data: BunkeringUpdate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Update a bunkering operation"""
    operation = await bunkering_service.get_operation_by_id(operation_id)
    if not operation:
        raise HTTPException(status_code=404, detail="Operation not found")
    
    update_data = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    
    # Convert enum values to strings
    for key, value in update_data.items():
        if hasattr(value, 'value'):
            update_data[key] = value.value
    
    updated = await bunkering_service.update_operation(operation_id, update_data)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update operation")
    
    return updated

@router.post("/{operation_id}/complete-checklist", response_model=BunkeringResponse)
async def complete_checklist(
    operation_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Mark checklist as completed"""
    operation = await bunkering_service.get_operation_by_id(operation_id)
    if not operation:
        raise HTTPException(status_code=404, detail="Operation not found")
    
    updated = await bunkering_service.update_operation(operation_id, {"checklist_completed": True})
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update checklist status")
    
    return updated

@router.post("/{operation_id}/sample-taken", response_model=BunkeringResponse)
async def mark_sample_taken(
    operation_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Mark sample as taken"""
    operation = await bunkering_service.get_operation_by_id(operation_id)
    if not operation:
        raise HTTPException(status_code=404, detail="Operation not found")
    
    updated = await bunkering_service.update_operation(operation_id, {"sample_taken": True})
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update sample status")
    
    return updated
