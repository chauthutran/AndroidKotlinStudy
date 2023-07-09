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

//    NEW: 2023-04-07: 'FHIR' vs 'MONGO' (DEFAULT) 'storedType' added
// ===================

function VoucherCodeManager()  {};

VoucherCodeManager.settingData = {};  // queueSize / queueLowSize / enable

VoucherCodeManager.queueSize_Default = 300; // Service has 300 fixed.. for some reason..
VoucherCodeManager.queueLowSize_Default = 100; 
VoucherCodeManager.queueLowMsg_Default = "<span term='msg_vcQueueLowWarning'>Low voucherCodes count, $$length, in queue!!  Login online mode to refill the queue automatically!!</span>";
VoucherCodeManager.queueEmptyMsg_Default = "<span term='msg_vcQueueEmpty'>VoucherCode queue is empty!!  Login online mode to refill the queue automatically!!</span>";
VoucherCodeManager.url_vcGet_DEFAULT = '/PWA.voucherCodeGet';

// ------
VoucherCodeManager.STATUS_InUse = 'InUse';
VoucherCodeManager.STATUS_Used = 'Used';

VoucherCodeManager.StoredType_FHIR = 'FHIR';
VoucherCodeManager.StoredType_MONGO = 'MONGO';

VoucherCodeManager.isStoredType_FHIR = false;

// ===================================================
// === MAIN FEATURES =============

// MAIN #0. Called after Login (online/offline)
VoucherCodeManager.setSettingData = function( vcSrv, runFunc )
{
   VoucherCodeManager.settingData = vcSrv;

   if ( !vcSrv.queueSize || vcSrv.queueSize < 0 ) vcSrv.queueSize = VoucherCodeManager.queueSize_Default;
   if ( !vcSrv.queueLowSize || vcSrv.queueLowSize < 0 ) vcSrv.queueLowSize = VoucherCodeManager.queueLowSize_Default;
   if ( !vcSrv.queueLowMsg ) vcSrv.queueLowMsg = VoucherCodeManager.queueLowMsg_Default;
   if ( !vcSrv.queueEmptyMsg ) vcSrv.queueEmptyMsg = VoucherCodeManager.queueEmptyMsg_Default;
   if ( !vcSrv.url_vcGet ) vcSrv.url_vcGet = VoucherCodeManager.url_vcGet_DEFAULT;

   vcSrv.storedType = ( ConfigManager.isSourceTypeFhir() ) ? VoucherCodeManager.StoredType_FHIR: VoucherCodeManager.StoredType_MONGO;
   VoucherCodeManager.isStoredType_FHIR = ( vcSrv.storedType === VoucherCodeManager.StoredType_FHIR );


   // Run function for enabled voucherCodeService - like 'refill' or 'queueLowMsg'
   if ( VoucherCodeManager.settingData.enable && runFunc ) runFunc();
};


VoucherCodeManager.checkLowQueue_Msg = function()
{
   VoucherCodeManager.queueStatus( function( isLow, fillCount, currCount ) 
   {
      if ( currCount <= 0 )
      {
         var msgDivTag = $( '<div></div>' );
         msgDivTag.append( VoucherCodeManager.settingData.queueEmptyMsg );
         TranslationManager.translatePage( msgDivTag );
         MsgFormManager.showFormMsg( { itemId: 'queueEmptyMsg', msgSpanTag: msgDivTag, width: '130px' } );
      }
      else if ( isLow )
      {
         var msgDivTag = $( '<div></div>' );
         msgDivTag.append( VoucherCodeManager.settingData.queueLowMsg );
         TranslationManager.translatePage( msgDivTag );
         var spanTag = msgDivTag.find( 'span' );
         spanTag.text( spanTag.text().replace( "$$length", currCount ) );
         MsgFormManager.showFormMsg( { itemId: 'queueLowMsg', msgSpanTag: msgDivTag, width: '130px' } );
      }
   });
};


