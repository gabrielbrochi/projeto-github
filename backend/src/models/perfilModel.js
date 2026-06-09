const pool = require('../config/banco');

async function buscarPerfis(termo) {
  const consultaPerfis = `
    SELECT id, login, nome, avatar_url, bio, seguidores, seguindo,
           repositorios_publicos, criado_em_github, inserido_em, inserido_por
    FROM perfis_github
    WHERE login ILIKE $1
    ORDER BY inserido_em DESC
  `;

  const resultadoPerfis = await pool.query(consultaPerfis, [`%${termo}%`]);

  const perfisComRepositorios = await Promise.all(
    resultadoPerfis.rows.map(async (perfil) => {
      const consultaRepositorios = `
        SELECT id, nome, linguagem, url
        FROM repositorios
        WHERE perfil_id = $1
        ORDER BY id ASC
      `;
      const resultadoRepos = await pool.query(consultaRepositorios, [perfil.id]);

      return {
        ...perfil,
        repositorios: resultadoRepos.rows,
      };
    })
  );

  return perfisComRepositorios;
}

async function inserirPerfil(dadosPerfil, repositorios, usuarioId) {
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    const consultaInsercaoPerfil = `
      INSERT INTO perfis_github (login, nome, avatar_url, bio, seguidores, seguindo,
                                 repositorios_publicos, criado_em_github, inserido_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, login, nome, avatar_url, bio, seguidores, seguindo,
                repositorios_publicos, criado_em_github, inserido_em, inserido_por
    `;

    const valoresPerfil = [
      dadosPerfil.login,
      dadosPerfil.nome,
      dadosPerfil.avatar_url,
      dadosPerfil.bio || null,
      dadosPerfil.seguidores,
      dadosPerfil.seguindo,
      dadosPerfil.repositorios_publicos,
      dadosPerfil.criado_em_github,
      usuarioId,
    ];

    const resultadoPerfil = await cliente.query(consultaInsercaoPerfil, valoresPerfil);
    const perfilInserido = resultadoPerfil.rows[0];

    const repositoriosInseridos = [];

    for (const repo of repositorios) {
      const consultaInsercaoRepo = `
        INSERT INTO repositorios (perfil_id, nome, linguagem, url)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome, linguagem, url
      `;

      const valoresRepo = [
        perfilInserido.id,
        repo.nome,
        repo.linguagem || null,
        repo.url,
      ];

      const resultadoRepo = await cliente.query(consultaInsercaoRepo, valoresRepo);
      repositoriosInseridos.push(resultadoRepo.rows[0]);
    }

    await cliente.query('COMMIT');

    return {
      ...perfilInserido,
      repositorios: repositoriosInseridos,
    };
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
}

module.exports = {
  buscarPerfis,
  inserirPerfil,
};
