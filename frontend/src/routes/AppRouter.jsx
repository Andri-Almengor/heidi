import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { GuestLayout } from '../layouts/GuestLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestProtectedRoute } from './GuestProtectedRoute';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import JoinSessionPage from '../pages/public/JoinSessionPage';
import DashboardPage from '../pages/admin/DashboardPage';
import QuestionsPage from '../pages/admin/QuestionsPage';
import QuestionEditorPage from '../pages/admin/QuestionEditorPage';
import SessionsPage from '../pages/admin/SessionsPage';
import SessionEditorPage from '../pages/admin/SessionEditorPage';
import SessionDetailPage from '../pages/admin/SessionDetailPage';
import ResultsIndexPage from '../pages/admin/ResultsIndexPage';
import SessionResultsPage from '../pages/admin/SessionResultsPage';
import ProfilePage from '../pages/admin/ProfilePage';
import QuizPage from '../pages/guest/QuizPage';
import GuestResultsPage from '../pages/guest/GuestResultsPage';
import NotFoundPage from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join/:publicCode" element={<JoinSessionPage />} />

        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="questions/new" element={<QuestionEditorPage />} />
          <Route path="questions/:questionId/edit" element={<QuestionEditorPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="sessions/new" element={<SessionEditorPage />} />
          <Route path="sessions/:sessionId/edit" element={<SessionEditorPage />} />
          <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
          <Route path="sessions/:sessionId/results" element={<SessionResultsPage />} />
          <Route path="results" element={<ResultsIndexPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route element={<GuestLayout />}>
          <Route path="/guest/quiz" element={<GuestProtectedRoute><QuizPage /></GuestProtectedRoute>} />
          <Route path="/guest/results" element={<GuestProtectedRoute><GuestResultsPage /></GuestProtectedRoute>} />
        </Route>

        <Route path="/guest" element={<Navigate to="/guest/quiz" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
