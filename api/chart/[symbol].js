export default async function handler(request, response) {
  const { symbol } = request.query
  const range = request.query.range || '1y'
  const interval = request.query.interval || '1d'
  const events = request.query.events || 'div'
  const allowedRanges = new Set(['1d', '5d', '1mo', '3mo', '6mo', 'ytd', '1y', '2y', '5y', '10y', 'max'])
  const allowedIntervals = new Set(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'])

  if (!symbol || !/^[A-Z0-9&-]+\.(NS|BO)$/i.test(symbol)) {
    return response.status(400).json({ error: 'A valid NSE or BSE symbol is required' })
  }
  if (!allowedRanges.has(range) || !allowedIntervals.has(interval) || events !== 'div') {
    return response.status(400).json({ error: 'Invalid chart query parameters' })
  }

  try {
    const yahooUrl = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`)
    yahooUrl.searchParams.set('range', range)
    yahooUrl.searchParams.set('interval', interval)
    yahooUrl.searchParams.set('events', events)

    const yahooResponse = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Stock Pulse India'
      }
    })

    const body = await yahooResponse.text()
    response.status(yahooResponse.status)
    response.setHeader('Content-Type', 'application/json')
    return response.send(body)
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error)
    return response.status(502).json({ error: 'Unable to reach Yahoo Finance' })
  }
}
