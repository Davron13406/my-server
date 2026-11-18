'use strict';
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET;
if (NODE_ENV === 'production' && (!SESSION_SECRET || SESSION_SECRET.length < 32)) {
  throw new Error('В production нужен SESSION_SECRET длиной не менее 32 символов.');
}
if (!process.env.DATABASE_URL) throw new Error('Не задан DATABASE_URL. Создай .env по образцу .env.example.');
if (NODE_ENV !== 'production' && (!SESSION_SECRET || SESSION_SECRET.length < 32)) {
  console.warn('ВНИМАНИЕ: используется локальный секрет сессии. Задай SESSION_SECRET перед публикацией в интернете.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.DB_POOL_SIZE || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

const SHOP = {
  'theme-lime': { price: 0, kind: 'theme' },
  'theme-ocean': { price: 120, kind: 'theme' },
  'theme-sunset': { price: 160, kind: 'theme' },
  'theme-violet': { price: 200, kind: 'theme' },
  'theme-cyberpunk': { price: 280, kind: 'theme' },
  'avatar-rocket': { price: 0, kind: 'avatar' },
  'avatar-comet': { price: 0, kind: 'avatar' },
  'theme-mint': { price: 0, kind: 'theme' },
  'avatar-star': { price: 90, kind: 'avatar' },
  'avatar-dragon': { price: 150, kind: 'avatar' },
  'course-back': { price: 240, kind: 'course' },
  'course-posture': { price: 220, kind: 'course' },
  'course-splits': { price: 260, kind: 'course' },
  'course-endurance': { price: 320, kind: 'course' },
  'course-strength': { price: 300, kind: 'course' },
  'marathon-7day': { price: 300, kind: 'marathon' },
  'mealplan-week': { price: 180, kind: 'mealplan' },
  'streak-freeze': { price: 100, kind: 'streakFreeze' },
  'voice-calm': { price: 100, kind: 'voice' },
  'voice-energy': { price: 130, kind: 'voice' },
  'voice-commander': { price: 150, kind: 'voice' }
};

const QUESTS = [
  { id: 'geo-walk-500', target: 500, metric: 'meters', coins: 20, xp: 20 },
  { id: 'geo-walk-1000', target: 1000, metric: 'meters', coins: 40, xp: 40 },
  { id: 'geo-away-300', target: 300, metric: 'farthest', coins: 30, xp: 30 }
];

const PROGRAMS = {
  'activation-7': { title: '7 дней движения', days: 7, itemId: null },
  'back-7': { title: 'Здоровая спина · 7 дней', days: 7, itemId: 'course-back' },
  'posture-7': { title: 'Курс по осанке · 7 дней', days: 7, itemId: 'course-posture' },
  'flexibility-14': { title: 'Гибкость · 14 дней', days: 14, itemId: 'course-splits' },
  'endurance-30': { title: 'Выносливость · 30 дней', days: 30, itemId: 'course-endurance' },
  'strength-14': { title: 'Сила и техника · 14 дней', days: 14, itemId: 'course-strength' }
};

const PROGRAM_DAYS = {
  'activation-7': [
    'Выбери приятную активность на 10–15 минут.',
    'Сделай короткую паузу на подвижность.',
    'Пройдись в удобном темпе или потанцуй под любимую музыку.',
    'Восстановительный день: отдых или очень лёгкое движение.',
    'Повтори любимую активность, если удобно.',
    'Выбери прогулку или движение с близким человеком.',
    'Подведи итоги и выбери привычку, которую хочешь сохранить.'
  ],
  'back-7': [
    '5–8 минут спокойной подвижности плеч и грудного отдела.',
    'Мягкие движения кошка-корова в комфортном диапазоне.',
    'Короткие перерывы от сидения и лёгкая прогулка.',
    'Восстановительный день — отдых или свободное движение.',
    'Удобные движения плеч, бёдер и грудного отдела.',
    'Повтори два комфортных движения из курса.',
    'Лёгкая последовательность и заметка о самочувствии.'
  ],
  'posture-7': [
    'Настрой экран и стул так, чтобы было удобно.',
    'Сделай короткую паузу и расслабь плечи.',
    'Попробуй мягко свести лопатки без задержки дыхания.',
    'Чередуй положение тела — не нужно сидеть неподвижно «идеально прямо».',
    'Добавь короткую прогулку или свободное движение.',
    'Сделай паузу от экрана и оцени, что помогает чувствовать себя комфортнее.',
    'Подведи итоги: какая привычка оказалась полезной.'
  ],
  'flexibility-14': Array.from({ length: 14 }, (_, i) => [
    'Комфортная разминка и мягкая подвижность.', 'Лёгкая растяжка в приятном диапазоне.',
    'День отдыха или обычная прогулка.', 'Мягкая подвижность бёдер и ног без давления.',
    'Короткая комфортная практика; не пружинь.', 'Восстановление или свободное движение.',
    'Выбери два знакомых движения без усилия.'
  ][i % 7]),
  'endurance-30': Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    if ([4, 7, 11, 14, 18, 21, 25, 28].includes(day)) return 'День восстановления: отдых или спокойная подвижность.';
    const week = Math.floor(i / 7) + 1;
    const mins = week === 1 ? '10–15' : week === 2 ? '15–20' : week === 3 ? '15–25' : '20–30';
    return `Комфортная прогулка или любимая активность на ${mins} минут, только если это удобно по самочувствию.`;
  }),
  'strength-14': Array.from({ length: 14 }, (_, i) => i % 3 === 2
    ? 'Восстановление: отдых или лёгкая прогулка.'
    : i % 3 === 0
      ? 'Разминка и 1–2 спокойных круга простых движений с собственным весом, сохраняя контроль.'
      : 'Практика удобной техники, дыхания и мягкой подвижности без работы через боль.')
};
const SHOP_CONTENT = {
  'course-back': { details: PROGRAM_DAYS['back-7'], note: 'Это общая оздоровительная программа, а не лечение боли. Двигайся без боли; при постоянном дискомфорте обратись за советом к специалисту.' },
  'course-posture': { details: PROGRAM_DAYS['posture-7'], note: 'Цель — удобство и движение, а не постоянное напряжение. При дискомфорте прекрати упражнение.' },
  'course-splits': { details: ['Перед растяжкой разогрейся 5–10 минут лёгким движением.', 'Начни с мягкой подвижности бёдер и задней поверхности ног.', 'Выполняй плавные удержания в комфортном натяжении, не пружинь.', 'Чередуй дни практики и восстановления.', 'Не проси другого человека силой опускать тебя ниже.', 'Ориентируйся на ощущения, а не на глубину растяжки.', 'Повтори комфортную последовательность и отдохни.'], note: 'Шпагат не обязателен для здоровья. Не растягивайся через боль, онемение или резкий дискомфорт.' },
  'course-endurance': { details: ['Недели состоят из комфортных активных дней и восстановления.', 'Начинай с удобной продолжительности и увеличивай её только при хорошем самочувствии.', 'Меняй ходьбу на танцы, велосипед или другую безопасную активность по желанию.', 'Веди записи активности в FitQuest, чтобы видеть историю.'], note: 'План ориентировочный. Темп можно снижать и брать дополнительные дни отдыха.' },
  'course-strength': { details: ['Начни с разминки и простых движений без дополнительного веса.', 'Обращай внимание на комфорт, контроль движения и дыхание.', 'Чередуй практические дни с восстановлением.', 'Не соревнуйся с чужими результатами и не работай через боль.'], note: 'Выбирай безопасную сложность и технику. При необходимости попроси тренера или взрослого показать движение.' },
  'marathon-7day': { details: ['День 1: прогулка или любимое движение 10–15 минут.', 'День 2: короткая пауза на подвижность.', 'День 3: активность на выбор в комфортном темпе.', 'День 4: восстановление — отдых тоже часть плана.', 'День 5: прогулка по безопасному знакомому маршруту.', 'День 6: движение с близким человеком, если хочется.', 'День 7: отметь, что понравилось и что хочешь продолжать.'], note: 'Это самостоятельный марафон; внешний тренер и закрытый чат не подключены.' },
  'mealplan-week': { details: ['Понедельник: овсянка с фруктами; рис с овощами и фасолью/курицей; суп и хлеб.', 'Вторник: яйца или йогурт с хлебом и фруктом; гречка и овощи; картофель и салат.', 'Среда: творог/йогурт и фрукты; суп с чечевицей; паста с томатами и сыром/фасолью.', 'Четверг: каша и орехи при отсутствии аллергии; плов с овощным салатом; омлет и хлеб.', 'Пятница: бутерброд с сыром/яйцом; макароны с курицей/нутом; овощной суп и йогурт.', 'Суббота: каша или блинчики; картофель с рыбой/фасолью; домашний сэндвич.', 'Воскресенье: привычный завтрак; семейное блюдо; удобное сочетание оставшихся продуктов.'], shopping: ['Овсянка, рис, гречка или макароны', 'Хлеб или лаваш', 'Яйца, йогурт/творог и сыр', 'Фасоль, нут или чечевица', 'Курица или рыба по желанию', 'Картофель и сезонные овощи', 'Фрукты и ягоды', 'Томатный соус, масло и привычные специи'], note: 'Это гибкие идеи, а не строгая диета. Меняй продукты под вкусы, аллергию, бюджет и доступность.' }
};

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
function validTimezone(value) {
  if (typeof value !== 'string' || value.length > 80) return null;
  try { new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date()); return value; }
  catch { return null; }
}
function dayKeyInTimezone(date = new Date(), timezone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: validTimezone(timezone) || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
function dayDifference(a, b) {
  if (!a || !b) return NaN;
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);
}
function haversineMeters(a, b) {
  const rad = Math.PI / 180;
  const lat1 = a.latitude * rad, lat2 = b.latitude * rad;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
function safeSettings(raw = {}) {
  return {
    height: raw.height == null ? '' : String(raw.height),
    weight: raw.weight == null ? '' : String(raw.weight),
    activity: ['low', 'moderate', 'high'].includes(raw.activity) ? raw.activity : 'moderate',
    profileBio: typeof raw.profileBio === 'string' ? raw.profileBio.slice(0, 160) : '',
    profileGoal: ['general', 'endurance', 'strength', 'mobility'].includes(raw.profileGoal) ? raw.profileGoal : 'general',
    reminderTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(raw.reminderTime || '') ? raw.reminderTime : '19:00',
    dailyReminder: raw.dailyReminder !== false,
    missedReminder: raw.missedReminder !== false,
    timezone: validTimezone(raw.timezone) || 'Asia/Tashkent'
  };
}
function isValidNumberBetween(value, min, max) {
  if (value === '' || value === null || value === undefined) return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}
async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}
async function requireUser(req, res, next) {
  if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Сначала войди в FitQuest.' });
  try {
    const result = await pool.query('SELECT id, email, nick FROM users WHERE id = $1', [req.session.userId]);
    if (!result.rowCount) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Аккаунт не найден. Зарегистрируйся заново.' });
    }
    req.user = result.rows[0];
    next();
  } catch (err) { next(err); }
}
function sameOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin) return next();
  try {
    if (new URL(origin).host !== req.get('host')) return res.status(403).json({ error: 'Запрос отклонён: источник не совпадает.' });
  } catch { return res.status(403).json({ error: 'Некорректный источник запроса.' }); }
  next();
}
function setActivityDay(row, today) {
  if (row.last_active_date === today) return '';
  if (!row.last_active_date) row.streak = 1;
  else {
    const diff = dayDifference(row.last_active_date, today);
    if (diff === 1) row.streak += 1;
    else if (diff === 2 && row.streak_freezes > 0) {
      row.streak += 1;
      row.streak_freezes -= 1;
      row.last_active_date = today;
      return 'Заморозка использована — серия сохранена.';
    } else row.streak = 1;
  }
  row.last_active_date = today;
  return '';
}
async function persistPlayer(client, userId, row) {
  await client.query(`UPDATE player_state SET
    coins=$2, xp=$3, streak=$4, total_tasks=$5, week_xp=$6, history=$7::jsonb,
    streak_freezes=$8, last_active_date=$9, updated_at=NOW()
    WHERE user_id=$1`, [userId, row.coins, row.xp, row.streak, row.total_tasks, row.week_xp,
    JSON.stringify(row.history || {}), row.streak_freezes, row.last_active_date || '']);
}
async function getLeaderboard(clientOrPool = pool) {
  const result = await clientOrPool.query(`SELECT u.nick, p.xp, p.total_tasks, p.streak, p.equipped_avatar
    FROM users u JOIN player_state p ON p.user_id=u.id
    ORDER BY p.xp DESC, p.total_tasks DESC, u.created_at ASC LIMIT 10`);
  return result.rows.map((r, index) => ({
    rank: index + 1, name: r.nick, xp: Number(r.xp), total: Number(r.total_tasks),
    streak: Number(r.streak), avatar: r.equipped_avatar
  }));
}
async function getState(userId) {
  const result = await pool.query(`SELECT u.id, u.email, u.nick, p.*
    FROM users u JOIN player_state p ON p.user_id=u.id WHERE u.id=$1`, [userId]);
  if (!result.rowCount) throw httpError(404, 'Профиль не найден.');
  const r = result.rows[0];
  const settings = safeSettings(r.settings || {});
  const today = dayKeyInTimezone(new Date(), settings.timezone);
  if (r.geo_date !== today) {
    await pool.query(`UPDATE player_state SET geo_date=$2, geo_meters=0, geo_farthest_meters=0,
      geo_start_lat=NULL, geo_start_lon=NULL, geo_last_lat=NULL, geo_last_lon=NULL, geo_last_timestamp=NULL,
      updated_at=NOW() WHERE user_id=$1`, [userId, today]);
    r.geo_meters = 0; r.geo_farthest_meters = 0;
  }
  const [leaderboard, workoutsRes, programRes] = await Promise.all([
    getLeaderboard(),
    pool.query(`SELECT id, activity_type AS "activityType", duration_minutes AS "durationMinutes", note,
      local_day AS "localDay", xp_awarded AS "xpAwarded", coins_awarded AS "coinsAwarded", logged_at AS "loggedAt"
      FROM workout_logs WHERE user_id=$1 ORDER BY logged_at DESC LIMIT 10`, [userId]),
    pool.query(`SELECT program_id AS "programId", completed_days AS "completedDays", started_at AS "startedAt",
      last_completed_on AS "lastCompletedOn" FROM program_progress WHERE user_id=$1`, [userId])
  ]);
  const history = r.history && typeof r.history === 'object' ? r.history : {};
  const inventory = r.inventory || [];
  const programProgress = programRes.rows.map(p => ({ ...p, completedDays: p.completedDays || [] }));
  const programs = Object.entries(PROGRAMS).map(([id, p]) => {
    const unlocked = !p.itemId || inventory.includes(p.itemId);
    return { id, title: p.title, length: p.days, itemId: p.itemId, unlocked,
      days: unlocked ? (PROGRAM_DAYS[id] || []) : null,
      progress: programProgress.find(x => x.programId === id) || null };
  });
  return {
    user: { id: Number(r.id), email: r.email, nick: r.nick },
    settings,
    today,
    player: {
      coins: Number(r.coins), xp: Number(r.xp), streak: Number(r.streak), total: Number(r.total_tasks),
      week: Number(r.week_xp), history, inventory, streakFreezes: Number(r.streak_freezes),
      equippedTheme: r.equipped_theme, equippedAvatar: r.equipped_avatar, equippedVoice: r.equipped_voice || '',
      lastActiveDate: r.last_active_date || ''
    },
    geo: { date: today, meters: Number(r.geo_meters), farthestMeters: Number(r.geo_farthest_meters) },
    leaderboard,
    workouts: workoutsRes.rows,
    programProgress,
    programs
  };
}

