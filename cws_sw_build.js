
// Require WorkBox build
const {generateSW} = require('workbox-build');

generateSW({

  swDest: 'cws/service-worker.js',
  globDirectory: 'cws',
  globPatterns: [
    '**/*.{html,css,js,gif,jpg,png,svg,json}'
  ],
  skipWaiting: true,
  clientsClaim: true,

  runtimeCaching: [
    {
      urlPattern: /\.(html|css|js|gif|jpg|png|svg|json)/,
      handler: 'cacheFirst'
    },
    {
      urlPattern: /^https:\/\/use\.fontawesome\.com.*/,
      handler: 'staleWhileRevalidate',
      options: {
        cacheName: 'fontawesome'
      }
    }
  ]

}).then(({count, size}) => {
  console.log(`Generated new service worker with ${count} precached files, totaling ${size} bytes.`);
}).catch(console.error);
