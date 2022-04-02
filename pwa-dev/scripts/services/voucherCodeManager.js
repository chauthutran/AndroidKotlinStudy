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

VoucherCodeManager.STATUS_InUse = 'InUse';
VoucherCodeManager.STATUS_Used = 'Used';

// ===================================================
// === MAIN FEATURES =============

VoucherCodeManager.refillQueue = function( userName )
{ 
   // Call after login.. <-- online only
   VoucherCodeManager.queueStatus( function( isLow, fillCount, currCount ) {

      // Fill the count
      VoucherCodeManager.fillQueue( userName, fillCount, function( success, vcList ) {
         if ( success ) console.log( 'VoucherCodes Downloaded. Filled Count: ' + vcList.length );
      });
   });
};

// Can be used on Offline/Online loggin
//VoucherCodeManager.queueLow = function( callBack )
VoucherCodeManager.queueStatus = function( callBack )
{ 
   var queue = PersisDataLSManager.getVoucherCodes_queue();
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
      WsCallManager.requestPostDws( '/PWA.voucherCodeGet', { taken_by: userName, counts: fillCount }, loadingTag, function( success, returnJson ) 
      {
         if ( success && returnJson && returnJson.data )
         {
            var queue = PersisDataLSManager.getVoucherCodes_queue();

            var newListObj = VoucherCodeManager.getQueueObj_fromVcList( returnJson.data );

            Util.mergeArrays( queue, newListObj );

            PersisDataLSManager.updateVoucherCodes_queue( queue );
            
            if ( callBack ) callBack( true, newListObj );
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
      newListObj.push( { voucherCode: vcItem.code, status: '', ver_no: vcItem.ver_no } );
   });

   return newListObj;
};

// ----------------

// VC USE STEP #1. Use the Voucher Code
VoucherCodeManager.getNextVoucherCode = function()
{
   if ( ConfigManager.getSettings().voucherCodeServiceUse ) // ONLY USE THIS IF voucherCodeService is in use.
   {
      var queue = PersisDataLSManager.getVoucherCodes_queue();
      var item = VoucherCodeManager.getNotUsed_1stOne( queue );  // This method has extra logic to check if free one is already in use somehow.

      if ( item )
      {
         item.displayed = true;
         return item.voucherCode;
      }   
   }
   
   return '';
};


// VC USE STEP #2. Mark the Voucher Code with 'InUse' status --> in pending activity with 'v_iss' type
//    - Called in action.js in 'queueActivity'
VoucherCodeManager.markVoucherCode_InQueue = function( activityJson, transType, markStatus )
{
   var voucherCode = '';
   var matchVcItem;

   if ( activityJson && transType && markStatus )
   {
      // 1. Get voucherCode from activity <-- in trans 'v_iss'
      activityJson.transactions.forEach( trans => 
      {
         if ( trans.type === transType ) // 'v_iss' )
         {
            if ( trans.clientDetails && trans.clientDetails.voucherCode ) 
            {
               voucherCode = trans.clientDetails.voucherCode;
            }
         }
      });
   
   
      // 2. Find the voucherCode from queue and mark it as 'InUse' status.
      var queue = PersisDataLSManager.getVoucherCodes_queue();
      for( var i = 0; i < queue.length; i++ )
      {
         var vcItem = queue[i];
   
         if ( vcItem.voucherCode === voucherCode )
         {
            matchVcItem = vcItem;
            VoucherCodeManager.markStaus( vcItem, markStatus );  //'InUse';
            break;
         }
      }
   }

   return matchVcItem;
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
            // But if there is voucher in use, mark the status...  <-- 'InUse' vs 'Used? AlreadyUsed?'
            if ( ActivityDataManager.isVoucherCodeUsed( item.voucherCode ) )
            {
               VoucherCodeManager.markStaus( item, VoucherCodeManager.STATUS_Used );
            }
            else
            {
               foundItem = item;
               break;   
            }
         }
      }
   }
   return foundItem;
};


VoucherCodeManager.markStaus = function( vcItem, status )
{
   if ( vcItem )
   {
      vcItem.status = status;
      vcItem.markDate = new Date().toISOString();
   }
};

// When unsynced activity is removed/rolled back, unMark the voucherCode..
VoucherCodeManager.unMarkStaus = function( vcItem )
{
   if ( vcItem )
   {
      if ( vcItem.status ) delete vcItem.status;
      if ( vcItem.markDate ) delete vcItem.markDate;
   }
};

// NOTE: BUT, we should seperate mark it as use, and take it out..
//    - When visible, we populate it and mark it as using..
//    - When Created with activity?  Or after sync, we remove it from queue?
//    - For now, make it used when activity is created with voucherCode & 'v_rdx'...
/*
VoucherCodeManager.takeOut_OneVoucherCode = function( callBack )
{ 
   var queue = PersisDataLSManager.getVoucherCodes_queue();
   var item = VoucherCodeManager.getNotUsed_1stOne( queue );

   // DO NOT TAKE IT OUT!!!
   // var item = Util.array_TakeOutOne( queue );

   if ( item !== undefined )
   {
      item.status = 'inUse'; // '' -> 'inUse' -> 'used'
      // CHANGE THIS...
      PersisDataLSManager.updateVoucherCodes_queue( queue );
      
      callBack( item );
   }
   else {} // callBack with empty value??
};
*/

// -----------------------

// VoucherCodeManager.clearAll = function() { };
