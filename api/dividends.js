const NSE_RSS_URL = 'https://nsearchives.nseindia.com/content/RSS/Corporate_action.xml'

const decodeXml = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .trim()

const field = (text, name, nextField) => {
  const pattern = nextField
    ? new RegExp(`${name}:([\\s\\S]*?) \\|${nextField}:`, 'i')
    : new RegExp(`${name}:([\\s\\S]*?)(?: \\||$)`, 'i')
  return decodeXml(text.match(pattern)?.[1] || '')
}

const parseNseDividends = (xml) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
  .map(match => {
    const item = match[1]
    const title = decodeXml(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '')
    const description = decodeXml(item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || '')
    const publishedAt = decodeXml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '')
    const titleParts = title.match(/^(.*?)\s*-\s*Ex-Date:\s*(.*)$/i)
    const purpose = field(description, 'PURPOSE', 'FACE VALUE')
    const recordDate = field(description, 'RECORD DATE', 'BOOK CLOSURE START DATE')
    const faceValue = field(description, 'FACE VALUE', 'RECORD DATE')

    return {
      company: titleParts?.[1] || title,
      exDate: titleParts?.[2] || '',
      purpose,
      recordDate,
      faceValue,
      publishedAt,
      source: 'NSE'
    }
  })
  .filter(dividend => /dividend/i.test(dividend.purpose))

export default async function handler(request, response) {
  try {
    const nseResponse = await fetch(NSE_RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Stock Pulse India',
        Accept: 'application/rss+xml, application/xml, text/xml'
      }
    })

    if (!nseResponse.ok) {
      return response.status(nseResponse.status).json({ error: `NSE returned ${nseResponse.status}` })
    }

    const xml = await nseResponse.text()
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return response.status(200).json({ source: 'NSE', updatedAt: new Date().toISOString(), dividends: parseNseDividends(xml) })
  } catch (error) {
    console.error('Error fetching NSE dividends:', error)
    return response.status(502).json({ error: 'Unable to reach NSE corporate actions feed' })
  }
}
