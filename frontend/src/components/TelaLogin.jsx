import { useState, useContext } from 'react'
import { Container, Form, Button, Alert, Spinner, Navbar } from 'react-bootstrap'
import { AuthContext } from '../contexts/AuthContext'

/**
 * Componente de tela de login.
 * Exibe formulário com campos login e senha.
 * Ao submeter, chama realizarLogin() do AuthContext.
 * Se falhar, exibe mensagem de erro do servidor.
 * Se bem-sucedido, o App.jsx redireciona automaticamente com base no estado autenticado.
 */
export default function TelaLogin() {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { realizarLogin } = useContext(AuthContext)

  const handleSubmit = async (evento) => {
    evento.preventDefault()
    setErro('')

    if (!login.trim() || !senha.trim()) {
      setErro('Por favor, preencha login e senha.')
      return
    }

    setCarregando(true)

    try {
      await realizarLogin(login.trim(), senha)
      // Login bem-sucedido: o AuthContext atualiza o estado 'autenticado'
      // e o App.jsx renderiza a tela principal automaticamente
    } catch (err) {
      setErro(err.message || 'Erro ao realizar login. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar bg="dark" variant="dark" className="shadow-sm mb-5 p-3">
        <Container>
          <Navbar.Brand href="#" className="fw-bold d-flex align-items-center gap-2">
            Explorador GitHub
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container style={{ maxWidth: '450px' }}>
        <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-sm border-0" style={{ borderRadius: '15px' }}>
          <h4 className="text-center mb-4 text-muted">Entrar</h4>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Login</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite seu login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={carregando}
              className="p-2 bg-light border-0"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Senha</Form.Label>
            <Form.Control
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
              className="p-2 bg-light border-0"
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 p-2 fw-bold rounded-pill shadow-sm"
            disabled={carregando}
          >
            {carregando ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </Form>

        {erro && (
          <Alert variant="danger" className="mt-4 text-center rounded-pill shadow-sm">
            {erro}
          </Alert>
        )}
      </Container>
    </div>
  )
}
