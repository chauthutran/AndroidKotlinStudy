
// Require WorkBox build
const {generateSW} = require('workbox-build');

generateSW({

  swDest: 'cws/service-worker.js',
  globDirectory: 'cws',
  globPatterns: [
    '**/*.{svg,js,json,css,html,gif,png}'
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: true,

  runtimeCaching: 
  [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com.*/,
      handler: 'staleWhileRevalidate',
      options: {
        cacheName: 'gFonts'
      }
    }
  ]

}).then(({count, size}) => {
  console.log(`Generated new service worker with ${count} precached files, totaling ${size} bytes.`);
}).catch(console.error);
