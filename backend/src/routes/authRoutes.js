require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sanitizarEntrada = require('../config/sanitizacao');
const limitadorLogin = require('../config/rateLimiter');
const usuarioModel = require('../models/usuarioModel');
const { logger } = require('../config/logger');

const roteador = express.Router();

roteador.post('/', limitadorLogin, sanitizarEntrada, async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(400).json({ erro: 'Login e senha são obrigatórios' });
    }

    const usuario = await usuarioModel.buscarPorLogin(login);

    if (!usuario) {
      logger.warn('Tentativa de login falha', { login, ip });
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      logger.warn('Tentativa de login falha', { login, ip });
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const segredo = process.env.JWT_SECRET;
    const expiracao = process.env.JWT_EXPIRACAO || '1h';

    const token = jwt.sign(
      { id: usuario.id, login: usuario.login },
      segredo,
      { expiresIn: expiracao }
    );

    logger.info('Login bem-sucedido', { login: usuario.login, ip });

    return res.status(200).json({
      token,
      usuario: { id: usuario.id, login: usuario.login }
    });
  } catch (erro) {
    logger.error('Erro no processo de autenticação', { erro: erro.message, ip });
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = roteador;
