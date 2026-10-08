import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/global.css';
import App from './App';
import { DESKTOP_MOTION_QUERY } from './hooks/useMotionPreference';

// En escritorio las animaciones ambientales se mantienen siempre (ver useMotionPreference)
const motionQuery = window.matchMedia(DESKTOP_MOTION_QUERY);
const syncMotion = () => document.documentElement.classList.toggle('motion-ok', motionQuery.matches);
syncMotion();
motionQuery.addEventListener('change', syncMotion);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
