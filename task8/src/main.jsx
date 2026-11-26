import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { store } from './store';
import { AuthProvider } from './context/AuthContext.jsx';
import { registerServiceWorker } from './pwa/registerSW';
import './App.css';

// HashRouter keeps routes after '#', e.g. /task8/#/items. GitHub Pages then serves
// every page from index.html, so refresh and direct links work.
registerServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Provider makes the Redux store available to every component. */}
    <Provider store={store}>
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </Provider>
  </StrictMode>
);
