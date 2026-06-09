// Configuração principal da aplicação Express
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { loggerRequisicoes, morganMiddleware } = require('./config/logger');

const app = express();

// Headers de segurança manuais (substitui helmet)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGEM || 'http://localhost:5173'
}));
app.use(express.json());

// Middlewares de logging
app.use(loggerRequisicoes);
app.use(morganMiddleware);

// Rotas da aplicação
const authRoutes = require('./routes/authRoutes');
const perfisRoutes = require('./routes/perfisRoutes');

app.use('/api/auth/login', authRoutes);
app.use('/api/perfis', perfisRoutes);

// Middleware de erro global (deve ser o último)
app.use((erro, req, res, next) => {
  console.error('Erro interno:', erro);

  res.status(500).json({
    erro: 'Erro interno do servidor'
  });
});

module.exports = app;
