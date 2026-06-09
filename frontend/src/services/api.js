// Módulo de serviço API - comunicação com o backend
const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Obtém o token JWT armazenado no localStorage
 */
function obterToken() {
  return localStorage.getItem('token')
}

/**
 * Trata erros de resposta da API de forma centralizada.
 * - 401: limpa o token e redireciona para login
 * - Outros erros: lança erro com mensagem do servidor
 */
async function tratarResposta(resposta) {
  if (resposta.ok) {
    return resposta.json()
  }

  if (resposta.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  // Tenta extrair mensagem de erro do servidor
  let mensagemErro = 'Erro ao comunicar com o servidor'
  let campos = null
  try {
    const dados = await resposta.json()
    mensagemErro = dados.erro || dados.mensagem || mensagemErro
    if (dados.campos) {
      campos = dados.campos
    }
  } catch {
    // Se não conseguir parsear JSON, usa mensagem padrão
  }

  const erro = new Error(mensagemErro)
  if (campos) {
    erro.campos = campos
  }
  throw erro
}

/**
 * Realiza login do usuário.
 * NÃO inclui header de autorização (está obtendo o token).
 * @param {string} login - Login do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<{token: string, usuario: {id: number, login: string}}>}
 */
export async function login(login, senha) {
  const resposta = await fetch(`${URL_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ login, senha })
  })

  return tratarResposta(resposta)
}

/**
 * Busca perfis GitHub no banco de dados do backend.
 * Inclui token JWT no header Authorization.
 * @param {string} termo - Termo de busca (login do perfil)
 * @returns {Promise<{perfis: Array, mensagem: string}>}
 */
export async function buscarPerfis(termo) {
  const token = obterToken()

  const resposta = await fetch(`${URL_BASE}/api/perfis?busca=${encodeURIComponent(termo)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  return tratarResposta(resposta)
}

/**
 * Insere um novo perfil GitHub com seus repositórios no banco de dados.
 * Inclui token JWT no header Authorization.
 * @param {object} perfil - Dados do perfil GitHub
 * @param {Array} repositorios - Lista de repositórios do perfil
 * @returns {Promise<{perfil: object, repositorios: Array}>}
 */
export async function inserirPerfil(perfil, repositorios) {
  const token = obterToken()

  const resposta = await fetch(`${URL_BASE}/api/perfis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ perfil, repositorios })
  })

  return tratarResposta(resposta)
}