const app = express();
if (NODE_ENV === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], baseUri: ["'self'"], formAction: ["'self'"], frameAncestors: ["'none'"],
      scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"], fontSrc: ["'self'", 'data:'], objectSrc: ["'none'"], upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use('/api', sameOrigin);
const PgSession = connectPgSimple(session);
app.use(session({
  name: 'fitquest.sid',
  store: new PgSession({ pool, tableName: 'fitquest_sessions', createTableIfMissing: true, pruneSessionInterval: 60 }),
  secret: SESSION_SECRET || 'local-dev-only-secret-change-before-hosting-please',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: 'Слишком много попыток. Подожди 15 минут и попробуй снова.' } });
app.use('/api/auth', authLimiter);

app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, service: 'FitQuest API' }); }
  catch { res.status(503).json({ ok: false, error: 'База данных недоступна.' }); }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const nick = typeof req.body.nick === 'string' ? req.body.nick.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const timezone = validTimezone(req.body.timezone) || 'Asia/Tashkent';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) throw httpError(400, 'Введи корректный email.');
    if (nick.length < 2 || nick.length > 32 || /[<>\u0000-\u001f]/.test(nick)) throw httpError(400, 'Ник должен быть длиной 2–32 символа.');
    if (password.length < 8 || password.length > 128) throw httpError(400, 'Пароль должен содержать от 8 до 128 символов.');
    const passwordHash = await bcrypt.hash(password, 12);
    const created = await transaction(async client => {
      const u = await client.query('INSERT INTO users(email,nick,password_hash) VALUES($1,$2,$3) RETURNING id,email,nick', [email, nick, passwordHash]);
      const defaultSettings = safeSettings({ timezone });
      await client.query(`INSERT INTO player_state(user_id, settings, geo_date)
        VALUES($1,$2::jsonb,$3)`, [u.rows[0].id, JSON.stringify(defaultSettings), dayKeyInTimezone(new Date(), timezone)]);
      return u.rows[0];
    });
    await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
    req.session.userId = String(created.id);
    await new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
    res.status(201).json({ user: { id: Number(created.id), email: created.email, nick: created.nick } });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Этот email или ник уже занят. Выбери другой.' });
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const result = await pool.query('SELECT id,email,nick,password_hash FROM users WHERE LOWER(email)=LOWER($1)', [email]);
    if (!result.rowCount || !(await bcrypt.compare(password, result.rows[0].password_hash))) {
      return res.status(401).json({ error: 'Email или пароль неверны.' });
    }
    const user = result.rows[0];
    await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
    req.session.userId = String(user.id);
    await new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
    res.json({ user: { id: Number(user.id), email: user.email, nick: user.nick } });
  } catch (err) { next(err); }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('fitquest.sid', { httpOnly: true, sameSite: 'lax', secure: NODE_ENV === 'production' });
    if (err) return res.status(500).json({ error: 'Не удалось завершить сеанс.' });
    res.json({ ok: true });
  });
});

