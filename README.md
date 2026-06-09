# Explorador GitHub - Projeto 2

Aplicação web fullstack (3 camadas) para busca e inserção de perfis GitHub.

## Pré-requisitos

- Node.js 20+
- PostgreSQL
- Redis

## Configuração Inicial (uma vez só)

```bash
# Definir senha 'postgres' para o usuário postgres (padrão do projeto)
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Criar o banco
createdb -U postgres github_explorer

# Criar as tabelas e usuário admin
psql -U postgres -d github_explorer -f backend/src/config/initDB.sql
```

## Executar

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## Login

- Acesse: `http://localhost:5173`
- Login: `admin`
- Senha: `admin123`
