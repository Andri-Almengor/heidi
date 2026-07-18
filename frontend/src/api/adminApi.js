import { apiRequest, mockDelay, USE_MOCKS } from './apiClient';
import { mockParticipants, mockQuestions, mockResults, mockSessions } from '../data/mockData';

let questions = structuredClone(mockQuestions);
let sessions = structuredClone(mockSessions);

const stamp = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;

export const adminApi = {
  async login(credentials) {
    if (!USE_MOCKS) return apiRequest('/admin/login', { method: 'POST', body: credentials });
    if (!credentials.username || !credentials.password) throw new Error('Enter your username and password.');
    return mockDelay({
      token: 'mock-admin-token',
      expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
      user: { userId: 'admin-1', username: credentials.username, role: 'ADMIN', active: true, mustChangePassword: false, lastLoginAt: stamp() },
    });
  },
  logout(token) {
    return USE_MOCKS ? mockDelay({ loggedOut: true }) : apiRequest('/admin/logout', { method: 'POST', token });
  },
  me(token) {
    return USE_MOCKS
      ? mockDelay({ user: { userId: 'admin-1', username: 'admin', role: 'ADMIN', active: true, mustChangePassword: false, lastLoginAt: stamp() } })
      : apiRequest('/admin/me', { token });
  },
  changePassword(token, values) {
    return USE_MOCKS
      ? mockDelay({ changed: true, token, expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(), mustChangePassword: false })
      : apiRequest('/admin/change-password', { method: 'POST', token, body: values });
  },
  async listQuestions(token, params = {}) {
    if (!USE_MOCKS) {
      const query = new URLSearchParams({
        includeInactive: String(Boolean(params.includeInactive)),
        search: params.search || '',
      });
      return apiRequest(`/admin/questions?${query}`, { token });
    }
    const search = String(params.search || '').toLowerCase();
    const filtered = questions.filter((question) => (params.includeInactive || question.active) && (!search || `${question.questionText} ${question.imageContext}`.toLowerCase().includes(search)));
    return mockDelay({ questions: filtered, total: filtered.length });
  },
  getQuestion(token, questionId) {
    if (!USE_MOCKS) return apiRequest(`/admin/questions/${questionId}`, { token });
    const question = questions.find((item) => item.questionId === questionId);
    if (!question) throw new Error('Question not found.');
    return mockDelay({ question });
  },
  createQuestion(token, values) {
    if (!USE_MOCKS) return apiRequest('/admin/questions', { method: 'POST', token, body: values });
    const question = { ...values, questionId: makeId('heidi-q'), active: true, createdAt: stamp(), updatedAt: stamp() };
    questions = [question, ...questions];
    return mockDelay({ question });
  },
  updateQuestion(token, questionId, values) {
    if (!USE_MOCKS) return apiRequest(`/admin/questions/${questionId}`, { method: 'PUT', token, body: values });
    const index = questions.findIndex((item) => item.questionId === questionId);
    if (index < 0) throw new Error('Question not found.');
    questions[index] = { ...questions[index], ...values, updatedAt: stamp() };
    return mockDelay({ question: questions[index] });
  },
  deleteQuestion(token, questionId) {
    if (!USE_MOCKS) return apiRequest(`/admin/questions/${questionId}`, { method: 'DELETE', token });
    questions = questions.map((question) => question.questionId === questionId ? { ...question, active: false, updatedAt: stamp() } : question);
    return mockDelay({ deleted: true, questionId });
  },
  async listSessions(token, params = {}) {
    if (!USE_MOCKS) {
      const query = new URLSearchParams({ includeDeleted: String(Boolean(params.includeDeleted)), status: params.status || '' });
      return apiRequest(`/admin/sessions?${query}`, { token });
    }
    const filtered = sessions.filter((session) => (!params.status || session.status === params.status) && (params.includeDeleted || session.status !== 'DELETED'));
    return mockDelay({ sessions: filtered, total: filtered.length });
  },
  getSession(token, sessionId) {
    if (!USE_MOCKS) return apiRequest(`/admin/sessions/${sessionId}`, { token });
    const session = sessions.find((item) => item.sessionId === sessionId);
    if (!session) throw new Error('Session not found.');
    const selectedQuestions = questions.slice(0, session.questionCount || 0);
    return mockDelay({ session, questions: selectedQuestions });
  },
  createSession(token, values) {
    if (!USE_MOCKS) return apiRequest('/admin/sessions', { method: 'POST', token, body: values });
    const session = {
      sessionId: makeId('heidi-session'), title: values.title, description: values.description || '', publicCode: Math.random().toString(36).slice(2, 9).toUpperCase(), status: 'DRAFT', questionCount: values.questionIds?.length || 0, participantCount: 0, createdAt: stamp(), updatedAt: stamp(), openedAt: '', closedAt: '',
    };
    sessions = [session, ...sessions];
    return mockDelay({ session, questions: questions.filter((item) => values.questionIds?.includes(item.questionId)) });
  },
  updateSession(token, sessionId, values) {
    if (!USE_MOCKS) return apiRequest(`/admin/sessions/${sessionId}`, { method: 'PATCH', token, body: values });
    sessions = sessions.map((session) => session.sessionId === sessionId ? { ...session, ...values, updatedAt: stamp() } : session);
    return this.getSession(token, sessionId);
  },
  setSessionQuestions(token, sessionId, questionIds) {
    if (!USE_MOCKS) return apiRequest(`/admin/sessions/${sessionId}/questions`, { method: 'PUT', token, body: { questionIds } });
    sessions = sessions.map((session) => session.sessionId === sessionId ? { ...session, questionCount: questionIds.length, updatedAt: stamp() } : session);
    const session = sessions.find((item) => item.sessionId === sessionId);
    return mockDelay({ session, questions: questions.filter((item) => questionIds.includes(item.questionId)) });
  },
  openSession(token, sessionId) {
    if (!USE_MOCKS) return apiRequest(`/admin/sessions/${sessionId}/open`, { method: 'POST', token });
    sessions = sessions.map((session) => session.sessionId === sessionId ? { ...session, status: 'OPEN', openedAt: stamp(), updatedAt: stamp() } : session);
    return this.getSession(token, sessionId);
  },
  closeSession(token, sessionId) {
    if (!USE_MOCKS) return apiRequest(`/admin/sessions/${sessionId}/close`, { method: 'POST', token });
    sessions = sessions.map((session) => session.sessionId === sessionId ? { ...session, status: 'CLOSED', closedAt: stamp(), updatedAt: stamp() } : session);
    return this.getSession(token, sessionId);
  },
  deleteSession(token, sessionId) {
    if (!USE_MOCKS) return apiRequest(`/admin/sessions/${sessionId}`, { method: 'DELETE', token });
    sessions = sessions.map((session) => session.sessionId === sessionId ? { ...session, status: 'DELETED' } : session);
    return mockDelay({ deleted: true, sessionId });
  },
  results(token, sessionId) {
    if (!USE_MOCKS) return apiRequest(`/admin/sessions/${sessionId}/results`, { token });
    const session = sessions.find((item) => item.sessionId === sessionId) || mockResults.session;
    return mockDelay({ ...mockResults, session, participants: mockParticipants });
  },
  participantAnswers(token, sessionId, participantId) {
    if (!USE_MOCKS) return apiRequest(`/admin/sessions/${sessionId}/participants/${participantId}/answers`, { token });
    const participant = mockParticipants.find((item) => item.participantId === participantId) || mockParticipants[0];
    const answers = questions.slice(0, participant.answeredCount).map((question, index) => ({
      answerId: `answer-${index}`, questionId: question.questionId, questionText: question.questionText, selectedOptionId: index % 4 === 0 ? question.correctOptionId : question.options[0].id, correctOptionId: question.correctOptionId, isCorrect: index < participant.correctCount, pointsEarned: index < participant.correctCount ? 1 : 0, answeredAt: stamp(),
    }));
    return mockDelay({ participant, answers });
  },
};
