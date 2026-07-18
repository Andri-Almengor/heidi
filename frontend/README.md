# Heidi Quiz Frontend

Responsive React + Vite interface based on the supplied Stitch layouts. The original structure, spacing, typography, responsive behavior, cards, side navigation, top bars, editor composition, session cards, quiz option cards, and live-results table have been retained. The visual identity and all visible copy have been adapted to the animated world of **Heidi** and written in English.

## Visual identity

- Pine green for primary navigation and strong actions
- Meadow green for progress and interactive states
- Alpine sky blue for contextual accents
- Warm cream for page surfaces
- Sun yellow for highlights
- Chalet wood brown for narrative details
- Hanken Grotesk headings and Inter body text

The included SVG illustrations are original project assets and do not depend on external image services.

## Local setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Environment variables

```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCKS=true
```

Set `VITE_USE_MOCKS=false` to use the real Node/Express backend. The Apps Script API key must remain only in the backend `.env`; it must never be added to the frontend.

## Main routes

### Public

- `/`
- `/login`
- `/join/:publicCode`

### Administrator

- `/admin`
- `/admin/questions`
- `/admin/questions/new`
- `/admin/questions/:questionId/edit`
- `/admin/sessions`
- `/admin/sessions/new`
- `/admin/sessions/:sessionId`
- `/admin/sessions/:sessionId/edit`
- `/admin/sessions/:sessionId/results`
- `/admin/results`
- `/admin/profile`

### Guest

- `/guest/quiz`
- `/guest/results`

## Source organization

```text
src/
  api/                   REST clients and mock adapters
  assets/illustrations/  Local Alpine SVG artwork
  components/
    admin/
    common/
    guest/
  context/               Administrator and guest session state
  data/                  Heidi-themed preview data
  hooks/                 Polling and document helpers
  layouts/               Public, administrator, and guest shells
  pages/
    admin/
    guest/
    public/
  routes/                Route tree and access guards
  styles/                Design tokens and responsive styles
  utils/                 Storage, constants, and formatters
```

## Production build

```bash
npm run build
npm run preview
```

The `vercel.json` file provides SPA route rewrites for Vercel. Other static hosts should also redirect unknown routes to `index.html`.