// MAIN #1. Called after online Login
VoucherCodeManager.refillQueue = function( userName, callBack )
{ 
	if ( !callBack ) callBack = function() {};

	try
	{
	   VoucherCodeManager.queueStatus( function( isLow, fillCount, currCount ) 
	   {
	   	var fillCountAll = fillCount;
	   	var filledCount = 0;

	      // Fill the count - 1st time
	      VoucherCodeManager.fillQueue( userName, fillCount, function( success, vcList ) 
	      {
	         if ( fillCount <= vcList.length ) callBack( true );
	         else 
	         {
	         	// 2nd time - regardless of 'success/fail'
	         	fillCount = fillCount - vcList.length;
					filledCount += vcList.length;

			      VoucherCodeManager.fillQueue( userName, fillCount, function( success, vcList ) 
			      {
			         if ( fillCount <= vcList.length ) callBack( true );
			         else 
			         {
			         	// 3nd time - regardless of 'success/fail'
			         	fillCount = fillCount - vcList.length;
							filledCount += vcList.length;
			
					      VoucherCodeManager.fillQueue( userName, fillCount, function( success, vcList ) 
					      {
					         if ( fillCount <= vcList.length ) callBack( true );
					         else 
					         {
					         	filledCount += vcList.length;

					         	var filledMsg = 'Filled ' + filledCount + ' of ' + fillCountAll;

									var retryBtnTag = $( '<button class="cbtn" style="margin-top: 5px;">RETRY</button>' );
									retryBtnTag.click( function() 
									{ 
										MsgFormManager.appUnblock( 'vcNotAllFilled' );										
										VoucherCodeManager.refillQueue( userName ); 
									});

						         var errMsg = '<b>[Refill VoucherCode Queue]</b> not filled all: ' + filledMsg + '!!';
						         var msgDivTag = $( '<div><span term="">' + errMsg + '</span></div>').append( retryBtnTag );

									MsgFormManager.showFormMsg( { itemId: 'vcNotAllFilled', msgSpanTag: msgDivTag, width: '130px' } );

									MsgManager.msgAreaShowErrOpt( errMsg );

					         	callBack( false );
					         }
			         	});
			         }
	         	});
	         }
	      });
	   });
   }
   catch( errMsg ) { console.log( 'ERROR in VoucherCodeManager.refillQueue, ' + errMsg ); }

};

// Can be used on Offline/Online loggin
VoucherCodeManager.queueStatus = function( callBack )
{ 
   var queue = VoucherCodeManager.getQueue_CurrStoredType();
   queue = queue.filter( item => !item.status );  // 'Used' / 'InUse' / 'Displayed'

   var isLow = ( queue.length <= VoucherCodeManager.settingData.queueLowSize );
   var fillCount = VoucherCodeManager.settingData.queueSize - queue.length;
   var currCount = queue.length;

   // if the fill max is 100
   if ( callBack ) callBack( isLow, fillCount, currCount );
};


// On Login (Online), 
VoucherCodeManager.fillQueue = function( userName, fillCount, callBack )
{ 
   if ( !callBack ) callBack = function() {};

   if ( fillCount > 0 )
   {
      // create a fake service?  just DWS service..
      var loadingTag = undefined;

      // If FHIR does not have INFO.practitionerId loaded, try it again..
      if ( VoucherCodeManager.isStoredType_FHIR && !INFO.practitionerId ) setTimeout( () => { console.log( 'Current User Practitioner Resource is not available - during VoucherCode FillQueue processing.' ); callBack( false, [] ); }, 1000 );
      else
      {
         var dataJson = {};

         if ( VoucherCodeManager.isStoredType_FHIR ) dataJson = { practitionerId: INFO.practitionerId, practitionerDisplay: userName, counts: fillCount, option: { basicAuth: WsCallManager.requestBasicAuth_FHIR } };
         else dataJson = { taken_by: userName, counts: fillCount };

         WsCallManager.requestPostDws( VoucherCodeManager.settingData.url_vcGet, dataJson, loadingTag, function( success, returnJson ) 
         {
            if ( success && returnJson && returnJson.vouchersTaken )
            {
               var queue = VoucherCodeManager.getQueue_Full();
   
               var newListObj = VoucherCodeManager.getQueueObj_fromVcList( returnJson.vouchersTaken );
   
               Util.mergeArrays( queue, newListObj );
   
               PersisDataLSManager.updateVoucherCodes_queue( queue );
               
               callBack( true, newListObj );
            }
            else callBack( false, [] );
         });
      }
   }
   else callBack( false, [] );
};


VoucherCodeManager.getQueueObj_fromVcList = function( vcList )
{
   var newListObj = [];

   var storedTypeVal = ( VoucherCodeManager.isStoredType_FHIR ) ? VoucherCodeManager.StoredType_FHIR: VoucherCodeManager.StoredType_MONGO;

   vcList.forEach( vcItem => {
      newListObj.push( { voucherCode: vcItem.code, status: '', ver_no: vcItem.ver_no, storedType: storedTypeVal } );
   });

   return newListObj;
};

