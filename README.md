# Lloyds Financial Wellness Hub

A modern, customer-centric financial dashboard application built with Flask, featuring AI-powered insights and comprehensive financial analytics.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation & Setup

1. **Clone or navigate to the project directory:**

   ```bash
   cd lbg_financial_overview
   ```

2. **Create a virtual environment (recommended):**

   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the logo file (if needed):**

   - Ensure `Lloyds-Banking-Group-logo.webp` is in the `static/` directory
   - If it's in the root, copy it: `copy Lloyds-Banking-Group-logo.webp static\` (Windows) or `cp Lloyds-Banking-Group-logo.webp static/` (macOS/Linux)

5. **Optional - Set up OpenAI API Key (for AI features):**
   - Create a `secrets` directory: `mkdir secrets`
   - Create `secrets/openai_key.txt` and add your OpenAI API key (one line)
   - OR set environment variable: `set OPENAI_API_KEY=your_key_here` (Windows) or `export OPENAI_API_KEY=your_key_here` (macOS/Linux)
   - Note: The app works without this, but AI-powered insights and simulations will be disabled

## Running the Application

1. **Activate your virtual environment** (if you created one):

   ```bash
   # Windows
   venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```

2. **Run the Flask application:**

   ```bash
   python app.py
   ```

3. **Open your browser:**
   - Navigate to: `http://127.0.0.1:5000` or `http://localhost:5000`
   - The dashboard should load with your financial data

## Project Structure

```
lbg_financial_overview/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── data/                  # JSON data files
│   ├── time_series.json
│   └── expenses.json
├── services/              # Backend services
│   ├── data_service.py
│   ├── finance_engine.py
│   ├── llm_service.py
│   └── summary_engine.py
├── templates/            # HTML templates
│   └── index.html
├── static/               # Static assets
│   ├── app.css
│   ├── app.js
│   └── Lloyds-Banking-Group-logo.webp
└── secrets/              # Optional: API keys (not in repo)
    └── openai_key.txt
```

## Features

- **Financial Dashboard**: View income, expenses, savings, and financial wellness metrics
- **Interactive Charts**: Visualize financial flow, wealth trajectory, and spending behavior
- **Customer Engagement Metrics**: Track savings rate, spending efficiency, and goal progress
- **AI-Powered Insights**: Get personalized financial summaries and scenario planning
- **Period Selection**: View data for 6 months, 1 year, 3 years, or 5 years

## Troubleshooting

- **Port already in use**: Change the port in `app.py` (line 93) from `5000` to another port (e.g., `5001`)
- **Module not found**: Ensure you've activated your virtual environment and installed requirements
- **Logo not showing**: Verify `Lloyds-Banking-Group-logo.webp` exists in the `static/` directory
- **Data not loading**: Check that `data/time_series.json` and `data/expenses.json` exist and are valid JSON

## Development

The application runs in debug mode by default. To disable debug mode, change `debug=True` to `debug=False` in `app.py`.
