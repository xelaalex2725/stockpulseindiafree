const decodeXml = (value = '') => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
const parseFeed = (xml, source) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(match => {
  const item = match[1]
  const read = tag => decodeXml(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || '')
  return { title: read('title'), description: read('description').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), link: read('link'), publishedAt: read('pubDate'), source }
}).filter(article => article.title && article.link)

export default async function handler(request, response) {
  const feeds = [
    ['https://nsearchives.nseindia.com/content/RSS/Corporate_action.xml', 'NSE Corporate Actions'],
    ['https://www.moneycontrol.com/rss/marketreports.xml', 'Moneycontrol'],
    ['https://news.google.com/rss/search?q=Indian+stocks+market+when%3A1d&hl=en-IN&gl=IN&ceid=IN%3Aen', 'Google News']
  ]
  const highImpact = /results|earnings|profit|loss|dividend|bonus|split|merger|acquisition|fraud|order|approval|penalty|downgrade|upgrade|surge|crash|buyback|insider/i
  try {
    const results = []
    for (const [url, source] of feeds) {
      const feedResponse = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India', Accept: 'application/rss+xml, application/xml, text/xml' } })
      if (feedResponse.ok) results.push(...parseFeed(await feedResponse.text(), source).filter(article => highImpact.test(`${article.title} ${article.description}`)))
    }
    const alerts = [...new Map(results.map(article => [article.link, { ...article, severity: /fraud|loss|penalty|crash/i.test(article.title) ? 'high' : 'medium' }])).values()].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)).slice(0, 50)
    response.setHeader('Cache-Control', 'public, max-age=45')
    return response.json({ updatedAt: new Date().toISOString(), alerts })
  } catch (error) {
    console.error('Error fetching market alerts:', error.message)
    return response.status(502).json({ error: 'Unable to reach NSE and market alert feeds' })
  }
}
