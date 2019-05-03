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
    "url": "css/responsive.css",
    "revision": "5fb9e3c9cdabcc833a3caa7efd5e31d8"
  },
  {
    "url": "css/style.css",
    "revision": "f51bfbcd347f05f3127f5148b83e32c0"
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
    "url": "images/blank.gif",
    "revision": "325472601571f31e1bf00674c368d335"
  },
  {
    "url": "images/close_white.svg",
    "revision": "f2f35369d814bbeca6c7895dbafa9a42"
  },
  {
    "url": "images/hide.png",
    "revision": "6d8ab80b89fd5aec6cb0380854ee293d"
  },
  {
    "url": "images/icons/Connect_dev_144px.png",
    "revision": "6b9407c411ec5966405f3790a2809828"
  },
  {
    "url": "images/icons/Connect_dev_152px.png",
    "revision": "90015f77a9f9c6b2d5c159a4280d5326"
  },
  {
    "url": "images/icons/Connect_dev_192px.png",
    "revision": "25573985326ca03fd13fc3a2b3974674"
  },
  {
    "url": "images/icons/Connect_dev_512px.png",
    "revision": "8a2f57e980f4552be708f1d85c2e8cbb"
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
    "url": "images/loading.gif",
    "revision": "6334d3fb9d2884cf47c16aaea13bff03"
  },
  {
    "url": "images/sharp-cloud_queue-24px.svg",
    "revision": "a4cbccc08adcc4a00bdb043e7e3c80b3"
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
    "url": "img/act_fpl-fu.svg",
    "revision": "b18ca960206b1675d135b01655ea6c57"
  },
  {
    "url": "img/act_fpl-sp.svg",
    "revision": "391d86831342cdb469e50b55a8d22b6a"
  },
  {
    "url": "img/act_sas.svg",
    "revision": "bae8dc42013c60622f76ab3ad96a0967"
  },
  {
    "url": "img/act.svg",
    "revision": "eb97630ca1c98affbeef32bebba0d7a1"
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
    "url": "img/alert.svg",
    "revision": "eb8c75541da08661a6bfb6a3617afc85"
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
    "revision": "a788d930585e3ee893d10b7e85614339"
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
    "revision": "484c511a0417b487c41c17e1a8428b69"
  },
  {
    "url": "img/Connect.svg",
    "revision": "bd02a90569ddf4ee0b544fc2f1847ebd"
  },
  {
    "url": "img/entry.svg",
    "revision": "82f5db78e62a0278b8e4904af9535842"
  },
  {
    "url": "img/failed.svg",
    "revision": "9b63f0a96f4f1fcda79ea150f09fad1e"
  },
  {
    "url": "img/favbar_color_act.svg",
    "revision": "4bc3606fec5c13e524c07faec581f418"
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
    "url": "img/favbar_color_fpl-fu.svg",
    "revision": "fad14262b353f577d28795d065cf7813"
  },
  {
    "url": "img/favbar_color_fpl-sp.svg",
    "revision": "2f3947984b6bef5c80fdf5c0e416940c"
  },
  {
    "url": "img/favbar_color_sas.svg",
    "revision": "14ceca1978fb6a3aafe8c71f59b5572c"
  },
  {
    "url": "img/hold.svg",
    "revision": "373d2944a1b43261304cde50c5905c18"
  },
  {
    "url": "img/key.svg",
    "revision": "20f1389ffe6ee7e237c300129b2dc370"
  },
  {
    "url": "img/list.svg",
    "revision": "a6bac0e4f5a9dbe41cdfd1f87f35d4f0"
  },
  {
    "url": "img/lock.svg",
    "revision": "de3a2c52c81ddd7829b1d107e5ed5ee2"
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
    "url": "img/menu_icon.svg",
    "revision": "f6814da3ba149036eb3cf39a3cffefe2"
  },
  {
    "url": "img/mobile.svg",
    "revision": "56d9b808639a50927115cab90dd8e246"
  },
  {
    "url": "img/net-green.svg",
    "revision": "0aafa33a6beeca84d37679273ad059d7"
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
    "url": "img/outline-share-24px.svg",
    "revision": "3312f4c3a989b0146198cdddc09678aa"
  },
  {
    "url": "img/pending.svg",
    "revision": "3ca8bd1b85955b7015872d039658e4c4"
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
    "url": "img/sharp-add_circle_outline-24px.svg",
    "revision": "1077ca24d36bc60af3f7fd25a8c9e686"
  },
  {
    "url": "img/sharp-my_location-24px.svg",
    "revision": "0347ed20886b62e3858d6ce5839db9e0"
  },
  {
    "url": "img/sharp-remove_circle_outline-24px.svg",
    "revision": "c3fd40fc3ea16901dc5e3b2e5296c56c"
  },
  {
    "url": "img/statistics.svg",
    "revision": "49fd0bf0201f931b915bd2eaed777ea1"
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
    "revision": "cdf69e2c81e75c8c92afa19870e62a9c"
  },
  {
    "url": "index.html",
    "revision": "d75b2f627e8837176afad5a02db45dee"
  },
  {
    "url": "redeemGen.html",
    "revision": "f5457f66786c000f83be62772fea64f1"
  },
  {
    "url": "scripts/app.js",
    "revision": "76ce023788be4b8df1dd6667f77049ab"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "eb6b9c09318e8ac9ac8edc752c7b4b0f"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "6443a6ea666d1f4f8020e61b0ea3795d"
  },
  {
    "url": "scripts/classes/block.js",
    "revision": "72a68c72c718b414817ff64a8b173a83"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "51d77550ba4046aa98e6932636e4552c"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "af21eb8d8baa420a0b78b553004e267c"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "e845cdcebf9d4c6af8c63cfb9d38c551"
  },
  {
    "url": "scripts/classes/blockMsg.js",
    "revision": "ae440bac958d28ed25d99759bfac11ca"
  },
  {
    "url": "scripts/classes/dataList.js",
    "revision": "096448fe07b234907831866bbf1e460f"
  },
  {
    "url": "scripts/classes/favIcon.js",
    "revision": "70c29c1be3b296106b4c7ed8acc1f298"
  },
  {
    "url": "scripts/classes/langTerm.js",
    "revision": "bbd783284f47f7df4970a126dfdef460"
  },
  {
    "url": "scripts/classes/login.js",
    "revision": "9836a431998dcef22fb5e0881c4428a7"
  },
  {
    "url": "scripts/classes/menu.js",
    "revision": "63f75b6c90baa0679b3dea8192f05cbf"
  },
  {
    "url": "scripts/classes/statistics.js",
    "revision": "32c2d8c497816f95afe1dbe615b4040d"
  },
  {
    "url": "scripts/classes/validation.js",
    "revision": "b1e3594640c2659e54048d834c0b2b78"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "cfc90145b58e46dfc3251eb4ab285b6c"
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
    "revision": "398e3bdfebae22917f6048da04d4165f"
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
    "revision": "cdeda7b7cd5c5124b74154f3a19e6168"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "7f55942cd0b385794cd2eb23616d13a9"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "d927f50da78a5c7c3e10b8eaede24957"
  },
  {
    "url": "scripts/utils/msgManager.js",
    "revision": "474a9168bc6900e8010ba2042812787f"
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
    "revision": "ae8649ad879a0d438e6fbc32c59950df"
  },
  {
    "url": "sounds/coin.mp3",
    "revision": "c761219440ee324746a6348130948f64"
  },
  {
    "url": "sounds/notify.mp3",
    "revision": "55342729bd838d323e62cd653754b56e"
  },
  {
    "url": "sounds/ping.mp3",
    "revision": "05b5a2132d00165e8f356f835b65cfca"
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
    "revision": "ff0b5d7958ed6ee2c4c63a0cff21a07c"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com.*/, workbox.strategies.staleWhileRevalidate({ "cacheName":"googleFonts", plugins: [] }), 'GET');

workbox.googleAnalytics.initialize({});
