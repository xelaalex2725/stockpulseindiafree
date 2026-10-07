export const FINANCIAL_TYPES = [
  'annualTotalRevenue',
  'annualGrossProfit',
  'annualOperatingIncome',
  'annualNetIncome',
  'annualPretaxIncome',
  'annualDilutedEPS',
  'annualDilutedAverageShares',
  'annualCashDividendsPaid',
  'annualTotalAssets',
  'annualTotalLiabilitiesNetMinorityInterest',
  'annualTotalDebt',
  'annualStockholdersEquity',
  'annualOperatingCashFlow',
  'annualFreeCashFlow'
]

const ratio = (numerator, denominator) => Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0
  ? numerator / denominator
  : null

export const buildFinancials = (symbol, results, currentPrice) => {
  const seriesByType = new Map(results.map(result => [
    result.meta?.type?.[0],
    (result[result.meta?.type?.[0]] || [])
      .filter(row => row.asOfDate)
      .map(row => ({ year: row.asOfDate, value: Number.isFinite(row.reportedValue?.raw) ? row.reportedValue.raw : null }))
      .sort((first, second) => first.year.localeCompare(second.year))
  ]))
  const rows = name => seriesByType.get(`annual${name}`) || []
  const latest = name => rows(name).at(-1)?.value ?? null
  const previous = name => rows(name).at(-2)?.value ?? null
  const annual = name => latest(name)
  const growth = name => {
    const current = latest(name)
    const prior = previous(name)
    return current !== null && prior !== null && prior !== 0 ? current / prior - 1 : null
  }
  const years = [...new Set([...seriesByType.values()].flatMap(values => values.map(item => item.year)))].sort().slice(-10)
  const valueAt = (name, year) => rows(name).find(item => item.year === year)?.value ?? null
  const revenue = annual('TotalRevenue')
  const grossProfit = annual('GrossProfit')
  const pretaxIncome = annual('PretaxIncome')
  const netIncome = annual('NetIncome')
  const equity = annual('StockholdersEquity')
  const assets = annual('TotalAssets')
  const debt = annual('TotalDebt')
  const operatingIncome = annual('OperatingIncome')
  const eps = annual('DilutedEPS')
  const shares = annual('DilutedAverageShares')
  const dividendsPaid = annual('CashDividendsPaid')
  const validPrice = Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : null
  const dividendPerShare = shares && dividendsPaid ? Math.abs(dividendsPaid) / shares : null
  const marketCap = validPrice && shares ? validPrice * shares : null
  const pe = validPrice && eps ? validPrice / eps : null
  const priceToBook = equity && shares && validPrice ? validPrice * shares / equity : null
  const dividendYield = validPrice && dividendPerShare ? dividendPerShare / validPrice : null
  const epsRows = rows('DilutedEPS').filter(item => item.value !== null && item.value > 0)
  const firstEps = epsRows[0]
  const lastEps = epsRows.at(-1)
  const elapsedYears = firstEps && lastEps ? Number(lastEps.year.slice(0, 4)) - Number(firstEps.year.slice(0, 4)) : 0
  const epsCagr = elapsedYears > 0 ? (lastEps.value / firstEps.value) ** (1 / elapsedYears) - 1 : null
  const peg = pe > 0 && epsCagr > 0 ? pe / (epsCagr * 100) : null
  const returnOnEquity = ratio(netIncome, equity)
  const returnOnCapital = ratio(operatingIncome, equity !== null && debt !== null ? equity + debt : null)
  const annualTrends = years.map(year => {
    const yearNetIncome = valueAt('NetIncome', year)
    const yearEquity = valueAt('StockholdersEquity', year)
    const yearDebt = valueAt('TotalDebt', year)
    return {
      year,
      revenue: valueAt('TotalRevenue', year),
      ebitda: null,
      operatingProfit: valueAt('OperatingIncome', year),
      netProfit: yearNetIncome,
      eps: valueAt('DilutedEPS', year),
      returnOnEquity: ratio(yearNetIncome, yearEquity),
      debtToEquity: ratio(yearDebt, yearEquity),
      freeCashFlow: valueAt('FreeCashFlow', year)
    }
  })

  return {
    symbol,
    updatedAt: new Date().toISOString(),
    currency: 'INR',
    valuation: {
      marketCap,
      pe,
      forwardPe: null,
      priceToBook,
      enterpriseValueToEbitda: null,
      peg,
      dividendYield,
      shares,
      dividendPerShare
    },
    performance: {
      revenue,
      ebitda: null,
      grossProfit,
      operatingIncome,
      pretaxIncome,
      netIncome,
      revenueGrowth: growth('TotalRevenue'),
      earningsGrowth: growth('NetIncome'),
      profitMargin: ratio(netIncome, revenue),
      grossMargin: ratio(grossProfit, revenue),
      operatingMargin: ratio(operatingIncome, revenue),
      returnOnEquity,
      returnOnCapital,
      returnOnAssets: ratio(netIncome, assets),
      eps
    },
    balanceSheet: {
      totalCash: null,
      totalDebt: debt,
      debtToEquity: ratio(debt, equity) === null ? null : ratio(debt, equity) * 100,
      interestCoverage: null,
      currentRatio: null,
      freeCashFlow: annual('FreeCashFlow'),
      operatingCashFlow: annual('OperatingCashFlow'),
      equity,
      assets
    },
    ownership: { promoterHolding: null, promoterPledging: null },
    annualTrends,
    latestYear: {
      year: annualTrends.at(-1)?.year || null,
      netIncome,
      totalAssets: assets,
      totalLiabilities: annual('TotalLiabilitiesNetMinorityInterest'),
      totalEquity: equity
    }
  }
}