const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const DB_PATH = path.join(dataDir, 'db.json');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(password, salt, 64).toString('hex');
}
const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const hash = hashPassword('123456');

function user(email, name, role, company, city, segment, bg, extra = {}) {
  return {
    id: uuid(), email, passwordHash: hash, name, role, company, city, segment,
    bio: extra.bio || '', cnpj: '', phone: '', verified: !!extra.verified, premium: !!extra.premium,
    avatarBg: bg, buscando: extra.buscando || '', oferecendo: extra.oferecendo || '',
    bizPoints: extra.bizPoints || 0, createdAt: now(),
  };
}

const carlos = user('carlos.silva@empresa.com.br', 'Carlos Silva', 'CEO & Fundador', 'TechBrasil Soluções', 'São Paulo, SP', 'Tecnologia', '1e40af', {
  verified: true, bizPoints: 180, buscando: 'Canal de distribuição no Centro-Oeste', oferecendo: 'Software B2B SaaS e parcerias comerciais',
});
const ana = user('ana.costa@agrotech.com.br', 'Ana Costa', 'CEO', 'AgroTech Solutions', 'São Paulo, SP', 'Agronegócio', '0f766e', {
  verified: true, bizPoints: 90, buscando: 'Software de gestão', oferecendo: 'Distribuição IoT agro',
});
const roberto = user('roberto@mendes.com.br', 'Roberto Mendes', 'Sócio', 'Mendes & Associados', 'Rio de Janeiro, RJ', 'Consultoria', '7c3aed', {
  verified: true, bizPoints: 120, buscando: 'Alvos de M&A', oferecendo: 'Assessoria M&A',
});
const fernanda = user('fernanda@banco.com.br', 'Fernanda Lima', 'Diretora de Inovação', 'Banco Horizonte', 'Curitiba, PR', 'Finanças', 'be123c', {
  verified: true, premium: true, bizPoints: 320, buscando: 'Parceiros fintech', oferecendo: 'Networking bancário',
});
const marcos = user('marcos@logimax.com.br', 'Marcos Oliveira', 'CEO', 'LogiMax', 'São Paulo, SP', 'Logística', '0369a1', { verified: true });
const patricia = user('patricia@nutrilab.com', 'Patrícia Souza', 'Fundadora', 'NutriLab', 'Belo Horizonte, MG', 'Foodtech', 'c2410c', { verified: true, buscando: 'Investidor anjo' });
const lucas = user('lucas@ferreiracapital.com', 'Lucas Ferreira', 'Sócio', 'Ferreira Capital', 'São Paulo, SP', 'Investimentos', '15803d', { verified: true, premium: true });
const camila = user('camila@saudemais.com', 'Camila Rocha', 'Diretora', 'Saúde+ Digital', 'Rio de Janeiro, RJ', 'Saúde', '6d28d9', { verified: true });

const p1 = uuid(), p2 = uuid(), p3 = uuid();
const cv1 = uuid();

const db = {
  users: [carlos, ana, roberto, fernanda, marcos, patricia, lucas, camila],
  posts: [
    { id: p1, userId: ana.id, type: 'oportunidade', text: 'Buscamos parceiros para distribuição de sensores IoT no agronegócio no Centro-Oeste.', createdAt: now() },
    { id: p2, userId: roberto.id, type: 'geral', text: 'M&A no setor de saúde deve crescer 30% em 2026.', createdAt: now() },
    { id: p3, userId: fernanda.id, type: 'evento', text: 'Jantar fintech em SP dia 28/08. Vagas limitadas.', createdAt: now() },
  ],
  postLikes: [{ postId: p1, userId: carlos.id }],
  comments: [{ id: uuid(), postId: p1, userId: roberto.id, text: 'Interessante! Temos operação em MS.', createdAt: now() }],
  connections: [
    { userId: carlos.id, targetId: ana.id, status: 'accepted', createdAt: now() },
    { userId: carlos.id, targetId: roberto.id, status: 'accepted', createdAt: now() },
  ],
  conversations: [{ id: cv1, secure: false, updatedAt: now() }],
  conversationMembers: [
    { conversationId: cv1, userId: carlos.id },
    { conversationId: cv1, userId: ana.id },
  ],
  messages: [
    { id: uuid(), conversationId: cv1, senderId: ana.id, text: 'Carlos, bom dia! Vi sua publicação sobre sensores.', isSystem: false, createdAt: now() },
    { id: uuid(), conversationId: cv1, senderId: carlos.id, text: 'Bom dia, Ana! Posso enviar o one-pager?', isSystem: false, createdAt: now() },
    { id: uuid(), conversationId: cv1, senderId: ana.id, text: 'Perfeito! Quinta à tarde funciona?', isSystem: false, createdAt: now() },
  ],
  notifications: [
    { id: uuid(), userId: carlos.id, text: '<strong>Ana Costa</strong> enviou uma solicitação de conexão', read: false, createdAt: now() },
    { id: uuid(), userId: carlos.id, text: '<strong>Roberto Mendes</strong> comentou na sua publicação', read: false, createdAt: now() },
  ],
  indications: [
    { id: uuid(), fromUser: carlos.id, toUser: ana.id, forUser: roberto.id, note: 'Parceria', status: 'deal', points: 50, createdAt: now() },
  ],
  opportunities: [
    { id: uuid(), userId: ana.id, type: 'Parceria Comercial', title: 'Distribuição de sensores IoT', description: 'Centro-Oeste e Sul', createdAt: now() },
    { id: uuid(), userId: patricia.id, type: 'Investimento', title: 'Rodada Seed — NutriLab', description: 'R$ 1,2M', createdAt: now() },
  ],
};

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
console.log('Seed inline OK');
