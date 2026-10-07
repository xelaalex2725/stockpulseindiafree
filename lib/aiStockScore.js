const clampScore = value => Math.round(Math.min(100, Math.max(0, value)))
const hasValue = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))

const average = (values, fallback = 50) => {
  const available = values.filter(Number.isFinite)
  return available.length ? clampScore(available.reduce((total, value) => total + value, 0) / available.length) : fallback
}

const growthScore = (value, target = 0.12, floor = -0.08) => {
  if (!hasValue(value)) return null
  if (value <= floor) return 20
  if (value >= target) return 80
  return 20 + ((Number(value) - floor) / (target - floor)) * 60
}

const qualityScore = (value, target, floor = 0) => {
  if (!hasValue(value)) return null
  if (value <= floor) return 20
  if (value >= target) return 80
  return 20 + ((Number(value) - floor) / (target - floor)) * 60
}

const balanceSheetScore = value => {
  if (!hasValue(value)) return null
  const debtToEquity = Number(value)
  if (debtToEquity <= 30) return 80
  if (debtToEquity >= 150) return 20
  return 80 - ((debtToEquity - 30) / 120) * 60
}

const annualEpsCagr = trends => {
  const epsValues = (Array.isArray(trends) ? trends : [])
    .filter(period => hasValue(period.eps) && Number(period.eps) > 0)
    .sort((first, second) => first.year.localeCompare(second.year))
  if (epsValues.length < 2) return null
  const first = epsValues[0]
  const last = epsValues.at(-1)
  const elapsedYears = Number(last.year.slice(0, 4)) - Number(first.year.slice(0, 4))
  return elapsedYears > 0 ? (Number(last.eps) / Number(first.eps)) ** (1 / elapsedYears) - 1 : null
}

const annualCagr = (trends, key) => {
  const values = (Array.isArray(trends) ? trends : [])
    .filter(period => hasValue(period[key]) && Number(period[key]) > 0)
    .sort((first, second) => first.year.localeCompare(second.year))
  if (values.length < 2) return null
  const first = values[0]
  const last = values.at(-1)
  const elapsedYears = Number(last.year.slice(0, 4)) - Number(first.year.slice(0, 4))
  return elapsedYears > 0 ? (Number(last[key]) / Number(first[key])) ** (1 / elapsedYears) - 1 : null
}

const consistencyScore = (trends, key, predicate) => {
  const values = (Array.isArray(trends) ? trends : []).map(period => period[key]).filter(hasValue)
  return values.length >= 2
    ? 20 + values.filter(value => predicate(Number(value))).length / values.length * 60
    : null
}

