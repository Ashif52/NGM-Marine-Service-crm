from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Import all routes
from app.routes.users import router as users_router
from app.routes.ships import router as ships_router
from app.routes.pms import router as pms_router
from app.routes.admin import router as admin_router
from app.routes.incidents import router as incidents_router
from app.routes.audits import router as audits_router
from app.routes.cargo import router as cargo_router
from app.routes.worklogs import router as worklogs_router
from app.routes.bunkering import router as bunkering_router
from app.routes.recruitment import router as recruitment_router
from app.routes.dg_communications import router as dg_communications_router
from app.routes.invoices import router as invoices_router
from app.routes.clients import router as clients_router
from app.routes.dashboard import router as dashboard_router
from app.routes.documents import router as documents_router
from app.database import ship_service, user_service
from app.schemas import *

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    print("🚀 NMG Marine Management System starting up...")
    
    # Initialize default data
    await initialize_default_data()
    
    yield
    
    print("🔄 NMG Marine Management System shutting down...")

app = FastAPI(
    title=os.getenv("PROJECT_NAME", "NMG Marine Management System"),
    description="Complete Role-Based PMS & CRM System for Marine Fleet Management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NMG Marine Management System",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "NMG Marine Management System API",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

# Include all routers
app.include_router(users_router, prefix="/api/v1")
app.include_router(ships_router, prefix="/api/v1") 
app.include_router(pms_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(incidents_router, prefix="/api/v1")
app.include_router(audits_router, prefix="/api/v1")
app.include_router(cargo_router, prefix="/api/v1")
app.include_router(worklogs_router, prefix="/api/v1")
app.include_router(bunkering_router, prefix="/api/v1")
app.include_router(recruitment_router, prefix="/api/v1")
app.include_router(dg_communications_router, prefix="/api/v1")
app.include_router(invoices_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(clients_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Initialize default data function
async def initialize_default_data():
    """Initialize default ships and demo users"""
    try:
        # Check if ships already exist
        existing_ships = await ship_service.get_all_ships()
        if len(existing_ships) > 0:
            print("📊 Default data already exists")
            return
        
        print("🔄 Initializing default fleet data...")
        
        # Create the 7 ships from the system overview
        default_ships = [
            {
                "name": "MV Ocean Star",
                "type": "bulk_carrier",
                "imo_number": "IMO9001001",
                "flag_state": "Panama",
                "status": "active",
                "call_sign": "H3RC",
                "gross_tonnage": 35000.0,
                "built_year": 2018,
                "owner": "NMG Marine Corp",
                "operator": "NMG Operations"
            },
            {
                "name": "MT Pacific Wave", 
                "type": "oil_tanker",
                "imo_number": "IMO9001002",
                "flag_state": "Liberia",
                "status": "active",
                "call_sign": "A8TC",
                "gross_tonnage": 45000.0,
                "built_year": 2020,
                "owner": "NMG Marine Corp",
                "operator": "NMG Operations"
            },
            {
                "name": "MV Atlantic Trader",
                "type": "container_ship",
                "imo_number": "IMO9001003", 
                "flag_state": "Marshall Islands",
                "status": "active",
                "call_sign": "V7AA",
                "gross_tonnage": 85000.0,
                "built_year": 2019,
                "owner": "NMG Marine Corp",
                "operator": "NMG Operations"
            },
            {
                "name": "MT Indian Star",
                "type": "chemical_tanker",
                "imo_number": "IMO9001004",
                "flag_state": "Singapore",
                "status": "maintenance",
                "call_sign": "9VXY",
                "gross_tonnage": 25000.0,
                "built_year": 2017,
                "owner": "NMG Marine Corp",
                "operator": "NMG Operations"
            },
            {
                "name": "MV Arctic Explorer",
                "type": "bulk_carrier",
                "imo_number": "IMO9001005",
                "flag_state": "Norway",
                "status": "active",
                "call_sign": "LABC",
                "gross_tonnage": 40000.0,
                "built_year": 2021,
                "owner": "NMG Marine Corp",
                "operator": "NMG Operations"
            },
            {
                "name": "MT Mediterranean",
                "type": "oil_tanker",
                "imo_number": "IMO9001006",
                "flag_state": "Malta",
                "status": "docked",
                "call_sign": "9HXY",
                "gross_tonnage": 55000.0,
                "built_year": 2016,
                "owner": "NMG Marine Corp",
                "operator": "NMG Operations"
            },
            {
                "name": "MV Global Trader",
                "type": "container_ship",
                "imo_number": "IMO9001007",
                "flag_state": "Hong Kong",
                "status": "active",
                "call_sign": "VRXY",
                "gross_tonnage": 95000.0,
                "built_year": 2022,
                "owner": "NMG Marine Corp", 
                "operator": "NMG Operations"
            }
        ]
        
        # Create ships
        for ship_data in default_ships:
            try:
                ship_create = ShipCreate(**ship_data)
                created_ship = await ship_service.create_ship(ship_create)
                print(f"✅ Created ship: {created_ship.name}")
            except Exception as ship_error:
                print(f"❌ Error creating ship {ship_data.get('name', 'Unknown')}: {str(ship_error)}")
                print(f"   Ship data: {ship_data}")
                continue
        
        print("🎉 Default fleet data initialized successfully!")
        
    except Exception as e:
        print(f"❌ Error initializing default data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
