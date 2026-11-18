'use strict';

const AVATAR = {
  'avatar-rocket': '🚀', 'avatar-comet': '☄️', 'avatar-star': '🌟', 'avatar-dragon': '🐉'
};
const THEMES = {
  'theme-lime': { color: '#c5f36b', bg: '#0b1020' },
  'theme-ocean': { color: '#69e3eb', bg: '#081b25' },
  'theme-sunset': { color: '#ffad73', bg: '#21130f' },
  'theme-violet': { color: '#c4a1ff', bg: '#171126' },
  'theme-cyberpunk': { color: '#ff70d9', bg: '#160d26' },
  'theme-mint': { color: '#83f0c1', bg: '#0b1c1b' }
};
const SHOP = [
  { id:'theme-lime', name:'Неоновый лайм', desc:'Стартовое оформление FitQuest.', price:0, kind:'theme', emoji:'🟢', category:'theme' },
  { id:'theme-ocean', name:'Океанический импульс', desc:'Бирюзовые акценты и глубокий морской фон.', price:120, kind:'theme', emoji:'🌊', category:'theme' },
  { id:'theme-sunset', name:'Тёплый закат', desc:'Янтарные акценты для вечерних занятий.', price:160, kind:'theme', emoji:'🌅', category:'theme' },
  { id:'theme-violet', name:'Фиолетовая галактика', desc:'Лавандовые акценты и космическая атмосфера.', price:200, kind:'theme', emoji:'🌌', category:'theme' },
  { id:'theme-cyberpunk', name:'Киберпанк', desc:'Неон, бирюза и розово-фиолетовая атмосфера.', price:280, kind:'theme', emoji:'🦾', category:'theme' },
  { id:'theme-mint', name:'Мятный старт', desc:'Мягкая мятная цветовая схема.', price:0, kind:'theme', emoji:'🍃', category:'theme' },
  { id:'avatar-rocket', name:'Аватар «Ракета»', desc:'Стартовый аватар героя.', price:0, kind:'avatar', emoji:'🚀', category:'theme' },
  { id:'avatar-comet', name:'Аватар «Комета»', desc:'Забери ещё один бесплатный аватар.', price:0, kind:'avatar', emoji:'☄️', category:'theme' },
  { id:'avatar-star', name:'Аватар «Звезда»', desc:'Аватар для яркой коллекции.', price:90, kind:'avatar', emoji:'🌟', category:'theme' },
  { id:'avatar-dragon', name:'Аватар «Дракон»', desc:'Редкий вид для твоего профиля.', price:150, kind:'avatar', emoji:'🐉', category:'theme' },
  { id:'course-back', name:'Здоровая спина · 7 дней', desc:'Мягкая подвижность, перерывы от сидения и спокойная разминка.', price:240, kind:'course', emoji:'🧘', category:'course', programId:'back-7' },
  { id:'course-posture', name:'Курс по осанке · 7 дней', desc:'Рабочее место, перерывы, мягкие движения и полезные привычки.', price:220, kind:'course', emoji:'🧍', category:'course', programId:'posture-7' },
  { id:'course-splits', name:'Шпагат с нуля', desc:'Постепенная гибкость без рывков и принуждения.', price:260, kind:'course', emoji:'🤸', category:'course', programId:'flexibility-14' },
  { id:'course-endurance', name:'План выносливости · 30 дней', desc:'Прогулки и любимая активность с днями восстановления.', price:320, kind:'course', emoji:'🏃', category:'course', programId:'endurance-30' },
  { id:'course-strength', name:'Сила и техника · 14 дней', desc:'Основы движений с собственным весом и дни восстановления.', price:300, kind:'course', emoji:'💪', category:'course', programId:'strength-14' },
  { id:'marathon-7day', name:'Марафон «7 активных дней»', desc:'Самостоятельный недельный челлендж без внешнего куратора.', price:300, kind:'marathon', emoji:'🏁', category:'marathon' },
  { id:'mealplan-week', name:'Сбалансированное меню на неделю', desc:'Идеи простых блюд и список продуктов без строгой диеты.', price:180, kind:'mealplan', emoji:'🥗', category:'mealplan' },
  { id:'streak-freeze', name:'Заморозка серии', desc:'Один запас для сохранения серии при пропуске одного дня.', price:100, kind:'streakFreeze', emoji:'🧊', category:'streakFreeze' },
  { id:'voice-calm', name:'Голос таймера · спокойный', desc:'Мягкий тембр и медленный темп синтезированной речи.', price:100, kind:'voice', emoji:'🌿', category:'voice', pitch:.88, rate:.86 },
  { id:'voice-energy', name:'Голос таймера · энергичный', desc:'Более высокий тон и бодрый темп синтезированной речи.', price:130, kind:'voice', emoji:'⚡', category:'voice', pitch:1.18, rate:1.08 },
  { id:'voice-commander', name:'Голос таймера · командный стиль', desc:'Более низкий тон и короткие объявления таймера.', price:150, kind:'voice', emoji:'🎙️', category:'voice', pitch:.72, rate:.98 }
];
const QUESTS = [
  { id: 'geo-walk-500', icon: '🚶', name: 'Первый маршрут · 500 м', desc: 'Набери GPS-подтверждённые 500 метров за день.', coins: 20, xp: 20, metric: 'meters', target: 500 },
  { id: 'geo-walk-1000', icon: '🧭', name: 'Исследователь · 1 км', desc: 'Набери 1 000 метров GPS-подтверждённой прогулки за день.', coins: 40, xp: 40, metric: 'meters', target: 1000 },
  { id: 'geo-away-300', icon: '📍', name: 'Новая территория · 300 м', desc: 'Во время GPS-прогулки отойди минимум на 300 метров от точки старта.', coins: 30, xp: 30, metric: 'farthest', target: 300 }
];
const PROGRAMS = [
  { id:'activation-7', title:'7 дней движения', length:7, emoji:'🌱', description:'Бесплатный стартовый план с движением и восстановлением.', itemId:null },
  { id:'back-7', title:'Здоровая спина · 7 дней', length:7, emoji:'🧘', description:'Мягкая подвижность и паузы от сидения.', itemId:'course-back' },
  { id:'posture-7', title:'Курс по осанке · 7 дней', length:7, emoji:'🧍', description:'Комфортное рабочее место и привычки движения.', itemId:'course-posture' },
  { id:'flexibility-14', title:'Гибкость · 14 дней', length:14, emoji:'🤸', description:'Спокойная гибкость с перерывами и без рывков.', itemId:'course-splits' },
  { id:'endurance-30', title:'Выносливость · 30 дней', length:30, emoji:'🏃', description:'Постепенные прогулки и любимая активность.', itemId:'course-endurance' },
  { id:'strength-14', title:'Сила и техника · 14 дней', length:14, emoji:'💪', description:'Простые движения с собственным весом и дни восстановления.', itemId:'course-strength' }
];

