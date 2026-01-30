import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase
if not firebase_admin._apps:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_root = os.path.dirname(current_dir)
    cred_path = os.path.join(backend_root, "firebase-key.json")
    
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print(f"Warning: Key not found at {cred_path}, attempting default init")
        firebase_admin.initialize_app()

db = firestore.client()

def seed_passage_plan():
    title = "CPMF-02-01 Passage Plan"
    print(f"Seeding {title}...")

    # Check if exists
    docs = list(db.collection('form_templates').where('name', '==', title).stream())
    if len(docs) > 0:
        print("Template already exists. Deleting to recreate with new structure...")
        for doc in docs:
            doc.reference.delete()

    template_data = {
        "name": title,
        "category": "ISM", # Using ISM as it fits Passage Plan
        "description": "Comprehensive Passage Plan (Berth to Berth)",
        "approval_required": True,
        "scheduled": "weekly", # Default, can be changed
        "role": "crew",
        "fields": [
            {"id": "vessel_name", "label": "Vessel Name", "type": "text", "required": True},
            {"id": "date", "label": "Date", "type": "date", "required": True},
            {"id": "from_port", "label": "From", "type": "text", "required": True},
            {"id": "to_port", "label": "To", "type": "text", "required": True},
            {"id": "total_dist", "label": "Total Distance (NM)", "type": "number", "required": False},
            {"id": "est_speed", "label": "Est. Speed (kts)", "type": "number", "required": False},
            {"id": "os_speed", "label": "Steaming Time (hrs)", "type": "number", "required": False},
            {"id": "sailing_dir", "label": "Sailing Direction", "type": "text", "required": False},
            {"id": "voyage_charts", "label": "Voyage Charts", "type": "text", "required": False},
            {"id": "list_lights", "label": "List of Lights", "type": "text", "required": False},
            {"id": "alrs", "label": "ALRS Vols", "type": "text", "required": False},
            {"id": "tide_tables", "label": "Tide Tables", "type": "text", "required": False},
            {"id": "routing_charts", "label": "Routing Charts", "type": "text", "required": False},
            
            # Lists as Single Column Tables
            {
                "id": "radio_broadcasts",
                "label": "RADIO / ELECTRONIC BROADCAST MSG CONSULTED",
                "type": "table",
                "required": False,
                "columns": [
                    {"id": "msg", "label": "Message Detail", "type": "text", "required": False}
                ]
            },
            {
                "id": "charts_used",
                "label": "CHARTS IN USE",
                "type": "table",
                "required": False,
                "columns": [
                    {"id": "chart_no", "label": "Chart No", "type": "text", "required": True}
                ]
            },
            {
                "id": "ntm_corr",
                "label": "ALL CHARTS CORRECTED TO NTM NO",
                "type": "table",
                "required": False,
                "columns": [
                    {"id": "ntm_no", "label": "NTM No", "type": "text", "required": True}
                ]
            },
            {
                "id": "officers",
                "label": "FOLLOWING OFFICERS INVOLVED IN THE PLAN",
                "type": "table",
                "required": False,
                "columns": [
                    {"id": "name", "label": "Officer Name", "type": "text", "required": True},
                    {"id": "rank", "label": "Rank", "type": "text", "required": False}
                ]
            },
            
            # Main Passage Plan Table
            {
                "id": "passage_plan_wpts",
                "label": "PASSAGE PLAN (Berth to Berth)",
                "type": "table",
                "required": True,
                "columns": [
                    {"id": "chart_no", "label": "Chart No.", "type": "text", "required": False},
                    {"id": "wpt_no", "label": "WPT No.", "type": "text", "required": True},
                    {"id": "lat", "label": "Latitude", "type": "text", "required": True},
                    {"id": "long", "label": "Longitude", "type": "text", "required": True},
                    {"id": "course", "label": "Course to Next", "type": "number", "required": False},
                    {"id": "dist", "label": "Dist to Next", "type": "number", "required": False},
                    {"id": "ttl_dtg", "label": "TTL DTG", "type": "number", "required": False},
                    {"id": "speed", "label": "Usual Speed", "type": "number", "required": False},
                    {"id": "depth", "label": "Depth on Leg", "type": "text", "required": False},
                    {"id": "remarks", "label": "Remarks", "type": "text", "required": False}
                ]
            },
            
            # Footer
            {"id": "prepared_by", "label": "PREPARED BY 2ND OFFICER", "type": "signature", "required": True},
            {"id": "checked_by", "label": "CHECKED BY MASTER", "type": "signature", "required": True}
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "created_by": "system_seed"
    }

    db.collection('form_templates').add(template_data)
    print(f"Successfully created template: {title}")

if __name__ == "__main__":
    seed_passage_plan()
