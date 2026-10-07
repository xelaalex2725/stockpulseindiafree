import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchShareholdingHistory } from '../lib/shareholding.js'

const response = payload => ({ ok: true, json: async () => payload })

test('normalizes recent NSE filings into ordered ownership periods', async () => {
  const requests = []
  const fetcher = async url => {
    requests.push(url)
    const parsedUrl = new URL(url)
    if (parsedUrl.pathname.endsWith('corporate-share-holdings-master')) {
      return response([
        { symbol: 'ABC', recordId: 'new', date: '30-JUN-2025', pr_and_prgrp: '41.2', public_val: '58.8' },
        { symbol: 'ABC', recordId: 'old', date: '31-MAR-2025', pr_and_prgrp: '41.7', public_val: '58.3' },
        { symbol: 'OTHER', recordId: 'other', date: '30-JUN-2025', pr_and_prgrp: '20', public_val: '80' }
      ])
    }

    const recordId = parsedUrl.searchParams.get('ndsId')
    if (parsedUrl.searchParams.get('index') === 'summary') {
      return response([{ COL_I: 'A', COL_II: 'Promoter & Promoter Group', COL_XII_B: recordId === 'new' ? '0.4' : '0.6' }])
    }

    return response([
      { category: ' ', COL_I: 'Mutual Funds', COL_VIII: recordId === 'new' ? '10.4' : '9.8' },
      { category: 'e', COL_I: 'Insurance  Companies', COL_VIII: '5.2' },
      { category: ' ', COL_I: 'Sub-Total (B)(1)', COL_VIII: '19.5' },
      { category: 'd', COL_I: 'Foreign Portfolio Investors Category I', COL_VIII: '12.1' },
      { category: 'e', COL_I: 'Foreign Portfolio Investors Category II', COL_VIII: '3.4' }
    ])
  }

  const result = await fetchShareholdingHistory('ABC.NS', fetcher, new Date('2025-07-01T00:00:00.000Z'))

  assert.equal(result.periods.length, 2)
  assert.deepEqual(result.periods.map(period => period.date), ['2025-03-31', '2025-06-30'])
  assert.deepEqual(result.periods[1], {
    date: '2025-06-30',
    promoter: 41.2,
    fii: 15.5,
    dii: 19.5,
    public: 58.8,
    mutualFunds: 10.4,
    insurance: 5.2,
    promoterPledging: 0.4
  })
  assert.equal(requests.length, 5)
  assert.match(requests[0], /from_date=01-07-2020/)
})

test('returns no NSE filings for BSE-only symbols', async () => {
  const result = await fetchShareholdingHistory('500325.BO', async () => {
    throw new Error('BSE-only symbols should not query NSE')
  }, new Date('2025-07-01T00:00:00.000Z'))

  assert.deepEqual(result.periods, [])
})

test('keeps unavailable institutional detail null instead of reporting zero', async () => {
  const fetcher = async url => {
    const parsedUrl = new URL(url)
    if (parsedUrl.pathname.endsWith('corporate-share-holdings-master')) {
      return response([{ symbol: 'ABC', recordId: 'one', date: '30-JUN-2025', pr_and_prgrp: '40', public_val: '60' }])
    }
    if (parsedUrl.searchParams.get('index') === 'summary') return response([])
    return response(null)
  }

  const result = await fetchShareholdingHistory('ABC.NS', fetcher, new Date('2025-07-01T00:00:00.000Z'))

  assert.equal(result.periods[0].fii, null)
  assert.equal(result.periods[0].dii, null)
  assert.equal(result.periods[0].mutualFunds, null)
})

test('rejects invalid symbols', async () => {
  await assert.rejects(fetchShareholdingHistory('not valid'), { status: 400 })
})