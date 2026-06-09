// Rotas de autenticação - POST /api/auth/login
require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sanitizarEntrada = require('../config/sanitizacao');
const limitadorLogin = require('../config/rateLimiter');
const usuarioModel = require('../models/usuarioModel');
const { logger } = require('../config/logger');

const roteador = express.Router();

// POST / - Autenticação de usuário
// Aplica rate limiter e sanitização como middlewares da rota
roteador.post('/', limitadorLogin, sanitizarEntrada, async (req, res) => {
  // Obtém IP do cliente para registro em logs
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    const { login, senha } = req.body;

    // Validar campos obrigatórios
    if (!login || !senha) {
      return res.status(400).json({ erro: 'Login e senha são obrigatórios' });
    }

    // Buscar usuário pelo login no banco
    const usuario = await usuarioModel.buscarPorLogin(login);

    // Se usuário não encontrado, retornar erro genérico
    if (!usuario) {
      logger.warn('Tentativa de login falha', { login, ip });
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Comparar senha fornecida com hash armazenado
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    // Se senha incorreta, retornar MESMA mensagem genérica (sem revelar qual campo falhou)
    if (!senhaCorreta) {
      logger.warn('Tentativa de login falha', { login, ip });
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Gerar token JWT com payload do usuário
    const segredo = process.env.JWT_SECRET;
    const expiracao = process.env.JWT_EXPIRACAO || '1h';

    const token = jwt.sign(
      { id: usuario.id, login: usuario.login },
      segredo,
      { expiresIn: expiracao }
    );

    // Registrar login bem-sucedido
    logger.info('Login bem-sucedido', { login: usuario.login, ip });

    // Retornar token e dados básicos do usuário
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
