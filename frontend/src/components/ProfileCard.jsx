import { useContext } from 'react';
import { Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { GithubContext } from '../contexts/GithubContext';

export function ProfileCard() {
    const { perfil, repositorios } = useContext(GithubContext);

    if (!perfil) return null;

    const dataFormatada = new Date(perfil.created_at).toLocaleDateString('pt-BR');

    return (
        <Card className="shadow mt-4 border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="text-center bg-white border-0 pt-4" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                <Card.Img
                    variant="top"
                    src={perfil.avatar_url}
                    alt="Foto do perfil"
                    className="shadow-sm"
                    style={{ width: '130px', borderRadius: '50%', marginBottom: '15px', border: '4px solid #f8f9fa' }}
                />
                <Card.Title className="fs-3 fw-bold">{perfil.name || perfil.login}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{perfil.bio}</Card.Subtitle>

                <div className="mt-2 text-secondary" style={{ fontSize: '0.9rem' }}>
                    Membro desde: <strong>{dataFormatada}</strong>
                </div>
            </Card.Header>

            <Card.Body>
                <div className="d-flex justify-content-center gap-2 mb-4 mt-2 flex-wrap">
                    <Badge bg="primary" className="p-2 shadow-sm rounded-pill px-3">Seguidores: {perfil.followers}</Badge>
                    <Badge bg="secondary" className="p-2 shadow-sm rounded-pill px-3">Seguindo: {perfil.following}</Badge>
                    <Badge bg="dark" className="p-2 shadow-sm rounded-pill px-3">Repositórios: {perfil.public_repos}</Badge>
                </div>

                <h6 className="text-uppercase text-muted fw-bold mb-3 mt-4" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                    Últimos Repositórios
                </h6>

                <ListGroup variant="flush" className="border rounded shadow-sm">
                    {repositorios.length > 0 ? (
                        repositorios.map(repo => (
                            <ListGroup.Item key={repo.id} className="d-flex justify-content-between align-items-center p-3">
                                <div className="ms-2 me-auto">
                                    <div className="fw-bold text-dark">{repo.name}</div>
                                    <small className="text-muted">{repo.language || 'Sem linguagem definida'}</small>
                                </div>
                                <Button variant="outline-dark" size="sm" href={repo.html_url} target="_blank" className="rounded-pill px-3">
                                    Ver código
                                </Button>
                            </ListGroup.Item>
                        ))
                    ) : (
                        <ListGroup.Item className="text-center text-muted p-3">
                            Nenhum repositório público encontrado.
                        </ListGroup.Item>
                    )}
                </ListGroup>
            </Card.Body>

            <Card.Footer className="text-center bg-white border-0 pb-4 mt-2" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                <Button variant="dark" href={perfil.html_url} target="_blank" className="w-100 py-2 fw-bold shadow-sm rounded-pill">
                    Acessar Perfil Completo
                </Button>
            </Card.Footer>
        </Card>
    );
}