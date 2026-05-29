const express = require('express');
const router = express.Router();
const { getTokenInsight } = require('../controllers/tokenController');

router.post('/:id/insight', getTokenInsight);

module.exports = router;