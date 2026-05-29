const axios = require('axios');

const getAIInsight = async (tokenData) => {
    try {
        const prompt = `You are a crypto market analyst. Based on the following token data, provide a brief market insight.

Token: ${tokenData.name} (${tokenData.symbol.toUpperCase()})
Current Price: $${tokenData.market_data.current_price_usd}
Market Cap: $${tokenData.market_data.market_cap_usd}
24h Volume: $${tokenData.market_data.total_volume_usd}
24h Price Change: ${tokenData.market_data.price_change_percentage_24h}%

Recent 7-day prices:
${tokenData.price_history.map(p => `${p.date}: $${p.price.toFixed(2)}`).join('\n')}

Respond only with a valid JSON object in this exact format with no extra text:
{
    "reasoning": "your market analysis here",
    "sentiment": "Bullish or Bearish or Neutral"
}`;

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openrouter/auto',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content.trim();
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.reasoning || !parsed.sentiment) return null;

        return parsed;
    } catch (err) {
        console.error('AI error:', err.response?.data || err.message);
        return null;
    }
};

module.exports = { getAIInsight };