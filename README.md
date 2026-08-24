# BizConnect

Plataforma de networking para empresários — protótipo completo com **frontend interativo** e **API REST em Node.js**.

Baseado no Documento de Projeto v1.0 e Adendo de Diferenciais v1.1 (Matchmaking, Sala Segura/NDA, BizPoints, Clube de Decisores).

## Estrutura

```
bizconnect/
├── frontend/          # Interface (HTML + CSS + JS)
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── backend/           # API REST (Node.js puro, sem npm install)
│   ├── src/server.js
│   ├── src/db/seed.js
│   └── package.json
└── docs/              # Documentação extra
```

## Como rodar

### 1. Backend (terminal)

```bash
cd backend
node src/db/seed.js    # popula dados demo
node src/server.js     # http://localhost:3001
```

**Login demo**
- E-mail: `carlos.silva@empresa.com.br`
- Senha: `123456`

### 2. Frontend

Abra `frontend/index.html` no navegador  
(ou sirva com qualquer server estático, ex.: `npx serve frontend`).

> Hoje o frontend ainda usa estado local (localStorage). A integração completa com a API (`fetch` + JWT) é o próximo passo.

## API (resumo)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/register` | Cadastro |
| GET | `/api/posts` | Feed |
| POST | `/api/posts` | Publicar |
| GET/POST | `/api/messages/conversations` | Chat |
| POST | `/api/messages/conversations/:id/secure` | Sala Segura / NDA |
| GET | `/api/matchmaking/matches` | Matches |
| GET/POST | `/api/indications` | Indicações / BizPoints |
| GET/POST | `/api/connections/:id` | Conexões |
| GET | `/api/notifications` | Notificações |
| GET/POST | `/api/opportunities` | Oportunidades |

Header: `Authorization: Bearer <token>`

## Diferenciais do produto

1. **Matchmaking por oportunidade** — buscando × oferecendo + score  
2. **Sala Segura + NDA** — modo confidencial no chat  
3. **BizPoints** — reputação por indicações que viram negócio  
4. **Clube de Decisores** — níveis Básico → Verificado → Premium  

## Stack sugerida (produção)

- Frontend: Next.js + TypeScript + Tailwind  
- Backend: NestJS ou FastAPI  
- Banco: PostgreSQL + Redis  
- Realtime: Socket.io / WebSockets  
- Assinatura: Clicksign / DocuSign  

## Licença

Projeto de demonstração / portfólio.


## Deploy no Render (backend)

1. Suba este repositório no GitHub.
2. Em [render.com](https://render.com) → **New** → **Web Service**.
3. Conecte o repo `bizconnect`.
4. Configuração:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** deixe vazio ou `echo ok`
   - **Start Command:** `node src/server.js`
   - **Instance:** Free
5. **Environment:**
   - `JWT_SECRET` = qualquer string longa (ex.: gerada pelo Render)
6. Deploy. A URL fica tipo: `https://bizconnect-api.onrender.com`
7. Teste: `https://SEU-SERVICO.onrender.com/health`

> Plano free “dorme” após ~15 min sem uso; a primeira requisição pode demorar ~30–50s.
# bizconnect
