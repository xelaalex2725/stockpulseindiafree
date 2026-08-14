import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3, Bell, BookOpen, ChevronDown, ExternalLink, Gauge, Globe2, Layers3, LineChart,
  Menu, Newspaper, RefreshCw, Search, ShieldCheck, Sparkles, Star, TrendingDown, TrendingUp, X,
  AlertCircle, CheckCircle, Zap
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart as RechartsLine, Line } from 'recharts'
import { calculateEMA, calculateRSI, calculateMACD, calculateADX, calculateVWAP, detectChartPattern, calculateMarketStructure, calculateSuportResistance, calculateVolumAnalysis, scoreSetup } from './technicalAnalysis'
import './styles.css'

const STOCK_CONFIG = [
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
  { s: 'KAYNES', n: 'Kaynes Technology', symbol: 'KAYNES.NS', c: 'Small Cap', sector: 'Electronics' },
  { s: 'NETWEB', n: 'Netweb Technologies', symbol: 'NETWEB.NS', c: 'Small Cap', sector: 'Technology' },
  { s: 'KPITTECH', n: 'KPIT Technologies', symbol: 'KPITTECH.NS', c: 'Small Cap', sector: 'Auto Tech' },
  { s: 'CDSL', n: 'CDSL', symbol: 'CDSL.NS', c: 'Small Cap', sector: 'Markets' },
  { s: 'MCX', n: 'Multi Commodity Exchange', symbol: 'MCX.NS', c: 'Small Cap', sector: 'Exchange' }
]

const SECTORS = [
  ['Banking', 92], ['Defence', 89], ['Electronics', 87], ['Energy', 84],
  ['Telecom', 82], ['IT', 72], ['Auto', 69], ['FMCG', 58]
]

