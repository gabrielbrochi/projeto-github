// Model de usuário - operações no banco para a tabela 'usuarios'

const pool = require('../config/banco');

/**
 * Busca um usuário pelo login no banco de dados.
 * Utiliza consulta parametrizada para prevenção de SQL injection.
 * @param {string} login - Login do usuário a ser buscado
 * @returns {object|null} Objeto do usuário ou null se não encontrado
 */
async function buscarPorLogin(login) {
  const resultado = await pool.query(
    'SELECT * FROM usuarios WHERE login = $1',
    [login]
  );

  return resultado.rows[0] || null;
}

module.exports = { buscarPorLogin };
