/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

workbox.skipWaiting();
workbox.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "css/images/layers-2x.png",
    "revision": "4f0283c6ce28e888000e978e537a6a56"
  },
  {
    "url": "css/images/layers.png",
    "revision": "a6137456ed160d7606981aa57c559898"
  },
  {
    "url": "css/images/marker-icon-2x.png",
    "revision": "401d815dc206b8dc1b17cd0e37695975"
  },
  {
    "url": "css/images/marker-icon.png",
    "revision": "2273e3d8ad9264b7daa5bdbf8e6b47f8"
  },
  {
    "url": "css/images/marker-shadow.png",
    "revision": "44a526eed258222515aa21eaffd14a96"
  },
  {
    "url": "css/images/markers-matte.png",
    "revision": "e35e51d1f5e5f18c5920134efee5b84c"
  },
  {
    "url": "css/images/markers-matte@2x.png",
    "revision": "bd650ab26794c44b00a30aaad3d49f01"
  },
  {
    "url": "css/images/markers-plain.png",
    "revision": "91b578f06b6acc021842aba01ddccbbf"
  },
  {
    "url": "css/images/markers-shadow.png",
    "revision": "9e9c77db241e8a58da99bf28694c907d"
  },
  {
    "url": "css/images/markers-shadow@2x.png",
    "revision": "d3a5d64a8534322988a4bed1b7dbc8b0"
  },
  {
    "url": "css/images/markers-soft.png",
    "revision": "02f9178c83e02bb868e961f151b7ed50"
  },
  {
    "url": "css/images/markers-soft@2x.png",
    "revision": "ad459aeb4ab160be9949504c2b36023d"
  },
  {
    "url": "css/jquery-ui.css",
    "revision": "85291df7b046cd32eb4fb33ddc85bb99"
  },
  {
    "url": "css/jquery-ui.min.css",
    "revision": "215077014154308be415e1181a14646f"
  },
  {
    "url": "css/L.Control.Locate.css",
    "revision": "d4372eed75d137c331a4baca28da0310"
  },
  {
    "url": "css/leaflet.awesome-markers.css",
    "revision": "c0e6165d80a019884df90466782a74ef"
  },
  {
    "url": "css/leaflet.css",
    "revision": "c4555048a86096495d07f0775b11cf23"
  },
  {
    "url": "css/materialize.css",
    "revision": "2aa6b76a5db6082e35600e78b64e7951"
  },
  {
    "url": "css/responsive.css",
    "revision": "5fb9e3c9cdabcc833a3caa7efd5e31d8"
  },
  {
    "url": "css/style.css",
    "revision": "f8cccd7de218a6210df5aa163c0490b4"
  },
  {
    "url": "images/arrow_left.svg",
    "revision": "9c031f9c3b58dbb34197f1e40ee8c675"
  },
  {
    "url": "images/arrow_right.svg",
    "revision": "a788d930585e3ee893d10b7e85614339"
  },
  {
    "url": "images/baseline-cloud_off-24px-unavailable.svg",
    "revision": "38d47e1cacd389927849f03eddb4f4c8"
  },
  {
    "url": "images/baseline-cloud_off-24px.svg",
    "revision": "520521bfa31c7dd2d930e07c15ed8884"
  },
  {
    "url": "images/close_white.svg",
    "revision": "317be0df51698e9db7a05c4778719f1d"
  },
  {
    "url": "images/Connect.svg",
    "revision": "bd02a90569ddf4ee0b544fc2f1847ebd"
  },
  {
    "url": "images/icons/icon-128x128.png",
    "revision": "663516616720d1107c5621f326b899e8"
  },
  {
    "url": "images/icons/icon-144x144.png",
    "revision": "4cf8223442d2fbf91653b6ebb5dad779"
  },
  {
    "url": "images/icons/icon-152x152.png",
    "revision": "982f5ccc626f58ca9f099457a0240c47"
  },
  {
    "url": "images/icons/logo-44x44.png",
    "revision": "005da4b33808af9639249421b7c4f16f"
  },
  {
    "url": "images/loading.gif",
    "revision": "6334d3fb9d2884cf47c16aaea13bff03"
  },
  {
    "url": "images/markers-matte.png",
    "revision": "e35e51d1f5e5f18c5920134efee5b84c"
  },
  {
    "url": "images/markers-matte@2x.png",
    "revision": "bd650ab26794c44b00a30aaad3d49f01"
  },
  {
    "url": "images/markers-plain.png",
    "revision": "91b578f06b6acc021842aba01ddccbbf"
  },
  {
    "url": "images/markers-shadow.png",
    "revision": "9e9c77db241e8a58da99bf28694c907d"
  },
  {
    "url": "images/markers-shadow@2x.png",
    "revision": "d3a5d64a8534322988a4bed1b7dbc8b0"
  },
  {
    "url": "images/markers-soft.png",
    "revision": "02f9178c83e02bb868e961f151b7ed50"
  },
  {
    "url": "images/markers-soft@2x.png",
    "revision": "ad459aeb4ab160be9949504c2b36023d"
  },
  {
    "url": "images/mockup_SearchResults.png",
    "revision": "afda0d3d6a11ea3cdacd33278bd6245e"
  },
  {
    "url": "images/sharp-cloud_queue-24px.svg",
    "revision": "a4cbccc08adcc4a00bdb043e7e3c80b3"
  },
  {
    "url": "images/sync-banner.svg",
    "revision": "bb264dcfd6c85fa3c64dbc96a6716446"
  },
  {
    "url": "images/sync-n.svg",
    "revision": "d46af5030a2cb6848ae8d568a72e26aa"
  },
  {
    "url": "index.html",
    "revision": "e0d58024fb89179a75302ee2b9f0dba9"
  },
  {
    "url": "scripts/app.js",
    "revision": "40b7e9aa0e5449a51ef75b4725eb7342"
  },
  {
    "url": "scripts/classes/langTerm.js",
    "revision": "bbd783284f47f7df4970a126dfdef460"
  },
  {
    "url": "scripts/classes/map.js",
    "revision": "d5392efd11fdff25c8b350ebee6fafdf"
  },
  {
    "url": "scripts/classes/menu.js",
    "revision": "63f75b6c90baa0679b3dea8192f05cbf"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "1524992796f851429ccf0dd86fdd65a3"
  },
  {
    "url": "scripts/libraries/jquery-3.4.0.js",
    "revision": "eac275563332b65bae1a3452532ebe38"
  },
  {
    "url": "scripts/libraries/jquery-dateformat.min.js",
    "revision": "c5b600620a496ec17424270557a2f676"
  },
  {
    "url": "scripts/libraries/jquery-ui.js",
    "revision": "e0e5b130995dffab378d011fcd4f06d6"
  },
  {
    "url": "scripts/libraries/jquery.blockUI.js",
    "revision": "1473907211f50cb96aa2f2402af49d69"
  },
  {
    "url": "scripts/libraries/L.Control.Locate.min.js",
    "revision": "e0454c56d88314742326f6a4d1dd422b"
  },
  {
    "url": "scripts/libraries/L.Control.Sidebar.js",
    "revision": "91b31afa0f537d55437ca5b4f72e5b22"
  },
  {
    "url": "scripts/libraries/leaflet.awesome-markers.js",
    "revision": "7c7b0444d266a6f959f1c29b56c132db"
  },
  {
    "url": "scripts/libraries/Leaflet.GoogleMutant.js",
    "revision": "7f210d761e79dbe22576d6a316e0a66a"
  },
  {
    "url": "scripts/libraries/leaflet.js",
    "revision": "45675a2ede6269370d4356a41b11afbb"
  },
  {
    "url": "scripts/utils/activityUtil.js",
    "revision": "34b37025b968199c5d6adc5a6689f8ec"
  },
  {
    "url": "scripts/utils/cacheManager.js",
    "revision": "683c716c7699aa4e149f3a77a153c6e5"
  },
  {
    "url": "scripts/utils/configUtil.js",
    "revision": "b3d3f0be838558b42c01e3cc789572a7"
  },
  {
    "url": "scripts/utils/connManager.js",
    "revision": "18f77426208c329122b95b7047a61e9b"
  },
  {
    "url": "scripts/utils/dataManager.js",
    "revision": "70bbaca1902a1b7f56e3203c6d8c5313"
  },
  {
    "url": "scripts/utils/db.js",
    "revision": "2ff209db4071a438bbcea9cac07dd925"
  },
  {
    "url": "scripts/utils/formMsgManager.js",
    "revision": "ecf3778523513be62db05c8ae3fdc92f"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "a26501f1d81a7bebe365a981cc2accb8"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "d2c565d991921f65987cb94afcf1935a"
  },
  {
    "url": "scripts/utils/mapUtil.js",
    "revision": "855184d459c42ce337c5e5712309c8b8"
  },
  {
    "url": "scripts/utils/msgManager.js",
    "revision": "e81e581f55fa3eebf21f2f614e4c86a5"
  },
  {
    "url": "scripts/utils/restUtil.js",
    "revision": "38487a287a8706f7e25368bb7ec8030f"
  },
  {
    "url": "scripts/utils/sounds.js",
    "revision": "497b024118888bed9708c0a5cc885f11"
  },
  {
    "url": "scripts/utils/syncManager.js",
    "revision": "b6b92a16ecd90d55a352d898940090f0"
  },
  {
    "url": "scripts/utils/util.js",
    "revision": "3888416c5fba9446975361040ea08f61"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/eRefWS/, workbox.strategies.staleWhileRevalidate({ "cacheName":"eRef-WebService", plugins: [] }), 'GET');

workbox.googleAnalytics.initialize({});
