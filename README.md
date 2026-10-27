# TaskForge

Full-stack task management app, 3 tiers:

| Tier | Tech | Where |
|---|---|---|
| Frontend | HTML/CSS/vanilla JS (black & red UI) | `public/index.html` |
| Backend | Node.js + Express REST API, JWT auth, bcrypt | `server.js` |
| Database | SQLite (users, tasks, logs tables) | `taskforge.db` (auto-created) |

## Run (Node 18+)
```bash
npm install
JWT_SECRET=your-long-random-secret npm start
```
Open http://localhost:3010, create an account, and start working. Each account gets demo tasks and its own private data.

## API (all except auth need `Authorization: Bearer <token>`)
- `POST /api/auth/register` {name,email,password} / `POST /api/auth/login` {email,password}
- `GET /api/me`
- `GET|POST /api/tasks`, `PUT|DELETE /api/tasks/:id`
- `GET|POST /api/logs` (time-tracker sessions)
- `POST /api/reset` (restore demo data)

## Production notes
Set `JWT_SECRET`, serve behind HTTPS, and back up the `.db` file.
