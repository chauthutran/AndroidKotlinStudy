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
    "revision": "972bff329c55bb04b24787b661e7b4a2"
  },
  {
    "url": "css/style.css",
    "revision": "ffbc939e503138959a4084db0c5ab568"
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
    "url": "images/loading.gif",
    "revision": "6334d3fb9d2884cf47c16aaea13bff03"
  },
  {
    "url": "images/sharp-cloud_queue-24px.svg",
    "revision": "7ff516ae1c523351b09e2f4a8d46d7d3"
  },
  {
    "url": "img/about - Copy.svg",
    "revision": "dcc4d07c517ccf3505f9a18289f92d19"
  },
  {
    "url": "img/about.svg",
    "revision": "15b2f8e409f6a038f54ab20b993bd249"
  },
  {
    "url": "img/act_col.svg",
    "revision": "78353bdf9dccfc06acb8927eb6695536"
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
    "revision": "d7742c7c0c773ad2f3d7c86393cc1326"
  },
  {
    "url": "img/arrow_left.svg",
    "revision": "9c031f9c3b58dbb34197f1e40ee8c675"
  },
  {
    "url": "img/arrow_right.svg",
    "revision": "c28938e7b34a8960636a13b992739f16"
  },
  {
    "url": "img/arrow_up.svg",
    "revision": "aa66e325f7c4d48a42cc37f265646e40"
  },
  {
    "url": "img/arrows_col.svg",
    "revision": "bb4825d480cf120357ef7f64294f4635"
  },
  {
    "url": "img/client.svg",
    "revision": "06fbcb3609cbd6c246ac69ebe007ad1b"
  },
  {
    "url": "img/completed.svg",
    "revision": "320afcbc50ae25dedf9fcce641664680"
  },
  {
    "url": "img/entry.svg",
    "revision": "82f5db78e62a0278b8e4904af9535842"
  },
  {
    "url": "img/failed.svg",
    "revision": "f00aad90e742760bc92adcec2e057556"
  },
  {
    "url": "img/favbar_color_act.svg",
    "revision": "13948d206be4212dfe153f189ad0f8be"
  },
  {
    "url": "img/favbar_color_arrows.svg",
    "revision": "c3ce5d7be683c83729425f3b7f39d820"
  },
  {
    "url": "img/favbar_color_contact.svg",
    "revision": "6f045a1b801a41c223aa19852b0d6ebc"
  },
  {
    "url": "img/hold.svg",
    "revision": "4fd7c216aa649d3321168fb92b536d28"
  },
  {
    "url": "img/key.svg",
    "revision": "20f1389ffe6ee7e237c300129b2dc370"
  },
  {
    "url": "img/list.svg",
    "revision": "5a33761261b500b12c84cf1fa80239f8"
  },
  {
    "url": "img/lock.svg",
    "revision": "de3a2c52c81ddd7829b1d107e5ed5ee2"
  },
  {
    "url": "img/logo_bg_header.svg",
    "revision": "ffb7ee77a934be3654c693b51deed512"
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
    "url": "img/logo.svg",
    "revision": "90f03efeae002c8d5d4f6587d347c1ea"
  },
  {
    "url": "img/logout.svg",
    "revision": "12730ff371ee3a829e4b27d0f42d9f6a"
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
    "url": "img/outline-delete-24px.svg",
    "revision": "d98e9b1007e5681f76032d72eb189d4c"
  },
  {
    "url": "img/pending.svg",
    "revision": "bba859eb0f377048681488ef1a62b9c4"
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
    "url": "img/sync_error.svg",
    "revision": "6e779f7b1992ae8e7c48a02435aded39"
  },
  {
    "url": "img/sync-banner.svg",
    "revision": "bb264dcfd6c85fa3c64dbc96a6716446"
  },
  {
    "url": "img/sync-n.svg",
    "revision": "d46af5030a2cb6848ae8d568a72e26aa"
  },
  {
    "url": "img/sync.svg",
    "revision": "a3c479b6e15274e6accbd7bab30da020"
  },
  {
    "url": "img/voucher.svg",
    "revision": "f7fff22ec94144c3a073cf6c0045cee3"
  },
  {
    "url": "index.html",
    "revision": "b77dab7ef75c33947831b72f14b33d3d"
  },
  {
    "url": "manifest.json",
    "revision": "cfa5a4332ef76b95307e204cc10d3391"
  },
  {
    "url": "redeemGen.html",
    "revision": "48fa493b833936ee8bb67a8e9e834abb"
  },
  {
    "url": "scripts/app.js",
    "revision": "a6b201f9b6c21b16cad954161f270750"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "7d8aa161438cfb6e230f03f7804450ef"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "91e16c21ab0fb0a04cbc35ab94ada229"
  },
  {
    "url": "scripts/classes/block.js",
    "revision": "88a83a8cb087542f9414d3d064845748"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "ac64279e5faf9ee58d2c8ae47c5caac3"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "fcd90d2c26adb24af15a5b74898a9706"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "3f07cb6dd2d1aee256a073bb0485184b"
  },
  {
    "url": "scripts/classes/blockMsg.js",
    "revision": "ae440bac958d28ed25d99759bfac11ca"
  },
  {
    "url": "scripts/classes/dataList.js",
    "revision": "27315294713be5bd6f484887855b1332"
  },
  {
    "url": "scripts/classes/favIcon.js",
    "revision": "e807bb6a599d1dbab3bbc1a557d3ce83"
  },
  {
    "url": "scripts/classes/langTerm.js",
    "revision": "0a79fa108678fe9458eb3c94ed9b10e0"
  },
  {
    "url": "scripts/classes/login.js",
    "revision": "92d5af51adc360383061d7b2467ca6d1"
  },
  {
    "url": "scripts/classes/menu.js",
    "revision": "7c8280d32f3c8660ac808b820eedc76d"
  },
  {
    "url": "scripts/classes/test.json",
    "revision": "5913fe915fb2c58661c81f84840bcce8"
  },
  {
    "url": "scripts/classes/validation.js",
    "revision": "b1e3594640c2659e54048d834c0b2b78"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "31121baa573197d467f3d4dbc06885bc"
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
    "url": "scripts/utils/activityUtil.js",
    "revision": "1b502f37db8cf7d973b4cb29ae112cf0"
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
    "revision": "20277ead4f95f6143e283cef0bdbf630"
  },
  {
    "url": "scripts/utils/formMsgManager.js",
    "revision": "7b99cbd79c7340c9cdf3db3f494f24c5"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "4ad862d975d136326bb7d5f947b020e6"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "366ee1d4f8281db3b85cd784f63de00f"
  },
  {
    "url": "scripts/utils/msgManager.js",
    "revision": "45ecd9402cf0dfa6972fbebea8503dca"
  },
  {
    "url": "scripts/utils/restUtil.js",
    "revision": "4602d38331ea511aa30cb8a1407f2981"
  },
  {
    "url": "scripts/utils/syncManager.js",
    "revision": "07be46be0f041eb6ea28741acc8a21cd"
  },
  {
    "url": "scripts/utils/util.js",
    "revision": "c8864d339307b5c07a6c607873fa2ef8"
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
    "revision": "63a9f3013ea75cd83ac320ef7273bef7"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/\.(html|css|js|gif|jpg|png|svg|json)/, workbox.strategies.cacheFirst(), 'GET');
workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com.*/, workbox.strategies.staleWhileRevalidate({ "cacheName":"googleFonts", plugins: [] }), 'GET');
