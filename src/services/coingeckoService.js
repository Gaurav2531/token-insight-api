const axios = require('axios');

const fetchTokenData = async (id, vs_currency, history_days) => {
    try {
        const [coinRes, chartRes] = await Promise.all([
            axios.get(`https://api.coingecko.com/api/v3/coins/${id}`),
            axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
                params: { vs_currency, days: history_days }
            })
        ]);

        const coin = coinRes.data;
        const market = coin.market_data;

        return {
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            market_data: {
                current_price_usd: market.current_price[vs_currency],
                market_cap_usd: market.market_cap[vs_currency],
                total_volume_usd: market.total_volume[vs_currency],
                price_change_percentage_24h: market.price_change_percentage_24h
            },
            price_history: chartRes.data.prices.slice(-7).map(([timestamp, price]) => ({
                date: new Date(timestamp).toISOString().split('T')[0],
                price
            }))
        };
    } catch (err) {
        if (err.response && err.response.status === 404) return null;
        return null;
    }
};

module.exports = { fetchTokenData };