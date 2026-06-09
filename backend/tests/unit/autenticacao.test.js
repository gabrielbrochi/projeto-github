// Testes unitários do middleware de autenticação JWT
const jwt = require('jsonwebtoken');
const autenticacao = require('../../src/middlewares/autenticacao');

// Segredo para testes
const SEGREDO_TESTE = 'chave_secreta_jwt_256bits';

// Helpers para criar objetos mock de req/res/next
function criarReqMock(cabecalhoAutorizacao) {
  return {
    headers: {
      authorization: cabecalhoAutorizacao
    }
  };
}

function criarResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Middleware de Autenticação JWT', () => {
  const segredoOriginal = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = SEGREDO_TESTE;
  });

  afterAll(() => {
    process.env.JWT_SECRET = segredoOriginal;
  });

  it('deve retornar 401 quando o header Authorization está ausente', () => {
    const req = { headers: {} };
    const res = criarResMock();
    const next = jest.fn();

    autenticacao(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Token de autenticação inválido ou ausente'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o header não começa com "Bearer "', () => {
    const req = criarReqMock('Basic abc123');
    const res = criarResMock();
    const next = jest.fn();

    autenticacao(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Token de autenticação inválido ou ausente'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o token é inválido', () => {
    const req = criarReqMock('Bearer token_invalido_qualquer');
    const res = criarResMock();
    const next = jest.fn();

    autenticacao(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Token de autenticação inválido ou ausente'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o token está expirado', () => {
    const tokenExpirado = jwt.sign(
      { id: 1, login: 'admin' },
      SEGREDO_TESTE,
      { expiresIn: '0s' }
    );

    // Pequeno delay para garantir expiração
    const req = criarReqMock(`Bearer ${tokenExpirado}`);
    const res = criarResMock();
    const next = jest.fn();

    // Avançar tempo para garantir expiração
    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    autenticacao(req, res, next);

    jest.useRealTimers();

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Token de autenticação inválido ou ausente'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o token foi assinado com outro segredo', () => {
    const tokenOutroSegredo = jwt.sign(
      { id: 1, login: 'admin' },
      'segredo_diferente',
      { expiresIn: '1h' }
    );

    const req = criarReqMock(`Bearer ${tokenOutroSegredo}`);
    const res = criarResMock();
    const next = jest.fn();

    autenticacao(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Token de autenticação inválido ou ausente'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() e anexar dados a req.usuario quando o token é válido', () => {
    const payload = { id: 1, login: 'admin' };
    const tokenValido = jwt.sign(payload, SEGREDO_TESTE, { expiresIn: '1h' });

    const req = criarReqMock(`Bearer ${tokenValido}`);
    const res = criarResMock();
    const next = jest.fn();

    autenticacao(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.usuario).toBeDefined();
    expect(req.usuario.id).toBe(1);
    expect(req.usuario.login).toBe('admin');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o header Authorization é undefined', () => {
    const req = { headers: { authorization: undefined } };
    const res = criarResMock();
    const next = jest.fn();

    autenticacao(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o token é apenas "Bearer " sem valor', () => {
    const req = criarReqMock('Bearer ');
    const res = criarResMock();
    const next = jest.fn();

    autenticacao(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Token de autenticação inválido ou ausente'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
