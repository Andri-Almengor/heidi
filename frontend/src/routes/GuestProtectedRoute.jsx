import { Navigate } from 'react-router-dom';
import { useGuest } from '../context/GuestContext';

export function GuestProtectedRoute({ children }) {
  const { isGuestAuthenticated, session } = useGuest();
  return isGuestAuthenticated ? children : <Navigate to={session?.publicCode ? `/join/${session.publicCode}` : '/login?tab=guest'} replace />;
}