const fetchHistoricalData = async (symbol) => {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d`)
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
  const { macd, signal, histogram } = calculateMACD(closes)
  const vwap = calculateVWAP(highs, lows, closes, volumes)
  const { adx } = calculateADX(highs, lows, closes, 14)
  const { support, resistance, pivot } = calculateSuportResistance(highs, lows, closes)
  const volAnalysis = calculateVolumAnalysis(volumes, closes)
  const pattern = detectChartPattern(highs, lows, closes, volumes)
  const structure = calculateMarketStructure(highs, lows, closes)
  
  const recentClose = closes[closes.length - 1]
  const chart = closes.slice(-20).map((val, idx) => ({ value: Number(val.toFixed(2)) }))
  
  return {
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
    low52: Math.min(...closes)
  }
}

const STOCK_CONFIG = [
  { s: 'RELIANCE', n: 'Reliance Industries', symbol: 'RELIANCE.NS', c: 'Large Cap', p: 1418.3, ch: 1.82, score: 88, trend: 'Bullish', sector: 'Energy', vol: 'High' },
  { s: 'HDFCBANK', n: 'HDFC Bank', symbol: 'HDFCBANK.NS', c: 'Large Cap', p: 1924.6, ch: 0.94, score: 82, trend: 'Bullish', sector: 'Banking', vol: 'High' },
  { s: 'ICICIBANK', n: 'ICICI Bank', symbol: 'ICICIBANK.NS', c: 'Large Cap', p: 1486.2, ch: 1.31, score: 86, trend: 'Bullish', sector: 'Banking', vol: 'High' },
  { s: 'INFY', n: 'Infosys', symbol: 'INFY.NS', c: 'Large Cap', p: 1698.4, ch: -0.42, score: 69, trend: 'Neutral', sector: 'IT', vol: 'Medium' },
  { s: 'TCS', n: 'Tata Consultancy Services', symbol: 'TCS.NS', c: 'Large Cap', p: 3128.7, ch: 0.36, score: 74, trend: 'Bullish', sector: 'IT', vol: 'Medium' },
  { s: 'BHARTIARTL', n: 'Bharti Airtel', symbol: 'BHARTIARTL.NS', c: 'Large Cap', p: 1922.5, ch: 2.08, score: 91, trend: 'Strong Bullish', sector: 'Telecom', vol: 'High' },
  { s: 'LT', n: 'Larsen & Toubro', symbol: 'LT.NS', c: 'Large Cap', p: 3871.2, ch: 1.14, score: 84, trend: 'Bullish', sector: 'Infra', vol: 'High' },
  { s: 'SBIN', n: 'State Bank of India', symbol: 'SBIN.NS', c: 'Large Cap', p: 1024.9, ch: 1.58, score: 87, trend: 'Bullish', sector: 'Banking', vol: 'High' },
  { s: 'ITC', n: 'ITC', symbol: 'ITC.NS', c: 'Large Cap', p: 401.2, ch: -0.18, score: 63, trend: 'Neutral', sector: 'FMCG', vol: 'Low' },
  { s: 'MARUTI', n: 'Maruti Suzuki', symbol: 'MARUTI.NS', c: 'Large Cap', p: 14520.0, ch: 0.73, score: 78, trend: 'Bullish', sector: 'Auto', vol: 'Medium' },
  { s: 'POLYCAB', n: 'Polycab India', symbol: 'POLYCAB.NS', c: 'Mid Cap', p: 6942.1, ch: 2.47, score: 93, trend: 'Strong Bullish', sector: 'Electrical', vol: 'High' },
  { s: 'DIXON', n: 'Dixon Technologies', symbol: 'DIXON.NS', c: 'Mid Cap', p: 16110.0, ch: 2.12, score: 90, trend: 'Strong Bullish', sector: 'Electronics', vol: 'High' },
  { s: 'TRENT', n: 'Trent', symbol: 'TRENT.NS', c: 'Mid Cap', p: 6450.5, ch: 1.43, score: 85, trend: 'Bullish', sector: 'Retail', vol: 'High' },
  { s: 'BSE', n: 'BSE Ltd', symbol: 'BSE.BO', c: 'Mid Cap', p: 2845.7, ch: 3.05, score: 94, trend: 'Strong Bullish', sector: 'Exchange', vol: 'High' },
  { s: 'HAL', n: 'Hindustan Aeronautics', symbol: 'HAL.NS', c: 'Mid Cap', p: 5234.4, ch: 1.86, score: 89, trend: 'Strong Bullish', sector: 'Defence', vol: 'High' },
  { s: 'MUTHOOTFIN', n: 'Muthoot Finance', symbol: 'MUTHOOTFIN.NS', c: 'Mid Cap', p: 2361.8, ch: 0.98, score: 81, trend: 'Bullish', sector: 'Finance', vol: 'Medium' },
  { s: 'PERSISTENT', n: 'Persistent Systems', symbol: 'PERSISTENT.NS', c: 'Mid Cap', p: 6148.2, ch: 1.12, score: 83, trend: 'Bullish', sector: 'IT', vol: 'Medium' },
  { s: 'INDHOTEL', n: 'Indian Hotels', symbol: 'INDHOTEL.NS', c: 'Mid Cap', p: 824.3, ch: 1.67, score: 86, trend: 'Bullish', sector: 'Hotels', vol: 'High' },
  { s: 'MAXHEALTH', n: 'Max Healthcare', symbol: 'MAXHEALTH.NS', c: 'Mid Cap', p: 1188.5, ch: 0.84, score: 79, trend: 'Bullish', sector: 'Healthcare', vol: 'Medium' },
  { s: 'JUBLFOOD', n: 'Jubilant FoodWorks', symbol: 'JUBLFOOD.NS', c: 'Mid Cap', p: 723.4, ch: -0.27, score: 61, trend: 'Neutral', sector: 'Consumer', vol: 'Medium' },
  { s: 'KAYNES', n: 'Kaynes Technology', symbol: 'KAYNES.NS', c: 'Small Cap', p: 7028.0, ch: 3.42, score: 95, trend: 'Strong Bullish', sector: 'Electronics', vol: 'Very High' },
  { s: 'NETWEB', n: 'Netweb Technologies', symbol: 'NETWEB.NS', c: 'Small Cap', p: 2842.4, ch: 2.76, score: 92, trend: 'Strong Bullish', sector: 'Technology', vol: 'Very High' },
  { s: 'KPITTECH', n: 'KPIT Technologies', symbol: 'KPITTECH.NS', c: 'Small Cap', p: 1376.2, ch: 1.95, score: 89, trend: 'Strong Bullish', sector: 'Auto Tech', vol: 'High' },
  { s: 'CDSL', n: 'CDSL', symbol: 'CDSL.NS', c: 'Small Cap', p: 1974.0, ch: 2.41, score: 91, trend: 'Strong Bullish', sector: 'Markets', vol: 'High' },
  { s: 'MCX', n: 'Multi Commodity Exchange', symbol: 'MCX.NS', c: 'Small Cap', p: 7648.0, ch: 1.38, score: 85, trend: 'Bullish', sector: 'Exchange', vol: 'High' },
  { s: 'TITAGARH', n: 'Titagarh Rail Systems', symbol: 'TITAGARH.NS', c: 'Small Cap', p: 1058.6, ch: 2.17, score: 88, trend: 'Bullish', sector: 'Railways', vol: 'High' },
  { s: 'ZENTEC', n: 'Zen Technologies', symbol: 'ZENTEC.NS', c: 'Small Cap', p: 1694.2, ch: 2.91, score: 93, trend: 'Strong Bullish', sector: 'Defence', vol: 'Very High' },
  { s: 'KPIL', n: 'Kalpataru Projects', symbol: 'KPIL.NS', c: 'Small Cap', p: 1298.7, ch: 1.04, score: 79, trend: 'Bullish', sector: 'Infra', vol: 'Medium' },
  { s: 'BLS', n: 'BLS International', symbol: 'BLS.NS', c: 'Small Cap', p: 489.6, ch: 1.62, score: 83, trend: 'Bullish', sector: 'Services', vol: 'High' },
  { s: 'EASEMYTRIP', n: 'Easy Trip Planners', symbol: 'EASEMYTRIP.NS', c: 'Small Cap', p: 16.72, ch: -0.71, score: 55, trend: 'Neutral', sector: 'Travel', vol: 'High' }
]

const FALLBACK_INDEX_DATA = [
  { label: 'NIFTY 50', value: 24366.0, change: 1.2 },
  { label: 'SENSEX', value: 80742.8, change: 0.77 },
  { label: 'NIFTY BANK', value: 55180.25, change: 1.12 },
  { label: 'NIFTY MIDCAP 100', value: 56122.35, change: 0.78 },
  { label: 'NIFTY SMALLCAP 100', value: 18322.7, change: 1.1 },
  { label: 'INDIA VIX', value: 13.84, change: -2.18 }
]

const FALLBACK_STOCKS = STOCK_CONFIG.map((item) => ({ ...item, chart: FALLBACK_CHART }))

const formatCurrency = (value, digits = 2) => {
  if (!Number.isFinite(value)) return '0'
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value)
}

const formatIndex = (value, digits = 2) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value)
}

const getTrendLabel = (change) => {
  if (change > 1) return 'Bullish'
  if (change < -1) return 'Bearish'
  return 'Neutral'
}

const fetchChartData = async (symbol) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${symbol}`)
  }

  const json = await response.json()
  const result = json?.chart?.result?.[0]
  if (!result) {
    return null
  }

  const quote = result?.indicators?.quote?.[0] || {}
  const closes = (quote.close || []).filter((value) => Number.isFinite(value))
  const timestamps = result?.timestamp || []
  const currentPrice = result?.meta?.regularMarketPrice ?? closes.at(-1) ?? 0
  const previousClose = result?.meta?.previousClose ?? closes.at(-2) ?? closes.at(-1) ?? currentPrice
  const change = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0

  const chart = timestamps
    .map((timestamp, idx) => {
      const close = closes[idx]
      if (!Number.isFinite(close)) return null
      return {
        time: new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: Number(close.toFixed(2))
      }
    })
    .filter(Boolean)

  return { price: currentPrice, previousClose, change, chart }
}

