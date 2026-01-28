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

### Configure OpenAI (for Scenario Planning)

To enable AI-powered scenario responses on Netlify, set this environment variable in Netlify:

- `OPENAI_API_KEY` = your OpenAI API key

Security note: **do not** put API keys into `netlify.toml` or commit them to Git.
