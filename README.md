Open `README.md` in VS Code — if it's empty, just paste the content again directly into the file:

```markdown
# Token Insight API

## Setup

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
git clone https://github.com/Gaurav2531/token-insight-api.git
cd token-insight-api
npm install
```

### Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3000) |
| OPENROUTER_API_KEY | Get free key at https://openrouter.ai |

### Run

```bash
npm start
```

Server starts at `http://localhost:3000`

---

## API Endpoints

### 1. Token Insight

`POST /api/token/:id/insight`

Fetches token market data from CoinGecko and returns AI-generated sentiment analysis.

**Request:**
```json
{
  "vs_currency": "usd",
  "history_days": 30
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/token/bitcoin/insight \
  -H "Content-Type: application/json" \
  -d '{"vs_currency":"usd","history_days":30}'
```

**Response:**
```json
{
  "source": "coingecko",
  "token": {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "market_data": {
      "current_price_usd": 67000,
      "market_cap_usd": 1300000000000,
      "total_volume_usd": 30000000000,
      "price_change_percentage_24h": 1.5
    }
  },
  "insight": {
    "reasoning": "Bitcoin is showing bullish signals...",
    "sentiment": "Bullish"
  },
  "model": {
    "provider": "openrouter",
    "model": "openrouter/auto"
  }
}
```

---

### 2. HyperLiquid Wallet PnL

`GET /api/hyperliquid/:wallet/pnl?start=YYYY-MM-DD&end=YYYY-MM-DD`

Fetches daily realized/unrealized PnL, fees, and funding for a HyperLiquid wallet.

**Example:**
```bash
curl "http://localhost:3000/api/hyperliquid/0xYourWalletAddress/pnl?start=2025-01-01&end=2025-01-05"
```

**Response:**
```json
{
  "wallet": "0xabc123...",
  "start": "2025-01-01",
  "end": "2025-01-05",
  "daily": [
    {
      "date": "2025-01-01",
      "realized_pnl_usd": 120.5,
      "unrealized_pnl_usd": -15.3,
      "fees_usd": 2.1,
      "funding_usd": -0.5,
      "net_pnl_usd": 102.6,
      "equity_usd": 10102.6
    }
  ],
  "summary": {
    "total_realized_usd": 120.5,
    "total_unrealized_usd": -15.3,
    "total_fees_usd": 2.1,
    "total_funding_usd": -0.5,
    "net_pnl_usd": 102.6
  },
  "diagnostics": {
    "data_source": "hyperliquid_api",
    "last_api_call": "2025-09-22T12:00:00Z",
    "notes": "PnL calculated using daily close prices"
  }
}
```

---

## AI Setup

This project uses [OpenRouter](https://openrouter.ai) with the `openrouter/auto` router which automatically selects from available free models.

1. Sign up at https://openrouter.ai
2. Go to Keys → Create Key
3. Add to `.env` as `OPENROUTER_API_KEY`

No credit card required for free tier.

---

## Docker

```bash
docker build -t token-insight-api .
docker run -p 3000:3000 --env-file .env token-insight-api
```

---

## Running Tests

```bash
npm test
```
```

Save it, then push:

```bash
git add .
git commit -m "fix readme"
git push
```
