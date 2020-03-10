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

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

workbox.core.skipWaiting();

workbox.core.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "css/mdDateTimePicker.min.css",
    "revision": "0ecbb1a0d51067dcdc00987e81ba2307"
  },
  {
    "url": "css/qunit.css",
    "revision": "aa03c22c7ae5acdc832b0b719193d453"
  },
  {
    "url": "css/responsive.css",
    "revision": "a43b4b62e1d6abff7544a95d39a02147"
  },
  {
    "url": "css/style.css",
    "revision": "a019c54f5976f503c81a3b4fc0153f86"
  },
  {
    "url": "images/about.svg",
    "revision": "15b2f8e409f6a038f54ab20b993bd249"
  },
  {
    "url": "images/act_col_fpl-fu_arrow_right_24.svg",
    "revision": "b1d595818ce504983c0e74c71c2caa4d"
  },
  {
    "url": "images/act_col_fpl-fu_arrow_right_36.svg",
    "revision": "cc7011f0f59e4146844e36aecfd18cec"
  },
  {
    "url": "images/act_col_fpl-sp_arrow_right_24.svg",
    "revision": "07f47639fc66b3575b84fc3da6ffeb11"
  },
  {
    "url": "images/act_col_fpl-sp_arrow_right_36.svg",
    "revision": "54a2c53ef66ea08284fe635d5f8e7868"
  },
  {
    "url": "images/act_col_sas_arrow_right_24.svg",
    "revision": "a6d8fb99ddf7fc8feda1da4970489add"
  },
  {
    "url": "images/act_col_sas_arrow_right_36.svg",
    "revision": "aa3e1f27755f90ac02fc5321731fb857"
  },
  {
    "url": "images/act_col.svg",
    "revision": "5becb5f889033244c462dd5a122a4acf"
  },
  {
    "url": "images/act_fpl-fu.svg",
    "revision": "98f8a6086c7c1ccb76f59b6b31ab69b9"
  },
  {
    "url": "images/act_fpl-sp.svg",
    "revision": "900a558e68c1cb424311c255d60abfaa"
  },
  {
    "url": "images/act_sas.svg",
    "revision": "f5011794d6182aa709f200da5af43b1a"
  },
  {
    "url": "images/act.svg",
    "revision": "eb97630ca1c98affbeef32bebba0d7a1"
  },
  {
    "url": "images/active.svg",
    "revision": "f50870c06e48ba560b3d8a2b3040a0ed"
  },
  {
    "url": "images/alert_col.svg",
    "revision": "64bcd7fd1fd54ab7f74cc097f477e189"
  },
  {
    "url": "images/alert.svg",
    "revision": "eb8c75541da08661a6bfb6a3617afc85"
  },
  {
    "url": "images/arrow_down.svg",
    "revision": "d7742c7c0c773ad2f3d7c86393cc1326"
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
    "url": "images/arrow_up.svg",
    "revision": "f38c782966ac7a98fcf808e6b691f435"
  },
  {
    "url": "images/arrows_col.svg",
    "revision": "bb4825d480cf120357ef7f64294f4635"
  },
  {
    "url": "images/baseline-cloud_off-24px-unavailable.svg",
    "revision": "ca184a1a04c923979a0e7cd222365dc1"
  },
  {
    "url": "images/baseline-cloud_off-24px.svg",
    "revision": "eff905818e6014ee2797d4def1431e6f"
  },
  {
    "url": "images/blank.gif",
    "revision": "325472601571f31e1bf00674c368d335"
  },
  {
    "url": "images/calendar.svg",
    "revision": "6777232495daf4f27d782dc3a3e8bbbe"
  },
  {
    "url": "images/care.svg",
    "revision": "85848ba472f97377bec6e9697dfe077c"
  },
  {
    "url": "images/cellphone.svg",
    "revision": "0d121ba37b9ba122d551744d842c67a5"
  },
  {
    "url": "images/client.svg",
    "revision": "a8d2f3e4c63ae517728bbf855aed3536"
  },
  {
    "url": "images/close_white.svg",
    "revision": "317be0df51698e9db7a05c4778719f1d"
  },
  {
    "url": "images/completed.svg",
    "revision": "f0b6c1f756bc105d7e399b11abb1c9ae"
  },
  {
    "url": "images/Connect.svg",
    "revision": "bd02a90569ddf4ee0b544fc2f1847ebd"
  },
  {
    "url": "images/entry.svg",
    "revision": "82f5db78e62a0278b8e4904af9535842"
  },
  {
    "url": "images/failed.svg",
    "revision": "a3c5dc242aa6fbf178505ea377ba1550"
  },
  {
    "url": "images/favbar_color_act.svg",
    "revision": "7e3ab032f997a02b1220a9abd9ae9754"
  },
  {
    "url": "images/favbar_color_arrows.svg",
    "revision": "ffd8c63b44da0c63d20b5e74e9a4a7b4"
  },
  {
    "url": "images/favbar_color_contact.svg",
    "revision": "5e0ddcf64ae5632d502500ac5279ed04"
  },
  {
    "url": "images/favbar_color_fpl-fu.svg",
    "revision": "563134d74b6a5afaef196e0269501bfb"
  },
  {
    "url": "images/favbar_color_fpl-sp.svg",
    "revision": "db597511bf8e707794a431332a14f00f"
  },
  {
    "url": "images/favbar_color_sas.svg",
    "revision": "f473cc5a6d3959639ea00e5d518e4818"
  },
  {
    "url": "images/followup.svg",
    "revision": "d015ebd0b1516cdfd3a4a110c6dc884c"
  },
  {
    "url": "images/hide.png",
    "revision": "6d8ab80b89fd5aec6cb0380854ee293d"
  },
  {
    "url": "images/hold.svg",
    "revision": "6fb2c9c125841817c38ae5bdf857876a"
  },
  {
    "url": "images/i_date.svg",
    "revision": "339b1ba5f7e79e27826bc63692ab0b59"
  },
  {
    "url": "images/icons/Connect_144px.png",
    "revision": "6b9407c411ec5966405f3790a2809828"
  },
  {
    "url": "images/icons/Connect_152px.png",
    "revision": "90015f77a9f9c6b2d5c159a4280d5326"
  },
  {
    "url": "images/icons/Connect_192px.png",
    "revision": "25573985326ca03fd13fc3a2b3974674"
  },
  {
    "url": "images/icons/Connect_512px.png",
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
    "url": "images/key.svg",
    "revision": "5f64dae3223e42777e6e5ef8b8b9cfdb"
  },
  {
    "url": "images/list.svg",
    "revision": "a6bac0e4f5a9dbe41cdfd1f87f35d4f0"
  },
  {
    "url": "images/loading_small.svg",
    "revision": "6b8bc26a41490ddc76a87a68cc58fc2e"
  },
  {
    "url": "images/lock.svg",
    "revision": "087e69ed52f2e66397b49a98e2fcb5b3"
  },
  {
    "url": "images/logo.svg",
    "revision": "90f03efeae002c8d5d4f6587d347c1ea"
  },
  {
    "url": "images/logout.svg",
    "revision": "12730ff371ee3a829e4b27d0f42d9f6a"
  },
  {
    "url": "images/menu_icon.svg",
    "revision": "f6814da3ba149036eb3cf39a3cffefe2"
  },
  {
    "url": "images/mobile.svg",
    "revision": "aa90c5f40154aba68fd1ba449fba6b93"
  },
  {
    "url": "images/my_details.svg",
    "revision": "dba1cfb6a07e7d21af17eb0dcbf6683c"
  },
  {
    "url": "images/open.svg",
    "revision": "ae895e29227e7f4fd3987aebdabc6196"
  },
  {
    "url": "images/outline-delete-24px.svg",
    "revision": "d98e9b1007e5681f76032d72eb189d4c"
  },
  {
    "url": "images/outline-share-24px.svg",
    "revision": "3312f4c3a989b0146198cdddc09678aa"
  },
  {
    "url": "images/pending.svg",
    "revision": "cc1af7cf4f3f62ddfe6de4c4957b95f5"
  },
  {
    "url": "images/plus_on.svg",
    "revision": "2f27f45bcc8a5d3d3f08a1d7f1c95fac"
  },
  {
    "url": "images/plus.svg",
    "revision": "7b1dd5f7f458bd0224ace63746b3bcae"
  },
  {
    "url": "images/provision.svg",
    "revision": "147b508f1006d0e64936952dbe40ff97"
  },
  {
    "url": "images/qr_cancel.svg",
    "revision": "da5083a7dfb0089fbf962140ca536077"
  },
  {
    "url": "images/qr.svg",
    "revision": "a5a5d46b764827624d62c66e90191d01"
  },
  {
    "url": "images/search.svg",
    "revision": "2a664f702b3a64a33c8ab589e7a0bdee"
  },
  {
    "url": "images/settings.svg",
    "revision": "9cfa14b8237f770a96b36ab0956c4670"
  },
  {
    "url": "images/sharp-add_circle_outline-24px.svg",
    "revision": "1077ca24d36bc60af3f7fd25a8c9e686"
  },
  {
    "url": "images/sharp-cloud_queue-24px.svg",
    "revision": "78da91674ff292a59c084a77cf4b6a74"
  },
  {
    "url": "images/sharp-my_location-24px.svg",
    "revision": "0347ed20886b62e3858d6ce5839db9e0"
  },
  {
    "url": "images/sharp-remove_circle_outline-24px.svg",
    "revision": "c3fd40fc3ea16901dc5e3b2e5296c56c"
  },
  {
    "url": "images/statistics.svg",
    "revision": "9b117fd39eb6c87582385e1051e44c07"
  },
  {
    "url": "images/sync_error.svg",
    "revision": "6e779f7b1992ae8e7c48a02435aded39"
  },
  {
    "url": "images/sync-banner.svg",
    "revision": "bb264dcfd6c85fa3c64dbc96a6716446"
  },
  {
    "url": "images/sync-error.svg",
    "revision": "6e779f7b1992ae8e7c48a02435aded39"
  },
  {
    "url": "images/sync-n.svg",
    "revision": "d46af5030a2cb6848ae8d568a72e26aa"
  },
  {
    "url": "images/sync.svg",
    "revision": "a3c479b6e15274e6accbd7bab30da020"
  },
  {
    "url": "images/unavail.svg",
    "revision": "7a301512d54cde88b72db70593cc1914"
  },
  {
    "url": "images/user.svg",
    "revision": "babc43a6d0403b5f82c4baba1fd9666e"
  },
  {
    "url": "images/voucher.svg",
    "revision": "bfc6cb65ed492560515a73176d093480"
  },
  {
    "url": "index.html",
    "revision": "8ceaa23fe864ed33dc1ee4b6fe88ab56"
  },
  {
    "url": "redeemGen.html",
    "revision": "294625bdc2e797994c50cc5e0b5d46da"
  },
  {
    "url": "scripts/app.js",
    "revision": "7d7ab8ec477f6be1cbef02d44eb5a9bf"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "12ca1becf57e297802cfc370e549db97"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "f9a314af33166c5b4d0d90bfea9838f7"
  },
  {
    "url": "scripts/classes/activityItem.js",
    "revision": "58769be13711b8513ffe802d9b014c10"
  },
  {
    "url": "scripts/classes/appModeSwitchPrompt.js",
    "revision": "be81e8e88d8f07f823da776b54b95859"
  },
  {
    "url": "scripts/classes/baseConverter.js",
    "revision": "a307a74f8732128f26d7e7c17d0e8a62"
  },
  {
    "url": "scripts/classes/block.js",
    "revision": "0562d9bd3be3e8e83e8a5989a8f2ec7e"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "14cca0d34e848748516c9e515d2ae926"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "9df921ccae0d6687bc8786d0c635bfd0"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "8b53e1fcbdc51b835b2d537c552a18d3"
  },
  {
    "url": "scripts/classes/blockListView.js",
    "revision": "f00ff0571c7890bba21aba4d49ee54f9"
  },
  {
    "url": "scripts/classes/blockMsg.js",
    "revision": "7fd45778a932e477d46118556b7d6065"
  },
  {
    "url": "scripts/classes/dataList.js",
    "revision": "0c50ad9978654fe6b6880f7f40aab80b"
  },
  {
    "url": "scripts/classes/favIcon.js",
    "revision": "d5f7528c737c09a206114aee8c430f52"
  },
  {
    "url": "scripts/classes/inputControl.js",
    "revision": "b94f880ce89e677134aa156a428ae024"
  },
  {
    "url": "scripts/classes/langTerm.js",
    "revision": "5d62e856f46657c809ed739d709b214f"
  },
  {
    "url": "scripts/classes/login.js",
    "revision": "7a2af2b49829128046bf7f27c75db0b0"
  },
  {
    "url": "scripts/classes/menu.js",
    "revision": "fa8eae81e1d640546e1a90878302cd20"
  },
  {
    "url": "scripts/classes/myDetails.js",
    "revision": "b6cdde8dc99e5ad1aba1a2179a94a246"
  },
  {
    "url": "scripts/classes/pwaEpoch.js",
    "revision": "09015fa59b86932c56a80f2822aed1f7"
  },
  {
    "url": "scripts/classes/qrcode.js",
    "revision": "92943f603ef7b20db8ade7b117d46762"
  },
  {
    "url": "scripts/classes/settingsApp.js",
    "revision": "8b78599d4c0d80da9bd179c53f37dabd"
  },
  {
    "url": "scripts/classes/statistics.js",
    "revision": "323ad2c0c1981de0b1314900a025f0aa"
  },
  {
    "url": "scripts/classes/validation.js",
    "revision": "8d38e286ba3a3c75c7ad07b10abc9945"
  },
  {
    "url": "scripts/classes/webqr.js",
    "revision": "d68c757ed34cd531bb2ebadf15c681c8"
  },
  {
    "url": "scripts/constants/constants.js",
    "revision": "7d9eb389b8f99aa150060c5e076492b4"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "fa23d7295cb6f5213a91aa77149d44cc"
  },
  {
    "url": "scripts/libraries/aes.js",
    "revision": "4ff108e4584780dce15d610c142c3e62"
  },
  {
    "url": "scripts/libraries/jquery-3.4.0.js",
    "revision": "c890ca4c360b70089b69bb7a9ee75396"
  },
  {
    "url": "scripts/libraries/jquery-autocomplete.js",
    "revision": "4102c8bda3aa2c9dee5765ba82dbcc4c"
  },
  {
    "url": "scripts/libraries/jquery-dateformat.min.js",
    "revision": "a779f3045ce21a37e97ffe3b8786015c"
  },
  {
    "url": "scripts/libraries/jquery-ui.js",
    "revision": "ab5284de5e3d221e53647fd348e5644b"
  },
  {
    "url": "scripts/libraries/jquery.blockUI.js",
    "revision": "5c98c0cbfacee6dab0783112cb0e233d"
  },
  {
    "url": "scripts/libraries/jquery.maska.js",
    "revision": "1958941787a06764a6538ced0f2bb1be"
  },
  {
    "url": "scripts/libraries/llqrcode.js",
    "revision": "82f070af5b5225612aa9f75113d034b9"
  },
  {
    "url": "scripts/libraries/localforage.min.js",
    "revision": "862e9e065bcfe3944871cbf66229b3fd"
  },
  {
    "url": "scripts/libraries/maska.js",
    "revision": "3e07bf8c4ba807e91e5f26b0ff42251f"
  },
  {
    "url": "scripts/libraries/mdDateTimePicker.min.js",
    "revision": "389ea25a28862ddfb5be9cd51d32a2d8"
  },
  {
    "url": "scripts/libraries/moment.min.js",
    "revision": "132734424cbe44372cf5fc2d6f7e2ec3"
  },
  {
    "url": "scripts/libraries/qunit.js",
    "revision": "12bbfc8e326e6881bb82e836b4d51106"
  },
  {
    "url": "scripts/services/cacheManager.js",
    "revision": "12a125e92e4408bd95f6d456065824e1"
  },
  {
    "url": "scripts/services/connManager.js",
    "revision": "2e280c68c93abd38b6721109a6119d26"
  },
  {
    "url": "scripts/services/connManagerNew.js",
    "revision": "92c64f340e3e992565b678c5a5972b7d"
  },
  {
    "url": "scripts/services/dataFormatConvert.js",
    "revision": "912642173be6b6cccfc39cfea0cccaef"
  },
  {
    "url": "scripts/services/dataVerMove.js",
    "revision": "0bb5d177a77744d17286d3cd7cbbe6e5"
  },
  {
    "url": "scripts/services/devHelper.js",
    "revision": "8a1eab22c90a2eb78332fea568d03310"
  },
  {
    "url": "scripts/services/formMsgManager.js",
    "revision": "d12cdc7721b1ecbd8b430e8f4a4ea4df"
  },
  {
    "url": "scripts/services/msgManager.js",
    "revision": "f10fb8544235025e40fe6ea4316efd89"
  },
  {
    "url": "scripts/services/old/dataManager.js",
    "revision": "d31a3443a28e869de6f29892c779c87e"
  },
  {
    "url": "scripts/services/old/dbStorageIDB.js",
    "revision": "ea13b41c2219e99298e46abdcaed6386"
  },
  {
    "url": "scripts/services/old/indexdbDataManager.js",
    "revision": "cc0da88d9281073b9f3ed767887da9a2"
  },
  {
    "url": "scripts/services/old/localStorageDataManager.js",
    "revision": "d5f25ae4971422158a959336dee9e5a9"
  },
  {
    "url": "scripts/services/scheduleManager.js",
    "revision": "9997827c8d6c2858084ea76e1840a8b4"
  },
  {
    "url": "scripts/services/statusInfoManager.js",
    "revision": "4447d5788cb0b71d1a9f0ec563b721bc"
  },
  {
    "url": "scripts/services/storage/dataManager2.js",
    "revision": "bb61242ebb62cfdcda947ee7022d5e58"
  },
  {
    "url": "scripts/services/storage/localStgMng.js",
    "revision": "658823556a0f636d1e40ce4a23ea48b2"
  },
  {
    "url": "scripts/services/storage/storageMng.js",
    "revision": "03483b29d0213d4291064e123adbb0b6"
  },
  {
    "url": "scripts/services/swManager.js",
    "revision": "0f557fa6642e08653682291e133b323d"
  },
  {
    "url": "scripts/services/syncManager.js",
    "revision": "b9a9688da9b884296fcc02988d4adf4c"
  },
  {
    "url": "scripts/services/syncManagerNew.js",
    "revision": "2cef77cc10a041a8888d6068885f23ba"
  },
  {
    "url": "scripts/services/viewsListManagerOLD.js",
    "revision": "86aab4993e8d07a3e617aef108ee801a"
  },
  {
    "url": "scripts/services/wsApiManager.js",
    "revision": "3cf701268b849858d18ac06efb111fc1"
  },
  {
    "url": "scripts/utils/activityUtil.js",
    "revision": "69e3591606ce484398d365b3a492f2f3"
  },
  {
    "url": "scripts/utils/configUtil.js",
    "revision": "fa728c15fe1f4ad76a097d4e998d9b1a"
  },
  {
    "url": "scripts/utils/dbStorageSelector.js",
    "revision": "e5c21632873d151139cddc4f1bb0efab"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "d95e9dcb494f5fe16e1a2119359aedd6"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "591e6d08fe07d5995133630a11449800"
  },
  {
    "url": "scripts/utils/localStatistics.js",
    "revision": "b6da56823d27dedc0f2657a974b6ee7b"
  },
  {
    "url": "scripts/utils/pptManager.js",
    "revision": "25c5dccb817cdb8d2f4d809d41e87e30"
  },
  {
    "url": "scripts/utils/pptOptions.js",
    "revision": "7206d5c8b52e6d9e5e9ab336d5ea67eb"
  },
  {
    "url": "scripts/utils/restUtil.js",
    "revision": "eefc48efb6ebd155effb9d141287c594"
  },
  {
    "url": "scripts/utils/sounds.js",
    "revision": "d45a393f5c03d8c2185f0e8cab91c586"
  },
  {
    "url": "scripts/utils/util.js",
    "revision": "d7e8110564b203c246b33c93ef2aa076"
  },
  {
    "url": "sounds/beep.mp3",
    "revision": "1161ea9429c49bdf9eb0c1b5c6d8b3b6"
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
    "url": "styles/jquery-autocomplete.css",
    "revision": "328af1bcd19137dfa16aa6d8b210fb71"
  },
  {
    "url": "styles/jquery-ui.css",
    "revision": "6fd5a6e8197041971d02cf62d06f4b14"
  },
  {
    "url": "styles/jquery-ui.min.css",
    "revision": "0b5729a931d113be34b6fac13bcf5b29"
  },
  {
    "url": "styles/materialize.css",
    "revision": "df1ac1b2975aa6ade254078cbd56804e"
  },
  {
    "url": "styles/style.css",
    "revision": "471c2e3da201caf8c38a9160d87e4b8e"
  },
  {
    "url": "unittest/jest/util.test.js",
    "revision": "7709f17d9136804f94e03a648d3be913"
  },
  {
    "url": "unittest/noteStorageMng.js",
    "revision": "7435900e40cb13fb207c1feb6238f4f5"
  },
  {
    "url": "unittest/qunittest/js/test_Login.js",
    "revision": "da62c884590304f149f4af7d24720358"
  },
  {
    "url": "unittest/qunittest/js/test_Util.js",
    "revision": "3110a5aa78d1aca9d73313c47bab4032"
  },
  {
    "url": "unittest/qunittest/libs/qunit.css",
    "revision": "aa03c22c7ae5acdc832b0b719193d453"
  },
  {
    "url": "unittest/qunittest/libs/qunit.js",
    "revision": "12bbfc8e326e6881bb82e836b4d51106"
  },
  {
    "url": "unittest/qunittest/test.html",
    "revision": "41b8d2c8ee0356de3d0d683b26967b60"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/.js|.html|.css|.svg|.jpg|.png|.gif|.mp3|.wav/, new workbox.strategies.CacheFirst({ "cacheName":"appShell", plugins: [] }), 'GET');
workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com.*/, new workbox.strategies.StaleWhileRevalidate({ "cacheName":"googleFonts", plugins: [] }), 'GET');