let authMode = 'register';
let currentState = null;
let currentFilter = 'all';
let activeProgramId = null;
let geoWatchId = null;
let geoTracking = false;
let geoQueue = Promise.resolve();
let lastGpsSent = 0;
let timerInterval = null;
let timerRemaining = 300;
let toastTimer = null;
let lastRenderedPage = 'home';

const $ = id => document.getElementById(id);
const localTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tashkent';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const formatMeters = value => Number(value || 0) >= 1000 ? `${(Number(value) / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} км` : `${Math.round(Number(value || 0))} м`;
const formatDate = value => {
  if (!value) return '';
  try { return new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; }
};
function toast(message, isError = false) {
  const el = $('toast'); if (!el) return;
  el.textContent = message; el.classList.toggle('error', isError); el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 3000);
}
function setStatus(id, message, isError = false) {
  const el = $(id); if (!el) return;
  el.textContent = message; el.classList.toggle('error', isError);
}
async function api(url, options = {}) {
  const init = { method: options.method || 'GET', credentials: 'same-origin', headers: { Accept: 'application/json' } };
  if (options.body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(body.error || `Ошибка запроса (${response.status}).`);
    err.status = response.status;
    throw err;
  }
  return body;
}
function setAuthMode(mode) {
  authMode = mode;
  $('showRegister').classList.toggle('active', mode === 'register');
  $('showRegister').classList.toggle('secondary', mode !== 'register');
  $('showLogin').classList.toggle('active', mode === 'login');
  $('showLogin').classList.toggle('secondary', mode !== 'login');
  $('authNickField').hidden = mode === 'login';
  $('authNick').required = mode === 'register';
  $('authPassword').autocomplete = mode === 'register' ? 'new-password' : 'current-password';
  $('authSubmit').textContent = mode === 'register' ? 'Создать профиль' : 'Войти';
  setStatus('authStatus', mode === 'register' ? 'Пароль будет сохранён на сервере в виде хеша.' : 'Введи email и пароль от существующего аккаунта.');
}
function showAuth(message = '') {
  currentState = null;
  $('authPage').hidden = false;
  $('appShell').hidden = true;
  $('authPassword').value = '';
  setAuthMode('register');
  if (message) setStatus('authStatus', message, true);
}
function applyState(state, fillForms = false) {
  currentState = state;
  document.body.dataset.user = String(state.user.id);
  if (fillForms) fillProfileForm();
  renderAll();
}
function fillProfileForm() {
  if (!currentState) return;
  const { user, settings } = currentState;
  $('profileNick').value = user.nick || '';
  $('profileEmail').value = user.email || '';
  $('profileBio').value = settings.profileBio || '';
  $('profileGoal').value = settings.profileGoal || 'general';
  $('profileActivity').value = settings.activity || 'moderate';
  $('profileHeight').value = settings.height || '';
  $('profileWeight').value = settings.weight || '';
  $('reminderTime').value = settings.reminderTime || '19:00';
  $('dailyReminder').checked = settings.dailyReminder !== false;
  $('missedReminder').checked = settings.missedReminder !== false;
  $('timezoneDisplay').value = settings.timezone || localTimezone();
}
async function afterAuth() {
  const state = await api('/api/state');
  $('authPage').hidden = true; $('appShell').hidden = false;
  applyState(state, true);
  setPage('home');
  checkReminders();
  toast(`Добро пожаловать, ${state.user.nick}!`);
}
async function processAuth(event) {
  event.preventDefault();
  const button = $('authSubmit'); button.disabled = true;
  setStatus('authStatus', authMode === 'register' ? 'Создаём защищённый аккаунт…' : 'Проверяем данные…');
  try {
    const email = $('authEmail').value.trim().toLowerCase();
    const password = $('authPassword').value;
    const body = { email, password, timezone: localTimezone() };
    if (authMode === 'register') body.nick = $('authNick').value.trim();
    await api(authMode === 'register' ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body });
    await afterAuth();
    await syncTimezoneIfNeeded();
  } catch (err) { setStatus('authStatus', err.message, true); }
  finally { button.disabled = false; button.textContent = authMode === 'register' ? 'Создать профиль' : 'Войти'; }
}
function setPage(page) {
  if (!currentState) return;
  const allowed = ['home', 'training', 'quests', 'shop', 'profile'];
  if (!allowed.includes(page)) return;
  for (const name of allowed) $(`page-${name}`).hidden = name !== page;
  document.querySelectorAll('.nav-btn[data-page]').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
  lastRenderedPage = page;
  if (page === 'profile') fillProfileForm();
  if (page === 'shop') renderShop();
  if (page === 'training') renderPrograms();
  if (page === 'home') renderLeaderboard();
}
function renderAll() {
  if (!currentState) return;
  $('authPage').hidden = true; $('appShell').hidden = false;
  $('welcomeTitle').textContent = `Привет, ${currentState.user.nick}!`;
  $('welcomeText').textContent = currentState.settings.profileBio || 'Твой следующий уровень начинается сегодня. Выбирай активность в своём ритме.';
  $('welcomeXp').textContent = Number(currentState.player.xp).toLocaleString('ru-RU');
  renderDashboard(); renderQuests(); renderShop(); renderLeaderboard(); renderWorkouts(); renderPrograms(); applyCosmetics(); updateClock();
}
function renderDashboard() {
  const p = currentState.player;
  const level = Math.floor(Number(p.xp) / 100) + 1;
  const xp = Number(p.xp) % 100;
  const levelWord = level < 3 ? 'Новичок' : level < 6 ? 'Следопыт' : level < 10 ? 'Воин' : 'Легенда';
  $('coins').textContent = `${Number(p.coins).toLocaleString('ru-RU')} 🪙`;
  $('levelName').textContent = `${level} · ${levelWord}`;
  $('streak').textContent = `${Number(p.streak)} 🔥`;
  $('levelTitle').textContent = `Уровень ${level} · ${levelWord}`;
  $('xpProgressText').textContent = `${xp} / 100 XP`;
  $('xpPercent').textContent = `${xp}%`;
  $('xpbar').style.width = `${xp}%`;
  $('totalActivities').textContent = Number(p.total).toLocaleString('ru-RU');
  $('weekXp').textContent = Number(p.xp).toLocaleString('ru-RU');
  $('freezeCount').textContent = Number(p.streakFreezes || 0);
  $('todayLabel').textContent = currentState.today;
  const badges = [];
  if (p.total >= 1) badges.push('🌱 Первый шаг');
  if (p.total >= 5) badges.push('🔥 Пять активностей');
  if (p.xp >= 100) badges.push('⬆️ Уровень 2');
  if (p.streak >= 7) badges.push('📅 Серия 7 дней');
  if (p.inventory.length >= 5) badges.push('🎒 Коллекционер');
  if (p.streakFreezes > 0) badges.push(`🧊 Заморозки ×${p.streakFreezes}`);
  $('badges').innerHTML = badges.length ? badges.map(b => `<span class="badge">${escapeHtml(b)}</span>`).join('') : '<span class="muted small">Первые достижения появятся после активности.</span>';
  $('streakMessage').textContent = p.streak ? `Текущая серия: ${p.streak} дней. Продолжай только если сегодня удобно.` : 'Начни с одного небольшого действия. Серия появится после первой активности.';
  $('dailyQuestCount').textContent = `${todayCompleted().length} / ${QUESTS.length}`;
}
function todayCompleted() {
  const history = currentState?.player?.history || {};
  return Array.isArray(history[currentState.today]) ? history[currentState.today] : [];
}
function renderQuests() {
  if (!currentState) return;
  $('geoDistance').textContent = formatMeters(currentState.geo.meters);
  $('geoFarthest').textContent = formatMeters(currentState.geo.farthestMeters);
  $('questList').innerHTML = QUESTS.map(task => {
    const done = todayCompleted().includes(task.id);
    const value = task.metric === 'farthest' ? currentState.geo.farthestMeters : currentState.geo.meters;
    const pct = Math.min(100, Math.round(Number(value) / task.target * 100));
    return `<article class="quest-card"><div class="quest-icon">${task.icon}</div><div><h3>${escapeHtml(task.name)}</h3><p>${escapeHtml(task.desc)}</p><div class="progress-bar"><i style="width:${pct}%"></i></div><span class="quest-meter">${formatMeters(value)} / ${formatMeters(task.target)}</span></div><div class="quest-reward"><b>+${task.coins} 🪙</b><span>+${task.xp} XP</span><div class="quest-status">${done ? '✓ Выполнено' : `${pct}%`}</div></div></article>`;
  }).join('');
  $('startWalkBtn').disabled = geoTracking;
  $('stopWalkBtn').disabled = !geoTracking;
}
function renderLeaderboard() {
  if (!currentState) return;
  const list = currentState.leaderboard || [];
  $('leaderboard').innerHTML = list.length ? list.map((player, index) => {
    const emoji = AVATAR[player.avatar] || '🚀';
    return `<div class="leader-row"><div class="rank">${index + 1}</div><div class="leader-avatar">${emoji}</div><div><div class="leader-name">${escapeHtml(player.name)}${player.name === currentState.user.nick ? ' <span class="badge">Ты</span>' : ''}</div><div class="leader-meta">${Number(player.total)} активностей · серия ${Number(player.streak)} дн.</div></div><div class="leader-points">${Number(player.xp).toLocaleString('ru-RU')} XP</div></div>`;
  }).join('') : '<p class="muted small">Пока нет участников. Ты можешь стать первым!</p>';
}
function renderWorkouts() {
  if (!currentState) return;
  const workouts = currentState.workouts || [];
  const emoji = { 'Прогулка': '🚶', 'Силовая тренировка': '💪', 'Растяжка': '🤸', 'Йога': '🧘', 'Велосипед': '🚴', 'Плавание': '🏊', 'Танцы': '💃', 'Другое': '⚡' };
  const markup = workouts.map(w => `<div class="workout-row"><div class="workout-emoji">${emoji[w.activityType] || '⚡'}</div><div class="workout-main"><b>${escapeHtml(w.activityType)} · ${Number(w.durationMinutes)} мин</b><span>${formatDate(w.loggedAt)}${w.note ? ` · ${escapeHtml(w.note)}` : ''}</span></div><div class="workout-reward">+${Number(w.xpAwarded)} XP<br>+${Number(w.coinsAwarded)} 🪙</div></div>`).join('');
  $('recentWorkouts').innerHTML = markup || '<p class="muted small">Пока нет тренировок. Добавь первую во вкладке «Тренировки».</p>';
}
function shopOwned(item) { return item.kind === 'streakFreeze' ? false : currentState.player.inventory.includes(item.id); }
function shopEquipped(item) {
  const p = currentState.player;
  return (item.kind === 'theme' && p.equippedTheme === item.id) || (item.kind === 'avatar' && p.equippedAvatar === item.id) || (item.kind === 'voice' && p.equippedVoice === item.id);
}
function renderShop() {
  if (!currentState) return;
  $('shopCoins').textContent = `${Number(currentState.player.coins).toLocaleString('ru-RU')} 🪙`;
  $('shopStatus').textContent = `🧊 Заморозки: ${Number(currentState.player.streakFreezes)} · 🎒 Предметов: ${currentState.player.inventory.length} · Покупки проверяются сервером`;
  const items = SHOP.filter(item => currentFilter === 'all' || item.category === currentFilter || item.kind === currentFilter);
  $('shopItems').innerHTML = items.map(item => {
    const owned = shopOwned(item), equipped = shopEquipped(item);
    let action = item.price === 0 ? 'Забрать бесплатно' : 'Купить';
    let kind = 'buy';
    if (item.kind === 'streakFreeze') action = 'Купить заморозку';
    else if (owned && ['course', 'marathon', 'mealplan'].includes(item.kind)) { action = 'Открыть'; kind = 'open'; }
    else if (owned) { action = equipped ? 'Уже выбрано' : 'Применить'; kind = equipped ? 'owned' : 'equip'; }
    const price = item.price === 0 ? 'Бесплатно' : `${item.price} 🪙`;
    return `<article class="shop-item"><div class="item-icon">${item.emoji}</div><div class="item-category">${escapeHtml(({theme:'Оформление',avatar:'Аватар',course:'Мини-курс',marathon:'Марафон',mealplan:'План меню',streakFreeze:'Расходник',voice:'Озвучка таймера'})[item.kind] || 'Награда')}</div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.desc)}</p><div class="item-footer"><span class="item-price">${price}</span><button type="button" data-shop-action="${kind}" data-item-id="${item.id}" ${kind === 'owned' ? 'disabled' : ''}>${action}</button></div></article>`;
  }).join('');
  const chips = SHOP.filter(item => currentState.player.inventory.includes(item.id)).map(item => {
    const equipped = shopEquipped(item);
    const content = ['course', 'marathon', 'mealplan'].includes(item.kind);
    return `<span class="inventory-chip ${equipped ? 'active' : ''}">${item.emoji} ${escapeHtml(item.name)} ${equipped ? '· выбрано' : ''} <button type="button" class="secondary" data-shop-action="${content ? 'open' : 'equip'}" data-item-id="${item.id}">${content ? 'Открыть' : equipped ? 'Выбрано' : 'Применить'}</button></span>`;
  }).join('');
  const freeze = currentState.player.streakFreezes ? `<span class="inventory-chip active">🧊 Заморозка серии ×${currentState.player.streakFreezes}</span>` : '';
  $('inventorySummary').innerHTML = `${chips}${freeze}` || '<span class="muted small">Коллекция пока пуста.</span>';
}
function applyCosmetics() {
  if (!currentState) return;
  const theme = THEMES[currentState.player.equippedTheme] || THEMES['theme-lime'];
  document.documentElement.style.setProperty('--lime', theme.color);
  document.documentElement.style.setProperty('--bg', theme.bg);
  $('logoSymbol').textContent = AVATAR[currentState.player.equippedAvatar] || '🚀';
  applyWallpaper();
}
async function openContent(item) {
  try {
    const content = await api(`/api/shop/content/${encodeURIComponent(item.id)}`);
    $('contentIcon').textContent = item.emoji;
    $('contentTitle').textContent = item.name;
    let html = `<p>${escapeHtml(item.desc)}</p>`;
    if (content.details?.length) html += `<h3>${item.kind === 'mealplan' ? 'Пример меню на неделю' : item.kind === 'marathon' ? 'План марафона' : 'План занятий'}</h3><ul>${content.details.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
    if (content.shopping?.length) html += `<h3>🛒 Список покупок</h3><ul>${content.shopping.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
    if (content.note) html += `<div class="content-note">${escapeHtml(content.note)}</div>`;
    $('contentBody').innerHTML = html;
    const ownedProgram = item.programId && currentState.player.inventory.includes(item.id);
    $('contentGoTraining').hidden = !ownedProgram;
    $('contentGoTraining').dataset.programId = item.programId || '';
    $('contentModal').hidden = false;
  } catch (err) { toast(err.message, true); }
}
async function handleShopAction(action, id) {
  const item = SHOP.find(x => x.id === id);
  if (!item || !currentState) return;
  try {
    if (action === 'buy') {
      const result = await api('/api/shop/buy', { method: 'POST', body: { itemId: id } });
      applyState(result.state);
      if (item.kind === 'streakFreeze') toast('Заморозка серии добавлена в запас! 🧊');
      else if (['course', 'marathon', 'mealplan'].includes(item.kind)) { toast('Материал открыт!'); openContent(item); }
      else toast(item.price === 0 ? 'Предмет добавлен в коллекцию!' : 'Покупка выполнена!');
    } else if (action === 'equip') {
      const result = await api('/api/shop/equip', { method: 'POST', body: { itemId: id } });
      applyState(result.state); toast('Предмет применён!');
    } else if (action === 'open') openContent(item);
  } catch (err) { toast(err.message, true); }
}
function programProgress(programId) { return currentState.programProgress.find(p => p.programId === programId) || null; }
function serverProgram(programId) { return (currentState.programs || []).find(p => p.id === programId) || null; }
function programUnlocked(program) { const item = serverProgram(program.id); return item ? item.unlocked : (!program.itemId || currentState.player.inventory.includes(program.itemId)); }
function renderPrograms() {
  if (!currentState) return;
  $('programGrid').innerHTML = PROGRAMS.map(program => {
    const server = serverProgram(program.id);
    const progress = programProgress(program.id);
    const done = progress?.completedDays?.length || 0;
    const unlocked = !!server?.unlocked;
    const pct = Math.round(done / program.length * 100);
    return `<article class="program-card"><div class="program-icon">${program.emoji}</div><div class="program-label">${unlocked ? (program.itemId ? 'Курс открыт' : 'Бесплатный старт') : 'Нужно открыть в магазине'}</div><h3>${escapeHtml(program.title)}</h3><p>${escapeHtml(program.description)}</p><div class="program-progress"><i style="width:${pct}%"></i></div><span class="muted tiny">${done} из ${program.length} дней · ${pct}%</span><button type="button" data-program-action="open" data-program-id="${program.id}">${!unlocked ? 'Открыть в магазине' : progress ? 'Продолжить' : 'Начать программу'}</button></article>`;
  }).join('');
  if (activeProgramId) renderProgramDetail(activeProgramId);
}
function renderProgramDetail(programId) {
  const program = PROGRAMS.find(p => p.id === programId);
  const server = serverProgram(programId);
  if (!program || !server) return;
  const progress = programProgress(programId);
  const doneDays = progress?.completedDays || [];
  const unlocked = !!server.unlocked;
  const nextDay = doneDays.length + 1;
  const completedToday = progress?.lastCompletedOn === currentState.today;
  let html = `<div class="card-head"><div><div class="eyebrow">Программа</div><h3>${program.emoji} ${escapeHtml(program.title)}</h3><p class="muted small">${escapeHtml(program.description)}</p></div><button class="secondary" type="button" id="closeProgramDetail">Закрыть</button></div>`;
  if (!unlocked) html += '<p class="muted">Сначала открой курс в магазине.</p>';
  else if (!progress) html += `<p class="muted">Дни отмечаются последовательно. За завершение дня: +10 XP и +5 коенов. Награда выдаётся сервером один раз.</p><button type="button" class="primary" data-program-action="start" data-program-id="${program.id}">Начать программу</button>`;
  else {
    html += `<p class="muted small">Отмечено дней: ${doneDays.length} из ${program.length}. Один день программы можно завершить за календарный день.</p>`;
    const days = Array.isArray(server.days) ? server.days : [];
    html += days.map((description, index) => {
      const day = index + 1, isDone = doneDays.includes(day), isNext = day === nextDay;
      const action = isNext && !completedToday ? `<button type="button" data-program-action="day" data-program-id="${program.id}" data-day="${day}">Завершить день</button>` : isDone ? '<span class="badge">✓ Завершено</span>' : isNext && completedToday ? '<span class="badge">Продолжи завтра</span>' : '<span class="muted tiny">Следующий этап</span>';
      return `<div class="program-day"><span class="program-day-number">${day}</span><div style="flex:1"><b>День ${day}</b><p>${escapeHtml(description)}</p></div><div>${isDone ? '<span class="badge">✓</span>' : action}</div></div>`;
    }).join('');
    if (doneDays.length === program.length) html += '<div class="notice">🎉 Программа завершена! Можно выбрать другую или повторить понравившуюся активность без давления на себя.</div>';
  }
  $('programDetail').innerHTML = html;
  $('programDetail').hidden = false;
  $('programDetail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
async function programAction(action, id, day) {
  const program = PROGRAMS.find(p => p.id === id);
  if (!program) return;
  try {
    let result;
    if (action === 'start') result = await api(`/api/programs/${encodeURIComponent(id)}/start`, { method: 'POST', body: {} });
    else if (action === 'day') result = await api(`/api/programs/${encodeURIComponent(id)}/day`, { method: 'POST', body: { day: Number(day) } });
    else if (action === 'open') {
      if (!programUnlocked(program)) { setPage('shop'); currentFilter = 'course'; document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === currentFilter)); renderShop(); toast('Сначала открой этот курс в магазине.'); return; }
      activeProgramId = id;
      if (!programProgress(id)) result = await api(`/api/programs/${encodeURIComponent(id)}/start`, { method: 'POST', body: {} });
      else { renderProgramDetail(id); return; }
    }
    if (result?.state) applyState(result.state);
    if (action === 'start' || (action === 'open' && result)) activeProgramId = id;
    renderPrograms();
    if (action === 'day') { toast('День программы завершён: +10 XP и +5 коенов!'); activeProgramId = id; renderProgramDetail(id); }
    else if (action === 'start' || action === 'open') { toast('Программа начата!'); renderProgramDetail(id); }
  } catch (err) { toast(err.message, true); }
}
function setWallpaper(choice) {
  const allowed = ['default', 'aurora', 'space', 'sunset', 'custom'];
  if (!allowed.includes(choice)) choice = 'default';
  try { localStorage.setItem('fitquest-wallpaper-choice', choice); } catch {}
  applyWallpaper();
}
function applyWallpaper() {
  document.body.classList.remove('wallpaper-aurora', 'wallpaper-space', 'wallpaper-sunset', 'wallpaper-custom');
  let choice = 'default'; let custom = '';
  try { choice = localStorage.getItem('fitquest-wallpaper-choice') || 'default'; custom = localStorage.getItem('fitquest-wallpaper-custom') || ''; } catch {}
  if (choice === 'custom' && custom.startsWith('data:image/')) {
    document.body.classList.add('wallpaper-custom');
    document.body.style.backgroundImage = `linear-gradient(180deg,rgba(6,10,22,.60),rgba(6,10,22,.78)),url("${custom}")`;
  } else {
    document.body.style.backgroundImage = '';
    if (choice === 'aurora') document.body.classList.add('wallpaper-aurora');
    if (choice === 'space') document.body.classList.add('wallpaper-space');
    if (choice === 'sunset') document.body.classList.add('wallpaper-sunset');
    document.querySelectorAll('.wallpaper-choice').forEach(btn => btn.classList.toggle('active', btn.dataset.wallpaper === choice));
  }
  document.querySelectorAll('.wallpaper-choice').forEach(btn => btn.classList.toggle('active', btn.dataset.wallpaper === choice));
  const useButton = $('useCustomWallpaper');
  if (useButton) useButton.hidden = !custom;
}
async function saveProfile(event) {
  event.preventDefault();
  const button = $('profileForm').querySelector('button[type="submit"]'); button.disabled = true;
  const body = {
    nick: $('profileNick').value.trim(), profileBio: $('profileBio').value.trim(), profileGoal: $('profileGoal').value,
    activity: $('profileActivity').value, height: $('profileHeight').value, weight: $('profileWeight').value,
    reminderTime: $('reminderTime').value, dailyReminder: $('dailyReminder').checked, missedReminder: $('missedReminder').checked,
    timezone: localTimezone()
  };
  try {
    const result = await api('/api/profile', { method: 'PATCH', body });
    applyState(result.state, true); setStatus('profileStatus', 'Профиль и настройки сохранены в общей базе.');
    toast('Профиль сохранён!'); checkReminders();
  } catch (err) { setStatus('profileStatus', err.message, true); }
  finally { button.disabled = false; }
}
const OFFLINE_DB = 'fitquest-offline-v1';
const OFFLINE_STORE = 'workoutQueue';
function openOfflineDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB недоступен в этом браузере.'));
    const request = indexedDB.open(OFFLINE_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE)) db.createObjectStore(OFFLINE_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Не удалось открыть локальное хранилище.'));
  });
}
async function queueOfflineWorkout(body) {
  const db = await openOfflineDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE, 'readwrite');
    tx.objectStore(OFFLINE_STORE).put({ id: body.clientRequestId, body, createdAt: new Date().toISOString(), userId: currentState?.user?.id ?? null });
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
  db.close();
}
async function getOfflineQueue() {
  const db = await openOfflineDb();
  const rows = await new Promise((resolve, reject) => {
    const req = db.transaction(OFFLINE_STORE, 'readonly').objectStore(OFFLINE_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []); req.onerror = () => reject(req.error);
  });
  db.close();
  return rows;
}
async function removeOfflineWorkout(id) {
  const db = await openOfflineDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE, 'readwrite'); tx.objectStore(OFFLINE_STORE).delete(id);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
  db.close();
}
let offlineSyncRunning = false;
async function syncOfflineWorkouts() {
  if (offlineSyncRunning || !navigator.onLine || !currentState?.user?.id) return;
  offlineSyncRunning = true;
  try {
    const rows = await getOfflineQueue();
    for (const row of rows) {
      if (row.userId && row.userId !== currentState.user.id) continue;
      try {
        const result = await api('/api/workouts', { method: 'POST', body: row.body });
        await removeOfflineWorkout(row.id);
        applyState(result.state);
      } catch (err) {
        if (err.status === 401 || !navigator.onLine) break;
        console.warn('FitQuest offline sync paused:', err.message); break;
      }
    }
    const left = (await getOfflineQueue()).filter(row => !row.userId || row.userId === currentState?.user?.id).length;
    if (left === 0) toast('Офлайн-записи синхронизированы.');
    else setStatus('workoutStatus', `В очереди синхронизации: ${left}. Записи сохранены на этом устройстве.`);
  } catch (err) { console.warn('FitQuest offline queue:', err.message); }
  finally { offlineSyncRunning = false; }
}
async function saveWorkout(event) {
  event.preventDefault();
  const button = $('workoutForm').querySelector('button[type="submit"]'); button.disabled = true;
  const body = { activityType: $('activityType').value, durationMinutes: Number($('durationMinutes').value), note: $('workoutNote').value.trim(), clientRequestId: crypto.randomUUID() };
  try {
    const result = await api('/api/workouts', { method: 'POST', body });
    applyState(result.state); $('workoutNote').value = '';
    setStatus('workoutStatus', `Сохранено: +${result.reward.xp} XP и +${result.reward.coins} коенов.`);
    toast(`Тренировка сохранена! +${result.reward.xp} XP`);
  } catch (err) {
    if (!navigator.onLine || err instanceof TypeError) {
      try {
        await queueOfflineWorkout(body); $('workoutNote').value = '';
        const count = (await getOfflineQueue()).filter(row => !row.userId || row.userId === currentState?.user?.id).length;
        setStatus('workoutStatus', `Нет соединения. Тренировка сохранена на устройстве и ждёт синхронизации (${count}).`);
        toast('Тренировка сохранена офлайн.');
      } catch (storageErr) { setStatus('workoutStatus', `Не удалось сохранить офлайн: ${storageErr.message}`, true); }
    } else setStatus('workoutStatus', err.message, true);
  } finally { button.disabled = false; }
}
function updateClock() {
  const now = new Date();
  $('localClock').textContent = `🕒 ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} · ${localTimezone()}`;
  const date = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: localTimezone() }).format(now);
  $('todayLabel').textContent = date;
}
async function refreshState() {
  const s = await api('/api/state'); applyState(s);
}
async function startGeoWalk() {
  if (location.protocol === 'file:') { setStatus('geoStatus', 'Открой FitQuest через сервер, а не напрямую как HTML-файл.'); return; }
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') { setStatus('geoStatus', 'Для GPS требуется HTTPS или localhost.'); return; }
  if (!navigator.geolocation) { setStatus('geoStatus', 'Этот браузер не поддерживает геолокацию.'); return; }
  if (geoWatchId !== null) return;
  setStatus('geoStatus', 'Запрашиваем GPS… Если браузер спросит, разреши доступ к местоположению.');
  geoTracking = true; lastGpsSent = 0; renderQuests();
  try {
    geoWatchId = navigator.geolocation.watchPosition(position => {
      const c = position.coords;
      $('geoAccuracy').textContent = `±${Math.round(c.accuracy)} м`;
      if (c.accuracy > 60) { setStatus('geoStatus', `Сигнал пока неточный (±${Math.round(c.accuracy)} м). Подожди или выйди на открытое место.`); return; }
      if (Date.now() - lastGpsSent < 2500) return;
      lastGpsSent = Date.now();
      const payload = { latitude: c.latitude, longitude: c.longitude, accuracy: c.accuracy, timestamp: position.timestamp || Date.now() };
      geoQueue = geoQueue.then(async () => {
        try {
          const result = await api('/api/gps/point', { method: 'POST', body: payload });
          applyState(result.state);
          setStatus('geoStatus', `GPS отслеживается · точность ±${Math.round(c.accuracy)} м. Не закрывай страницу во время прогулки.`);
          if (result.awarded?.length) {
            if (result.streakMessage) toast(result.streakMessage);
            for (const id of result.awarded) { const q = QUESTS.find(x => x.id === id); if (q) toast(`Квест выполнен: ${q.name} · +${q.coins} коенов`); }
          }
        } catch (err) {
          setStatus('geoStatus', err.message, err.status !== 422);
        }
      });
    }, error => {
      geoTracking = false; geoWatchId = null; renderQuests();
      const descriptions = { 1: 'Доступ к GPS запрещён. Открой настройки сайта в браузере и разреши геолокацию.', 2: 'GPS-сигнал недоступен. Включи геолокацию устройства и попробуй на открытом месте.', 3: 'GPS отвечает слишком долго. Проверь сигнал и попробуй снова.' };
      setStatus('geoStatus', descriptions[error.code] || 'Не удалось получить местоположение.', true);
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });
  } catch (err) { geoTracking = false; geoWatchId = null; renderQuests(); setStatus('geoStatus', err.message, true); }
}
async function stopGeoWalk() {
  if (geoWatchId !== null && navigator.geolocation) { try { navigator.geolocation.clearWatch(geoWatchId); } catch {} }
  geoWatchId = null; geoTracking = false; renderQuests();
  try { await api('/api/gps/stop', { method: 'POST', body: {} }); } catch {}
  setStatus('geoStatus', `GPS остановлен. Сохранено расстояние: ${formatMeters(currentState.geo.meters)}. Точные координаты очищены.`);
}
async function requestGeoPermission() {
  if (!navigator.geolocation) { setStatus('geoStatus', 'Браузер не поддерживает геолокацию.'); return; }
  setStatus('geoStatus', 'Проверяем доступ к геолокации…');
  navigator.geolocation.getCurrentPosition(pos => {
    $('geoAccuracy').textContent = `±${Math.round(pos.coords.accuracy)} м`;
    setStatus('geoStatus', `Геолокация разрешена. Точность ±${Math.round(pos.coords.accuracy)} м. Теперь можешь начать прогулку.`);
  }, error => {
    const descriptions = { 1: 'Доступ запрещён. В Chrome открой значок рядом с адресом → Настройки сайта → Местоположение → Разрешить.', 2: 'Позиция недоступна. Включи геолокацию устройства.', 3: 'GPS отвечает слишком долго. Попробуй снова.' };
    setStatus('geoStatus', descriptions[error.code] || 'Не удалось запросить геолокацию.', true);
  }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
}
function updateTimerDisplay() {
  const m = Math.floor(timerRemaining / 60), s = timerRemaining % 60;
  $('timerDisplay').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function voiceSettings() {
  const voice = SHOP.find(item => item.id === currentState?.player?.equippedVoice);
  return voice || { pitch: 1, rate: 1 };
}
function speakTimer(message) {
  if (!('speechSynthesis' in window)) return;
  const settings = voiceSettings(); const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'ru-RU'; utterance.pitch = settings.pitch || 1; utterance.rate = settings.rate || 1;
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance);
}
function startTimer() {
  if (timerInterval) return;
  timerRemaining = Number($('timerMinutes').value || 5) * 60; updateTimerDisplay();
  $('startTimerBtn').disabled = true; $('stopTimerBtn').disabled = false;
  setStatus('timerStatus', 'Таймер запущен.');
  speakTimer('Таймер запущен. Начинай, когда будешь готов.');
  timerInterval = setInterval(() => {
    timerRemaining -= 1; updateTimerDisplay();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval); timerInterval = null; $('startTimerBtn').disabled = false; $('stopTimerBtn').disabled = true;
      setStatus('timerStatus', 'Интервал завершён. Отдохни или продолжи по самочувствию.'); speakTimer('Интервал завершён. Молодец.'); toast('⏱️ Интервал завершён!');
    }
  }, 1000);
}
function stopTimer() {
  if (timerInterval) clearInterval(timerInterval); timerInterval = null;
  timerRemaining = Number($('timerMinutes').value || 5) * 60; updateTimerDisplay();
  $('startTimerBtn').disabled = false; $('stopTimerBtn').disabled = true;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  setStatus('timerStatus', 'Таймер сброшен.');
}
function notify(title, body, tag) {
  if ('Notification' in window && Notification.permission === 'granted') { try { new Notification(title, { body, tag }); } catch { toast(body); } }
  else toast(body);
}
function checkReminders() {
  if (!currentState || document.hidden) return;
  const settings = currentState.settings;
  let fired = {};
  try { fired = JSON.parse(localStorage.getItem(`fitquest-reminder-state-${currentState.user.id}`) || '{}'); } catch {}
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: settings.timezone || localTimezone(), year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value])); const key = `${p.year}-${p.month}-${p.day}`;
  const done = todayCompleted().length;
  const hm = now.toLocaleTimeString('en-GB', { timeZone: settings.timezone || localTimezone(), hour: '2-digit', minute: '2-digit', hour12: false });
  if (settings.dailyReminder && hm === settings.reminderTime && !fired[`daily-${key}`]) { notify('FitQuest — напоминание', 'Загляни в квесты, если сейчас удобно. Отдых тоже важен.', `daily-${key}`); fired[`daily-${key}`] = true; }
  if (settings.missedReminder && Number(hm.slice(0, 2)) >= 18 && done < QUESTS.length && !fired[`missed-${key}`]) { notify('FitQuest: остались квесты', `Сегодня выполнено ${done} из ${QUESTS.length} GPS-квестов. Можно продолжить, если есть возможность.`, `missed-${key}`); fired[`missed-${key}`] = true; }
  try { localStorage.setItem(`fitquest-reminder-state-${currentState.user.id}`, JSON.stringify(fired)); } catch {}
}
async function enableNotifications() {
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') { setStatus('notificationStatus', 'Для уведомлений нужен HTTPS или localhost.', true); return; }
  if (!('Notification' in window)) { setStatus('notificationStatus', 'Этот браузер не поддерживает уведомления.', true); return; }
  if (Notification.permission === 'denied') { setStatus('notificationStatus', 'Уведомления заблокированы браузером. Разреши их в настройках сайта.', true); return; }
  const permission = await Notification.requestPermission();
  setStatus('notificationStatus', permission === 'granted' ? 'Разрешено. Напоминания приходят, пока сайт открыт.' : 'Разрешение не выдано.');
}
async function deleteAccount(event) {
  event.preventDefault();
  const button = $('confirmDelete'); button.disabled = true;
  setStatus('deleteStatus', 'Проверяем пароль и удаляем данные…');
  try {
    await api('/api/account', { method: 'DELETE', body: { password: $('deletePassword').value } });
    try {
      localStorage.removeItem('fitquest-wallpaper-choice'); localStorage.removeItem('fitquest-wallpaper-custom');
      if (currentState?.user?.id) localStorage.removeItem(`fitquest-reminder-state-${currentState.user.id}`);
    } catch {}
    $('deleteModal').hidden = true; $('deletePassword').value = ''; $('authEmail').value = ''; $('authNick').value = '';
    showAuth('Аккаунт и прогресс удалены с сервера. Можешь зарегистрироваться заново.');
    toast('Аккаунт удалён.');
  } catch (err) { setStatus('deleteStatus', err.message, true); }
  finally { button.disabled = false; }
}
function initializeEvents() {
  $('authForm').addEventListener('submit', processAuth);
  $('showRegister').addEventListener('click', () => setAuthMode('register'));
  $('showLogin').addEventListener('click', () => setAuthMode('login'));
  $('logoutBtn').addEventListener('click', async () => {
    try { await api('/api/auth/logout', { method: 'POST', body: {} }); } catch {}
    showAuth('Ты вышел из FitQuest. Введи данные, чтобы войти снова.');
  });
  document.querySelectorAll('.nav-btn[data-page]').forEach(btn => btn.addEventListener('click', () => setPage(btn.dataset.page)));
  document.querySelectorAll('[data-go-page]').forEach(btn => btn.addEventListener('click', () => setPage(btn.dataset.goPage)));
  $('refreshLeaderboard').addEventListener('click', async () => { try { applyState(await api('/api/state')); toast('Рейтинг обновлён.'); } catch (err) { toast(err.message, true); } });
  $('profileForm').addEventListener('submit', saveProfile);
  $('workoutForm').addEventListener('submit', saveWorkout);
  $('shopFilters').addEventListener('click', event => {
    const btn = event.target.closest('[data-filter]'); if (!btn) return;
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(x => x.classList.toggle('active', x === btn)); renderShop();
  });
  $('shopItems').addEventListener('click', event => {
    const btn = event.target.closest('[data-shop-action]'); if (!btn || btn.disabled) return;
    handleShopAction(btn.dataset.shopAction, btn.dataset.itemId);
  });
  $('inventorySummary').addEventListener('click', event => {
    const btn = event.target.closest('[data-shop-action]'); if (!btn || btn.disabled) return;
    handleShopAction(btn.dataset.shopAction, btn.dataset.itemId);
  });
  $('programGrid').addEventListener('click', event => {
    const btn = event.target.closest('[data-program-action]'); if (btn) programAction(btn.dataset.programAction, btn.dataset.programId, btn.dataset.day);
  });
  $('programDetail').addEventListener('click', event => {
    if (event.target.closest('#closeProgramDetail')) { $('programDetail').hidden = true; activeProgramId = null; return; }
    const btn = event.target.closest('[data-program-action]'); if (btn) programAction(btn.dataset.programAction, btn.dataset.programId, btn.dataset.day);
  });
  $('contentGoTraining').addEventListener('click', () => {
    const programId = $('contentGoTraining').dataset.programId; $('contentModal').hidden = true; setPage('training'); activeProgramId = programId;
    const program = PROGRAMS.find(p => p.id === programId); if (program && !programProgress(programId)) programAction('start', programId); else renderProgramDetail(programId);
  });
  $('closeContentModal').addEventListener('click', () => $('contentModal').hidden = true);
  $('closeContentModalBottom').addEventListener('click', () => $('contentModal').hidden = true);
  $('contentModal').addEventListener('click', e => { if (e.target === $('contentModal')) $('contentModal').hidden = true; });
  $('openDeleteModal').addEventListener('click', () => { $('deletePassword').value = ''; setStatus('deleteStatus', ''); $('deleteModal').hidden = false; $('deletePassword').focus(); });
  $('cancelDelete').addEventListener('click', () => { $('deleteModal').hidden = true; $('deletePassword').value = ''; });
  $('deleteForm').addEventListener('submit', deleteAccount);
  $('enableGeoBtn').addEventListener('click', requestGeoPermission);
  $('startWalkBtn').addEventListener('click', startGeoWalk);
  $('stopWalkBtn').addEventListener('click', stopGeoWalk);
  $('startTimerBtn').addEventListener('click', startTimer);
  $('stopTimerBtn').addEventListener('click', stopTimer);
  $('timerMinutes').addEventListener('change', () => { if (!timerInterval) { timerRemaining = Number($('timerMinutes').value || 5) * 60; updateTimerDisplay(); } });
  $('enableNotifications').addEventListener('click', enableNotifications);
  document.querySelectorAll('.wallpaper-choice').forEach(btn => btn.addEventListener('click', () => {
    setWallpaper(btn.dataset.wallpaper); document.querySelectorAll('.wallpaper-choice').forEach(x => x.classList.toggle('active', x === btn)); setStatus('wallpaperStatus', 'Обои изменены.');
  }));
  $('wallpaperUpload').addEventListener('change', event => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setStatus('wallpaperStatus', 'Выбери изображение PNG, JPG или WebP.', true); return; }
    if (file.size > 12 * 1024 * 1024) { setStatus('wallpaperStatus', 'Файл должен быть меньше 12 МБ.', true); return; }
    setStatus('wallpaperStatus', 'Обрабатываем изображение…');
    const reader = new FileReader();
    reader.onerror = () => setStatus('wallpaperStatus', 'Не удалось прочитать изображение.', true);
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => setStatus('wallpaperStatus', 'Не удалось открыть изображение.', true);
      image.onload = () => {
        try {
          const scale = Math.min(1, 1400 / image.width, 1000 / image.height);
          const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
          const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', .7);
          if (dataUrl.length > 2_500_000) throw new Error('Картинка слишком большая после обработки. Попробуй другую.');
          localStorage.setItem('fitquest-wallpaper-custom', dataUrl); localStorage.setItem('fitquest-wallpaper-choice', 'custom');
          applyWallpaper(); setStatus('wallpaperStatus', 'Свои обои загружены в этот браузер.');
        } catch (err) { setStatus('wallpaperStatus', err.message || 'Не удалось сохранить обои.', true); }
      };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
  $('useCustomWallpaper').addEventListener('click', () => { setWallpaper('custom'); setStatus('wallpaperStatus', 'Твои обои применены.'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { $('contentModal').hidden = true; $('deleteModal').hidden = true; } });
  window.addEventListener('pagehide', () => {
    if (geoWatchId !== null) {
      try { navigator.geolocation.clearWatch(geoWatchId); } catch {}
      // Best-effort cleanup; the coordinate pair is not a route history.
      fetch('/api/gps/stop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', credentials: 'same-origin', keepalive: true }).catch(() => {});
    }
  });
}

