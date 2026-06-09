# Explorador GitHub - Projeto 2

Aplicação web fullstack (3 camadas) para busca e inserção de perfis GitHub.

## Pré-requisitos

- Node.js 20+
- PostgreSQL
- Redis

## Configuração do Banco de Dados

```bash
createdb github_explorer
psql -d github_explorer -f backend/src/config/initDB.sql
```

## Iniciar Redis

```bash
redis-server
```

## Backend

```bash
cd backend
npm install
npm start
```

Roda na porta 3001.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Roda na porta 5173. Para build de produção (compressão de arquivos estáticos):

```bash
npm run build
```

## Credenciais

- Login: `admin`
- Senha: `admin123`

## Testar os Requisitos

1. Acesse `http://localhost:5173`
2. **Login**: faça login com as credenciais acima
3. **Busca**: na aba "Buscar", pesquise por um login de perfil cadastrado
4. **Inserção**: na aba "Inserir", preencha os dados e submeta

## Estrutura do Projeto

```
├── frontend/                   # React.js (SPA)
│   └── src/
│       ├── components/         # TelaLogin, ProfileCard, FormularioInsercao
│       ├── contexts/           # AuthContext, GithubContext
│       └── services/           # api.js (comunicação HTTP)
├── backend/                    # Express.js (API RESTful)
│   └── src/
│       ├── routes/             # authRoutes.js, perfisRoutes.js (com controladores inline)
│       ├── models/             # usuarioModel.js, perfilModel.js, repositorioModel.js
│       └── config/             # banco.js, cache.js, logger.js, sanitizacao.js, etc.
└── README.md
```

## Critérios de Avaliação Atendidos

### Requisitos Funcionais (Frontend + Backend)

| Requisito | Frontend | Backend |
|-----------|----------|---------|
| Login | `TelaLogin.jsx` + `AuthContext.jsx` | `src/routes/authRoutes.js` |
| Busca | Aba "Buscar" em `App.jsx` | `src/routes/perfisRoutes.js` (GET /api/perfis) |
| Inserção | `FormularioInsercao.jsx` | `src/routes/perfisRoutes.js` (POST /api/perfis) |

### Validação no Servidor

- **Verificação de preenchimento**: Validação manual em `perfisRoutes.js` (função `validarPerfil`)
- **Mensagens de validação**: Retorna HTTP 400 com campo `campos` indicando cada erro específico

### Padrão REST

| Método | Rota | Função |
|--------|------|--------|
| POST | /api/auth/login | Autenticação |
| GET | /api/perfis?busca=X | Busca |
| POST | /api/perfis | Inserção |

### Segurança

| Categoria | Implementação | Arquivo |
|-----------|---------------|---------|
| Criptografia de senhas | bcrypt (hash + salt) | `src/routes/authRoutes.js` |
| HTTPS headers | Headers manuais (X-Content-Type-Options, X-Frame-Options, HSTS) | `src/app.js` |
| Injeção SQL | Consultas parametrizadas ($1, $2...) | `src/models/*.js` |
| Sanitização/XSS | perfect-express-sanitizer + xss | `src/config/sanitizacao.js` |
| Ataques automatizados | express-rate-limit (5 tentativas/min) | `src/config/rateLimiter.js` |
| Tokens JWT | Expiração 1h, validação em rotas protegidas | `src/config/autenticacao.js` |
| Logs de segurança | express-winston + morgan (erros de auth, buscas, inserções) | `src/config/logger.js` → `logs/` |

### Otimização

| Otimização | Implementação |
|------------|---------------|
| Compressão de arquivos estáticos | Vite build (minificação JS/CSS) |
| Compressão de respostas | Headers de cache + proxy/deploy layer |
| Cache no Backend | Redis (TTL 5 min) | `src/config/cache.js` |
| Pool de conexões | pg.Pool (min: 2, max: 10) | `src/config/banco.js` |

## Bibliotecas Utilizadas

**Backend**: express, cors, jsonwebtoken, bcrypt, express-rate-limit, perfect-express-sanitizer, xss, express-winston, morgan, winston, pg, redis, dotenv

**Frontend**: react, react-dom, react-bootstrap, bootstrap (mesmas do Projeto 1)
