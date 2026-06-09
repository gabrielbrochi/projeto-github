const pool = require('../config/banco');

async function buscarPorPerfilId(perfilId) {
  const resultado = await pool.query(
    'SELECT * FROM repositorios WHERE perfil_id = $1',
    [perfilId]
  );
  return resultado.rows;
}

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
