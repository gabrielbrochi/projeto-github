import { useState, useContext } from 'react'
import { Form, Button, Alert, Row, Col, Card } from 'react-bootstrap'
import { GithubContext } from '../contexts/GithubContext'

const perfilInicial = {
  login: '',
  nome: '',
  avatar_url: '',
  bio: '',
  seguidores: 0,
  seguindo: 0,
  repositorios_publicos: 0,
  criado_em_github: ''
}

const repositorioVazio = { nome: '', linguagem: '', url: '' }

export default function FormularioInsercao() {
  const { inserirNovoPerfil, erro, mensagemSucesso, carregando } = useContext(GithubContext)

  const [perfil, setPerfil] = useState({ ...perfilInicial })
  const [repositorios, setRepositorios] = useState([{ ...repositorioVazio }])
  const [errosValidacao, setErrosValidacao] = useState({})

  // Atualiza campo do perfil
  const atualizarPerfil = (campo, valor) => {
    setPerfil(anterior => ({ ...anterior, [campo]: valor }))
    // Limpa erro de validação do campo ao digitar
    if (errosValidacao[campo]) {
      setErrosValidacao(anterior => {
        const novo = { ...anterior }
        delete novo[campo]
        return novo
      })
    }
  }

  // Atualiza campo de um repositório específico
  const atualizarRepositorio = (indice, campo, valor) => {
    setRepositorios(anterior =>
      anterior.map((repo, i) => (i === indice ? { ...repo, [campo]: valor } : repo))
    )
    // Limpa erro de validação do repositório ao digitar
    const chaveErro = `repositorios[${indice}].${campo}`
    if (errosValidacao[chaveErro]) {
      setErrosValidacao(anterior => {
        const novo = { ...anterior }
        delete novo[chaveErro]
        return novo
      })
    }
  }

  // Adiciona novo repositório vazio
  const adicionarRepositorio = () => {
    setRepositorios(anterior => [...anterior, { ...repositorioVazio }])
  }

  // Remove repositório pelo índice (mínimo 1)
  const removerRepositorio = (indice) => {
    if (repositorios.length <= 1) return
    setRepositorios(anterior => anterior.filter((_, i) => i !== indice))
  }

  // Limpa o formulário após sucesso
  const limparFormulario = () => {
    setPerfil({ ...perfilInicial })
    setRepositorios([{ ...repositorioVazio }])
    setErrosValidacao({})
  }

  // Submete o formulário
  const handleSubmit = async (evento) => {
    evento.preventDefault()
    setErrosValidacao({})

    // Monta objeto do perfil com tipos corretos
    const dadosPerfil = {
      login: perfil.login.trim(),
      nome: perfil.nome.trim(),
      avatar_url: perfil.avatar_url.trim(),
      bio: perfil.bio.trim(),
      seguidores: Number(perfil.seguidores),
      seguindo: Number(perfil.seguindo),
      repositorios_publicos: Number(perfil.repositorios_publicos),
      criado_em_github: perfil.criado_em_github
    }

    // Monta array de repositórios
    const dadosRepositorios = repositorios.map(repo => ({
      nome: repo.nome.trim(),
      linguagem: repo.linguagem.trim(),
      url: repo.url.trim()
    }))

    try {
      await inserirNovoPerfil(dadosPerfil, dadosRepositorios)
      limparFormulario()
    } catch (error) {
      // Se o erro contém campos de validação, exibe nos campos
      if (error && error.campos) {
        setErrosValidacao(error.campos)
      }
    }
  }

  return (
    <Card className="shadow-sm mt-4 border-0 bg-white" style={{ borderRadius: '15px' }}>
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4 text-center">Inserir Novo Perfil</h5>

        {erro && (
          <Alert variant="danger" className="text-center shadow-sm">
            {erro}
          </Alert>
        )}

        {mensagemSucesso && (
          <Alert variant="success" className="text-center shadow-sm">
            {mensagemSucesso}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Seção: Dados do Perfil */}
          <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
            Dados do Perfil
          </h6>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}>Login</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: octocat"
                  value={perfil.login}
                  onChange={(e) => atualizarPerfil('login', e.target.value)}
                  isInvalid={!!errosValidacao.login}
                  className="bg-light border-0"
                />
                <Form.Control.Feedback type="invalid">
                  {errosValidacao.login}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}>Nome</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: The Octocat"
                  value={perfil.nome}
                  onChange={(e) => atualizarPerfil('nome', e.target.value)}
                  isInvalid={!!errosValidacao.nome}
                  className="bg-light border-0"
                />
                <Form.Control.Feedback type="invalid">
                  {errosValidacao.nome}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}>Avatar URL</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://avatars.githubusercontent.com/u/..."
                  value={perfil.avatar_url}
                  onChange={(e) => atualizarPerfil('avatar_url', e.target.value)}
                  isInvalid={!!errosValidacao.avatar_url}
                  className="bg-light border-0"
                />
                <Form.Control.Feedback type="invalid">
                  {errosValidacao.avatar_url}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Descrição do perfil (opcional)"
                  value={perfil.bio}
                  onChange={(e) => atualizarPerfil('bio', e.target.value)}
                  isInvalid={!!errosValidacao.bio}
                  className="bg-light border-0"
                />
                <Form.Control.Feedback type="invalid">
                  {errosValidacao.bio}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}>Seguidores</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={perfil.seguidores}
                  onChange={(e) => atualizarPerfil('seguidores', e.target.value)}
                  isInvalid={!!errosValidacao.seguidores}
                  className="bg-light border-0"
                />
                <Form.Control.Feedback type="invalid">
                  {errosValidacao.seguidores}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}>Seguindo</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={perfil.seguindo}
                  onChange={(e) => atualizarPerfil('seguindo', e.target.value)}
                  isInvalid={!!errosValidacao.seguindo}
                  className="bg-light border-0"
                />
                <Form.Control.Feedback type="invalid">
                  {errosValidacao.seguindo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}>Repos Públicos</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={perfil.repositorios_publicos}
                  onChange={(e) => atualizarPerfil('repositorios_publicos', e.target.value)}
                  isInvalid={!!errosValidacao.repositorios_publicos}
                  className="bg-light border-0"
                />
                <Form.Control.Feedback type="invalid">
                  {errosValidacao.repositorios_publicos}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.85rem' }}>Criado em (GitHub)</Form.Label>
                <Form.Control
                  type="date"
                  value={perfil.criado_em_github}
                  onChange={(e) => atualizarPerfil('criado_em_github', e.target.value)}
                  isInvalid={!!errosValidacao.criado_em_github}
                  className="bg-light border-0"
                />
                <Form.Control.Feedback type="invalid">
                  {errosValidacao.criado_em_github}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Seção: Repositórios */}
          <h6 className="text-uppercase text-muted fw-bold mb-3 mt-4" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
            Repositórios
          </h6>

          {repositorios.map((repo, indice) => (
            <Card key={indice} className="mb-3 border bg-light" style={{ borderRadius: '10px' }}>
              <Card.Body className="p-3">
                <Row className="mb-2">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="text-muted" style={{ fontSize: '0.8rem' }}>Nome</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ex: Hello-World"
                        value={repo.nome}
                        onChange={(e) => atualizarRepositorio(indice, 'nome', e.target.value)}
                        isInvalid={!!errosValidacao[`repositorios[${indice}].nome`]}
                        size="sm"
                        className="border-0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errosValidacao[`repositorios[${indice}].nome`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="text-muted" style={{ fontSize: '0.8rem' }}>Linguagem</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ex: JavaScript"
                        value={repo.linguagem}
                        onChange={(e) => atualizarRepositorio(indice, 'linguagem', e.target.value)}
                        isInvalid={!!errosValidacao[`repositorios[${indice}].linguagem`]}
                        size="sm"
                        className="border-0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errosValidacao[`repositorios[${indice}].linguagem`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="text-muted" style={{ fontSize: '0.8rem' }}>URL</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://github.com/..."
                        value={repo.url}
                        onChange={(e) => atualizarRepositorio(indice, 'url', e.target.value)}
                        isInvalid={!!errosValidacao[`repositorios[${indice}].url`]}
                        size="sm"
                        className="border-0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errosValidacao[`repositorios[${indice}].url`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                {repositorios.length > 1 && (
                  <div className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="rounded-pill px-3"
                      onClick={() => removerRepositorio(indice)}
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}

          <div className="mb-4">
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill px-3"
              onClick={adicionarRepositorio}
              type="button"
            >
              + Adicionar Repositório
            </Button>
          </div>

          {/* Botão de submissão */}
          <Button
            variant="dark"
            type="submit"
            className="w-100 py-2 fw-bold shadow-sm rounded-pill"
            disabled={carregando}
          >
            {carregando ? 'Inserindo...' : 'Inserir Perfil'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
