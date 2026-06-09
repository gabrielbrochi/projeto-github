const pool = require('../config/banco');

async function buscarPorLogin(login) {
  const resultado = await pool.query(
    'SELECT * FROM usuarios WHERE login = $1',
    [login]
  );

  return resultado.rows[0] || null;
}

module.exports = { buscarPorLogin };