app.get('/api/me', requireUser, (req, res) => res.json({ user: { id: Number(req.user.id), email: req.user.email, nick: req.user.nick } }));
app.get('/api/state', requireUser, async (req, res, next) => {
  try { res.json(await getState(req.user.id)); } catch (err) { next(err); }
});
app.get('/api/leaderboard', async (_req, res, next) => {
  try { res.json({ leaderboard: await getLeaderboard() }); } catch (err) { next(err); }
});

app.patch('/api/profile', requireUser, async (req, res, next) => {
  try {
    const current = await pool.query('SELECT settings FROM player_state WHERE user_id=$1', [req.user.id]);
    const old = safeSettings(current.rows[0]?.settings || {});
    const body = req.body || {};
    const nick = typeof body.nick === 'string' ? body.nick.trim() : req.user.nick;
    if (nick.length < 2 || nick.length > 32 || /[<>\u0000-\u001f]/.test(nick)) throw httpError(400, 'Ник должен быть длиной 2–32 символа.');
    const height = body.height === '' || body.height == null ? '' : Number(body.height);
    const weight = body.weight === '' || body.weight == null ? '' : Number(body.weight);
    if (!isValidNumberBetween(height, 50, 250)) throw httpError(400, 'Рост должен быть в диапазоне 50–250 см.');
    if (!isValidNumberBetween(weight, 10, 350)) throw httpError(400, 'Проверь значение веса.');
    const settings = safeSettings({
      ...old,
      height: height === '' ? '' : String(height), weight: weight === '' ? '' : String(weight),
      activity: body.activity ?? old.activity, profileBio: body.profileBio ?? old.profileBio,
      profileGoal: body.profileGoal ?? old.profileGoal, reminderTime: body.reminderTime ?? old.reminderTime,
      dailyReminder: body.dailyReminder ?? old.dailyReminder, missedReminder: body.missedReminder ?? old.missedReminder,
      timezone: body.timezone ?? old.timezone
    });
    await transaction(async client => {
      await client.query('UPDATE users SET nick=$2,updated_at=NOW() WHERE id=$1', [req.user.id, nick]);
      await client.query('UPDATE player_state SET settings=$2::jsonb, updated_at=NOW() WHERE user_id=$1', [req.user.id, JSON.stringify(settings)]);
    });
    res.json({ ok: true, state: await getState(req.user.id) });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Этот ник уже занят.' });
    next(err);
  }
});

