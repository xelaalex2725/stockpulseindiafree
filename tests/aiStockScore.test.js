import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateAiStockScore } from '../lib/aiStockScore.js'

const stock = {
  currentPrice: 90,
  high52: 100,
  low52: 50,
  change: 1,
  rsi: 62,
  macd: 2,
  signal: 1,
  macdHistogram: 1,
  ema20: 88,
  ema50: 85,
  ema200: 80,
  technicalScore: 90,
  marketStructure: { trend: 'Uptrend' },
  volumeAnalysis: { rvol: 1.5 }
}

const strongFinancials = {
  performance: {
    revenueGrowth: 0.2,
    earningsGrowth: 0.25,
    profitMargin: 0.2,
    returnOnEquity: 0.2,
    returnOnCapital: 0.22
  },
  balanceSheet: { debtToEquity: 10, freeCashFlow: 100 },
  valuation: { pe: 12, priceToBook: 2 },
  annualTrends: [
    { year: '2022-03-31', revenue: 100, netProfit: 10, eps: 2 },
    { year: '2023-03-31', revenue: 120, netProfit: 12, eps: 2.5 },
    { year: '2024-03-31', revenue: 150, netProfit: 15, eps: 3 }
  ]
}

test('returns six factor scores and BUY for strong covered fundamentals', () => {
  const score = calculateAiStockScore(stock, strongFinancials)

  assert.deepEqual(
    ['durability', 'valuation', 'momentum', 'growth', 'quality', 'technical']
      .map(factor => Number.isFinite(score[factor])),
    [true, true, true, true, true, true]
  )
  assert.equal(score.recommendation, 'BUY')
  assert.equal(score.coverage, 'Good')
  assert.equal(score.isStrongPerformer, true)
})

test('does not issue a recommendation without fundamental evidence', () => {
  const score = calculateAiStockScore({ ...stock, technicalScore: 100 }, null)

  assert.equal(score.durability, 50)
  assert.equal(score.growth, 50)
  assert.equal(score.quality, 50)
  assert.equal(score.recommendation, 'INSUFFICIENT DATA')
})

test('treats null financial metrics as missing, not zero', () => {
  const score = calculateAiStockScore(stock, {
    performance: { revenueGrowth: null, earningsGrowth: null, profitMargin: null },
    balanceSheet: { debtToEquity: null, freeCashFlow: null }
  })

  assert.equal(score.recommendation, 'INSUFFICIENT DATA')
  assert.equal(score.durability, 50)
  assert.equal(score.growth, 50)
  assert.equal(score.quality, 50)
})

test('uses multi-year revenue and profit growth in durability and growth scores', () => {
  const slowGrowth = calculateAiStockScore(stock, {
    ...strongFinancials,
    annualTrends: [
      { year: '2022-03-31', revenue: 100, netProfit: 10, eps: 2 },
      { year: '2023-03-31', revenue: 105, netProfit: 10.5, eps: 2.1 },
      { year: '2024-03-31', revenue: 110, netProfit: 11, eps: 2.2 }
    ]
  })
  const fastGrowth = calculateAiStockScore(stock, strongFinancials)

  assert.ok(fastGrowth.growth > slowGrowth.growth)
  assert.ok(fastGrowth.durability > slowGrowth.durability)
})