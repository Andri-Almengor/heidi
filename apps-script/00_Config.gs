/**
 * HEIDI QUIZ - Google Apps Script API
 * -----------------------------------
 * Base de datos en Google Sheets para:
 * - Administrador
 * - Banco de preguntas
 * - Sesiones de cuestionario
 * - Participantes invitados
 * - Respuestas, progreso y resultados
 *
 * Diseñado para ser consumido por un backend Node.js + Express.
 */

const CONFIG = Object.freeze({
  APP_NAME: 'Heidi Quiz',
  DATABASE_NAME: 'Heidi Quiz - Base de datos',
  TIMEZONE: 'America/Costa_Rica',

  DEFAULT_ADMIN_USERNAME: 'admin',
  DEFAULT_ADMIN_PASSWORD: 'HeidiAdmin#2026!',

  ADMIN_TOKEN_TTL_HOURS: 12,
  GUEST_TOKEN_TTL_DAYS: 30,

  // Cache is best-effort. Every cached read has a Sheets fallback.
  TOKEN_CACHE_TTL_SECONDS: 300,
  PARTICIPANT_CACHE_TTL_SECONDS: 120,
  SESSION_CACHE_TTL_SECONDS: 120,
  SESSION_QUESTIONS_CACHE_TTL_SECONDS: 300,
  ANSWER_MAP_CACHE_TTL_SECONDS: 1800,

  // Answer auditing creates an additional Sheets write per submission.
  // Keep it disabled for high-concurrency quiz sessions.
  AUDIT_GUEST_JOINS: false,
  AUDIT_GUEST_ANSWERS: false,

  SESSION_STATUS: Object.freeze({
    DRAFT: 'DRAFT',
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    DELETED: 'DELETED'
  }),

  PARTICIPANT_STATUS: Object.freeze({
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    LEFT: 'LEFT'
  }),

  TOKEN_TYPES: Object.freeze({
    ADMIN: 'ADMIN',
    GUEST: 'GUEST'
  }),

  SHEETS: Object.freeze({
    USERS: 'Usuarios',
    QUESTIONS: 'Preguntas',
    SESSIONS: 'Sesiones',
    SESSION_QUESTIONS: 'PreguntasSesion',
    PARTICIPANTS: 'Participantes',
    ANSWERS: 'Respuestas',
    TOKENS: 'Tokens',
    AUDIT: 'Auditoria'
  }),

  HEADERS: Object.freeze({
    Usuarios: [
      'userId',
      'username',
      'passwordHash',
      'passwordSalt',
      'role',
      'active',
      'mustChangePassword',
      'createdAt',
      'updatedAt',
      'lastLoginAt'
    ],

    Preguntas: [
      'questionId',
      'questionText',
      'optionsJson',
      'correctOptionId',
      'imageUrl',
      'imageContext',
      'active',
      'createdBy',
      'createdAt',
      'updatedAt'
    ],

    Sesiones: [
      'sessionId',
      'title',
      'description',
      'publicCode',
      'status',
      'createdBy',
      'createdAt',
      'updatedAt',
      'openedAt',
      'closedAt'
    ],

    PreguntasSesion: [
      'sessionQuestionId',
      'sessionId',
      'questionId',
      'questionOrder',
      'points',
      'active',
      'createdAt',
      'updatedAt'
    ],

    Participantes: [
      'participantId',
      'sessionId',
      'guestName',
      'normalizedName',
      'status',
      'joinedAt',
      'lastActivityAt',
      'completedAt',
      'totalQuestions',
      'answeredCount',
      'correctCount',
      'score',
      'progressPercent',
      'questionOrderSeed'
    ],

    Respuestas: [
      'answerId',
      'sessionId',
      'participantId',
      'questionId',
      'selectedOptionId',
      'isCorrect',
      'pointsEarned',
      'answeredAt'
    ],

    Tokens: [
      'tokenId',
      'tokenType',
      'subjectId',
      'tokenHash',
      'active',
      'createdAt',
      'expiresAt',
      'lastUsedAt'
    ],

    Auditoria: [
      'auditId',
      'actorType',
      'actorId',
      'action',
      'entityType',
      'entityId',
      'detailsJson',
      'createdAt'
    ]
  })
});

// Per-execution caches reduce repeated Spreadsheet service calls. Apps Script may
// reuse a warm runtime, but correctness never depends on that behavior.
let RUNTIME_SPREADSHEET_ = null;
const RUNTIME_SHEET_OBJECTS_ = {};
const RUNTIME_HEADERS_ = {};
