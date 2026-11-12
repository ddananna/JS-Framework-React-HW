import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base '/' is required for client-side routes: nested URLs such as /items/item-3
// must load assets from the site root. Deploy with the SPA rewrite files in public/.
export default defineConfig({
  plugins: [react()],
  base: '/',
});
