
// Require WorkBox build
const {generateSW} = require('workbox-build');
//const {Workbox} = require('workbox-window');

generateSW({
  mode: 'production',
  swDest: 'pwa-dev/service-worker.js',
  globDirectory: 'pwa-dev',
  globPatterns: [
    '**/*.{html,css,js,gif,jpg,png,svg,mp3,wav}'
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: false,
  cleanupOutdatedCaches: false,
  runtimeCaching: [
    {
      urlPattern: /^(?!http.*).*\.(?:js|html|css|svg|jpg|png|gif|mp3|wav)$/,      
      handler: 'CacheFirst',
      options: {
        cacheName: 'appShell'
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'googleFonts'
      }
    }
  ]

}).then(({count, size}) => {
  console.log(`Generated new service worker with ${count} precached files, totaling ${size} bytes.`);
}).catch(console.error);
