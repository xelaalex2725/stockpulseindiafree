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

The live analysis proxy in `server.js` must be deployed separately and configured with `VITE_API_BASE_URL`. A static Vite deployment alone can display the UI but cannot run the Express proxy.

### Netlify
Import the GitHub repo and use:
- Build command: `npm run build`
- Publish directory: `dist`

### GitHub Pages
Use GitHub Actions to run `npm ci && npm run build` and publish `dist`.

The Vite configuration uses a relative base (`./`) to make static deployment easier.
