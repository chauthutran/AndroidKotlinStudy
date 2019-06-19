
// Require WorkBox build
const {generateSW} = require('workbox-build');

generateSW({

  swDest: 'locator-dev/service-worker.js',
  globDirectory: 'locator-dev',
  globPatterns: [
    '**/*.{html,css,js,gif,jpeg,jpg,png,svg,mp3,wav}' //png removed to try cache tiles! - added back in
  ],
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: true,

  runtimeCaching: [
    {
        urlPattern: /maps.googleapis/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'googleMaps'
        }
    }
  ],
  runtimeCaching: [
    {
      urlPattern: /.js|.html|.css|.jpeg|.jpg|.png/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'appShell'
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
