## LBG Financial Overview – Run & Deploy Guide

This file explains:
- **How to run the app locally**
- **How to deploy it** (Flask backend on Render, React frontend on Vercel)
- **What links to share with your manager**
- **Short explanation of the code structure**

---

## 1. Running the application locally

### 1.1. Backend (Flask)

1. Open a terminal in the project root folder:
   - `lbg_financial_overview` (the folder containing `backend/`, `frontend/`, etc.)
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # On Windows
   # source .venv/bin/activate  # On macOS/Linux
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. Ensure your environment variables (like `OPENAI_API_KEY`) are set in your system or a local `.env` file.
5. Run the backend:
   ```bash
   python app.py
   ```
6. The API will be available at:
   - `http://127.0.0.1:5001/api/profiles`
   - `http://127.0.0.1:5001/api/snapshot`
   - `http://127.0.0.1:5001/api/simulate`

### 1.2. Frontend (React)

1. In a **new** terminal window, from the project root:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. Open the browser at:
   - `http://localhost:3000`
3. The React app will call the backend at:
   - `http://127.0.0.1:5001` (default when `REACT_APP_API_URL` is not set)

---

## 2. Deploying the application

We deploy:
- **Backend (Flask)** → **Render**
- **Frontend (React)** → **Vercel**

### 2.1. Deploy backend to Render

1. Push all code to GitHub (already done).
2. Go to `https://render.com` and sign in with GitHub.
3. Click **“New +” → “Web Service”**.
4. Select the GitHub repo: `deepikaoppangi/lbg_financial_overview`.
5. In the service configuration:
   - **Name**: e.g. `lbg-financial-backend`
   - **Root Directory / Working Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**:  
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:  
     ```bash
     gunicorn app:app
     ```
6. Add environment variables (if needed):
   - `OPENAI_API_KEY` = `<your-key>`
7. Click **Create Web Service** and wait for the build to finish.

When it’s live, Render will give you a URL like:
- `https://lbg-financial-backend.onrender.com`

Your public API endpoints will be:
- `https://lbg-financial-backend.onrender.com/api/profiles`
- `https://lbg-financial-backend.onrender.com/api/snapshot`
- `https://lbg-financial-backend.onrender.com/api/simulate`

### 2.2. Deploy frontend to Vercel

1. Go to `https://vercel.com` and sign in with GitHub.
2. Click **“Add New…” → “Project”**.
3. Import the `lbg_financial_overview` GitHub repository.
4. In **Project Settings** (before first deploy):
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Create React App` (usually auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add an environment variable for the backend URL:
   - `REACT_APP_API_URL` = `https://lbg-financial-backend.onrender.com`
6. Click **Deploy** and wait for the deployment to finish.

Vercel will give you a URL like:
- `https://lbg-financial-frontend.vercel.app`

The deployed React app will call the deployed backend via:
- `REACT_APP_API_URL/api/...` (for profiles, snapshot, and simulate).

---

## 3. What link to give to your manager?

- **Primary link (for demo / business users):**
  - The **Vercel frontend URL**, e.g.  
    `https://lbg-financial-frontend.vercel.app`
  - This is what you should share in emails, documents, or demo invites.

- **Technical link (optional, for backend/API):**
  - The **Render backend URL**, e.g.  
    `https://lbg-financial-backend.onrender.com`
  - This is mainly for developers or technical reviewers who want to see the API directly.

In most cases, **give your manager the Vercel link**, and mention in your documentation that the backend is hosted on Render.

---

## 4. How to run the deployed version (for you and QA)

Once deployment is done:

1. Open the **Vercel URL** in a browser:
   - Example: `https://lbg-financial-frontend.vercel.app`
2. The frontend will automatically talk to the backend on Render:
   - Example backend: `https://lbg-financial-backend.onrender.com`
3. No local setup is needed for end users or your manager.

To update the deployed app:
1. Make code changes locally.
2. Commit and push to the GitHub `main` branch.
3. Render and Vercel will automatically redeploy the latest version.

---

## 5. Short explanation of the code

- **Backend (`backend/`)**
  - `app.py`: Flask application exposing:
    - `GET /api/profiles` → available customer profiles.
    - `POST /api/snapshot` → financial snapshot and summary for a selected profile and period.
    - `POST /api/simulate` → scenario simulation using an LLM (if `OPENAI_API_KEY` is configured).
  - `services/`:
    - `data_service.py`: loads time series and expense configuration data.
    - `finance_engine.py`: calculates incomes, expenses, savings, resilience, liquidity, etc.
    - `summary_engine.py`: builds human-readable financial summaries.
    - `llm_service.py`: calls the LLM to generate scenario-based advice.
  - `data/`: JSON files with example customer profiles and their financial data.

- **Frontend (`frontend/`)**
  - `src/App.js`: main React entry that wires together the dashboard and layout.
  - `src/components/`: UI components for:
    - Dashboard layout, metrics cards, charts (income vs expenses, wealth trajectory, etc.)
    - Scenario planning and simulation modals
    - Insight summaries
  - `src/utils/api.js`: central place that calls the backend API using Axios. It reads:
    - `REACT_APP_API_URL` (for production) or defaults to `http://localhost:5001` (for local dev).
  - `App.css` and component CSS files: handle styling for a clean, dashboard-style UI.

This structure keeps **backend (data + intelligence)** and **frontend (visualization + UX)** clearly separated, which makes it easy to develop and deploy each side independently.

