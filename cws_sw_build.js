
// Require WorkBox build
const {generateSW} = require('workbox-build');

generateSW({

  swDest: 'cws/service-worker.js',
  globDirectory: 'cws',
  globPatterns: [
    '**/*.{html,css,js,gif,jpg,png,svg,mp3,wav}'
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: true,

  runtimeCaching: [
    {
      urlPattern: /.js|.html|.css/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'appShell'
      }
    }
  ],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com.*/,
      handler: 'staleWhileRevalidate',
      options: {
        cacheName: 'googleFonts'
      }
    }
  ],
  runtimeCaching: [
    {
        urlPattern: /eRefWS/,
        handler: 'staleWhileRevalidate',
        options: {
          cacheName: 'eRef-WebService'
        }
    }
  ]

}).then(({count, size}) => {
  console.log(`Generated new service worker with ${count} precached files, totaling ${size} bytes.`);
}).catch(console.error);