app.delete('/api/account', requireUser, async (req, res, next) => {
  try {
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const u = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!u.rowCount || !(await bcrypt.compare(password, u.rows[0].password_hash))) throw httpError(403, 'Пароль не совпадает. Профиль не удалён.');
    const userId = String(req.user.id);
    await transaction(async client => {
      // Remove every PostgreSQL-backed session for this account, not only the current browser session.
      // connect-pg-simple stores the serialized Express session in the JSONB `sess` column.
      await client.query("DELETE FROM fitquest_sessions WHERE sess->>'userId'=$1", [userId]);
      // Cascading foreign keys remove the account's profile, progress, purchases and workout history.
      await client.query('DELETE FROM users WHERE id=$1', [userId]);
    });
    req.session.destroy(err => {
      res.clearCookie('fitquest.sid', { httpOnly: true, sameSite: 'lax', secure: NODE_ENV === 'production' });
      if (err) return res.status(500).json({ error: 'Аккаунт удалён, но не удалось завершить локальный сеанс. Обнови страницу.' });
      res.json({ ok: true });
    });
  } catch (err) { next(err); }
});

app.post('/api/gps/point', requireUser, async (req, res, next) => {
  try {
    const lat = Number(req.body.latitude), lon = Number(req.body.longitude), accuracy = Number(req.body.accuracy), capturedAt = Number(req.body.timestamp);
    if (![lat, lon, accuracy, capturedAt].every(Number.isFinite) || lat < -90 || lat > 90 || lon < -180 || lon > 180) throw httpError(400, 'Координаты GPS некорректны.');
    if (accuracy <= 0 || accuracy > 60) throw httpError(422, 'Сигнал GPS слишком неточный. Подожди более точного измерения.');
    if (Math.abs(Date.now() - capturedAt) > 120000) throw httpError(422, 'Время GPS-измерения устарело. Запусти отслеживание снова.');
    const result = await transaction(async client => {
      const selected = await client.query(`SELECT p.*,u.email,u.nick FROM player_state p JOIN users u ON u.id=p.user_id WHERE p.user_id=$1 FOR UPDATE`, [req.user.id]);
      if (!selected.rowCount) throw httpError(404, 'Профиль не найден.');
      const row = selected.rows[0];
      const settings = safeSettings(row.settings || {});
      const today = dayKeyInTimezone(new Date(capturedAt), settings.timezone);
      if (row.geo_date !== today) {
        row.geo_date = today; row.geo_meters = 0; row.geo_farthest_meters = 0;
        row.geo_start_lat = null; row.geo_start_lon = null; row.geo_last_lat = null; row.geo_last_lon = null; row.geo_last_timestamp = null;
      }
      const current = { latitude: lat, longitude: lon };
      let added = 0;
      if (row.geo_start_lat == null || row.geo_last_lat == null || row.geo_last_timestamp == null) {
        row.geo_start_lat = lat; row.geo_start_lon = lon;
        row.geo_last_lat = lat; row.geo_last_lon = lon; row.geo_last_timestamp = capturedAt;
      } else {
        const previous = { latitude: Number(row.geo_last_lat), longitude: Number(row.geo_last_lon) };
        const delta = haversineMeters(previous, current);
        const seconds = Math.max(0.25, (capturedAt - Number(row.geo_last_timestamp)) / 1000);
        const speed = delta / seconds;
        // Filter GPS jitter and improbable teleports. The server, not the browser, calculates the score.
        const accepted = capturedAt > Number(row.geo_last_timestamp) && delta >= 2 && delta <= 100 && speed <= 5;
        if (accepted) {
          added = delta;
          row.geo_meters = Number(row.geo_meters) + delta;
          const radial = haversineMeters({ latitude: Number(row.geo_start_lat), longitude: Number(row.geo_start_lon) }, current);
          row.geo_farthest_meters = Math.max(Number(row.geo_farthest_meters), radial);
        }
        // Always advance the sample so one bad point does not create an endless jump later.
        row.geo_last_lat = lat; row.geo_last_lon = lon; row.geo_last_timestamp = capturedAt;
      }
      const history = row.history && typeof row.history === 'object' ? row.history : {};
      const completedToday = Array.isArray(history[today]) ? history[today] : [];
      const awarded = [];
      for (const task of QUESTS) {
        const value = task.metric === 'farthest' ? Number(row.geo_farthest_meters) : Number(row.geo_meters);
        if (value >= task.target && !completedToday.includes(task.id)) {
          const insert = await client.query(`INSERT INTO completed_tasks(user_id,task_id,day_key,coins_awarded,xp_awarded)
            VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,task_id,day_key) DO NOTHING RETURNING id`,
          [req.user.id, task.id, today, task.coins, task.xp]);
          if (!insert.rowCount) continue;
          completedToday.push(task.id); row.coins = Number(row.coins) + task.coins; row.xp = Number(row.xp) + task.xp;
          row.total_tasks = Number(row.total_tasks) + 1; row.week_xp = Number(row.week_xp) + task.xp;
          awarded.push(task.id);
        }
      }
      let streakMessage = '';
      if (awarded.length) streakMessage = setActivityDay(row, today);
      history[today] = completedToday;
      row.history = history;
      await client.query(`UPDATE player_state SET coins=$2,xp=$3,streak=$4,total_tasks=$5,week_xp=$6,history=$7::jsonb,
        streak_freezes=$8,last_active_date=$9,geo_date=$10,geo_meters=$11,geo_farthest_meters=$12,
        geo_start_lat=$13,geo_start_lon=$14,geo_last_lat=$15,geo_last_lon=$16,geo_last_timestamp=$17,updated_at=NOW()
        WHERE user_id=$1`, [req.user.id, row.coins, row.xp, row.streak, row.total_tasks, row.week_xp,
        JSON.stringify(history), row.streak_freezes, row.last_active_date || '', today, row.geo_meters, row.geo_farthest_meters,
        row.geo_start_lat, row.geo_start_lon, row.geo_last_lat, row.geo_last_lon, row.geo_last_timestamp]);
      return { added, awarded, streakMessage, meters: Number(row.geo_meters), farthestMeters: Number(row.geo_farthest_meters), today };
    });
    res.json({ ...result, state: await getState(req.user.id) });
  } catch (err) { next(err); }
});

