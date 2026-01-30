#!/usr/bin/env python3
"""
Comprehensive Backend API Test Script for NMG Marine Management System
Tests all API endpoints and verifies data is stored in Firestore database
"""

import asyncio
import httpx
import json
from datetime import datetime, timedelta
from typing import Optional

# Configuration
BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"

# Test user credentials (Firebase Auth)
TEST_USERS = {
    "master": {"email": "master@nmg-marine.com", "password": "Test123456!"},
    "staff": {"email": "staff@nmg-marine.com", "password": "Test123456!"},
    "crew": {"email": "crew@nmg-marine.com", "password": "Test123456!"},
}

# Results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "errors": [],
    "details": []
}


def log_result(test_name: str, success: bool, message: str = "", data: dict = None):
    """Log test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {test_name}")
    if message:
        print(f"   └─ {message}")
    if data and not success:
        print(f"   └─ Response: {json.dumps(data, indent=2)[:500]}")
    
    if success:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1
        test_results["errors"].append({"test": test_name, "message": message, "data": data})
    
    test_results["details"].append({
        "test": test_name,
        "success": success,
        "message": message
    })


async def get_firebase_token(email: str, password: str) -> Optional[str]:
    """Get Firebase ID token for authentication"""
    # Firebase Auth REST API
    firebase_api_key = "AIzaSyA3pqh5mPDzwk3ynWFCSUwO8HLLixERt_g"  # From .env
    firebase_auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                firebase_auth_url,
                json={
                    "email": email,
                    "password": password,
                    "returnSecureToken": True
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("idToken")
            else:
                print(f"   ⚠️ Firebase auth failed: {response.text[:200]}")
                return None
        except Exception as e:
            print(f"   ⚠️ Firebase auth error: {e}")
            return None


async def test_health_endpoint():
    """Test health check endpoint"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/health")
            success = response.status_code == 200 and response.json().get("status") == "healthy"
            log_result("Health Check", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            log_result("Health Check", False, str(e))
            return False


async def test_root_endpoint():
    """Test root endpoint"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(BASE_URL)
            success = response.status_code == 200
            log_result("Root Endpoint", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            log_result("Root Endpoint", False, str(e))
            return False


async def test_users_api(token: str):
    """Test Users API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test GET /users/me
        try:
            response = await client.get(f"{API_V1}/users/me", headers=headers)
            success = response.status_code == 200
            user_data = response.json() if success else {}
            log_result("GET /users/me", success, f"User: {user_data.get('name', 'N/A')}")
        except Exception as e:
            log_result("GET /users/me", False, str(e))
        
        # Test GET /users (all users - requires staff/master)
        try:
            response = await client.get(f"{API_V1}/users/", headers=headers)
            success = response.status_code == 200
            users = response.json() if success else []
            log_result("GET /users", success, f"Found {len(users)} users")
        except Exception as e:
            log_result("GET /users", False, str(e))


async def test_ships_api(token: str):
    """Test Ships API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test GET /ships
        try:
            response = await client.get(f"{API_V1}/ships/", headers=headers)
            success = response.status_code == 200
            ships = response.json() if success else []
            log_result("GET /ships", success, f"Found {len(ships)} ships")
            return ships
        except Exception as e:
            log_result("GET /ships", False, str(e))
            return []


async def test_pms_api(token: str, ship_id: str):
    """Test PMS API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test GET /pms (with ship_id)
        try:
            response = await client.get(f"{API_V1}/pms/?ship_id={ship_id}", headers=headers)
            success = response.status_code == 200
            tasks = response.json() if success else []
            log_result("GET /pms", success, f"Found {len(tasks)} tasks for ship {ship_id}")
        except Exception as e:
            log_result("GET /pms", False, str(e))
        
        # Test POST /pms (create task)
        try:
            task_data = {
                "ship_id": ship_id,
                "equipment_name": f"Test Equipment {datetime.now().strftime('%H%M%S')}",
                "task_description": "Test maintenance task created by backend test script",
                "frequency": "monthly",
                "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                "assigned_to": "Test Crew",
                "estimated_hours": 2.0
            }
            response = await client.post(f"{API_V1}/pms/", headers=headers, json=task_data)
            success = response.status_code == 200
            created_task = response.json() if success else {}
            task_id = created_task.get("id", "N/A")
            log_result("POST /pms (Create Task)", success, f"Created task ID: {task_id}", response.json() if not success else None)
            
            if success and task_id != "N/A":
                # Test GET /pms/{task_id}
                try:
                    response = await client.get(f"{API_V1}/pms/{task_id}", headers=headers)
                    success = response.status_code == 200
                    log_result("GET /pms/{task_id}", success, f"Retrieved task: {task_id}")
                except Exception as e:
                    log_result("GET /pms/{task_id}", False, str(e))
                
                # Test PUT /pms/{task_id}
                try:
                    update_data = {
                        "status": "in_progress",
                        "completion_notes": "Task started by test script"
                    }
                    response = await client.put(f"{API_V1}/pms/{task_id}", headers=headers, json=update_data)
                    success = response.status_code == 200
                    log_result("PUT /pms/{task_id} (Update Task)", success, f"Updated task: {task_id}")
                except Exception as e:
                    log_result("PUT /pms/{task_id}", False, str(e))
                    
        except Exception as e:
            log_result("POST /pms (Create Task)", False, str(e))


async def test_dashboard_api(token: str):
    """Test Dashboard API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test GET /dashboard/fleet-summary
        try:
            response = await client.get(f"{API_V1}/dashboard/fleet-summary", headers=headers)
            success = response.status_code == 200
            data = response.json() if success else {}
            log_result("GET /dashboard/fleet-summary", success, f"Ships: {data.get('total_ships', 'N/A')}")
        except Exception as e:
            log_result("GET /dashboard/fleet-summary", False, str(e))
        
        # Test GET /dashboard/my-tasks
        try:
            response = await client.get(f"{API_V1}/dashboard/my-tasks", headers=headers)
            success = response.status_code == 200
            log_result("GET /dashboard/my-tasks", success)
        except Exception as e:
            log_result("GET /dashboard/my-tasks", False, str(e))
        
        # Test GET /dashboard/notifications
        try:
            response = await client.get(f"{API_V1}/dashboard/notifications", headers=headers)
            success = response.status_code == 200
            log_result("GET /dashboard/notifications", success)
        except Exception as e:
            log_result("GET /dashboard/notifications", False, str(e))


async def test_incidents_api(token: str, ship_id: str):
    """Test Incidents API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test POST /incidents (create incident)
        try:
            incident_data = {
                "ship_id": ship_id,
                "title": f"Test Incident {datetime.now().strftime('%H%M%S')}",
                "description": "Test incident created by backend test script",
                "incident_type": "safety",
                "severity": "medium",
                "location": "Engine Room",
                "date_time": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
                "injuries": False,
                "witnesses": "Test Witness"
            }
            response = await client.post(f"{API_V1}/incidents/", headers=headers, json=incident_data)
            success = response.status_code == 200
            created = response.json() if success else {}
            incident_id = created.get("id", "N/A")
            log_result("POST /incidents (Create)", success, f"Created ID: {incident_id}", response.json() if not success else None)
        except Exception as e:
            log_result("POST /incidents (Create)", False, str(e))
        
        # Test GET /incidents
        try:
            response = await client.get(f"{API_V1}/incidents/", headers=headers)
            success = response.status_code == 200
            incidents = response.json() if success else []
            log_result("GET /incidents", success, f"Found {len(incidents)} incidents")
        except Exception as e:
            log_result("GET /incidents", False, str(e))


async def test_audits_api(token: str, ship_id: str):
    """Test Audits API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test POST /audits (create audit)
        try:
            audit_data = {
                "ship_id": ship_id,
                "audit_type": "internal",
                "title": f"Test Audit {datetime.now().strftime('%H%M%S')}",
                "description": "Test audit created by backend test script",
                "scheduled_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                "auditor": "Test Auditor"
            }
            response = await client.post(f"{API_V1}/audits/", headers=headers, json=audit_data)
            success = response.status_code == 200
            created = response.json() if success else {}
            audit_id = created.get("id", "N/A")
            log_result("POST /audits (Create)", success, f"Created ID: {audit_id}", response.json() if not success else None)
        except Exception as e:
            log_result("POST /audits (Create)", False, str(e))
        
        # Test GET /audits
        try:
            response = await client.get(f"{API_V1}/audits/", headers=headers)
            success = response.status_code == 200
            audits = response.json() if success else []
            log_result("GET /audits", success, f"Found {len(audits)} audits")
        except Exception as e:
            log_result("GET /audits", False, str(e))


async def test_cargo_api(token: str, ship_id: str):
    """Test Cargo API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test POST /cargo (create cargo operation)
        try:
            cargo_data = {
                "ship_id": ship_id,
                "cargo_type": "loading",
                "cargo_name": f"Test Cargo {datetime.now().strftime('%H%M%S')}",
                "quantity": 1000.0,
                "unit": "MT",
                "port": "Singapore",
                "scheduled_date": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
                "notes": "Test cargo operation"
            }
            response = await client.post(f"{API_V1}/cargo/", headers=headers, json=cargo_data)
            success = response.status_code == 200
            created = response.json() if success else {}
            cargo_id = created.get("id", "N/A")
            log_result("POST /cargo (Create)", success, f"Created ID: {cargo_id}", response.json() if not success else None)
        except Exception as e:
            log_result("POST /cargo (Create)", False, str(e))
        
        # Test GET /cargo
        try:
            response = await client.get(f"{API_V1}/cargo/", headers=headers)
            success = response.status_code == 200
            operations = response.json() if success else []
            log_result("GET /cargo", success, f"Found {len(operations)} cargo operations")
        except Exception as e:
            log_result("GET /cargo", False, str(e))


async def verify_database_connection():
    """Verify Firestore database connection"""
    print("\n" + "="*60)
    print("🔍 VERIFYING DATABASE CONNECTION")
    print("="*60)
    
    try:
        from app.database import db
        # Try to read a collection
        ships_ref = db.collection('ships')
        ships = ships_ref.limit(1).stream()
        ship_count = sum(1 for _ in ships)
        log_result("Firestore Connection", True, f"Connected, found ships collection")
        
        # Check collections
        collections = ['users', 'ships', 'pms_tasks']
        for coll_name in collections:
            try:
                coll_ref = db.collection(coll_name)
                docs = list(coll_ref.limit(5).stream())
                log_result(f"Collection: {coll_name}", True, f"Found {len(docs)} documents")
            except Exception as e:
                log_result(f"Collection: {coll_name}", False, str(e))
                
    except Exception as e:
        log_result("Firestore Connection", False, str(e))


async def run_all_tests():
    """Run all backend tests"""
    print("\n" + "="*60)
    print("🧪 NMG MARINE BACKEND API TEST SUITE")
    print("="*60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: {BASE_URL}")
    print("="*60)
    
    # Test basic endpoints
    print("\n📡 TESTING BASIC ENDPOINTS")
    print("-"*40)
    await test_health_endpoint()
    await test_root_endpoint()
    
    # Get Firebase token for master user
    print("\n🔐 AUTHENTICATING AS MASTER USER")
    print("-"*40)
    master_creds = TEST_USERS["master"]
    token = await get_firebase_token(master_creds["email"], master_creds["password"])
    
    if not token:
        log_result("Firebase Authentication", False, "Could not get auth token")
        print("\n⚠️ Cannot proceed with authenticated tests without token")
    else:
        log_result("Firebase Authentication", True, f"Token obtained for {master_creds['email']}")
        
        # Test authenticated endpoints
        print("\n👤 TESTING USERS API")
        print("-"*40)
        await test_users_api(token)
        
        print("\n🚢 TESTING SHIPS API")
        print("-"*40)
        ships = await test_ships_api(token)
        
        print("\n🔧 TESTING PMS API")
        print("-"*40)
        if ships:
            ship_id = ships[0].get("id") if isinstance(ships[0], dict) else ships[0].id
            await test_pms_api(token, ship_id)
        else:
            log_result("PMS API Tests", False, "No ships available for testing")
        
        print("\n📊 TESTING DASHBOARD API")
        print("-"*40)
        await test_dashboard_api(token)
        
        print("\n🚨 TESTING INCIDENTS API")
        print("-"*40)
        if ships:
            await test_incidents_api(token, ship_id)
        
        print("\n📋 TESTING AUDITS API")
        print("-"*40)
        if ships:
            await test_audits_api(token, ship_id)
        
        print("\n📦 TESTING CARGO API")
        print("-"*40)
        if ships:
            await test_cargo_api(token, ship_id)
    
    # Print summary
    print("\n" + "="*60)
    print("📋 TEST SUMMARY")
    print("="*60)
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"📊 Total:  {test_results['passed'] + test_results['failed']}")
    
    if test_results['errors']:
        print("\n🔴 FAILED TESTS:")
        for error in test_results['errors']:
            print(f"   • {error['test']}: {error['message']}")
    
    print("\n" + "="*60)
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    return test_results


if __name__ == "__main__":
    asyncio.run(run_all_tests())
