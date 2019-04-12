
// Require WorkBox build
const {generateSW} = require('workbox-build');

generateSW({

  swDest: 'cws-stage/service-worker.js',
  globDirectory: 'cws-stage',
  globPatterns: [
    '**/*.{html,css,js,gif,jpg,png,svg,mp3,wav}'
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: true,

  runtimeCaching: [
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
