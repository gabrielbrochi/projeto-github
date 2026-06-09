// Middleware de autenticação JWT
require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica o token JWT no header Authorization.
 * Extrai o token do formato "Bearer <token>", verifica a assinatura
 * e anexa os dados decodificados a req.usuario.
 * Retorna 401 se o token for inválido ou ausente.
 */
module.exports = function (req, res, next) {
  const cabecalhoAuth = req.headers.authorization;

  // Verifica se o header Authorization está presente e começa com "Bearer "
  if (!cabecalhoAuth || !cabecalhoAuth.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação inválido ou ausente' });
  }

  // Extrai o token (parte após "Bearer ")
  const token = cabecalhoAuth.split('Bearer ')[1];

  // Verifica se o token não está vazio
  if (!token || token.trim() === '') {
    return res.status(401).json({ erro: 'Token de autenticação inválido ou ausente' });
  }

  try {
    // Verifica e decodifica o token usando o segredo JWT
    const dadosDecodificados = jwt.verify(token, process.env.JWT_SECRET);

    // Anexa dados do usuário à requisição
    req.usuario = dadosDecodificados;

    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token de autenticação inválido ou ausente' });
  }
};
