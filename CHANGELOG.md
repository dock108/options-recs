# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - Project Initialization
- Set up monorepo structure with /frontend (React) and /backend (FastAPI)
- Added minimal starter code for both components
- Added README and CHANGELOG
- Confirmed: Frontend dev server starts successfully
- Confirmed: Backend dev server starts successfully

## [0.2.0] - Daily Trading Input Form UI
- Added a minimal, readable React form for daily trading inputs in /frontend
- Captures account info, market conditions, and ETF candidates (IWM, XLF, XLE, KRE)
- "Run Recommendation" button prints all input data to the console
- Updated frontend README with usage instructions

## [0.3.0] - Backend /recommend API Endpoint
- Added POST /recommend endpoint to accept trading input data and return placeholder recommendations
- Enabled CORS for local frontend-backend development
- Updated backend README with API usage

## [0.4.0] - Rules-Based Recommendation Logic
- Implemented core rules-based logic in /recommend endpoint
- Recommendations now reflect market direction, support/resistance, and VIX
- Updated backend README with logic details and sample output

## [0.5.0] - Frontend-Backend Integration
- React frontend now POSTs form data to backend /recommend endpoint
- Recommendations are displayed below the form in the UI
- Error handling for backend connection issues
- Updated frontend README with new workflow

## [Unreleased]
- Added 'Populate Available Data' button to the daily recommendations form in the frontend. This button fetches current ETF prices, VIX, and market direction from the new backend endpoint `/current-market-data` and auto-fills the form fields.
- Backend: Added `/current-market-data` endpoint using yfinance to provide latest market data for IWM, XLF, XLE, KRE, VIX, and SPY-based market direction.
- The Populate Available Data button now also fills in support and resistance levels for each ETF, calculated from the last 5 trading days' highs and lows (simple pivot method).
- Current market data now includes 50-day moving averages (MA50) for each ETF and the frontend displays this information.
