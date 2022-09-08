
// Require WorkBox build
const {generateSW} = require('workbox-build');
//const {Workbox} = require('workbox-window');

generateSW({
  mode: 'production',
  swDest: 'wfa/service-worker.js',
  globDirectory: 'wfa',
  globPatterns: [
    '**/*.{html,css,js,gif,jpg,png,svg,mp3,wav,json}'
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: false,
  cleanupOutdatedCaches: false,
  importScripts: [ './swExtra.js' ],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'googleFonts'
      }
    },
    {
      urlPattern: /^https:\/\/matomo\.solidlines\.io\/matomo\.js/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'matomo'
      }
    },
    {
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
