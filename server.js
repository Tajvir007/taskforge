// TaskForge backend: Express REST API + SQLite database + JWT auth
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const PORT = process.env.PORT || 3010;
const SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
const db = new Database(process.env.DB_FILE || path.join(__dirname, 'taskforge.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- Database layer ----------
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  pass_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tasks(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pri TEXT NOT NULL DEFAULT 'Medium',
  st TEXT NOT NULL DEFAULT 'Todo',
  proj TEXT NOT NULL,
  team TEXT NOT NULL,
  due TEXT NOT NULL,
  "time" TEXT DEFAULT '',
  who TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS logs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sec INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id);
`);

const PRI = ['High', 'Medium', 'Low'];
const STATUS = ['Todo', 'In Progress', 'In Review', 'Done'];
const PROJECTS = ['Product Management', 'Project Management', 'Real Estate Website'];
const TEAMS = ['Product Team', 'Design Team'];
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

function seed(uid) {
  const rows = [
    ['Develop high-fidelity UI', 'High', 'In Review', PROJECTS[0], TEAMS[1], day(5), '11:00', 'Aria, Noah'],
    ['Conduct team meeting', 'Medium', 'In Progress', PROJECTS[1], TEAMS[0], day(0), '08:00', 'Maya, Leo'],
    ['Finalize presentations', 'High', 'In Progress', PROJECTS[0], TEAMS[0], day(0), '12:00', 'Aria'],
    ['Reply to client emails', 'Low', 'Todo', PROJECTS[2], TEAMS[0], day(-2), '09:30', 'Noah'],
    ['Design research', 'Medium', 'Todo', PROJECTS[2], TEAMS[1], day(-1), '13:30', 'Maya'],
    ['SaaS real estate landing page', 'Medium', 'In Review', PROJECTS[2], TEAMS[1], day(9), '', 'Leo, Aria'],
    ['Sprint planning notes', 'Low', 'Done', PROJECTS[1], TEAMS[0], day(-4), '', 'Maya'],
    ['Quarterly roadmap review', 'High', 'Todo', PROJECTS[1], TEAMS[0], day(12), '', 'Aria, Leo'],
  ];
  const ins = db.prepare('INSERT INTO tasks(user_id,name,pri,st,proj,team,due,"time",who) VALUES(?,?,?,?,?,?,?,?,?)');
  rows.forEach(r => ins.run(uid, ...r));
  db.prepare('INSERT INTO logs(user_id,name,sec) VALUES(?,?,?)').run(uid, 'Evernote app redesign', 11666);
}

// ---------- HTTP layer ----------
const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const wrap = fn => (req, res) => { try { fn(req, res); } catch (e) { res.status(e.status || 500).json({ error: e.status ? e.message : 'Server error' }); if (!e.status) console.error(e); } };
const bad = (m, s = 400) => Object.assign(new Error(m), { status: s });
const sign = u => jwt.sign({ id: u.id }, SECRET, { expiresIn: '7d' });
const pub = u => ({ id: u.id, name: u.name, email: u.email });

function auth(req, res, next) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  try { req.uid = jwt.verify(t, SECRET).id; if (!db.prepare('SELECT 1 FROM users WHERE id=?').get(req.uid)) throw 0; next(); }
  catch { res.status(401).json({ error: 'Please log in' }); }
}

function clean(b) {
  const name = String(b.name || '').trim().slice(0, 80);
  if (!name) throw bad('Task name is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.due || '')) throw bad('A valid due date is required');
  if (!PRI.includes(b.pri)) throw bad('Invalid priority');
  if (!STATUS.includes(b.st)) throw bad('Invalid status');
  if (!PROJECTS.includes(b.proj)) throw bad('Invalid project');
  if (!TEAMS.includes(b.team)) throw bad('Invalid team');
  const time = /^\d{2}:\d{2}$/.test(b.time || '') ? b.time : '';
  return { name, pri: b.pri, st: b.st, proj: b.proj, team: b.team, due: b.due, time, who: String(b.who || '').slice(0, 120) };
}
const sel = 'SELECT id,name,pri,st,proj,team,due,"time" AS time,who FROM tasks';

// Auth
app.post('/api/auth/register', wrap((req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 60), email = String(req.body.email || '').trim().toLowerCase(), pw = String(req.body.password || '');
  if (!name) throw bad('Name is required');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw bad('Enter a valid email');
  if (pw.length < 6) throw bad('Password must be at least 6 characters');
  if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) throw bad('That email is already registered', 409);
  const id = db.prepare('INSERT INTO users(name,email,pass_hash) VALUES(?,?,?)').run(name, email, bcrypt.hashSync(pw, 10)).lastInsertRowid;
  seed(id);
  res.status(201).json({ token: sign({ id }), user: { id, name, email } });
}));
app.post('/api/auth/login', wrap((req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(String(req.body.email || '').trim().toLowerCase());
  if (!u || !bcrypt.compareSync(String(req.body.password || ''), u.pass_hash)) throw bad('Wrong email or password', 401);
  res.json({ token: sign(u), user: pub(u) });
}));
app.get('/api/me', auth, wrap((req, res) => res.json({ user: pub(db.prepare('SELECT * FROM users WHERE id=?').get(req.uid)) })));

// Tasks
app.get('/api/tasks', auth, wrap((req, res) => res.json(db.prepare(sel + ' WHERE user_id=? ORDER BY id DESC').all(req.uid))));
app.post('/api/tasks', auth, wrap((req, res) => {
  const t = clean(req.body);
  const id = db.prepare('INSERT INTO tasks(user_id,name,pri,st,proj,team,due,"time",who) VALUES(?,?,?,?,?,?,?,?,?)').run(req.uid, t.name, t.pri, t.st, t.proj, t.team, t.due, t.time, t.who).lastInsertRowid;
  res.status(201).json(db.prepare(sel + ' WHERE id=?').get(id));
}));
app.put('/api/tasks/:id', auth, wrap((req, res) => {
  const t = clean(req.body);
  const r = db.prepare('UPDATE tasks SET name=?,pri=?,st=?,proj=?,team=?,due=?,"time"=?,who=? WHERE id=? AND user_id=?').run(t.name, t.pri, t.st, t.proj, t.team, t.due, t.time, t.who, req.params.id, req.uid);
  if (!r.changes) throw bad('Task not found', 404);
  res.json(db.prepare(sel + ' WHERE id=?').get(req.params.id));
}));
app.delete('/api/tasks/:id', auth, wrap((req, res) => {
  if (!db.prepare('DELETE FROM tasks WHERE id=? AND user_id=?').run(req.params.id, req.uid).changes) throw bad('Task not found', 404);
  res.json({ ok: true });
}));

// Time logs
app.get('/api/logs', auth, wrap((req, res) => res.json(db.prepare('SELECT id,name,sec FROM logs WHERE user_id=? ORDER BY id DESC LIMIT 20').all(req.uid))));
app.post('/api/logs', auth, wrap((req, res) => {
  const sec = Math.floor(Number(req.body.sec));
  if (!(sec > 0 && sec < 86400 * 2)) throw bad('Invalid duration');
  const name = String(req.body.name || 'Untitled').slice(0, 80);
  res.status(201).json({ id: db.prepare('INSERT INTO logs(user_id,name,sec) VALUES(?,?,?)').run(req.uid, name, sec).lastInsertRowid, name, sec });
}));

// Reset demo data
app.post('/api/reset', auth, wrap((req, res) => {
  db.transaction(() => { db.prepare('DELETE FROM tasks WHERE user_id=?').run(req.uid); db.prepare('DELETE FROM logs WHERE user_id=?').run(req.uid); seed(req.uid); })();
  res.json({ ok: true });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.listen(PORT, () => console.log(`TaskForge running → http://localhost:${PORT}`));
