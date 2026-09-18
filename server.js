import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server running' })
})

const decodeXml = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()

const parseNseDividends = (xml) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
  .map(match => {
    const item = match[1]
    const title = decodeXml(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '')
    const description = decodeXml(item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || '')
    const publishedAt = decodeXml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '')
    const titleParts = title.match(/^(.*?)\s*-\s*Ex-Date:\s*(.*)$/i)
    const readField = (name, next) => decodeXml(description.match(new RegExp(`${name}:([\\s\\S]*?) \\|${next}:`, 'i'))?.[1] || '')
    return {
      company: titleParts?.[1] || title,
      exDate: titleParts?.[2] || '',
      purpose: readField('PURPOSE', 'FACE VALUE'),
      recordDate: readField('RECORD DATE', 'BOOK CLOSURE START DATE'),
      faceValue: readField('FACE VALUE', 'RECORD DATE'),
      publishedAt,
      source: 'NSE'
    }
  })
  .filter(dividend => /dividend/i.test(dividend.purpose))

const parseNewsRss = (xml, source) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
  .map(match => {
    const item = match[1]
    const read = (tag) => decodeXml(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || '')
    return {
      title: read('title'),
      description: read('description').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      link: read('link'),
      publishedAt: read('pubDate'),
      source
    }
  })
  .filter(article => article.title && article.link)

app.get('/api/dividends', async (req, res) => {
  try {
    const response = await fetch('https://nsearchives.nseindia.com/content/RSS/Corporate_action.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India', Accept: 'application/rss+xml, application/xml, text/xml' }
    })
    if (!response.ok) return res.status(response.status).json({ error: `NSE returned ${response.status}` })
    const xml = await response.text()
    res.set('Cache-Control', 'public, max-age=300')
    res.json({ source: 'NSE', updatedAt: new Date().toISOString(), dividends: parseNseDividends(xml) })
  } catch (error) {
    console.error('Error fetching NSE dividends:', error.message)
    res.status(502).json({ error: 'Unable to reach NSE corporate actions feed' })
  }
})

