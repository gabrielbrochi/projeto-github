-- Script DDL para criação das tabelas do Explorador GitHub
-- Banco de dados: github_explorer (PostgreSQL)

-- Tabela de usuários do sistema (autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de perfis do GitHub armazenados localmente
CREATE TABLE IF NOT EXISTS perfis_github (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    avatar_url TEXT NOT NULL,
    bio TEXT,
    seguidores INTEGER NOT NULL DEFAULT 0,
    seguindo INTEGER NOT NULL DEFAULT 0,
    repositorios_publicos INTEGER NOT NULL DEFAULT 0,
    criado_em_github TIMESTAMP NOT NULL,
    inserido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inserido_por INTEGER REFERENCES usuarios(id)
);

-- Tabela de repositórios associados aos perfis
CREATE TABLE IF NOT EXISTS repositorios (
    id SERIAL PRIMARY KEY,
    perfil_id INTEGER NOT NULL REFERENCES perfis_github(id) ON DELETE CASCADE,
    nome VARCHAR(200) NOT NULL,
    linguagem VARCHAR(50),
    url TEXT NOT NULL
);

-- Índices para performance de consultas
CREATE INDEX IF NOT EXISTS idx_perfis_login ON perfis_github(login);
CREATE INDEX IF NOT EXISTS idx_repositorios_perfil ON repositorios(perfil_id);

-- Usuário pré-cadastrado (login: admin, senha: admin123)
INSERT INTO usuarios (login, senha_hash)
VALUES ('admin', '$2b$10$zZW28pBSjvdVda/2MBU7b.6dSiQJXzN16xX3ravoc6pcJydZxOwU6')
ON CONFLICT (login) DO NOTHING;
