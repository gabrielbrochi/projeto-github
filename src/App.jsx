import { useRef, useContext } from 'react';
import { Container, Form, Button, Alert, Spinner, Navbar } from 'react-bootstrap';
import { GithubContext, GithubProvider } from './contexts/GithubContext';
import { ProfileCard } from './components/ProfileCard';
import 'bootstrap/dist/css/bootstrap.min.css';

function MainApp() {
    const inputRef = useRef(null);
    const { erro, setErro, setPerfil, setRepositorios, carregando, setCarregando } = useContext(GithubContext);

    const limparBusca = () => {
        setPerfil(null);
        setRepositorios([]);
        setErro('');
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    };

    const pesquisarUsuario = async (evento) => {
        evento.preventDefault();
        setErro('');
        setPerfil(null);
        setRepositorios([]);

        const usuarioBuscado = inputRef.current.value.trim();

        if (!usuarioBuscado) {
            setErro('Por favor, digite um nome de usuário para buscar.');
            inputRef.current.focus();
            return;
        }

        setCarregando(true);

        try {
            const urlPerfil = `https://api.github.com/users/${usuarioBuscado}`;
            const respostaPerfil = await fetch(urlPerfil);

            if (!respostaPerfil.ok) {
                throw new Error('Não encontramos nenhum usuário com esse nome.');
            }

            const dadosPerfil = await respostaPerfil.json();

            const urlRepos = `https://api.github.com/users/${usuarioBuscado}/repos?sort=updated&per_page=5`;
            const respostaRepos = await fetch(urlRepos);
            const dadosRepos = await respostaRepos.json();

            setPerfil(dadosPerfil);
            setRepositorios(dadosRepos);

        } catch (err) {
            setErro(err.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar bg="dark" variant="dark" className="shadow-sm mb-5 p-3">
                <Container>
                    <Navbar.Brand href="#" className="fw-bold d-flex align-items-center gap-2">
                        Explorador GitHub
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <Container style={{ maxWidth: '550px' }}>
                <Form onSubmit={pesquisarUsuario} className="p-4 bg-white rounded shadow-sm border-0" style={{ borderRadius: '15px' }}>
                    <Form.Group className="mb-4">
                        <Form.Label className="text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Buscar desenvolvedor</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Digite o @ (ex: watinha)"
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
                                'Buscar Perfil'
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

                {erro && <Alert variant="danger" className="mt-4 text-center rounded-pill shadow-sm">{erro}</Alert>}

                <ProfileCard />
            </Container>
        </div>
    );
}

export default function App() {
    return (
        <GithubProvider>
            <MainApp />
        </GithubProvider>
    );
}