app.get('/api/ipos', async (req, res) => {
  try {
    const response = await fetch('https://www.nseindia.com/api/ipo-current-issue', {
      headers: {
        'User-Agent': 'Mozilla/5.0 Stock Pulse India',
        Accept: 'application/json, text/plain, */*',
        Referer: 'https://www.nseindia.com/'
      }
    })
    if (!response.ok) return res.status(response.status).json({ error: `NSE returned ${response.status}` })
    const payload = await response.json()
    const items = Array.isArray(payload) ? payload : payload?.data || payload?.ipos || payload?.ipoData || []
    const read = (item, names) => names.find(name => item?.[name] !== undefined && item[name] !== null && item[name] !== '') ? item[names.find(name => item?.[name] !== undefined && item[name] !== null && item[name] !== '')] : ''
    const formatDate = value => { if (!value) return ''; const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString().slice(0, 10) }
    const currentIpos = items.map(item => {
      const openDate = formatDate(read(item, ['issueStartDate', 'openDate', 'startDate']))
      const closeDate = formatDate(read(item, ['issueEndDate', 'closeDate', 'endDate']))
      const listingDate = formatDate(read(item, ['listingDate', 'listingDt']))
      const sourceStatus = String(read(item, ['status', 'issueStatus']) || '').toLowerCase()
      const today = new Date().toISOString().slice(0, 10)
      const status = listingDate || /listed|listing|allotted/i.test(sourceStatus) ? 'Listed' : openDate > today ? 'Upcoming' : closeDate < today ? 'Closed' : 'Open'
      return {
      company: String(read(item, ['companyName', 'issuerName', 'issueName', 'name']) || 'Unnamed IPO'),
      symbol: String(read(item, ['symbol', 'securityName']) || ''),
      issueType: String(read(item, ['issueType', 'ipoType']) || 'IPO'),
      openDate,
      closeDate,
      listingDate,
      priceRange: String(read(item, ['priceRange', 'priceBand', 'issuePrice']) || 'Not disclosed'),
      issueSize: String(read(item, ['issueSize', 'issueSizeInCrores', 'totalIssueSize']) || 'Not disclosed'),
      lotSize: String(read(item, ['marketLot', 'lotSize', 'minimumLotSize']) || 'Not disclosed'),
      subscription: String(read(item, ['subscription', 'subscriptionStatus']) || 'Not available'),
      status,
      source: 'NSE',
      sourceUrl: 'https://www.nseindia.com/market-data/ipos'
      }
    })
    let historicalIpos = []
    try {
      const historyResponse = await fetch('https://ipocentral.in/ipo-2026/', { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India' } })
      if (historyResponse.ok) {
        const html = await historyResponse.text()
        const decodeHtml = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;|&ndash;/g, '-').replace(/&#8217;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim()
        historicalIpos = [...html.matchAll(/<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi)].map(match => {
          const company = decodeHtml(match[1])
          const listingDate = formatDate(decodeHtml(match[2]))
          const allotmentPrice = decodeHtml(match[3])
          const listingReturn = Number(decodeHtml(match[4]))
          const price = Number(allotmentPrice.replace(/,/g, ''))
          return { company, symbol: '', issueType: 'Listed IPO', openDate: '', closeDate: '', listingDate, priceRange: price ? `₹${price}` : 'Not disclosed', issueSize: 'Not disclosed', lotSize: 'Not disclosed', subscription: 'Not available', status: 'Listed', listingReturn, listingPrice: Number.isFinite(price) && Number.isFinite(listingReturn) ? `₹${(price * (1 + listingReturn / 100)).toFixed(2)}` : 'Not disclosed', source: 'IPO Central', sourceUrl: 'https://ipocentral.in/ipo-2026/' }
        }).filter(ipo => ipo.company && ipo.listingDate)
      }
    } catch (historyError) {
      console.warn('Historical IPO feed unavailable:', historyError.message)
    }
    const currentNames = new Set(currentIpos.map(ipo => ipo.company.toLowerCase()))
    const ipos = [...currentIpos, ...historicalIpos.filter(ipo => !currentNames.has(ipo.company.toLowerCase()))]
    res.set('Cache-Control', 'public, max-age=300')
    res.json({ source: 'NSE + IPO Central', updatedAt: new Date().toISOString(), ipos })
  } catch (error) {
    console.error('Error fetching NSE IPO data:', error.message)
    res.status(502).json({ error: 'Unable to reach NSE IPO data feed' })
  }
})

app.get('/api/news', async (req, res) => {
  const feeds = [
    { url: 'https://www.moneycontrol.com/rss/marketreports.xml', source: 'Moneycontrol' },
    { url: 'https://news.google.com/rss/search?q=Indian+stock+market+when%3A7d&hl=en-IN&gl=IN&ceid=IN%3Aen', source: 'Google News' }
  ]

  try {
    const articles = []
    for (const feed of feeds) {
      const response = await fetch(feed.url, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India', Accept: 'application/rss+xml, application/xml, text/xml' } })
      if (response.ok) articles.push(...parseNewsRss(await response.text(), feed.source))
    }
    const uniqueArticles = [...new Map(articles.map(article => [article.link, article])).values()]
      .sort((first, second) => new Date(second.publishedAt || 0) - new Date(first.publishedAt || 0))
      .slice(0, 100)
    res.set('Cache-Control', 'public, max-age=300')
    res.json({ updatedAt: new Date().toISOString(), articles: uniqueArticles })
  } catch (error) {
    console.error('Error fetching market news:', error.message)
    res.status(502).json({ error: 'Unable to reach market news feeds' })
  }
})

app.get('/api/alerts', async (req, res) => {
  const feeds = [
    { url: 'https://nsearchives.nseindia.com/content/RSS/Corporate_action.xml', source: 'NSE Corporate Actions' },
    { url: 'https://www.moneycontrol.com/rss/marketreports.xml', source: 'Moneycontrol' },
    { url: 'https://news.google.com/rss/search?q=Indian+stocks+market+when%3A1d&hl=en-IN&gl=IN&ceid=IN%3Aen', source: 'Google News' }
  ]
  const highImpact = /results|earnings|profit|loss|dividend|bonus|split|merger|acquisition|fraud|order|approval|penalty|downgrade|upgrade|surge|crash|buyback|insider/i
  try {
    const results = []
    for (const feed of feeds) {
      const response = await fetch(feed.url, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India', Accept: 'application/rss+xml, application/xml, text/xml' } })
      if (!response.ok) continue
      const xml = await response.text()
      results.push(...parseNewsRss(xml, feed.source).filter(article => highImpact.test(`${article.title} ${article.description}`)))
    }
    const alerts = [...new Map(results.map(article => [article.link, { ...article, severity: /fraud|loss|penalty|crash/i.test(article.title) ? 'high' : 'medium' }])).values()]
      .sort((first, second) => new Date(second.publishedAt || 0) - new Date(first.publishedAt || 0)).slice(0, 50)
    res.set('Cache-Control', 'public, max-age=45')
    res.json({ updatedAt: new Date().toISOString(), alerts })
  } catch (error) {
    console.error('Error fetching market alerts:', error.message)
    res.status(502).json({ error: 'Unable to reach NSE and market alert feeds' })
  }
})

// Proxy endpoint for Yahoo Finance API
app.get('/api/chart/:symbol', async (req, res) => {
  const { symbol } = req.params
  const { range = '1y', interval = '1d', events = 'div' } = req.query
  const allowedRanges = new Set(['1d', '5d', '1mo', '3mo', '6mo', 'ytd', '1y', '2y', '5y', '10y', 'max'])
  const allowedIntervals = new Set(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'])

  if (!/^[A-Z0-9&-]+\.(NS|BO)$/i.test(symbol)) {
    return res.status(400).json({ error: 'A valid NSE or BSE symbol is required' })
  }
  if (!allowedRanges.has(range) || !allowedIntervals.has(interval) || events !== 'div') {
    return res.status(400).json({ error: 'Invalid chart query parameters' })
  }
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&events=${events}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Yahoo Finance returned ${response.status}` 
      })
    }
    
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error.message)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/financials/:symbol', async (req, res) => {
  const { symbol } = req.params
  if (!/^[A-Z0-9&-]+\.(NS|BO)$/i.test(symbol)) {
    return res.status(400).json({ error: 'A valid NSE or BSE symbol is required' })
  }

  try {
    const types = ['annualTotalRevenue', 'annualGrossProfit', 'annualOperatingIncome', 'annualNetIncome', 'annualPretaxIncome', 'annualDilutedEPS', 'annualDilutedAverageShares', 'annualCashDividendsPaid', 'annualTotalAssets', 'annualTotalLiabilitiesNetMinorityInterest', 'annualTotalDebt', 'annualStockholdersEquity', 'annualOperatingCashFlow', 'annualFreeCashFlow'].join(',')
    const period1 = Math.floor(Date.now() / 1000) - 4 * 365 * 24 * 60 * 60
    const period2 = Math.floor(Date.now() / 1000) + 24 * 60 * 60
    const url = `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(symbol)}?type=${types}&merge=false&period1=${period1}&period2=${period2}`
    const [response, chartResponse] = await Promise.all([
      fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India' } }),
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India' } })
    ])
    if (!response.ok) return res.status(response.status).json({ error: `Yahoo Finance returned ${response.status}` })

    const body = await response.json()
    const results = body?.timeseries?.result || []
    if (!results.length) return res.status(404).json({ error: 'Financial data is unavailable for this symbol' })

    const valueOf = field => field?.raw ?? null
    const series = (name) => {
      const rows = results.find(item => item.meta?.type?.[0] === name)?.[name] || []
      return rows.map(row => valueOf(row.reportedValue)).filter(value => value !== null)
    }
    const latest = name => series(name).at(-1) ?? null
    const previous = name => series(name).at(-2) ?? null
    const annual = name => latest(`annual${name}`)
    const growth = name => { const current = annual(name); const prior = previous(name); return current !== null && prior ? current / prior - 1 : null }
    const revenue = annual('TotalRevenue')
    const netIncome = annual('NetIncome')
    const equity = annual('StockholdersEquity')
    const assets = annual('TotalAssets')
    const operatingIncome = annual('OperatingIncome')
    const currentPrice = Number((await chartResponse.json())?.chart?.result?.[0]?.meta?.regularMarketPrice)
    const eps = annual('DilutedEPS')
    const shares = annual('DilutedAverageShares')
    const dividendsPaid = annual('CashDividendsPaid')
    const dividendPerShare = shares && dividendsPaid ? Math.abs(dividendsPaid) / shares : null
    const marketCap = currentPrice && shares ? currentPrice * shares : null

    res.set('Cache-Control', 'public, max-age=900')
    res.json({
      symbol,
      updatedAt: new Date().toISOString(),
      currency: 'INR',
      valuation: { marketCap, pe: currentPrice && eps ? currentPrice / eps : null, forwardPe: null, priceToBook: null, dividendYield: currentPrice && dividendPerShare ? dividendPerShare / currentPrice : null },
      performance: { revenue, revenueGrowth: growth('TotalRevenue'), earningsGrowth: growth('NetIncome'), profitMargin: revenue ? netIncome / revenue : null, operatingMargin: revenue ? operatingIncome / revenue : null, returnOnEquity: equity ? netIncome / equity : null, returnOnAssets: assets ? netIncome / assets : null, eps },
      balanceSheet: { totalCash: null, totalDebt: annual('TotalDebt'), debtToEquity: equity ? annual('TotalDebt') / equity * 100 : null, currentRatio: null, freeCashFlow: annual('FreeCashFlow'), operatingCashFlow: annual('OperatingCashFlow') },
      latestYear: { netIncome, totalAssets: assets, totalLiabilities: annual('TotalLiabilitiesNetMinorityInterest') }
    })
  } catch (error) {
    console.error(`Error fetching financials for ${symbol}:`, error.message)
    res.status(502).json({ error: 'Unable to reach Yahoo Finance financials' })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
  console.log(`CORS enabled for frontend requests`)
})
