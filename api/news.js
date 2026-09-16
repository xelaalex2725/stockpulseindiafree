const decodeXml = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()

const parseNewsRss = (xml, source) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
  .map(match => {
    const item = match[1]
    const read = tag => decodeXml(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || '')
    return {
      title: read('title'),
      description: read('description').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      link: read('link'),
      publishedAt: read('pubDate'),
      source
    }
  })
  .filter(article => article.title && article.link)

export default async function handler(request, response) {
  const feeds = [
    { url: 'https://www.moneycontrol.com/rss/marketreports.xml', source: 'Moneycontrol' },
    { url: 'https://news.google.com/rss/search?q=Indian+stock+market+when%3A7d&hl=en-IN&gl=IN&ceid=IN%3Aen', source: 'Google News' }
  ]

  try {
    const results = await Promise.all(feeds.map(async feed => {
      const result = await fetch(feed.url, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India', Accept: 'application/rss+xml, application/xml, text/xml' } })
      return result.ok ? parseNewsRss(await result.text(), feed.source) : []
    }))
    const articles = [...new Map(results.flat().map(article => [article.link, article])).values()]
      .sort((first, second) => new Date(second.publishedAt || 0) - new Date(first.publishedAt || 0))
      .slice(0, 100)
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return response.status(200).json({ updatedAt: new Date().toISOString(), articles })
  } catch (error) {
    console.error('Error fetching market news:', error)
    return response.status(502).json({ error: 'Unable to reach market news feeds' })
  }
}
