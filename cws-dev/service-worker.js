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
    "revision": "98b1f3f2e512d56ad398948a260aba40"
  },
  {
    "url": "css/responsive.css",
    "revision": "e50df5826aceb414d5ae9c2de5d53137"
  },
  {
    "url": "css/style.css",
    "revision": "db5175f37a22b47e1388323cf2398c58"
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
    "revision": "78353bdf9dccfc06acb8927eb6695536"
  },
  {
    "url": "images/act_fpl-fu.svg",
    "revision": "b18ca960206b1675d135b01655ea6c57"
  },
  {
    "url": "images/act_fpl-sp.svg",
    "revision": "391d86831342cdb469e50b55a8d22b6a"
  },
  {
    "url": "images/act_sas.svg",
    "revision": "bae8dc42013c60622f76ab3ad96a0967"
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
    "revision": "80c0a319fd3ea0a232dca0f146871212"
  },
  {
    "url": "images/care.svg",
    "revision": "2492b5e17f7b283ab9185d16bd6d4299"
  },
  {
    "url": "images/cellphone.svg",
    "revision": "7accbe890c7d919167de2f126540664c"
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
    "revision": "0ababc3260aa87307cc547a9cd3a3a30"
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
    "revision": "f2bb36ec28433e2bf11c51ee2290274f"
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
    "revision": "c9bb20e86a16941a18f18f89e123e4b8"
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
    "revision": "4f2008c79e266a2d5f079d2833ff8fc0"
  },
  {
    "url": "images/qr_cancel.svg",
    "revision": "ba115945b0e707b93b249868bb7ab218"
  },
  {
    "url": "images/qr.svg",
    "revision": "be30e8aa9a5803479d5f3eb9fad8bb5e"
  },
  {
    "url": "images/search.svg",
    "revision": "e01460b82ba28da675fcbc9b9df8df0a"
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
    "revision": "71a7c968fa6ed202e4281b42e765634e"
  },
  {
    "url": "redeemGen.html",
    "revision": "0da12156bd1077295bcc6e03a85d0274"
  },
  {
    "url": "scripts/app.js",
    "revision": "df9a74337f5f1d42e095fc1f885e1f8f"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "18019dd6a5cfa0f787f05dcab9ffb464"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "38d90d19572fa08e7afbcbff73040c9c"
  },
  {
    "url": "scripts/classes/activityItem.js",
    "revision": "3a6fecc3a61c792ea14583299818dec4"
  },
  {
    "url": "scripts/classes/baseConverter.js",
    "revision": "c398454505454bd311be2a5c5e774abc"
  },
  {
    "url": "scripts/classes/block.js",
    "revision": "52f6dd807ed18854882834c6de92d108"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "70285dd5036f1bf8354e49730b718257"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "49a4f2770f1e8a957548dde794c9fff9"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "75b6dcb977699d8a93598c744bc8902a"
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
    "revision": "8b2972c50350ac74c2a6809c788472a1"
  },
  {
    "url": "scripts/classes/langTerm.js",
    "revision": "9fb677067f457f4de43bfffd405ccfb1"
  },
  {
    "url": "scripts/classes/login.js",
    "revision": "4079b534e36e5cb14c31850345c965d3"
  },
  {
    "url": "scripts/classes/menu.js",
    "revision": "0bc7d620cfa2586a45ec00aa6e55f286"
  },
  {
    "url": "scripts/classes/myDetails.js",
    "revision": "b018380495269bd63b798e71cbaffc2c"
  },
  {
    "url": "scripts/classes/pwaEpoch.js",
    "revision": "68fd2aebf440f45130346ee829f3ee5b"
  },
  {
    "url": "scripts/classes/qrcode.js",
    "revision": "010fe455f3cef968ee50c6f5de456e8a"
  },
  {
    "url": "scripts/classes/settingsApp.js",
    "revision": "44801e825f5a83301815e9ef9370aef7"
  },
  {
    "url": "scripts/classes/statistics.js",
    "revision": "7ba0f5c12beaa349cf49b9adc80b0c7e"
  },
  {
    "url": "scripts/classes/validation.js",
    "revision": "44c4b2e10ed0517a0e04038d2d673b90"
  },
  {
    "url": "scripts/classes/webqr.js",
    "revision": "605d4d9a844d38de92cfc9d1c91d6214"
  },
  {
    "url": "scripts/constants/constants.js",
    "revision": "17b504bcc9354b066d436550da88ac84"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "851262f4f8838be757cad68d9e7c0119"
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
    "revision": "3b6f66ea24f4b87ed8d6eb8a877394a3"
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
    "revision": "a538b68fdd73124ee2518cf0a6038fd0"
  },
  {
    "url": "scripts/libraries/llqrcode.js",
    "revision": "82f070af5b5225612aa9f75113d034b9"
  },
  {
    "url": "scripts/libraries/localforage.min.js",
    "revision": "6de1bf1f7f98328eba5295e0e8a00110"
  },
  {
    "url": "scripts/libraries/maska.js",
    "revision": "3e07bf8c4ba807e91e5f26b0ff42251f"
  },
  {
    "url": "scripts/libraries/mdDateTimePicker.min.js",
    "revision": "c838c136288e666681ece802d0069b5b"
  },
  {
    "url": "scripts/libraries/moment.min.js",
    "revision": "03c1d3ad0acf482f87368e3ea7af14c2"
  },
  {
    "url": "scripts/services/cacheManager.js",
    "revision": "daf730f5f2ca8836921cf140ae5c8b3a"
  },
  {
    "url": "scripts/services/connManager.js",
    "revision": "ebcf79c5772eec370f1674349c4b3a3c"
  },
  {
    "url": "scripts/services/connManagerNew.js",
    "revision": "64645f17a914ef10d5ccd8aa185af214"
  },
  {
    "url": "scripts/services/dataManager.js",
    "revision": "5005ace4a45606309a0067ca83784f88"
  },
  {
    "url": "scripts/services/dataManager2.js",
    "revision": "e737d52a8d032e775a0f7f06deb1cce3"
  },
  {
    "url": "scripts/services/dataVerMove.js",
    "revision": "571b801589c9eda4592579cc6d78162e"
  },
  {
    "url": "scripts/services/formMsgManager.js",
    "revision": "93be20810e63ddd94a218d782ea6764a"
  },
  {
    "url": "scripts/services/indexdbDataManager.js",
    "revision": "fe8180abac2c551a8740ef071be0d4d2"
  },
  {
    "url": "scripts/services/indexdbStorage.js",
    "revision": "ed103b90317cd587bf5114f8614089d8"
  },
  {
    "url": "scripts/services/localStorageDataManager.js",
    "revision": "9a39003d087b2c4dc72577733f64a8fd"
  },
  {
    "url": "scripts/services/moveLocalStorageData.js",
    "revision": "540735a9d8eaef724ee6a72d3d575c29"
  },
  {
    "url": "scripts/services/moveLocalStorageDataNew.js",
    "revision": "31c39ab0801674fe80b32a2a8e47f19e"
  },
  {
    "url": "scripts/services/moveLocalStorageDataOld.js",
    "revision": "eb1dc2e14bbc1f0efd60c2cbb504e12d"
  },
  {
    "url": "scripts/services/msgManager.js",
    "revision": "57976e2ea5232ae9d847f81ab45bcd6e"
  },
  {
    "url": "scripts/services/scheduleManager.js",
    "revision": "8110730dee87f1b923b89f52c26d5b8d"
  },
  {
    "url": "scripts/services/statusInfoManager.js",
    "revision": "b8b55cf21303577663c6d0f838500b1d"
  },
  {
    "url": "scripts/services/storageMng.js",
    "revision": "2d88b1f6722dc6c4bb27f2478d910a60"
  },
  {
    "url": "scripts/services/syncManager.js",
    "revision": "de83edb27f3d00cddc7f59038992d355"
  },
  {
    "url": "scripts/services/syncManagerNew.js",
    "revision": "16db0722b9554fc9d56ec56668df8207"
  },
  {
    "url": "scripts/services/wsApiManager.js",
    "revision": "51da16c9539c77d7232836b9573b581f"
  },
  {
    "url": "scripts/utils/activityUtil.js",
    "revision": "864292dfe7a6da060d89cfbbc5d1b355"
  },
  {
    "url": "scripts/utils/configUtil.js",
    "revision": "ccaf7442cd50264de8ee450282c4d981"
  },
  {
    "url": "scripts/utils/dbStorageSelector.js",
    "revision": "21b92914285dfd69c661bd2fb9b6260a"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "4acecfb6f0eee0f6862fd4955fb48192"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "ddf16d0e7cf560408d714484200673c9"
  },
  {
    "url": "scripts/utils/localStatistics.js",
    "revision": "aeab961dc867162dc8c190c60f32059a"
  },
  {
    "url": "scripts/utils/pptManager.js",
    "revision": "5b417affac3a5949a893b54f0a3f4f02"
  },
  {
    "url": "scripts/utils/pptOptions.js",
    "revision": "281733303a8f33912d7d5252052cfe88"
  },
  {
    "url": "scripts/utils/restUtil.js",
    "revision": "11536caaf427311144983d462459361c"
  },
  {
    "url": "scripts/utils/sounds.js",
    "revision": "110d54633ee16ad089f53d7d16478828"
  },
  {
    "url": "scripts/utils/util.js",
    "revision": "4525405058aea4813d6ea06df4141e14"
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
    "revision": "830688f12d078a838c08fefc77a0c71d"
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
    "revision": "913fc4c1dee52c8f5e291d7ddff1f42b"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/.js|.html|.css|.svg|.jpg|.png|.gif|.mp3|.wav/, new workbox.strategies.CacheFirst({ "cacheName":"appShell", plugins: [] }), 'GET');
workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com.*/, new workbox.strategies.StaleWhileRevalidate({ "cacheName":"googleFonts", plugins: [] }), 'GET');
