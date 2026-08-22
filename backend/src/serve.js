/**
 * BizConnect API — Node.js puro (sem Express)
 * Auth JWT (HMAC), JSON DB em arquivo
 */
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'bizconnect_dev_secret_change_in_production_2026';
const JWT_DAYS = 7;

// ========== DB ==========
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const DB_PATH = path.join(dataDir, 'db.json');

function emptyDb() {
  return { users: [], posts: [], postLikes: [], comments: [], connections: [],
    conversations: [], conversationMembers: [], messages: [], notifications: [],
    indications: [], opportunities: [] };
}
function loadDb() {
  try { if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch {}
  return emptyDb();
}
function saveDb() { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
let db = loadDb();
const uuid = () => crypto.randomUUID();

// ========== CRYPTO / JWT ==========
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(password, salt, 64).toString('hex');
}
function verifyPassword(password, stored) {
  const [salt, hash] = (stored || '').split(':');
  if (!salt || !hash) return false;
  return hash === crypto.scryptSync(password, salt, 64).toString('hex');
}
function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}
function signToken(userId) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + JWT_DAYS * 86400;
  const payload = b64url(JSON.stringify({ sub: userId, exp }));
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}
function verifyToken(token) {
  try {
    const [header, payload, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (sig !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.sub;
  } catch { return null; }
}

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

// ========== HTTP HELPERS ==========
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new Error('JSON inválido')); }
    });
    req.on('error', reject);
  });
}
function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  });
  res.end(body);
}
function getAuth(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  return verifyToken(h.slice(7));
}

