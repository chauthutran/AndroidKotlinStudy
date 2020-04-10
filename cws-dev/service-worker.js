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
    "url": "css/json-viewer.css",
    "revision": "c484971a18e673452c82cc4ecfe1d5ec"
  },
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
    "revision": "774f97dfe84ad9786535ff316f8aa100"
  },
  {
    "url": "css/style.css",
    "revision": "a4bf1cfde1cfce69fbbdb9eba06c909c"
  },
  {
    "url": "css/styleNew.css",
    "revision": "e5b8a7fa3be7d6f10035898b0b1c1748"
  },
  {
    "url": "images/about.svg",
    "revision": "c9ecbd55c7ef63e5a50df53f1e5e802d"
  },
  {
    "url": "images/act_col_fpl-fu_arrow_right_24.svg",
    "revision": "d61e5ac96aea37ecbd9e17af41331646"
  },
  {
    "url": "images/act_col_fpl-fu_arrow_right_36.svg",
    "revision": "3548996447d506757a911c674a23ea13"
  },
  {
    "url": "images/act_col_fpl-sp_arrow_right_24.svg",
    "revision": "6726e1e050cacf293fd93974ed84e7dd"
  },
  {
    "url": "images/act_col_fpl-sp_arrow_right_36.svg",
    "revision": "f450400c101b20fab8b4f442105da1d0"
  },
  {
    "url": "images/act_col_sas_arrow_right_24.svg",
    "revision": "07ca0d29a883b607be0eace1a1528248"
  },
  {
    "url": "images/act_col_sas_arrow_right_36.svg",
    "revision": "7e68ec661b73b8651b49f8a679d287fe"
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
    "revision": "a59f1cd43cdb7fe359000002283a50a7"
  },
  {
    "url": "images/active.svg",
    "revision": "f7bed36b34a604e93941d71404522168"
  },
  {
    "url": "images/alert_col.svg",
    "revision": "ed00a205c0ee21cff01ef3da6f3b75bf"
  },
  {
    "url": "images/alert.svg",
    "revision": "5f2f94439570a21a82cf1007d5359b8a"
  },
  {
    "url": "images/arrow_down.svg",
    "revision": "1d6cebe7e67a1c69ca8f1941174c6b77"
  },
  {
    "url": "images/arrow_left.svg",
    "revision": "a4e529007c64fa98680116d155071f71"
  },
  {
    "url": "images/arrow_right.svg",
    "revision": "d100592ff7348419d6531e320a3fb917"
  },
  {
    "url": "images/arrow_up.svg",
    "revision": "aa66e325f7c4d48a42cc37f265646e40"
  },
  {
    "url": "images/arrow-circle-down.svg",
    "revision": "7111e8959447129a5ba67daf1d91a44f"
  },
  {
    "url": "images/arrows_col.svg",
    "revision": "3e3f227aa06dbfea700cb4ba587bf182"
  },
  {
    "url": "images/baseline-cloud_off-24px-unavailable.svg",
    "revision": "38d47e1cacd389927849f03eddb4f4c8"
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
    "revision": "b44e4e98e1665413e1d6299c832db99f"
  },
  {
    "url": "images/close_white.svg",
    "revision": "f2f35369d814bbeca6c7895dbafa9a42"
  },
  {
    "url": "images/completed.svg",
    "revision": "b9efc7199268773a8c02348f1f62c502"
  },
  {
    "url": "images/Connect.svg",
    "revision": "3a0a2e0bd172fc55453712641f5360a9"
  },
  {
    "url": "images/cws_statusDownloaded.svg",
    "revision": "4d2fdcaf1909239de39743cb4853a879"
  },
  {
    "url": "images/entry.svg",
    "revision": "a19649ec23fe1803d4dd9408740cb5c6"
  },
  {
    "url": "images/failed.svg",
    "revision": "b2049e1e2f5652f830b863e1ea8a9f18"
  },
  {
    "url": "images/favbar_color_act.svg",
    "revision": "eb3e662b4f7f4ddcbc9bca7cc6880e00"
  },
  {
    "url": "images/favbar_color_arrows.svg",
    "revision": "28517371f20710f97ae7b9d1e4ee5fd1"
  },
  {
    "url": "images/favbar_color_contact.svg",
    "revision": "6b01236ce1540091308f7e5a285d0528"
  },
  {
    "url": "images/favbar_color_fpl-fu.svg",
    "revision": "1d7957648caffb1b7cc89e628c676bc7"
  },
  {
    "url": "images/favbar_color_fpl-sp.svg",
    "revision": "8a6b62abbdf75437f5e8da00cf9a0d1a"
  },
  {
    "url": "images/favbar_color_sas.svg",
    "revision": "a4a62efa0479685af22529f2bc5426ce"
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
    "revision": "321e0ceabe0eb1dc3601a4830a36faa6"
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
    "revision": "20f1389ffe6ee7e237c300129b2dc370"
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
    "revision": "de3a2c52c81ddd7829b1d107e5ed5ee2"
  },
  {
    "url": "images/logo.svg",
    "revision": "44b0c57dc046930b5f78026ad2eeb937"
  },
  {
    "url": "images/logout.svg",
    "revision": "d9d3a6f585f07fe0ac5a080f456f597d"
  },
  {
    "url": "images/menu_icon.svg",
    "revision": "528dd5f2e025f2208386bead7bbc1e59"
  },
  {
    "url": "images/mobile.svg",
    "revision": "0fb7b04a2651bfb60e59ae3289d4e2f6"
  },
  {
    "url": "images/my_details.svg",
    "revision": "dba1cfb6a07e7d21af17eb0dcbf6683c"
  },
  {
    "url": "images/na.svg",
    "revision": "68d74ca8818126b55bfb9cfbf27abdf1"
  },
  {
    "url": "images/open.svg",
    "revision": "f7cf6943aeb6e19ae972aabcebcb022d"
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
    "revision": "eb1f5bcf5ce3173536853cd3774b447e"
  },
  {
    "url": "images/plus_on.svg",
    "revision": "1122c272c9085cf3f611902a4c879b28"
  },
  {
    "url": "images/plus.svg",
    "revision": "7051f6c37f8d6b64308cf5a635ba1e56"
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
    "revision": "3ea7c2c9e9bf9e1aa4531655c8213a4e"
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
    "revision": "49fd0bf0201f931b915bd2eaed777ea1"
  },
  {
    "url": "images/sync_error.svg",
    "revision": "6345c6b90ad5dd60d639a18892c6f3d2"
  },
  {
    "url": "images/sync-banner.svg",
    "revision": "679bf57f11ff6a88d3a130486a65e2aa"
  },
  {
    "url": "images/sync-error.svg",
    "revision": "6345c6b90ad5dd60d639a18892c6f3d2"
  },
  {
    "url": "images/sync-n.svg",
    "revision": "bb5732a4e025d9baf31822b06d381366"
  },
  {
    "url": "images/sync.svg",
    "revision": "4e359cd567fad995e2433e434c8c2b23"
  },
  {
    "url": "images/unavail.svg",
    "revision": "2758cb61cc532065e0fdaa3eb50683bb"
  },
  {
    "url": "images/user.svg",
    "revision": "60862197c3b1a2989278571db358709a"
  },
  {
    "url": "images/voucher.svg",
    "revision": "3a6f173fc310230cc6b091bc5ba7cc8d"
  },
  {
    "url": "index.html",
    "revision": "46269c12746f4d35c0f1e57b3eb1d125"
  },
  {
    "url": "redeemGen.html",
    "revision": "294625bdc2e797994c50cc5e0b5d46da"
  },
  {
    "url": "scripts/app.js",
    "revision": "572a813fc8bd9e00d1eb918c21e71736"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "54ee8f709da937e18e4096f8a648104b"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "32bfca7c6a0b08d492e0e55c66c5f548"
  },
  {
    "url": "scripts/classes/activityCard.js",
    "revision": "bb7e1a289eb6de9e1d34c7dc5cef0e71"
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
    "revision": "ca45c7754a527ef6cab5553cedeb3e88"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "674f6758247328d819d42c300299f112"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "e9fd0a9d15314276f9bdfd2da31b7390"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "a1d89938b68493cf67db12b8c0f914bc"
  },
  {
    "url": "scripts/classes/blockListView.js",
    "revision": "d3851f085a7a73525502ff0b5337865d"
  },
  {
    "url": "scripts/classes/blockMsg.js",
    "revision": "ae440bac958d28ed25d99759bfac11ca"
  },
  {
    "url": "scripts/classes/dataList.js",
    "revision": "02c644dae822bfd0f6716e789e8913f8"
  },
  {
    "url": "scripts/classes/favIcon.js",
    "revision": "eb22dbc282da0eb27d7df09d04cdf34a"
  },
  {
    "url": "scripts/classes/inputControl.js",
    "revision": "b94f880ce89e677134aa156a428ae024"
  },
  {
    "url": "scripts/classes/langTerm.js",
    "revision": "b09740918ebc26d94c371859d77696cb"
  },
  {
    "url": "scripts/classes/login.js",
    "revision": "20bc36ecf2ae502b92a7cf7a35b05f59"
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
    "revision": "17fc42e867d81045745945e700129416"
  },
  {
    "url": "scripts/classes/statistics.js",
    "revision": "0bc144d01dda6b8f845310187b205689"
  },
  {
    "url": "scripts/classes/validation.js",
    "revision": "1c6a1b5b521e2d59e13fb19ca2547d27"
  },
  {
    "url": "scripts/classes/webqr.js",
    "revision": "d68c757ed34cd531bb2ebadf15c681c8"
  },
  {
    "url": "scripts/constants/constants.js",
    "revision": "07439d46d70c89330e9f66da248758e8"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "47d4a0736e31f0fcac0060cd59d91f97"
  },
  {
    "url": "scripts/libraries/aes.js",
    "revision": "11c5114e2a1face42de239b2b17943fb"
  },
  {
    "url": "scripts/libraries/jquery-3.4.0.min.js",
    "revision": "475f3bdf8d1211c09e8b8f1d83539d27"
  },
  {
    "url": "scripts/libraries/jquery-autocomplete.js",
    "revision": "4102c8bda3aa2c9dee5765ba82dbcc4c"
  },
  {
    "url": "scripts/libraries/jquery-dateformat.min.js",
    "revision": "c5b600620a496ec17424270557a2f676"
  },
  {
    "url": "scripts/libraries/jquery-ui.min.js",
    "revision": "7ea717799ef7fa610f53ea03784ff68e"
  },
  {
    "url": "scripts/libraries/jquery.blockUI.js",
    "revision": "1473907211f50cb96aa2f2402af49d69"
  },
  {
    "url": "scripts/libraries/jquery.maska.js",
    "revision": "1958941787a06764a6538ced0f2bb1be"
  },
  {
    "url": "scripts/libraries/json-viewer.js",
    "revision": "7ca03571ef1b2e5d8c2e3fc0622e0948"
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
    "url": "scripts/services/activityDataManager.js",
    "revision": "2f9cd67b33a4c46469de4393c5ad70c1"
  },
  {
    "url": "scripts/services/cacheManager.js",
    "revision": "12a125e92e4408bd95f6d456065824e1"
  },
  {
    "url": "scripts/services/clientDataManager.js",
    "revision": "9c4e5bf9866cd69b415ebbb2abd523aa"
  },
  {
    "url": "scripts/services/connManager.js",
    "revision": "815e318f0c31e3aa0c0c0b69bbd767bb"
  },
  {
    "url": "scripts/services/connManagerNew.js",
    "revision": "dc5e6d3260f319ba1a82591a1eedf2eb"
  },
  {
    "url": "scripts/services/dataFormatConvert.js",
    "revision": "f6d55c208c85c117cc167d1aba58a117"
  },
  {
    "url": "scripts/services/dataVerMove.js",
    "revision": "f47832bb5f433a41de24785012421824"
  },
  {
    "url": "scripts/services/devHelper.js",
    "revision": "8b33cd25c4598c1b025afb8f4eafd529"
  },
  {
    "url": "scripts/services/formMsgManager.js",
    "revision": "d12cdc7721b1ecbd8b430e8f4a4ea4df"
  },
  {
    "url": "scripts/services/msgManager.js",
    "revision": "52d37d4e375bd4921137eafadd68aa6e"
  },
  {
    "url": "scripts/services/old/dataManager.js",
    "revision": "dcbb1ca7747f5670b34f5f7ca40380a2"
  },
  {
    "url": "scripts/services/old/dbStorageIDB.js",
    "revision": "ea13b41c2219e99298e46abdcaed6386"
  },
  {
    "url": "scripts/services/old/indexdbDataManager.js",
    "revision": "c19604205417e82f942c93c79af120d6"
  },
  {
    "url": "scripts/services/old/localStorageDataManager.js",
    "revision": "d5f25ae4971422158a959336dee9e5a9"
  },
  {
    "url": "scripts/services/payloadTemplate.js",
    "revision": "d780aa518f94d47c502c41f756eaeb51"
  },
  {
    "url": "scripts/services/scheduleManager.js",
    "revision": "ddd6884c137e1021342d04ea55cb2387"
  },
  {
    "url": "scripts/services/sessionManager.js",
    "revision": "c0147151be55a17d1dbc634ad52b2400"
  },
  {
    "url": "scripts/services/statusInfoManager.js",
    "revision": "4447d5788cb0b71d1a9f0ec563b721bc"
  },
  {
    "url": "scripts/services/storage/dataManager2.js",
    "revision": "92810c3887f18602b1ca4a05920b32a3"
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
    "revision": "af43022cfa83f2558d1bf6641a68c190"
  },
  {
    "url": "scripts/services/syncManagerNew.js",
    "revision": "8ccd9fe0b461a412f3f733d705ddda86"
  },
  {
    "url": "scripts/services/viewsListManagerOLD.js",
    "revision": "a78fbdb536262867ef85854a62f8ce16"
  },
  {
    "url": "scripts/services/wsApiManager.js",
    "revision": "60fc5fbee579d4903c8276939573c29e"
  },
  {
    "url": "scripts/services/wsCallManager.js",
    "revision": "c70a32ceb9848c64fa51ee4a30c8f44b"
  },
  {
    "url": "scripts/utils/activityUtil.js",
    "revision": "69e3591606ce484398d365b3a492f2f3"
  },
  {
    "url": "scripts/utils/configUtil.js",
    "revision": "000af3c3e89ce1397bc8e396c54c3c2c"
  },
  {
    "url": "scripts/utils/dbStorageSelector.js",
    "revision": "e5c21632873d151139cddc4f1bb0efab"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "bcb78c9b91561ca9bb08a8c0818bc30a"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "591e6d08fe07d5995133630a11449800"
  },
  {
    "url": "scripts/utils/localStatistics.js",
    "revision": "6b9b731d1f1fe193316ae35a2335f3e6"
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
    "url": "scripts/utils/prototypes.js",
    "revision": "3a2608b42444dcdf8e7c4f3b22adca02"
  },
  {
    "url": "scripts/utils/restUtil.js",
    "revision": "e114f26b84450efc234d5748129cd0cf"
  },
  {
    "url": "scripts/utils/sounds.js",
    "revision": "d45a393f5c03d8c2185f0e8cab91c586"
  },
  {
    "url": "scripts/utils/util.js",
    "revision": "194287bf1e886d8e3ed05a4dd9b51484"
  },
  {
    "url": "scripts/utils/util2.js",
    "revision": "8e70e2500236ac399768e2c8cadbf1ca"
  },
  {
    "url": "scripts/utils/utilBack.js",
    "revision": "b8e2910be1f0b83fc7364071706b81dc"
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
    "revision": "85291df7b046cd32eb4fb33ddc85bb99"
  },
  {
    "url": "styles/jquery-ui.min.css",
    "revision": "215077014154308be415e1181a14646f"
  },
  {
    "url": "styles/materialize.css",
    "revision": "ebfc8887da89775b09fe167ce204b440"
  },
  {
    "url": "styles/style.css",
    "revision": "4fa66a82c51200fb6567a9d112e07040"
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
    "revision": "bfc447143d4fdf877a6ae09360939694"
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
