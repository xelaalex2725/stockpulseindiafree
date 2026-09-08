// Technical Analysis Engine
// Calculates all required indicators and detects patterns

export const calculateEMA = (data, period) => {
  if (data.length < period) return data
  const k = 2 / (period + 1)
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period
  const result = [ema]
  
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k)
    result.push(ema)
  }
  return result
}

export const calculateSMA = (data, period) => {
  const result = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue
    const slice = data.slice(i - period + 1, i + 1)
    result.push(slice.reduce((a, b) => a + b, 0) / period)
  }
  return result
}

export const calculateRSI = (data, period = 14) => {
  if (data.length < period + 1) return []
  
  const changes = []
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1])
  }
  
  let gains = 0, losses = 0
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) gains += changes[i]
    else losses += Math.abs(changes[i])
  }
  
  let avgGain = gains / period
  let avgLoss = losses / period
  const rsi = [100 - (100 / (1 + avgGain / avgLoss))]
  
  for (let i = period; i < changes.length; i++) {
    if (changes[i] > 0) gains = changes[i]
    else {
      gains = 0
      losses = Math.abs(changes[i])
    }
    
    avgGain = (avgGain * (period - 1) + gains) / period
    avgLoss = (avgLoss * (period - 1) + losses) / period
    rsi.push(100 - (100 / (1 + avgGain / avgLoss)))
  }
  
  return rsi
}

export const calculateMACD = (data, fast = 12, slow = 26, signal = 9) => {
  const fastEMA = calculateEMA(data, fast)
  const slowEMA = calculateEMA(data, slow)
  
  const macdLine = []
  const startIdx = Math.max(fastEMA.length, slowEMA.length) - Math.min(fastEMA.length, slowEMA.length)
  
  for (let i = startIdx; i < data.length; i++) {
    macdLine.push(fastEMA[i - (data.length - fastEMA.length)] - slowEMA[i - (data.length - slowEMA.length)])
  }
  
  const signalLine = calculateEMA(macdLine, signal)
  const histogram = macdLine.map((m, i) => m - (signalLine[i] || signalLine[signalLine.length - 1]))
  
  return { macd: macdLine, signal: signalLine, histogram }
}

export const calculateADX = (high, low, close, period = 14) => {
  const tr = []
  for (let i = 1; i < close.length; i++) {
    const hl = high[i] - low[i]
    const hc = Math.abs(high[i] - close[i - 1])
    const lc = Math.abs(low[i] - close[i - 1])
    tr.push(Math.max(hl, hc, lc))
  }
  
  const plusDM = []
  const minusDM = []
  for (let i = 1; i < high.length; i++) {
    const upMove = high[i] - high[i - 1]
    const downMove = low[i - 1] - low[i]
    plusDM.push(upMove > 0 && upMove > downMove ? upMove : 0)
    minusDM.push(downMove > 0 && downMove > upMove ? downMove : 0)
  }
  
  const atr = calculateSMA(tr, period)
  const plusDI = []
  const minusDI = []
  
  for (let i = 0; i < atr.length; i++) {
    plusDI.push((calculateSMA(plusDM, period)[i] || 0) / atr[i] * 100)
    minusDI.push((calculateSMA(minusDM, period)[i] || 0) / atr[i] * 100)
  }
  
  const dx = []
  for (let i = 0; i < plusDI.length; i++) {
    const diSum = plusDI[i] + minusDI[i]
    dx.push(diSum > 0 ? Math.abs(plusDI[i] - minusDI[i]) / diSum * 100 : 0)
  }
  
  const adx = calculateSMA(dx, period)
  return { adx, plusDI, minusDI, atr, dx }
}

export const calculateATR = (high, low, close, period = 14) => {
  const tr = []
  for (let i = 1; i < close.length; i++) {
    const hl = high[i] - low[i]
    const hc = Math.abs(high[i] - close[i - 1])
    const lc = Math.abs(low[i] - close[i - 1])
    tr.push(Math.max(hl, hc, lc))
  }
  return calculateSMA(tr, period)
}

export const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
  const sma = calculateSMA(data, period)
  const bands = { upper: [], middle: sma, lower: [] }
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / period
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period
    const std = Math.sqrt(variance)
    
    bands.upper.push(mean + stdDev * std)
    bands.lower.push(mean - stdDev * std)
  }
  
  return bands
}

