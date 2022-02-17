// =========================================
//     VoucherCodeManager
//          - 
// 
//    Feature:
//       A. ReFill: - When online login or a manual button, refill the voucherCode (async, no blocking)
//       B. Use:
//             Hard to use by expression on field, since it could result in using it too often..
//             - Thus, we should only lock the one created with activity, or synced..
//                --> 'synced' ['Used', activityId: --- ]  <-- Mark it as 'Used'
//                --> 'displayed' ['Displayed'] in fields only <-- get freed 1 day after?  or next login
//                --> 'created' ['InUse', activityId: --- ] with activity, but not synced <-- 
//                   - Only free it?  if 'activityId' no longer exists..

//       - We can either make this object with { voucherCode: '----', status: 'inUse/used' } ??
//       - item.status = 'inUse'; // '' -> 'inUse' -> 'used'
//


//    TODO MORE:
//       - Make use of the control.. <-- on field type, we make it type 'voucherCode'?
//             IPC: 'type': 'voucherCode_Gen'
//             Provider: 'type': 'voucherCode_Redeem'
//       - And it 

//       - Alert system if under the low limit.  
//       - Offline Login Alert - if low for a while..'
//
//    In WS, voucher: { voucherCode: ----, taken: ----, used: ---- }  <-- 'taken'/'used' is date?  or boolean, but has other date fields?
//       - 'taken' - takes care of not being shared by others..  [Fields: userId, ture/false, date taken ]
//       - 'used' - we know that it actually is used..   If 'taken', but not used for long time, should we reclaim it?  probably not..
//          --> But, at least, we can tell the ratio or usage?
// ===================

function VoucherCodeManager()  {};

VoucherCodeManager.queueSize = 300; // Service has 300 fixed.. for some reason..
VoucherCodeManager.queueLowSize = 100;

// ===================================================
// === MAIN FEATURES =============

VoucherCodeManager.refillQueue = function( userName )
{ 
   // Call after login.. <-- online only
   VoucherCodeManager.queueStatus( function( isLow, fillCount, currCount ) {

      // Fill the count
      VoucherCodeManager.fillQueue( userName, fillCount, function( success, vcList ) {
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
   queue = queue.filter( item => !item.status );  // 'Used' / 'InUse' / 'Displayed'

   var isLow = ( queue.length <= VoucherCodeManager.queueLowSize );
   var fillCount = VoucherCodeManager.queueSize - queue.length;
   var currCount = queue.length;

   // if the fill max is 100
   if ( callBack ) callBack( isLow, fillCount, currCount );
};


// On Login (Online), 
VoucherCodeManager.fillQueue = function( userName, fillCount, callBack )
{ 
   if ( fillCount > 0 )
   {
      // create a fake service?  just DWS service..
      var loadingTag = undefined;
      WsCallManager.requestPostDws( '/PWA.voucherCodeGet', { used_by: userName, counts: fillCount }, loadingTag, function( success, returnJson ) 
      {
         if ( success && returnJson && returnJson.data )
         {
            var queue = AppInfoManager.getVoucherCodes_queue();

            var newListObj = VoucherCodeManager.getQueueObj_fromVcList( returnJson.data );

            Util.mergeArrays( queue, newListObj );

            AppInfoManager.updateVoucherCodes_queue( queue, function() 
            {
               if ( callBack ) callBack( true, newListObj );
            });
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


VoucherCodeManager.getQueueObj_fromVcList = function( vcList )
{
   var newListObj = [];

   vcList.forEach( vcItem => {
      newListObj.push( { voucherCode: vcItem.code, status: '' } );
   });

   return newListObj;
};

// ----------------

// NOTE: BUT, we should seperate mark it as use, and take it out..
//    - When visible, we populate it and mark it as using..
//    - When Created with activity?  Or after sync, we remove it from queue?
//    - For now, make it used when activity is created with voucherCode & 'v_rdx'...

VoucherCodeManager.takeOut_OneVoucherCode = function( callBack )
{ 
   var queue = AppInfoManager.getVoucherCodes_queue();
   var item = VoucherCodeManager.getNotUsed_1stOne( queue );

   // DO NOT TAKE IT OUT!!!
   // var item = Util.array_TakeOutOne( queue );

   if ( item !== undefined )
   {
      item.status = 'inUse'; // '' -> 'inUse' -> 'used'
      // CHANGE THIS...
      AppInfoManager.updateVoucherCodes_queue( queue, function() {
         callBack( item );
      });   
   }
   else {} // callBack with empty value??

};

VoucherCodeManager.getNotUsed_1stOne = function( queue )
{
   var foundItem;

   if ( queue && queue.length > 0 )
   {
      for( var i = 0; i < queue.length; i++ )
      {
         var item = queue[i];

         if ( item.voucherCode && !item.status )
         {
            foundItem = item;
            break;
         }
      }
   }
   return foundItem;
};

// -----------------------
/*
VoucherCodeManager.clearAll = function()
{
};
*/