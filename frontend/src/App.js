// To start the React dev server:
// 1. cd frontend
// 2. npm start

import React, { useState, useEffect } from 'react';
import './App.css';

const initialEtfs = [
  { ticker: 'IWM', currentPrice: '', supportPrice: '', resistancePrice: '' },
  { ticker: 'XLF', currentPrice: '', supportPrice: '', resistancePrice: '' },
  { ticker: 'XLE', currentPrice: '', supportPrice: '', resistancePrice: '' },
  { ticker: 'KRE', currentPrice: '', supportPrice: '', resistancePrice: '' },
];

const LOCAL_STORAGE_KEY = 'dashboardFormData';

function App() {
  // Try to load from localStorage
  const loadInitialState = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          liquidity: parsed.liquidity || '',
          invested: parsed.invested || '',
          marketDirection: parsed.marketDirection || 'Bullish',
          vix: parsed.vix || '',
          etfs: parsed.etfs || initialEtfs,
          positions: parsed.positions || [],
        };
      } catch {
        return null;
      }
    }
    return null;
  };

  const initial = loadInitialState() || {
    liquidity: '',
    invested: '',
    marketDirection: 'Bullish',
    vix: '',
    etfs: initialEtfs,
    positions: [],
  };

  const [liquidity, setLiquidity] = useState(initial.liquidity);
  const [invested, setInvested] = useState(initial.invested);
  const [marketDirection, setMarketDirection] = useState(initial.marketDirection);
  const [vix, setVix] = useState(initial.vix);
  const [etfs, setEtfs] = useState(initial.etfs);
  const [positions, setPositions] = useState(initial.positions);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [populating, setPopulating] = useState(false);

  // Save form data to localStorage on change
  useEffect(() => {
    const data = {
      liquidity,
      invested,
      marketDirection,
      vix,
      etfs,
      positions,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [liquidity, invested, marketDirection, vix, etfs, positions]);

  const handleEtfChange = (idx, field, value) => {
    setEtfs(etfs =>
      etfs.map((etf, i) =>
        i === idx ? { ...etf, [field]: value } : etf
      )
    );
  };

  const handlePositionChange = (idx, field, value) => {
    setPositions(positions =>
      positions.map((pos, i) =>
        i === idx ? { ...pos, [field]: value } : pos
      )
    );
  };

  const addPosition = () => {
    setPositions([...positions, { ticker: '', buyingPower: '' }]);
  };

  const removePosition = (idx) => {
    setPositions(positions => positions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRecommendations(null);
    setLoading(true);
    const data = {
      account: { liquidity, invested },
      market: { marketDirection, vix },
      etfs,
      positions: positions.filter(p => p.ticker && p.buyingPower),
    };
    try {
      const res = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Backend error');
      const result = await res.json();
      setRecommendations(result);
      // Scroll to recommendations
      setTimeout(() => {
        const recommendationsSection = document.getElementById('recommendations');
        if (recommendationsSection) {
          recommendationsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      setError('Could not get recommendations. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for populating market data
  const handlePopulateMarketData = async () => {
    setPopulating(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/current-market-data');
      if (!res.ok) throw new Error('Could not fetch market data');
      const data = await res.json();
      // Populate ETF prices
      if (data.etfs) {
        setEtfs(etfs => etfs.map(etf => {
          const etfData = data.etfs[etf.ticker] || {};
          const price = etfData.current_price;
          const support = etfData.support;
          const resistance = etfData.resistance;
          return data.etfs[etf.ticker]
            ? {
                ...etf,
                currentPrice: price !== null && price !== undefined ? price : '',
                supportPrice: support !== null && support !== undefined ? support : '',
                resistancePrice: resistance !== null && resistance !== undefined ? resistance : ''
              }
            : etf;
        }));
      }
      // Populate VIX
      if (data.market && data.market.vix !== undefined && data.market.vix !== null) {
        setVix(data.market.vix);
      }
      // Populate market direction
      if (data.market && data.market.marketDirection) {
        setMarketDirection(data.market.marketDirection);
      }
    } catch (err) {
      setError('Could not fetch market data.');
    } finally {
      setPopulating(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h2>Daily Trading Input Form</h2>
      </header>
      
      <button
        className="button button-primary populate-data-btn"
        type="button"
        onClick={handlePopulateMarketData}
        disabled={populating}
      >
        {populating ? 'Populating Data...' : 'Populate Available Data'}
      </button>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-column">
            <fieldset>
              <legend>Account Info</legend>
              <label>
                Account Liquidity:
                <input
                  type="number"
                  value={liquidity}
                  onChange={e => setLiquidity(e.target.value)}
                  required
                />
              </label>
              <label>
                Account Invested:
                <input
                  type="number"
                  value={invested}
                  onChange={e => setInvested(e.target.value)}
                  required
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>Market Conditions</legend>
              <label>
                Market Direction:
                <select
                  value={marketDirection}
                  onChange={e => setMarketDirection(e.target.value)}
                >
                  <option value="Bullish">Bullish</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Bearish">Bearish</option>
                </select>
              </label>
              <label>
                VIX Value:
                <input
                  type="number"
                  value={vix}
                  onChange={e => setVix(e.target.value)}
                  required
                />
              </label>
            </fieldset>
          </div>

          <div className="form-column">
            <fieldset>
              <legend>Current Positions</legend>
              {positions.length === 0 && <div style={{ color: '#888', marginBottom: '1rem' }}>No positions entered.</div>}
              {positions.map((pos, idx) => (
                <div key={idx} className="position-item">
                  <label>
                    Ticker:
                    <input
                      type="text"
                      value={pos.ticker}
                      onChange={e => handlePositionChange(idx, 'ticker', e.target.value.toUpperCase())}
                      style={{ width: '60px' }}
                      required
                    />
                  </label>
                  <label>
                    Buying Power Used:
                    <input
                      type="number"
                      value={pos.buyingPower}
                      onChange={e => handlePositionChange(idx, 'buyingPower', e.target.value)}
                      style={{ width: '80px' }}
                      required
                    />
                  </label>
                  <button type="button" className="button button-remove" onClick={() => removePosition(idx)}>Remove</button>
                </div>
              ))}
              <button type="button" className="button" onClick={addPosition}>Add Position</button>
            </fieldset>
          </div>
        </div>

        <fieldset>
          <legend>ETF Candidates</legend>
          <div className="etf-grid">
            {etfs.map((etf, idx) => (
              <div key={etf.ticker} className="etf-card">
                <div className="ticker-label">{etf.ticker}</div>
                <label>
                  Current Price:
                  <input
                    type="number"
                    value={etf.currentPrice}
                    onChange={e => handleEtfChange(idx, 'currentPrice', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Support Price:
                  <input
                    type="number"
                    value={etf.supportPrice}
                    onChange={e => handleEtfChange(idx, 'supportPrice', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Resistance Price:
                  <input
                    type="number"
                    value={etf.resistancePrice}
                    onChange={e => handleEtfChange(idx, 'resistancePrice', e.target.value)}
                    required
                  />
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <button 
          className="button button-success" 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 24px', fontSize: '1rem', width: '100%', maxWidth: '300px' }}
        >
          {loading ? 'Processing...' : 'Run Recommendation'}
        </button>
      </form>

      {error && <div className="warning-message" style={{ marginTop: '20px' }}>{error}</div>}

      {recommendations && (
        <div id="recommendations" className="recommendations">
          <h3>Today's Recommendations:</h3>
          
          {recommendations.positionsIncluded && recommendations.positionsIncluded.length > 0 && (
            <div className="allocation-summary">
              <strong>Current Positions Included in Allocation:</strong>
              <ul>
                {recommendations.positionsIncluded.map((pos, idx) => (
                  <li key={idx}>{pos.ticker}: Buying Power Used ${pos.buyingPower}</li>
                ))}
              </ul>
            </div>
          )}
          
          {recommendations.allocation && recommendations.allocation.warning && (
            <div className="warning-message">
              {recommendations.allocation.warning}
            </div>
          )}
          
          {recommendations.allocation && (
            <div className="allocation-summary">
              <strong>Allocation Summary:</strong>
              <ul>
                <li><strong>Total Account Value:</strong> ${recommendations.allocation.totalAccountValue}</li>
                <li><strong>Max Allowed Allocation:</strong> {recommendations.allocation.maxAllowedPct}%</li>
                <li><strong>Current Allocation:</strong> {recommendations.allocation.currentAllocationPct}%</li>
                <li><strong>New Allocation (this batch):</strong> {recommendations.allocation.newAllocationPct}%</li>
                <li><strong>Total Used Allocation:</strong> {recommendations.allocation.totalUsedAllocationPct}%</li>
              </ul>
            </div>
          )}
          
          {recommendations.recommendations.length === 0 && recommendations.allocation && recommendations.allocation.warning ? (
            <div className="warning-message">No new trades recommended because 50%+ of account is already invested.</div>
          ) : recommendations.recommendations.length === 0 ? (
            <div className="warning-message">No new trades recommended (allocation limit reached or no setups).</div>
          ) : null}
          
          <div className="recommendation-items">
            {recommendations.recommendations.map((rec, idx) => (
              <div key={rec.ticker} className="recommendation-item">
                <h4>{rec.ticker}: {rec.action}</h4>
                <ul>
                  {rec.strikes && (
                    <li><strong>Strikes:</strong> Short {rec.strikes.short}, Long {rec.strikes.long}</li>
                  )}
                  <li><strong>Spread Width:</strong> {rec.spreadWidth}</li>
                  <li><strong>Estimated Premium:</strong> ${rec.premium}</li>
                  <li><strong>Estimated Buying Power (per spread):</strong> ${rec.buyingPower}</li>
                  <li><strong>Quantity:</strong> {rec.quantity}</li>
                  <li><strong>Allocation % of Account:</strong> {rec.allocationPct}%</li>
                  <li><strong>Expiry:</strong> {rec.expiry}</li>
                  <li><strong>Note:</strong> {rec.note}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
