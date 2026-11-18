import { setUpdateRegistration } from './pwaState';

// Registers the service worker in production builds only.
// A new version is detected through `updatefound`. It waits until the user clicks "Update now".
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  const register = async () => {
    const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    });

    // A worker may already be waiting from an earlier visit.
    if (registration.waiting && navigator.serviceWorker.controller) {
      setUpdateRegistration(registration);
    }

    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          setUpdateRegistration(registration);
        }
      });
    });

    // Reload once after the new version takes control, so the page uses the new assets.
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

export function applyUpdate(registration) {
  registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
}
