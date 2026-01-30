from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from app.schemas import CargoCreate, CargoUpdate, CargoResponse, UserResponse, UserRole
from app.auth import get_current_user, require_staff_or_master
from app.database import db, ship_service

router = APIRouter(prefix="/cargo", tags=["cargo"])

def parse_datetime(date_str: str) -> datetime:
    """Parse date string to datetime"""
    if 'T' in date_str:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    return datetime.fromisoformat(f"{date_str}T00:00:00")

@router.post("/", response_model=CargoResponse)
async def create_cargo_operation(
    cargo_data: CargoCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new cargo operation"""
    try:
        # Get ship info
        ship = await ship_service.get_ship_by_id(cargo_data.ship_id)
        if not ship:
            raise HTTPException(status_code=404, detail="Ship not found")
        
        now = datetime.utcnow()
        cargo_doc = {
            "ship_id": cargo_data.ship_id,
            "ship_name": ship.name,
            "cargo_type": cargo_data.cargo_type,
            "cargo_name": cargo_data.cargo_name,
            "quantity": cargo_data.quantity,
            "actual_quantity": None,
            "unit": cargo_data.unit,
            "port": cargo_data.port,
            "status": "planned",
            "scheduled_date": parse_datetime(cargo_data.scheduled_date),
            "completed_date": None,
            "notes": cargo_data.notes,
            "created_by": current_user.id,
            "created_by_name": current_user.name,
            "created_at": now,
            "updated_at": now
        }
        
        doc_ref = db.collection('cargo_operations').document()
        doc_ref.set(cargo_doc)
        
        return CargoResponse(id=doc_ref.id, **cargo_doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[CargoResponse])
async def get_cargo_operations(
    ship_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all cargo operations with optional filtering - role-based access"""
    try:
        # Determine ship filter based on role
        effective_ship_id = ship_id
        
        # Crew and Staff can only see their assigned vessel's data
        if current_user.role in [UserRole.CREW, UserRole.STAFF]:
            if not current_user.ship_id:
                return []  # No vessel assigned
            effective_ship_id = current_user.ship_id
        
        # Build query
        query = db.collection('cargo_operations')
        
        if effective_ship_id:
            query = query.where('ship_id', '==', effective_ship_id)
        
        docs = query.stream()
        
        operations = []
        for doc in docs:
            data = doc.to_dict()
            # Apply status filter in Python to avoid composite index
            if status and data.get('status') != status:
                continue
            operations.append(CargoResponse(id=doc.id, **data))
        
        # Sort by scheduled_date descending
        operations.sort(key=lambda x: x.scheduled_date if x.scheduled_date else datetime.min, reverse=True)
        
        return operations
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{cargo_id}", response_model=CargoResponse)
async def get_cargo_operation(
    cargo_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific cargo operation by ID"""
    doc = db.collection('cargo_operations').document(cargo_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Cargo operation not found")
    
    data = doc.to_dict()
    return CargoResponse(id=doc.id, **data)

@router.put("/{cargo_id}", response_model=CargoResponse)
async def update_cargo_operation(
    cargo_id: str,
    update_data: CargoUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a cargo operation"""
    doc_ref = db.collection('cargo_operations').document(cargo_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Cargo operation not found")
    
    update_dict = {"updated_at": datetime.utcnow()}
    
    if update_data.status:
        update_dict["status"] = update_data.status
    if update_data.actual_quantity is not None:
        update_dict["actual_quantity"] = update_data.actual_quantity
    if update_data.notes:
        update_dict["notes"] = update_data.notes
    if update_data.completed_date:
        update_dict["completed_date"] = parse_datetime(update_data.completed_date)
    
    doc_ref.update(update_dict)
    
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    return CargoResponse(id=updated_doc.id, **data)
