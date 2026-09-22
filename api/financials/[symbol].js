const TYPES = ['annualTotalRevenue', 'annualGrossProfit', 'annualOperatingIncome', 'annualNetIncome', 'annualPretaxIncome', 'annualDilutedEPS', 'annualDilutedAverageShares', 'annualCashDividendsPaid', 'annualTotalAssets', 'annualTotalLiabilitiesNetMinorityInterest', 'annualTotalDebt', 'annualStockholdersEquity', 'annualOperatingCashFlow', 'annualFreeCashFlow'].join(',')

export default async function handler(request, response) {
  const { symbol } = request.query
  if (!symbol || !/^[A-Z0-9&-]+\.(NS|BO)$/i.test(symbol)) return response.status(400).json({ error: 'A valid NSE or BSE symbol is required' })

  try {
    const period1 = Math.floor(Date.now() / 1000) - 4 * 365 * 24 * 60 * 60
    const period2 = Math.floor(Date.now() / 1000) + 24 * 60 * 60
    const url = `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(symbol)}?type=${TYPES}&merge=false&period1=${period1}&period2=${period2}`
    const [yahooResponse, chartResponse] = await Promise.all([
      fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India' } }),
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`, { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India' } })
    ])
    if (!yahooResponse.ok) return response.status(yahooResponse.status).json({ error: `Yahoo Finance returned ${yahooResponse.status}` })

    const results = (await yahooResponse.json())?.timeseries?.result || []
    if (!results.length) return response.status(404).json({ error: 'Financial data is unavailable for this symbol' })
    const series = name => {
      const rows = results.find(item => item.meta?.type?.[0] === name)?.[name] || []
      return rows.map(row => row.reportedValue?.raw ?? null).filter(value => value !== null)
    }
    const latest = name => series(name).at(-1) ?? null
    const previous = name => series(name).at(-2) ?? null
    const annual = name => latest(`annual${name}`)
    const growth = name => { const current = annual(name); const prior = previous(name); return current !== null && prior ? current / prior - 1 : null }
    const revenue = annual('TotalRevenue')
    const grossProfit = annual('GrossProfit')
    const pretaxIncome = annual('PretaxIncome')
    const netIncome = annual('NetIncome')
    const equity = annual('StockholdersEquity')
    const assets = annual('TotalAssets')
    const operatingIncome = annual('OperatingIncome')
    const currentPrice = Number((await chartResponse.json())?.chart?.result?.[0]?.meta?.regularMarketPrice)
    const eps = annual('DilutedEPS')
    const shares = annual('DilutedAverageShares')
    const dividendsPaid = annual('CashDividendsPaid')
    const dividendPerShare = shares && dividendsPaid ? Math.abs(dividendsPaid) / shares : null
    const marketCap = currentPrice && shares ? currentPrice * shares : null

    response.setHeader('Cache-Control', 'public, max-age=900')
    return response.json({
      symbol, updatedAt: new Date().toISOString(), currency: 'INR',
      valuation: { marketCap, pe: currentPrice && eps ? currentPrice / eps : null, forwardPe: null, priceToBook: equity && shares && currentPrice ? currentPrice * shares / equity : null, dividendYield: currentPrice && dividendPerShare ? dividendPerShare / currentPrice : null, shares, dividendPerShare },
      performance: { revenue, grossProfit, operatingIncome, pretaxIncome, revenueGrowth: growth('TotalRevenue'), earningsGrowth: growth('NetIncome'), profitMargin: revenue ? netIncome / revenue : null, grossMargin: revenue ? grossProfit / revenue : null, operatingMargin: revenue ? operatingIncome / revenue : null, returnOnEquity: equity ? netIncome / equity : null, returnOnAssets: assets ? netIncome / assets : null, eps },
      balanceSheet: { totalCash: null, totalDebt: annual('TotalDebt'), debtToEquity: equity ? annual('TotalDebt') / equity * 100 : null, currentRatio: null, freeCashFlow: annual('FreeCashFlow'), operatingCashFlow: annual('OperatingCashFlow'), equity, assets },
      latestYear: { netIncome, totalAssets: assets, totalLiabilities: annual('TotalLiabilitiesNetMinorityInterest'), totalEquity: equity }
    })
  } catch (error) {
    console.error(`Error fetching financials for ${symbol}:`, error.message)
    return response.status(502).json({ error: 'Unable to reach Yahoo Finance financials' })
  }
}
