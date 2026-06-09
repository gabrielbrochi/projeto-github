require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const cabecalhoAuth = req.headers.authorization;

  if (!cabecalhoAuth || !cabecalhoAuth.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação inválido ou ausente' });
  }

  const token = cabecalhoAuth.split('Bearer ')[1];

  if (!token || token.trim() === '') {
    return res.status(401).json({ erro: 'Token de autenticação inválido ou ausente' });
  }

  try {
    const dadosDecodificados = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = dadosDecodificados;

    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token de autenticação inválido ou ausente' });
  }
};