export const calculateVWAP = (high, low, close, volume) => {
  const vwap = []
  let cumulativeTP_V = 0
  let cumulativeV = 0
  
  for (let i = 0; i < close.length; i++) {
    const tp = (high[i] + low[i] + close[i]) / 3
    cumulativeTP_V += tp * volume[i]
    cumulativeV += volume[i]
    vwap.push(cumulativeV > 0 ? cumulativeTP_V / cumulativeV : close[i])
  }
  
  return vwap
}

export const calculateSupertrend = (high, low, close, period = 10, multiplier = 3) => {
  const atr = calculateATR(high, low, close, period)
  const hl2 = high.map((h, i) => (h + low[i]) / 2)
  const basicUpperBand = hl2.map((h, i) => h + atr[i] * multiplier)
  const basicLowerBand = hl2.map((h, i) => h - atr[i] * multiplier)
  
  const finalUpperBand = [basicUpperBand[0]]
  const finalLowerBand = [basicLowerBand[0]]
  
  for (let i = 1; i < close.length; i++) {
    finalUpperBand.push(basicUpperBand[i] < finalUpperBand[i - 1] || close[i - 1] > finalUpperBand[i - 1] ? basicUpperBand[i] : finalUpperBand[i - 1])
    finalLowerBand.push(basicLowerBand[i] > finalLowerBand[i - 1] || close[i - 1] < finalLowerBand[i - 1] ? basicLowerBand[i] : finalLowerBand[i - 1])
  }
  
  return { upper: finalUpperBand, lower: finalLowerBand }
}

export const detectChartPattern = (high, low, close, volume) => {
  const len = close.length
  if (len < 10) return null
  
  const patterns = []
  
  // Detect swing highs and lows
  const swingHighs = []
  const swingLows = []
  
  for (let i = 2; i < len - 2; i++) {
    if (high[i] > high[i - 1] && high[i] > high[i - 2] && high[i] > high[i + 1] && high[i] > high[i + 2]) {
      swingHighs.push({ idx: i, val: high[i] })
    }
    if (low[i] < low[i - 1] && low[i] < low[i - 2] && low[i] < low[i + 1] && low[i] < low[i + 2]) {
      swingLows.push({ idx: i, val: low[i] })
    }
  }
  
  // Ascending Triangle
  if (swingHighs.length >= 2 && swingLows.length >= 3) {
    const recentHighs = swingHighs.slice(-2)
    const recentLows = swingLows.slice(-3)
    const highdiff = Math.abs(recentHighs[1].val - recentHighs[0].val)
    const lowdiff = recentLows[1].val - recentLows[0].val
    
    if (highdiff < highdiff * 0.02 && lowdiff > 0) {
      patterns.push({
        type: 'Ascending Triangle',
        direction: 'Bullish',
        confidence: 0.7,
        breakoutLevel: recentHighs[0].val
      })
    }
  }
  
  // Double Bottom
  if (swingLows.length >= 2) {
    const last2Lows = swingLows.slice(-2)
    const lowdiff = Math.abs(last2Lows[1].val - last2Lows[0].val)
    if (lowdiff < last2Lows[0].val * 0.02) {
      patterns.push({
        type: 'Double Bottom',
        direction: 'Bullish',
        confidence: 0.75,
        breakoutLevel: Math.max(...high.slice(-20))
      })
    }
  }
  
  // Double Top
  if (swingHighs.length >= 2) {
    const last2Highs = swingHighs.slice(-2)
    const highdiff = Math.abs(last2Highs[1].val - last2Highs[0].val)
    if (highdiff < last2Highs[0].val * 0.02) {
      patterns.push({
        type: 'Double Top',
        direction: 'Bearish',
        confidence: 0.75,
        breakoutLevel: Math.min(...low.slice(-20))
      })
    }
  }
  
  // Rising Wedge
  if (swingHighs.length >= 3 && swingLows.length >= 3) {
    const recentHighs = swingHighs.slice(-3)
    const recentLows = swingLows.slice(-3)
    const highSlope = (recentHighs[2].val - recentHighs[0].val) / 2
    const lowSlope = (recentLows[2].val - recentLows[0].val) / 2
    
    if (highSlope > 0 && lowSlope > 0 && highSlope > lowSlope) {
      patterns.push({
        type: 'Rising Wedge',
        direction: 'Bearish',
        confidence: 0.65,
        breakoutLevel: recentLows[recentLows.length - 1].val
      })
    }
  }
  
  // Bullish Flag
  if (len >= 20) {
    const recent = close.slice(-20)
    const isUptrend = recent[recent.length - 1] > recent[0]
    const flagRange = Math.max(...recent) - Math.min(...recent)
    const avgRange = flagRange / recent.length
    
    if (isUptrend && avgRange < flagRange * 0.05) {
      patterns.push({
        type: 'Bullish Flag',
        direction: 'Bullish',
        confidence: 0.72,
        breakoutLevel: Math.max(...recent) + flagRange
      })
    }
  }
  
  return patterns.length > 0 ? patterns[0] : null
}

