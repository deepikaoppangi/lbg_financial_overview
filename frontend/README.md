# Lloyds Financial Dashboard - React Frontend

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

The app will run on http://localhost:3000

## Data / Backend

This project runs in **frontend-only mode**:

- Profile data is served from `public/data/profiles/*.json`
- Snapshot + summaries are computed in-browser (no backend, no API)

## Build for Production

```bash
npm run build
```

## Deploy to Netlify

This repo is configured for Netlify using `../netlify.toml` (base dir `frontend/`).
