require('dotenv').config();
const rateLimit = require('express-rate-limit');

// Configuração do rate limiter para rota /api/auth/login
// Limita tentativas de autenticação por IP para prevenir ataques de força bruta
const limitadorLogin = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_JANELA_MS) || 60000, // Janela de tempo em milissegundos
  max: parseInt(process.env.RATE_LIMIT_MAX) || 5, // Máximo de tentativas por janela
  message: { erro: 'Muitas tentativas. Tente novamente em alguns segundos' }, // Resposta JSON ao exceder limite
  standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false // Desabilita headers `X-RateLimit-*` legados
});

module.exports = limitadorLogin;
