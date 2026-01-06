from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from app.schemas import IncidentCreate, IncidentUpdate, IncidentResponse, UserResponse, UserRole
from app.auth import get_current_user, require_staff_or_master
from app.database import db, ship_service

router = APIRouter(prefix="/incidents", tags=["incidents"])

def parse_datetime(date_str: str) -> datetime:
    """Parse date string to datetime"""
    if 'T' in date_str:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    return datetime.fromisoformat(f"{date_str}T00:00:00")

@router.post("/", response_model=IncidentResponse)
async def create_incident(
    incident_data: IncidentCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new incident report"""
    try:
        # Get ship info
        ship = await ship_service.get_ship_by_id(incident_data.ship_id)
        if not ship:
            raise HTTPException(status_code=404, detail="Ship not found")
        
        now = datetime.utcnow()
        incident_doc = {
            "ship_id": incident_data.ship_id,
            "ship_name": ship.name,
            "title": incident_data.title,
            "description": incident_data.description,
            "incident_type": incident_data.incident_type,
            "severity": incident_data.severity,
            "status": "reported",
            "location": incident_data.location,
            "date_time": parse_datetime(incident_data.date_time),
            "injuries": incident_data.injuries,
            "witnesses": incident_data.witnesses,
            "reported_by": current_user.id,
            "reported_by_name": current_user.name,
            "investigation_notes": None,
            "corrective_actions": None,
            "resolved_date": None,
            "created_at": now,
            "updated_at": now
        }
        
        doc_ref = db.collection('incidents').document()
        doc_ref.set(incident_doc)
        
        return IncidentResponse(id=doc_ref.id, **incident_doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[IncidentResponse])
async def get_incidents(
    ship_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all incidents with optional filtering - role-based access"""
    try:
        # Determine ship filter based on role
        effective_ship_id = ship_id
        
        # Crew and Staff can only see their assigned vessel's incidents
        if current_user.role in [UserRole.CREW, UserRole.STAFF]:
            if not current_user.ship_id:
                return []  # No vessel assigned
            effective_ship_id = current_user.ship_id
        
        query = db.collection('incidents')
        
        if effective_ship_id:
            query = query.where('ship_id', '==', effective_ship_id)
        
        docs = query.stream()
        
        incidents = []
        for doc in docs:
            data = doc.to_dict()
            # Apply status filter in Python to avoid composite index
            if status and data.get('status') != status:
                continue
            incidents.append(IncidentResponse(id=doc.id, **data))
        
        # Sort by created_at descending
        incidents.sort(key=lambda x: x.created_at if x.created_at else datetime.min, reverse=True)
        
        return incidents
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific incident by ID"""
    doc = db.collection('incidents').document(incident_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    data = doc.to_dict()
    return IncidentResponse(id=doc.id, **data)

@router.put("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    update_data: IncidentUpdate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Update an incident (Staff/Master only)"""
    doc_ref = db.collection('incidents').document(incident_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    update_dict = {"updated_at": datetime.utcnow()}
    
    if update_data.status:
        update_dict["status"] = update_data.status
    if update_data.investigation_notes:
        update_dict["investigation_notes"] = update_data.investigation_notes
    if update_data.corrective_actions:
        update_dict["corrective_actions"] = update_data.corrective_actions
    if update_data.resolved_date:
        update_dict["resolved_date"] = parse_datetime(update_data.resolved_date)
    
    doc_ref.update(update_dict)
    
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    return IncidentResponse(id=updated_doc.id, **data)
