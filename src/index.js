const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const tokenRoutes = require('./routes/token');
const hyperliquidRoutes = require('./routes/hyperliquid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/token', tokenRoutes);
app.use('/api/hyperliquid', hyperliquidRoutes);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = { app };