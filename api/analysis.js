import { generateStockAnalysis } from '../lib/stockAnalysis.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })

  try {
    const analysis = await generateStockAnalysis(request.body || {})
    return response.json(analysis)
  } catch (error) {
    return response.status(error.status || 502).json({ error: error.message || 'Unable to generate stock analysis.' })
  }
}