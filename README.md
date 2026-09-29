# Stock Pulse India

A free-to-deploy React + Vite stock market dashboard.

## What is included
- White, elegant responsive dashboard UI
- Large / Mid / Small cap scanner
- Search, tabs, watchlist star controls
- Technical-style score, trend, risk and sector heatmap
- Market overview cards
- Animated chart and refresh interaction
- External live-analysis links to TradingView, NSE India, Moneycontrol and Screener
- No paid backend required
- No API key is stored in the frontend

## Important data note
The sample prices and scores in the scanner are illustrative UI data. The external research buttons are the live-data layer. This avoids exposing broker/API secrets in a public static site.

For true programmatic real-time Indian market data, add a server-side API layer later. Upstox documents a WebSocket Market Data Feed V3 for real-time updates, which requires authenticated access.

## Local run
```bash
npm install
npm run dev
```

The development command starts both Vite and the market-data proxy. To open the app from another device on the same network, use the host computer's network URL shown by Vite, such as `http://192.168.x.x:5173/`, rather than `localhost`. Keep both the frontend and backend running.

## Free deployment
### Vercel
1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Framework: Vite.
4. Build: `npm run build`
5. Output: `dist`

This repository includes a Vercel serverless function at `api/chart/[symbol].js`, so the live chart API is served from the same Vercel domain. No `VITE_API_BASE_URL` value is required for the standard deployment.

The in-site **Dividends** tab reads the official NSE corporate-actions RSS feed through `api/dividends.js` (or `/api/dividends` in the local Express server), so it lists NSE announcements beyond the configured stock watchlist.

After deployment, use the Vercel-provided URL or connect a custom domain from **Vercel > Project Settings > Domains**. The local `server.js` remains available for local development.

## AI stock analysis
The stock detail panel requests an AI scenario analysis when a stock is opened. It uses the available chart pattern, trend, momentum, volume, VWAP, fundamentals, and related headlines to estimate the chance of a positive price return over the next 20 trading sessions. The estimate is not statistically calibrated or guaranteed.

Configure the server-side environment variables before using this feature:
- `OPENAI_API_KEY` (required; keep it on the server and never add it to a `VITE_` variable)
- `OPENAI_MODEL` (optional; defaults to `gpt-4o-mini`)
- `OPENAI_BASE_URL` (optional; defaults to `https://api.openai.com/v1`)

For local development, copy `.env.example` to `.env`, replace the placeholder with your provider key, and restart `npm run dev`. The local server loads `.env`; the real file is ignored by Git. For Vercel, add the variables under **Project Settings > Environment Variables** and redeploy. Without the key, the analysis panel reports that AI analysis is not configured.

### Netlify
Import the GitHub repo and use:
- Build command: `npm run build`
- Publish directory: `dist`

### GitHub Pages
Use GitHub Actions to run `npm ci && npm run build` and publish `dist`.

The Vite configuration uses a relative base (`./`) to make static deployment easier.
