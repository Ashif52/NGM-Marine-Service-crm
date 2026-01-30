# Railway Deployment Guide for NMG Marine System

This project is set up as a monorepo containing both the Frontend (React/Vite) and Backend (FastAPI).

## Prerequisites

- A Railway account (railway.app)
- GitHub account connected to Railway
- Project code pushed to GitHub

## Deployment Steps (Recommended: Via Dashboard)

This project requires deploying two separate services on Railway: one for the Backend (API) and one for the Frontend (UI).

### 1. Deploy the Backend (FastAPI)

1.  **New Service**: In Railway, click **New Project** -> **Deploy from GitHub repo**.
2.  **Select Repo**: Choose this repository (`NGM-Marine-Service-crm`).
3.  **Variable Setup**:
    - Go to the **Settings** tab of the new service.
    - Scroll down to **Root Directory** and set it to `/backend`.
    - Railway should automatically detect Python and install dependencies from `requirements.txt`.
4.  **Environment Variables**:
    - Go to the **Variables** tab.
    - Add all variables from `backend/.env`.
    - **CRITICAL**: For `FIREBASE_PRIVATE_KEY`, if you copy it from `.env`, ensure the newlines (`\n`) are correctly interpreted. In Railway's raw editor, you might need to paste the actual multi-line private key without `\n` characters (start with `-----BEGIN PRIVATE KEY-----` and end with `-----END PRIVATE KEY-----` on new lines).
    - Ensure `PORT` is not set manually (Railway sets it).
5.  **Build & Deploy**: Railway will build and deploy. Once successful, go to the **Settings** tab -> **Networking** -> **Generate Domain**.
    - Copy this domain (e.g., `nmg-backend-production.up.railway.app`). You will need it for the frontend.

### 2. Deploy the Frontend (React + Vite)

1.  **New Service**: In the same Railway project, click **+ New** -> **GitHub Repo**.
2.  **Select Repo**: Choose the same repository again (`NGM-Marine-Service-crm`).
3.  **Configuration**:
    - Go to the **Settings** tab.
    - **Root Directory**: Leave as `/` (default).
    - **Build Command**: `npm run build`
    - **Start Command**: `npm run preview -- --host --port $PORT`
    - **Output Directory**: `build` (ensure this matches `vite.config.ts`).
4.  **Environment Variables**:
    - Go to the **Variables** tab.
    - Add `VITE_API_BASE_URL`: Set this to `https://<YOUR_BACKEND_URL>.up.railway.app` (the domain you generated in step 1).
    - Add all `VITE_FIREBASE_*` variables from your local setup (`src/firebase.ts` or `.env` if you have it).
    - Ensure `PORT` is removed if it conflicts, usually Railway manages it.
5.  **Deploy**: Railway will install dependencies, build the site, and serve it.
6.  **Domain**: Go to **Settings** -> **Networking** -> **Generate Domain** to access your live site.

## Alternative: Using Railway CLI

If you prefer using the command line:

1.  **Install CLI**: `npm i -g @railway/cli`
2.  **Login**: `railway login`
3.  **Link**: `railway link` (Select project)
4.  **Deploy Backend**:
    ```bash
    cd backend
    railway up
    ```
5.  **Deploy Frontend**:
    ```bash
    cd ..
    railway up
    ```
    (Note: You might need to configure the services separately in `railway.toml` or interactively select them).

## Troubleshooting

-   **Backend 404/500**: Check Railway logs. Ensure `FIREBASE_PRIVATE_KEY` is formatted correctly (newlines are crucial).
-   **Frontend API Errors**: Open browser console. If you see CORS errors or 404s, verify `VITE_API_BASE_URL` matches the backend URL exactly (https://...).
-   **White Screen on Frontend**: Check build logs. Ensure `npm run build` completed effectively.

## Local Testing (Production-like)

To test the build locally before deploying:

1.  **Backend**:
    ```bash
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000
    ```

2.  **Frontend**:
    ```bash
    # In root directory
    npm run build
    npm run preview
    ```
