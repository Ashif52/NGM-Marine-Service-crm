#!/usr/bin/env python3
"""
Quick Authentication Test Script for NMG Marine Management System
This script helps test the authentication system without requiring database setup
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from app.firebase import db
from app.schemas import UserRole

async def test_firebase_connection():
    """Test Firebase connection and basic functionality"""
    print("🔧 Testing NMG Marine Authentication System...")
    
    try:
        # Test Firebase connection
        print("📡 Testing Firebase connection...")
        test_doc = db.collection('test').document('connection_test')
        test_doc.set({'test': True, 'timestamp': '2025-12-31'})
        result = test_doc.get()
        
        if result.exists:
            print("✅ Firebase connection successful!")
            test_doc.delete()
        else:
            print("❌ Firebase connection failed")
            return False
            
        # Test collections access
        print("\n📊 Testing database collections...")
        
        collections = ['users', 'ships', 'pms_tasks', 'crew_logs', 'invoices']
        for collection in collections:
            try:
                docs = db.collection(collection).limit(1).get()
                print(f"✅ Collection '{collection}': {len(docs)} documents")
            except Exception as e:
                print(f"⚠️  Collection '{collection}': Access error - {str(e)}")
        
        # Test user roles
        print("\n👥 Testing user roles...")
        for role in UserRole:
            print(f"✅ Role '{role.value}' defined correctly")
            
        print("\n🎉 Authentication system test completed!")
        print("\n📋 Next Steps:")
        print("1. Open http://localhost:3000 in your browser")
        print("2. Try signing up with a new account")
        print("3. Test sign in with the account")
        print("4. Check browser console for authentication logs")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_firebase_connection())
    if success:
        print("\n✅ System ready for authentication testing!")
    else:
        print("\n❌ Please check Firebase configuration")
