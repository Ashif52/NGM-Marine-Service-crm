from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas import *
from app.database import ship_service
from app.auth import get_current_user, require_master, require_staff_or_master

router = APIRouter(prefix="/ships", tags=["ships"])

@router.post("/", response_model=ShipResponse)
async def create_ship(
    ship_data: ShipCreate,
    current_user: UserResponse = Depends(require_master)
):
    """Create a new ship (Master only)"""
    try:
        return await ship_service.create_ship(ship_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ShipResponse])
async def get_all_ships(current_user: UserResponse = Depends(get_current_user)):
    """Get all ships - accessible to all roles"""
    if current_user.role == UserRole.CREW and current_user.ship_id:
        # Crew can only see their assigned ship
        ship = await ship_service.get_ship_by_id(current_user.ship_id)
        return [ship] if ship else []
    else:
        # Staff and Master can see all ships
        return await ship_service.get_all_ships()

@router.get("/{ship_id}", response_model=ShipResponse)
async def get_ship(
    ship_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get ship by ID"""
    # Crew can only access their assigned ship
    if current_user.role == UserRole.CREW and current_user.ship_id != ship_id:
        raise HTTPException(status_code=403, detail="Access denied to this ship")
    
    ship = await ship_service.get_ship_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship

@router.put("/{ship_id}", response_model=ShipResponse)
async def update_ship(
    ship_id: str,
    ship_data: ShipUpdate,
    current_user: UserResponse = Depends(require_master)
):
    """Update ship (Master only)"""
    ship = await ship_service.get_ship_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    
    update_data = {k: v for k, v in ship_data.dict(exclude_unset=True).items() if v is not None}
    
    # Convert enum values to strings
    for key, value in update_data.items():
        if hasattr(value, 'value'):
            update_data[key] = value.value
    
    updated_ship = await ship_service.update_ship(ship_id, update_data)
    if not updated_ship:
        raise HTTPException(status_code=500, detail="Failed to update ship")
    
    return updated_ship

@router.delete("/{ship_id}")
async def delete_ship(
    ship_id: str,
    current_user: UserResponse = Depends(require_master)
):
    """Delete ship (Master only)"""
    ship = await ship_service.get_ship_by_id(ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    
    deleted = await ship_service.delete_ship(ship_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete ship")
    
    return {"message": "Ship deleted successfully"}
