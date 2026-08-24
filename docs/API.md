# BizConnect API

Base URL: `http://localhost:3001`

## Auth

### POST /api/auth/register
```json
{ "email": "...", "password": "...", "name": "...", "company": "...", "city": "...", "segment": "..." }
```

### POST /api/auth/login
```json
{ "email": "carlos.silva@empresa.com.br", "password": "123456" }
```
Resposta: `{ "token": "...", "user": { ... } }`

### GET /api/auth/me
Header: `Authorization: Bearer <token>`

## Recursos protegidos

Todas as rotas `/api/*` (exceto auth login/register) exigem JWT.

- `GET /api/posts` — feed  
- `POST /api/posts` — `{ "text", "type" }`  
- `POST /api/posts/:id/like`  
- `POST /api/posts/:id/comments` — `{ "text" }`  
- `GET /api/messages/conversations`  
- `POST /api/messages/conversations` — `{ "userId" }`  
- `GET /api/messages/conversations/:id/messages`  
- `POST /api/messages/conversations/:id/messages` — `{ "text" }`  
- `POST /api/messages/conversations/:id/secure` — ativa NDA  
- `GET /api/matchmaking/matches`  
- `PUT /api/matchmaking/intentions` — `{ "buscando", "oferecendo" }`  
- `GET /api/indications` · `POST /api/indications` · `POST /api/indications/:id/confirm`  
- `GET /api/indications/ranking`  
- `GET /api/notifications` · `POST /api/notifications/read-all`  
- `GET /api/opportunities` · `POST /api/opportunities`  
- `GET /api/users?q=` · `PATCH /api/users/me`  
- `POST /api/connections/:targetId`  

Persistência: `backend/data/db.json` (gerado pelo seed).
