const axios = require('axios');
const { app } = require('../src/index');

const BASE_URL = 'http://localhost:3000';
let server;

beforeAll((done) => {
    server = app.listen(3000, done);
});

afterAll((done) => {
    server.close(done);
});

describe('Token Insight API', () => {
    test('returns 200 with valid token', async () => {
        const res = await axios.post(`${BASE_URL}/api/token/bitcoin/insight`, {
            vs_currency: 'usd',
            history_days: 30
        });
        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty('source', 'coingecko');
        expect(res.data).toHaveProperty('token');
        expect(res.data).toHaveProperty('insight');
        expect(res.data.insight).toHaveProperty('reasoning');
        expect(res.data.insight).toHaveProperty('sentiment');
        expect(['Bullish', 'Bearish', 'Neutral']).toContain(res.data.insight.sentiment);
        expect(res.data).toHaveProperty('model');
    }, 30000);

    test('returns 200 with token market data fields', async () => {
        const res = await axios.post(`${BASE_URL}/api/token/ethereum/insight`, {
            vs_currency: 'usd',
            history_days: 7
        });
        expect(res.status).toBe(200);
        expect(res.data.token).toHaveProperty('id');
        expect(res.data.token).toHaveProperty('symbol');
        expect(res.data.token).toHaveProperty('name');
        expect(res.data.token.market_data).toHaveProperty('current_price_usd');
        expect(res.data.token.market_data).toHaveProperty('market_cap_usd');
        expect(res.data.token.market_data).toHaveProperty('total_volume_usd');
        expect(res.data.token.market_data).toHaveProperty('price_change_percentage_24h');
    }, 30000);

    test('returns 404 for invalid token', async () => {
        try {
            await axios.post(`${BASE_URL}/api/token/invalidtoken123xyz/insight`, {
                vs_currency: 'usd',
                history_days: 30
            });
        } catch (err) {
            expect(err.response.status).toBe(404);
            expect(err.response.data).toHaveProperty('error');
        }
    }, 30000);
});

describe('HyperLiquid PnL API', () => {
    test('returns 200 with valid wallet and date range', async () => {
        const res = await axios.get(
            `${BASE_URL}/api/hyperliquid/0x855b4d4de5e83954a944a72beab0fd5ef2a0a36e/pnl?start=2025-01-01&end=2025-01-03`
        );
        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty('wallet');
        expect(res.data).toHaveProperty('daily');
        expect(res.data).toHaveProperty('summary');
        expect(res.data).toHaveProperty('diagnostics');
        expect(Array.isArray(res.data.daily)).toBe(true);
    }, 30000);

    test('daily entries have correct fields', async () => {
        const res = await axios.get(
            `${BASE_URL}/api/hyperliquid/0x855b4d4de5e83954a944a72beab0fd5ef2a0a36e/pnl?start=2025-01-01&end=2025-01-02`
        );
        expect(res.status).toBe(200);
        const day = res.data.daily[0];
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('realized_pnl_usd');
        expect(day).toHaveProperty('unrealized_pnl_usd');
        expect(day).toHaveProperty('fees_usd');
        expect(day).toHaveProperty('funding_usd');
        expect(day).toHaveProperty('net_pnl_usd');
        expect(day).toHaveProperty('equity_usd');
    }, 30000);

    test('returns 400 when dates are missing', async () => {
        try {
            await axios.get(
                `${BASE_URL}/api/hyperliquid/0x855b4d4de5e83954a944a72beab0fd5ef2a0a36e/pnl`
            );
        } catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data).toHaveProperty('error');
        }
    }, 30000);

    test('returns 400 for invalid date format', async () => {
        try {
            await axios.get(
                `${BASE_URL}/api/hyperliquid/0x855b4d4de5e83954a944a72beab0fd5ef2a0a36e/pnl?start=01-01-2025&end=05-01-2025`
            );
        } catch (err) {
            expect(err.response.status).toBe(400);
            expect(err.response.data).toHaveProperty('error');
        }
    }, 30000);
});