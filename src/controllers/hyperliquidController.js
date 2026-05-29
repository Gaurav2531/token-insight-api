const { fetchWalletPnl } = require('../services/hyperliquidService');

const getWalletPnl = async (req, res) => {
    const { wallet } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'start and end query params are required' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
        return res.status(400).json({ error: 'Dates must be in YYYY-MM-DD format' });
    }

    const result = await fetchWalletPnl(wallet, start, end);
    if (!result) {
        return res.status(500).json({ error: 'Failed to fetch wallet PnL' });
    }

    res.json(result);
};

module.exports = { getWalletPnl };