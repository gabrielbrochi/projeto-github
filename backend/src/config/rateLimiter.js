require('dotenv').config();
const rateLimit = require('express-rate-limit');

const limitadorLogin = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_JANELA_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 5,
  message: { erro: 'Muitas tentativas. Tente novamente em alguns segundos' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = limitadorLogin;
