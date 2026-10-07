const hasNumber = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
const asNumber = value => hasNumber(value) ? Number(value) : null

export const ALERT_TYPES = [
  ['price', 'Price'],
  ['movement', '% movement'],
  ['breakout', 'Breakout'],
  ['rsi', 'RSI'],
  ['macd', 'MACD crossover'],
  ['volume', 'Volume spike'],
  ['high52', '52-week high'],
  ['maCross', 'Moving-average crossover'],
  ['earnings', 'Earnings announcement'],
  ['news', 'News'],
  ['dvm', 'DVM score change']
]

const fieldValue = (stock, field) => asNumber(stock?.[field])

const averagePair = rule => [rule.fastKey, rule.slowKey]

const getMovingAverageDiff = (stock, rule) => {
  const [fastKey, slowKey] = averagePair(rule)
  const fast = fieldValue(stock, fastKey)
  const slow = fieldValue(stock, slowKey)
  return fast === null || slow === null ? null : fast - slow
}

const relatedToStock = (article, stock) => {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase()
  const terms = [stock.s, stock.symbol?.replace(/\.(NS|BO)$/i, ''), stock.n]
    .map(value => String(value || '').trim().toLowerCase())
    .filter(value => value.length >= 4)
  return terms.some(term => text.includes(term))
}

const eventArticles = (rule, stock, newsArticles, marketAlerts, now) => {
  const earningsPattern = /earnings|financial results|quarterly results|annual results|audited results|results announcement/i
  return [...newsArticles, ...marketAlerts]
    .filter(article => relatedToStock(article, stock))
    .filter(article => rule.type !== 'earnings' || earningsPattern.test(`${article.title || ''} ${article.description || ''}`))
    .map(article => ({ ...article, key: article.link || `${article.title}|${article.publishedAt || ''}` }))
    .filter(article => article.key !== rule.lastEventKey)
    .filter(article => {
      const publishedAt = Date.parse(article.publishedAt || '')
      return Number.isFinite(publishedAt) && publishedAt > Date.parse(rule.createdAt || '') && publishedAt <= now
    })
    .sort((first, second) => Date.parse(first.publishedAt) - Date.parse(second.publishedAt))
}

const makeEvent = (rule, stock, title, message, now, link = null) => ({
  id: `custom-alert-${rule.id}-${now}-${Math.random().toString(36).slice(2, 7)}`,
  type: 'custom-alert',
  title,
  message,
  stock,
  link,
  createdAt: new Date(now).toISOString(),
  alertRuleId: rule.id
})

const triggerCrossing = (previous, current, threshold, direction) => {
  if (previous === null || current === null) return false
  return direction === 'below'
    ? previous > threshold && current <= threshold
    : previous < threshold && current >= threshold
}

