const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 Stock Pulse India',
  Accept: 'application/json',
  Referer: 'https://www.nseindia.com/companies-listing/corporate-filings-shareholding-pattern'
}

const toNumber = value => {
  const number = Number(value)
  return value !== null && value !== undefined && value !== '' && Number.isFinite(number) ? number : null
}

const rowsFrom = payload => Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []

const parseNseDate = value => {
  const match = String(value || '').match(/^(\d{1,2})-([A-Z]{3})-(\d{4})$/i)
  if (!match) return null
  const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(match[2].toUpperCase())
  if (month < 0) return null
  return `${match[3]}-${String(month + 1).padStart(2, '0')}-${String(match[1]).padStart(2, '0')}`
}

const formatQueryDate = date => `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`

const safeFetchJson = async (fetcher, url) => {
  const response = await fetcher(url, { headers: NSE_HEADERS })
  if (!response.ok) return null
  try {
    return await response.json()
  } catch {
    return null
  }
}

const findPercent = (rows, predicate) => {
  const row = rows.find(predicate)
  return toNumber(row?.COL_VIII)
}

const normalizedCategory = row => String(row?.COL_I || '').replace(/\s+/g, ' ').trim()

const normalizeFiling = async (filing, fetcher) => {
  const baseUrl = `https://www.nseindia.com/api/corporate-share-holdings-equities?ndsId=${encodeURIComponent(filing.recordId)}`
  const [summaryPayload, publicPayload] = await Promise.all([
    safeFetchJson(fetcher, `${baseUrl}&index=summary`),
    safeFetchJson(fetcher, `${baseUrl}&index=public-shareholder`)
  ])
  const summaryRows = rowsFrom(summaryPayload)
  const publicRows = rowsFrom(publicPayload)
  const promoterSummary = summaryRows.find(row => row.COL_I === 'A' || /promoter\s*&\s*promoter group/i.test(row.COL_II || ''))
  const foreignPortfolioRows = publicRows.filter(row => /foreign portfolio investors category\s*(i|ii)\b/i.test(normalizedCategory(row)))
  const domesticSubtotal = findPercent(publicRows, row => /sub.?total\s*\(B\)\s*\(1\)/i.test(normalizedCategory(row)))
  const domesticFallback = publicRows
    .filter(row => ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'].includes(String(row.category || '').toLowerCase()))
    .reduce((total, row) => total + (toNumber(row.COL_VIII) || 0), 0)
  const promoterPercent = toNumber(filing.pr_and_prgrp)
  const pledgePercent = toNumber(promoterSummary?.COL_XII_B)

  return {
    date: parseNseDate(filing.date),
    promoter: promoterPercent,
    fii: publicRows.length ? foreignPortfolioRows.reduce((total, row) => total + (toNumber(row.COL_VIII) || 0), 0) : null,
    dii: domesticSubtotal ?? (publicRows.length ? domesticFallback : null),
    public: toNumber(filing.public_val),
    mutualFunds: findPercent(publicRows, row => /mutual funds/i.test(normalizedCategory(row))),
    insurance: findPercent(publicRows, row => /insurance companies/i.test(normalizedCategory(row))),
    promoterPledging: pledgePercent
  }
}

export async function fetchShareholdingHistory(symbol, fetcher = globalThis.fetch, now = new Date()) {
  const normalizedSymbol = String(symbol || '').toUpperCase()
  if (!/^[A-Z0-9&-]+\.(NS|BO)$/.test(normalizedSymbol)) {
    const error = new Error('A valid NSE or BSE symbol is required')
    error.status = 400
    throw error
  }

  if (normalizedSymbol.endsWith('.BO')) {
    return { symbol: normalizedSymbol, source: 'NSE', updatedAt: now.toISOString(), periods: [] }
  }

  const fromDate = new Date(now)
  fromDate.setFullYear(fromDate.getFullYear() - 5)
  const exchange = normalizedSymbol.endsWith('.BO') ? 'bse' : 'equities'
  const exchangeSymbol = normalizedSymbol.replace(/\.(NS|BO)$/, '')
  const masterUrl = new URL('https://www.nseindia.com/api/corporate-share-holdings-master')
  masterUrl.searchParams.set('index', exchange)
  masterUrl.searchParams.set('symbol', exchangeSymbol)
  masterUrl.searchParams.set('from_date', formatQueryDate(fromDate))
  masterUrl.searchParams.set('to_date', formatQueryDate(now))

  const masterPayload = await safeFetchJson(fetcher, masterUrl.toString())
  if (!masterPayload) {
    const error = new Error('NSE shareholding history is temporarily unavailable')
    error.status = 502
    throw error
  }

  const filings = rowsFrom(masterPayload)
    .filter(filing => String(filing.symbol || '').toUpperCase() === exchangeSymbol && filing.recordId && parseNseDate(filing.date))
    .sort((first, second) => parseNseDate(second.date).localeCompare(parseNseDate(first.date)))
    .slice(0, 8)

  const periods = []
  for (let index = 0; index < filings.length; index += 2) {
    periods.push(...await Promise.all(filings.slice(index, index + 2).map(filing => normalizeFiling(filing, fetcher))))
  }
  const history = periods.filter(period => period.date).sort((first, second) => first.date.localeCompare(second.date))
  return {
    symbol: normalizedSymbol,
    source: 'NSE',
    updatedAt: now.toISOString(),
    periods: history
  }
}