# Heidi Quiz

A full-stack, untimed quiz platform inspired by the animated world of **Heidi**.

The project is split into three layers:

```text
React + Vite frontend
        |
        v
Node.js + Express API
        |
        v
Google Apps Script + Google Sheets
```

The frontend never calls Apps Script directly. The private Apps Script API key stays in the Node/Express environment.

## Project structure

```text
heidi/
  frontend/                React + Vite responsive interface
  src/                     Node.js + Express backend
  test/                    Backend tests
  Dockerfile
  Procfile
  package.json
```

## Frontend

The interface is based directly on the supplied Stitch screens and keeps their:

- responsive 12-column desktop grid and stacked mobile composition
- fixed administrator sidebar and top application bar
- landing hero, feature cards, and mobile bottom navigation
- split authentication screen
- elevated KPI and dashboard cards
- session library card layout
- structured question editor
- large quiz answer cards
- live participant progress table and details panel

The visual identity uses Alpine meadow green, sky blue, warm cream, sun yellow, and chalet wood tones. All visible interface copy is in English and themed around Heidi, Grandfather, Peter, Clara, Snowflake, Frankfurt, and life on the Alm.

### Run the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend environment:

```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCKS=true
```

Use `VITE_USE_MOCKS=true` to inspect every page with Heidi-themed preview content. Change it to `false` when the backend is running.

## Backend

### Run the backend

```bash
cp .env.example .env
npm install
npm run dev
```

Backend environment:

```env
NODE_ENV=development
PORT=3000
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
APPS_SCRIPT_API_KEY=YOUR_PRIVATE_BACKEND_API_KEY
CORS_ORIGINS=http://localhost:5173
APPS_SCRIPT_TIMEOUT_MS=25000
TRUST_PROXY=0
```

Do not commit the real `.env` file.

## Useful root commands

```bash
npm run backend:dev
npm run frontend:dev
npm run frontend:build
npm test
npm run check
```

## API routes

### Administrator

```text
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me
POST   /api/admin/change-password

GET    /api/admin/questions
GET    /api/admin/questions/:questionId
POST   /api/admin/questions
PUT    /api/admin/questions/:questionId
DELETE /api/admin/questions/:questionId

GET    /api/admin/sessions
GET    /api/admin/sessions/:sessionId
POST   /api/admin/sessions
PATCH  /api/admin/sessions/:sessionId
PUT    /api/admin/sessions/:sessionId/questions
POST   /api/admin/sessions/:sessionId/open
POST   /api/admin/sessions/:sessionId/close
DELETE /api/admin/sessions/:sessionId
GET    /api/admin/sessions/:sessionId/results
GET    /api/admin/sessions/:sessionId/participants/:participantId/answers
```

### Public and guest

```text
GET  /api/public/sessions/:publicCode
POST /api/public/sessions/:publicCode/join
GET  /api/guest/quiz
POST /api/guest/answers
GET  /api/guest/progress
```

## Security

- The Apps Script API key exists only in the backend environment.
- Administrator and guest tokens are stored separately.
- Protected routes are validated by the backend and Apps Script, not only by the interface.
- Correct answers are not returned through guest quiz routes.
- Submitted guest answers are locked after they are saved.
