import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext';
import './index.css';
import 'katex/dist/katex.min.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker immediately for PWA installability
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
