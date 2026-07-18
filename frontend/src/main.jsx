import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { GuestProvider } from './context/GuestContext';
import { ToastProvider } from './components/common/ToastProvider';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <GuestProvider>
          <App />
        </GuestProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
);
