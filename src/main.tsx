import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully prevent unhandled rejections from Firebase auth popup closures
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || String(reason || '');
    const code = reason?.code || '';
    if (
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/popup-closed-by-user' ||
      msg.includes('auth/cancelled-popup-request') ||
      msg.includes('auth/popup-closed-by-user') ||
      msg.includes('cancelled-popup-request') ||
      msg.includes('popup-closed-by-user')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
