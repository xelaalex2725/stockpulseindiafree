import { buildFinancials, FINANCIAL_TYPES } from '../../lib/financials.js'

export default async function handler(request, response) {
  const { symbol } = request.query
  if (!symbol || !/^[A-Z0-9&-]+\.(NS|BO)$/i.test(symbol)) return response.status(400).json({ error: 'A valid NSE or BSE symbol is required' })

  try {
    const period1 = Math.floor(Date.now() / 1000) - 10 * 365 * 24 * 60 * 60
    const period2 = Math.floor(Date.now() / 1000) + 24 * 60 * 60
    const types = FINANCIAL_TYPES.join(',')
    const url = `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(symbol)}?type=${types}&merge=false&period1=${period1}&period2=${period2}`
    const [yahooResponse, chartResponse] = await Promise.all([
      fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India' } }),
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India' } })
    ])
    if (!yahooResponse.ok) return response.status(yahooResponse.status).json({ error: `Yahoo Finance returned ${yahooResponse.status}` })

    const results = (await yahooResponse.json())?.timeseries?.result || []
    if (!results.length) return response.status(404).json({ error: 'Financial data is unavailable for this symbol' })
    response.setHeader('Cache-Control', 'public, max-age=900')
    const currentPrice = Number((await chartResponse.json())?.chart?.result?.[0]?.meta?.regularMarketPrice)
    return response.json(buildFinancials(symbol, results, currentPrice))
  } catch (error) {
    console.error(`Error fetching financials for ${symbol}:`, error.message)
    return response.status(502).json({ error: 'Unable to reach Yahoo Finance financials' })
  }
}
