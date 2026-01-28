## LBG Financial Overview – Run & Deploy Guide

This file explains:
- **How to run the app locally**
- **How to deploy it** (Netlify, frontend-only)
- **What links to share with your manager**
- **Short explanation of the code structure**

---

## 1. Running the application locally

### 1.1. Frontend (React)

1. In a **new** terminal window, from the project root:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. Open the browser at:
   - `http://localhost:3000`

---

## 2. Deploying the application

We deploy a **static frontend-only** build to **Netlify**.

### 2.1. Deploy to Netlify

1. Push the latest code to GitHub `main`.
2. In Netlify: **Add new site → Import an existing project** (connect your GitHub repo).
3. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
4. Deploy.

Notes:
- SPA refresh/deep-links are handled via `netlify.toml` + `frontend/public/_redirects`.
- Profile data is served from `frontend/public/data/profiles/*.json`.

---

## 3. What link to give to your manager?

- **Primary link (for demo / business users):**
  - The **Netlify site URL**, e.g. your `*.netlify.app` link
  - This is what you should share in emails, documents, or demo invites.

In most cases, **give your manager the Netlify link**.

---

## 4. How to run the deployed version (for you and QA)

Once deployment is done:

1. Open the **Netlify URL** in a browser.
2. No local setup is needed for end users or your manager.

To update the deployed app:
1. Make code changes locally.
2. Commit and push to the GitHub `main` branch.
3. Netlify will automatically redeploy the latest version.

---

## 5. Short explanation of the code

- **Frontend (`frontend/`)**
  - `src/App.js`: main React entry that wires together the dashboard and layout.
  - `src/components/`: UI components for:
    - Dashboard layout, metrics cards, charts (income vs expenses, wealth trajectory, etc.)
    - Scenario planning and simulation modals
    - Insight summaries
  - `src/utils/api.js`: loads profile JSON from `public/data/profiles/` and computes snapshots/summaries in-browser.
  - `App.css` and component CSS files: handle styling for a clean, dashboard-style UI.

This structure keeps everything **frontend-only**, which makes it easy to deploy as a static site on Netlify.

