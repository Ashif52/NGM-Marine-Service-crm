import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Setup path to import backend modules if needed, but we'll use direct firestore here
# assuming we run from backend root or similar.

# Initialize Firebase
# Note: In a real env, we'd load creds from env or file. 
# Assuming local emulator or established creds. 
# If running via 'start-backend.bat', env is set.
# We'll try to use the default app if already initialized, or init new.

if not firebase_admin._apps:
    # Look for key in backend root (one dir up from scripts)
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

BASE_DIR = r"c:\projects\aashif\NMG MODEL1\files\LAYER_2_FORM_TEMPLATES"

def seed_templates():
    print(f"Scanning {BASE_DIR}...")
    
    categories = {
        "Checklists": "Checklist",
        "HR": "HR",
        "ISM": "ISM",
        "PMS": "PMS",
        "Reports": "Report"
    }
    
    count = 0
    
    for folder, category_enum in categories.items():
        folder_path = os.path.join(BASE_DIR, folder)
        if not os.path.exists(folder_path):
            print(f"Skipping {folder} (not found)")
            continue
            
        for filename in os.listdir(folder_path):
            if filename.startswith("~$") or filename.startswith("."): # Skip temp files
                continue
                
            file_path = os.path.join(folder_path, filename)
            
            # Clean filename for Title
            title = os.path.splitext(filename)[0]
            title = title.replace("FPMF", "").replace("CPMF", "").replace("-", " ").strip()
            # Remove excessive spaces
            title = " ".join(title.split())
            
            # Check if exists
            docs = list(db.collection('form_templates').where('name', '==', title).stream())
            
            if len(docs) > 0:
                # Update existing if needed
                doc = docs[0]
                doc_data = doc.to_dict()
                updates = {}
                
                if 'scheduled' not in doc_data:
                    updates['scheduled'] = 'weekly'
                if 'role' not in doc_data:
                    updates['role'] = 'crew'
                    
                if updates:
                    doc.reference.update(updates)
                    print(f"Updated template matches: {title} with {updates}")
                else:
                    print(f"Skipping {title} (already up to date)")
                continue
                
            # Create Template
            # We add a default "Checklist Item" field for starters
            template_data = {
                "name": title,
                "category": category_enum,
                "description": f"Imported from {filename}",
                "approval_required": True,
                "scheduled": "weekly",
                "role": "crew",
                "fields": [
                    {
                        "id": "f1",
                        "label": "Completion Status",
                        "type": "select",
                        "required": True,
                        "options": ["Completed", "Not Applicable"]
                    },
                    {
                         "id": "f2",
                         "label": "Remarks",
                         "type": "text",
                         "required": False
                    },
                    {
                        "id": "f3",
                        "label": "Attachments/Photos",
                        "type": "photo",
                        "required": False
                    }
                ],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "created_by": "system_seed"
            }
            
            # Save
            db.collection('form_templates').add(template_data)
            print(f"Created template: {title}")
            count += 1
            
    print(f"Seeding complete. Created {count} templates.")

if __name__ == "__main__":
    seed_templates()
