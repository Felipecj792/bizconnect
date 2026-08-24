/**
 * BizConnect — App interativo (client-side completo)
 * Estado + localStorage. Todas as ações mutam dados e atualizam a UI.
 */

const STORAGE_KEY = 'bizconnect_v2';

// ========== STORE ==========
const defaultState = () => ({
  session: null, // { email, name }
  users: [
    { id: 'u1', name: 'Carlos Silva', role: 'CEO & Fundador', company: 'TechBrasil Soluções', city: 'São Paulo, SP', segment: 'Tecnologia', bio: 'Empreendedor serial com 15 anos em software B2B. Fundei a TechBrasil em 2018.', verified: true, premium: false, avatar: 'Carlos+Silva', bg: '1e40af', cnpj: '12.345.678/0001-90', tags: ['SaaS','B2B','Cloud'], buscando: 'Canal de distribuição no Centro-Oeste', oferecendo: 'Software B2B SaaS e parcerias comerciais', bizPoints: 180, connections: ['u2','u3','u4'] },
    { id: 'u2', name: 'Ana Costa', role: 'CEO', company: 'AgroTech Solutions', city: 'São Paulo, SP', segment: 'Agronegócio', bio: 'Sensores IoT para o campo.', verified: true, premium: false, avatar: 'Ana+Costa', bg: '0f766e', buscando: 'Software de gestão', oferecendo: 'Distribuição IoT agro', bizPoints: 90, connections: ['u1'] },
    { id: 'u3', name: 'Roberto Mendes', role: 'Sócio', company: 'Mendes & Associados', city: 'Rio de Janeiro, RJ', segment: 'Consultoria', bio: 'M&A e saúde.', verified: true, premium: false, avatar: 'Roberto+Mendes', bg: '7c3aed', buscando: 'Alvos de M&A', oferecendo: 'Assessoria M&A', bizPoints: 120, connections: ['u1'] },
    { id: 'u4', name: 'Fernanda Lima', role: 'Diretora de Inovação', company: 'Banco Horizonte', city: 'Curitiba, PR', segment: 'Finanças', bio: 'Open finance e fintech.', verified: true, premium: true, avatar: 'Fernanda+Lima', bg: 'be123c', buscando: 'Parceiros fintech', oferecendo: 'Networking bancário', bizPoints: 320, connections: ['u1'] },
    { id: 'u5', name: 'Marcos Oliveira', role: 'CEO', company: 'LogiMax', city: 'São Paulo, SP', segment: 'Logística', bio: 'Supply chain 4.0.', verified: true, premium: false, avatar: 'Marcos+Oliveira', bg: '0369a1', buscando: 'Clientes B2B', oferecendo: 'Logística última milha', bizPoints: 40, connections: [] },
    { id: 'u6', name: 'Patrícia Souza', role: 'Fundadora', company: 'NutriLab', city: 'Belo Horizonte, MG', segment: 'Foodtech', bio: 'Alimentos saudáveis.', verified: true, premium: false, avatar: 'Patricia+Souza', bg: 'c2410c', buscando: 'Investidor anjo', oferecendo: 'Equity seed', bizPoints: 20, connections: [] },
    { id: 'u7', name: 'Lucas Ferreira', role: 'Sócio', company: 'Ferreira Capital', city: 'São Paulo, SP', segment: 'Investimentos', bio: 'Business angel B2B SaaS.', verified: true, premium: true, avatar: 'Lucas+Ferreira', bg: '15803d', buscando: 'SaaS com tração', oferecendo: 'Capital R$ 200k–1M', bizPoints: 60, connections: [] },
    { id: 'u8', name: 'Camila Rocha', role: 'Diretora', company: 'Saúde+ Digital', city: 'Rio de Janeiro, RJ', segment: 'Saúde', bio: 'Telemedicina.', verified: true, premium: false, avatar: 'Camila+Rocha', bg: '6d28d9', buscando: 'CTO co-founder', oferecendo: 'Equity generoso', bizPoints: 30, connections: [] },
    { id: 'u9', name: 'Diego Santos', role: 'CEO', company: 'EcoPack', city: 'Curitiba, PR', segment: 'Sustentabilidade', bio: 'Embalagens biodegradáveis.', verified: true, premium: false, avatar: 'Diego+Santos', bg: 'b45309', buscando: 'Distribuidores Nordeste', oferecendo: 'Embalagens eco', bizPoints: 15, connections: [] },
    { id: 'u10', name: 'Beatriz Nunes', role: 'Consultora', company: 'BN Strategy', city: 'São Paulo, SP', segment: 'Consultoria', bio: 'Transformação digital.', verified: true, premium: false, avatar: 'Beatriz+Nunes', bg: '0e7490', buscando: 'Clientes médias empresas', oferecendo: 'Consultoria estratégica', bizPoints: 25, connections: [] },
  ],
  posts: [
    { id: 'p1', userId: 'u2', type: 'oportunidade', text: 'Estamos buscando parceiros comerciais para distribuição de sensores IoT no agronegócio no Centro-Oeste. Ideal para empresas com presença em MS, MT e GO. Volume inicial projetado de 5.000 unidades/ano.', likes: ['u1','u3'], comments: [{ id: 'c1', userId: 'u3', text: 'Interessante! Temos operação em MS. Vamos conversar?' }], createdAt: Date.now() - 7200000 },
    { id: 'p2', userId: 'u3', type: 'geral', text: 'Acabei de participar de um painel sobre M&A no setor de saúde. O volume de deals em 2026 deve superar 2025 em 30%. Quem estiver avaliando aquisição ou venda, vale a pena conversar.', likes: ['u1','u2','u4'], comments: [], createdAt: Date.now() - 18000000 },
    { id: 'p3', userId: 'u4', type: 'evento', text: 'Convidamos empresários do setor fintech e open finance para um jantar exclusivo no dia 28/08 em São Paulo. Vagas limitadas. Interessados, enviem mensagem privada.', likes: ['u1','u2','u3','u7'], comments: [], createdAt: Date.now() - 86400000 },
  ],
  conversations: [
    { id: 'cv1', participants: ['u1','u2'], lastMessage: 'Perfeito! Vou enviar o material ainda hoje...', updatedAt: Date.now() - 3600000, unread: 0, archived: false, secure: false },
    { id: 'cv2', participants: ['u1','u3'], lastMessage: 'Obrigado pela indicação. Vamos marcar...', updatedAt: Date.now() - 86400000, unread: 0, archived: false, secure: false },
    { id: 'cv3', participants: ['u1','u4'], lastMessage: 'Confirmei sua presença no jantar.', updatedAt: Date.now() - 172800000, unread: 1, archived: false, secure: false },
  ],
  messages: {
    cv1: [
      { id: 'm1', from: 'u2', text: 'Carlos, bom dia! Vi sua publicação sobre sensores. Temos interesse em conhecer melhor a solução de vocês.', at: Date.now() - 7200000 },
      { id: 'm2', from: 'u1', text: 'Bom dia, Ana! Ótimo. Posso enviar o one-pager e agendar uma call rápida ainda esta semana?', at: Date.now() - 7000000 },
      { id: 'm3', from: 'u2', text: 'Perfeito! Vou enviar o material ainda hoje. Quinta-feira à tarde funciona para você?', at: Date.now() - 3600000 },
    ],
    cv2: [
      { id: 'm4', from: 'u3', text: 'Obrigado pela indicação. Vamos marcar uma call na próxima semana.', at: Date.now() - 86400000 },
    ],
    cv3: [
      { id: 'm5', from: 'u4', text: 'Confirmei sua presença no jantar.', at: Date.now() - 172800000 },
    ],
  },
  connectionRequests: {}, // targetId -> 'pending' | 'connected'
  communities: [
    { id: 'cm1', name: 'Agronegócio & Foodtech', icon: '🌾', color: 'emerald', members: 1248, topics: 34, joined: false },
    { id: 'cm2', name: 'Tecnologia & SaaS', icon: '💻', color: 'blue', members: 2891, topics: 67, joined: true },
    { id: 'cm3', name: 'Saúde & Life Sciences', icon: '🏥', color: 'violet', members: 876, topics: 21, joined: false },
    { id: 'cm4', name: 'Investimentos & Private Equity', icon: '💰', color: 'amber', members: 654, topics: 18, joined: false },
    { id: 'cm5', name: 'Varejo & E-commerce', icon: '🛍️', color: 'rose', members: 1102, topics: 29, joined: false },
  ],
  communityTopics: {
    cm2: [
      { id: 't1', title: 'Como vocês estão precificando SaaS em 2026?', tag: 'Discussão', replies: 12, author: 'Ana Costa', at: 'há 3 horas' },
      { id: 't2', title: 'Busco CTO co-founder para fintech de crédito', tag: 'Oportunidade', replies: 8, author: 'Lucas Ferreira', at: 'há 1 dia' },
      { id: 't3', title: 'Meetup founders SP — 30/08', tag: 'Evento', replies: 24, author: 'Fernanda Lima', at: 'há 2 dias' },
    ],
  },
  indications: [
    { id: 'i1', from: 'u1', to: 'u2', forUser: 'u3', status: 'deal', note: 'Parceria de distribuição', points: 50 },
    { id: 'i2', from: 'u1', to: 'u7', forUser: 'u6', status: 'meeting', note: 'Possível investimento seed', points: 0 },
    { id: 'i3', from: 'u1', to: 'u8', forUser: 'u9', status: 'pending', note: 'Introdução', points: 0 },
  ],
  notifications: [
    { id: 'n1', text: '<strong>Ana Costa</strong> enviou uma solicitação de conexão', time: 'há 15 min', read: false, avatar: 'Ana+Costa', bg: '0f766e' },
    { id: 'n2', text: '<strong>Roberto Mendes</strong> comentou na sua publicação', time: 'há 1 hora', read: false, avatar: 'Roberto+Mendes', bg: '7c3aed' },
    { id: 'n3', text: 'Nova oportunidade em <strong>Tecnologia</strong> que combina com seu perfil', time: 'há 3 horas', read: false, icon: '💼' },
    { id: 'n4', text: '<strong>Fernanda Lima</strong> aceitou sua solicitação de conexão', time: 'ontem', read: true, avatar: 'Fernanda+Lima', bg: 'be123c' },
    { id: 'n5', text: 'Seu perfil foi <strong>verificado</strong> com sucesso', time: 'há 2 dias', read: true, icon: '✅' },
  ],
  settings: {
    notifMessages: true,
    notifConnections: true,
    notifOpportunities: true,
    notifEmail: false,
    profilePublic: false,
    showOnline: true,
    twoFA: false,
  },
  intentions: { buscando: 'Canal de distribuição no Centro-Oeste', oferecendo: 'Software B2B SaaS e parcerias comerciais', region: 'Brasil', ticket: 'Qualquer' },
  opportunities: [
    { id: 'o1', type: 'Parceria Comercial', title: 'Distribuição de sensores IoT para agronegócio', desc: 'Buscamos distribuidores autorizados nas regiões Centro-Oeste e Sul. Margem atrativa e suporte técnico completo.', userId: 'u2', at: 'há 3 horas', interested: false },
    { id: 'o2', type: 'Investimento', title: 'Rodada Seed — NutriLab (Foodtech)', desc: 'Captando R$ 1,2M. Produto validado em 12 pontos de venda. Tração de 40% MoM.', userId: 'o6', userId: 'u6', at: 'há 1 dia', interested: false },
    { id: 'o3', type: 'Vaga / Co-founder', title: 'CTO Co-founder — Saúde+ Digital', desc: 'Buscamos sócio técnico com experiência em telemedicina e escala. Equity generoso.', userId: 'u8', at: 'há 2 dias', interested: false },
  ],
  activeConversation: 'cv1',
  feedFilter: 'Todos',
  currentPage: 'feed',
});

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // merge with defaults for new keys
      const d = defaultState();
      return { ...d, ...parsed, users: parsed.users || d.users };
    }
  } catch (e) {}
  return defaultState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function me() {
  return state.users.find(u => u.id === 'u1');
}

