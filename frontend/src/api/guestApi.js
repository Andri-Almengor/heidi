import { apiRequest, mockDelay, USE_MOCKS } from './apiClient';
import { mockQuiz } from '../data/mockData';

let quiz = structuredClone(mockQuiz);

export const guestApi = {
  quiz(token) {
    return USE_MOCKS ? mockDelay(quiz) : apiRequest('/guest/quiz', { token });
  },
  answer(token, values) {
    if (!USE_MOCKS) return apiRequest('/guest/answers', { method: 'POST', token, body: values });
    const question = quiz.questions.find((item) => item.questionId === values.questionId);
    if (question?.answered) return mockDelay({ accepted: false, alreadyAnswered: true, answer: question.previousAnswer, participant: quiz.participant });
    if (question) {
      question.answered = true;
      question.previousAnswer = { selectedOptionId: values.selectedOptionId, answeredAt: new Date().toISOString() };
    }
    const answeredCount = quiz.questions.filter((item) => item.answered).length;
    quiz.participant = { ...quiz.participant, answeredCount, progressPercent: Math.round(answeredCount / quiz.questions.length * 10000) / 100, status: answeredCount === quiz.questions.length ? 'COMPLETED' : 'ACTIVE' };
    return mockDelay({ accepted: true, alreadyAnswered: false, answer: { questionId: values.questionId, selectedOptionId: values.selectedOptionId, answeredAt: new Date().toISOString() }, participant: quiz.participant });
  },
  progress(token) {
    return USE_MOCKS ? mockDelay({ session: quiz.session, participant: quiz.participant }) : apiRequest('/guest/progress', { token });
  },
};
