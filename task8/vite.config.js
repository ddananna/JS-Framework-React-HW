import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Writes dist/sw.js from service-worker/sw-template.js after each build.
// It fills in a unique cache version and the list of built files to precache.
// Old caches are removed by the service worker when the new version activates.
function serviceWorkerPlugin() {
  let root = process.cwd();
  let outDir = path.resolve('dist');

  const PRECACHE_EXTENSIONS = new Set(['.js', '.css', '.html', '.json', '.png', '.svg', '.ico', '.woff', '.woff2']);

  function listFiles(dir, prefix = '') {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      return entry.isDirectory() ? listFiles(path.join(dir, entry.name), relative) : [relative];
    });
  }

  return {
    name: 'pwa-service-worker',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const precache = listFiles(outDir).filter((file) => {
        if (file === 'sw.js' || file === '404.html' || file.startsWith('api/')) return false;
        return PRECACHE_EXTENSIONS.has(path.extname(file));
      });

      const version = Date.now().toString(36);
      const template = fs.readFileSync(path.resolve(root, 'service-worker/sw-template.js'), 'utf8');
      const output = template
        .replaceAll('__CACHE_VERSION__', version)
        .replaceAll('__PRECACHE_URLS__', JSON.stringify(precache));

      fs.writeFileSync(path.join(outDir, 'sw.js'), output);
    },
  };
}

// base is overridden per deployment with --base (GitHub Pages sub-path).
export default defineConfig({
  plugins: [react(), serviceWorkerPlugin()],
  base: '/',
});
