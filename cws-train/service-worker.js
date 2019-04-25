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
    "revision": "3f081dfee5ad235164e98bcfa0d4d364"
  },
  {
    "url": "css/style.css",
    "revision": "f8d05fccd9fc499607a55f6afda672fc"
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
    "url": "images/close_white.svg",
    "revision": "f2f35369d814bbeca6c7895dbafa9a42"
  },
  {
    "url": "images/hide.png",
    "revision": "6d8ab80b89fd5aec6cb0380854ee293d"
  },
  {
    "url": "images/icons/Connect_train_144px.png",
    "revision": "2387bfe20f9c3ec5feeb489de8e18400"
  },
  {
    "url": "images/icons/Connect_train_152px.png",
    "revision": "2c3a3c33a05b34d8fc5d654a6e79d2f2"
  },
  {
    "url": "images/icons/Connect_train_192px.png",
    "revision": "29f6958ea0c832c4fb030e8cfd822fd0"
  },
  {
    "url": "images/icons/Connect_train_512px.png",
    "revision": "494f1035ba5978b23b74bf0702a4e17d"
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
    "revision": "c9ecbd55c7ef63e5a50df53f1e5e802d"
  },
  {
    "url": "img/act_col.svg",
    "revision": "d7397b5aabba1c795a8a77da2053a6c7"
  },
  {
    "url": "img/act_fpl-fu.svg",
    "revision": "31f758cad00163db9f733baab791a117"
  },
  {
    "url": "img/act_fpl-sp.svg",
    "revision": "d9e6158c7f6a674fa26db76af7083408"
  },
  {
    "url": "img/act_sas.svg",
    "revision": "35abec074ef298bce8018b7c26451a00"
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
    "url": "img/alert_col.svg",
    "revision": "ed00a205c0ee21cff01ef3da6f3b75bf"
  },
  {
    "url": "img/alert.svg",
    "revision": "5f2f94439570a21a82cf1007d5359b8a"
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
    "revision": "d100592ff7348419d6531e320a3fb917"
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
    "url": "img/completed.svg",
    "revision": "d8c9827d88fe0ec692937f10cedabff1"
  },
  {
    "url": "img/Connect.svg",
    "revision": "3a0a2e0bd172fc55453712641f5360a9"
  },
  {
    "url": "img/entry.svg",
    "revision": "a19649ec23fe1803d4dd9408740cb5c6"
  },
  {
    "url": "img/failed.svg",
    "revision": "06ed2b711619acc16461bf830a1d9f96"
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
    "revision": "6daaad3095eb23645844d946000652c6"
  },
  {
    "url": "img/favbar_color_fpl-sp.svg",
    "revision": "232001f8a7fa6e86319b1f9b92713b1a"
  },
  {
    "url": "img/favbar_color_sas.svg",
    "revision": "a1edee2488949524b11b66afa59c40b4"
  },
  {
    "url": "img/hold.svg",
    "revision": "424c05cf649a49a1c5c8057c89e6d4f1"
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
    "revision": "44b0c57dc046930b5f78026ad2eeb937"
  },
  {
    "url": "img/logout.svg",
    "revision": "d9d3a6f585f07fe0ac5a080f456f597d"
  },
  {
    "url": "img/mobile.svg",
    "revision": "56d9b808639a50927115cab90dd8e246"
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
    "revision": "5fe5c1462f3c67821488685afdff8d87"
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
    "url": "img/sharp-remove_circle_outline-24px.svg",
    "revision": "c3fd40fc3ea16901dc5e3b2e5296c56c"
  },
  {
    "url": "img/statistics.svg",
    "revision": "49fd0bf0201f931b915bd2eaed777ea1"
  },
  {
    "url": "img/sync_error.svg",
    "revision": "6345c6b90ad5dd60d639a18892c6f3d2"
  },
  {
    "url": "img/sync-banner.svg",
    "revision": "679bf57f11ff6a88d3a130486a65e2aa"
  },
  {
    "url": "img/sync-n.svg",
    "revision": "bb5732a4e025d9baf31822b06d381366"
  },
  {
    "url": "img/sync.svg",
    "revision": "4e359cd567fad995e2433e434c8c2b23"
  },
  {
    "url": "img/voucher.svg",
    "revision": "cdf69e2c81e75c8c92afa19870e62a9c"
  },
  {
    "url": "index.html",
    "revision": "bcb2509131bef3a67c0519b5b39dd9e4"
  },
  {
    "url": "redeemGen.html",
    "revision": "584e06d04a882d8a8f487edd3dd2c36e"
  },
  {
    "url": "scripts/app.js",
    "revision": "adc9b5f674459d40bbb1b021e6f4b0d7"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "dcbc449555e56b88ceb9b8d606c7ab21"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "335b49cc04ae289caa93ac9bc005a7d0"
  },
  {
    "url": "scripts/classes/block.js",
    "revision": "f7444ca3aaa9becb864388fc8318c628"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "b218b6eb6cd1082a539774a61ecb7502"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "332ca93306fd268f78c2d842080fa9cd"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "ff91bbb6b4e0beb64399594f9aa36e1a"
  },
  {
    "url": "scripts/classes/blockMsg.js",
    "revision": "3fb818b1035abf8bd6b5358eb77c8fc8"
  },
  {
    "url": "scripts/classes/dataList.js",
    "revision": "5b662ebad3d67bc1ae5c35380d48defc"
  },
  {
    "url": "scripts/classes/favIcon.js",
    "revision": "57196fc9f0e9cbdbdc058447b9f58af4"
  },
  {
    "url": "scripts/classes/langTerm.js",
    "revision": "d6fd2435e080ae904d1423fc459eec81"
  },
  {
    "url": "scripts/classes/login.js",
    "revision": "beff5c760274bbf2c64e8d85165fd389"
  },
  {
    "url": "scripts/classes/menu.js",
    "revision": "d0ca49f9455d627bdfada60cfdc0a5ca"
  },
  {
    "url": "scripts/classes/statistics.js",
    "revision": "dcc42f402e09f2c2e227b72c8ec8c2e8"
  },
  {
    "url": "scripts/classes/validation.js",
    "revision": "b0d012ead1f3616f26644edcc723f177"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "f79cf11fc2abf5056117294cd6b6723f"
  },
  {
    "url": "scripts/libraries/jquery-3.4.0.js",
    "revision": "37875fd4c6675a28ec3e5c7fa6e8f2ae"
  },
  {
    "url": "scripts/libraries/jquery-dateformat.min.js",
    "revision": "c5b600620a496ec17424270557a2f676"
  },
  {
    "url": "scripts/libraries/jquery-ui.js",
    "revision": "497a38cd2673fd2262ea97ff63258c3d"
  },
  {
    "url": "scripts/libraries/jquery.blockUI.js",
    "revision": "864af047d8f24d5aa40cecd3a771d33b"
  },
  {
    "url": "scripts/utils/activityUtil.js",
    "revision": "cd800cafc14d537bcf14237a030ed46e"
  },
  {
    "url": "scripts/utils/cacheManager.js",
    "revision": "e69eefc31466651bbb1b13333d04d2d6"
  },
  {
    "url": "scripts/utils/configUtil.js",
    "revision": "3365c4a15d6a71994a8e4c3b5f474c56"
  },
  {
    "url": "scripts/utils/connManager.js",
    "revision": "9e9fcc325834ecc852b24a71a670722b"
  },
  {
    "url": "scripts/utils/dataManager.js",
    "revision": "f1fd3827095e7028c73e6b1b0ee8724f"
  },
  {
    "url": "scripts/utils/db.js",
    "revision": "23d841a538e72574280976415d65b982"
  },
  {
    "url": "scripts/utils/formMsgManager.js",
    "revision": "81b3d18ed348250262e9dfc221ceb3a9"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "eb0ec98e54136de0a500672ea9329fed"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "5243552464c1534ff5974708bb115df9"
  },
  {
    "url": "scripts/utils/msgManager.js",
    "revision": "f6a6db2120aa2afa120046e0f7be7b40"
  },
  {
    "url": "scripts/utils/restUtil.js",
    "revision": "2913bb4efaae04fb0cdf26aeccad9a15"
  },
  {
    "url": "scripts/utils/sounds.js",
    "revision": "091f1ed9e393a19a21b7da72cef338b7"
  },
  {
    "url": "scripts/utils/syncManager.js",
    "revision": "5d28904f6da374e84b70462482999d38"
  },
  {
    "url": "scripts/utils/util.js",
    "revision": "a8155468bd79d4cefa30cd25c0ed5091"
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
    "revision": "5430c0c4c8a84269dcb37f6b73279bde"
  },
  {
    "url": "styles/jquery-ui.min.css",
    "revision": "5430c0c4c8a84269dcb37f6b73279bde"
  },
  {
    "url": "styles/materialize.css",
    "revision": "12c873f702e8cbb23054a6f7a9236697"
  },
  {
    "url": "styles/style.css",
    "revision": "a63fa31096dc860e94af866ad6be955b"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com.*/, workbox.strategies.staleWhileRevalidate({ "cacheName":"googleFonts", plugins: [] }), 'GET');

workbox.googleAnalytics.initialize({});
