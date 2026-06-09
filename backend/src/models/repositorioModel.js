// Model de repositórios - operações no banco para a tabela 'repositorios'

const pool = require('../config/banco');

/**
 * Busca todos os repositórios associados a um perfil pelo ID do perfil.
 * @param {number} perfilId - ID do perfil na tabela perfis_github
 * @returns {Promise<Array>} Array de objetos repositório
 */
async function buscarPorPerfilId(perfilId) {
  const resultado = await pool.query(
    'SELECT * FROM repositorios WHERE perfil_id = $1',
    [perfilId]
  );
  return resultado.rows;
}

/**
 * Insere múltiplos repositórios associados a um perfil.
 * @param {number} perfilId - ID do perfil na tabela perfis_github
 * @param {Array} repositorios - Array de objetos com { nome, linguagem, url }
 * @returns {Promise<Array>} Array de repositórios inseridos (com id gerado)
 */
async function inserirRepositorios(perfilId, repositorios) {
  const inseridos = [];

  for (const repo of repositorios) {
    const resultado = await pool.query(
      'INSERT INTO repositorios (perfil_id, nome, linguagem, url) VALUES ($1, $2, $3, $4) RETURNING *',
      [perfilId, repo.nome, repo.linguagem, repo.url]
    );
    inseridos.push(resultado.rows[0]);
  }

  return inseridos;
}

module.exports = {
  buscarPorPerfilId,
  inserirRepositorios,
};
