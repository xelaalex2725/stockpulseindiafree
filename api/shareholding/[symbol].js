import { fetchShareholdingHistory } from '../../lib/shareholding.js'

export default async function handler(request, response) {
  const { symbol } = request.query
  try {
    const result = await fetchShareholdingHistory(symbol)
    response.setHeader('Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600')
    return response.status(200).json(result)
  } catch (error) {
    return response.status(error.status || 502).json({ error: error.message || 'Unable to fetch NSE shareholding history' })
  }
}