app.post('/api/gps/stop', requireUser, async (req, res, next) => {
  try {
    // Retain only today's distance metrics; clear precise coordinates when tracking stops.
    await pool.query(`UPDATE player_state SET geo_start_lat=NULL,geo_start_lon=NULL,geo_last_lat=NULL,geo_last_lon=NULL,
      geo_last_timestamp=NULL,updated_at=NOW() WHERE user_id=$1`, [req.user.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

app.post('/api/shop/buy', requireUser, async (req, res, next) => {
  try {
    const itemId = typeof req.body.itemId === 'string' ? req.body.itemId : '';
    const item = SHOP[itemId];
    if (!item) throw httpError(404, 'Такого товара нет в магазине.');
    const result = await transaction(async client => {
      const s = await client.query('SELECT * FROM player_state WHERE user_id=$1 FOR UPDATE', [req.user.id]);
      if (!s.rowCount) throw httpError(404, 'Профиль не найден.');
      const p = s.rows[0];
      const inventory = p.inventory || [];
      if (item.kind !== 'streakFreeze' && inventory.includes(itemId)) throw httpError(409, 'Этот предмет уже есть в твоей коллекции.');
      if (Number(p.coins) < item.price) throw httpError(402, 'Не хватает коенов для покупки.');
      const coins = Number(p.coins) - item.price;
      const freezes = Number(p.streak_freezes) + (item.kind === 'streakFreeze' ? 1 : 0);
      const newInventory = item.kind === 'streakFreeze' ? inventory : [...inventory, itemId];
      const theme = item.kind === 'theme' ? itemId : p.equipped_theme;
      const avatar = item.kind === 'avatar' ? itemId : p.equipped_avatar;
      const voice = item.kind === 'voice' ? itemId : p.equipped_voice;
      await client.query(`UPDATE player_state SET coins=$2,streak_freezes=$3,inventory=$4,equipped_theme=$5,
        equipped_avatar=$6,equipped_voice=$7,updated_at=NOW() WHERE user_id=$1`,
      [req.user.id, coins, freezes, newInventory, theme, avatar, voice]);
      await client.query('INSERT INTO shop_purchases(user_id,item_id,price) VALUES($1,$2,$3)', [req.user.id, itemId, item.price]);
      return { itemId, price: item.price, coins };
    });
    res.json({ ok: true, purchase: result, state: await getState(req.user.id) });
  } catch (err) { next(err); }
});

app.post('/api/shop/equip', requireUser, async (req, res, next) => {
  try {
    const itemId = typeof req.body.itemId === 'string' ? req.body.itemId : '';
    const item = SHOP[itemId];
    if (!item || !['theme', 'avatar', 'voice'].includes(item.kind)) throw httpError(400, 'Этот товар нельзя применить.');
    const result = await pool.query('SELECT inventory FROM player_state WHERE user_id=$1', [req.user.id]);
    if (!result.rowCount || !result.rows[0].inventory.includes(itemId)) throw httpError(403, 'Сначала купи или забери этот предмет.');
    const col = item.kind === 'theme' ? 'equipped_theme' : item.kind === 'avatar' ? 'equipped_avatar' : 'equipped_voice';
    await pool.query(`UPDATE player_state SET ${col}=$2,updated_at=NOW() WHERE user_id=$1`, [req.user.id, itemId]);
    res.json({ ok: true, state: await getState(req.user.id) });
  } catch (err) { next(err); }
});

app.post('/api/workouts', requireUser, async (req, res, next) => {
  try {
    const activityType = typeof req.body.activityType === 'string' ? req.body.activityType : '';
    const allowed = ['Прогулка', 'Силовая тренировка', 'Растяжка', 'Йога', 'Велосипед', 'Плавание', 'Танцы', 'Другое'];
    const minutes = Number(req.body.durationMinutes);
    const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, 300) : '';
    const clientRequestId = typeof req.body.clientRequestId === 'string' ? req.body.clientRequestId : '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientRequestId)) throw httpError(400, 'Некорректный идентификатор записи тренировки.');
    if (!allowed.includes(activityType)) throw httpError(400, 'Выбери вид активности из списка.');
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) throw httpError(400, 'Продолжительность должна быть от 1 до 180 минут.');
    const current = await pool.query('SELECT settings FROM player_state WHERE user_id=$1', [req.user.id]);
    const timezone = safeSettings(current.rows[0]?.settings || {}).timezone;
    const today = dayKeyInTimezone(new Date(), timezone);
    const result = await transaction(async client => {
      // Lock the player's row before checking the daily total. This serializes
      // concurrent workout submissions for the same account and prevents the
      // daily cap from being exceeded by two requests that arrive together.
      const pResult = await client.query('SELECT * FROM player_state WHERE user_id=$1 FOR UPDATE', [req.user.id]);
      if (!pResult.rowCount) throw httpError(404, 'Профиль не найден.');
      // Check after acquiring the per-player lock so simultaneous retries cannot
      // both pass the idempotency check and award duplicate XP/coins.
      const existing = await client.query('SELECT xp_awarded, coins_awarded FROM workout_logs WHERE user_id=$1 AND client_request_id=$2', [req.user.id, clientRequestId]);
      if (existing.rowCount) return { xp: Number(existing.rows[0].xp_awarded), coins: Number(existing.rows[0].coins_awarded), duplicate: true };
      const p = pResult.rows[0];
      const totalResult = await client.query('SELECT COALESCE(SUM(duration_minutes),0)::int AS minutes FROM workout_logs WHERE user_id=$1 AND local_day=$2', [req.user.id, today]);
      if (Number(totalResult.rows[0].minutes) + minutes > 240) throw httpError(429, 'На сегодня достигнут лимит записи 240 минут активности.');
      const xp = Math.min(30, Math.floor(minutes / 5) * 2);
      const coins = Math.min(20, Math.floor(minutes / 10) * 3);
      const streakMessage = setActivityDay(p, today);
      p.coins = Number(p.coins) + coins; p.xp = Number(p.xp) + xp; p.week_xp = Number(p.week_xp) + xp; p.total_tasks = Number(p.total_tasks) + 1;
      await client.query(`INSERT INTO workout_logs(user_id,activity_type,duration_minutes,note,local_day,xp_awarded,coins_awarded,client_request_id)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)`, [req.user.id, activityType, minutes, note, today, xp, coins, clientRequestId]);
      await persistPlayer(client, req.user.id, p);
      return { xp, coins, streakMessage };
    });
    res.status(201).json({ ok: true, reward: result, state: await getState(req.user.id) });
  } catch (err) { next(err); }
});

app.get('/api/programs', requireUser, async (req, res, next) => {
  try { const state = await getState(req.user.id); res.json({ programs: state.programs }); }
  catch (err) { next(err); }
});

app.get('/api/shop/content/:itemId', requireUser, async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const item = SHOP[itemId];
    if (!item || !['course', 'marathon', 'mealplan'].includes(item.kind)) throw httpError(404, 'Контент не найден.');
    const result = await pool.query('SELECT inventory FROM player_state WHERE user_id=$1', [req.user.id]);
    if (!result.rowCount || !result.rows[0].inventory.includes(itemId)) throw httpError(403, 'Сначала купи или забери этот материал.');
    const content = SHOP_CONTENT[itemId];
    if (!content) throw httpError(404, 'Для этого материала пока нет содержимого.');
    res.json({ itemId, ...content });
  } catch (err) { next(err); }
});

app.post('/api/programs/:programId/start', requireUser, async (req, res, next) => {
  try {
    const program = PROGRAMS[req.params.programId];
    if (!program) throw httpError(404, 'Программа не найдена.');
    const s = await pool.query('SELECT inventory FROM player_state WHERE user_id=$1', [req.user.id]);
    if (program.itemId && !s.rows[0].inventory.includes(program.itemId)) throw httpError(403, 'Сначала открой эту программу в магазине.');
    await pool.query(`INSERT INTO program_progress(user_id,program_id) VALUES($1,$2) ON CONFLICT(user_id,program_id) DO NOTHING`, [req.user.id, req.params.programId]);
    res.json({ ok: true, state: await getState(req.user.id) });
  } catch (err) { next(err); }
});

app.post('/api/programs/:programId/day', requireUser, async (req, res, next) => {
  try {
    const id = req.params.programId;
    const program = PROGRAMS[id];
    const day = Number(req.body.day);
    if (!program) throw httpError(404, 'Программа не найдена.');
    if (!Number.isInteger(day) || day < 1 || day > program.days) throw httpError(400, 'Номер дня программы некорректен.');
    const stateRow = await pool.query('SELECT settings,inventory FROM player_state WHERE user_id=$1', [req.user.id]);
    const s = stateRow.rows[0];
    if (program.itemId && !s.inventory.includes(program.itemId)) throw httpError(403, 'Сначала открой программу в магазине.');
    const today = dayKeyInTimezone(new Date(), safeSettings(s.settings || {}).timezone);
    await transaction(async client => {
      const progRes = await client.query('SELECT * FROM program_progress WHERE user_id=$1 AND program_id=$2 FOR UPDATE', [req.user.id, id]);
      if (!progRes.rowCount) throw httpError(409, 'Сначала нажми «Начать программу».');
      const prog = progRes.rows[0];
      const done = prog.completed_days || [];
      if (done.includes(day)) throw httpError(409, 'Этот день уже отмечен.');
      if (day !== done.length + 1) throw httpError(409, 'Проходи программу последовательно: сначала предыдущий день.');
      if (prog.last_completed_on === today) throw httpError(429, 'За один день можно отметить только один день этой программы. Завтра продолжишь.');
      const next = [...done, day];
      await client.query('UPDATE program_progress SET completed_days=$3,last_completed_on=$4,updated_at=NOW() WHERE user_id=$1 AND program_id=$2', [req.user.id, id, next, today]);
      const pResult = await client.query('SELECT * FROM player_state WHERE user_id=$1 FOR UPDATE', [req.user.id]);
      const p = pResult.rows[0];
      p.coins = Number(p.coins) + 5; p.xp = Number(p.xp) + 10; p.week_xp = Number(p.week_xp) + 10; p.total_tasks = Number(p.total_tasks) + 1;
      setActivityDay(p, today);
      await persistPlayer(client, req.user.id, p);
    });
    res.json({ ok: true, state: await getState(req.user.id) });
  } catch (err) { next(err); }
});

app.get('/api/workouts', requireUser, async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT id,activity_type AS "activityType",duration_minutes AS "durationMinutes",note,
      local_day AS "localDay",xp_awarded AS "xpAwarded",coins_awarded AS "coinsAwarded",logged_at AS "loggedAt"
      FROM workout_logs WHERE user_id=$1 ORDER BY logged_at DESC LIMIT 50`, [req.user.id]);
    res.json({ workouts: result.rows });
  } catch (err) { next(err); }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'API-маршрут не найден.' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: NODE_ENV === 'production' ? '1h' : 0, index: 'index.html' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((err, _req, res, _next) => {
  if (res.headersSent) return;
  const status = Number(err.status) || (err.type === 'entity.too.large' ? 413 : 500);
  if (status >= 500) console.error(err);
  const message = status >= 500 ? 'Внутренняя ошибка сервера. Попробуй ещё раз.' : err.message;
  res.status(status).json({ error: message });
});

async function start() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await pool.query(schema);
    const server = app.listen(PORT, () => console.log(`FitQuest запущен: http://localhost:${PORT}`));
    const shutdown = () => server.close(() => pool.end().finally(() => process.exit(0)));
    process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Не удалось запустить FitQuest. Проверь DATABASE_URL и доступность PostgreSQL.', error.message);
    process.exit(1);
  }
}
start();
