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
    "revision": "d7134845ef85ea83fe672ba20a8a4fed"
  },
  {
    "url": "css/style.css",
    "revision": "26a05b5cacb7d050a89613fe3da3943f"
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
    "revision": "00a8901e7e49ac9cd9af9fba7fa4fac8"
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
    "url": "img/act.svg",
    "revision": "a59f1cd43cdb7fe359000002283a50a7"
  },
  {
    "url": "img/active.svg",
    "revision": "f7bed36b34a604e93941d71404522168"
  },
  {
    "url": "img/alert.svg",
    "revision": "5f2f94439570a21a82cf1007d5359b8a"
  },
  {
    "url": "img/arrow_down.svg",
    "revision": "25d42cf770aa7563897bda84b56cc673"
  },
  {
    "url": "img/arrow_up.svg",
    "revision": "aa66e325f7c4d48a42cc37f265646e40"
  },
  {
    "url": "img/client.svg",
    "revision": "06fbcb3609cbd6c246ac69ebe007ad1b"
  },
  {
    "url": "img/contact.svg",
    "revision": "3426c2fced5715e0a5ab6160a3b71088"
  },
  {
    "url": "img/favbar_act.svg",
    "revision": "14ad465130eb38d00480ce6b414990bc"
  },
  {
    "url": "img/favbar_arrows.svg",
    "revision": "b58d4150200999df19be3bbe767d788b"
  },
  {
    "url": "img/favbar_contact.svg",
    "revision": "ba8537b7fffe061d9f73184a21602551"
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
    "url": "img/menu_icon.svg",
    "revision": "528dd5f2e025f2208386bead7bbc1e59"
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
    "url": "img/plus_on.svg",
    "revision": "1122c272c9085cf3f611902a4c879b28"
  },
  {
    "url": "img/plus.svg",
    "revision": "7051f6c37f8d6b64308cf5a635ba1e56"
  },
  {
    "url": "img/request.svg",
    "revision": "5a9e932915d53546d8e80c2071b867b8"
  },
  {
    "url": "img/service.svg",
    "revision": "35363617ed2f2f7fb7d14b5b33af2ee5"
  },
  {
    "url": "img/settings.svg",
    "revision": "7c8dcb4c9fce086566e3fe6414dccd08"
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
    "revision": "64756a499f6bbb312065fd59b51d665f"
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
    "revision": "24d63f94433d4d80a9980294d06864e7"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "7770e5c3c150be03f7793c3fea76a9ea"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "309b776a446d757064e8d5a956c3d85c"
  },
  {
    "url": "scripts/classes/block.js",
    "revision": "4619d1411150de7b464ed50d864d952f"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "aa58c26446d901cd77a4d57e61aee37e"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "473521b6a887eac86a608fd9a5c8075a"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "2d906309398464d8860691fb0a9c0b44"
  },
  {
    "url": "scripts/classes/blockMsg.js",
    "revision": "e07c7ceac70600386f0c601d307493aa"
  },
  {
    "url": "scripts/classes/dataList.js",
    "revision": "d686bff00df736333d253f13407fb322"
  },
  {
    "url": "scripts/classes/favIcon.js",
    "revision": "5c0b74408661844d3796b63573e63bc8"
  },
  {
    "url": "scripts/classes/login.js",
    "revision": "6029e39448c1d7fee7f2809e857ab713"
  },
  {
    "url": "scripts/classes/test.json",
    "revision": "5913fe915fb2c58661c81f84840bcce8"
  },
  {
    "url": "scripts/classes/validation.js",
    "revision": "561a4872cbde1adb5c3a247c1a5c4bf0"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "619ac30b7f66f49625303aa234b83667"
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
    "revision": "a24dc13c381c415c7b4824ba09e4bc52"
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
    "revision": "9a7141d2c5d00d776cc1a493760dcedb"
  },
  {
    "url": "scripts/utils/msgManager.js",
    "revision": "890849f08c53edee79f41bdcb079ee65"
  },
  {
    "url": "scripts/utils/restUtil.js",
    "revision": "3718932a0f18d021ba3264ac3d769dd4"
  },
  {
    "url": "scripts/utils/util.js",
    "revision": "881f499e0416fad46d55eaa5a2a55838"
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
    "revision": "1c3e7bc24ce6bde6e86973ab3141514a"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/\.(html|css|js|gif|jpg|png|svg|json)/, workbox.strategies.cacheFirst({ "cacheName":"v1.0.0.1", plugins: [] }), 'GET');
workbox.routing.registerRoute(/^https:\/\/use\.fontawesome\.com.*/, workbox.strategies.staleWhileRevalidate({ "cacheName":"fontawesome", plugins: [] }), 'GET');
