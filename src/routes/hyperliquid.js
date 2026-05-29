const express = require('express');
const router = express.Router();
const { getWalletPnl } = require('../controllers/hyperliquidController');

router.get('/:wallet/pnl', getWalletPnl);

module.exports = router;