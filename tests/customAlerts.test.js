import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateAlertRules, initializeAlertRule } from '../lib/customAlerts.js'

const now = Date.parse('2025-03-01T12:00:00.000Z')
const stock = {
  s: 'RELIANCE',
  n: 'Reliance Industries',
  symbol: 'RELIANCE.NS',
  currentPrice: 99,
  change: 0.5,
  previousHistoricalHigh: 105,
  high52: 100,
  rsi: 65,
  macd: 1,
  signal: 2,
  technicalScore: 70,
  ema20: 50,
  ema50: 51,
  ema200: 45,
  dma20: 49,
  dma50: 50,
  volumeAnalysis: { rvol: 1.2 },
  dvm: { score: 70 }
}

const makeRule = (type, options = {}, baselineStock = stock) => initializeAlertRule({
  id: type,
  symbol: stock.symbol,
  type,
  enabled: true,
  createdAt: '2025-03-01T11:00:00.000Z',
  threshold: 1,
  ...options
}, baselineStock)

const trigger = (rule, nextStock, articles = [], nowAt = now) => evaluateAlertRules([rule], [nextStock], articles, [], nowAt)

test('price and daily-movement alerts fire only after crossing their levels', () => {
  const priceRule = makeRule('price', { threshold: 100, direction: 'above' })
  const priceResult = trigger(priceRule, { ...stock, currentPrice: 101 })
  assert.match(priceResult.events[0].message, /crossed ₹100\.00/)
  assert.equal(priceResult.rules[0].enabled, false)

  const movementRule = makeRule('movement', { threshold: 2, direction: 'down' })
  const movementResult = trigger(movementRule, { ...stock, change: -2.5 })
  assert.match(movementResult.events[0].message, /down 2\.50%/)
})

test('breakout and 52-week-high alerts use saved price baselines', () => {
  const breakout = trigger(makeRule('breakout'), { ...stock, currentPrice: 106 })
  assert.match(breakout.events[0].title, /breakout/)

  const high = trigger(makeRule('high52'), { ...stock, currentPrice: 101, high52: 101 })
  assert.match(high.events[0].title, /52-week high/)
})

test('RSI, MACD, volume, and moving-average rules trigger on crossings', () => {
  const rsi = trigger(makeRule('rsi', { threshold: 70, direction: 'above' }), { ...stock, rsi: 72 })
  assert.match(rsi.events[0].message, /RSI crossed above 70/)

  const macd = trigger(makeRule('macd', { direction: 'bullish' }), { ...stock, macd: 3, signal: 2 })
  assert.match(macd.events[0].message, /bullish MACD crossover/)

  const volume = trigger(makeRule('volume', { threshold: 2 }), { ...stock, volumeAnalysis: { rvol: 2.4 } })
  assert.match(volume.events[0].message, /2\.40×/)

  const movingAverage = trigger(makeRule('maCross', { fastKey: 'ema20', slowKey: 'ema50', fastLabel: 'EMA 20', slowLabel: 'EMA 50', direction: 'bullish' }), { ...stock, ema20: 52 })
  assert.match(movingAverage.events[0].message, /EMA 20 crossed above EMA 50/)
})

test('DVM, news, and earnings rules create deduplicated notifications', () => {
  const dvm = trigger(makeRule('dvm', { threshold: 5, direction: 'up' }), { ...stock, dvm: { score: 76 } })
  assert.match(dvm.events[0].message, /up 6 points/)

  const news = [{ title: 'Reliance expands operations', description: '', link: 'news-1', publishedAt: '2025-03-01T11:30:00.000Z' }]
  const newsResult = trigger(makeRule('news'), stock, news)
  assert.equal(newsResult.events[0].link, 'news-1')
  assert.equal(newsResult.rules[0].enabled, false)

  const earnings = [{ title: 'Reliance quarterly results announced', description: '', link: 'results-1', publishedAt: '2025-03-01T11:30:00.000Z' }]
  const earningsResult = trigger(makeRule('earnings'), stock, earnings)
  assert.match(earningsResult.events[0].title, /earnings announcement/)
})

test('alerts do not fire when a level was already crossed before the observation', () => {
  const rule = makeRule('price', { threshold: 100, direction: 'above' }, { ...stock, currentPrice: 101 })
  const result = trigger(rule, { ...stock, currentPrice: 102 })
  assert.equal(result.events.length, 0)
})