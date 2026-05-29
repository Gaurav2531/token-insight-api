const { fetchTokenData } = require('../services/coingeckoService');
const { getAIInsight } = require('../services/aiService');

const getTokenInsight = async (req, res) => {
    const { id } = req.params;
    const { vs_currency = 'usd', history_days = 30 } = req.body;

    const tokenData = await fetchTokenData(id, vs_currency, history_days);
    if (!tokenData) {
        return res.status(404).json({ error: 'Token not found' });
    }

    const insight = await getAIInsight(tokenData);
    if (!insight) {
        return res.status(500).json({ error: 'AI service failed' });
    }

    res.json({
        source: 'coingecko',
        token: tokenData,
        insight,
    model: {
    provider: 'openrouter',
    model: 'openrouter/auto'
}
    });
};

module.exports = { getTokenInsight };