# Lloyds Financial Wellbeing Dashboard

A modern financial dashboard application with React frontend and Flask backend.

## Project Structure

```
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── backend/           # Flask API
│   ├── services/
│   ├── data/
│   └── app.py
└── README.md
```

## Getting Started

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
python app.py
```

The backend will run on http://localhost:5001

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

## Features

- Multi-profile support (James Thompson, Sarah Mitchell, David Williams)
- Real-time financial metrics
- Interactive charts and visualizations
- AI-powered financial insights
- Scenario planning
- Modern, responsive UI

## Technology Stack

- **Frontend**: React 18, Chart.js, Axios
- **Backend**: Flask, Python
- **Styling**: Modern CSS with CSS Variables
