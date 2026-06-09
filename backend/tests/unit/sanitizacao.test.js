const sanitizarEntrada = require('../../src/middlewares/sanitizacao');

// Helper para criar req/res/next mock
function criarMocks(body = {}, query = {}) {
  const req = { body, query };
  const res = {
    statusCode: null,
    dados: null,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(dados) {
      this.dados = dados;
      return this;
    }
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('Middleware de Sanitização', () => {
  describe('Trim de strings', () => {
    it('deve aplicar trim em strings do body', () => {
      const { req, res, next } = criarMocks({ nome: '  Gabriel  ', login: ' admin ' });

      sanitizarEntrada(req, res, next);

      expect(req.body.nome).not.toMatch(/^\s/);
      expect(req.body.login).not.toMatch(/^\s/);
      expect(next).toHaveBeenCalled();
    });

    it('deve aplicar trim recursivamente em objetos aninhados', () => {
      const { req, res, next } = criarMocks({
        perfil: { nome: '  teste  ', bio: ' bio aqui ' },
        repositorios: [{ nome: '  repo  ' }]
      });

      sanitizarEntrada(req, res, next);

      expect(req.body.perfil.nome).toBe('teste');
      expect(req.body.perfil.bio).toBe('bio aqui');
      expect(req.body.repositorios[0].nome).toBe('repo');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Escape de HTML', () => {
    it('deve escapar caracteres especiais HTML no body', () => {
      const { req, res, next } = criarMocks({ nome: 'Gabriel <b>bold</b>' });

      sanitizarEntrada(req, res, next);

      expect(req.body.nome).toContain('&lt;');
      expect(req.body.nome).toContain('&gt;');
      expect(req.body.nome).not.toContain('<b>');
      expect(next).toHaveBeenCalled();
    });

    it('deve escapar aspas e ampersand', () => {
      const { req, res, next } = criarMocks({ campo: 'valor "com" aspas & simbolo' });

      sanitizarEntrada(req, res, next);

      expect(req.body.campo).toContain('&quot;');
      expect(req.body.campo).toContain('&amp;');
      expect(next).toHaveBeenCalled();
    });

    it('deve escapar recursivamente em objetos aninhados', () => {
      const { req, res, next } = criarMocks({
        perfil: { bio: '<em>teste</em>' },
        repos: [{ nome: 'repo<1>' }]
      });

      sanitizarEntrada(req, res, next);

      expect(req.body.perfil.bio).toContain('&lt;em&gt;');
      expect(req.body.repos[0].nome).toContain('&lt;1&gt;');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Detecção de SQL injection', () => {
    it('deve rejeitar entrada com DROP TABLE', () => {
      const { req, res, next } = criarMocks({ login: "admin'; DROP TABLE usuarios" });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res.dados.erro).toBe('Entrada contém caracteres não permitidos');
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar entrada com OR 1=1', () => {
      const { req, res, next } = criarMocks({ login: "admin' OR 1=1" });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res.dados.erro).toBe('Entrada contém caracteres não permitidos');
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar entrada com UNION SELECT', () => {
      const { req, res, next } = criarMocks({ busca: 'watinha UNION SELECT * FROM usuarios' });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar entrada com comentário SQL (--)', () => {
      const { req, res, next } = criarMocks({ login: 'admin-- comentario' });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar entrada com DELETE FROM', () => {
      const { req, res, next } = criarMocks({ campo: 'DELETE FROM usuarios' });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Detecção de XSS', () => {
    it('deve rejeitar entrada com tag script', () => {
      const { req, res, next } = criarMocks({ nome: '<script>alert("xss")</script>' });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res.dados.erro).toBe('Entrada contém caracteres não permitidos');
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar entrada com evento onerror', () => {
      const { req, res, next } = criarMocks({ bio: '<img onerror=alert(1)>' });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar entrada com javascript:', () => {
      const { req, res, next } = criarMocks({ url: 'javascript:alert(1)' });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar entrada com iframe', () => {
      const { req, res, next } = criarMocks({ campo: '<iframe src="http://evil.com">' });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Verificação em query params', () => {
    it('deve rejeitar query params com padrões maliciosos', () => {
      const { req, res, next } = criarMocks({}, { busca: "'; DROP TABLE usuarios" });

      sanitizarEntrada(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res.dados.erro).toBe('Entrada contém caracteres não permitidos');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Requisições válidas', () => {
    it('deve permitir entrada válida e chamar next()', () => {
      const { req, res, next } = criarMocks({ login: 'admin', senha: 'senha123' });

      sanitizarEntrada(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.statusCode).toBeNull();
    });

    it('deve permitir body vazio', () => {
      const { req, res, next } = criarMocks({});

      sanitizarEntrada(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('deve preservar valores não-string inalterados', () => {
      const { req, res, next } = criarMocks({
        seguidores: 100,
        seguindo: 50,
        ativo: true,
        vazio: null
      });

      sanitizarEntrada(req, res, next);

      expect(req.body.seguidores).toBe(100);
      expect(req.body.seguindo).toBe(50);
      expect(req.body.ativo).toBe(true);
      expect(req.body.vazio).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Exportação do módulo', () => {
    it('deve exportar uma função', () => {
      expect(typeof sanitizarEntrada).toBe('function');
    });
  });
});
