# NMG Marine Management System - Deployment Guide

## Overview

This comprehensive guide will help you deploy the NMG Marine Management System, a full-stack maritime fleet management application with role-based access control for managing 7 ships with PMS (Planned Maintenance System), crew logs, and operational management.

## System Architecture

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: FastAPI (Python) + Firebase Admin SDK
- **Database**: Google Firestore
- **Authentication**: Firebase Auth
- **Deployment**: Local development → Production ready

---

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Python** (v3.9 or higher) - [Download](https://python.org/)
3. **Git** - [Download](https://git-scm.com/)
4. **Firebase Project** - [Firebase Console](https://console.firebase.google.com/)

### Development Environment
- **IDE**: VS Code recommended
- **OS**: Windows, macOS, or Linux
- **RAM**: Minimum 8GB recommended
- **Storage**: At least 2GB free space

---

## Step-by-Step Deployment

### 1. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name: `nmg-marine-crm` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

#### Enable Firebase Services
1. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Add authorized domains if needed

2. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select your region

3. **Firebase Admin SDK**:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - **IMPORTANT**: Keep this file secure!

#### Configure Firebase Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Ships collection  
    match /ships/{shipId} {
      allow read, write: if request.auth != null;
    }
    
    // PMS Tasks
    match /pms_tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    // Crew Logs
    match /crew_logs/{logId} {
      allow read, write: if request.auth != null;
    }
    
    // Invoices
    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Clone and Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd "NMG MODEL1"

# Install frontend dependencies
npm install

# Setup backend environment
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
cd ..
```

### 3. Environment Configuration

#### Frontend Environment (.env)
Create `.env` file in the project root:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend API URL
VITE_API_BASE_URL=http://localhost:8000
```

#### Backend Environment (backend/.env)
Create `backend/.env` file:
```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# API Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key_change_this_in_production
API_V1_STR=/api/v1
PROJECT_NAME=NMG Marine Management System

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### 4. Create Demo Users

Create demo users in Firebase Authentication console:

1. **Master User**:
   - Email: `master@nmg-marine.com`
   - Password: `Master123!`
   - Role: master

2. **Staff User**:
   - Email: `staff@nmg-marine.com`
   - Password: `Staff123!`
   - Role: staff

3. **Crew User**:
   - Email: `crew@nmg-marine.com`
   - Password: `Crew123!`
   - Role: crew

### 5. Database Initialization

The backend will automatically initialize the 7 default ships when first started:
- MV Ocean Star (Bulk Carrier)
- MT Pacific Wave (Oil Tanker)
- MV Atlantic Trader (Container Ship)
- MT Indian Star (Chemical Tanker)
- MV Arctic Explorer (Bulk Carrier)
- MT Mediterranean (Oil Tanker)
- MV Global Trader (Container Ship)

### 6. Start the Application

#### Option 1: Using Batch Scripts (Windows)

**Terminal 1 - Start Backend**:
```bash
# Double-click or run:
start-backend.bat
```

**Terminal 2 - Start Frontend**:
```bash
# Double-click or run:
start-frontend.bat
```

#### Option 2: Manual Start

**Terminal 1 - Backend**:
```bash
cd backend
# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend**:
```bash
# Start Vite development server
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## User Roles & Access

### Master (Super Admin)
- **Access**: All 7 ships, all features
- **Capabilities**:
  - Fleet overview and management
  - User management and role assignment
  - PMS task approval workflows
  - Crew daily log approvals
  - Invoice approvals
  - System settings and access control

### Staff (Operations)
- **Access**: All ships, operations only
- **Capabilities**:
  - Crew onboarding and management
  - Invoice creation and management
  - PMS oversight and scheduling
  - Operations reports
  - Multi-ship data access

### Crew (Limited Access)
- **Access**: Assigned ship only
- **Capabilities**:
  - Submit daily work logs
  - Update PMS task status
  - Upload maintenance photos
  - View assigned tasks only
  - Mobile-optimized interface

---

## API Endpoints

### Authentication
- `GET /health` - Health check
- `GET /api/v1/users/me` - Get current user

### Users Management
- `POST /api/v1/users` - Create user (Master only)
- `GET /api/v1/users` - Get all users
- `PUT /api/v1/users/{user_id}` - Update user

### Ships Management
- `GET /api/v1/ships` - Get all ships
- `GET /api/v1/ships/{ship_id}` - Get ship details
- `POST /api/v1/ships` - Create ship (Master only)

### PMS (Planned Maintenance)
- `GET /api/v1/pms` - Get PMS tasks
- `POST /api/v1/pms` - Create PMS task
- `PUT /api/v1/pms/{task_id}` - Update task
- `POST /api/v1/pms/{task_id}/approve` - Approve task (Master only)

### Dashboard
- `GET /api/v1/dashboard/fleet-summary` - Fleet overview (Master only)
- `GET /api/v1/dashboard/my-tasks` - User-specific dashboard
- `GET /api/v1/dashboard/notifications` - User notifications

---

## Production Deployment

### Environment Variables
Update environment files for production:

**Frontend (.env.production)**:
```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_domain
VITE_FIREBASE_PROJECT_ID=your_production_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_production_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
VITE_FIREBASE_APP_ID=your_production_app_id
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Build Commands

**Frontend Build**:
```bash
npm run build
# Output: dist/ folder
```

**Backend Production**:
```bash
pip install gunicorn
gunicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Deployment Options

1. **Traditional VPS**:
   - Deploy built frontend to Nginx
   - Run backend with Gunicorn + Nginx reverse proxy
   - Use PM2 for process management

2. **Cloud Platforms**:
   - **Frontend**: Netlify, Vercel, Firebase Hosting
   - **Backend**: Railway, Render, DigitalOcean App Platform
   - **Database**: Firebase Firestore (already cloud-hosted)

3. **Docker Deployment**:
   - Create Docker containers for frontend and backend
   - Use docker-compose for orchestration
   - Deploy to any container platform

---

## Security Checklist

### Critical Security Items
- ✅ Firebase credentials moved to environment variables
- ✅ Service account key secured (not in repository)
- ✅ CORS configured for specific domains
- ✅ Role-based access control implemented
- ✅ JWT token validation on all API endpoints

### Additional Security Recommendations
- [ ] Enable Firebase App Check for production
- [ ] Implement rate limiting on API endpoints
- [ ] Add request size limits
- [ ] Enable HTTPS in production
- [ ] Configure proper CSP headers
- [ ] Implement audit logging
- [ ] Regular security updates

---

## Troubleshooting

### Common Issues

**1. Backend won't start**:
```bash
# Check Python virtual environment
python --version
pip list

# Verify environment variables
cat backend/.env
```

**2. Frontend build errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. Firebase connection issues**:
- Verify API keys in `.env` file
- Check Firebase project settings
- Ensure Firestore is enabled
- Check authentication configuration

**4. CORS errors**:
- Update `BACKEND_CORS_ORIGINS` in backend/.env
- Ensure frontend URL matches CORS origins

**5. Database connection issues**:
- Verify Firebase service account credentials
- Check Firestore security rules
- Ensure Firebase Admin SDK is properly configured

### Debug Mode
Enable verbose logging:

**Backend**:
```bash
export LOG_LEVEL=debug
python -m uvicorn app.main:app --log-level debug
```

**Frontend**:
```bash
npm run dev -- --debug
```

---

## Monitoring & Maintenance

### Health Checks
- Backend: `GET /health`
- Frontend: Check console for errors
- Database: Monitor Firestore usage in Firebase Console

### Regular Maintenance
1. **Weekly**: Check application logs for errors
2. **Monthly**: Update dependencies (`npm audit`, `pip list --outdated`)
3. **Quarterly**: Review and update Firebase security rules
4. **Annually**: Update major framework versions

### Backup Strategy
- **Database**: Firestore automatic backups
- **Code**: Git repository with regular commits
- **Environment**: Document all configuration changes

---

## Support & Documentation

### Additional Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

### Getting Help
1. Check this deployment guide first
2. Review application logs for specific error messages
3. Check Firebase Console for authentication/database issues
4. Consult the `PROJECT_ANALYSIS.md` for system architecture details

---

## Conclusion

The NMG Marine Management System is now ready for deployment. This system provides:

- **Complete Role-Based Access Control** for Master, Staff, and Crew users
- **Real-Time Fleet Management** for 7 ships
- **Comprehensive PMS System** with approval workflows
- **Mobile-Optimized Interface** for crew members
- **Production-Ready Architecture** with proper security

Follow this guide carefully, and you'll have a fully functional maritime management system running in both development and production environments.

For any technical issues or questions, refer to the troubleshooting section or contact the development team.
