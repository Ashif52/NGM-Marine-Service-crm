from fastapi import APIRouter, Depends, HTTPException
from app.auth import require_master
from app.schemas import UserResponse
from app.database import pms_service, user_service

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/fix-pms-task")
async def fix_pms_task(
    current_user: UserResponse = Depends(require_master)
):
    """Admin endpoint to fix the PMS task ship_id issue (Master only)"""
    try:
        # Task and crew member IDs
        task_id = "dJtBTj8yJLLENXzxvYsX"
        crew_id = "HQLrbb4RyrkGP66o9NbH"
        
        # Get crew's ship_id
        crew = await user_service.get_user_by_id(crew_id)
        if not crew:
            raise HTTPException(status_code=404, detail="Crew member not found")
            
        crew_ship_id = crew.ship_id
        if not crew_ship_id:
            raise HTTPException(status_code=400, detail="Crew member has no ship assigned")
        
        # Get task
        task = await pms_service.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update task's ship_id
        update_data = {"ship_id": crew_ship_id}
        updated_task = await pms_service.update_task(task_id, update_data)
        
        return {
            "message": "Task ship_id updated successfully",
            "task_id": task_id,
            "old_ship_id": task.ship_id,
            "new_ship_id": crew_ship_id,
            "crew_name": crew.name,
            "crew_ship_id": crew_ship_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
