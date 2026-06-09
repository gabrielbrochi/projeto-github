import { createContext, useState, useEffect } from 'react'
import { login as apiLogin } from '../services/api.js'

export const AuthContext = createContext()

/**
 * Decodifica o payload de um token JWT (base64url).
 * Retorna o objeto do payload ou null se falhar.
 */
function decodificarToken(token) {
  try {
    const partes = token.split('.')
    if (partes.length !== 3) return null

    const payload = partes[1]
    // Substituir caracteres base64url por base64 padrão
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonStr = atob(base64)
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

/**
 * Verifica se um token JWT está expirado.
 * Retorna true se expirado ou se não possui campo exp.
 */
function tokenExpirado(dadosToken) {
  if (!dadosToken || !dadosToken.exp) return true
  const agora = Math.floor(Date.now() / 1000)
  return dadosToken.exp <= agora
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [autenticado, setAutenticado] = useState(false)

  // Ao montar, verifica se há token válido no localStorage
  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token')

    if (tokenSalvo) {
      const dados = decodificarToken(tokenSalvo)

      if (dados && !tokenExpirado(dados)) {
        setToken(tokenSalvo)
        setUsuario({ id: dados.id, login: dados.login })
        setAutenticado(true)
      } else {
        // Token inválido ou expirado: limpar
        localStorage.removeItem('token')
      }
    }
  }, [])

  /**
   * Realiza login chamando a API do backend.
   * Armazena token no localStorage e atualiza estado.
   * @param {string} login - Login do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<void>}
   * @throws {Error} Se as credenciais forem inválidas
   */
  async function realizarLogin(login, senha) {
    const resposta = await apiLogin(login, senha)

    const novoToken = resposta.token
    const dadosUsuario = resposta.usuario

    localStorage.setItem('token', novoToken)
    setToken(novoToken)
    setUsuario(dadosUsuario)
    setAutenticado(true)
  }

  /**
   * Realiza logout: remove token do localStorage e limpa estado.
   */
  function realizarLogout() {
    localStorage.removeItem('token')
    setToken(null)
    setUsuario(null)
    setAutenticado(false)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        autenticado,
        realizarLogin,
        realizarLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
