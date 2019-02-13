
// Require WorkBox build
const {generateSW} = require('workbox-build');

generateSW({

  swDest: 'cws/service-worker.js',
  globDirectory: 'cws',
  globPatterns: [
    '**/*.{html|css|js|gif,jpg,png,svg}'
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: true,

  runtimeCaching: [
    {
      urlPattern: /\.(html|css|js)/,
      handler: 'cacheFirst',
      options: {
        cacheName: 'pwaCore'
      }
    },
    {
      urlPattern: /\.(gif,jpg,png,svg)/,
      handler: 'cacheFirst',
      options: {
        cacheName: 'pwaShell'
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com.*/,
      handler: 'staleWhileRevalidate',
      options: {
        cacheName: 'googleFonts'
      }
    }
  ]

}).then(({count, size}) => {
  console.log(`Generated new service worker with ${count} precached files, totaling ${size} bytes.`);
}).catch(console.error);
