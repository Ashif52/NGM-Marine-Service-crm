from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from app.schemas import AuditCreate, AuditUpdate, AuditResponse, UserResponse, UserRole
from app.auth import get_current_user, require_staff_or_master
from app.database import db, ship_service

router = APIRouter(prefix="/audits", tags=["audits"])

def parse_datetime(date_str: str) -> datetime:
    """Parse date string to datetime"""
    if 'T' in date_str:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    return datetime.fromisoformat(f"{date_str}T00:00:00")

@router.post("/", response_model=AuditResponse)
async def create_audit(
    audit_data: AuditCreate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Create a new audit (Staff/Master only)"""
    try:
        # Get ship info
        ship = await ship_service.get_ship_by_id(audit_data.ship_id)
        if not ship:
            raise HTTPException(status_code=404, detail="Ship not found")
        
        now = datetime.utcnow()
        audit_doc = {
            "ship_id": audit_data.ship_id,
            "ship_name": ship.name,
            "audit_type": audit_data.audit_type,
            "title": audit_data.title,
            "description": audit_data.description,
            "status": "scheduled",
            "scheduled_date": parse_datetime(audit_data.scheduled_date),
            "completed_date": None,
            "auditor": audit_data.auditor,
            "findings": None,
            "recommendations": None,
            "created_by": current_user.id,
            "created_by_name": current_user.name,
            "created_at": now,
            "updated_at": now
        }
        
        doc_ref = db.collection('audits').document()
        doc_ref.set(audit_doc)
        
        return AuditResponse(id=doc_ref.id, **audit_doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[AuditResponse])
async def get_audits(
    ship_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all audits with optional filtering - role-based access"""
    try:
        # Determine ship filter based on role
        effective_ship_id = ship_id
        
        # Crew and Staff can only see their assigned vessel's audits
        if current_user.role in [UserRole.CREW, UserRole.STAFF]:
            if not current_user.ship_id:
                return []  # No vessel assigned
            effective_ship_id = current_user.ship_id
        
        query = db.collection('audits')
        
        if effective_ship_id:
            query = query.where('ship_id', '==', effective_ship_id)
        
        docs = query.stream()
        
        audits = []
        for doc in docs:
            data = doc.to_dict()
            # Apply status filter in Python to avoid composite index
            if status and data.get('status') != status:
                continue
            audits.append(AuditResponse(id=doc.id, **data))
        
        # Sort by scheduled_date descending
        audits.sort(key=lambda x: x.scheduled_date if x.scheduled_date else datetime.min, reverse=True)
        
        return audits
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(
    audit_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific audit by ID"""
    doc = db.collection('audits').document(audit_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    data = doc.to_dict()
    return AuditResponse(id=doc.id, **data)

@router.put("/{audit_id}", response_model=AuditResponse)
async def update_audit(
    audit_id: str,
    update_data: AuditUpdate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Update an audit (Staff/Master only)"""
    doc_ref = db.collection('audits').document(audit_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    update_dict = {"updated_at": datetime.utcnow()}
    
    if update_data.status:
        update_dict["status"] = update_data.status
    if update_data.findings:
        update_dict["findings"] = update_data.findings
    if update_data.recommendations:
        update_dict["recommendations"] = update_data.recommendations
    if update_data.completed_date:
        update_dict["completed_date"] = parse_datetime(update_data.completed_date)
    
    doc_ref.update(update_dict)
    
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    return AuditResponse(id=updated_doc.id, **data)
