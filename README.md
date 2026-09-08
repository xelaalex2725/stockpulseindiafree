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

After deployment, use the Vercel-provided URL or connect a custom domain from **Vercel > Project Settings > Domains**. The local `server.js` remains available for local development.

### Netlify
Import the GitHub repo and use:
- Build command: `npm run build`
- Publish directory: `dist`

### GitHub Pages
Use GitHub Actions to run `npm ci && npm run build` and publish `dist`.

The Vite configuration uses a relative base (`./`) to make static deployment easier.
