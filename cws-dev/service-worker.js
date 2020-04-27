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
    "url": "css/pwa.css",
    "revision": "029b16e3c0323cd43d5178316a5f286c"
  },
  {
    "url": "css/qunit.css",
    "revision": "aa03c22c7ae5acdc832b0b719193d453"
  },
  {
    "url": "css/style.css",
    "revision": "8c3aadb5ae1614c065d6a5f80ffce6a6"
  },
  {
    "url": "images/about.png",
    "revision": "2d548c037c19ca09ec10fa450d2b1acd"
  },
  {
    "url": "images/about.svg",
    "revision": "c9ecbd55c7ef63e5a50df53f1e5e802d"
  },
  {
    "url": "images/about@2x.png",
    "revision": "7ee5bd56d7c0fdf8d247b0388d48f209"
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
    "url": "images/arrow_back.png",
    "revision": "d0dea5681edff0e8e0ba201a4a9a5b0a"
  },
  {
    "url": "images/arrow_back.svg",
    "revision": "473fc5cb835a184925160c0e66ec256f"
  },
  {
    "url": "images/arrow_back@2x.png",
    "revision": "7eb4db2afea88b0ef722ce7f9ba2a71c"
  },
  {
    "url": "images/arrow_down.svg",
    "revision": "1d6cebe7e67a1c69ca8f1941174c6b77"
  },
  {
    "url": "images/arrow_drop_down.png",
    "revision": "f972228032f5e1b04fa060f2cc141c7e"
  },
  {
    "url": "images/arrow_drop_down.svg",
    "revision": "1a24a675456b67c226e563965ed32063"
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
    "revision": "6bcebaf4e09461f45416ee2793ea7062"
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
    "revision": "baef958b935b55735ed90b07b5b66572"
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
    "revision": "6fec42781fb8d300275462a1994962e3"
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
    "revision": "a185302279936acc7f9221bd747ca3ab"
  },
  {
    "url": "images/arrow_right@2x.png",
    "revision": "76afd7056e4730b280b692bc73c47854"
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
    "url": "images/by_client_details.png",
    "revision": "d11a52957a82cf2b21ecead9d86fba06"
  },
  {
    "url": "images/by_client_details.svg",
    "revision": "216912187278ca2cfce566518ba0567c"
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
    "revision": "d0bc74743956f4249306b05dd3df41e2"
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
    "revision": "95c01677f1c37f24ba6c64ba6c995b35"
  },
  {
    "url": "images/by_voucher@2x.png",
    "revision": "5df06b58afffa28e4204c438134a6112"
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
    "url": "images/close.png",
    "revision": "e056450373c325ece76edef7226d36d7"
  },
  {
    "url": "images/close.svg",
    "revision": "0150c56dc035ef1cc3867fc687991140"
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
    "revision": "7e208b69ba027cd4fa9bc6109a602dd0"
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
    "revision": "ef6afed881dee342a1a124bbc71dfb42"
  },
  {
    "url": "images/cloud_offline_Intenet-up2@2x.png",
    "revision": "6976351c25564c971ee1421e5099956f"
  },
  {
    "url": "images/cloud_offline.png",
    "revision": "5b7bdf0aaef4bc354768616bb39a227b"
  },
  {
    "url": "images/cloud_offline.svg",
    "revision": "d1b7a8be9c49e7a7354591fec3dada34"
  },
  {
    "url": "images/cloud_offline@2x.png",
    "revision": "f7368f5e116d11ac29bee8005c3ec6f3"
  },
  {
    "url": "images/cloud_online.png",
    "revision": "982590a0962e4ef64674e39725f0d932"
  },
  {
    "url": "images/cloud_online.svg",
    "revision": "ca2fd25d1cb666c9ed2969ab130221c6"
  },
  {
    "url": "images/cloud_online@2x.png",
    "revision": "bcdaef7b8a5e3b7ce46de0ea3661c0c6"
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
    "url": "images/details_24.svg",
    "revision": "12a5912340444a176b5d607b370a29ec"
  },
  {
    "url": "images/eLearning_s.png",
    "revision": "b7bcbc82151cbd752986ec394c598c13"
  },
  {
    "url": "images/eLearning_s.svg",
    "revision": "32a9b97a7ac21540d9040e17a86e4f57"
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
    "revision": "bff45321b7b6e043c69f24d9fb47b3a0"
  },
  {
    "url": "images/eLearning_u@2x.png",
    "revision": "15a8e1bf1891aa5a4c2e9d1028bfe3ea"
  },
  {
    "url": "images/entry.svg",
    "revision": "a19649ec23fe1803d4dd9408740cb5c6"
  },
  {
    "url": "images/fab_follow_up_40.svg",
    "revision": "ba80a34922ff176549538bc28b8df0ca"
  },
  {
    "url": "images/fab_plus_40.png",
    "revision": "98d53735be9efd2ddbb17dd530c3771d"
  },
  {
    "url": "images/fab_plus_40.svg",
    "revision": "17a5002acc741a64ab2f7b2db441daa2"
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
    "revision": "d322d62afb23967b4d94bdb6b0c952cf"
  },
  {
    "url": "images/fab_plus_56@2x.png",
    "revision": "b4650ff26d749886eae10812faad24cb"
  },
  {
    "url": "images/fab_provision_40.svg",
    "revision": "9230eedba13ef7849e3c214fed328c63"
  },
  {
    "url": "images/fab_safe_abortion_40.svg",
    "revision": "8e69ba3017096745522ab335ef6b3001"
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
    "url": "images/follow-up.png",
    "revision": "3d53591f47f22f5043dbd2ecd4eebe1e"
  },
  {
    "url": "images/follow-up.svg",
    "revision": "ca79e391c0a41ec16c2d8e05af7e1de5"
  },
  {
    "url": "images/follow-up@2x.png",
    "revision": "65bab29cbd621129a1377f64ddb92237"
  },
  {
    "url": "images/followup.svg",
    "revision": "d015ebd0b1516cdfd3a4a110c6dc884c"
  },
  {
    "url": "images/gabrielle_48.png",
    "revision": "c65b2ec85a58699ff17da08cebaa8dca"
  },
  {
    "url": "images/gabrielle_48.svg",
    "revision": "e0d511d72423b93ca1cc2ca8094fb653"
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
    "revision": "f6b50da065c53fd46a830f1e6b208612"
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
    "revision": "de3a2c52c81ddd7829b1d107e5ed5ee2"
  },
  {
    "url": "images/logo_bk.png",
    "revision": "eb94d52612e750aafb626429b79d60af"
  },
  {
    "url": "images/logo_bk.svg",
    "revision": "bb424b1a0c8b5bae17590329fb6b14f7"
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
    "revision": "e8d3069de4f3ae68dcd94344f11be8a1"
  },
  {
    "url": "images/logo_cws@2x.png",
    "revision": "1522abe1d4c34bfbb16e8dd3b1cacd86"
  },
  {
    "url": "images/logo.svg",
    "revision": "44b0c57dc046930b5f78026ad2eeb937"
  },
  {
    "url": "images/logout.png",
    "revision": "bce2624cbff60226a0d31c0b43342ba4"
  },
  {
    "url": "images/logout.svg",
    "revision": "d9d3a6f585f07fe0ac5a080f456f597d"
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
    "revision": "060afbe2db992ce268a86a64ffe38d24"
  },
  {
    "url": "images/may_details@2x.png",
    "revision": "88151e43c03950cd4d0a3ce7aa678bee"
  },
  {
    "url": "images/menu_icon.svg",
    "revision": "528dd5f2e025f2208386bead7bbc1e59"
  },
  {
    "url": "images/menu-24px.svg",
    "revision": "d909da6b30daa1d191edc676156b29d1"
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
    "url": "images/payload_24.png",
    "revision": "84c345519cb601588b28d0d89714ee92"
  },
  {
    "url": "images/payload_24.svg",
    "revision": "559766e7529719e0794459d57572fa70"
  },
  {
    "url": "images/payload_24@2x.png",
    "revision": "52b85e277807076de5f8dd1c5b7bf49c"
  },
  {
    "url": "images/pending.svg",
    "revision": "eb1f5bcf5ce3173536853cd3774b447e"
  },
  {
    "url": "images/phone.png",
    "revision": "4317025d830d6eee433067df2fc7c998"
  },
  {
    "url": "images/phone.svg",
    "revision": "a2598e8f2ad87e669480c9760cc6b146"
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
    "revision": "769c46142f9077b274286d6c3762e606"
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
    "revision": "b5ac623ac7ec2e98d413a171d2301f15"
  },
  {
    "url": "images/placeholder_w@2x.png",
    "revision": "c4026a1a5db2ddb5b60af65eee114e36"
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
    "url": "images/profile_s.png",
    "revision": "d9dccc06c3f3fd9ec13fbe49339d24a2"
  },
  {
    "url": "images/profile_s.svg",
    "revision": "ee88ba58c9a1eae151fe89095639e680"
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
    "revision": "27055b57c375c84ac7f39881e225dca4"
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
    "revision": "b6f5e715ce8fe86620a5a5059309a617"
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
    "revision": "1c25c2ec3aa2dcc8fd1c8babf3ae06e7"
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
    "revision": "2fb719327cd04ca2efb9ddc62b5de8f8"
  },
  {
    "url": "images/provision@2x.png",
    "revision": "f7d904632afccfe0f40ff1bb727ad646"
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
    "url": "images/remove.png",
    "revision": "082e5b23e24ff0d122c131267dd018ad"
  },
  {
    "url": "images/remove.svg",
    "revision": "8a03a6f4f936934ce333ec574c20472f"
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
    "revision": "984d1569411199e3c1387b90c2e6b5d8"
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
    "revision": "53ec5efc7b29f0ea0c0e412e22779bba"
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
    "revision": "8e3c5c922ebcd50c91fb27d36cfdde3d"
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
    "revision": "f23056a82baf65441cddfe05547f2160"
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
    "revision": "3ad95ad8260a508a22fac5bb3ff15acd"
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
    "url": "images/sort24.svg",
    "revision": "0218f8e06ebd40159c2d90ec96e5d1bb"
  },
  {
    "url": "images/start_again.png",
    "revision": "ce519557723c405a8dee9bd4cbcf70c8"
  },
  {
    "url": "images/start_again.svg",
    "revision": "286488a1f6235e654bc2a47b156f0238"
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
    "revision": "ee8ff689b54e6feb2274404eab01e4cc"
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
    "revision": "295dd18abb61978a30850feb753fad80"
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
    "revision": "42061201b9a90d9afd80a65bb58d17e4"
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
    "revision": "104f8320d2e8e8e8a04c0c5736962621"
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
    "revision": "104f8320d2e8e8e8a04c0c5736962621"
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
    "revision": "c26ed68ffd70fd4dee43fa28789c2c6e"
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
    "revision": "60b7948292f7d54226602d26f8a95e69"
  },
  {
    "url": "images/sync_error_msdr@2x.png",
    "revision": "0c2d1dc7e5989bc8fffedcf3d004167c"
  },
  {
    "url": "images/sync_error.svg",
    "revision": "6345c6b90ad5dd60d639a18892c6f3d2"
  },
  {
    "url": "images/sync_msd.png",
    "revision": "04c248c5e2d4fee101626e6f7778b098"
  },
  {
    "url": "images/sync_msd.svg",
    "revision": "30df6115a5a9c443d142086cec3ce9f0"
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
    "revision": "51ce684c4003220bb5b6d4d8812b7791"
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
    "revision": "f7a8e25f92bed97929dc0aaec4beda39"
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
    "revision": "f5c93ae7a19f35d7f385d4f57a71147f"
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
    "revision": "361e6f1d299f445efa1f0765f94bfe99"
  },
  {
    "url": "images/sync_pending@2x.png",
    "revision": "02c97e2df830467a74fa8a123be62f61"
  },
  {
    "url": "images/sync-banner.svg",
    "revision": "679bf57f11ff6a88d3a130486a65e2aa"
  },
  {
    "url": "images/sync-error_24.png",
    "revision": "701f775ab7616ec4f5feeb76133e0ca9"
  },
  {
    "url": "images/sync-error_24.svg",
    "revision": "41b12ce6bcd603c148c6ac9c961d0fc4"
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
    "revision": "41b12ce6bcd603c148c6ac9c961d0fc4"
  },
  {
    "url": "images/sync-error_36@2x.png",
    "revision": "c809f45920b0efa5023a1924e5705500"
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
    "url": "images/sync-pending_24.png",
    "revision": "cd125e3c1797d95f5b125128d71ce4f9"
  },
  {
    "url": "images/sync-pending_24.svg",
    "revision": "1a8eea82293d61fedd8638622107c808"
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
    "revision": "1a8eea82293d61fedd8638622107c808"
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
    "revision": "ad39a5a805df043cdf4abeeb14d2f89f"
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
    "revision": "ad39a5a805df043cdf4abeeb14d2f89f"
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
    "revision": "425c09943a0bd290a3ee216ad01454fc"
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
    "revision": "425c09943a0bd290a3ee216ad01454fc"
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
    "revision": "92bdeb5743718453404601ddb0a08549"
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
    "revision": "663757eaf4e2af65fbbc4f3f2c21ce07"
  },
  {
    "url": "images/synchronized_24@2x.png",
    "revision": "2e37ba04d833f0c0f2aedb581d6e022f"
  },
  {
    "url": "images/tem1/i_close-menu.svg",
    "revision": "3800e2236b69696bc9ccf1808d34cef8"
  },
  {
    "url": "images/tem1/Logo.svg",
    "revision": "e52c1f8b5bfb51c9c611015a85c5f4d7"
  },
  {
    "url": "images/tem1/menu-24px.svg",
    "revision": "9c9080a45af6d48c0a3b08650d51d195"
  },
  {
    "url": "images/tem1/more_vert-24px.svg",
    "revision": "fee3e720ab6e167d7d674e3e7c22e586"
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
    "revision": "75aa8ce7de096a01c959665eacef09eb"
  },
  {
    "url": "redeemGen.html",
    "revision": "294625bdc2e797994c50cc5e0b5d46da"
  },
  {
    "url": "scripts/app.js",
    "revision": "1169c6fbd80bb448fbb5bb762c0e0cdf"
  },
  {
    "url": "scripts/classes/aboutApp.js",
    "revision": "e6d8424b8fca6ab55048f3a0a03fac32"
  },
  {
    "url": "scripts/classes/action.js",
    "revision": "e8f1a5c7467b764a8faeed5a32d11a8d"
  },
  {
    "url": "scripts/classes/activityCard.js",
    "revision": "fe7a15966f53ca7eb599391f55017d90"
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
    "revision": "97bc9428d7614d41104a7ec8f33dc423"
  },
  {
    "url": "scripts/classes/blockButton.js",
    "revision": "78c121bf38500c7f278703d275ac6354"
  },
  {
    "url": "scripts/classes/blockForm.js",
    "revision": "1bb707a6e705a4f1807c41661e108f5c"
  },
  {
    "url": "scripts/classes/blockList.js",
    "revision": "c2d702d585fadf5bf839c3bc2e7bdadd"
  },
  {
    "url": "scripts/classes/blockListView.js",
    "revision": "abd6231ddca6f50c1fc3b79dd5f6749a"
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
    "revision": "f825099af5bab53b86d1ee243cce1ded"
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
    "revision": "9c70ca477b1b32ab5a1ee30380a4924e"
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
    "revision": "601895bfbd5b988d19de9d0259028a5b"
  },
  {
    "url": "scripts/classes/statistics.js",
    "revision": "0bc144d01dda6b8f845310187b205689"
  },
  {
    "url": "scripts/classes/validation.js",
    "revision": "7a8a7f7880c595d65dd55c4e0cea517d"
  },
  {
    "url": "scripts/classes/webqr.js",
    "revision": "d68c757ed34cd531bb2ebadf15c681c8"
  },
  {
    "url": "scripts/constants/constants.js",
    "revision": "5572db657d1ca07af09bf04696285920"
  },
  {
    "url": "scripts/cwsRender.js",
    "revision": "61ca3515cf3897279f30c8d9086d7671"
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
    "revision": "e24e94cdf9e1668879a5a74cf3cdccc0"
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
    "revision": "9202a440df57728dc50a9cee8e45b4ef"
  },
  {
    "url": "scripts/services/cacheManager.js",
    "revision": "12a125e92e4408bd95f6d456065824e1"
  },
  {
    "url": "scripts/services/clientDataManager.js",
    "revision": "0d1296413f87292e380a614eeb48b544"
  },
  {
    "url": "scripts/services/configManager.js",
    "revision": "8ed9a70ddefe0c726aaeef394b9a81f8"
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
    "revision": "2cd7d720dd1c28fea003bfd0e21d572a"
  },
  {
    "url": "scripts/services/formMsgManager.js",
    "revision": "7c6fc878c37c7355783311b142c7d43e"
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
    "url": "scripts/services/payloadTemplateHelper.js",
    "revision": "b82f8e9cb64a6037f0e3bf5315f2868c"
  },
  {
    "url": "scripts/services/scheduleManager.js",
    "revision": "ddd6884c137e1021342d04ea55cb2387"
  },
  {
    "url": "scripts/services/sessionManager.js",
    "revision": "85d37796f685b5f4345c0401b5252809"
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
    "revision": "15160ef60f7dac18d31b5991fb3758e9"
  },
  {
    "url": "scripts/utils/activityUtil.js",
    "revision": "69e3591606ce484398d365b3a492f2f3"
  },
  {
    "url": "scripts/utils/dbStorageSelector.js",
    "revision": "e5c21632873d151139cddc4f1bb0efab"
  },
  {
    "url": "scripts/utils/formUtil.js",
    "revision": "1da7e536592f2d73a8b28ca844fa85ea"
  },
  {
    "url": "scripts/utils/inputUtil.js",
    "revision": "5a2addf56f40fbe6cb4becb323bc053d"
  },
  {
    "url": "scripts/utils/localStatistics.js",
    "revision": "e16f0a00fe51ce9458d2ac73b2d5690b"
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
    "url": "scss/style.css",
    "revision": "cf051580beb775fa8970c0a8c55cc432"
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
