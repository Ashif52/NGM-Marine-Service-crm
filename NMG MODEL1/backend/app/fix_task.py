from firebase_admin import firestore
from fastapi import FastAPI, HTTPException
import asyncio

app = FastAPI()

@app.get("/fix-task")
async def fix_task():
    """Fix the PMS task ship_id to match the assigned crew member's vessel"""
    try:
        # Task ID and crew ID from the request
        task_id = "dJtBTj8yJLLENXzxvYsX"
        crew_id = "HQLrbb4RyrkGP66o9NbH"
        
        # Get Firestore database
        db = firestore.client()
        
        # Get the crew member's document
        crew_doc = db.collection("users").document(crew_id).get()
        if not crew_doc.exists:
            return {"error": "Crew member not found"}
        
        crew_data = crew_doc.to_dict()
        crew_ship_id = crew_data.get("ship_id")
        
        if not crew_ship_id:
            return {"error": "Crew member has no ship assigned"}
        
        # Get the task document
        task_doc = db.collection("pms_tasks").document(task_id).get()
        if not task_doc.exists:
            return {"error": "Task not found"}
        
        # Update the task's ship_id
        task_ref = db.collection("pms_tasks").document(task_id)
        task_ref.update({
            "ship_id": crew_ship_id,
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        
        return {
            "success": True,
            "message": f"Task {task_id} updated to ship {crew_ship_id}",
            "crew_name": crew_data.get("name", "Unknown"),
            "ship_id": crew_ship_id
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Run the function directly when executed as a script
    result = asyncio.run(fix_task())
    print(result)
