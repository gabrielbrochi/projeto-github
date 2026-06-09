const express = require('express');
const autenticacao = require('../config/autenticacao');
const sanitizarEntrada = require('../config/sanitizacao');
const perfilModel = require('../models/perfilModel');
const cache = require('../config/cache');
const { logger } = require('../config/logger');

const roteador = express.Router();

roteador.use(autenticacao);

function validarPerfil(perfil, repositorios) {
  const erros = {};

  if (!perfil || typeof perfil !== 'object') {
    erros['perfil'] = ['Dados do perfil são obrigatórios'];
    return erros;
  }

  if (!perfil.login || perfil.login.trim() === '') erros['perfil.login'] = ['Login é obrigatório'];
  if (!perfil.nome || perfil.nome.trim() === '') erros['perfil.nome'] = ['Nome é obrigatório'];
  if (!perfil.avatar_url || perfil.avatar_url.trim() === '') erros['perfil.avatar_url'] = ['URL do avatar é obrigatória'];
  if (perfil.seguidores === undefined || perfil.seguidores < 0) erros['perfil.seguidores'] = ['Seguidores deve ser um número >= 0'];
  if (perfil.seguindo === undefined || perfil.seguindo < 0) erros['perfil.seguindo'] = ['Seguindo deve ser um número >= 0'];
  if (perfil.repositorios_publicos === undefined || perfil.repositorios_publicos < 0) erros['perfil.repositorios_publicos'] = ['Repositórios públicos deve ser um número >= 0'];
  if (!perfil.criado_em_github) erros['perfil.criado_em_github'] = ['Data de criação no GitHub é obrigatória'];

  if (!repositorios || !Array.isArray(repositorios) || repositorios.length === 0) {
    erros['repositorios'] = ['Deve incluir pelo menos 1 repositório'];
  } else {
    repositorios.forEach((repo, i) => {
      if (!repo.nome || repo.nome.trim() === '') erros[`repositorios[${i}].nome`] = ['Nome do repositório é obrigatório'];
      if (!repo.linguagem || repo.linguagem.trim() === '') erros[`repositorios[${i}].linguagem`] = ['Linguagem é obrigatória'];
      if (!repo.url || repo.url.trim() === '') erros[`repositorios[${i}].url`] = ['URL do repositório é obrigatória'];
    });
  }

  return Object.keys(erros).length > 0 ? erros : null;
}

roteador.get('/', async (req, res) => {
  try {
    const { busca } = req.query;

    if (!busca || busca.trim() === '') {
      return res.status(400).json({ erro: 'Parâmetro de busca é obrigatório' });
    }

    const termo = busca.trim();
    const chaveCache = `busca:${termo.toLowerCase()}`;

    const dadosCacheStr = await cache.get(chaveCache);
    if (dadosCacheStr) {
      const dadosCache = JSON.parse(dadosCacheStr);
      return res.status(200).json({
        perfis: dadosCache,
        mensagem: `${dadosCache.length} perfil(is) encontrado(s)`
      });
    }

    const perfis = await perfilModel.buscarPerfis(termo);

    const ttl = parseInt(process.env.CACHE_TTL) || 300;
    await cache.setEx(chaveCache, ttl, JSON.stringify(perfis));

    logger.info('Busca realizada', { usuario: req.usuario.login, termo });

    const mensagem = perfis.length === 0
      ? 'Nenhum perfil encontrado'
      : `${perfis.length} perfil(is) encontrado(s)`;

    return res.status(200).json({ perfis, mensagem });
  } catch (erro) {
    logger.error('Erro na busca de perfis', { erro: erro.message });
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

roteador.post('/', sanitizarEntrada, async (req, res) => {
  try {
    const { perfil, repositorios } = req.body;

    const errosValidacao = validarPerfil(perfil, repositorios);
    if (errosValidacao) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        campos: errosValidacao
      });
    }

    const resultado = await perfilModel.inserirPerfil(perfil, repositorios, req.usuario.id);

    const chaves = await cache.keys('busca:*');
    for (const c of chaves) {
      await cache.del(c);
    }

    logger.info('Perfil inserido', { usuario: req.usuario.login, perfilLogin: resultado.login });

    const { repositorios: reposInseridos, ...perfilInserido } = resultado;

    return res.status(201).json({
      perfil: perfilInserido,
      repositorios: reposInseridos
    });
  } catch (erro) {
    logger.error('Erro na inserção de perfil', { erro: erro.message });
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = roteador;
