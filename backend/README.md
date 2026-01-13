# Lloyds Financial Dashboard - Flask Backend

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
python app.py
```

The API will run on http://localhost:5001

## API Endpoints

- `GET /api/profiles` - Get list of available profiles
- `POST /api/snapshot` - Get financial snapshot
- `POST /api/simulate` - Run financial simulation
