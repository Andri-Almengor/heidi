# Heidi Quiz Backend

Backend REST en **Node.js 20 + Express** para un cuestionario tipo Kahoot sin límite de tiempo. La persistencia y lógica principal están en Google Apps Script y Google Sheets.

## Arquitectura

```text
Frontend futuro
     |
     v
Node.js + Express  --->  Google Apps Script  --->  Google Sheets
     |
     +-- conserva APPS_SCRIPT_API_KEY únicamente en el servidor
```

El navegador nunca debe conectarse directamente con Apps Script porque eso expondría la clave privada del backend.

## Configuración local

```bash
npm install
cp .env.example .env
npm run dev
```

Complete `.env` con:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/ID_DEL_DESPLIEGUE/exec
APPS_SCRIPT_API_KEY=CLAVE_GENERADA_POR_SETUPPROJECT
```

La aplicación inicia por defecto en `http://localhost:3000`.

## Seguridad

- La API key de Apps Script nunca se devuelve al frontend.
- `.env` está excluido de Git.
- Tokens de administrador e invitado se reciben mediante `Authorization: Bearer <token>`.
- Se aplican Helmet, CORS configurable y limitadores de solicitudes.
- Apps Script decide si un token es ADMIN o GUEST; no basta con modificar una ruta del frontend.
- Las respuestas correctas no se entregan en las rutas de invitados.

## Rutas

### Estado

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Comprueba backend y Apps Script |

### Administrador

| Método | Ruta |
|---|---|
| POST | `/api/admin/login` |
| POST | `/api/admin/logout` |
| GET | `/api/admin/me` |
| POST | `/api/admin/change-password` |

### Preguntas administrativas

| Método | Ruta |
|---|---|
| GET | `/api/admin/questions` |
| GET | `/api/admin/questions/:questionId` |
| POST | `/api/admin/questions` |
| PUT | `/api/admin/questions/:questionId` |
| DELETE | `/api/admin/questions/:questionId` |

Filtros disponibles en el listado:

```text
?includeInactive=true&search=capital
```

### Sesiones administrativas

| Método | Ruta |
|---|---|
| GET | `/api/admin/sessions` |
| GET | `/api/admin/sessions/:sessionId` |
| POST | `/api/admin/sessions` |
| PATCH | `/api/admin/sessions/:sessionId` |
| PUT | `/api/admin/sessions/:sessionId/questions` |
| POST | `/api/admin/sessions/:sessionId/open` |
| POST | `/api/admin/sessions/:sessionId/close` |
| DELETE | `/api/admin/sessions/:sessionId` |
| GET | `/api/admin/sessions/:sessionId/results` |
| GET | `/api/admin/sessions/:sessionId/participants/:participantId/answers` |

### Acceso público

| Método | Ruta |
|---|---|
| GET | `/api/public/sessions/:publicCode` |
| POST | `/api/public/sessions/:publicCode/join` |

### Participante invitado

| Método | Ruta |
|---|---|
| GET | `/api/guest/quiz` |
| POST | `/api/guest/answers` |
| GET | `/api/guest/progress` |

## Ejemplos

### Iniciar sesión como administrador

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"CONTRASENA"}'
```

### Crear pregunta

```bash
curl -X POST http://localhost:3000/api/admin/questions \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "¿Cuál es la capital de Costa Rica?",
    "options": [
      {"id":"A","text":"Cartago"},
      {"id":"B","text":"San José"},
      {"id":"C","text":"Heredia"},
      {"id":"D","text":"Alajuela"}
    ],
    "correctOptionId": "B",
    "imageUrl": "",
    "imageContext": ""
  }'
```

### Crear sesión

```bash
curl -X POST http://localhost:3000/api/admin/sessions \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Geografía",
    "description": "Cuestionario de prueba",
    "questionIds": ["ID_PREGUNTA"]
  }'
```

### Unirse como invitado

```bash
curl -X POST http://localhost:3000/api/public/sessions/CODIGO/join \
  -H "Content-Type: application/json" \
  -d '{"guestName":"Andrick"}'
```

### Responder

```bash
curl -X POST http://localhost:3000/api/guest/answers \
  -H "Authorization: Bearer TOKEN_INVITADO" \
  -H "Content-Type: application/json" \
  -d '{"questionId":"ID_PREGUNTA","selectedOptionId":"B"}'
```

## Despliegue

El proyecto incluye:

- `Dockerfile` para Cloud Run, Railway, Render u otro proveedor con contenedores.
- `Procfile` para plataformas que detectan procesos web.
- Puerto dinámico mediante `PORT`.
- `TRUST_PROXY=1` para proveedores detrás de proxy inverso.

Variables obligatorias en producción:

```env
NODE_ENV=production
APPS_SCRIPT_URL=...
APPS_SCRIPT_API_KEY=...
CORS_ORIGINS=https://dominio-del-frontend.com
TRUST_PROXY=1
```

## Flujo de estados

```text
DRAFT -> OPEN -> CLOSED
```

- Solo una sesión `DRAFT` se puede editar o eliminar.
- Solo una sesión `OPEN` acepta participantes y respuestas.
- No hay tiempo límite ni límite de participantes.
- Cada participante puede responder una pregunta una sola vez.
