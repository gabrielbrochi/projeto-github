import { createContext, useState, useEffect } from 'react'
import { login as apiLogin } from '../services/api.js'

export const AuthContext = createContext()

function decodificarToken(token) {
  try {
    const partes = token.split('.')
    if (partes.length !== 3) return null

    const payload = partes[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonStr = atob(base64)
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

function tokenExpirado(dadosToken) {
  if (!dadosToken || !dadosToken.exp) return true
  const agora = Math.floor(Date.now() / 1000)
  return dadosToken.exp <= agora
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token')

    if (tokenSalvo) {
      const dados = decodificarToken(tokenSalvo)

      if (dados && !tokenExpirado(dados)) {
        setToken(tokenSalvo)
        setUsuario({ id: dados.id, login: dados.login })
        setAutenticado(true)
      } else {
        localStorage.removeItem('token')
      }
    }
  }, [])

  async function realizarLogin(login, senha) {
    const resposta = await apiLogin(login, senha)

    const novoToken = resposta.token
    const dadosUsuario = resposta.usuario

    localStorage.setItem('token', novoToken)
    setToken(novoToken)
    setUsuario(dadosUsuario)
    setAutenticado(true)
  }

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