function userById(id) {
  return state.users.find(u => u.id === id);
}

function avatarUrl(u, size = 40) {
  return `https://ui-avatars.com/api/?name=${u.avatar}&background=${u.bg}&color=fff&size=${size}`;
}

function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return 'agora';
  if (d < 3600000) return `há ${Math.floor(d/60000)} min`;
  if (d < 86400000) return `há ${Math.floor(d/3600000)} horas`;
  if (d < 172800000) return 'ontem';
  return `há ${Math.floor(d/86400000)} dias`;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text || '';
  return d.innerHTML;
}

function uid(prefix) {
  return prefix + Date.now() + Math.random().toString(36).slice(2, 6);
}

// ========== TOAST ==========
function showToast(msg, duration = 2500) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// ========== AUTH ==========
function switchAuthTab(tab) {
  ['login','register','recover'].forEach(t => {
    const el = document.getElementById('form-' + (t === 'recover' ? 'recover' : t));
    if (el) el.classList.toggle('hidden', t !== tab && !(tab === 'login' && t === 'login') && !(tab === 'register' && t === 'register') && !(tab === 'recover' && t === 'recover'));
  });
  document.getElementById('form-login')?.classList.toggle('hidden', tab !== 'login');
  document.getElementById('form-register')?.classList.toggle('hidden', tab !== 'register');
  document.getElementById('form-recover')?.classList.toggle('hidden', tab !== 'recover');
  const tl = document.getElementById('tab-login');
  const tr = document.getElementById('tab-register');
  if (tl) {
    tl.classList.toggle('text-primary-700', tab === 'login');
    tl.classList.toggle('border-primary-600', tab === 'login');
    tl.classList.toggle('text-slate-500', tab !== 'login');
    tl.classList.toggle('border-transparent', tab !== 'login');
  }
  if (tr) {
    tr.classList.toggle('text-primary-700', tab === 'register');
    tr.classList.toggle('border-primary-600', tab === 'register');
    tr.classList.toggle('text-slate-500', tab !== 'register');
    tr.classList.toggle('border-transparent', tab !== 'register');
  }
}

