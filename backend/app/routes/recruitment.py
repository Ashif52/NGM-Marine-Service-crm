from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas import CandidateCreate, CandidateUpdate, CandidateResponse, RecruitmentStage, UserResponse, UserRole
from app.database import candidate_service
from app.auth import get_current_user, require_staff_or_master, require_master

router = APIRouter(prefix="/recruitment", tags=["Recruitment"])

@router.post("", response_model=CandidateResponse)
async def create_candidate(
    candidate_data: CandidateCreate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Create a new candidate (Staff/Master only)"""
    return await candidate_service.create_candidate(candidate_data)

@router.get("", response_model=List[CandidateResponse])
async def get_all_candidates(
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Get all candidates (Staff/Master only) - Staff sees only their vessel's candidates"""
    all_candidates = await candidate_service.get_all_candidates()
    
    # Staff can only see candidates for their assigned vessel
    if current_user.role == UserRole.STAFF:
        if not current_user.ship_id:
            return []  # No vessel assigned
        return [c for c in all_candidates if c.vessel_id == current_user.ship_id]
    
    # Master sees all candidates
    return all_candidates

@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: str,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Get candidate by ID (Staff/Master only)"""
    candidate = await candidate_service.get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.put("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: str,
    candidate_data: CandidateUpdate,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Update candidate (Staff/Master only)"""
    candidate = await candidate_service.update_candidate(candidate_id, candidate_data)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.delete("/{candidate_id}")
async def delete_candidate(
    candidate_id: str,
    current_user: UserResponse = Depends(require_master)
):
    """Delete candidate (Master only)"""
    deleted = await candidate_service.delete_candidate(candidate_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"message": "Candidate deleted successfully"}

@router.patch("/{candidate_id}/stage", response_model=CandidateResponse)
async def move_candidate_stage(
    candidate_id: str,
    new_stage: RecruitmentStage,
    current_user: UserResponse = Depends(require_staff_or_master)
):
    """Move candidate to a new stage (Staff/Master only)"""
    candidate = await candidate_service.move_candidate_stage(candidate_id, new_stage)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate
