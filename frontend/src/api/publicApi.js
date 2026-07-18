import { apiRequest, mockDelay, USE_MOCKS } from './apiClient';
import { mockSessions, mockParticipants } from '../data/mockData';

export const publicApi = {
  session(publicCode) {
    if (!USE_MOCKS) return apiRequest(`/public/sessions/${encodeURIComponent(publicCode)}`);
    const session = mockSessions.find((item) => item.publicCode.toLowerCase() === String(publicCode).toLowerCase()) || mockSessions[0];
    return mockDelay({ sessionId: session.sessionId, title: session.title, description: session.description, publicCode: session.publicCode, status: session.status, questionCount: session.questionCount, canJoin: session.status === 'OPEN' });
  },
  join(publicCode, guestName) {
    if (!USE_MOCKS) return apiRequest(`/public/sessions/${encodeURIComponent(publicCode)}/join`, { method: 'POST', body: { guestName } });
    const session = mockSessions.find((item) => item.publicCode.toLowerCase() === String(publicCode).toLowerCase()) || mockSessions[0];
    const participant = { ...mockParticipants[4], participantId: `guest-${Date.now()}`, guestName, sessionId: session.sessionId, answeredCount: 0, correctCount: 0, incorrectCount: 0, score: 0, progressPercent: 0, status: 'ACTIVE' };
    return mockDelay({ token: 'mock-guest-token', expiresAt: new Date(Date.now() + 86400000).toISOString(), session, participant });
  },
};