export const calculateAiStockScore = (stock, financials) => {
  const performance = financials?.performance || {}
  const balanceSheet = financials?.balanceSheet || {}
  const valuationData = financials?.valuation || {}
  const annualTrends = financials?.annualTrends || []
  const revenueCagr = annualCagr(annualTrends, 'revenue')
  const netProfitCagr = annualCagr(annualTrends, 'netProfit')
  const financialInputs = [
    performance.revenueGrowth,
    performance.earningsGrowth,
    performance.profitMargin,
    performance.returnOnEquity,
    performance.returnOnCapital,
    balanceSheet.debtToEquity,
    balanceSheet.freeCashFlow,
    valuationData.pe,
    valuationData.priceToBook
  ].filter(hasValue).length

  const debtScore = balanceSheetScore(balanceSheet.debtToEquity)
  const cashFlowScore = hasValue(balanceSheet.freeCashFlow)
    ? Number(balanceSheet.freeCashFlow) > 0 ? 80 : 20
    : null
  const durability = average([
    consistencyScore(annualTrends, 'revenue', value => value > 0),
    consistencyScore(annualTrends, 'netProfit', value => value > 0),
    growthScore(revenueCagr),
    growthScore(netProfitCagr),
    debtScore,
    cashFlowScore
  ])

  const growth = average([
    growthScore(revenueCagr ?? performance.revenueGrowth),
    growthScore(netProfitCagr ?? performance.earningsGrowth),
    growthScore(annualEpsCagr(annualTrends), 0.15, -0.08)
  ])
  const quality = average([
    qualityScore(performance.profitMargin, 0.15),
    qualityScore(performance.returnOnEquity, 0.18),
    qualityScore(performance.returnOnCapital, 0.18),
    debtScore,
    cashFlowScore
  ])

  const pe = hasValue(valuationData.pe) && Number(valuationData.pe) > 0
    ? qualityScore(40 - Number(valuationData.pe), 25, 0)
    : null
  const priceToBook = hasValue(valuationData.priceToBook) && Number(valuationData.priceToBook) > 0
    ? qualityScore(6 - Number(valuationData.priceToBook), 4, 0)
    : null
  const high52 = Number(stock.high52)
  const low52 = Number(stock.low52)
  const currentPrice = Number(stock.currentPrice)
  const range = high52 - low52
  const rangeScore = Number.isFinite(range) && range > 0 && Number.isFinite(currentPrice)
    ? 80 - ((currentPrice - low52) / range) * 45
    : null
  const valuation = average([pe, priceToBook, rangeScore])

  const rsi = hasValue(stock.rsi) ? Number(stock.rsi) : 50
  const rsiScore = rsi >= 55 && rsi <= 70 ? 75 : rsi >= 45 && rsi < 55 ? 55 : rsi > 70 ? 45 : rsi >= 30 ? 35 : 20
  const macdScore = hasValue(stock.macd) && hasValue(stock.signal) ? Number(stock.macd) > Number(stock.signal) ? 75 : 30 : 50
  const histogramScore = hasValue(stock.macdHistogram) ? Number(stock.macdHistogram) > 0 ? 70 : 30 : 50
  const dailyChange = hasValue(stock.change) ? Number(stock.change) : 0
  const changeScore = Math.max(10, Math.min(90, 50 + dailyChange * 5))
  const emaScores = [
    hasValue(stock.currentPrice) && hasValue(stock.ema20) ? Number(stock.currentPrice) > Number(stock.ema20) ? 20 : 0 : 10,
    hasValue(stock.ema20) && hasValue(stock.ema50) ? Number(stock.ema20) > Number(stock.ema50) ? 20 : 0 : 10,
    hasValue(stock.ema50) && hasValue(stock.ema200) ? Number(stock.ema50) > Number(stock.ema200) ? 20 : 0 : 10
  ]
  const trendScore = stock.marketStructure?.trend === 'Uptrend' ? 80 : stock.marketStructure?.trend === 'Downtrend' ? 25 : 50
  const volumeScore = hasValue(stock.volumeAnalysis?.rvol) ? Number(stock.volumeAnalysis.rvol) >= 1 ? 70 : 35 : 50
  const momentum = average([rsiScore, macdScore, histogramScore, changeScore, average(emaScores), trendScore, volumeScore])

  const technical = hasValue(stock.technicalScore) ? clampScore(Number(stock.technicalScore)) : 50
  const score = average([durability, valuation, momentum, growth, quality, technical])
  const hasFundamentalCoverage = financialInputs >= 2 || annualTrends.length >= 2
  const recommendation = !hasFundamentalCoverage
    ? 'INSUFFICIENT DATA'
    : score >= 75
      ? 'BUY'
      : score >= 55
        ? 'HOLD'
        : 'AVOID'
  const coverage = financialInputs >= 6 && annualTrends.length >= 3
    ? 'Good'
    : hasFundamentalCoverage
      ? 'Partial'
      : 'Limited'

  return {
    durability,
    valuation,
    momentum,
    growth,
    quality,
    technical,
    score,
    recommendation,
    coverage,
    isStrongPerformer: recommendation === 'BUY',
    methodology: {
      durability: 'Revenue and profit consistency, debt load, and free cash flow',
      valuation: 'P/E, P/B, and 52-week price position',
      momentum: 'RSI, MACD, price change, EMA alignment, trend, and volume',
      growth: 'Revenue and earnings growth plus reported annual EPS CAGR',
      quality: 'Profit margin, ROE, ROCE, debt load, and free cash flow',
      technical: 'Composite technical setup score'
    }
  }
}