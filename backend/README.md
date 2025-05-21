# Backend (FastAPI)

This directory contains a minimal FastAPI application for the Daily Options Dashboard.

## Running Locally

1. Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Start the development server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Endpoints

- `GET /current-market-data` – Returns current price, support, resistance and 50‑day moving average (MA50) for each ETF plus market info.

