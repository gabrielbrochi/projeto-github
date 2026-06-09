import { useRef, useContext, useState } from 'react'
import { Container, Form, Button, Alert, Spinner, Navbar, Nav, Tab } from 'react-bootstrap'
import { AuthProvider, AuthContext } from './contexts/AuthContext'
import { GithubProvider, GithubContext } from './contexts/GithubContext'
import { ProfileCard } from './components/ProfileCard'
import FormularioInsercao from './components/FormularioInsercao'
import TelaLogin from './components/TelaLogin'
import 'bootstrap/dist/css/bootstrap.min.css'

/**
 * Componente raiz - envolve tudo com os Providers de autenticação e dados.
 */
export default function App() {
  return (
    <AuthProvider>
      <GithubProvider>
        <ConteudoApp />
      </GithubProvider>
    </AuthProvider>
  )
}

/**
 * Decide qual tela renderizar com base no estado de autenticação.
 */
function ConteudoApp() {
  const { autenticado } = useContext(AuthContext)

  if (!autenticado) {
    return <TelaLogin />
  }

  return <TelaPrincipal />
}

/**
 * Tela principal com busca de perfis, exibição de resultados e inserção.
 * Usa abas (Tab) para separar "Buscar" e "Inserir".
 */
function TelaPrincipal() {
  const { usuario, realizarLogout } = useContext(AuthContext)
  const {
    perfisBuscados,
    setPerfisBuscados,
    erro,
    setErro,
    carregando,
    mensagemSucesso,
    setMensagemSucesso,
    pesquisarPerfis
  } = useContext(GithubContext)

  const inputRef = useRef(null)
  const [abaAtiva, setAbaAtiva] = useState('buscar')

  // Limpa mensagem de sucesso ao trocar de aba
  const handleTrocarAba = (novaAba) => {
    setMensagemSucesso('')
    setAbaAtiva(novaAba)
  }

  // Executa busca de perfis pelo termo digitado
  const handleBuscar = async (evento) => {
    evento.preventDefault()

    const termo = inputRef.current.value.trim()

    if (!termo) {
      setErro('Por favor, digite um termo para buscar.')
      inputRef.current.focus()
      return
    }

    await pesquisarPerfis(termo)
  }

  // Limpa resultados e campo de busca
  const limparBusca = () => {
    setPerfisBuscados([])
    setErro('')
    setMensagemSucesso('')
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar bg="dark" variant="dark" className="shadow-sm mb-4 p-3">
        <Container>
          <Navbar.Brand href="#" className="fw-bold d-flex align-items-center gap-2">
            Explorador GitHub
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center gap-3">
            <Navbar.Text className="text-light">
              {usuario?.login}
            </Navbar.Text>
            <Button
              variant="outline-light"
              size="sm"
              className="rounded-pill px-3"
              onClick={realizarLogout}
            >
              Sair
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container style={{ maxWidth: '650px' }}>
        <Tab.Container activeKey={abaAtiva} onSelect={handleTrocarAba}>
          <Nav variant="pills" className="mb-4 justify-content-center gap-2">
            <Nav.Item>
              <Nav.Link eventKey="buscar" className="rounded-pill px-4">
                Buscar
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="inserir" className="rounded-pill px-4">
                Inserir
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="buscar">
              <Form onSubmit={handleBuscar} className="p-4 bg-white rounded shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.9rem' }}>
                    Buscar perfil no banco
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Digite o login (ex: watinha)"
                    ref={inputRef}
                    disabled={carregando}
                    className="p-2 bg-light border-0"
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 p-2 fw-bold rounded-pill shadow-sm"
                    disabled={carregando}
                  >
                    {carregando ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Buscando...
                      </>
                    ) : (
                      'Buscar'
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    type="button"
                    className="w-100 p-2 fw-bold rounded-pill shadow-sm"
                    onClick={limparBusca}
                    disabled={carregando}
                  >
                    Limpar
                  </Button>
                </div>
              </Form>

              {erro && (
                <Alert variant="danger" className="mt-4 text-center rounded-pill shadow-sm">
                  {erro}
                </Alert>
              )}

              {mensagemSucesso && (
                <Alert variant="info" className="mt-4 text-center shadow-sm">
                  {mensagemSucesso}
                </Alert>
              )}

              {perfisBuscados.map((p) => (
                <ProfileCard key={p.id} perfil={p} />
              ))}
            </Tab.Pane>

            <Tab.Pane eventKey="inserir">
              <FormularioInsercao />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </div>
  )
}
