// Configuração do cache em memória com node-cache
require('dotenv').config();
const NodeCache = require('node-cache');

// TTL padrão via variável de ambiente (em segundos)
const ttlPadrao = parseInt(process.env.CACHE_TTL, 10) || 300;

// Período de verificação de expiração (em segundos)
const periodoVerificacao = 60;

// Instância singleton do cache
const cache = new NodeCache({
  stdTTL: ttlPadrao,
  checkperiod: periodoVerificacao
});

module.exports = cache;
