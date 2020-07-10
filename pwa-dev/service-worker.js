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
    "revision": "04591809cfe5fc2fe75fab5a45d64bf2"
  },
  {
    "url": "css/mdDateTimePicker.min.css",
    "revision": "9d97b482c800241a59fb49b61de0ac29"
  },
  {
    "url": "css/pwa.css",
    "revision": "b4e50a06265c55d7e2b8d33e50e58e44"
  },
  {
    "url": "css/qunit.css",
    "revision": "c866880a796e5702c903767a7b5f0540"
  },
  {
    "url": "css/style_james.css",
    "revision": "a2d926f62ecfd01a720da9b6bd0950e8"
  },
  {
    "url": "css/style.css",
    "revision": "5e62abe227acaf2406c4f6fc555f3f40"
  },
  {
    "url": "css/style2.css",
    "revision": "769e8675c6f3ec22cf88bec27374f4bc"
  },
  {
    "url": "images/about.png",
    "revision": "2d548c037c19ca09ec10fa450d2b1acd"
  },
  {
    "url": "images/about.svg",
    "revision": "15b2f8e409f6a038f54ab20b993bd249"
  },
  {
    "url": "images/about@2x.png",
    "revision": "7ee5bd56d7c0fdf8d247b0388d48f209"
  },
  {
    "url": "images/act_arrows.svg",
    "revision": "3e3f227aa06dbfea700cb4ba587bf182"
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
    "revision": "cd9442045f364002623a0d24be42c137"
  },
  {
    "url": "images/act_fpl-fu.svg",
    "revision": "823b455dc5dcf74369bc8e6c97f148b8"
  },
  {
    "url": "images/act_fpl-sp.svg",
    "revision": "9bb235be88fbedf47d9bcac017a8e7ba"
  },
  {
    "url": "images/act_sas.svg",
    "revision": "ef69dfc74178bc131a507964299bc6fe"
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
    "url": "images/arrow_back.png",
    "revision": "d0dea5681edff0e8e0ba201a4a9a5b0a"
  },
  {
    "url": "images/arrow_back.svg",
    "revision": "a3f1b152c27e31b3cab188ec16e1ae01"
  },
  {
    "url": "images/arrow_back@2x.png",
    "revision": "7eb4db2afea88b0ef722ce7f9ba2a71c"
  },
  {
    "url": "images/arrow_down.svg",
    "revision": "d7742c7c0c773ad2f3d7c86393cc1326"
  },
  {
    "url": "images/arrow_drop_down.png",
    "revision": "f972228032f5e1b04fa060f2cc141c7e"
  },
  {
    "url": "images/arrow_drop_down.svg",
    "revision": "ad94da8bf196518842838d0ff10175e6"
  },
  {
    "url": "images/arrow_drop_down@2x.png",
    "revision": "04877ebf9b684457fde4c540472c36e0"
  },
  {
    "url": "images/arrow_drop_up.png",
    "revision": "967ccf374a90d4c5fe1fc67ae9fd76f8"
  },
  {
    "url": "images/arrow_drop_up.svg",
    "revision": "001b802c509f8f1160500857a2cd3722"
  },
  {
    "url": "images/arrow_drop_up@2x.png",
    "revision": "60eb08d9485c2d89a93260319f858a75"
  },
  {
    "url": "images/arrow_forward.png",
    "revision": "1b0e25b2de5f1924a59223a4d2d10ba7"
  },
  {
    "url": "images/arrow_forward.svg",
    "revision": "07ab342e86d8010d713af7cbbe0d3e91"
  },
  {
    "url": "images/arrow_forward@2x.png",
    "revision": "bfd3ee5a07dafa65d50882f4b6a5fbf0"
  },
  {
    "url": "images/arrow_left.png",
    "revision": "8d320710fbc815eb57afc3d6bf653db2"
  },
  {
    "url": "images/arrow_left.svg",
    "revision": "72150f1d6fa63be5883449edd911b5a7"
  },
  {
    "url": "images/arrow_left@2x.png",
    "revision": "3bd4dedd94a61a9eabb2770b0d0a5ea8"
  },
  {
    "url": "images/arrow_right.png",
    "revision": "47a1156a1bf2467e26e0e99de718c91b"
  },
  {
    "url": "images/arrow_right.svg",
    "revision": "41d5fc3e7c750534e0f544bc15e4cd6a"
  },
  {
    "url": "images/arrow_right@2x.png",
    "revision": "76afd7056e4730b280b692bc73c47854"
  },
  {
    "url": "images/arrow_up.svg",
    "revision": "f38c782966ac7a98fcf808e6b691f435"
  },
  {
    "url": "images/arrow-circle-down.svg",
    "revision": "bf4b2e19f8dd4c2579be099fcd17c3a8"
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
    "url": "images/by_client_details.png",
    "revision": "d11a52957a82cf2b21ecead9d86fba06"
  },
  {
    "url": "images/by_client_details.svg",
    "revision": "5a57bcd45b05bcab38ff082f5d14e266"
  },
  {
    "url": "images/by_client_details@2x.png",
    "revision": "b4ea3a28f8228f50ef62afd5662c2a79"
  },
  {
    "url": "images/by_phone_number.png",
    "revision": "4b1c5c3d2a36a411a5468c3ce62293a5"
  },
  {
    "url": "images/by_phone_number.svg",
    "revision": "7a0524420a1288fdfac5618e275138a7"
  },
  {
    "url": "images/by_phone_number@2x.png",
    "revision": "115453514e58cc83e272aed7d08d9cfd"
  },
  {
    "url": "images/by_voucher.png",
    "revision": "e09bb28dff5030057d395629a4693c1f"
  },
  {
    "url": "images/by_voucher.svg",
    "revision": "881b0061d9354f0c4da4206d0ad7f6bb"
  },
  {
    "url": "images/by_voucher@2x.png",
    "revision": "5df06b58afffa28e4204c438134a6112"
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
    "revision": "0762ff262ec2f59d7f1c2cbbb1de0842"
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
    "url": "images/close.png",
    "revision": "e056450373c325ece76edef7226d36d7"
  },
  {
    "url": "images/close.svg",
    "revision": "15e3add3f12b3c8960df77b1fd0f79c3"
  },
  {
    "url": "images/close@2x.png",
    "revision": "f089717e72acffcea51454f8e627f127"
  },
  {
    "url": "images/cloud_offline_Intenet-up1.png",
    "revision": "6f472a45c1be7904252505e1ba1cdc1c"
  },
  {
    "url": "images/cloud_offline_Intenet-up1.svg",
    "revision": "91876849955ff4eba87c6d5c5d94bb0c"
  },
  {
    "url": "images/cloud_offline_Intenet-up1@2x.png",
    "revision": "c50c4d900790ef63c657ba9a100a65c6"
  },
  {
    "url": "images/cloud_offline_Intenet-up2.png",
    "revision": "3f36812cfa029639134907d14f245131"
  },
  {
    "url": "images/cloud_offline_Intenet-up2.svg",
    "revision": "894d01fc8ffa294c34e12a2041086e65"
  },
  {
    "url": "images/cloud_offline_Intenet-up2@2x.png",
    "revision": "6976351c25564c971ee1421e5099956f"
  },
  {
    "url": "images/cloud_offline_nav.svg",
    "revision": "7dfbf28a7506f423c74560dece98fa11"
  },
  {
    "url": "images/cloud_offline.png",
    "revision": "5b7bdf0aaef4bc354768616bb39a227b"
  },
  {
    "url": "images/cloud_offline.svg",
    "revision": "f785c85a67a871e9ff5d3aef1c0767f4"
  },
  {
    "url": "images/cloud_offline@2x.png",
    "revision": "f7368f5e116d11ac29bee8005c3ec6f3"
  },
  {
    "url": "images/cloud_online_nav.svg",
    "revision": "6262b347fbc95db05dc124f8c1acb55c"
  },
  {
    "url": "images/cloud_online.png",
    "revision": "982590a0962e4ef64674e39725f0d932"
  },
  {
    "url": "images/cloud_online.svg",
    "revision": "fd082b2fbe1b3c6acd5115e97e7e57b7"
  },
  {
    "url": "images/cloud_online@2x.png",
    "revision": "bcdaef7b8a5e3b7ce46de0ea3661c0c6"
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
    "url": "images/cws_statusDownloaded.svg",
    "revision": "6a851273ca46ba46df24131bb41db340"
  },
  {
    "url": "images/details_24.svg",
    "revision": "2bf10e6b5e2c084926877411f595c016"
  },
  {
    "url": "images/eLearning_s.png",
    "revision": "b7bcbc82151cbd752986ec394c598c13"
  },
  {
    "url": "images/eLearning_s.svg",
    "revision": "1aa176d9e4b774d13fa56992b7720b06"
  },
  {
    "url": "images/eLearning_s@2x.png",
    "revision": "d4ab9c11defe5008bf50c1e5eaf7a176"
  },
  {
    "url": "images/eLearning_u.png",
    "revision": "ecfe1d992f6895f4012e6a62efda9fc1"
  },
  {
    "url": "images/eLearning_u.svg",
    "revision": "0beddf919340cf7cb072d63c4a391396"
  },
  {
    "url": "images/eLearning_u@2x.png",
    "revision": "15a8e1bf1891aa5a4c2e9d1028bfe3ea"
  },
  {
    "url": "images/entry.svg",
    "revision": "82f5db78e62a0278b8e4904af9535842"
  },
  {
    "url": "images/fab_follow_up_40.svg",
    "revision": "2da9fe072df1e498f2f94e40dd165009"
  },
  {
    "url": "images/fab_plus_40.png",
    "revision": "98d53735be9efd2ddbb17dd530c3771d"
  },
  {
    "url": "images/fab_plus_40.svg",
    "revision": "1084817a48b772a90de03e934eb94cf1"
  },
  {
    "url": "images/fab_plus_40@2x.png",
    "revision": "567eab2fa22ea23b960c065fa27574cb"
  },
  {
    "url": "images/fab_plus_56.png",
    "revision": "fa60ad6778351a8a0d9be6c8469c74a0"
  },
  {
    "url": "images/fab_plus_56.svg",
    "revision": "01b64c72c0d7d8231f4fca09e229abbe"
  },
  {
    "url": "images/fab_plus_56@2x.png",
    "revision": "b4650ff26d749886eae10812faad24cb"
  },
  {
    "url": "images/fab_provision_40.svg",
    "revision": "c8ba833ff2437e0eaf21f813b6e2da37"
  },
  {
    "url": "images/fab_safe_abortion_40.svg",
    "revision": "4f66dec598d268a50dce4e8fa9e911a7"
  },
  {
    "url": "images/failed.svg",
    "revision": "a3c5dc242aa6fbf178505ea377ba1550"
  },
  {
    "url": "images/favbar_color_act.svg",
    "revision": "e3f4d8026948bb0a0f1a143998fa131f"
  },
  {
    "url": "images/favbar_color_arrows.svg",
    "revision": "502021d78d35893f23420aab929265da"
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
    "url": "images/follow-up.png",
    "revision": "3d53591f47f22f5043dbd2ecd4eebe1e"
  },
  {
    "url": "images/follow-up.svg",
    "revision": "6f144c2e61015735f6eab5f0100f0ff1"
  },
  {
    "url": "images/follow-up@2x.png",
    "revision": "65bab29cbd621129a1377f64ddb92237"
  },
  {
    "url": "images/followup.svg",
    "revision": "0ababc3260aa87307cc547a9cd3a3a30"
  },
  {
    "url": "images/gabrielle_48.png",
    "revision": "c65b2ec85a58699ff17da08cebaa8dca"
  },
  {
    "url": "images/gabrielle_48.svg",
    "revision": "84b0157fdd9d8dfafd1f9e1614a8e38f"
  },
  {
    "url": "images/gabrielle_48@2x.png",
    "revision": "0fb0138ee78f71e067e76dd0d235d6f2"
  },
  {
    "url": "images/gabrielle.png",
    "revision": "5fab36daa07243ac1481f4aae3ce0693"
  },
  {
    "url": "images/Gabrielle.svg",
    "revision": "9291ceda39d825a7d63b2246eaa1bffe"
  },
  {
    "url": "images/gabrielle@2x.png",
    "revision": "c65b2ec85a58699ff17da08cebaa8dca"
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
    "url": "images/icon_text_scaling.svg",
    "revision": "91fa6da8ccef7465ab6931f2f4c3e317"
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
    "url": "images/left-icons.png",
    "revision": "86920d3437260d4915017e9efbe4b864"
  },
  {
    "url": "images/list.svg",
    "revision": "a6bac0e4f5a9dbe41cdfd1f87f35d4f0"
  },
  {
    "url": "images/loading_small.svg",
    "revision": "94264284ad3ec1e09229e4232754ad7d"
  },
  {
    "url": "images/lock.svg",
    "revision": "087e69ed52f2e66397b49a98e2fcb5b3"
  },
  {
    "url": "images/logo_bk.png",
    "revision": "eb94d52612e750aafb626429b79d60af"
  },
  {
    "url": "images/logo_bk.svg",
    "revision": "df64880669444413d6ffedb1a11db51c"
  },
  {
    "url": "images/logo_bk@2x.png",
    "revision": "d7b611dfb6bcd7e43f67fdc2d2e77f2e"
  },
  {
    "url": "images/logo_cws.png",
    "revision": "b604d270118f12a57433efa365730221"
  },
  {
    "url": "images/logo_cws.svg",
    "revision": "8bfb36692e29e7f619c9f2df88d562cf"
  },
  {
    "url": "images/logo_cws@2x.png",
    "revision": "1522abe1d4c34bfbb16e8dd3b1cacd86"
  },
  {
    "url": "images/logo.svg",
    "revision": "90f03efeae002c8d5d4f6587d347c1ea"
  },
  {
    "url": "images/logout.png",
    "revision": "bce2624cbff60226a0d31c0b43342ba4"
  },
  {
    "url": "images/logout.svg",
    "revision": "12730ff371ee3a829e4b27d0f42d9f6a"
  },
  {
    "url": "images/logout@2x.png",
    "revision": "44673ae17cb378f5fdbf51600761a386"
  },
  {
    "url": "images/may_details-1.png",
    "revision": "63a0c088e0e255e7733114c9277eead8"
  },
  {
    "url": "images/may_details.png",
    "revision": "381ee0f6df0e506465d77c325730573a"
  },
  {
    "url": "images/may_details.svg",
    "revision": "e28e6a90d513b217409cb4c228c7687a"
  },
  {
    "url": "images/may_details@2x.png",
    "revision": "88151e43c03950cd4d0a3ce7aa678bee"
  },
  {
    "url": "images/menu_icon.svg",
    "revision": "f6814da3ba149036eb3cf39a3cffefe2"
  },
  {
    "url": "images/menu-24px.svg",
    "revision": "1280c1fb71c1786af1f16ed6419c6ed3"
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
    "url": "images/na.svg",
    "revision": "ff4ebf11af43bf07dc301e3493e32e2a"
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
    "url": "images/payload_24.png",
    "revision": "84c345519cb601588b28d0d89714ee92"
  },
  {
    "url": "images/payload_24.svg",
    "revision": "4c1c058825990fee2fca681bbf96e02f"
  },
  {
    "url": "images/payload_24@2x.png",
    "revision": "52b85e277807076de5f8dd1c5b7bf49c"
  },
  {
    "url": "images/pending.svg",
    "revision": "cc1af7cf4f3f62ddfe6de4c4957b95f5"
  },
  {
    "url": "images/phone.png",
    "revision": "4317025d830d6eee433067df2fc7c998"
  },
  {
    "url": "images/phone.svg",
    "revision": "ae70d6e590c68dfea04b01939ed172e0"
  },
  {
    "url": "images/phone@2x.png",
    "revision": "bb67bf8b098200c884ee870c1548fb48"
  },
  {
    "url": "images/placeholder_b.png",
    "revision": "e2dad8b5e467a260d78aac76a29768aa"
  },
  {
    "url": "images/placeholder_b.svg",
    "revision": "08523c4674801786be91ea49e8b8ea59"
  },
  {
    "url": "images/placeholder_b@2x.png",
    "revision": "914c8f5ba68eb7d1a6cf21024b4f744d"
  },
  {
    "url": "images/placeholder_w.png",
    "revision": "fd0c2db91b1eb79a36de587b1211957a"
  },
  {
    "url": "images/placeholder_w.svg",
    "revision": "5c21872d665921ca1186f45052c6853b"
  },
  {
    "url": "images/placeholder_w@2x.png",
    "revision": "c4026a1a5db2ddb5b60af65eee114e36"
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
    "url": "images/profile_s.png",
    "revision": "d9dccc06c3f3fd9ec13fbe49339d24a2"
  },
  {
    "url": "images/profile_s.svg",
    "revision": "d68dccd2166268e674adf9ac698eefab"
  },
  {
    "url": "images/profile_s@2x.png",
    "revision": "1c6ce135239b9ae101825abcdfd412e2"
  },
  {
    "url": "images/profile_u.png",
    "revision": "4c0743d0814a699f319d2d02da148c05"
  },
  {
    "url": "images/profile_u.svg",
    "revision": "e40ce86b0b5ffc09c35560e27f4aeb6a"
  },
  {
    "url": "images/profile_u@2x.png",
    "revision": "63cb5502c9e75f001daa86379b63a952"
  },
  {
    "url": "images/provision_40.png",
    "revision": "c2f4f74f1852b1c6d949ab223d601af3"
  },
  {
    "url": "images/provision_40.svg",
    "revision": "57d149670550f9baa6893ffe688b2ad2"
  },
  {
    "url": "images/provision_40@2x.png",
    "revision": "ad9ea5021cfd72dc149f6fdf010cdd9e"
  },
  {
    "url": "images/provision_48.png",
    "revision": "7c65da11aeaef02ab96fd8a189a06068"
  },
  {
    "url": "images/provision_48.svg",
    "revision": "9bb4d6142d4a663a52aec1a422c801ed"
  },
  {
    "url": "images/provision_48@2x.png",
    "revision": "3bd0b61d7296fe5101d065d7223834bb"
  },
  {
    "url": "images/provision.png",
    "revision": "ce4339ea1e7d6ceda04895f94f15ef1e"
  },
  {
    "url": "images/provision.svg",
    "revision": "7faac7eb3c6c1d498c54afafac1a9bc4"
  },
  {
    "url": "images/provision@2x.png",
    "revision": "f7d904632afccfe0f40ff1bb727ad646"
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
    "url": "images/remove.png",
    "revision": "082e5b23e24ff0d122c131267dd018ad"
  },
  {
    "url": "images/remove.svg",
    "revision": "7c26d6fef7f63eaedc54efcdda478d1f"
  },
  {
    "url": "images/remove@2x.png",
    "revision": "909f001e5e9dbb3d9d65d06ee190061e"
  },
  {
    "url": "images/safe-abortion-1.png",
    "revision": "6c3e42773dd1860f2f21dcad0fbb2878"
  },
  {
    "url": "images/safe-abortion.png",
    "revision": "be522b876bef706b3a5fafad98bccdd5"
  },
  {
    "url": "images/safe-abortion.svg",
    "revision": "32d15bac67f5200ff63c56b10dfb1327"
  },
  {
    "url": "images/safe-abortion@2x.png",
    "revision": "132f576d6152f1c4fbd9352f34cd4a5f"
  },
  {
    "url": "images/search.png",
    "revision": "b5ce94b02a6a7d2ec7fe74c8fe3f8114"
  },
  {
    "url": "images/search.svg",
    "revision": "45d58d44ae9b2009ef38bf1424358464"
  },
  {
    "url": "images/search@2x.png",
    "revision": "cb5d564e9c25e74a1e1080823fd79121"
  },
  {
    "url": "images/services_s.png",
    "revision": "26a9baea6a766b44c82f4f908a5edd09"
  },
  {
    "url": "images/services_s.svg",
    "revision": "f83d4eaa51a57977792000bd4319b75a"
  },
  {
    "url": "images/services_s@2x.png",
    "revision": "fd5a46d85aefd115d8bfb82828b1d70b"
  },
  {
    "url": "images/services_u.png",
    "revision": "00ec0ab24486aa845a3b932cef6ee17e"
  },
  {
    "url": "images/services_u.svg",
    "revision": "e8eebbd55c2b261b9147d478d05c8f36"
  },
  {
    "url": "images/services_u@2x.png",
    "revision": "6a58c91cde2d9abfc6f7f607eeaf18d0"
  },
  {
    "url": "images/settings.png",
    "revision": "10a8cdff09fa64cb686747835ce24d47"
  },
  {
    "url": "images/settings.svg",
    "revision": "3f7d46f5a78f013667b3a18e04ce0c36"
  },
  {
    "url": "images/settings@2x.png",
    "revision": "fd7862a2b490def8fdc9a8631ad67248"
  },
  {
    "url": "images/sharp-add_circle_outline-24px.svg",
    "revision": "1077ca24d36bc60af3f7fd25a8c9e686"
  },
  {
    "url": "images/sharp-cloud_queue-24px.svg",
    "revision": "5171fbab5ea2638fc44dc1bbc58da397"
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
    "url": "images/sort24.svg",
    "revision": "5b0ddf6e3648272c2c10a63802b9dbbb"
  },
  {
    "url": "images/start_again.png",
    "revision": "ce519557723c405a8dee9bd4cbcf70c8"
  },
  {
    "url": "images/start_again.svg",
    "revision": "80ac033be4b0acb8b83046ec4de84707"
  },
  {
    "url": "images/start_again@2x.png",
    "revision": "c14fd29bdb61f6594a81f75c715181b6"
  },
  {
    "url": "images/statistics.png",
    "revision": "944e8c87e99fa10595a3b759b7fb3998"
  },
  {
    "url": "images/statistics.svg",
    "revision": "2e82e9622a8efc129fdfa1a3214cd1b1"
  },
  {
    "url": "images/statistics@2x.png",
    "revision": "965807f373e4a9634acb942336043997"
  },
  {
    "url": "images/stats_s.png",
    "revision": "a9b1d4a5fdbb2dcbef749975afbd2c9b"
  },
  {
    "url": "images/stats_s.svg",
    "revision": "4b100cafe0589343ba38e107cf885f8e"
  },
  {
    "url": "images/stats_s@2x.png",
    "revision": "e898882a466e7bd3c86ad9a4eaee4122"
  },
  {
    "url": "images/stats_u.png",
    "revision": "e06aff7048edbe72d0202c2b351877d2"
  },
  {
    "url": "images/stats_u.svg",
    "revision": "169536901f9334a9ece3761c7a80b622"
  },
  {
    "url": "images/stats_u@2x.png",
    "revision": "465620b0d12a7af4bb6c4d931a25c820"
  },
  {
    "url": "images/sync_24.png",
    "revision": "d9f03904c664f1905b95e19ba65bad0a"
  },
  {
    "url": "images/sync_24.svg",
    "revision": "d14a988bd2b5ec3cca8c0ff8e1156981"
  },
  {
    "url": "images/sync_24@2x.png",
    "revision": "153f217ea54c511766d2adfd2f680d4c"
  },
  {
    "url": "images/sync_36.png",
    "revision": "d9f03904c664f1905b95e19ba65bad0a"
  },
  {
    "url": "images/sync_36.svg",
    "revision": "d14a988bd2b5ec3cca8c0ff8e1156981"
  },
  {
    "url": "images/sync_36@2x.png",
    "revision": "153f217ea54c511766d2adfd2f680d4c"
  },
  {
    "url": "images/sync_error_msd.png",
    "revision": "014eda0d688250adeca528732327adcf"
  },
  {
    "url": "images/sync_error_msd.svg",
    "revision": "d2ad96fc0ad390c9d676984811df5c2e"
  },
  {
    "url": "images/sync_error_msd@2x.png",
    "revision": "4d9d947dbc42c8113dddd510fe8775d0"
  },
  {
    "url": "images/sync_error_msdr.png",
    "revision": "d3d3880ddcf01588e0610136114eb766"
  },
  {
    "url": "images/sync_error_msdr.svg",
    "revision": "28f23be14fd63876a0b6fc95138358c6"
  },
  {
    "url": "images/sync_error_msdr@2x.png",
    "revision": "0c2d1dc7e5989bc8fffedcf3d004167c"
  },
  {
    "url": "images/sync_error.svg",
    "revision": "6e779f7b1992ae8e7c48a02435aded39"
  },
  {
    "url": "images/sync_msd.png",
    "revision": "04c248c5e2d4fee101626e6f7778b098"
  },
  {
    "url": "images/sync_msd.svg",
    "revision": "bc2524d65bf9063fb62aaeef8845d035"
  },
  {
    "url": "images/sync_msd@2x.png",
    "revision": "4efc61762a35de73fd040ac7da85dbeb"
  },
  {
    "url": "images/sync_msdr.png",
    "revision": "fe1f7eafcbe1200fb2fb896fe6fb5c2c"
  },
  {
    "url": "images/sync_msdr.svg",
    "revision": "036b0acc94022da4f9096183605cd218"
  },
  {
    "url": "images/sync_msdr@2x.png",
    "revision": "421680e346054d2f372ad378e50a367c"
  },
  {
    "url": "images/sync_pending_msd-la.png",
    "revision": "a0420ecb136333c77d66eb16d2ceb0ed"
  },
  {
    "url": "images/sync_pending_msd-la.svg",
    "revision": "a6d1b2860269b03c8de3c3117e0fb318"
  },
  {
    "url": "images/sync_pending_msd-la@2x.png",
    "revision": "0b9cbd28260d06d6874402fe5d4b034e"
  },
  {
    "url": "images/sync_pending_msd-lar.png",
    "revision": "5183e27b42b69e6be7e0c193786c9381"
  },
  {
    "url": "images/sync_pending_msd-lar.svg",
    "revision": "ce6a9a202bab77e9f8c8b37b66ce8da7"
  },
  {
    "url": "images/sync_pending_msd-lar@2x.png",
    "revision": "13a0505c8797e0af672577956600c01d"
  },
  {
    "url": "images/sync_pending.png",
    "revision": "817e7c8b1f7591d928952696d4b28edc"
  },
  {
    "url": "images/sync_pending.svg",
    "revision": "d2548e6a7da1dc384b2c2cf7ed213b17"
  },
  {
    "url": "images/sync_pending@2x.png",
    "revision": "02c97e2df830467a74fa8a123be62f61"
  },
  {
    "url": "images/sync-banner.svg",
    "revision": "bb264dcfd6c85fa3c64dbc96a6716446"
  },
  {
    "url": "images/sync-button.svg",
    "revision": "7f0ac8883f47fff2c450baa12822edb2"
  },
  {
    "url": "images/sync-error_24.png",
    "revision": "701f775ab7616ec4f5feeb76133e0ca9"
  },
  {
    "url": "images/sync-error_24.svg",
    "revision": "79deec91e22f9353e9c056cf504a1a63"
  },
  {
    "url": "images/sync-error_24@2x.png",
    "revision": "c809f45920b0efa5023a1924e5705500"
  },
  {
    "url": "images/sync-error_36.png",
    "revision": "701f775ab7616ec4f5feeb76133e0ca9"
  },
  {
    "url": "images/sync-error_36.svg",
    "revision": "79deec91e22f9353e9c056cf504a1a63"
  },
  {
    "url": "images/sync-error_36@2x.png",
    "revision": "c809f45920b0efa5023a1924e5705500"
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
    "url": "images/sync-pending_24.png",
    "revision": "cd125e3c1797d95f5b125128d71ce4f9"
  },
  {
    "url": "images/sync-pending_24.svg",
    "revision": "deb2fb879ba44e53c204a6be490db65f"
  },
  {
    "url": "images/sync-pending_24@2x.png",
    "revision": "1a45d86bf2feecb261537c530e9099f3"
  },
  {
    "url": "images/sync-pending_36.png",
    "revision": "cd125e3c1797d95f5b125128d71ce4f9"
  },
  {
    "url": "images/sync-pending_36.svg",
    "revision": "deb2fb879ba44e53c204a6be490db65f"
  },
  {
    "url": "images/sync-pending_36@2x.png",
    "revision": "1a45d86bf2feecb261537c530e9099f3"
  },
  {
    "url": "images/sync-postponed_24.png",
    "revision": "947352fe11e789c9d5e81c4f398a662a"
  },
  {
    "url": "images/sync-postponed_24.svg",
    "revision": "fe59bc0b6893b0c6a72d7049b3ae3129"
  },
  {
    "url": "images/sync-postponed_24@2x.png",
    "revision": "ae128d3ce001a18958fb6af891027736"
  },
  {
    "url": "images/sync-postponed_36.png",
    "revision": "947352fe11e789c9d5e81c4f398a662a"
  },
  {
    "url": "images/sync-postponed_36.svg",
    "revision": "fe59bc0b6893b0c6a72d7049b3ae3129"
  },
  {
    "url": "images/sync-postponed_36@2x.png",
    "revision": "ae128d3ce001a18958fb6af891027736"
  },
  {
    "url": "images/sync-read-message_24.png",
    "revision": "cda9b20897739957b957576f687801b7"
  },
  {
    "url": "images/sync-read-message_24.svg",
    "revision": "5c7e34d5db16a1b3423469830bc61bfc"
  },
  {
    "url": "images/sync-read-message_24@2x.png",
    "revision": "6bf21811923d6e1c1ac395a644e96758"
  },
  {
    "url": "images/sync-read-message_36.png",
    "revision": "cda9b20897739957b957576f687801b7"
  },
  {
    "url": "images/sync-read-message_36.svg",
    "revision": "5c7e34d5db16a1b3423469830bc61bfc"
  },
  {
    "url": "images/sync-read-message_36@2x.png",
    "revision": "6bf21811923d6e1c1ac395a644e96758"
  },
  {
    "url": "images/sync.png",
    "revision": "82d85a0161ec1e520ccac8cfcea41310"
  },
  {
    "url": "images/sync.svg",
    "revision": "31e898606c5eafb2bbb22454cd26e8cc"
  },
  {
    "url": "images/sync@2x.png",
    "revision": "8d6edfdf073a34cdb0536665d21bd79d"
  },
  {
    "url": "images/synchronized_24.png",
    "revision": "e1ef7bc53455d24fce9e392b1f3110bb"
  },
  {
    "url": "images/synchronized_24.svg",
    "revision": "8c02501247bd8e33af776d9cfc1ce47e"
  },
  {
    "url": "images/synchronized_24@2x.png",
    "revision": "2e37ba04d833f0c0f2aedb581d6e022f"
  },
  {
    "url": "images/tem1/i_close-menu.svg",
    "revision": "2e14cbdeda4641d270767940c0f43311"
  },
  {
    "url": "images/tem1/Logo.svg",
    "revision": "ce44dca2a103f73bb0b1b5257460d617"
  },
  {
    "url": "images/tem1/menu-24px.svg",
    "revision": "828542794e720fc37cd8b4cdabfdfe85"
  },
  {
    "url": "images/tem1/more_vert-24px.svg",
    "revision": "898d7f834f426ea36dfa903944897dd1"
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
    "revision": "a6c52935038042a6295ce41e5f1e5568"
  },
  {
    "url": "redeemGen.html",
    "revision": "1a37995e4c40b52c84bfd5000c20d85e"
  },
  {
    "url": "scripts/app.js",
    "revision": "e401b8192df9a01521cf4891655812aa"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "c124c905d5663d50d5f7eca6783d2c4a"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "6bf32e0a9b138063c963fd93170ac7ad"
  },
  {
    "url": "scripts/classes/activityCard.js",
    "revision": "3541a76f7cf3a0d735f404e3128db563"
  },
  {
    "url": "scripts/classes/appModeSwitchPrompt.js",
    "revision": "f1f974a1545db212e69134586d55ce07"
  },
  {
    "url": "scripts/classes/baseConverter.js",
    "revision": "c398454505454bd311be2a5c5e774abc"
  },
  {
    "url": "scripts/classes/block.js",
    "revision": "9293db77461af05e84f8e7f71986d51d"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "50e85c4cb6185f9e2b194a95dfee18e6"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "88a9e6c88b526d13a81f30829763ad88"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "11ab0d49fe11ad2f03ec5bf8620d8179"
  },
  {
    "url": "scripts/classes/blockListView.js",
    "revision": "f773d9385cd7f72caf9773a8241985df"
  },
  {
    "url": "scripts/classes/blockMsg.js",
    "revision": "7fd45778a932e477d46118556b7d6065"
  },
  {
    "url": "scripts/classes/dataList.js",
    "revision": "3cdc33e439da8cda0c034498b8b1fbca"
  },
  {
    "url": "scripts/classes/favIcon.js",
    "revision": "8b78d8eb8e7deb9b23739e193c746355"
  },
  {
    "url": "scripts/classes/favIconNew.js",
    "revision": "342a9a827daee6b07ce056f71da9add3"
  },
  {
    "url": "scripts/classes/inputControl.js",
    "revision": "51133403ebf4518c097c139bccdd1e5f"
  },
  {
    "url": "scripts/classes/langTerm.js",
    "revision": "27d161fd8361e25da1f4c233eff5f109"
  },
  {
    "url": "scripts/classes/login.js",
    "revision": "638bafea43736d59fd78050b7d55a743"
  },
  {
    "url": "scripts/classes/menu.js",
    "revision": "78455201926e9cf3b5e24579c74cb1ba"
  },
  {
    "url": "scripts/classes/myDetails.js",
    "revision": "82b3cc8dc86be5398b70094ee8a94c35"
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
    "revision": "a6d4f5f0053b049ed73ce6ebfff4b7fe"
  },
  {
    "url": "scripts/classes/statistics.js",
    "revision": "8866d56d04f1e0eeb7e6a18ddd450728"
  },
  {
    "url": "scripts/classes/webqr.js",
    "revision": "605d4d9a844d38de92cfc9d1c91d6214"
  },
  {
    "url": "scripts/constants/configs.js",
    "revision": "99bde69d66c45111ce842080c66aee24"
  },
  {
    "url": "scripts/constants/constants.js",
    "revision": "f78b519736493ab16dc6245d2b4d6148"
  },
  {
    "url": "scripts/constants/templates.js",
    "revision": "0ee59a7bd15e281493a50ef3f554cd7e"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "28f53341d6c8ed5c4efde4b7cdf40ac1"
  },
  {
    "url": "scripts/libraries/aes.js",
    "revision": "4ff108e4584780dce15d610c142c3e62"
  },
  {
    "url": "scripts/libraries/crossfilter.min.js",
    "revision": "3e7143a84c7dcaaaed27bfa86f05bb42"
  },
  {
    "url": "scripts/libraries/d3.min.js",
    "revision": "f3ba03784f98e7e7985fc96413714837"
  },
  {
    "url": "scripts/libraries/jquery-3.4.0.min.js",
    "revision": "bbcf3bf05fa6cb58a67cfd0498f00d23"
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
    "url": "scripts/libraries/jquery-ui.min.js",
    "revision": "0a497d4661df7b82feee14332ce0bdaf"
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
    "url": "scripts/libraries/json-viewer.js",
    "revision": "fd884f75cd6c3a0e7c6f887bfcebb2ea"
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
    "revision": "5582df9ad2ace31bd6fecfc7d214c3d2"
  },
  {
    "url": "scripts/libraries/moment.min.js",
    "revision": "03c1d3ad0acf482f87368e3ea7af14c2"
  },
  {
    "url": "scripts/libraries/tabulate.js",
    "revision": "96ca52998d4d41dee41aef29a998e581"
  },
  {
    "url": "scripts/services/activityDataManager.js",
    "revision": "43b12880f1016274f4921cc0aa3f4549"
  },
  {
    "url": "scripts/services/appInfoManager.js",
    "revision": "77c80915ae8103b5fc65662bfe5b9647"
  },
  {
    "url": "scripts/services/cacheManager.js",
    "revision": "daf730f5f2ca8836921cf140ae5c8b3a"
  },
  {
    "url": "scripts/services/clientDataManager.js",
    "revision": "57e499c86415a41887a68dae492e9aa9"
  },
  {
    "url": "scripts/services/configManager.js",
    "revision": "65c82bc328a42834b05481f772d59359"
  },
  {
    "url": "scripts/services/connManagerNew.js",
    "revision": "ada4fa42ea24937c7c0c57a03aaa7462"
  },
  {
    "url": "scripts/services/dataFormatConvert.js",
    "revision": "d4bdf16045290da70ed4992119fa608f"
  },
  {
    "url": "scripts/services/dataVerMove.js",
    "revision": "71aec7e25cab6a6a013c4fcb969d0edd"
  },
  {
    "url": "scripts/services/devHelper.js",
    "revision": "f90c7f87fe63995b02e2a9022fd6a3d9"
  },
  {
    "url": "scripts/services/formMsgManager.js",
    "revision": "205fe953e409d998c94a94b1382365de"
  },
  {
    "url": "scripts/services/msgManager.js",
    "revision": "56c817100a6b5af6b1090d7fa342ca10"
  },
  {
    "url": "scripts/services/payloadTemplateHelper.js",
    "revision": "aefa4e5da57b7429094ca85722f72839"
  },
  {
    "url": "scripts/services/request/RESTCallManager.js",
    "revision": "de8b134903bd98a9e1857ef0e6d97b79"
  },
  {
    "url": "scripts/services/request/wsCallManager.js",
    "revision": "815770496ab8dc5531ce4333d4f1c7d1"
  },
  {
    "url": "scripts/services/scheduleManager.js",
    "revision": "084daf93118237572a9a42e15ea5df0a"
  },
  {
    "url": "scripts/services/sessionManager.js",
    "revision": "df2334b00ea8216b4707ee3220e42f2e"
  },
  {
    "url": "scripts/services/storage/dataManager2.js",
    "revision": "50290144d743e404a1033541ff8cc454"
  },
  {
    "url": "scripts/services/storage/localStgMng.js",
    "revision": "8328da018271bee55dde59b8daf0947b"
  },
  {
    "url": "scripts/services/storage/storageMng.js",
    "revision": "ed4faa1f8d5823da19120d5fabf6dd97"
  },
  {
    "url": "scripts/services/swManager.js",
    "revision": "5ee76e112a65bf44a289e9299237ede4"
  },
  {
    "url": "scripts/services/syncManagerNew.js",
    "revision": "bc3ff5219b0876cfd7c8e7a1b2d85509"
  },
  {
    "url": "scripts/services/viewsListManagerOLD.js",
    "revision": "787aebad1485ca1a109b1e085c43fc68"
  },
  {
    "url": "scripts/utils/activityUtil.js",
    "revision": "f7eaab22bd979d5fbfa3c37780d3d938"
  },
  {
    "url": "scripts/utils/dbStorageSelector.js",
    "revision": "8ab2bf44ab021b578d1e5487fc527549"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "ebf1b919593f5639138f112688f2d1f3"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "7b5cd58dfe1a9ac80f956057c929a28d"
  },
  {
    "url": "scripts/utils/jsonBuiltTable.js",
    "revision": "259d74adcb4ab994e21085c319ce8735"
  },
  {
    "url": "scripts/utils/pptManager.js",
    "revision": "693b4d4151a9d11e987660716a3d2fd7"
  },
  {
    "url": "scripts/utils/pptOptions.js",
    "revision": "281733303a8f33912d7d5252052cfe88"
  },
  {
    "url": "scripts/utils/prototypes.js",
    "revision": "79ea879ad93055c4a960b8e781527ec5"
  },
  {
    "url": "scripts/utils/sounds.js",
    "revision": "97393a9428a58c177ae3cb371936f55f"
  },
  {
    "url": "scripts/utils/util.js",
    "revision": "9eb3257741f21321e34387740ddf0fa5"
  },
  {
    "url": "scripts/utils/util2.js",
    "revision": "a2290666945e1b561bb085aa3bd08495"
  },
  {
    "url": "scripts/utils/utilBack.js",
    "revision": "15123a10cb6dfd711159a9fa6bd63f90"
  },
  {
    "url": "scripts/utils/validationUtil.js",
    "revision": "1abc19f8c13f7a90e8a5217f5e4f0f31"
  },
  {
    "url": "scss/style.css",
    "revision": "5e62abe227acaf2406c4f6fc555f3f40"
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
    "url": "unittest/jest/util.test.js",
    "revision": "23c98582979f4020ea5ce3be6be3c444"
  },
  {
    "url": "unittest/noteStorageMng.js",
    "revision": "32464a775d6910333d6538207b72d90f"
  },
  {
    "url": "unittest/qunittest/js/test_Login.js",
    "revision": "09046f8ab4688d529bbeffbf0691537c"
  },
  {
    "url": "unittest/qunittest/js/test_Util.js",
    "revision": "2706e96851d56bc142916060e409dd55"
  },
  {
    "url": "unittest/qunittest/libs/qunit.css",
    "revision": "c866880a796e5702c903767a7b5f0540"
  },
  {
    "url": "unittest/qunittest/libs/qunit.js",
    "revision": "bec8d44fcde667b93fccc8b35c3a8cb6"
  },
  {
    "url": "unittest/qunittest/test.html",
    "revision": "4937044089a78bc22b8fd281d1d110f2"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/.js|.html|.css|.svg|.jpg|.png|.gif|.mp3|.wav/, new workbox.strategies.CacheFirst({ "cacheName":"appShell", plugins: [] }), 'GET');
workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com.*/, new workbox.strategies.StaleWhileRevalidate({ "cacheName":"googleFonts", plugins: [] }), 'GET');
