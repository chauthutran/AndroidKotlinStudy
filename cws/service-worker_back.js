var dataCacheName = 'cws-pwa-data-v1.0.13g';
var cacheName = 'cws-pwa-v1.0.13g';
var filesToCache = [
  "./",
  "./index.html?1.0.13g",
  "./manifest.json",
  "./service-worker.js",

  "./images/icons/icon-128x128.png",
  "./images/icons/icon-144x144.png",
  "./images/icons/icon-152x152.png",
  "./images/icons/icon-192x192.png",
  "./images/icons/icon-256x256.png",
  "./styles/images/ui-icons_444444_256x240.png",
  "./styles/images/ui-icons_555555_256x240.png",
  "./styles/images/ui-icons_777620_256x240.png",
  "./styles/images/ui-icons_777777_256x240.png",
  "./styles/images/ui-icons_cc0000_256x240.png",
  "./styles/images/ui-icons_ffffff_256x240.png",

  "./images/searchByWalkIn.jpg",
  "./images/searchByVoucher.jpg",
  "./images/searchByPhone.jpg",
  "./images/captureByVoucher.jpg",
  "./images/captureByDetail.jpg",
  "./images/listInQueue.jpg",
  "./images/loader-bar.gif",
  "./images/loader-bigCircle.gif",
  "./images/loading_big_black.gif",
  "./images/reload.png",
  "./images/online.jpg",
  "./images/offline.jpg",
  "./images/blank.gif",

  "./styles/style.css",
  "./styles/jquery-ui.css",

  "./scripts/libraries/jquery-3.3.1.js", 
  "./scripts/libraries/jquery.blockUI.js", 
  "./scripts/libraries/jquery-ui.js", 
  "./scripts/libraries/jquery-dateformat.min.js",

  "./scripts/utils/configUtil.js",
  "./scripts/utils/connManager.js",
  "./scripts/utils/dataManager.js",
  "./scripts/utils/formUtil.js",
  "./scripts/utils/util.js",
  
  "./scripts/app.js",
  "./scripts/cwsRender.js",
  
  "./scripts/classes/validation.js",
  "./scripts/classes/login.js",
  "./scripts/classes/action.js",
  "./scripts/classes/block.js",
  "./scripts/classes/blockButton.js",
  "./scripts/classes/blockForm.js",
  "./scripts/classes/blockList.js",
  "./scripts/classes/blockMsg.js",

  "./data/dsConfig.json" 
 ];

// var _serverUrl = location.protocol + '//' + location.host;
// NOTE: also defined in 'formUtil' since these don't talk to eath other.
var _serverUrl = location.protocol + '//' + location.host;
// 'https://apps.psi-mis.org'; <-- white listing try


self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});


self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});


self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);

  // A. If FETCH url is part of the web service ones, cache it...
  var wsUrl = _serverUrl + '/eRefWSDev3/api';

  console.log( 'fetch listener - wsUrl: ' + wsUrl );
  
  if (e.request.url.indexOf(wsUrl) > -1) 
  {
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) 
      {
        //console.log( '-- fetching for network: ' + e.request.url );        
        return fetch(e.request)
        //.then( handleErrors )
        .then( function( response ) 
        {
          //console.log( '-- network got and cached' );
          cache.put(e.request.url, response.clone());
          return response;
        }).catch( function( error ) {
          console.log( '- - - - Catched.. Error case? ' );
          console.log( error );
        });   // end of fetch

      })  // end of 'caches.open'
    );  // end of e.respondWith

  } 
  else 
  {
    // B. Normal Resource related Fetches...
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
  // TODO: on 'fetch(e.request)' right above, add loading message progress show...
});


function handleErrors(response) {
  if (!response.ok) {

      console.log( '-- Failed On Response Result ' );

      throw Error(response.statusText);
  }
  return response;
}