async function checkServerHealth() {
  try { await api('/api/health'); $('footerServerStatus').textContent = 'Сервер и база данных подключены'; }
  catch { $('footerServerStatus').textContent = 'Проблема соединения с сервером'; }
}
async function syncTimezoneIfNeeded() {
  if (!currentState || currentState.settings.timezone === localTimezone()) return;
  const s = currentState.settings;
  try {
    const result = await api('/api/profile', { method: 'PATCH', body: {
      nick: currentState.user.nick, profileBio: s.profileBio, profileGoal: s.profileGoal,
      activity: s.activity, height: s.height, weight: s.weight, reminderTime: s.reminderTime,
      dailyReminder: s.dailyReminder, missedReminder: s.missedReminder, timezone: localTimezone()
    }});
    applyState(result.state);
  } catch (err) { console.warn('FitQuest timezone sync failed:', err.message); }
}

async function initialize() {
  initializeEvents(); updateClock(); setAuthMode('register');
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('/service-worker.js').catch(err => console.warn('FitQuest SW:', err.message));
  window.addEventListener('online', syncOfflineWorkouts);
  try {
    await checkServerHealth();
    const me = await api('/api/me');
    if (me.user) {
      const state = await api('/api/state');
      $('authPage').hidden = true; $('appShell').hidden = false;
      applyState(state, true); setPage('home'); await syncTimezoneIfNeeded(); checkReminders(); await syncOfflineWorkouts();
    }
  } catch (err) {
    if (err.status !== 401) setStatus('authStatus', `Сервер не ответил: ${err.message}. Проверь запуск PostgreSQL и сервера.`, true);
    showAuth(err.status === 401 ? '' : `Не удалось подключиться: ${err.message}`);
  }
  setInterval(() => { updateClock(); checkReminders(); }, 30000);
}
initialize();
