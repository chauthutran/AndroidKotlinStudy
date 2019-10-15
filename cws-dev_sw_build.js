
// Require WorkBox build
const {generateSW} = require('workbox-build');

generateSW({

  swDest: 'cws-dev/service-worker.js',
  globDirectory: 'cws-dev',
  globPatterns: [
    '**/*.{html,css,js,gif,jpg,png,svg,mp3,wav}'
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: false,
  cleanupOutdatedCaches: false,
  runtimeCaching: [
    {
      urlPattern: /.js|.html|.css|.svg|.jpg|.png|.gif|.mp3|.wav/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'appShell'
      }
    },
    {
        urlPattern: /eRefWSDev3/,
        handler: 'staleWhileRevalidate',
        options: {
          cacheName: 'eRef-WebService'
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
