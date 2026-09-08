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

// Proxy endpoint for Yahoo Finance API
app.get('/api/chart/:symbol', async (req, res) => {
  const { symbol } = req.params
  const { range = '1y', interval = '1d', events = 'div' } = req.query
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}&events=${events}`
    
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
