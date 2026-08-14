import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3, Bell, BookOpen, ExternalLink, Gauge, Globe2, Layers3, LineChart,
  Menu, Newspaper, RefreshCw, Search, ShieldCheck, Sparkles, Star, TrendingDown, TrendingUp, X,
  AlertCircle, CheckCircle, Zap, Activity
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart as RechartsLine, Line } from 'recharts'
import { calculateEMA, calculateRSI, calculateMACD, calculateADX, calculateVWAP, detectChartPattern, calculateMarketStructure, calculateSuportResistance, calculateVolumAnalysis, scoreSetup } from './technicalAnalysis'
import './styles.css'

const STOCK_CONFIG = [
  // Large Cap
  { s: 'RELIANCE', n: 'Reliance Industries', symbol: 'RELIANCE.NS', c: 'Large Cap', sector: 'Energy' },
  { s: 'HDFCBANK', n: 'HDFC Bank', symbol: 'HDFCBANK.NS', c: 'Large Cap', sector: 'Banking' },
  { s: 'ICICIBANK', n: 'ICICI Bank', symbol: 'ICICIBANK.NS', c: 'Large Cap', sector: 'Banking' },
  { s: 'INFY', n: 'Infosys', symbol: 'INFY.NS', c: 'Large Cap', sector: 'IT' },
  { s: 'TCS', n: 'Tata Consultancy', symbol: 'TCS.NS', c: 'Large Cap', sector: 'IT' },
  { s: 'BHARTIARTL', n: 'Bharti Airtel', symbol: 'BHARTIARTL.NS', c: 'Large Cap', sector: 'Telecom' },
  { s: 'LT', n: 'Larsen & Toubro', symbol: 'LT.NS', c: 'Large Cap', sector: 'Infra' },
  { s: 'SBIN', n: 'State Bank of India', symbol: 'SBIN.NS', c: 'Large Cap', sector: 'Banking' },
  { s: 'ITC', n: 'ITC', symbol: 'ITC.NS', c: 'Large Cap', sector: 'FMCG' },
  { s: 'MARUTI', n: 'Maruti Suzuki', symbol: 'MARUTI.NS', c: 'Large Cap', sector: 'Auto' },
  { s: 'AXISBANK', n: 'Axis Bank', symbol: 'AXISBANK.NS', c: 'Large Cap', sector: 'Banking' },
  { s: 'WIPRO', n: 'Wipro', symbol: 'WIPRO.NS', c: 'Large Cap', sector: 'IT' },
  { s: 'HINDUNILVR', n: 'Hindustan Unilever', symbol: 'HINDUNILVR.NS', c: 'Large Cap', sector: 'FMCG' },
  { s: 'KOTAKBANK', n: 'Kotak Bank', symbol: 'KOTAKBANK.NS', c: 'Large Cap', sector: 'Banking' },
  { s: 'SUNPHARMA', n: 'Sun Pharma', symbol: 'SUNPHARMA.NS', c: 'Large Cap', sector: 'Pharma' },
  // Mid Cap
  { s: 'POLYCAB', n: 'Polycab India', symbol: 'POLYCAB.NS', c: 'Mid Cap', sector: 'Electrical' },
  { s: 'DIXON', n: 'Dixon Technologies', symbol: 'DIXON.NS', c: 'Mid Cap', sector: 'Electronics' },
  { s: 'TRENT', n: 'Trent', symbol: 'TRENT.NS', c: 'Mid Cap', sector: 'Retail' },
  { s: 'BSE', n: 'BSE Ltd', symbol: 'BSE.BO', c: 'Mid Cap', sector: 'Exchange' },
  { s: 'HAL', n: 'Hindustan Aeronautics', symbol: 'HAL.NS', c: 'Mid Cap', sector: 'Defence' },
  { s: 'MUTHOOTFIN', n: 'Muthoot Finance', symbol: 'MUTHOOTFIN.NS', c: 'Mid Cap', sector: 'Finance' },
  { s: 'PERSISTENT', n: 'Persistent Systems', symbol: 'PERSISTENT.NS', c: 'Mid Cap', sector: 'IT' },
  { s: 'INDHOTEL', n: 'Indian Hotels', symbol: 'INDHOTEL.NS', c: 'Mid Cap', sector: 'Hotels' },
  { s: 'MAXHEALTH', n: 'Max Healthcare', symbol: 'MAXHEALTH.NS', c: 'Mid Cap', sector: 'Healthcare' },
  { s: 'JUBLFOOD', n: 'Jubilant FoodWorks', symbol: 'JUBLFOOD.NS', c: 'Mid Cap', sector: 'Consumer' },
  // Small Cap
  { s: 'KAYNES', n: 'Kaynes Technology', symbol: 'KAYNES.NS', c: 'Small Cap', sector: 'Electronics' },
  { s: 'NETWEB', n: 'Netweb Technologies', symbol: 'NETWEB.NS', c: 'Small Cap', sector: 'Technology' },
  { s: 'KPITTECH', n: 'KPIT Technologies', symbol: 'KPITTECH.NS', c: 'Small Cap', sector: 'Auto Tech' },
  { s: 'CDSL', n: 'CDSL', symbol: 'CDSL.NS', c: 'Small Cap', sector: 'Markets' },
  { s: 'MCX', n: 'Multi Commodity Exchange', symbol: 'MCX.NS', c: 'Small Cap', sector: 'Exchange' }
]

