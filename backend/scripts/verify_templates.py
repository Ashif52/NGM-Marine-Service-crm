import firebase_admin
from firebase_admin import credentials, firestore
import os
import sys

# Initialize (similar to seed script)
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

# Fix path for imports
sys.path.append(backend_root)

db = firestore.client()

from app.schemas.documents import FormTemplateResponse

def verify():
    print("Checking 'form_templates' collection...")
    docs = list(db.collection('form_templates').stream())
    
    count = len(docs)
    print(f"Total Templates Found: {count}")
    
    failures = 0
    passed = 0

    if count > 0:
        print("\nValidating Templates against Schema...")
        for doc in docs:
            data = doc.to_dict()
            try:
                # Add ID manually as it's separate in Firestore doc
                full_data = {"id": doc.id, **data}
                FormTemplateResponse(**full_data)
                passed += 1
            except Exception as e:
                failures += 1
                if failures <= 5: # Print first 5 errors only
                    print(f"X Failed: {data.get('name', 'Unknown')}")
                    print(f"  Error: {str(e)}")
        
        print(f"\nValidation Result: {passed} passed, {failures} failed.")
    else:
        print("No templates found! Seeding might have failed.")

if __name__ == "__main__":
    verify()
