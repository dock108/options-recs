from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import yfinance as yf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
ETF_TICKERS = ["IWM", "XLF", "XLE", "KRE"]

@app.get("/current-market-data")
def current_market_data():
    """Return latest market data including MA50 for tracked ETFs."""
    result = {"etfs": {}, "market": {}}
    try:
        for ticker in ETF_TICKERS:
            hist = yf.Ticker(ticker).history(period="60d")
            current_price = hist["Close"].iloc[-1]
            support = hist["Low"].tail(5).min()
            resistance = hist["High"].tail(5).max()
            ma50 = hist["Close"].rolling(window=50).mean().iloc[-1]
            result["etfs"][ticker] = {
                "current_price": round(float(current_price), 2),
                "support": round(float(support), 2),
                "resistance": round(float(resistance), 2),
                "MA50": round(float(ma50), 2),
            }
        vix_close = yf.Ticker("^VIX").history(period="1d")["Close"].iloc[-1]
        spy_hist = yf.Ticker("SPY").history(period="10d")["Close"]
        market_direction = "Bullish"
        if spy_hist.iloc[-1] < spy_hist.iloc[-5]:
            market_direction = "Bearish"
        elif spy_hist.iloc[-1] < spy_hist.iloc[-3]:
            market_direction = "Neutral"
        result["market"] = {
            "vix": round(float(vix_close), 2),
            "marketDirection": market_direction,
        }
        logging.info("Successfully calculated market data including MA50")
    except Exception:
        logging.exception("Error calculating market data")
        raise
    return result