const fetchHistoricalData = async (symbol) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(`http://localhost:3001/api/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) throw new Error('Failed to fetch')
    const json = await response.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null
    
    const timestamps = result.timestamp || []
    const quote = result.indicators?.quote?.[0] || {}
    const opens = quote.open || []
    const highs = quote.high || []
    const lows = quote.low || []
    const closes = quote.close || []
    const volumes = quote.volume || []
    
    return { timestamps, opens, highs, lows, closes, volumes, meta: result.meta }
  } catch (error) {
    console.warn(`Failed to fetch ${symbol}:`, error)
    return null
  }
}

const analyzeStock = async (stock) => {
  const data = await fetchHistoricalData(stock.symbol)
  if (!data) return null
  
  const { closes, highs, lows, volumes, meta } = data
  if (!closes || closes.length < 30) return null
  
  const currentPrice = meta?.regularMarketPrice || closes[closes.length - 1]
  const previousClose = meta?.previousClose || closes[closes.length - 2]
  const change = ((currentPrice - previousClose) / previousClose) * 100
  
  // Calculate indicators
  const ema9 = calculateEMA(closes, 9)
  const ema20 = calculateEMA(closes, 20)
  const ema50 = calculateEMA(closes, 50)
  const ema200 = calculateEMA(closes, 200)
  const rsi = calculateRSI(closes, 14)
  const { macd, signal } = calculateMACD(closes)
  const vwap = calculateVWAP(highs, lows, closes, volumes)
  const { adx } = calculateADX(highs, lows, closes, 14)
  const { support, resistance, pivot } = calculateSuportResistance(highs, lows, closes)
  const volAnalysis = calculateVolumAnalysis(volumes, closes)
  const pattern = detectChartPattern(highs, lows, closes, volumes)
  const structure = calculateMarketStructure(highs, lows, closes)
  
  const chart = closes.slice(-20).map((val, idx) => ({ value: Number(val.toFixed(2)) }))
  
  const analysisData = {
    ...stock,
    currentPrice,
    previousClose,
    change,
    ema9: ema9[ema9.length - 1],
    ema20: ema20[ema20.length - 1],
    ema50: ema50[ema50.length - 1],
    ema200: ema200[ema200.length - 1],
    rsi: rsi[rsi.length - 1],
    macd: macd[macd.length - 1],
    signal: signal[signal.length - 1],
    vwap: vwap[vwap.length - 1],
    adx: adx[adx.length - 1],
    support,
    resistance,
    pivot,
    volumeAnalysis: volAnalysis,
    pattern,
    marketStructure: structure,
    chart,
    high52: Math.max(...closes),
    low52: Math.min(...closes),
    riskReward: 2
  }
  
  // Calculate score
  const scored = scoreSetup(analysisData)
  analysisData.technicalScore = scored.score
  
  return analysisData
}

function StockAnalysisDashboard() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState(null)
  const [tab, setTab] = useState('top30')
  const [menu, setMenu] = useState(false)
  
  useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true)
      try {
        // Load in batches of 5 to avoid overwhelming the API
        const batchSize = 5
        let allResults = []
        
        for (let i = 0; i < STOCK_CONFIG.length; i += batchSize) {
          const batch = STOCK_CONFIG.slice(i, i + batchSize)
          const results = await Promise.all(batch.map(s => analyzeStock(s)))
          allResults = [...allResults, ...results]
          
          // Update UI with partial results
          const filtered = allResults.filter(s => s !== null)
          if (filtered.length > 0) {
            const sorted = filtered.sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0))
            setStocks(sorted)
            setSelectedStock(sorted[0] || null)
          }
        }
        
        const filtered = allResults.filter(s => s !== null)
        const sorted = filtered.sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0))
        setStocks(sorted)
        setSelectedStock(sorted[0] || null)
      } catch (error) {
        console.error('Error loading analysis:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAnalysis()
    const interval = setInterval(loadAnalysis, 600000) // 10 minutes
    return () => clearInterval(interval)
  }, [])
  
  const largeCaps = useMemo(() => stocks.filter(s => s.c === 'Large Cap').slice(0, 10), [stocks])
  const midCaps = useMemo(() => stocks.filter(s => s.c === 'Mid Cap').slice(0, 10), [stocks])
  const smallCaps = useMemo(() => stocks.filter(s => s.c === 'Small Cap').slice(0, 10), [stocks])
  const top5 = useMemo(() => stocks.slice(0, 5), [stocks])
  
  const bullishPatterns = useMemo(() => stocks.filter(s => s.pattern?.direction === 'Bullish' && s.technicalScore > 70), [stocks])
  const bearishPatterns = useMemo(() => stocks.filter(s => s.pattern?.direction === 'Bearish' && s.technicalScore > 70), [stocks])
  
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo"><Sparkles size={20} /></div>
          <div><b>Stock Pulse</b><span>AI ANALYSIS</span></div>
        </div>
        <nav className={menu ? 'open' : ''}>
          {['Dashboard', 'Top 30', 'Analysis', 'Patterns', 'News'].map((x, i) => (
            <button key={x} className={i === 0 ? 'active' : ''}>{x}</button>
          ))}
        </nav>
        <div className="top-actions">
          <button className="iconbtn"><Bell size={18} /></button>
          <button className="profile">AI</button>
          <button className="iconbtn mobile-menu" onClick={() => setMenu(!menu)}>
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <div className="eyebrow"><span className="live-dot" /> REAL-TIME TECHNICAL ANALYSIS</div>
            <h1>Indian Stock Market <em>AI Engine</em></h1>
            <p>Advanced technical analysis with chart patterns, indicators, market regime detection, and risk/reward scoring for 30 top stocks across Large, Mid, and Small Cap categories.</p>
          </div>
          <div className="hero-actions">
            <button className="refresh" onClick={() => window.location.reload()}>
              <RefreshCw size={17} /> Refresh Analysis
            </button>
          </div>
        </section>

        <section className="tabs-nav">
          <button className={tab === 'top30' ? 'active' : ''} onClick={() => setTab('top30')}>
            🏆 Top 30 Opportunities
          </button>
          <button className={tab === 'largecap' ? 'active' : ''} onClick={() => setTab('largecap')}>
            🥇 Large Cap (10)
          </button>
          <button className={tab === 'midcap' ? 'active' : ''} onClick={() => setTab('midcap')}>
            🚀 Mid Cap (10)
          </button>
          <button className={tab === 'smallcap' ? 'active' : ''} onClick={() => setTab('smallcap')}>
            ⚡ Small Cap (10)
          </button>
          <button className={tab === 'patterns' ? 'active' : ''} onClick={() => setTab('patterns')}>
            📊 Patterns
          </button>
        </section>

        {loading && stocks.length === 0 ? (
          <div className="loading">
            <Sparkles className="spin" size={32} />
            <div>
              <p>Analyzing stocks...</p>
              <small>Fetching live market data {stocks.length > 0 && `(${stocks.length} loaded)`}</small>
            </div>
          </div>
        ) : (
          <>
            {tab === 'top30' && (
              <section className="card analysis-section">
                <h2>🏆 TOP 30 RANKED STOCKS</h2>
                <div className="table-wrapper">
                  <table className="analysis-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Change %</th>
                        <th>Pattern</th>
                        <th>RSI</th>
                        <th>Trend</th>
                        <th>Volume</th>
                        <th>Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map((stock, idx) => (
                        <tr key={stock.s} onClick={() => setSelectedStock(stock)}>
                          <td className="rank">{idx + 1}</td>
                          <td className="stock-name">
                            <strong>{stock.s}</strong>
                            <small>{stock.n}</small>
                            <span className="category">{stock.c}</span>
                          </td>
                          <td className="price">₹{stock.currentPrice?.toFixed(2) || 'N/A'}</td>
                          <td className={stock.change >= 0 ? 'positive' : 'negative'}>
                            {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                          </td>
                          <td className="pattern-cell">
                            {stock.pattern ? (
                              <span className={`pattern-badge ${stock.pattern.direction.toLowerCase()}`}>
                                {stock.pattern.type}
                              </span>
                            ) : 'No Pattern'}
                          </td>
                          <td className="rsi">
                            <span className={stock.rsi > 70 ? 'overbought' : stock.rsi < 30 ? 'oversold' : 'neutral'}>
                              {stock.rsi?.toFixed(1)}
                            </span>
                          </td>
                          <td className="trend">
                            {stock.marketStructure?.trend === 'Uptrend' ? (
                              <TrendingUp size={16} className="up" />
                            ) : stock.marketStructure?.trend === 'Downtrend' ? (
                              <TrendingDown size={16} className="down" />
                            ) : (
                              <Activity size={16} />
                            )}
                          </td>
                          <td className="volume">
                            <span className={`vol-badge ${stock.volumeAnalysis?.trendVolume?.replace(' ', '-').toLowerCase()}`}>
                              {stock.volumeAnalysis?.rvol?.toFixed(2)}x
                            </span>
                          </td>
                          <td className="score">
                            <strong className="score-value">{stock.technicalScore || 0}</strong>
                          </td>
                          <td>
                            <button className="detail-btn" onClick={() => setSelectedStock(stock)}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === 'largecap' && (
              <section className="card analysis-section">
                <h2>🥇 TOP 10 LARGE CAP STOCKS</h2>
                <StockGrid stocks={largeCaps} onSelect={setSelectedStock} />
              </section>
            )}

            {tab === 'midcap' && (
              <section className="card analysis-section">
                <h2>🚀 TOP 10 MID CAP STOCKS</h2>
                <StockGrid stocks={midCaps} onSelect={setSelectedStock} />
              </section>
            )}

            {tab === 'smallcap' && (
              <section className="card analysis-section">
                <h2>⚡ TOP 10 SMALL CAP STOCKS</h2>
                <StockGrid stocks={smallCaps} onSelect={setSelectedStock} />
              </section>
            )}

            {tab === 'patterns' && (
              <section className="patterns-section">
                <div className="card">
                  <h2>📈 BULLISH PATTERNS ({bullishPatterns.length})</h2>
                  <PatternGrid patterns={bullishPatterns} onSelect={setSelectedStock} />
                </div>
                <div className="card">
                  <h2>📉 BEARISH PATTERNS ({bearishPatterns.length})</h2>
                  <PatternGrid patterns={bearishPatterns} onSelect={setSelectedStock} />
                </div>
              </section>
            )}

            {selectedStock && <StockDetailPanel stock={selectedStock} onClose={() => setSelectedStock(null)} />}
          </>
        )}
      </main>

      <footer>
        <span>Stock Pulse India | AI-Powered Technical Analysis</span>
        <span>Real-time data from public market APIs</span>
        <span>For research purposes only. Always verify before trading.</span>
      </footer>
    </div>
  )
}

function StockGrid({ stocks, onSelect }) {
  return (
    <div className="stock-grid">
      {stocks.map((stock, idx) => (
        <div key={stock.s} className="stock-card" onClick={() => onSelect(stock)}>
          <div className="rank-badge">#{idx + 1}</div>
          <div className="stock-header">
            <div>
              <h3>{stock.s}</h3>
              <p>{stock.n}</p>
            </div>
            <span className={`direction ${stock.change >= 0 ? 'bull' : 'bear'}`}>
              {stock.change >= 0 ? '↑' : '↓'} {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
            </span>
          </div>
          <div className="price-display">
            ₹{stock.currentPrice?.toFixed(2) || 'N/A'}
          </div>
          <div className="indicators">
            <div className="indicator">
              <label>RSI</label>
              <strong>{stock.rsi?.toFixed(1)}</strong>
            </div>
            <div className="indicator">
              <label>Volume</label>
              <strong>{stock.volumeAnalysis?.rvol?.toFixed(2)}x</strong>
            </div>
            <div className="indicator">
              <label>Score</label>
              <strong className="score-badge">{stock.technicalScore || 0}/100</strong>
            </div>
          </div>
          {stock.pattern && (
            <div className={`pattern-info ${stock.pattern.direction.toLowerCase()}`}>
              <Sparkles size={14} /> {stock.pattern.type}
            </div>
          )}
          <button className="view-btn">View Details</button>
        </div>
      ))}
    </div>
  )
}

function PatternGrid({ patterns, onSelect }) {
  return (
    <div className="patterns-grid">
      {patterns.length === 0 ? (
        <div className="no-results">No patterns found for this filter</div>
      ) : (
        patterns.map(stock => (
          <div key={stock.s} className="pattern-row" onClick={() => onSelect(stock)}>
            <div className="pattern-stock">
              <strong>{stock.s}</strong>
              <span>{stock.n}</span>
            </div>
            <div className="pattern-info-row">
              <span className={`pattern-type ${stock.pattern.direction.toLowerCase()}`}>
                {stock.pattern.type}
              </span>
              <span className="pattern-confidence">
                {(stock.pattern.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <div className="pattern-metrics">
              <span>Price: ₹{stock.currentPrice?.toFixed(2)}</span>
              <span>RSI: {stock.rsi?.toFixed(1)}</span>
              <span>Score: {stock.technicalScore}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function StockDetailPanel({ stock, onClose }) {
  return (
    <div className="detail-panel">
      <div className="panel-header">
        <div>
          <h2>{stock.s} - {stock.n}</h2>
          <p>{stock.c} | {stock.sector}</p>
        </div>
        <button onClick={onClose} className="close-btn"><X size={24} /></button>
      </div>

      <div className="panel-content">
        <div className="price-section">
          <div className="current-price">
            <span>Current Price</span>
            <strong>₹{stock.currentPrice?.toFixed(2)}</strong>
            <span className={stock.change >= 0 ? 'positive' : 'negative'}>
              {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="indicators-grid">
          <div className="indicator-box">
            <label>RSI (14)</label>
            <strong>{stock.rsi?.toFixed(2)}</strong>
            <small>{stock.rsi > 70 ? 'Overbought' : stock.rsi < 30 ? 'Oversold' : 'Neutral'}</small>
          </div>
          <div className="indicator-box">
            <label>MACD</label>
            <strong>{stock.macd?.toFixed(4)}</strong>
            <small>{stock.macd > stock.signal ? 'Bullish' : 'Bearish'}</small>
          </div>
          <div className="indicator-box">
            <label>ADX</label>
            <strong>{stock.adx?.toFixed(2)}</strong>
            <small>{stock.adx > 25 ? 'Strong Trend' : 'Weak Trend'}</small>
          </div>
          <div className="indicator-box">
            <label>Volume RVOL</label>
            <strong>{stock.volumeAnalysis?.rvol?.toFixed(2)}x</strong>
            <small>{stock.volumeAnalysis?.trendVolume}</small>
          </div>
        </div>

        <div className="ema-section">
          <h3>EMA Alignment</h3>
          <div className="ema-check">
            {stock.currentPrice > stock.ema9 ? <CheckCircle size={16} className="check" /> : <AlertCircle size={16} className="alert" />}
            <span>Price &gt; EMA 9: {stock.currentPrice?.toFixed(2)} &gt; {stock.ema9?.toFixed(2)}</span>
          </div>
          <div className="ema-check">
            {stock.ema9 > stock.ema20 ? <CheckCircle size={16} className="check" /> : <AlertCircle size={16} className="alert" />}
            <span>EMA 9 &gt; EMA 20: {stock.ema9?.toFixed(2)} &gt; {stock.ema20?.toFixed(2)}</span>
          </div>
          <div className="ema-check">
            {stock.ema20 > stock.ema50 ? <CheckCircle size={16} className="check" /> : <AlertCircle size={16} className="alert" />}
            <span>EMA 20 &gt; EMA 50: {stock.ema20?.toFixed(2)} &gt; {stock.ema50?.toFixed(2)}</span>
          </div>
          <div className="ema-check">
            {stock.ema50 > stock.ema200 ? <CheckCircle size={16} className="check" /> : <AlertCircle size={16} className="alert" />}
            <span>EMA 50 &gt; EMA 200: {stock.ema50?.toFixed(2)} &gt; {stock.ema200?.toFixed(2)}</span>
          </div>
        </div>

        <div className="support-resistance">
          <h3>Support & Resistance</h3>
          <div className="level">
            <span>Resistance</span>
            <strong>₹{stock.resistance?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Pivot</span>
            <strong>₹{stock.pivot?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Support</span>
            <strong>₹{stock.support?.toFixed(2)}</strong>
          </div>
        </div>

        {stock.pattern && (
          <div className="pattern-analysis">
            <h3>Chart Pattern</h3>
            <div className={`pattern-info-full ${stock.pattern.direction.toLowerCase()}`}>
              <div className="pattern-type-display">{stock.pattern.type}</div>
              <div className="pattern-details">
                <span>Direction: <strong>{stock.pattern.direction}</strong></span>
                <span>Confidence: <strong>{(stock.pattern.confidence * 100).toFixed(0)}%</strong></span>
                <span>Breakout Level: <strong>₹{stock.pattern.breakoutLevel?.toFixed(2)}</strong></span>
              </div>
            </div>
          </div>
        )}

        <div className="market-structure">
          <h3>Market Structure</h3>
          <div className="structure-info">
            <span>Trend: <strong>{stock.marketStructure?.trend}</strong></span>
            <span>Structure: <strong>{stock.marketStructure?.structure}</strong></span>
          </div>
        </div>

        <div className="score-breakdown">
          <h3>Technical Score: {stock.technicalScore}/100</h3>
          <div className="score-bar">
            <div className="fill" style={{width: `${stock.technicalScore}%`}}></div>
          </div>
        </div>

        <div className="external-links">
          <a href={`https://www.tradingview.com/chart/?symbol=NSE:${stock.s}`} target="_blank" rel="noreferrer">
            <LineChart size={16} /> TradingView
          </a>
          <a href={`https://www.nseindia.com/market-data/live-equity-market`} target="_blank" rel="noreferrer">
            <Globe2 size={16} /> NSE Market
          </a>
          <a href={`https://www.moneycontrol.com/stocksmarketsindia/`} target="_blank" rel="noreferrer">
            <Newspaper size={16} /> Moneycontrol
          </a>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<StockAnalysisDashboard />)
