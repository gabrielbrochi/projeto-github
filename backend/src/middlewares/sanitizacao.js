const { body, validationResult } = require('express-validator');

// Padrões perigosos de SQL injection
const PADROES_SQL = [
  /('\s*;\s*DROP\s)/i,
  /(\bOR\s+1\s*=\s*1\b)/i,
  /(\bUNION\s+SELECT\b)/i,
  /(\bSELECT\s+\*\s+FROM\b)/i,
  /(\bDELETE\s+FROM\b)/i,
  /(\bINSERT\s+INTO\b)/i,
  /(\bDROP\s+TABLE\b)/i,
  /(--\s)/,
  /(\b1\s*=\s*1\b)/,
];

// Padrões perigosos de XSS
const PADROES_XSS = [
  /<script[\s>]/i,
  /<\/script>/i,
  /\bon\w+\s*=/i,       // onerror=, onload=, onclick=, etc.
  /javascript\s*:/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,
  /<svg[\s>].*?on\w+/i,
];

/**
 * Verifica se uma string contém padrões maliciosos
 * @param {string} valor - String a ser verificada
 * @returns {boolean} true se contém padrões perigosos
 */
function contemPadraoMalicioso(valor) {
  if (typeof valor !== 'string') return false;

  for (const padrao of PADROES_SQL) {
    if (padrao.test(valor)) return true;
  }

  for (const padrao of PADROES_XSS) {
    if (padrao.test(valor)) return true;
  }

  return false;
}

/**
 * Aplica trim recursivamente em todos os valores string de um objeto
 * @param {*} obj - Objeto a ser processado
 * @returns {*} Objeto com strings trimadas
 */
function trimRecursivo(obj) {
  if (typeof obj === 'string') {
    return obj.trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => trimRecursivo(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const resultado = {};
    for (const chave of Object.keys(obj)) {
      resultado[chave] = trimRecursivo(obj[chave]);
    }
    return resultado;
  }

  return obj;
}

/**
 * Escapa caracteres especiais HTML em strings para prevenir XSS armazenado
 * Caracteres escapados: & < > " ' /
 * @param {string} valor - String a ser escapada
 * @returns {string} String com caracteres HTML escapados
 */
function escaparHTML(valor) {
  if (typeof valor !== 'string') return valor;

  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Aplica escape de HTML recursivamente em todos os valores string de um objeto
 * @param {*} obj - Objeto a ser processado
 * @returns {*} Objeto com strings escapadas
 */
function escaparHTMLRecursivo(obj) {
  if (typeof obj === 'string') {
    return escaparHTML(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => escaparHTMLRecursivo(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const resultado = {};
    for (const chave of Object.keys(obj)) {
      resultado[chave] = escaparHTMLRecursivo(obj[chave]);
    }
    return resultado;
  }

  return obj;
}

/**
 * Verifica recursivamente se algum valor string contém padrões maliciosos
 * @param {*} obj - Objeto a ser verificado
 * @returns {boolean} true se algum valor contém padrões perigosos
 */
function verificarRecursivo(obj) {
  if (typeof obj === 'string') {
    return contemPadraoMalicioso(obj);
  }

  if (Array.isArray(obj)) {
    return obj.some(item => verificarRecursivo(item));
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.values(obj).some(valor => verificarRecursivo(valor));
  }

  return false;
}

/**
 * Middleware de sanitização de entrada
 * 1. Aplica trim em todas as strings do body
 * 2. Escapa caracteres especiais HTML para prevenir XSS
 * 3. Verifica padrões de SQL injection e XSS
 * 4. Rejeita com 400 se detectar entrada maliciosa
 */
function sanitizarEntrada(req, res, next) {
  // Aplica trim recursivo no body
  if (req.body && typeof req.body === 'object') {
    req.body = trimRecursivo(req.body);
  }

  // Verifica padrões maliciosos no body (antes do escape)
  if (req.body && verificarRecursivo(req.body)) {
    return res.status(400).json({
      erro: 'Entrada contém caracteres não permitidos'
    });
  }

  // Verifica padrões maliciosos nos query params
  if (req.query && verificarRecursivo(req.query)) {
    return res.status(400).json({
      erro: 'Entrada contém caracteres não permitidos'
    });
  }

  // Aplica escape de HTML no body após validação
  if (req.body && typeof req.body === 'object') {
    req.body = escaparHTMLRecursivo(req.body);
  }

  next();
}

module.exports = sanitizarEntrada;