function showRecover() {
  switchAuthTab('recover');
}

function sendRecover() {
  showToast('Link de recuperação enviado para o e-mail!');
  switchAuthTab('login');
}

function doLogin() {
  state.session = { email: 'carlos.silva@empresa.com.br', name: 'Carlos Silva' };
  saveState();
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  showPage('feed');
  refreshAll();
  showToast('Bem-vindo ao BizConnect, Carlos!');
}

function doRegister() {
  showToast('Conta criada! Verifique seu e-mail.');
  setTimeout(doLogin, 600);
}

function doLogout() {
  if (!confirm('Deseja sair da plataforma?')) return;
  state.session = null;
  saveState();
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  switchAuthTab('login');
  showToast('Você saiu da conta');
}

// ========== NAV ==========
function showPage(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const el = document.getElementById('page-' + page);
  if (el) {
    el.classList.remove('hidden');
    el.classList.add('fade-in');
  }
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    const on = item.dataset.page === page;
    item.classList.toggle('text-primary-700', on);
    item.classList.toggle('text-slate-400', !on);
  });
  document.getElementById('sidebar')?.classList.add('-translate-x-full');
  document.getElementById('sidebar-overlay')?.classList.add('hidden');
  closeSearch();

  if (page === 'feed') renderFeed();
  if (page === 'messages') renderConversations();
  if (page === 'network') renderNetwork();
  if (page === 'notifications') renderNotifications();
  if (page === 'matchmaking') renderMatchmaking();
  if (page === 'indications') renderIndications();
  if (page === 'opportunities') renderOpportunities();
  if (page === 'communities') renderCommunities();
  if (page === 'profile') renderProfile();
  if (page === 'settings') renderSettings();
  updateBadges();
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
  document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
}

// ========== SEARCH ==========
function openSearch() {
  document.getElementById('search-overlay')?.classList.remove('hidden');
  document.getElementById('search-input-main')?.focus();
}
function closeSearch() {
  document.getElementById('search-overlay')?.classList.add('hidden');
}
function doSearch() {
  const q = (document.getElementById('search-input-main')?.value || '').trim().toLowerCase();
  if (!q) return;
  closeSearch();
  showPage('search-results');
  const label = document.getElementById('search-query-label');
  if (label) label.textContent = q;
  const results = state.users.filter(u =>
    u.id !== 'u1' && (
      u.name.toLowerCase().includes(q) ||
      u.company.toLowerCase().includes(q) ||
      u.segment.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    )
  );
  const container = document.querySelector('#page-search-results .space-y-3');
  if (!container) return;
  if (results.length === 0) {
    container.innerHTML = '<p class="text-slate-500 text-sm p-4">Nenhum resultado encontrado.</p>';
    return;
  }
  container.innerHTML = results.map(u => `
    <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <img src="${avatarUrl(u, 48)}" class="w-12 h-12 rounded-full" alt="">
      <div class="flex-1"><p class="font-semibold text-slate-900">${escapeHtml(u.name)}</p><p class="text-sm text-slate-500">${escapeHtml(u.role)} • ${escapeHtml(u.company)} • ${escapeHtml(u.city)}</p></div>
      <button onclick="connectUser(this, '${u.id}')" class="bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-xl">${connLabel(u.id)}</button>
    </div>
  `).join('');
  showToast(`${results.length} resultado(s)`);
}

// ========== FEED ==========
const typeLabels = {
  geral: '',
  oportunidade: '<span class="inline-block bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">Oportunidade</span>',
  parceria: '<span class="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">Parceria</span>',
  evento: '<span class="inline-block bg-violet-50 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">Evento</span>',
};