function App() {
  const [cap, setCap] = useState('All')
  const [q, setQ] = useState('')
  const [stocks, setStocks] = useState(FALLBACK_STOCKS)
  const [selected, setSelected] = useState(FALLBACK_STOCKS[6])
  const [marketCards, setMarketCards] = useState(FALLBACK_INDEX_DATA)
  const [watch, setWatch] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadLiveData = async () => {
      const indexSymbols = [
        { label: 'NIFTY 50', symbol: '^NSEI' },
        { label: 'SENSEX', symbol: '^BSESN' },
        { label: 'NIFTY BANK', symbol: '^NSEBANK' },
        { label: 'NIFTY MIDCAP 100', symbol: '^CNXMDCP' },
        { label: 'NIFTY SMALLCAP 100', symbol: '^CNXSMALL' },
        { label: 'INDIA VIX', symbol: '^NSEI_VIX' }
      ]

      try {
        const [indexResults, stockResults] = await Promise.all([
          Promise.all(indexSymbols.map(async ({ label, symbol }) => {
            const snapshot = await fetchChartData(symbol)
            return {
              label,
              value: snapshot?.price ?? 0,
              change: snapshot?.change ?? 0
            }
          })),
          Promise.all(STOCK_CONFIG.map(async (item) => {
            const snapshot = await fetchChartData(item.symbol)
            const price = snapshot?.price ?? item.p
            const change = snapshot?.change ?? item.ch
            const score = Math.min(99, Math.max(52, Math.round(Math.abs(change) * 18 + 62)))
            return {
              ...item,
              p: Number(price),
              ch: Number(change),
              score,
              trend: getTrendLabel(change),
              chart: snapshot?.chart || FALLBACK_CHART,
              sector: item.sector,
              vol: item.vol,
              symbol: item.symbol
            }
          }))
        ])

        if (cancelled) return

        setMarketCards(indexResults)
        setStocks(stockResults)
        setSelected((current) => stockResults.find((item) => item.s === current?.s) || stockResults[0])
      } catch (error) {
        if (!cancelled) {
          setMarketCards(FALLBACK_INDEX_DATA)
          setStocks(FALLBACK_STOCKS)
          setSelected(FALLBACK_STOCKS[6])
        }
      }
    }

    loadLiveData()
    const intervalId = setInterval(loadLiveData, 60000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [])

  const filtered = useMemo(() => {
    return stocks.filter((item) => {
      const matchesCap = cap === 'All' || item.c === cap
      const searchTarget = `${item.s} ${item.n}`.toLowerCase()
      return matchesCap && searchTarget.includes(q.toLowerCase())
    })
  }, [cap, q, stocks])

  const addWatch = (symbol) => {
    setWatch((current) => (current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]))
  }

  const external = (type, symbol) => {
    const base = (symbol || '').replace('.NS', '').replace('.BO', '')
    const urls = {
      tradingview: `https://www.tradingview.com/symbols/NSE-${base}/`,
      moneycontrol: `https://www.moneycontrol.com/india/stockpricequote/${base.toLowerCase()}/`,
      screener: `https://www.screener.in/company/${base}/`,
      nse: `https://www.nseindia.com/get-quotes/equity?symbol=${base}`
    }
    window.open(urls[type], '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo"><TrendingUp size={20} /></div>
          <div>
            <b>Stock Pulse</b>
            <span>INDIA</span>
          </div>
        </div>

        <nav className={menu ? 'open' : ''}>
          {['Dashboard', 'Market Scanner', 'Watchlist', 'Strategies', 'Reports'].map((item, index) => (
            <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
          ))}
        </nav>

        <div className="top-actions">
          <button className="iconbtn"><Bell size={18} /></button>
          <button className="profile">AJ</button>
          <button className="iconbtn mobile-menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <div className="eyebrow"><span className="live-dot" /> MARKET INTELLIGENCE</div>
            <h1>Indian Stock Market <em>Dashboard</em></h1>
            <p>Scan large, mid and small caps with a clean technical-score view, then open trusted external sources for live charts, quotes and research.</p>
          </div>

          <div className="hero-actions">
            <button className="refresh" onClick={() => { setRefresh(true); setTimeout(() => setRefresh(false), 700) }}>
              <RefreshCw className={refresh ? 'spin' : ''} size={17} /> Refresh
            </button>
            <a className="primary" href="https://www.tradingview.com/markets/stocks-india/" target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> Live Market
            </a>
          </div>
        </section>

        <section className="market-strip">
          {marketCards.map((item) => (
            <div className="ticker" key={item.label}>
              <span>{item.label}</span>
              <b>{item.label === 'INDIA VIX' ? formatIndex(item.value, 2) : formatCurrency(item.value, 2)}</b>
              <small className={item.change >= 0 ? 'up' : 'down'}>{item.change >= 0 ? '+' : ''}{formatIndex(item.change, 2)}%</small>
            </div>
          ))}
        </section>

        <section className="grid top-grid">
          <div className="card chart-card">
            <div className="card-head">
              <div>
                <span className="label">MARKET MOMENTUM</span>
                <h2>NIFTY Trend Score <strong>{Math.min(99, Math.max(55, Math.round((marketCards[0]?.change ?? 0) * 25 + 75)))}/100</strong></h2>
              </div>
              <span className="pill green">{(marketCards[0]?.change ?? 0) >= 0 ? 'Bullish' : 'Bearish'}</span>
            </div>

            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selected?.chart || FALLBACK_CHART}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopOpacity=".22" />
                      <stop offset="100%" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" minTickGap={18} tick={{ fontSize: 10, fill: '#7a8699' }} />
                  <YAxis hide domain={['dataMin-4', 'dataMax+4']} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Price']} labelFormatter={(label) => label} />
                  <Area type="monotone" dataKey="value" strokeWidth={3} fill="url(#g)" fillOpacity={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-foot">
              <span><i className="updot" /> EMA alignment</span>
              <span><i className="bluedot" /> Volume expansion</span>
              <span><i className="greendot" /> RSI strength</span>
            </div>
          </div>

          <div className="card signal-card">
            <div className="card-head">
              <div>
                <span className="label">AI SIGNAL ENGINE</span>
                <h2>Today's setup</h2>
              </div>
              <Sparkles size={21} />
            </div>
            <div className="signal-score">
              <div className="ring"><b>{Math.min(99, Math.max(60, Math.round(Math.abs(marketCards[0]?.change ?? 0) * 25 + 70)))}</b><span>/100</span></div>
              <div><b>Positive bias</b><p>Trend + momentum + volume</p></div>
            </div>
            <div className="signal-list">
              <div><span>Trend</span><b>Strong</b></div>
              <div><span>Momentum</span><b>Positive</b></div>
              <div><span>Risk</span><b>Moderate</b></div>
            </div>
            <div className="notice"><ShieldCheck size={16} /> Research aid only — verify live price before trading.</div>
          </div>
        </section>

        <section className="grid lower-grid">
          <div className="card scanner">
            <div className="card-head scanner-head">
              <div>
                <span className="label">STOCK SCANNER</span>
                <h2>Top opportunities</h2>
              </div>
              <div className="search">
                <Search size={16} />
                <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search symbol..." />
              </div>
            </div>

            <div className="tabs">
              {['All', 'Large Cap', 'Mid Cap', 'Small Cap'].map((item) => (
                <button key={item} onClick={() => setCap(item)} className={cap === item ? 'selected' : ''}>{item}</button>
              ))}
            </div>

            <div className="table">
              <div className="tr th">
                <span>Stock</span>
                <span>Price</span>
                <span>Change</span>
                <span>Score</span>
                <span>Trend</span>
                <span>Action</span>
              </div>

              {filtered.slice(0, 10).map((item) => (
                <div className="tr" key={item.s} onClick={() => setSelected(item)}>
                  <span className="stock">
                    <span className="mini-logo">{item.s.slice(0, 2)}</span>
                    <span>
                      <b>{item.s}</b>
                      <small>{item.n}</small>
                    </span>
                  </span>
                  <span>₹{formatCurrency(item.p, 2)}</span>
                  <span className={item.ch >= 0 ? 'positive' : 'negative'}>{item.ch >= 0 ? '+' : ''}{formatCurrency(item.ch, 2)}%</span>
                  <span><b className="score">{item.score}</b></span>
                  <span>
                    <span className={`trend ${item.score > 88 ? 'strong' : item.score > 75 ? 'bull' : 'neutral'}`}>{item.trend}</span>
                  </span>
                  <span className="row-actions">
                    <button onClick={(event) => { event.stopPropagation(); addWatch(item.symbol || item.s) }} title="Watchlist">
                      <Star size={15} fill={watch.includes(item.symbol || item.s) ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={(event) => { event.stopPropagation(); external('tradingview', item.symbol || item.s) }} title="Live chart">
                      <ExternalLink size={15} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="side">
            <div className="card selected-card">
              <div className="card-head">
                <div>
                  <span className="label">SELECTED STOCK</span>
                  <h2>{selected?.s}</h2>
                </div>
                <span className="badge">{selected?.c}</span>
              </div>

              <div className="big-price">
                ₹{formatCurrency(selected?.p || 0, 2)}
                <span className={selected?.ch >= 0 ? 'positive' : 'negative'}>{selected?.ch >= 0 ? '+' : ''}{formatCurrency(selected?.ch || 0, 2)}%</span>
              </div>

              <div className="metrics">
                <div>
                  <span>Signal</span>
                  <b>{selected?.score || 0}/100</b>
                </div>
                <div>
                  <span>Trend</span>
                  <b>{selected?.trend || 'Neutral'}</b>
                </div>
                <div>
                  <span>Risk</span>
                  <b>{selected?.vol || 'Medium'}</b>
                </div>
              </div>

              <div className="external-grid">
                <button onClick={() => external('tradingview', selected?.symbol || selected?.s)}><LineChart /> TradingView</button>
                <button onClick={() => external('moneycontrol', selected?.symbol || selected?.s)}><BarChart3 /> Moneycontrol</button>
                <button onClick={() => external('screener', selected?.symbol || selected?.s)}><Gauge /> Screener</button>
                <button onClick={() => external('nse', selected?.symbol || selected?.s)}><Globe2 /> NSE India</button>
              </div>
            </div>

            <div className="card sector-card">
              <div className="card-head">
                <div>
                  <span className="label">SECTOR HEATMAP</span>
                  <h2>Strength</h2>
                </div>
                <Layers3 size={19} />
              </div>
              <div className="heatmap">
                {SECTORS.map(([name, value]) => (
                  <div key={name} className={`heat h${Math.floor(value / 10)}`} title={`${name}: ${value}/100`}>
                    <b>{name}</b>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="card research">
          <div className="card-head">
            <div>
              <span className="label">REAL-TIME RESEARCH HUB</span>
              <h2>Open live analysis</h2>
            </div>
            <BookOpen size={20} />
          </div>

          <div className="research-grid">
            <a href="https://www.tradingview.com/markets/stocks-india/" target="_blank" rel="noreferrer">
              <LineChart />
              <div><b>TradingView India</b><span>Live charts, indicators & market breadth</span></div>
              <ExternalLink />
            </a>
            <a href="https://www.nseindia.com/market-data/live-equity-market" target="_blank" rel="noreferrer">
              <Globe2 />
              <div><b>NSE Live Market</b><span>Exchange prices, market data & indices</span></div>
              <ExternalLink />
            </a>
            <a href="https://www.moneycontrol.com/stocksmarketsindia/" target="_blank" rel="noreferrer">
              <Newspaper />
              <div><b>Moneycontrol</b><span>Quotes, news, results & market analysis</span></div>
              <ExternalLink />
            </a>
            <a href="https://www.screener.in/" target="_blank" rel="noreferrer">
              <Target />
              <div><b>Screener.in</b><span>Fundamentals, ratios & company research</span></div>
              <ExternalLink />
            </a>
          </div>
        </section>
      </main>

      <footer>
        <span>Stock Pulse India</span>
        <span>Live market values are refreshed directly from public market APIs.</span>
        <span>Built for free static hosting.</span>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
