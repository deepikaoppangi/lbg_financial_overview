# Lloyds Financial Wellbeing Dashboard

A modern financial dashboard application running as a **static React frontend** (no backend).

## Project Structure

```
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Getting Started

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Deploy to Netlify (recommended)

This repo includes `netlify.toml` configured to build from `frontend/` and publish the CRA build output.

### OpenAI key (Scenario Planning)

To enable AI-powered scenario output on Netlify, add this environment variable in Netlify site settings:

- `OPENAI_API_KEY`

Do **not** store API keys in `netlify.toml` or commit them to Git.

## Features

- Multi-profile support (James Thompson, Sarah Mitchell, David Williams)
- Real-time financial metrics
- Interactive charts and visualizations
- AI-powered financial insights
- Scenario planning
- Modern, responsive UI

## Technology Stack

- **Frontend**: React 18, Chart.js, Axios
- **Styling**: Modern CSS with CSS Variables
