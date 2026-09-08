export default async function handler(request, response) {
  const { symbol } = request.query
  const range = request.query.range || '1y'
  const interval = request.query.interval || '1d'
  const events = request.query.events || 'div'

  if (!symbol || !/^[A-Z0-9&-]+\.(NS|BO)$/i.test(symbol)) {
    return response.status(400).json({ error: 'A valid NSE or BSE symbol is required' })
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
