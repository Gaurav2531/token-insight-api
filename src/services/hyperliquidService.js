const axios = require('axios');

const HYPERLIQUID_API = 'https://api.hyperliquid.xyz/info';

const postHL = async (body) => {
    const res = await axios.post(HYPERLIQUID_API, JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
};

const fetchWalletPnl = async (wallet, start, end) => {
    try {
        const startTs = new Date(start).getTime();
        const endTs = new Date(end).getTime() + 86400000;

        const [userFills, userFunding, clearinghouseState] = await Promise.all([
            postHL({ type: 'userFills', user: wallet, aggregateByTime: false }),
            postHL({ type: 'userFunding', user: wallet, startTime: startTs }),
            postHL({ type: 'clearinghouseState', user: wallet })
        ]);

        const dateRange = generateDateRange(start, end);

        const dailyMap = {};
        dateRange.forEach(date => {
            dailyMap[date] = {
                date,
                realized_pnl_usd: 0,
                unrealized_pnl_usd: 0,
                fees_usd: 0,
                funding_usd: 0,
                net_pnl_usd: 0,
                equity_usd: 0
            };
        });

        if (Array.isArray(userFills)) {
            userFills.forEach(fill => {
                const date = new Date(fill.time).toISOString().split('T')[0];
                if (!dailyMap[date]) return;
                const pnl = parseFloat(fill.closedPnl || 0);
                const fee = parseFloat(fill.fee || 0);
                dailyMap[date].realized_pnl_usd += pnl;
                dailyMap[date].fees_usd += fee;
            });
        }

        if (Array.isArray(userFunding)) {
            userFunding.forEach(entry => {
                const date = new Date(entry.time).toISOString().split('T')[0];
                if (!dailyMap[date]) return;
                dailyMap[date].funding_usd += parseFloat(entry.fundingPayment || 0);
            });
        }

        const positions = clearinghouseState?.assetPositions || [];
        const lastDate = dateRange[dateRange.length - 1];
        positions.forEach(pos => {
            const unrealized = parseFloat(pos.position?.unrealizedPnl || 0);
            if (dailyMap[lastDate]) {
                dailyMap[lastDate].unrealized_pnl_usd += unrealized;
            }
        });

        let runningEquity = parseFloat(clearinghouseState?.marginSummary?.accountValue || 0);

        const daily = dateRange.map(date => {
            const d = dailyMap[date];
            d.net_pnl_usd = parseFloat(
                (d.realized_pnl_usd + d.unrealized_pnl_usd - d.fees_usd + d.funding_usd).toFixed(2)
            );
            d.realized_pnl_usd = parseFloat(d.realized_pnl_usd.toFixed(2));
            d.unrealized_pnl_usd = parseFloat(d.unrealized_pnl_usd.toFixed(2));
            d.fees_usd = parseFloat(d.fees_usd.toFixed(2));
            d.funding_usd = parseFloat(d.funding_usd.toFixed(2));
            runningEquity += d.net_pnl_usd;
            d.equity_usd = parseFloat(runningEquity.toFixed(2));
            return d;
        });

        const summary = {
            total_realized_usd: parseFloat(daily.reduce((s, d) => s + d.realized_pnl_usd, 0).toFixed(2)),
            total_unrealized_usd: parseFloat(daily.reduce((s, d) => s + d.unrealized_pnl_usd, 0).toFixed(2)),
            total_fees_usd: parseFloat(daily.reduce((s, d) => s + d.fees_usd, 0).toFixed(2)),
            total_funding_usd: parseFloat(daily.reduce((s, d) => s + d.funding_usd, 0).toFixed(2)),
            net_pnl_usd: parseFloat(daily.reduce((s, d) => s + d.net_pnl_usd, 0).toFixed(2))
        };

        return {
            wallet,
            start,
            end,
            daily,
            summary,
            diagnostics: {
                data_source: 'hyperliquid_api',
                last_api_call: new Date().toISOString(),
                notes: 'PnL calculated using daily close prices'
            }
        };
    } catch (err) {
        console.error('HyperLiquid error:', err.response?.data || err.message);
        return null;
    }
};

const generateDateRange = (start, end) => {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
};

module.exports = { fetchWalletPnl };