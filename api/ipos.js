const NSE_IPO_URL = 'https://www.nseindia.com/api/ipo-current-issue'
const IPO_HISTORY_URL = 'https://ipocentral.in/ipo-2026/'

const read = (item, names) => {
  for (const name of names) {
    if (item?.[name] !== undefined && item[name] !== null && item[name] !== '') return item[name]
  }
  return ''
}

const formatDate = value => {
  if (!value) return ''
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString().slice(0, 10)
}

const getStatus = (item, openDate, closeDate, listingDate) => {
  const sourceStatus = String(read(item, ['status', 'issueStatus']) || '').toLowerCase()
  if (listingDate || /listed|listing|allotted/i.test(sourceStatus)) return 'Listed'
  const today = new Date().toISOString().slice(0, 10)
  if (openDate && openDate > today) return 'Upcoming'
  if (closeDate && closeDate < today) return 'Closed'
  return 'Open'
}

const normalizeIpo = item => {
  const openDate = formatDate(read(item, ['issueStartDate', 'openDate', 'startDate']))
  const closeDate = formatDate(read(item, ['issueEndDate', 'closeDate', 'endDate']))
  const listingDate = formatDate(read(item, ['listingDate', 'listingDt']))
  return {
  company: String(read(item, ['companyName', 'issuerName', 'issueName', 'name']) || 'Unnamed IPO'),
  symbol: String(read(item, ['symbol', 'securityName']) || ''),
  issueType: String(read(item, ['issueType', 'ipoType']) || 'IPO'),
  openDate,
  closeDate,
  listingDate,
  priceRange: String(read(item, ['priceRange', 'priceBand', 'issuePrice']) || 'Not disclosed'),
  currentPrice: String(read(item, ['currentPrice', 'lastPrice', 'marketPrice']) || ''),
  issueSize: String(read(item, ['issueSize', 'issueSizeInCrores', 'totalIssueSize']) || 'Not disclosed'),
  lotSize: String(read(item, ['marketLot', 'lotSize', 'minimumLotSize']) || 'Not disclosed'),
  subscription: String(read(item, ['subscription', 'subscriptionStatus']) || 'Not available'),
  status: getStatus(item, openDate, closeDate, listingDate),
  source: 'NSE',
  sourceUrl: 'https://www.nseindia.com/market-data/ipos'
  }
}

const decodeHtml = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;|&ndash;/g, '-').replace(/&#8217;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim()
const parseHistoricalIpos = html => [...String(html).matchAll(/<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi)]
  .map(match => {
    const company = decodeHtml(match[1])
    const listingDate = formatDate(decodeHtml(match[2]))
    const allotmentPrice = decodeHtml(match[3])
    const listingReturn = Number(decodeHtml(match[4]))
    const price = Number(allotmentPrice.replace(/,/g, ''))
    const listingPrice = Number.isFinite(price) && Number.isFinite(listingReturn) ? `₹${(price * (1 + listingReturn / 100)).toFixed(2)}` : 'Not disclosed'
    return { company, symbol: '', issueType: 'Listed IPO', openDate: '', closeDate: '', listingDate, priceRange: price ? `₹${price}` : 'Not disclosed', issueSize: 'Not disclosed', lotSize: 'Not disclosed', subscription: 'Not available', status: 'Listed', listingReturn, listingPrice, source: 'IPO Central', sourceUrl: IPO_HISTORY_URL }
  })
  .filter(ipo => ipo.company && ipo.listingDate)

export default async function handler(request, response) {
  try {
    const nseResponse = await fetch(NSE_IPO_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Stock Pulse India',
        Accept: 'application/json, text/plain, */*',
        Referer: 'https://www.nseindia.com/'
      }
    })

    if (!nseResponse.ok) return response.status(nseResponse.status).json({ error: `NSE returned ${nseResponse.status}` })

    const payload = await nseResponse.json()
    const items = Array.isArray(payload) ? payload : payload?.data || payload?.ipos || payload?.ipoData || []
    let historicalIpos = []
    try {
      const historyResponse = await fetch(IPO_HISTORY_URL, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India' } })
      if (historyResponse.ok) historicalIpos = parseHistoricalIpos(await historyResponse.text())
    } catch (historyError) {
      console.warn('Historical IPO feed unavailable:', historyError.message)
    }
    const currentIpos = items.map(normalizeIpo)
    const currentNames = new Set(currentIpos.map(ipo => ipo.company.toLowerCase()))
    const ipos = [...currentIpos, ...historicalIpos.filter(ipo => !currentNames.has(ipo.company.toLowerCase()))]
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return response.status(200).json({ source: 'NSE + IPO Central', updatedAt: new Date().toISOString(), ipos })
  } catch (error) {
    console.error('Error fetching NSE IPO data:', error)
    return response.status(502).json({ error: 'Unable to reach NSE IPO data feed' })
  }
}