export const calculateMarketStructure = (high, low, close) => {
  const len = close.length
  if (len < 10) return { structure: 'Unknown', trend: 'Neutral' }
  
  const recent = close.slice(-20)
  const highs = high.slice(-20)
  const lows = low.slice(-20)
  
  let hhCount = 0, hlCount = 0, lhCount = 0, llCount = 0
  
  for (let i = 1; i < recent.length; i++) {
    if (highs[i] > highs[i - 1]) hhCount++
    if (lows[i] > lows[i - 1]) hlCount++
    if (highs[i] < highs[i - 1]) lhCount++
    if (lows[i] < lows[i - 1]) llCount++
  }
  
  const bullish = hhCount + hlCount > lhCount + llCount
  const bearish = lhCount + llCount > hhCount + hlCount
  
  return {
    structure: bullish ? 'Higher Highs + Higher Lows' : bearish ? 'Lower Highs + Lower Lows' : 'Mixed',
    trend: bullish ? 'Uptrend' : bearish ? 'Downtrend' : 'Sideways',
    hh: hhCount,
    hl: hlCount,
    lh: lhCount,
    ll: llCount
  }
}

export const calculateSuportResistance = (high, low, close, period = 20) => {
  const recent = close.slice(-period)
  const recentHigh = high.slice(-period)
  const recentLow = low.slice(-period)
  
  const resistance = Math.max(...recentHigh)
  const support = Math.min(...recentLow)
  const pivot = (resistance + support + close[close.length - 1]) / 3
  
  return { support, resistance, pivot }
}

export const calculateVolumAnalysis = (volume, close) => {
  const len = volume.length
  if (len < 20) return { rvol: 1, trendVolume: 'Normal', avgVolume: 0, currentVolume: 0 }
  
  const avgVolume = volume.slice(-20).reduce((a, b) => a + b, 0) / 20
  const currentVolume = volume[len - 1]
  const rvol = currentVolume / avgVolume
  
  let trendVolume = 'Normal'
  if (rvol < 0.75) trendVolume = 'Very Weak'
  else if (rvol < 1.0) trendVolume = 'Weak'
  else if (rvol < 1.5) trendVolume = 'Normal'
  else if (rvol < 2.0) trendVolume = 'Strong'
  else trendVolume = 'Very Strong'
  
  return { rvol, trendVolume, avgVolume, currentVolume }
}

export const scoreSetup = (stock) => {
  let score = 0
  const breakdown = {}
  
  // Pattern Recognition (20 points)
  if (stock.pattern) {
    breakdown.pattern = stock.pattern.confidence * 20
    score += breakdown.pattern
  } else {
    breakdown.pattern = 0
  }
  
  // Volume (15 points)
  const volumeScore = Math.min((stock.volumeAnalysis?.rvol || 1) / 2 * 15, 15)
  breakdown.volume = volumeScore
  score += volumeScore
  
  // Trend (15 points)
  if (stock.marketStructure?.trend === 'Uptrend') {
    breakdown.trend = 15
  } else if (stock.marketStructure?.trend === 'Downtrend') {
    breakdown.trend = 7
  } else {
    breakdown.trend = 8
  }
  score += breakdown.trend
  
  // Momentum RSI (10 points)
  const rsi = stock.rsi || 50
  if (rsi > 55 && rsi < 70) {
    breakdown.momentum = 10
  } else if (rsi > 45 && rsi < 55) {
    breakdown.momentum = 5
  } else if (rsi < 45) {
    breakdown.momentum = 2
  } else {
    breakdown.momentum = 7
  }
  score += breakdown.momentum
  
  // VWAP (10 points)
  const priceAboveVWAP = (stock.currentPrice || 0) > (stock.vwap || 0)
  breakdown.vwap = priceAboveVWAP ? 10 : 3
  score += breakdown.vwap
  
  // Market/Sector (10 points)
  breakdown.market = 7
  score += breakdown.market
  
  // News Sentiment (10 points)
  breakdown.news = 5
  score += breakdown.news
  
  // Risk/Reward (10 points)
  breakdown.riskReward = 6
  score += breakdown.riskReward
  
  return {
    technicalScore: Math.round(Math.min(Math.max(score, 0), 100)),
    breakdown
  }
}
