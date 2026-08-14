import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, BookOpen,
  ChevronDown, ExternalLink, Gauge, Globe2, Layers3, LineChart,
  Menu, Newspaper, RefreshCw, Search, ShieldCheck, Sparkles, Star,
  Target, TrendingUp, X
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import './styles.css'

const STOCKS = [
  // Large cap
  {s:'RELIANCE', n:'Reliance Industries', c:'Large Cap', p:1418.3, ch:1.82, score:88, trend:'Bullish', sector:'Energy', vol:'High'},
  {s:'HDFCBANK', n:'HDFC Bank', c:'Large Cap', p:1924.6, ch:0.94, score:82, trend:'Bullish', sector:'Banking', vol:'High'},
  {s:'ICICIBANK', n:'ICICI Bank', c:'Large Cap', p:1486.2, ch:1.31, score:86, trend:'Bullish', sector:'Banking', vol:'High'},
  {s:'INFY', n:'Infosys', c:'Large Cap', p:1698.4, ch:-0.42, score:69, trend:'Neutral', sector:'IT', vol:'Medium'},
  {s:'TCS', n:'Tata Consultancy Services', c:'Large Cap', p:3128.7, ch:0.36, score:74, trend:'Bullish', sector:'IT', vol:'Medium'},
  {s:'BHARTIARTL', n:'Bharti Airtel', c:'Large Cap', p:1922.5, ch:2.08, score:91, trend:'Strong Bullish', sector:'Telecom', vol:'High'},
  {s:'LT', n:'Larsen & Toubro', c:'Large Cap', p:3871.2, ch:1.14, score:84, trend:'Bullish', sector:'Infra', vol:'High'},
  {s:'SBIN', n:'State Bank of India', c:'Large Cap', p:1024.9, ch:1.58, score:87, trend:'Bullish', sector:'Banking', vol:'High'},
  {s:'ITC', n:'ITC', c:'Large Cap', p:401.2, ch:-0.18, score:63, trend:'Neutral', sector:'FMCG', vol:'Low'},
  {s:'MARUTI', n:'Maruti Suzuki', c:'Large Cap', p:14520.0, ch:0.73, score:78, trend:'Bullish', sector:'Auto', vol:'Medium'},
  // Mid cap
  {s:'POLYCAB', n:'Polycab India', c:'Mid Cap', p:6942.1, ch:2.47, score:93, trend:'Strong Bullish', sector:'Electrical', vol:'High'},
  {s:'DIXON', n:'Dixon Technologies', c:'Mid Cap', p:16110.0, ch:2.12, score:90, trend:'Strong Bullish', sector:'Electronics', vol:'High'},
  {s:'TRENT', n:'Trent', c:'Mid Cap', p:6450.5, ch:1.43, score:85, trend:'Bullish', sector:'Retail', vol:'High'},
  {s:'BSE', n:'BSE Ltd', c:'Mid Cap', p:2845.7, ch:3.05, score:94, trend:'Strong Bullish', sector:'Exchange', vol:'High'},
  {s:'HAL', n:'Hindustan Aeronautics', c:'Mid Cap', p:5234.4, ch:1.86, score:89, trend:'Strong Bullish', sector:'Defence', vol:'High'},
  {s:'MUTHOOTFIN', n:'Muthoot Finance', c:'Mid Cap', p:2361.8, ch:0.98, score:81, trend:'Bullish', sector:'Finance', vol:'Medium'},
  {s:'PERSISTENT', n:'Persistent Systems', c:'Mid Cap', p:6148.2, ch:1.12, score:83, trend:'Bullish', sector:'IT', vol:'Medium'},
  {s:'INDHOTEL', n:'Indian Hotels', c:'Mid Cap', p:824.3, ch:1.67, score:86, trend:'Bullish', sector:'Hotels', vol:'High'},
  {s:'MAXHEALTH', n:'Max Healthcare', c:'Mid Cap', p:1188.5, ch:0.84, score:79, trend:'Bullish', sector:'Healthcare', vol:'Medium'},
  {s:'JUBLFOOD', n:'Jubilant FoodWorks', c:'Mid Cap', p:723.4, ch:-0.27, score:61, trend:'Neutral', sector:'Consumer', vol:'Medium'},
  // Small cap
  {s:'KAYNES', n:'Kaynes Technology', c:'Small Cap', p:7028.0, ch:3.42, score:95, trend:'Strong Bullish', sector:'Electronics', vol:'Very High'},
  {s:'NETWEB', n:'Netweb Technologies', c:'Small Cap', p:2842.4, ch:2.76, score:92, trend:'Strong Bullish', sector:'Technology', vol:'Very High'},
  {s:'KPITTECH', n:'KPIT Technologies', c:'Small Cap', p:1376.2, ch:1.95, score:89, trend:'Strong Bullish', sector:'Auto Tech', vol:'High'},
  {s:'CDSL', n:'CDSL', c:'Small Cap', p:1974.0, ch:2.41, score:91, trend:'Strong Bullish', sector:'Markets', vol:'High'},
  {s:'MCX', n:'Multi Commodity Exchange', c:'Small Cap', p:7648.0, ch:1.38, score:85, trend:'Bullish', sector:'Exchange', vol:'High'},
  {s:'TITAGARH', n:'Titagarh Rail Systems', c:'Small Cap', p:1058.6, ch:2.17, score:88, trend:'Bullish', sector:'Railways', vol:'High'},
  {s:'ZENTEC', n:'Zen Technologies', c:'Small Cap', p:1694.2, ch:2.91, score:93, trend:'Strong Bullish', sector:'Defence', vol:'Very High'},
  {s:'KPIL', n:'Kalpataru Projects', c:'Small Cap', p:1298.7, ch:1.04, score:79, trend:'Bullish', sector:'Infra', vol:'Medium'},
  {s:'BLS', n:'BLS International', c:'Small Cap', p:489.6, ch:1.62, score:83, trend:'Bullish', sector:'Services', vol:'High'},
  {s:'EASEMYTRIP', n:'Easy Trip Planners', c:'Small Cap', p:16.72, ch:-0.71, score:55, trend:'Neutral', sector:'Travel', vol:'High'}
]

