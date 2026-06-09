const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function obterToken() {
  return localStorage.getItem('token')
}

async function tratarResposta(resposta) {
  if (resposta.ok) {
    return resposta.json()
  }

  if (resposta.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  let mensagemErro = 'Erro ao comunicar com o servidor'
  let campos = null
  try {
    const dados = await resposta.json()
    mensagemErro = dados.erro || dados.mensagem || mensagemErro
    if (dados.campos) {
      campos = dados.campos
    }
  } catch {
  }

  const erro = new Error(mensagemErro)
  if (campos) {
    erro.campos = campos
  }
  throw erro
}

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