// ========== ROUTES ==========
async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  const method = req.method;

  try {
    // Health
    if (method === 'GET' && p === '/health') return send(res, 200, { ok: true, service: 'bizconnect-api' });

    // AUTH
    if (method === 'POST' && p === '/api/auth/register') {
      const body = await readBody(req);
      const { email, password, name, role, company, city, segment, cnpj, phone } = body;
      if (!email || !password || !name) return send(res, 400, { error: 'email, password e name obrigatórios' });
      if (password.length < 6) return send(res, 400, { error: 'Senha mínima 6 caracteres' });
      if (db.users.find(u => u.email === email.toLowerCase())) return send(res, 409, { error: 'E-mail já cadastrado' });
      const user = {
        id: uuid(), email: email.toLowerCase(), passwordHash: hashPassword(password),
        name, role: role || '', company: company || '', city: city || '', segment: segment || '',
        bio: '', cnpj: cnpj || '', phone: phone || '', verified: false, premium: false,
        avatarBg: '1e40af', buscando: '', oferecendo: '', bizPoints: 0, createdAt: new Date().toISOString(),
      };
      db.users.push(user); saveDb();
      return send(res, 201, { token: signToken(user.id), user: publicUser(user) });
    }

    if (method === 'POST' && p === '/api/auth/login') {
      const body = await readBody(req);
      const user = db.users.find(u => u.email === (body.email || '').toLowerCase());
      if (!user || !verifyPassword(body.password, user.passwordHash)) return send(res, 401, { error: 'Credenciais inválidas' });
      return send(res, 200, { token: signToken(user.id), user: publicUser(user) });
    }

    if (method === 'GET' && p === '/api/auth/me') {
      const userId = getAuth(req);
      if (!userId) return send(res, 401, { error: 'Token ausente/inválido' });
      const user = db.users.find(u => u.id === userId);
      if (!user) return send(res, 404, { error: 'Usuário não encontrado' });
      return send(res, 200, { user: publicUser(user) });
    }

    // Protected routes need auth
    const userId = getAuth(req);
    const needsAuth = p.startsWith('/api/') && !p.startsWith('/api/auth/');
    if (needsAuth && !userId) return send(res, 401, { error: 'Token ausente/inválido' });

    // USERS
    if (method === 'GET' && p === '/api/users') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      let users = db.users.filter(u => u.id !== userId);
      if (q) users = users.filter(u =>
        u.name.toLowerCase().includes(q) || u.company.toLowerCase().includes(q) ||
        u.segment.toLowerCase().includes(q) || u.city.toLowerCase().includes(q));
      return send(res, 200, { users: users.slice(0, 50).map(publicUser) });
    }
    if (method === 'GET' && p.startsWith('/api/users/') && p !== '/api/users/me') {
      const id = p.split('/')[3];
      const user = db.users.find(u => u.id === id);
      if (!user) return send(res, 404, { error: 'Não encontrado' });
      return send(res, 200, { user: publicUser(user) });
    }
    if (method === 'PATCH' && p === '/api/users/me') {
      const body = await readBody(req);
      const user = db.users.find(u => u.id === userId);
      if (!user) return send(res, 404, { error: 'Não encontrado' });
      ['name','role','company','city','segment','bio','buscando','oferecendo'].forEach(f => {
        if (body[f] !== undefined) user[f] = body[f];
      });
      saveDb();
      return send(res, 200, { user: publicUser(user) });
    }

    // POSTS
    if (method === 'GET' && p === '/api/posts') {
      let posts = [...db.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const type = url.searchParams.get('type');
      if (type && type !== 'Todos' && type !== 'Tecnologia') {
        const map = { Oportunidades: 'oportunidade', Parcerias: 'parceria', Eventos: 'evento' };
        const t = map[type] || type.toLowerCase();
        posts = posts.filter(x => x.type === t);
      }
      const mapped = posts.slice(0, 50).map(post => {
        const author = db.users.find(u => u.id === post.userId);
        const likes = db.postLikes.filter(l => l.postId === post.id).map(l => l.userId);
        const comments = db.comments.filter(c => c.postId === post.id).map(c => {
          const u = db.users.find(x => x.id === c.userId);
          return { id: c.id, text: c.text, userId: c.userId, userName: u?.name, avatarBg: u?.avatarBg, createdAt: c.createdAt };
        });
        return {
          id: post.id, type: post.type, text: post.text, createdAt: post.createdAt, likes,
          likedByMe: likes.includes(userId), comments,
          author: author && { id: author.id, name: author.name, role: author.role, company: author.company, city: author.city, verified: author.verified, premium: author.premium, avatarBg: author.avatarBg },
        };
      });
      return send(res, 200, { posts: mapped });
    }
    if (method === 'POST' && p === '/api/posts') {
      const body = await readBody(req);
      if (!body.text?.trim()) return send(res, 400, { error: 'Texto obrigatório' });
      const post = { id: uuid(), userId, type: body.type || 'geral', text: body.text.trim(), createdAt: new Date().toISOString() };
      db.posts.unshift(post); saveDb();
      const author = db.users.find(u => u.id === userId);
      return send(res, 201, { post: { ...post, likes: [], likedByMe: false, comments: [], author: publicUser(author) } });
    }
    if (method === 'POST' && /^\/api\/posts\/[^/]+\/like$/.test(p)) {
      const postId = p.split('/')[3];
      const i = db.postLikes.findIndex(l => l.postId === postId && l.userId === userId);
      if (i >= 0) { db.postLikes.splice(i, 1); saveDb(); return send(res, 200, { liked: false }); }
      db.postLikes.push({ postId, userId }); saveDb();
      return send(res, 200, { liked: true });
    }
    if (method === 'POST' && /^\/api\/posts\/[^/]+\/comments$/.test(p)) {
      const postId = p.split('/')[3];
      const body = await readBody(req);
      if (!body.text?.trim()) return send(res, 400, { error: 'Texto obrigatório' });
      const user = db.users.find(u => u.id === userId);
      const comment = { id: uuid(), postId, userId, text: body.text.trim(), createdAt: new Date().toISOString() };
      db.comments.push(comment); saveDb();
      return send(res, 201, { comment: { ...comment, userName: user.name, avatarBg: user.avatarBg } });
    }

    // MESSAGES
    if (method === 'GET' && p === '/api/messages/conversations') {
      const myIds = db.conversationMembers.filter(m => m.userId === userId).map(m => m.conversationId);
      const conversations = db.conversations.filter(c => myIds.includes(c.id)).map(c => {
        const otherM = db.conversationMembers.find(m => m.conversationId === c.id && m.userId !== userId);
        const other = otherM ? db.users.find(u => u.id === otherM.userId) : null;
        const msgs = db.messages.filter(m => m.conversationId === c.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return {
          id: c.id, secure: !!c.secure, updatedAt: c.updatedAt, lastMessage: msgs[msgs.length - 1]?.text || '',
          other: other ? { id: other.id, name: other.name, avatarBg: other.avatarBg, company: other.company } : null,
        };
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return send(res, 200, { conversations });
    }
    if (method === 'POST' && p === '/api/messages/conversations') {
      const body = await readBody(req);
      if (!body.userId || body.userId === userId) return send(res, 400, { error: 'userId inválido' });
      const existing = db.conversations.find(c => {
        const members = db.conversationMembers.filter(m => m.conversationId === c.id).map(m => m.userId);
        return members.includes(userId) && members.includes(body.userId);
      });
      if (existing) return send(res, 200, { conversationId: existing.id });
      const id = uuid();
      db.conversations.unshift({ id, secure: false, updatedAt: new Date().toISOString() });
      db.conversationMembers.push({ conversationId: id, userId }, { conversationId: id, userId: body.userId });
      saveDb();
      return send(res, 201, { conversationId: id });
    }
    if (method === 'GET' && /^\/api\/messages\/conversations\/[^/]+\/messages$/.test(p)) {
      const convId = p.split('/')[4];
      if (!db.conversationMembers.find(m => m.conversationId === convId && m.userId === userId))
        return send(res, 403, { error: 'Sem acesso' });
      const conv = db.conversations.find(c => c.id === convId);
      const messages = db.messages.filter(m => m.conversationId === convId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(m => ({ id: m.id, senderId: m.senderId, text: m.text, isSystem: !!m.isSystem, createdAt: m.createdAt }));
      return send(res, 200, { messages, secure: !!conv?.secure });
    }
    if (method === 'POST' && /^\/api\/messages\/conversations\/[^/]+\/messages$/.test(p)) {
      const convId = p.split('/')[4];
      if (!db.conversationMembers.find(m => m.conversationId === convId && m.userId === userId))
        return send(res, 403, { error: 'Sem acesso' });
      const body = await readBody(req);
      if (!body.text?.trim()) return send(res, 400, { error: 'Texto obrigatório' });
      const msg = { id: uuid(), conversationId: convId, senderId: userId, text: body.text.trim(), isSystem: false, createdAt: new Date().toISOString() };
      db.messages.push(msg);
      const conv = db.conversations.find(c => c.id === convId);
      if (conv) conv.updatedAt = msg.createdAt;
      saveDb();
      return send(res, 201, { message: { id: msg.id, senderId: userId, text: msg.text, isSystem: false, createdAt: msg.createdAt } });
    }
    if (method === 'POST' && /^\/api\/messages\/conversations\/[^/]+\/secure$/.test(p)) {
      const convId = p.split('/')[4];
      if (!db.conversationMembers.find(m => m.conversationId === convId && m.userId === userId))
        return send(res, 403, { error: 'Sem acesso' });
      const conv = db.conversations.find(c => c.id === convId);
      if (conv) conv.secure = true;
      const hash = Math.random().toString(36).slice(2, 10);
      db.messages.push({ id: uuid(), conversationId: convId, senderId: null, text: `Sala Segura ativada — NDA assinado (hash: ${hash})`, isSystem: true, createdAt: new Date().toISOString() });
      saveDb();
      return send(res, 200, { secure: true, hash });
    }

    // CONNECTIONS
    if (method === 'GET' && p === '/api/connections') {
      const rows = db.connections
        .filter(c => (c.userId === userId || c.targetId === userId) && c.status === 'accepted')
        .map(c => {
          const otherId = c.userId === userId ? c.targetId : c.userId;
          const u = db.users.find(x => x.id === otherId);
          return { status: c.status, user: publicUser(u) };
        });
      return send(res, 200, { connections: rows });
    }
    if (method === 'GET' && p.startsWith('/api/connections/status/')) {
      const targetId = p.split('/')[4];
      const c = db.connections.find(x =>
        (x.userId === userId && x.targetId === targetId) || (x.userId === targetId && x.targetId === userId));
      return send(res, 200, { status: c?.status || null });
    }
    if (method === 'POST' && /^\/api\/connections\/[^/]+$/.test(p) && !p.includes('status')) {
      const targetId = p.split('/')[3];
      if (targetId === userId) return send(res, 400, { error: 'Inválido' });
      if (!db.users.find(u => u.id === targetId)) return send(res, 404, { error: 'Usuário não encontrado' });
      const existing = db.connections.find(x =>
        (x.userId === userId && x.targetId === targetId) || (x.userId === targetId && x.targetId === userId));
      if (existing) {
        if (existing.status === 'accepted') return send(res, 200, { status: 'accepted' });
        if (existing.userId === userId) {
          db.connections = db.connections.filter(c => c !== existing); saveDb();
          return send(res, 200, { status: null });
        }
        existing.status = 'accepted';
        db.notifications.unshift({ id: uuid(), userId: existing.userId, text: '<strong>Conexão aceita</strong>', read: false, createdAt: new Date().toISOString() });
        saveDb();
        return send(res, 200, { status: 'accepted' });
      }
      db.connections.push({ userId, targetId, status: 'pending', createdAt: new Date().toISOString() });
      db.notifications.unshift({ id: uuid(), userId: targetId, text: '<strong>Nova solicitação de conexão</strong>', read: false, createdAt: new Date().toISOString() });
      saveDb();
      return send(res, 201, { status: 'pending' });
    }

    // MATCHMAKING
    if (method === 'GET' && p === '/api/matchmaking/matches') {
      const me = db.users.find(u => u.id === userId);
      function score(a, b) {
        let s = 40;
        if (a.buscando && b.oferecendo) a.buscando.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 3 && b.oferecendo.toLowerCase().includes(w)) s += 12; });
        if (a.oferecendo && b.buscando) a.oferecendo.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 3 && b.buscando.toLowerCase().includes(w)) s += 12; });
        if (a.segment && a.segment === b.segment) s += 10;
        return Math.min(99, Math.max(35, s));
      }
      const matches = db.users.filter(u => u.id !== userId).map(u => ({
        user: { id: u.id, name: u.name, company: u.company, role: u.role, city: u.city, segment: u.segment, avatarBg: u.avatarBg, verified: u.verified, buscando: u.buscando, oferecendo: u.oferecendo },
        score: score(me, u),
      })).sort((a, b) => b.score - a.score).slice(0, 20);
      return send(res, 200, { matches });
    }
    if (method === 'PUT' && p === '/api/matchmaking/intentions') {
      const body = await readBody(req);
      const me = db.users.find(u => u.id === userId);
      me.buscando = body.buscando || '';
      me.oferecendo = body.oferecendo || '';
      saveDb();
      return send(res, 200, { ok: true, buscando: me.buscando, oferecendo: me.oferecendo });
    }

    // NOTIFICATIONS
    if (method === 'GET' && p === '/api/notifications') {
      const rows = db.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
      return send(res, 200, { notifications: rows, unread: rows.filter(n => !n.read).length });
    }
    if (method === 'POST' && p === '/api/notifications/read-all') {
      db.notifications.forEach(n => { if (n.userId === userId) n.read = true; });
      saveDb();
      return send(res, 200, { ok: true });
    }

    // INDICATIONS
    if (method === 'GET' && p === '/api/indications') {
      return send(res, 200, { indications: db.indications.filter(i => i.fromUser === userId) });
    }
    if (method === 'GET' && p === '/api/indications/ranking') {
      const ranking = [...db.users].sort((a, b) => (b.bizPoints || 0) - (a.bizPoints || 0)).slice(0, 10)
        .map(u => ({ id: u.id, name: u.name, company: u.company, avatarBg: u.avatarBg, bizPoints: u.bizPoints || 0 }));
      return send(res, 200, { ranking });
    }
    if (method === 'POST' && p === '/api/indications') {
      const body = await readBody(req);
      if (!body.toUser || !body.forUser) return send(res, 400, { error: 'toUser e forUser obrigatórios' });
      const ind = { id: uuid(), fromUser: userId, toUser: body.toUser, forUser: body.forUser, note: body.note || '', status: 'pending', points: 0, createdAt: new Date().toISOString() };
      db.indications.unshift(ind); saveDb();
      return send(res, 201, ind);
    }
    if (method === 'POST' && /^\/api\/indications\/[^/]+\/confirm$/.test(p)) {
      const id = p.split('/')[3];
      const body = await readBody(req);
      const ind = db.indications.find(i => i.id === id && i.fromUser === userId);
      if (!ind) return send(res, 404, { error: 'Não encontrado' });
      if (body.type === 'deal') {
        ind.status = 'deal'; ind.points = 50;
        const me = db.users.find(u => u.id === userId);
        me.bizPoints = (me.bizPoints || 0) + 50;
        saveDb();
        return send(res, 200, { connections: rows });
    }
    if (method === 'GET' && p.startsWith('/api/connections/status/')) {
      const targetId = p.split('/')[4];
      const c = db.connections.find(x =>
        (x.userId === userId && x.targetId === targetId) || (x.userId === targetId && x.targetId === userId));
      return send(res, 200, { status: c?.status || null });
    }
    if (method === 'POST' && /^\/api\/connections\/[^/]+$/.test(p) && !p.includes('status')) {
      const targetId = p.split('/')[3];
      if (targetId === userId) return send(res, 400, { error: 'Inválido' });
      if (!db.users.find(u => u.id === targetId)) return send(res, 404, { error: 'Usuário não encontrado' });
      const existing = db.connections.find(x =>
        (x.userId === userId && x.targetId === targetId) || (x.userId === targetId && x.targetId === userId));
      if (existing) {
        if (existing.status === 'accepted') return send(res, 200, { status: 'accepted' });
        if (existing.userId === userId) {
          db.connections = db.connections.filter(c => c !== existing); saveDb();
          return send(res, 200, { status: null });
        }
        existing.status = 'accepted';
        db.notifications.unshift({ id: uuid(), userId: existing.userId, text: '<strong>Conexão aceita</strong>', read: false, createdAt: new Date().toISOString() });
        saveDb();
        return send(res, 200, { status: 'accepted' });
      }
      db.connections.push({ userId, targetId, status: 'pending', createdAt: new Date().toISOString() });
      db.notifications.unshift({ id: uuid(), userId: targetId, text: '<strong>Nova solicitação de conexão</strong>', read: false, createdAt: new Date().toISOString() });
      saveDb();
      return send(res, 201, { status: 'pending' });
    }

    // MATCHMAKING
    if (method === 'GET' && p === '/api/matchmaking/matches') {
      const me = db.users.find(u => u.id === userId);
      function score(a, b) {
        let s = 40;
        if (a.buscando && b.oferecendo) a.buscando.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 3 && b.oferecendo.toLowerCase().includes(w)) s += 12; });
        if (a.oferecendo && b.buscando) a.oferecendo.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 3 && b.buscando.toLowerCase().includes(w)) s += 12; });
        if (a.segment && a.segment === b.segment) s += 10;
        return Math.min(99, Math.max(35, s));
      }
      const matches = db.users.filter(u => u.id !== userId).map(u => ({
        user: { id: u.id, name: u.name, company: u.company, role: u.role, city: u.city, segment: u.segment, avatarBg: u.avatarBg, verified: u.verified, buscando: u.buscando, oferecendo: u.oferecendo },
        score: score(me, u),
      })).sort((a, b) => b.score - a.score).slice(0, 20);
      return send(res, 200, { matches });
    }
    if (method === 'PUT' && p === '/api/matchmaking/intentions') {
      const body = await readBody(req);
      const me = db.users.find(u => u.id === userId);
      me.buscando = body.buscando || '';
      me.oferecendo = body.oferecendo || '';
      saveDb();
      return send(res, 200, { ok: true, buscando: me.buscando, oferecendo: me.oferecendo });
    }

    // NOTIFICATIONS
    if (method === 'GET' && p === '/api/notifications') {
      const rows = db.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
      return send(res, 200, { notifications: rows, unread: rows.filter(n => !n.read).length });
    }
    if (method === 'POST' && p === '/api/notifications/read-all') {
      db.notifications.forEach(n => { if (n.userId === userId) n.read = true; });
      saveDb();
      return send(res, 200, { ok: true });
    }

    // INDICATIONS
    if (method === 'GET' && p === '/api/indications') {
      return send(res, 200, { indications: db.indications.filter(i => i.fromUser === userId) });
    }
    if (method === 'GET' && p === '/api/indications/ranking') {
      const ranking = [...db.users].sort((a, b) => (b.bizPoints || 0) - (a.bizPoints || 0)).slice(0, 10)
        .map(u => ({ id: u.id, name: u.name, company: u.company, avatarBg: u.avatarBg, bizPoints: u.bizPoints || 0 }));
      return send(res, 200, { ranking });
    }
    if (method === 'POST' && p === '/api/indications') {
      const body = await readBody(req);
      if (!body.toUser || !body.forUser) return send(res, 400, { error: 'toUser e forUser obrigatórios' });
      const ind = { id: uuid(), fromUser: userId, toUser: body.toUser, forUser: body.forUser, note: body.note || '', status: 'pending', points: 0, createdAt: new Date().toISOString() };
      db.indications.unshift(ind); saveDb();
      return send(res, 201, ind);
    }
    if (method === 'POST' && /^\/api\/indications\/[^/]+\/confirm$/.test(p)) {
      const id = p.split('/')[3];
      const body = await readBody(req);
      const ind = db.indications.find(i => i.id === id && i.fromUser === userId);
      if (!ind) return send(res, 404, { error: 'Não encontrado' });
      if (body.type === 'deal') {
        ind.status = 'deal'; ind.points = 50;
        const me = db.users.find(u => u.id === userId);
        me.bizPoints = (me.bizPoints || 0) + 50;
        saveDb();
        return send(res, 200, { status: 'deal', points: 50, bizPoints: me.bizPoints });
      }
      ind.status = 'meeting'; saveDb();
      return send(res, 200, { status: 'meeting' });
    }

    // OPPORTUNITIES
    if (method === 'GET' && p === '/api/opportunities') {
      const rows = db.opportunities.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(o => {
        const u = db.users.find(x => x.id === o.userId);
        return { id: o.id, type: o.type, title: o.title, description: o.description, createdAt: o.createdAt, userId: o.userId, userName: u?.name, company: u?.company, avatarBg: u?.avatarBg };
      });
      return send(res, 200, { opportunities: rows });
    }
    if (method === 'POST' && p === '/api/opportunities') {
      const body = await readBody(req);
      if (!body.title) return send(res, 400, { error: 'title obrigatório' });
      const o = { id: uuid(), userId, type: body.type || 'Oportunidade', title: body.title, description: body.description || '', createdAt: new Date().toISOString() };
      db.opportunities.unshift(o); saveDb();
      return send(res, 201, { id: o.id });
    }

    send(res, 404, { error: 'Rota não encontrada', path: p });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: 'Erro interno', detail: String(err.message || err) });
  }
}

// Seed if empty
if (db.users.length === 0) {
  require('./db/seed.js');
  db = loadDb();
}

http.createServer(handler).listen(PORT, '0.0.0.0', () => {
  console.log(`BizConnect API ouvindo em 0.0.0.0:${PORT}`);
  console.log(`Health: /health`);
  console.log(`Login demo: carlos.silva@empresa.com.br / 123456`);
});