function renderFeed() {
  const feed = document.getElementById('feed-posts');
  if (!feed) return;
  let posts = [...state.posts].sort((a, b) => b.createdAt - a.createdAt);
  if (state.feedFilter === 'Oportunidades') posts = posts.filter(p => p.type === 'oportunidade');
  if (state.feedFilter === 'Parcerias') posts = posts.filter(p => p.type === 'parceria');
  if (state.feedFilter === 'Eventos') posts = posts.filter(p => p.type === 'evento');
  if (state.feedFilter === 'Tecnologia') posts = posts.filter(p => {
    const u = userById(p.userId);
    return u && u.segment === 'Tecnologia';
  });

  feed.innerHTML = posts.map(p => {
    const u = userById(p.userId) || me();
    const liked = (p.likes || []).includes('u1');
    return `
    <article class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5" data-post="${p.id}">
      <div class="flex items-start gap-3 mb-3">
        <img src="${avatarUrl(u, 44)}" class="w-11 h-11 rounded-full" alt="">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-semibold text-slate-900">${escapeHtml(u.name)}</h3>
            ${u.verified ? '<span class="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">✓ Verificado</span>' : ''}
            ${u.premium ? '<span class="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Premium</span>' : ''}
          </div>
          <p class="text-sm text-slate-500">${escapeHtml(u.role)} • ${escapeHtml(u.company)} • ${escapeHtml(u.city.split(',')[0])}</p>
          <p class="text-xs text-slate-400 mt-0.5">${timeAgo(p.createdAt)}</p>
        </div>
      </div>
      <div class="mb-3">${typeLabels[p.type] || ''}<p class="text-slate-700 leading-relaxed">${escapeHtml(p.text)}</p></div>
      <div class="flex items-center gap-4 pt-3 border-t border-slate-100 text-sm text-slate-500">
        <button onclick="toggleLike('${p.id}')" class="flex items-center gap-1.5 hover:text-primary-600 transition ${liked ? 'liked' : ''}">
          <svg class="w-5 h-5" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
          <span class="like-count">${(p.likes || []).length}</span>
        </button>
        <button onclick="toggleComments('${p.id}')" class="flex items-center gap-1.5 hover:text-primary-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          ${(p.comments || []).length}
        </button>
        <button onclick="sharePost('${p.id}')" class="ml-auto text-slate-400 hover:text-primary-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
        </button>
      </div>
      <div id="comments-${p.id}" class="hidden mt-3 pt-3 border-t border-slate-100">
        <div id="comment-list-${p.id}" class="comment-box space-y-1 mb-3">
          ${(p.comments || []).map(c => {
            const cu = userById(c.userId) || me();
            return `<div class="flex gap-2 py-2">
              <img src="${avatarUrl(cu, 32)}" class="w-8 h-8 rounded-full flex-shrink-0" alt="">
              <div class="bg-slate-100 rounded-xl px-3 py-2 flex-1">
                <p class="text-sm font-semibold text-slate-900">${escapeHtml(cu.name)}</p>
                <p class="text-sm text-slate-700">${escapeHtml(c.text)}</p>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="flex gap-2">
          <input id="comment-input-${p.id}" type="text" placeholder="Escreva um comentário..." class="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" onkeydown="if(event.key==='Enter')addComment('${p.id}')">
          <button onclick="addComment('${p.id}')" class="bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium">Enviar</button>
        </div>
      </div>
    </article>`;
  }).join('') || '<p class="text-center text-slate-500 py-8">Nenhuma publicação neste filtro.</p>';
}

function toggleLike(postId) {
  const p = state.posts.find(x => x.id === postId);
  if (!p) return;
  p.likes = p.likes || [];
  const i = p.likes.indexOf('u1');
  if (i >= 0) p.likes.splice(i, 1);
  else {
    p.likes.push('u1');
    showToast('Curtido!');
  }
  saveState();
  renderFeed();
}

function toggleComments(postId) {
  document.getElementById('comments-' + postId)?.classList.toggle('hidden');
}

function addComment(postId) {
  const input = document.getElementById('comment-input-' + postId);
  const text = (input?.value || '').trim();
  if (!text) return;
  const p = state.posts.find(x => x.id === postId);
  if (!p) return;
  p.comments = p.comments || [];
  p.comments.push({ id: uid('c'), userId: 'u1', text });
  saveState();
  if (input) input.value = '';
  renderFeed();
  document.getElementById('comments-' + postId)?.classList.remove('hidden');
  showToast('Comentário publicado');
}

function sharePost(postId) {
  showToast('Link da publicação copiado!');
}

function publishPost() {
  const textarea = document.getElementById('new-post');
  const text = (textarea?.value || '').trim();
  if (!text) {
    showToast('Escreva algo para publicar');
    return;
  }
  const type = document.getElementById('post-type')?.value || 'geral';
  state.posts.unshift({
    id: uid('p'),
    userId: 'u1',
    type,
    text,
    likes: [],
    comments: [],
    createdAt: Date.now(),
  });
  if (textarea) textarea.value = '';
  saveState();
  renderFeed();
  showToast('Publicação criada!');
}

function filterFeed(type, btn) {
  state.feedFilter = type;
  document.querySelectorAll('.feed-filter').forEach(b => {
    b.classList.remove('bg-primary-700', 'text-white');
    b.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
  });
  if (btn) {
    btn.classList.add('bg-primary-700', 'text-white');
    btn.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');
  }
  renderFeed();
  showToast('Filtro: ' + type);
}

// ========== MESSAGES ==========
function renderConversations() {
  const list = document.querySelector('#conv-list .flex-1.overflow-y-auto, #conv-list .scrollbar-thin');
  // find scroll container
  const containers = document.querySelectorAll('#conv-list .overflow-y-auto');
  const container = containers[containers.length - 1] || document.querySelector('#page-messages .overflow-y-auto');
  // Rebuild conversation items
  const parent = document.querySelector('#conv-list');
  if (!parent) return;
  let scrollEl = parent.querySelector('.overflow-y-auto.scrollbar-thin') || parent.querySelector('.flex-1.overflow-y-auto');
  if (!scrollEl) {
    // find any overflow container inside conv-list
    scrollEl = Array.from(parent.querySelectorAll('div')).find(d => d.className.includes('overflow'));
  }
  if (!scrollEl) return;

  const convs = state.conversations.filter(c => !c.archived).sort((a, b) => b.updatedAt - a.updatedAt);
  scrollEl.innerHTML = convs.map(cv => {
    const otherId = cv.participants.find(id => id !== 'u1');
    const other = userById(otherId) || { name: 'Grupo', avatar: 'GT', bg: '1e40af' };
    const active = state.activeConversation === cv.id;
    return `
    <div onclick="selectConversation('${cv.id}')" class="conv-item flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer border-l-4 ${active ? 'border-primary-600 bg-primary-50/50' : 'border-transparent'}">
      <div class="relative">
        <img src="${avatarUrl(other, 48)}" class="w-12 h-12 rounded-full" alt="">
        ${cv.secure ? '<span class="absolute -top-1 -right-1 text-xs">🔒</span>' : ''}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between"><h4 class="font-semibold text-slate-900 text-sm truncate">${escapeHtml(other.name)}</h4><span class="text-xs text-slate-400">${timeAgo(cv.updatedAt)}</span></div>
        <p class="text-sm text-slate-600 truncate">${escapeHtml(cv.lastMessage)}</p>
      </div>
      ${cv.unread ? `<span class="w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">${cv.unread}</span>` : ''}
    </div>`;
  }).join('') || '<p class="p-4 text-sm text-slate-500">Nenhuma conversa</p>';

  if (state.activeConversation) renderChat(state.activeConversation);
}

function selectConversation(cvId) {
  state.activeConversation = cvId;
  const cv = state.conversations.find(c => c.id === cvId);
  if (cv) cv.unread = 0;
  saveState();
  document.getElementById('chat-panel')?.classList.remove('hidden');
  document.getElementById('chat-panel')?.classList.add('flex');
  document.getElementById('conv-list')?.classList.add('hidden', 'sm:flex');
  renderConversations();
  updateBadges();
}

function selectConversationLegacy(el, name) {
  // compat with old HTML onclick — find by name
  const u = state.users.find(x => x.name === name);
  if (u) {
    let cv = state.conversations.find(c => c.participants.includes(u.id) && c.participants.includes('u1'));
    if (!cv) {
      cv = { id: uid('cv'), participants: ['u1', u.id], lastMessage: '', updatedAt: Date.now(), unread: 0, archived: false, secure: false };
      state.conversations.push(cv);
      state.messages[cv.id] = [];
    }
    selectConversation(cv.id);
  }
}

function backToConversations() {
  document.getElementById('chat-panel')?.classList.add('hidden');
  document.getElementById('chat-panel')?.classList.remove('flex');
  document.getElementById('conv-list')?.classList.remove('hidden');
}

function renderChat(cvId) {
  const cv = state.conversations.find(c => c.id === cvId);
  if (!cv) return;
  const otherId = cv.participants.find(id => id !== 'u1');
  const other = userById(otherId);
  const nameEl = document.getElementById('chat-name');
  const avatarEl = document.getElementById('chat-avatar');
  if (nameEl && other) nameEl.textContent = other.name;
  if (avatarEl && other) avatarEl.src = avatarUrl(other, 40);

  const badge = document.getElementById('secure-room-badge');
  const btn = document.getElementById('btn-secure-room');
  if (cv.secure) {
    badge?.classList.remove('hidden');
    if (btn) {
      btn.textContent = 'Sala Segura ativa';
      btn.disabled = true;
      btn.classList.add('bg-emerald-100', 'text-emerald-700');
    }
  } else {
    badge?.classList.add('hidden');
    if (btn) {
      btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Sala Segura`;
      btn.disabled = false;
      btn.classList.remove('bg-emerald-100', 'text-emerald-700');
    }
  }

  const container = document.getElementById('chat-messages');
  if (!container) return;
  const msgs = state.messages[cvId] || [];
  container.innerHTML = msgs.map(m => {
    const mine = m.from === 'u1';
    if (m.system) {
      return `<div class="flex justify-center"><div class="bg-emerald-50 text-emerald-800 text-xs font-medium px-4 py-2 rounded-full border border-emerald-200">${escapeHtml(m.text)}</div></div>`;
    }
    return mine
      ? `<div class="flex justify-end"><div class="message-bubble bg-primary-700 text-white rounded-2xl rounded-tr-md px-4 py-2.5 shadow-sm"><p class="text-sm">${escapeHtml(m.text)}</p><span class="text-[10px] text-primary-200 mt-1 block text-right">${timeAgo(m.at)} ✓✓</span></div></div>`
      : `<div class="flex justify-start"><div class="message-bubble bg-white rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm border border-slate-100"><p class="text-sm text-slate-700">${escapeHtml(m.text)}</p><span class="text-[10px] text-slate-400 mt-1 block">${timeAgo(m.at)}</span></div></div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const text = (input?.value || '').trim();
  if (!text || !state.activeConversation) return;
  const cvId = state.activeConversation;
  if (!state.messages[cvId]) state.messages[cvId] = [];
  state.messages[cvId].push({ id: uid('m'), from: 'u1', text, at: Date.now() });
  const cv = state.conversations.find(c => c.id === cvId);
  if (cv) {
    cv.lastMessage = text;
    cv.updatedAt = Date.now();
  }
  if (input) input.value = '';
  saveState();
  renderChat(cvId);
  renderConversations();
}

function archiveConversation() {
  const cv = state.conversations.find(c => c.id === state.activeConversation);
  if (cv) {
    cv.archived = true;
    state.activeConversation = state.conversations.find(c => !c.archived)?.id || null;
    saveState();
    renderConversations();
    showToast('Conversa arquivada');
  }
}

function deleteConversation() {
  if (!confirm('Excluir esta conversa?')) return;
  const id = state.activeConversation;
  state.conversations = state.conversations.filter(c => c.id !== id);
  delete state.messages[id];
  state.activeConversation = state.conversations[0]?.id || null;
  saveState();
  renderConversations();
  showToast('Conversa excluída');
}

// ========== NETWORK ==========
function connLabel(userId) {
  const st = state.connectionRequests[userId];
  if (st === 'connected' || me().connections.includes(userId)) return 'Conectado';
  if (st === 'pending') return 'Pendente';
  return 'Conectar';
}

function renderNetwork() {
  // Network cards are mostly static in HTML; we update button states if we re-render
  // For full interactivity, update connect buttons by data attribute if present
  document.querySelectorAll('[data-user-id]').forEach(btn => {
    const id = btn.dataset.userId;
    btn.textContent = connLabel(id);
  });
}

function connectUser(btn, nameOrId) {
  let u = state.users.find(x => x.id === nameOrId || x.name === nameOrId);
  if (!u && typeof nameOrId === 'string') {
    // try partial
    u = state.users.find(x => x.name.includes(nameOrId));
  }
  if (!u) {
    showToast('Usuário não encontrado');
    return;
  }
  const id = u.id;
  const cur = state.connectionRequests[id];
  if (cur === 'connected' || me().connections.includes(id)) {
    showToast('Você já está conectado com ' + u.name);
    if (btn) {
      btn.textContent = 'Conectado';
      btn.className = (btn.className || '').replace(/bg-primary-700[^\s]*/g, '') + ' flex-1 conn-connected text-sm font-medium py-2 rounded-xl transition';
    }
    return;
  }
  if (cur === 'pending') {
    delete state.connectionRequests[id];
    if (btn) {
      btn.textContent = 'Conectar';
      btn.className = 'flex-1 bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium py-2 rounded-xl transition';
    }
    saveState();
    showToast('Solicitação cancelada');
    return;
  }
  state.connectionRequests[id] = 'pending';
  // auto-accept after "demo" — or leave pending
  setTimeout(() => {
    state.connectionRequests[id] = 'connected';
    if (!me().connections.includes(id)) me().connections.push(id);
    state.notifications.unshift({
      id: uid('n'),
      text: `<strong>${escapeHtml(u.name)}</strong> aceitou sua solicitação de conexão`,
      time: 'agora',
      read: false,
      avatar: u.avatar,
      bg: u.bg,
    });
    saveState();
    updateBadges();
  }, 3000);
  if (btn) {
    btn.textContent = 'Pendente';
    btn.className = 'flex-1 conn-pending text-sm font-medium py-2 rounded-xl transition';
    btn.dataset.userId = id;
  }
  saveState();
  showToast('Solicitação enviada para ' + u.name);
}

function messageUser(name) {
  const u = state.users.find(x => x.name === name);
  if (!u) return;
  let cv = state.conversations.find(c => c.participants.includes(u.id) && c.participants.includes('u1'));
  if (!cv) {
    cv = { id: uid('cv'), participants: ['u1', u.id], lastMessage: '', updatedAt: Date.now(), unread: 0, archived: false, secure: false };
    state.conversations.unshift(cv);
    state.messages[cv.id] = [];
    saveState();
  }
  state.activeConversation = cv.id;
  showPage('messages');
  selectConversation(cv.id);
  showToast('Conversa com ' + name);
}

// ========== COMMUNITIES ==========
function renderCommunities() {}

function enterCommunity(name) {
  const cm = state.communities.find(c => c.name === name || c.name.includes(name.split(' ')[0]));
  document.getElementById('community-name').textContent = name;
  showPage('community-detail');
  const topics = (cm && state.communityTopics[cm.id]) || state.communityTopics.cm2 || [];
  const container = document.querySelector('#page-community-detail .space-y-3');
  if (container && topics.length) {
    container.innerHTML = topics.map(t => `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition cursor-pointer" onclick="showToast('Tópico: ${escapeHtml(t.title)}')">
        <div class="flex items-center gap-2 mb-2"><span class="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">${escapeHtml(t.tag)}</span><span class="text-xs text-slate-400">${escapeHtml(t.at)}</span></div>
        <h3 class="font-semibold text-slate-900">${escapeHtml(t.title)}</h3>
        <p class="text-xs text-slate-400 mt-2">${t.replies} respostas • por ${escapeHtml(t.author)}</p>
      </div>
    `).join('');
  }
}

function joinCommunity(btn) {
  const joined = btn.dataset.joined === '1';
  if (joined) {
    btn.textContent = 'Entrar';
    btn.dataset.joined = '0';
    btn.className = 'text-primary-700 font-medium text-sm hover:underline flex-shrink-0';
    showToast('Você saiu da comunidade');
  } else {
    btn.textContent = 'Membro';
    btn.dataset.joined = '1';
    btn.className = 'text-emerald-600 font-medium text-sm flex-shrink-0';
    showToast('Você entrou na comunidade!');
  }
  // update state by community name from sibling
  saveState();
}

function createTopic() {
  const title = document.getElementById('new-topic-title')?.value.trim();
  if (!title) {
    showToast('Digite o título do tópico');
    return;
  }
  if (!state.communityTopics.cm2) state.communityTopics.cm2 = [];
  state.communityTopics.cm2.unshift({
    id: uid('t'),
    title,
    tag: 'Discussão',
    replies: 0,
    author: 'Carlos Silva',
    at: 'agora',
  });
  document.getElementById('new-topic-title').value = '';
  closeModal('modal-topic');
  saveState();
  showToast('Tópico criado: ' + title);
  if (state.currentPage === 'community-detail') enterCommunity(document.getElementById('community-name')?.textContent || 'Tecnologia & SaaS');
}

// ========== NOTIFICATIONS ==========
function renderNotifications() {
  const container = document.querySelector('#page-notifications .space-y-2');
  if (!container) return;
  container.innerHTML = state.notifications.map(n => `
    <div onclick="openNotification('${n.id}')" class="notif-item ${n.read ? '' : 'notif-unread'} bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-sm transition">
      <div class="flex gap-3">
        ${n.avatar
          ? `<img src="https://ui-avatars.com/api/?name=${n.avatar}&background=${n.bg || '1e40af'}&color=fff&size=40" class="w-10 h-10 rounded-full flex-shrink-0" alt="">`
          : `<div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">${n.icon || '🔔'}</div>`}
        <div><p class="text-sm text-slate-800">${n.text}</p><p class="text-xs text-slate-400 mt-1">${escapeHtml(n.time)}</p></div>
      </div>
    </div>
  `).join('') || '<p class="text-slate-500 text-sm p-4">Nenhuma notificação</p>';
}

function markAllRead() {
  state.notifications.forEach(n => n.read = true);
  saveState();
  renderNotifications();
  updateBadges();
  showToast('Todas marcadas como lidas');
}

function openNotification(id) {
  const n = state.notifications.find(x => x.id === id);
  if (n) {
    n.read = true;
    saveState();
    renderNotifications();
    updateBadges();
  }
  showToast('Notificação aberta');
}

function updateBadges() {
  const unread = state.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-badge');
  if (badge) badge.classList.toggle('hidden', unread === 0);
  const msgUnread = state.conversations.reduce((s, c) => s + (c.unread || 0), 0);
  // optional message badges
}

// ========== PROFILE ==========
function renderProfile() {
  const u = me();
  document.querySelectorAll('#bizpoints-count').forEach(el => {
    el.textContent = u.bizPoints;
  });
}

function saveProfile() {
  const modal = document.getElementById('modal-edit-profile');
  if (!modal) return;
  const inputs = modal.querySelectorAll('input, textarea');
  const u = me();
  if (inputs[0]) u.name = inputs[0].value;
  if (inputs[1]) u.role = inputs[1].value;
  if (inputs[2]) u.company = inputs[2].value;
  if (inputs[3]) u.bio = inputs[3].value;
  if (inputs[4]) u.city = inputs[4].value;
  saveState();
  closeModal('modal-edit-profile');
  showToast('Perfil atualizado!');
  // update header name
  document.querySelectorAll('header .text-sm.font-semibold').forEach(el => {
    if (el.textContent.includes('Carlos') || el.closest('[onclick*="profile"]')) el.textContent = u.name;
  });
}

function toggleSetting(el) {
  el.classList.toggle('on');
  const on = el.classList.contains('on');
  // map by parent text roughly
  showToast(on ? 'Ativado' : 'Desativado');
  saveState();
}

function renderSettings() {}

function upgradePlan(plan) {
  if (plan === 'Profissional' || plan === 'Empresarial') {
    me().premium = true;
    saveState();
  }
  showToast('Plano ' + plan + ' ativado! (demo local)');
}

// ========== MATCHMAKING ==========
function saveIntentions() {
  const buscando = document.getElementById('intent-buscando')?.value.trim() || '';
  const oferecendo = document.getElementById('intent-oferecendo')?.value.trim() || '';
  if (!buscando && !oferecendo) {
    showToast('Preencha o que você busca ou oferece');
    return;
  }
  state.intentions.buscando = buscando;
  state.intentions.oferecendo = oferecendo;
  me().buscando = buscando;
  me().oferecendo = oferecendo;
  saveState();
  showToast('Intenções salvas! Atualizando matches...');
  renderMatchmaking();
}

function scoreMatch(a, b) {
  let s = 40;
  if (a.buscando && b.oferecendo) {
    const words = a.buscando.toLowerCase().split(/\s+/);
    words.forEach(w => { if (w.length > 3 && b.oferecendo.toLowerCase().includes(w)) s += 12; });
  }
  if (a.oferecendo && b.buscando) {
    const words = a.oferecendo.toLowerCase().split(/\s+/);
    words.forEach(w => { if (w.length > 3 && b.buscando.toLowerCase().includes(w)) s += 12; });
  }
  if (a.segment === b.segment) s += 10;
  return Math.min(99, Math.max(35, s));
}

function renderMatchmaking() {
  const list = document.getElementById('matches-list');
  if (!list) return;
  const self = me();
  const matches = state.users
    .filter(u => u.id !== 'u1')
    .map(u => ({ user: u, score: scoreMatch(self, u) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const header = list.querySelector('h2');
  list.innerHTML = (header ? header.outerHTML : '<h2 class="font-semibold text-slate-900">Matches sugeridos</h2>') +
    matches.map(({ user: u, score }) => {
      const cls = score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low';
      return `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-sm transition cursor-pointer" onclick="viewMatch('${escapeHtml(u.name)}', ${score})">
        <div class="match-score ${cls}">${score}%</div>
        <img src="${avatarUrl(u, 48)}" class="w-12 h-12 rounded-full" alt="">
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-900">${escapeHtml(u.name)} · ${escapeHtml(u.company)}</p>
          <p class="text-sm text-slate-500 truncate">Oferece: ${escapeHtml(u.oferecendo || '—')} · Busca: ${escapeHtml(u.buscando || '—')}</p>
        </div>
        <button onclick="event.stopPropagation(); connectUser(this, '${u.id}')" class="text-primary-700 text-sm font-medium hover:underline flex-shrink-0">${connLabel(u.id)}</button>
      </div>`;
    }).join('') +
    '<p class="text-xs text-slate-400 text-center pt-2">Sugestões também chegam por notificação</p>';
}

function viewMatch(name, score) {
  openModal('modal-match');
  const title = document.getElementById('match-modal-name');
  if (title) title.textContent = name;
  const scoreEl = document.getElementById('match-modal-score');
  if (scoreEl) scoreEl.textContent = score + '%';
}

function connectMatch() {
  const name = document.getElementById('match-modal-name')?.textContent;
  closeModal('modal-match');
  if (name) connectUser(null, name);
  else showToast('Solicitação enviada!');
}

function createOpportunityAd() {
  const title = document.getElementById('opp-ad-title')?.value.trim();
  if (!title) {
    showToast('Informe o título da oportunidade');
    return;
  }
  state.opportunities.unshift({
    id: uid('o'),
    type: 'Oportunidade',
    title,
    desc: title,
    userId: 'u1',
    at: 'agora',
    interested: false,
  });
  state.posts.unshift({
    id: uid('p'),
    userId: 'u1',
    type: 'oportunidade',
    text: title,
    likes: [],
    comments: [],
    createdAt: Date.now(),
  });
  closeModal('modal-opp-ad');
  saveState();
  showToast('Anúncio publicado!');
  if (document.getElementById('opp-ad-title')) document.getElementById('opp-ad-title').value = '';
}

// ========== NDA / SECURE ==========
function activateSecureRoom() {
  openModal('modal-nda');
}

function signNDA() {
  const check = document.getElementById('nda-accept');
  if (check && !check.checked) {
    showToast('Aceite o termo para continuar');
    return;
  }
  const cv = state.conversations.find(c => c.id === state.activeConversation);
  if (cv) {
    cv.secure = true;
    if (!state.messages[cv.id]) state.messages[cv.id] = [];
    state.messages[cv.id].push({
      id: uid('m'),
      from: 'system',
      system: true,
      text: '🔒 Sala Segura ativada — NDA assinado (hash: ' + Math.random().toString(36).slice(2, 10) + ')',
      at: Date.now(),
    });
  }
  saveState();
  closeModal('modal-nda');
  if (state.activeConversation) renderChat(state.activeConversation);
  showToast('NDA assinado! Sala Segura ativada.');
}

function downloadNDAProof() {
  const content = `BizConnect — Comprovante de NDA\nData: ${new Date().toLocaleString('pt-BR')}\nPartes: Carlos Silva e interlocutor\nHash: ${Math.random().toString(36).slice(2)}\nStatus: Assinado digitalmente (demo)`;
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'nda-comprovante-bizconnect.txt';
  a.click();
  showToast('Comprovante baixado');
}

// ========== INDICATIONS ==========
function renderIndications() {
  document.querySelectorAll('#bizpoints-count').forEach(el => {
    el.textContent = me().bizPoints;
  });
}

function openIndicateModal() {
  openModal('modal-indicate');
}

function submitIndication() {
  const toName = document.getElementById('indicate-to')?.value.trim();
  const forName = document.getElementById('indicate-for')?.value.trim();
  if (!toName || !forName) {
    showToast('Preencha quem indicar e para quem');
    return;
  }
  const to = state.users.find(u => u.name.toLowerCase().includes(toName.toLowerCase())) || { id: 'ux', name: toName };
  const forU = state.users.find(u => u.name.toLowerCase().includes(forName.toLowerCase())) || { id: 'uy', name: forName };
  state.indications.unshift({
    id: uid('i'),
    from: 'u1',
    to: to.id,
    forUser: forU.id,
    toName: to.name || toName,
    forName: forU.name || forName,
    status: 'pending',
    note: '',
    points: 0,
  });
  closeModal('modal-indicate');
  saveState();
  showToast('Indicação registrada!');
  if (state.currentPage === 'indications') showPage('indications');
}

function confirmIndication(btn, type) {
  // find parent indication - use closest data or just award points
  btn.disabled = true;
  btn.textContent = type === 'meeting' ? 'Reunião confirmada' : 'Negócio confirmado';
  btn.classList.add('opacity-60');
  if (type === 'deal') {
    me().bizPoints += 50;
    document.querySelectorAll('#bizpoints-count').forEach(el => el.textContent = me().bizPoints);
    showToast('+50 BizPoints! Catalisador atualizado.');
  } else {
    showToast('Reunião confirmada');
  }
  saveState();
}

// ========== OPPORTUNITIES ==========
function renderOpportunities() {
  const container = document.querySelector('#page-opportunities .space-y-4');
  if (!container) return;
  const typeColor = {
    'Parceria Comercial': 'amber',
    'Investimento': 'violet',
    'Vaga / Co-founder': 'blue',
    'Oportunidade': 'amber',
  };
  container.innerHTML = state.opportunities.map(o => {
    const u = userById(o.userId) || me();
    const color = typeColor[o.type] || 'slate';
    return `
    <div class="bg-white rounded-2xl border border-slate-200 p-5">
      <div class="flex items-center gap-2 mb-2"><span class="bg-${color}-50 text-${color}-700 text-xs font-semibold px-2.5 py-1 rounded-full">${escapeHtml(o.type)}</span><span class="text-xs text-slate-400">${escapeHtml(o.at)}</span></div>
      <h3 class="font-semibold text-slate-900 text-lg mb-1">${escapeHtml(o.title)}</h3>
      <p class="text-sm text-slate-600 mb-3">${escapeHtml(o.desc)}</p>
      <div class="flex items-center gap-3 text-sm flex-wrap">
        <img src="${avatarUrl(u, 32)}" class="w-7 h-7 rounded-full" alt="">
        <span class="text-slate-700 font-medium">${escapeHtml(u.name)}</span>
        <span class="text-slate-400">• ${escapeHtml(u.company)}</span>
        <button onclick="applyOpportunity('${o.id}')" class="ml-auto text-primary-700 font-medium hover:underline">${o.interested ? 'Interesse registrado' : 'Ver detalhes'}</button>
      </div>
    </div>`;
  }).join('');
}

function viewOpportunity(title) {
  openModal('modal-opportunity');
}

function applyOpportunity(id) {
  const o = id ? state.opportunities.find(x => x.id === id) : null;
  if (o) {
    o.interested = true;
    saveState();
    renderOpportunities();
  }
  closeModal('modal-opportunity');
  showToast('Interesse registrado! O anunciante será notificado.');
}

// ========== VERIFICATION ==========
function requestVerification(level) {
  if (level === 'premium') {
    me().premium = true;
    state.notifications.unshift({
      id: uid('n'),
      text: 'Sua solicitação <strong>Premium</strong> foi recebida. Agende a videochamada de curadoria.',
      time: 'agora',
      read: false,
      icon: '⭐',
    });
    saveState();
    showToast('Solicitação de curadoria enviada!');
  } else {
    showToast('Documentos enviados para verificação.');
  }
  closeModal('modal-verification');
  updateBadges();
}

function useInviteCode() {
  const code = document.getElementById('invite-code')?.value.trim();
  if (!code) {
    showToast('Digite o código de convite');
    return;
  }
  me().premium = true;
  saveState();
  showToast('Convite validado! Acesso Premium liberado.');
  closeModal('modal-verification');
}

// ========== MODALS ==========
function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
}

// ========== GLOBAL REFRESH ==========
function refreshAll() {
  renderFeed();
  updateBadges();
  renderProfile();
}

// ========== EVENTS ==========
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey && document.activeElement?.id === 'message-input') {
    e.preventDefault();
    sendMessage();
  }
  if (e.key === 'Escape') {
    closeSearch();
    document.querySelectorAll('[id^="modal-"]').forEach(m => m.classList.add('hidden'));
  }
});

// Auto-login if session exists
document.addEventListener('DOMContentLoaded', () => {
  if (state.session) {
    document.getElementById('auth-screen')?.classList.add('hidden');
    document.getElementById('app-screen')?.classList.remove('hidden');
    showPage(state.currentPage || 'feed');
  }
});

// Expose selectConversation for old HTML that passes element
window.selectConversation = function(elOrId, name) {
  if (typeof elOrId === 'string' && elOrId.startsWith('cv')) {
    selectConversation(elOrId);
  } else if (typeof name === 'string') {
    selectConversationLegacy(elOrId, name);
  } else if (typeof elOrId === 'string') {
    selectConversation(elOrId);
  }
};