const observeRule = (rule, stock, newsArticles, marketAlerts, now) => {
  const threshold = Number(rule.threshold)
  const currentPrice = fieldValue(stock, 'currentPrice')
  const ruleType = rule.type
  let nextRule = { ...rule }
  let event = null

  if (ruleType === 'news' || ruleType === 'earnings') {
    const article = eventArticles(rule, stock, newsArticles, marketAlerts, now)[0]
    if (article) {
      nextRule.lastEventKey = article.key
      event = makeEvent(rule, stock, ruleType === 'earnings' ? `${stock.s} earnings announcement` : `${stock.s} news alert`, article.title, now, article.link)
    }
  } else if (ruleType === 'price') {
    const previous = asNumber(rule.lastValue)
    if (triggerCrossing(previous, currentPrice, threshold, rule.direction)) {
      const movement = rule.direction === 'below' ? 'fell below' : 'crossed'
      event = makeEvent(rule, stock, `${stock.s} price alert`, `${stock.s} ${movement} ₹${threshold.toFixed(2)} (now ₹${currentPrice.toFixed(2)})`, now)
    }
    nextRule.lastValue = currentPrice
  } else if (ruleType === 'movement') {
    const current = fieldValue(stock, 'change')
    const previous = asNumber(rule.lastValue)
    const level = rule.direction === 'down' ? -Math.abs(threshold) : Math.abs(threshold)
    const crossed = rule.direction === 'down'
      ? previous !== null && previous > level && current !== null && current <= level
      : previous !== null && previous < level && current !== null && current >= level
    if (crossed) event = makeEvent(rule, stock, `${stock.s} movement alert`, `${stock.s} is ${current >= 0 ? 'up' : 'down'} ${Math.abs(current).toFixed(2)}% today`, now)
    nextRule.lastValue = current
  } else if (ruleType === 'breakout') {
    const level = fieldValue(stock, 'previousHistoricalHigh')
    const previous = asNumber(rule.lastValue)
    if (level !== null && currentPrice !== null && previous !== null && previous <= level && currentPrice > level) {
      event = makeEvent(rule, stock, `${stock.s} breakout`, `${stock.s} broke above its previous 5-year high of ₹${level.toFixed(2)}`, now)
    }
    nextRule.lastValue = currentPrice
  } else if (ruleType === 'rsi') {
    const current = fieldValue(stock, 'rsi')
    const previous = asNumber(rule.lastValue)
    if (triggerCrossing(previous, current, threshold, rule.direction)) {
      event = makeEvent(rule, stock, `${stock.s} RSI alert`, `RSI crossed ${rule.direction} ${threshold} (now ${current.toFixed(1)})`, now)
    }
    nextRule.lastValue = current
  } else if (ruleType === 'macd') {
    const currentDiff = fieldValue(stock, 'macd') !== null && fieldValue(stock, 'signal') !== null
      ? fieldValue(stock, 'macd') - fieldValue(stock, 'signal')
      : null
    const previousDiff = asNumber(rule.lastDiff)
    const crossedUp = previousDiff !== null && currentDiff !== null && previousDiff <= 0 && currentDiff > 0
    const crossedDown = previousDiff !== null && currentDiff !== null && previousDiff >= 0 && currentDiff < 0
    const crossed = rule.direction === 'bearish' ? crossedDown : rule.direction === 'bullish' ? crossedUp : crossedUp || crossedDown
    if (crossed) event = makeEvent(rule, stock, `${stock.s} MACD crossover`, `${stock.s} had a ${crossedUp ? 'bullish' : 'bearish'} MACD crossover`, now)
    nextRule.lastDiff = currentDiff
  } else if (ruleType === 'volume') {
    const current = asNumber(stock.volumeAnalysis?.rvol)
    const previous = asNumber(rule.lastValue)
    if (previous !== null && current !== null && previous < threshold && current >= threshold) {
      event = makeEvent(rule, stock, `${stock.s} volume spike`, `Relative volume reached ${current.toFixed(2)}× (alert threshold ${threshold.toFixed(2)}×)`, now)
    }
    nextRule.lastValue = current
  } else if (ruleType === 'high52') {
    const priorHigh = asNumber(rule.referenceHigh)
    if (priorHigh !== null && currentPrice !== null && currentPrice > priorHigh) {
      event = makeEvent(rule, stock, `${stock.s} new 52-week high`, `${stock.s} traded above its alert baseline of ₹${priorHigh.toFixed(2)}`, now)
      nextRule.referenceHigh = Math.max(priorHigh, currentPrice, asNumber(stock.high52) || priorHigh)
    } else if (priorHigh === null && hasNumber(stock.high52)) {
      nextRule.referenceHigh = Number(stock.high52)
    }
    nextRule.lastValue = currentPrice
  } else if (ruleType === 'maCross') {
    const currentDiff = getMovingAverageDiff(stock, rule)
    const previousDiff = asNumber(rule.lastDiff)
    const crossedUp = previousDiff !== null && currentDiff !== null && previousDiff <= 0 && currentDiff > 0
    const crossedDown = previousDiff !== null && currentDiff !== null && previousDiff >= 0 && currentDiff < 0
    const crossed = rule.direction === 'bearish' ? crossedDown : rule.direction === 'bullish' ? crossedUp : crossedUp || crossedDown
    if (crossed) event = makeEvent(rule, stock, `${stock.s} moving-average crossover`, `${rule.fastLabel} crossed ${crossedUp ? 'above' : 'below'} ${rule.slowLabel}`, now)
    nextRule.lastDiff = currentDiff
  } else if (ruleType === 'dvm') {
    const current = fieldValue(stock.dvm, 'score')
    const previous = asNumber(rule.lastValue)
    const delta = previous !== null && current !== null ? current - previous : 0
    const movedEnough = Math.abs(delta) >= threshold
    const directionMatches = rule.direction === 'up' ? delta > 0 : rule.direction === 'down' ? delta < 0 : delta !== 0
    if (movedEnough && directionMatches) {
      event = makeEvent(rule, stock, `${stock.s} DVM score changed`, `DVM moved ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} points to ${current}/100`, now)
    }
    nextRule.lastValue = current
  }

  if (event) {
    nextRule.enabled = false
    nextRule.lastTriggeredAt = new Date(now).toISOString()
  }

  return { rule: nextRule, event }
}

export const initializeAlertRule = (rule, stock) => {
  if (!stock) return rule
  if (rule.type === 'high52') return { ...rule, referenceHigh: asNumber(stock.high52) }
  if (rule.type === 'macd') {
    const macd = fieldValue(stock, 'macd')
    const signal = fieldValue(stock, 'signal')
    return { ...rule, lastDiff: macd === null || signal === null ? null : macd - signal }
  }
  if (rule.type === 'maCross') return { ...rule, lastDiff: getMovingAverageDiff(stock, rule) }
  if (rule.type === 'breakout') return { ...rule, lastValue: fieldValue(stock, 'currentPrice') }
  if (rule.type === 'volume') return { ...rule, lastValue: asNumber(stock.volumeAnalysis?.rvol) }
  if (rule.type === 'dvm') return { ...rule, lastValue: fieldValue(stock.dvm, 'score') }
  if (rule.type === 'price') return { ...rule, lastValue: fieldValue(stock, 'currentPrice') }
  return { ...rule, lastValue: fieldValue(stock, rule.type === 'movement' ? 'change' : rule.type) }
}

export const evaluateAlertRules = (rules, stocks, newsArticles = [], marketAlerts = [], now = Date.now()) => {
  const events = []
  const nextRules = rules.map(rule => {
    if (!rule.enabled) return rule
    const stock = stocks.find(item => item.symbol === rule.symbol)
    if (!stock) return rule
    const result = observeRule(rule, stock, newsArticles, marketAlerts, now)
    if (result.event) events.push(result.event)
    return result.rule
  })
  return { rules: nextRules, events }
}