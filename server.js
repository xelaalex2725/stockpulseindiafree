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

// Proxy endpoint for Yahoo Finance API
app.get('/api/chart/:symbol', async (req, res) => {
  const { symbol } = req.params
  const { range = '1y', interval = '1d' } = req.query
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`
    
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
  console.log(`CORS enabled for frontend requests`)
})
