// Configuração principal da aplicação Express
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();

// Middlewares de segurança e performance
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGEM || 'http://localhost:5173'
}));
app.use(compression());
app.use(express.json());

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
