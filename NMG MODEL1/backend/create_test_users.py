#!/usr/bin/env python3
"""
Script to create test users in the NMG Marine Management System
Run this script to populate the database with test users for different roles
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import user_service, ship_service
from app.schemas import UserCreate

async def create_test_users():
    """Create test users for different roles"""
    print("🚀 Creating test users for NMG Marine Management System...")
    
    try:
        # Get available ships first
        ships = await ship_service.get_all_ships()
        if not ships:
            print("❌ No ships found. Please initialize ships first.")
            return
        
        ship_ids = [ship.id for ship in ships]
        print(f"📊 Found {len(ships)} ships for assignment")
        
        # Test users to create
        test_users = [
            {
                "email": "master@nmg-marine.com",
                "password": "Test123456!",
                "name": "John Captain",
                "role": "master",
                "phone": "+1234567890",
                "position": "Fleet Master"
            },
            {
                "email": "staff@nmg-marine.com", 
                "password": "Test123456!",
                "name": "Sarah Manager",
                "role": "staff",
                "phone": "+1234567891",
                "position": "Operations Manager",
                "ship_id": ship_ids[0] if ship_ids else None
            },
            {
                "email": "crew@nmg-marine.com",
                "password": "Test123456!", 
                "name": "Mike Sailor",
                "role": "crew",
                "phone": "+1234567892",
                "position": "Chief Engineer",
                "ship_id": ship_ids[0] if ship_ids else None
            },
            {
                "email": "captain@nmg-marine.com",
                "password": "Test123456!",
                "name": "Robert Smith", 
                "role": "crew",
                "phone": "+1234567893",
                "position": "Ship Captain",
                "ship_id": ship_ids[1] if len(ship_ids) > 1 else ship_ids[0]
            },
            {
                "email": "engineer@nmg-marine.com",
                "password": "Test123456!",
                "name": "Lisa Chen",
                "role": "crew", 
                "phone": "+1234567894",
                "position": "Marine Engineer",
                "ship_id": ship_ids[2] if len(ship_ids) > 2 else ship_ids[0]
            }
        ]
        
        created_users = []
        
        for user_data in test_users:
            try:
                # Check if user already exists
                existing_users = await user_service.get_all_users()
                if any(u.email == user_data["email"] for u in existing_users):
                    print(f"⚠️  User {user_data['email']} already exists")
                    continue
                
                # Create user
                user_create = UserCreate(**user_data)
                created_user = await user_service.create_user(user_create)
                created_users.append(created_user)
                print(f"✅ Created user: {created_user.email} ({created_user.role})")
                
            except Exception as e:
                print(f"❌ Error creating user {user_data['email']}: {str(e)}")
        
        print(f"\n🎉 Successfully created {len(created_users)} test users!")
        print("\n📋 Test Accounts Ready:")
        print("┌─────────────────────────────────────────────────┐")
        print("│ Email                │ Role    │ Password        │")
        print("├─────────────────────────────────────────────────┤")
        for user in test_users:
            print(f"│ {user['email']:<20} │ {user['role']:<7} │ Test123456!    │")
        print("└─────────────────────────────────────────────────┘")
        print("\n💡 You can now sign in with these accounts!")
        
    except Exception as e:
        print(f"❌ Error creating test users: {str(e)}")

if __name__ == "__main__":
    asyncio.run(create_test_users())