const CHART = [64,66,65,68,72,70,74,76,75,79,81,80,84,86,85,89,91,94,93,97].map((v,i)=>({i, value:v}))
const SECTORS = [
  ['Banking', 92], ['Defence', 89], ['Electronics', 87], ['Energy', 84],
  ['Telecom', 82], ['IT', 72], ['Auto', 69], ['FMCG', 58]
]

function App(){
  const [cap, setCap] = useState('All')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(STOCKS[6])
  const [watch, setWatch] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [menu, setMenu] = useState(false)

  const filtered = useMemo(() => STOCKS.filter(x =>
    (cap==='All' || x.c===cap) &&
    (x.s.toLowerCase().includes(q.toLowerCase()) || x.n.toLowerCase().includes(q.toLowerCase()))
  ), [cap,q])

  const addWatch = (s) => setWatch(w => w.includes(s) ? w.filter(x=>x!==s) : [...w,s])

  const external = (type, s) => {
    const urls = {
      tradingview: `https://www.tradingview.com/symbols/NSE-${s}/`,
      moneycontrol: `https://www.moneycontrol.com/india/stockpricequote/${s.toLowerCase()}/`,
      screener: `https://www.screener.in/company/${s}/`,
      nse: `https://www.nseindia.com/get-quotes/equity?symbol=${s}`
    }
    window.open(urls[type], '_blank', 'noopener,noreferrer')
  }

  return <div className="app">
    <header className="topbar">
      <div className="brand"><div className="logo"><TrendingUp size={20}/></div><div><b>Stock Pulse</b><span>INDIA</span></div></div>
      <nav className={menu?'open':''}>
        {['Dashboard','Market Scanner','Watchlist','Strategies','Reports'].map((x,i)=><button key={x} className={i===0?'active':''}>{x}</button>)}
      </nav>
      <div className="top-actions">
        <button className="iconbtn"><Bell size={18}/></button>
        <button className="profile">AJ</button>
        <button className="iconbtn mobile-menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
      </div>
    </header>

    <main>
      <section className="hero">
        <div><div className="eyebrow"><span className="live-dot"/> MARKET INTELLIGENCE</div>
        <h1>Indian Stock Market <em>Dashboard</em></h1>
        <p>Scan large, mid and small caps with a clean technical-score view, then open trusted external sources for live charts, quotes and research.</p></div>
        <div className="hero-actions">
          <button className="refresh" onClick={()=>{setRefresh(true);setTimeout(()=>setRefresh(false),700)}}><RefreshCw className={refresh?'spin':''} size={17}/> Refresh</button>
          <a className="primary" href="https://www.tradingview.com/markets/stocks-india/" target="_blank" rel="noreferrer"><ExternalLink size={16}/> Live Market</a>
        </div>
      </section>

      <section className="market-strip">
        {[
          ['NIFTY 50','24,612.40','+0.84%','up'],['BANK NIFTY','55,180.25','+1.12%','up'],
          ['SENSEX','80,742.80','+0.77%','up'],['INDIA VIX','13.84','-2.18%','down']
        ].map(([a,b,c,t])=><div className="ticker" key={a}><span>{a}</span><b>{b}</b><small className={t}>{c}</small></div>)}
      </section>

      <section className="grid top-grid">
        <div className="card chart-card">
          <div className="card-head"><div><span className="label">MARKET MOMENTUM</span><h2>NIFTY Trend Score <strong>82/100</strong></h2></div><span className="pill green">Bullish</span></div>
          <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={CHART}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopOpacity=".22"/><stop offset="100%" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="i" hide/><YAxis hide domain={['dataMin-4','dataMax+4']}/><Tooltip formatter={(v)=>[v,'Momentum']} labelFormatter={()=>''}/><Area type="monotone" dataKey="value" strokeWidth={3} fill="url(#g)" fillOpacity={1} /></AreaChart></ResponsiveContainer></div>
          <div className="chart-foot"><span><i className="updot"/> EMA alignment</span><span><i className="bluedot"/> Volume expansion</span><span><i className="greendot"/> RSI strength</span></div>
        </div>

        <div className="card signal-card">
          <div className="card-head"><div><span className="label">AI SIGNAL ENGINE</span><h2>Today's setup</h2></div><Sparkles size={21}/></div>
          <div className="signal-score"><div className="ring"><b>86</b><span>/100</span></div><div><b>Positive bias</b><p>Trend + momentum + volume</p></div></div>
          <div className="signal-list"><div><span>Trend</span><b>Strong</b></div><div><span>Momentum</span><b>Positive</b></div><div><span>Risk</span><b>Moderate</b></div></div>
          <div className="notice"><ShieldCheck size={16}/> Research aid only — verify live price before trading.</div>
        </div>
      </section>

      <section className="grid lower-grid">
        <div className="card scanner">
          <div className="card-head scanner-head">
            <div><span className="label">STOCK SCANNER</span><h2>Top opportunities</h2></div>
            <div className="search"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search symbol..." /></div>
          </div>
          <div className="tabs">{['All','Large Cap','Mid Cap','Small Cap'].map(x=><button onClick={()=>setCap(x)} className={cap===x?'selected':''} key={x}>{x}</button>)}</div>
          <div className="table">
            <div className="tr th"><span>Stock</span><span>Price</span><span>Change</span><span>Score</span><span>Trend</span><span>Action</span></div>
            {filtered.slice(0,10).map(s=><div className="tr" key={s.s} onClick={()=>setSelected(s)}>
              <span className="stock"><span className="mini-logo">{s.s.slice(0,2)}</span><span><b>{s.s}</b><small>{s.n}</small></span></span>
              <span>₹{s.p.toLocaleString('en-IN')}</span>
              <span className={s.ch>=0?'positive':'negative'}>{s.ch>=0?'+':''}{s.ch.toFixed(2)}%</span>
              <span><b className="score">{s.score}</b></span>
              <span><span className={'trend '+(s.score>88?'strong':s.score>75?'bull':'neutral')}>{s.trend}</span></span>
              <span className="row-actions"><button onClick={(e)=>{e.stopPropagation();addWatch(s.s)}} title="Watchlist"><Star size={15} fill={watch.includes(s.s)?'currentColor':'none'}/></button><button onClick={(e)=>{e.stopPropagation();external('tradingview',s.s)}} title="Live chart"><ExternalLink size={15}/></button></span>
            </div>)}
          </div>
        </div>

        <aside className="side">
          <div className="card selected-card">
            <div className="card-head"><div><span className="label">SELECTED STOCK</span><h2>{selected.s}</h2></div><span className="badge">{selected.c}</span></div>
            <div className="big-price">₹{selected.p.toLocaleString('en-IN')} <span className={selected.ch>=0?'positive':'negative'}>{selected.ch>=0?'+':''}{selected.ch.toFixed(2)}%</span></div>
            <div className="metrics"><div><span>Signal</span><b>{selected.score}/100</b></div><div><span>Trend</span><b>{selected.trend}</b></div><div><span>Risk</span><b>{selected.vol}</b></div></div>
            <div className="external-grid">
              <button onClick={()=>external('tradingview',selected.s)}><LineChart/> TradingView</button>
              <button onClick={()=>external('moneycontrol',selected.s)}><BarChart3/> Moneycontrol</button>
              <button onClick={()=>external('screener',selected.s)}><Gauge/> Screener</button>
              <button onClick={()=>external('nse',selected.s)}><Globe2/> NSE India</button>
            </div>
          </div>

          <div className="card sector-card">
            <div className="card-head"><div><span className="label">SECTOR HEATMAP</span><h2>Strength</h2></div><Layers3 size={19}/></div>
            <div className="heatmap">{SECTORS.map(([name,v])=><div key={name} className={'heat h'+Math.floor(v/10)} title={`${name}: ${v}/100`}><b>{name}</b><span>{v}</span></div>)}</div>
          </div>
        </aside>
      </section>

      <section className="card research">
        <div className="card-head"><div><span className="label">REAL-TIME RESEARCH HUB</span><h2>Open live analysis</h2></div><BookOpen size={20}/></div>
        <div className="research-grid">
          <a href="https://www.tradingview.com/markets/stocks-india/" target="_blank" rel="noreferrer"><LineChart/><div><b>TradingView India</b><span>Live charts, indicators & market breadth</span></div><ExternalLink/></a>
          <a href="https://www.nseindia.com/market-data/live-equity-market" target="_blank" rel="noreferrer"><Globe2/><div><b>NSE Live Market</b><span>Exchange prices, market data & indices</span></div><ExternalLink/></a>
          <a href="https://www.moneycontrol.com/stocksmarketsindia/" target="_blank" rel="noreferrer"><Newspaper/><div><b>Moneycontrol</b><span>Quotes, news, results & market analysis</span></div><ExternalLink/></a>
          <a href="https://www.screener.in/" target="_blank" rel="noreferrer"><Target/><div><b>Screener.in</b><span>Fundamentals, ratios & company research</span></div><ExternalLink/></a>
        </div>
      </section>
    </main>
    <footer><span>Stock Pulse India</span><span>Market data shown in this demo is illustrative. Use the external live sources above for current quotes.</span><span>Built for free static hosting.</span></footer>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
