
// Require WorkBox build
const {generateSW} = require('workbox-build');

generateSW({

  swDest: 'cws/service-worker.js',
  globDirectory: 'cws',
  globPatterns: [
    '**/*.{js,json,css,html,svg,gif,png}'
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: true,

  runtimeCaching: 
  [
    {
      urlPattern: /\.(js|json|css|html|svg|gif|png)/,
      handler: 'cacheFirst',
      options: {
        cacheName: 'appShell'
      }
    },
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
