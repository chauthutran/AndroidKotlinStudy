
// Require WorkBox build
const {generateSW} = require('workbox-build');
//const {Workbox} = require('workbox-window');

generateSW({
  mode: 'production',
  swDest: 'pwa-dev/service-worker.js',
  globDirectory: 'pwa-dev',
  globPatterns: [
    '**/*.{html,css,js,gif,jpg,png,svg,mp3,wav,json,pdf}'
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: false,
  cleanupOutdatedCaches: false,
  importScripts: [ './swExtra.js' ],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'googleFonts'
      }
    }
    ,{
      urlPattern: /\/jobs\//,
      handler: 'CacheOnly',
      options: {
        cacheName: 'jobTest2'
      }
    }
  ]

}).then(({count, size}) => {
  console.log(`Generated new service worker with ${count} precached files, totaling ${size} bytes.`);
}).catch(console.error);
