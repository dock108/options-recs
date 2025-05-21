# Daily Options Dashboard

This project is a simple, extensible dashboard for daily options data. It is organized as a monorepo with two main components:

- **/frontend**: React-based UI
- **/backend**: Python FastAPI backend

## Getting Started

### Frontend

1. `cd frontend`
2. `npm start`

This will start the React development server on [http://localhost:3000](http://localhost:3000).

✅ Confirmed: The frontend dev server starts successfully.

### Backend

1. `cd backend`
2. `source venv/bin/activate`
3. `uvicorn main:app --reload`

This will start the FastAPI server on [http://localhost:8000](http://localhost:8000).

✅ Confirmed: The backend dev server starts successfully.

## Project Structure

- `/frontend` — React app (UI)
- `/backend` — FastAPI app (API)

## New Feature: Populate Available Data

- The dashboard now includes a prominent 'Populate Available Data' button at the top of the daily recommendations form.
- Clicking this button fetches the latest ETF prices (IWM, XLF, XLE, KRE), VIX value, and market direction from the backend and auto-fills the relevant form fields.
- Backend endpoint `/current-market-data` (GET) provides this data using yfinance.
- Ensure the backend is running and yfinance is installed for this feature to work.
- The Populate Available Data button now also fills in support and resistance levels for each ETF, based on the last 5 trading days' highs and lows.

---

See CHANGELOG.md for project updates. 