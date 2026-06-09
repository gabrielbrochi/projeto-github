import { createContext, useState } from 'react'
import { buscarPerfis, inserirPerfil } from '../services/api.js'

export const GithubContext = createContext()

export const GithubProvider = ({ children }) => {
  const [perfisBuscados, setPerfisBuscados] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  async function pesquisarPerfis(termo) {
    setCarregando(true)
    setErro('')
    setMensagemSucesso('')

    try {
      const dados = await buscarPerfis(termo)
      setPerfisBuscados(dados.perfis || [])
      if (dados.mensagem) {
        setMensagemSucesso(dados.mensagem)
      }
    } catch (error) {
      setErro(error.message || 'Erro ao buscar perfis')
      setPerfisBuscados([])
    } finally {
      setCarregando(false)
    }
  }

  async function inserirNovoPerfil(perfil, repositorios) {
    setCarregando(true)
    setErro('')
    setMensagemSucesso('')

    try {
      await inserirPerfil(perfil, repositorios)
      setMensagemSucesso('Perfil inserido com sucesso!')
      setErro('')
    } catch (error) {
      setErro(error.message || 'Erro ao inserir perfil')
      throw error
    } finally {
      setCarregando(false)
    }
  }

  return (
    <GithubContext.Provider
      value={{
        perfisBuscados,
        setPerfisBuscados,
        erro,
        setErro,
        carregando,
        setCarregando,
        mensagemSucesso,
        setMensagemSucesso,
        pesquisarPerfis,
        inserirNovoPerfil
      }}
    >
      {children}
    </GithubContext.Provider>
  )
}
