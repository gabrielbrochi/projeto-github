// Rotas de perfis - GET /api/perfis (busca) e POST /api/perfis (inserção)

const express = require('express');
const { body, validationResult } = require('express-validator');
const autenticacao = require('../middlewares/autenticacao');
const sanitizarEntrada = require('../middlewares/sanitizacao');
const perfilModel = require('../models/perfilModel');
const cache = require('../config/cache');
const logger = require('../config/logger');

const roteador = express.Router();

// Todas as rotas deste arquivo exigem autenticação
roteador.use(autenticacao);

// GET / - Busca de perfis por termo
// Rota completa: GET /api/perfis?busca=termo
roteador.get('/', async (req, res) => {
  try {
    const { busca } = req.query;

    // Validar que o parâmetro de busca foi fornecido
    if (!busca || busca.trim() === '') {
      return res.status(400).json({ erro: 'Parâmetro de busca é obrigatório' });
    }

    const termo = busca.trim();
    const chaveCache = `busca:${termo.toLowerCase()}`;

    // Verificar cache
    const dadosCache = cache.get(chaveCache);
    if (dadosCache) {
      return res.status(200).json({
        perfis: dadosCache,
        mensagem: `${dadosCache.length} perfil(is) encontrado(s)`
      });
    }

    // Cache miss - consultar banco via model
    const perfis = await perfilModel.buscarPerfis(termo);

    // Salvar resultados no cache
    cache.set(chaveCache, perfis);

    // Registrar busca no logger
    logger.info('Busca realizada', { usuario: req.usuario.login, termo });

    // Retornar resultados (array vazio com mensagem informativa se nenhum encontrado)
    const mensagem = perfis.length === 0
      ? 'Nenhum perfil encontrado'
      : `${perfis.length} perfil(is) encontrado(s)`;

    return res.status(200).json({ perfis, mensagem });
  } catch (erro) {
    logger.error('Erro na busca de perfis', { erro: erro.message });
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST / - Inserção de perfil com repositórios
// Rota completa: POST /api/perfis
roteador.post(
  '/',
  sanitizarEntrada,
  [
    // Validação do perfil
    body('perfil.login')
      .notEmpty().withMessage('Login é obrigatório')
      .isLength({ min: 1, max: 50 }).withMessage('Login deve ter entre 1 e 50 caracteres'),
    body('perfil.nome')
      .notEmpty().withMessage('Nome é obrigatório')
      .isLength({ min: 1, max: 100 }).withMessage('Nome deve ter entre 1 e 100 caracteres'),
    body('perfil.avatar_url')
      .notEmpty().withMessage('URL do avatar é obrigatória')
      .isURL().withMessage('URL do avatar deve ser uma URL válida'),
    body('perfil.bio')
      .optional()
      .isLength({ max: 500 }).withMessage('Bio deve ter no máximo 500 caracteres'),
    body('perfil.seguidores')
      .isInt({ min: 0 }).withMessage('Seguidores deve ser um número inteiro >= 0'),
    body('perfil.seguindo')
      .isInt({ min: 0 }).withMessage('Seguindo deve ser um número inteiro >= 0'),
    body('perfil.repositorios_publicos')
      .isInt({ min: 0 }).withMessage('Repositórios públicos deve ser um número inteiro >= 0'),
    body('perfil.criado_em_github')
      .notEmpty().withMessage('Data de criação no GitHub é obrigatória')
      .isISO8601().withMessage('Data de criação deve estar em formato ISO 8601'),

    // Validação dos repositórios
    body('repositorios')
      .isArray({ min: 1 }).withMessage('Deve incluir pelo menos 1 repositório'),
    body('repositorios.*.nome')
      .notEmpty().withMessage('Nome do repositório é obrigatório')
      .isLength({ min: 1, max: 200 }).withMessage('Nome do repositório deve ter entre 1 e 200 caracteres'),
    body('repositorios.*.linguagem')
      .notEmpty().withMessage('Linguagem do repositório é obrigatória')
      .isLength({ min: 1, max: 50 }).withMessage('Linguagem deve ter entre 1 e 50 caracteres'),
    body('repositorios.*.url')
      .notEmpty().withMessage('URL do repositório é obrigatória')
      .isURL().withMessage('URL do repositório deve ser uma URL válida'),
  ],
  async (req, res) => {
    try {
      // Verificar erros de validação
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        const camposComErro = {};
        erros.array().forEach((erro) => {
          const campo = erro.path;
          if (!camposComErro[campo]) {
            camposComErro[campo] = [];
          }
          camposComErro[campo].push(erro.msg);
        });

        return res.status(400).json({
          erro: 'Dados inválidos',
          campos: camposComErro
        });
      }

      const { perfil, repositorios } = req.body;

      // Inserir via model com transação
      const resultado = await perfilModel.inserirPerfil(perfil, repositorios, req.usuario.id);

      // Invalidar cache relacionado (todas as chaves de busca)
      const chavesCache = cache.keys();
      const chavesBusca = chavesCache.filter((chave) => chave.startsWith('busca:'));
      chavesBusca.forEach((chave) => cache.del(chave));

      // Registrar inserção no logger
      logger.info('Perfil inserido', { usuario: req.usuario.login, perfilLogin: resultado.login });

      // Separar perfil dos repositórios na resposta
      const { repositorios: reposInseridos, ...perfilInserido } = resultado;

      return res.status(201).json({
        perfil: perfilInserido,
        repositorios: reposInseridos
      });
    } catch (erro) {
      logger.error('Erro na inserção de perfil', { erro: erro.message });
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
);

module.exports = roteador;
