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
    "url": "back_files/service-worker_back.js",
    "revision": "de80056a12a74c2a49b1de762e295cb9"
  },
  {
    "url": "css/log.css",
    "revision": "528354822cf90529d81b97d1223f7114"
  },
  {
    "url": "css/media.css",
    "revision": "9b34f53d6b7dcb1a476e74a34517370a"
  },
  {
    "url": "css/mobile.css",
    "revision": "2b9f8b2d9d342d4d3152bf3086b3f59a"
  },
  {
    "url": "css/responsive.css",
    "revision": "9841f4816574780b53fdbe577149e11a"
  },
  {
    "url": "css/style.css",
    "revision": "3d65929c4db78e363976c70bcb7a286d"
  },
  {
    "url": "images/baseline-cloud_off-24px.svg",
    "revision": "bc7f6d61a42dc641790bb96a6c381dfb"
  },
  {
    "url": "images/baseline-cloud-24px_green.svg",
    "revision": "40dc9e3e4e184f60349091702664a346"
  },
  {
    "url": "images/baseline-cloud-24px.svg",
    "revision": "b88790cbd2e52f24f0a892907a8f0d9a"
  },
  {
    "url": "images/blank.gif",
    "revision": "325472601571f31e1bf00674c368d335"
  },
  {
    "url": "images/captureByDetail.jpg",
    "revision": "67ad72f0fe6c2616271044832eb02176"
  },
  {
    "url": "images/captureByVoucher.jpg",
    "revision": "4e6c2f569dabd33ff4c8720113b19587"
  },
  {
    "url": "images/hide.png",
    "revision": "6d8ab80b89fd5aec6cb0380854ee293d"
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
    "url": "images/icons/icon-192x192.png",
    "revision": "997013800576eb8bb6ced2572e16ec7b"
  },
  {
    "url": "images/icons/icon-256x256.png",
    "revision": "f845c1b014e454d73a1d62215a9f4d84"
  },
  {
    "url": "images/icons/logo-44x44.png",
    "revision": "005da4b33808af9639249421b7c4f16f"
  },
  {
    "url": "images/listInQueue.jpg",
    "revision": "ea75664670f5ec9d4a5c4790bf35f549"
  },
  {
    "url": "images/loader-bar.gif",
    "revision": "1b99adaad537086965a046dc3e04487d"
  },
  {
    "url": "images/loader-bigCircle.gif",
    "revision": "13a5354a3663d119a9918cf83c5c41df"
  },
  {
    "url": "images/loading_basic.gif",
    "revision": "03ce3dcc84af110e9da8699a841e5200"
  },
  {
    "url": "images/loading_big_black.gif",
    "revision": "a51c5608d01acf32df728f299767f82b"
  },
  {
    "url": "images/loading.gif",
    "revision": "6334d3fb9d2884cf47c16aaea13bff03"
  },
  {
    "url": "images/offline.jpg",
    "revision": "607ea3a3094fb6195aee6f5f3fc5f35a"
  },
  {
    "url": "images/offline.svg",
    "revision": "476f7226d96a04f58073e26b68e82a9f"
  },
  {
    "url": "images/online.jpg",
    "revision": "d399f85bd9589fe3cacabcce42724c5f"
  },
  {
    "url": "images/online.svg",
    "revision": "5257c8f497dac61c6047124e51504180"
  },
  {
    "url": "images/reload.png",
    "revision": "49fc5eb146e5e274794d85593a4a6e36"
  },
  {
    "url": "images/searchByPhone.jpg",
    "revision": "6b03314aac5c4cd769a1958c843af1d8"
  },
  {
    "url": "images/searchByVoucher.jpg",
    "revision": "ed34ebf1c0b9af335a77030ebe291dd9"
  },
  {
    "url": "images/searchByWalkIn.jpg",
    "revision": "444a5b20edb9dec94c4036b14fb2e1ae"
  },
  {
    "url": "images/sharp-cloud_queue-24px.svg",
    "revision": "7ff516ae1c523351b09e2f4a8d46d7d3"
  },
  {
    "url": "img/act_col.svg",
    "revision": "d7397b5aabba1c795a8a77da2053a6c7"
  },
  {
    "url": "img/active.svg",
    "revision": "f7bed36b34a604e93941d71404522168"
  },
  {
    "url": "img/alert_col.svg",
    "revision": "ed00a205c0ee21cff01ef3da6f3b75bf"
  },
  {
    "url": "img/arrow_down.svg",
    "revision": "1d6cebe7e67a1c69ca8f1941174c6b77"
  },
  {
    "url": "img/arrow_left.svg",
    "revision": "a4e529007c64fa98680116d155071f71"
  },
  {
    "url": "img/arrow_right.svg",
    "revision": "c23d0dc4e28812b9418a07b306aae2fb"
  },
  {
    "url": "img/arrow_up.svg",
    "revision": "aa66e325f7c4d48a42cc37f265646e40"
  },
  {
    "url": "img/arrows_col.svg",
    "revision": "3e3f227aa06dbfea700cb4ba587bf182"
  },
  {
    "url": "img/client.svg",
    "revision": "06fbcb3609cbd6c246ac69ebe007ad1b"
  },
  {
    "url": "img/favbar_color_act.svg",
    "revision": "95f34a049890161cfb81d08a7f7978c1"
  },
  {
    "url": "img/favbar_color_arrows.svg",
    "revision": "461d5e8b6ff37176a97a260954ed61ee"
  },
  {
    "url": "img/favbar_color_contact.svg",
    "revision": "3a13ded0a18298b8dc62cda8b42e388e"
  },
  {
    "url": "img/key.svg",
    "revision": "20f1389ffe6ee7e237c300129b2dc370"
  },
  {
    "url": "img/lock.svg",
    "revision": "de3a2c52c81ddd7829b1d107e5ed5ee2"
  },
  {
    "url": "img/logo_log.svg",
    "revision": "0be80d63c398303a54a276fedffc2b22"
  },
  {
    "url": "img/logo_top.svg",
    "revision": "35e285c0cccf3fc660d9fa7b4aadefd5"
  },
  {
    "url": "img/mobile.svg",
    "revision": "56d9b808639a50927115cab90dd8e246"
  },
  {
    "url": "img/net-sync.svg",
    "revision": "ca8591a7226c1592fedda68b4d1efa1f"
  },
  {
    "url": "img/net.svg",
    "revision": "2144acb467584dffbf59e6798923bd2b"
  },
  {
    "url": "img/open.svg",
    "revision": "f7cf6943aeb6e19ae972aabcebcb022d"
  },
  {
    "url": "img/outline-verified_user-24px.svg",
    "revision": "a8f2461542d527ad1641e4c72c9251fb"
  },
  {
    "url": "img/plus_color.svg",
    "revision": "0855672affe535b3921b90a5d45e1e34"
  },
  {
    "url": "img/plus_on.svg",
    "revision": "1122c272c9085cf3f611902a4c879b28"
  },
  {
    "url": "img/plus.svg",
    "revision": "7051f6c37f8d6b64308cf5a635ba1e56"
  },
  {
    "url": "img/settings.svg",
    "revision": "7c8dcb4c9fce086566e3fe6414dccd08"
  },
  {
    "url": "img/sync-banner.svg",
    "revision": "406d8238e4a0a815172a2d39edd13db9"
  },
  {
    "url": "img/sync-n.svg",
    "revision": "74076b33f6af9ee62151ccb80ac9e2cf"
  },
  {
    "url": "img/sync.svg",
    "revision": "3d9a12be6d7b5432ea8e9a55a67e39d0"
  },
  {
    "url": "img/voucher.svg",
    "revision": "f7fff22ec94144c3a073cf6c0045cee3"
  },
  {
    "url": "index.html",
    "revision": "0f2b5f08d3c2a35dfc6137f34f4ef90d"
  },
  {
    "url": "manifest.json",
    "revision": "1b38c6fe79a8b3e75d2c02501c8ba0fe"
  },
  {
    "url": "redeemGen.html",
    "revision": "f6a0708fcc84af90bafd2d5dae108959"
  },
  {
    "url": "scripts/app.js",
    "revision": "5fa775962339480c4e118fc6d9fafbeb"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "b2e4e11ea1a542f9189e0f4f48a4b700"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "526807c3d573d4a38e6f9e52b227e262"
  },
  {
    "url": "scripts/classes/block.js",
    "revision": "4619d1411150de7b464ed50d864d952f"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "c1918d30bafcd8118d486691d934fad4"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "f91bffeaad8078f591214c4c2dc47ad9"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "42e3b339ce1840a0df6bece3d0b4540f"
  },
  {
    "url": "scripts/classes/blockMsg.js",
    "revision": "e07c7ceac70600386f0c601d307493aa"
  },
  {
    "url": "scripts/classes/dataList.js",
    "revision": "aa2306150a1af1c36035b8d24f27c4fb"
  },
  {
    "url": "scripts/classes/favIcon.js",
    "revision": "4aeaea8b66558ebf0854832e62cb79b4"
  },
  {
    "url": "scripts/classes/login.js",
    "revision": "98baae1f7416ea96c0bb0dbdb13bb875"
  },
  {
    "url": "scripts/classes/test.json",
    "revision": "5913fe915fb2c58661c81f84840bcce8"
  },
  {
    "url": "scripts/classes/validation.js",
    "revision": "edf7ccf7a20f2265e072918934f78c26"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "d95d2e4840957fb518b1533e9f013251"
  },
  {
    "url": "scripts/libraries/jquery-3.3.1.js",
    "revision": "b0e8755b0ab71a0a4aea47c3b589b47e"
  },
  {
    "url": "scripts/libraries/jquery-3.3.1.min.js",
    "revision": "378087a64e1394fc51f300bb9c11878c"
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
    "url": "scripts/utils/configUtil.js",
    "revision": "b3d3f0be838558b42c01e3cc789572a7"
  },
  {
    "url": "scripts/utils/connManager.js",
    "revision": "75e8f650eb794d200e2a11cb29230254"
  },
  {
    "url": "scripts/utils/dataManager.js",
    "revision": "e821dc1c87a358493602212223a28bb2"
  },
  {
    "url": "scripts/utils/formMsgManager.js",
    "revision": "7b99cbd79c7340c9cdf3db3f494f24c5"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "33fbe563a83434373cf285600b826362"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "b17ffbab885f51b7e51c29c0282ad2d3"
  },
  {
    "url": "scripts/utils/msgManager.js",
    "revision": "d0a5577e032838ef769ae037c3ac1998"
  },
  {
    "url": "scripts/utils/restUtil.js",
    "revision": "3718932a0f18d021ba3264ac3d769dd4"
  },
  {
    "url": "scripts/utils/syncManager.js",
    "revision": "d2f64beaa040af66fe2211b735837eb9"
  },
  {
    "url": "scripts/utils/util.js",
    "revision": "f15e8c5442874ab3fa8b56caa62e48a9"
  },
  {
    "url": "scripts/z. Old Files/cwsRender_v0.js",
    "revision": "190671a49009c2cc6caa80d022d71fe4"
  },
  {
    "url": "scripts/z. Old Files/materialize.js",
    "revision": "38de72592b09b35b61ac49ebf1eba54b"
  },
  {
    "url": "scripts/z. Old Files/testSection.js",
    "revision": "0e632d23fbb96b56bf389700041637dc"
  },
  {
    "url": "service-worker_back.js",
    "revision": "de80056a12a74c2a49b1de762e295cb9"
  },
  {
    "url": "styles/images/ui-icons_444444_256x240.png",
    "revision": "d10bc07005bb2d604f4905183690ac04"
  },
  {
    "url": "styles/images/ui-icons_555555_256x240.png",
    "revision": "00dd0ec0a16a1085e714c7906ff8fb06"
  },
  {
    "url": "styles/images/ui-icons_777620_256x240.png",
    "revision": "4e7e3e142f3939883cd0a7e00cabdaef"
  },
  {
    "url": "styles/images/ui-icons_777777_256x240.png",
    "revision": "40bf25799e4fec8079c7775083de09df"
  },
  {
    "url": "styles/images/ui-icons_cc0000_256x240.png",
    "revision": "093a819138276b446611d1d2a45b98a2"
  },
  {
    "url": "styles/images/ui-icons_ffffff_256x240.png",
    "revision": "ea4ebe072be75fbbea002631916836de"
  },
  {
    "url": "styles/jquery-ui.css",
    "revision": "85291df7b046cd32eb4fb33ddc85bb99"
  },
  {
    "url": "styles/jquery-ui.min.css",
    "revision": "215077014154308be415e1181a14646f"
  },
  {
    "url": "styles/materialize.css",
    "revision": "2aa6b76a5db6082e35600e78b64e7951"
  },
  {
    "url": "styles/style.css",
    "revision": "ef70fa00f4eb9677c96e4027a34735ff"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/\.(html|css|js|gif|jpg|png|svg|json)/, workbox.strategies.cacheFirst(), 'GET');
workbox.routing.registerRoute(/^https:\/\/use\.fontawesome\.com.*/, workbox.strategies.staleWhileRevalidate({ "cacheName":"fontawesome", plugins: [] }), 'GET');
