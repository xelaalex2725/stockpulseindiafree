const parseCsvLine = (line) => {
  const fields = []
  let field = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]
    if (character === '"' && quoted && nextCharacter === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      fields.push(field.trim())
      field = ''
    } else {
      field += character
    }
  }

  fields.push(field.trim())
  return fields
}

export default async function handler(request, response) {
  try {
    const [sourceResponse, bseResponse] = await Promise.all([
      fetch('https://archives.nseindia.com/content/equities/EQUITY_L.csv', { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India', Accept: 'text/csv' } }),
      fetch('https://api.bseindia.com/BseIndiaAPI/api/ListofScripData/w?segment=Equity&status=Active', { headers: { 'User-Agent': 'Mozilla/5.0 Stock Pulse India', Accept: 'application/json', Referer: 'https://www.bseindia.com/' } })
    ])
    if (!sourceResponse.ok && !bseResponse.ok) return response.status(502).json({ error: 'NSE and BSE feeds unavailable' })

    const rows = sourceResponse.ok ? (await sourceResponse.text()).split(/\r?\n/).filter(Boolean) : []
    const nseSymbols = rows.slice(1).map(parseCsvLine)
      .filter(fields => fields[0] && fields[2] === 'EQ' && /^[A-Z0-9&-]+$/.test(fields[0]))
      .map(fields => ({
        s: fields[0],
        n: fields[1] || fields[0],
        symbol: `${fields[0]}.NS`,
        sector: 'Other'
      }))
    const bsePayload = bseResponse.ok ? await bseResponse.json() : []
    const bseSymbols = (Array.isArray(bsePayload) ? bsePayload : bsePayload?.Table || bsePayload?.data || [])
      .filter(item => item?.SCRIP_CD && item?.Scrip_Name && item?.Status !== 'Suspended')
      .map(item => ({ s: String(item.SCRIP_CD), n: String(item.Scrip_Name).trim(), symbol: `${item.SCRIP_CD}.BO`, sector: 'Other' }))

    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
    return response.status(200).json({ updatedAt: new Date().toISOString(), stocks: [...nseSymbols, ...bseSymbols] })
  } catch (error) {
    console.error('Error fetching NSE stock universe:', error)
    return response.status(502).json({ error: 'Unable to reach NSE stock universe' })
  }
}
