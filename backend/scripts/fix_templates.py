import firebase_admin
from firebase_admin import credentials, firestore
import os
import sys

# Initialize
if not firebase_admin._apps:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_root = os.path.dirname(current_dir)
    cred_path = os.path.join(backend_root, "firebase-key.json")
    
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print(f"Warning: Key not found, attempting default")
        firebase_admin.initialize_app()

db = firestore.client()

def fix_templates():
    print("Scanning for invalid templates...")
    docs = list(db.collection('form_templates').stream())
    
    fixed_count = 0
    for doc in docs:
        data = doc.to_dict()
        updates = {}
        
        # Check for missing 'scheduled'
        if 'scheduled' not in data:
            updates['scheduled'] = 'weekly'
            
        # Check for missing 'role'
        if 'role' not in data:
            updates['role'] = 'crew'
            
        if updates:
            print(f"Fixing {doc.id} ({data.get('name')}): {updates}")
            doc.reference.update(updates)
            fixed_count += 1
            
    print(f"Fixed {fixed_count} templates.")

if __name__ == "__main__":
    fix_templates()
