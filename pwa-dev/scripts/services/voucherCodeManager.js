// =========================================
//     VoucherCodeManager
//          - 
// 
//    Feature:
//       1. When online login or a manual button, refill the voucherCode (async, no blocking)
//       - 
//
//    TODO MORE:
//       - Alert system if under the low limit.  
//       - Offline Login Alert - if low for a while..
// ===================

function VoucherCodeManager()  {};

VoucherCodeManager.queueSize = 150;
VoucherCodeManager.queueLowSize = 100;

// ===================================================
// === MAIN FEATURES =============

VoucherCodeManager.refillQueue = function()
{ 
   // Call after login.. <-- online only
   VoucherCodeManager.queueStatus( function( isLow, fillCount, currCount ) {

      // Fill the count
      VoucherCodeManager.fillQueue( fillCount, function( success, vcList ) {
         console.log( 'Filled op: ' + success + ', filledListCount: ' + vcList.length );

         console.log( 'currentCount: ' + AppInfoManager.getVoucherCodes_queue().length );
      } );
   });
};

// Can be used on Offline/Online loggin
//VoucherCodeManager.queueLow = function( callBack )
VoucherCodeManager.queueStatus = function( callBack )
{ 
   var queue = AppInfoManager.getVoucherCodes_queue();

   var isLow = ( queue.length <= VoucherCodeManager.queueLowSize );
   var fillCount = VoucherCodeManager.queueSize - queue.length;
   var currCount = queue.length;

   // if the fill max is 100
   if ( callBack ) callBack( isLow, fillCount, currCount );
};


// On Login (Online), 
VoucherCodeManager.fillQueue = function( fillCount, callBack )
{ 
   if ( fillCount > 0 )
   {
      // create a fake service?  just DWS service..
      var loadingTag = undefined;
      WsCallManager.requestPostDws( '/TTS.vcFill', { 'fillCount': fillCount }, loadingTag, function( success, returnJson ) 
      {    
         if ( success && returnJson && returnJson.vcList )
         {
            var queue = AppInfoManager.getVoucherCodes_queue();

            Util.mergeArrays( queue, returnJson.vcList );

            AppInfoManager.updateVoucherCodes_queue( queue );

            if ( callBack ) callBack( true, returnJson.vcList );
         }
         else
         {
            if ( callBack ) callBack( false, [] );
         }
      });
   }
   else
   {
      if ( callBack ) callBack( false, [] );
   }
};

// ----------------

VoucherCodeManager.retrieveNewVoucherCodes = function()
{ };

VoucherCodeManager.takeOut_OneVoucherCode = function()
{ };