// ----------------

// VC USE STEP #1. Use the Voucher Code
VoucherCodeManager.getNextVoucherCode = function()
{
   var vcCode = '';

   if ( VoucherCodeManager.settingData.enable ) // ONLY USE THIS IF voucherCodeService is in use.
   {
      var queue = VoucherCodeManager.getQueue_CurrStoredType();

      var item = VoucherCodeManager.getNotUsed_1stOne( queue );  // This method has extra logic to check if free one is already in use somehow.

      if ( item )
      {
         item.displayed = true;
         vcCode = item.voucherCode;
      } 
      
      VoucherCodeManager.checkLowQueue_Msg();      
   }
   
   return vcCode;
};


// VC USE STEP #2. Mark the Voucher Code with 'InUse' status --> in pending activity with 'v_iss' type
//    - Called in action.js in 'queueActivity'
VoucherCodeManager.markVoucherCode_InQueue = function( activityJson, transType, markStatus )
{
   var voucherCode = '';
   var matchVcItem;

   try
   {
      if ( activityJson && activityJson.transactions && transType && markStatus )
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
         var queue = VoucherCodeManager.getQueue_CurrStoredType();
         for( var i = 0; i < queue.length; i++ )
         {
            var vcItem = queue[i];
      
            if ( vcItem.voucherCode === voucherCode )
            {
               matchVcItem = vcItem;
               VoucherCodeManager.markStaus( vcItem.voucherCode, markStatus );  //'InUse';
               break;
            }
         }
      }   
   }
   catch( errMsg ) { console.log( 'ERROR in VoucherCodeManager.markVoucherCode_InQueue, ' + errMsg ); }

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

         if ( item.voucherCode && !item.status && VoucherCodeManager.isCurrStoredType( item ) )
         {
            //             
            // But if there is voucher in use, mark the status...  <-- 'InUse' vs 'Used? AlreadyUsed?'
            if ( ActivityDataManager.isVoucherCodeUsed( item.voucherCode ) )
            {
               // If the current voucherCode 
               VoucherCodeManager.markStaus( item.voucherCode, VoucherCodeManager.STATUS_Used );
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


VoucherCodeManager.markStaus = function( voucherCode, status )
{
   VoucherCodeManager.updateVoucherInQueue( voucherCode, function( vcItem ) {
      vcItem.status = status;
      vcItem.markDate = new Date().toISOString();
   });
};

// When unsynced activity is removed/rolled back, unMark the voucherCode..
VoucherCodeManager.unMarkStaus = function( voucherCode )
{
   VoucherCodeManager.updateVoucherInQueue( voucherCode, function( vcItem ) {
      if ( vcItem.status ) vcItem.status = "";
      if ( vcItem.markDate ) delete vcItem.markDate;
   });
};


VoucherCodeManager.updateVoucherInQueue = function( voucherCode, updateFunc )
{
   var queue = VoucherCodeManager.getQueue_Full(); // Since we are replacing entire queue, get full list regardless of type.

   queue.filter( item => ( item.voucherCode === voucherCode && VoucherCodeManager.isCurrStoredType( item ) ) ).forEach( vcItem => updateFunc( vcItem ) );

   PersisDataLSManager.updateVoucherCodes_queue( queue );
};

// -----------------
// --- Stored Type Related

// Use this, so that the default returns 'MONGO' as 'storedType'
VoucherCodeManager.getItemStoredType = function( item )
{
   return ( item.storedType === VoucherCodeManager.StoredType_FHIR ) ? VoucherCodeManager.StoredType_FHIR: VoucherCodeManager.StoredType_MONGO;
};

VoucherCodeManager.isCurrStoredType = function ( item )
{
   return ( VoucherCodeManager.getItemStoredType( item ) === VoucherCodeManager.settingData.storedType );
};


VoucherCodeManager.getQueue_CurrStoredType = function()
{
   var queue = PersisDataLSManager.getVoucherCodes_queue();
   return queue.filter( item => VoucherCodeManager.isCurrStoredType( item ) );
};

VoucherCodeManager.getQueue_Full = function()
{
   return PersisDataLSManager.getVoucherCodes_queue();
};
