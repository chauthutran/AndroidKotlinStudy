// -------------------------------------------
// -- ActivitySyncUtil Class/Methods

function ActivitySyncUtil() {}

ActivitySyncUtil.coolDownMoveRate = 300; // 100 would move 10 times per sec..

//ActivitySyncUtil.clientSyncStatus = {};  // Add clientId if in process - of client level sync

// ==== Methods ======================

ActivitySyncUtil.setSyncIconClickEvent = function( divSyncIconTag, cardDivTag, activityId, options )
{
	divSyncIconTag.off( 'click' ).on( 'click', function( e ) 
	{
		// This could be called again after activityJson/status is changed, thus, get everything again from activityId
		e.stopPropagation();  // Stops calling parent tags event calls..

		ActivitySyncUtil.clickSyncActivity( divSyncIconTag, cardDivTag, activityId, options );
	});
};


// =======  ActivityCard Version of Sync Click =========================
ActivitySyncUtil.clickSyncActivity = function( divSyncIconTag, cardDivTag, activityId, options )
{
	var activityJson = ActivityDataManager.getActivityById( activityId );
	var statusVal = ( activityJson.processing ) ? activityJson.processing.status: '';

	if ( !options ) options = {};

	// NOTE:
	//  - If status is not syncable one, display bottom message
	//  - If offline, display the message about it.
	if ( SyncManagerNew.isSyncReadyStatus( statusVal ) )
	{
		// If Sync Btn is clicked while in coolDown mode, display msg...  Should be changed..
		ActivityDataManager.checkActivityCoolDown( activityId, function( timeRemainMs )
		{      
			if ( !options.clientCard )
			{
				// Display Left Msg <-- Do not need if?                          
				var leftSec = UtilDate.getSecFromMiliSec( timeRemainMs );
				var coolTime = UtilDate.getSecFromMiliSec( ConfigManager.coolDownTime );
				MsgManager.msgAreaShow( '<span term="' + ConfigManager.getSettingsTermId( "coolDownMsgTerm" ) + '">In coolDown mode, left: </span>' + '<span>' + leftSec + 's / ' + coolTime + 's' + '</span>' ); 
			}
		},
		function() 
		{
			// If the 'sync' click is from client activity list, click on client level sync ( if enabled.. )
			if ( options.clientSync ) cardDivTag.closest( 'div.card.client' ).find( 'div.clientContainer.card__container' ).find( 'div.activityStatusIcon[clientid]' ).click();
			else
			{
				// Main SyncUp Processing --> Calls 'SyncManagerNew.performSyncUp_Activity' eventually.
				ActivitySyncUtil.syncUpActivity_IfOnline( activityId, function( syncReadyJson, success, responseJson, newStatus ) 
				{
					ActivitySyncUtil.clientActivityList_FavListReload( cardDivTag );

					if ( options.resultJson && newStatus ) 
					{
						if ( options.resultJson[ newStatus ] === undefined ) options.resultJson[ newStatus ] = 1;
						else options.resultJson[ newStatus ]++;
					}

					if ( options.nextCall ) options.nextCall();  // END POINT
				}, 
				function() // failed case..
				{ 
					MsgManager.msgAreaShow( 'Sync is not available with offline AppMode..' ); // TODO: should be called only once?  or discontinue the process..

					if ( options.nextCall ) options.nextCall();  // END POINT
				});
			}
		});
	}
	else if ( statusVal === Constants.status_processing ) 
	{ 
		if ( options.nextCall ) options.nextCall();  // END POINT
	}
	else
	{
		// If status is not syncable one, display the summary as bottom msg section - ONLY for activity ('detailViewCase')
		if ( !divSyncIconTag.hasClass( 'detailViewCase' ) )
		{
			// Display the popup
			SyncManagerNew.bottomMsgShow( statusVal, activityJson, cardDivTag );
	
			// NOTE: STATUS CHANGED!!!!
			// If submitted with msg one, mark it as 'read' and rerender the activity Div.
			if ( statusVal === Constants.status_submit_wMsg )        
			{
				// TODO: Should create a history...
				ActivityDataManager.activityUpdate_Status( activityId, Constants.status_submit_wMsgRead );                        
			}
		}

		if ( options.nextCall ) options.nextCall();  // END POINT
	}	
};


// =======  ClientCard Version of Sync Click =========================
ActivitySyncUtil.setSyncIconClickEvent_ClientCard = function( divSyncIconTag, cardDivTag, option ) //, activityIdArr )
{
	divSyncIconTag.off( 'click' ).on( 'click', function( e ) 
	{
		e.stopPropagation();

		var thisSyncIconTag = $( this );

		// Block the client level double clicking/Processing...
		//		- Since we do not want diff parallel client activities 
		var clientId = thisSyncIconTag.attr( 'clientid' );
		var clientStatusStr = thisSyncIconTag.attr( 'status' );

		if ( !clientId ) MsgManager.msgAreaShow( 'ClientCard is not marked with clientId.', 'ERROR' );
		else
		{
			// Only if the clientId exists (proper clientCard), and in syncable status (not in processing or not in synced)
			// if ( clientStatusStr === Constants.status_queued )
			if ( SyncManagerNew.isSyncReadyStatus( clientStatusStr ) )			
			{
				// NOTE: This could be Duplicate - on top of checking UI status Above			
				//if ( ActivitySyncUtil.clientSyncStatus[ clientId ] )
				//{
				//	MsgManager.msgAreaShow( 'Client is already in sync processing.' );
				//}
				//else
				//{
					//ActivitySyncUtil.clientSyncStatus[ clientId ] = true;

					// Get unsynced list..
					var clientJson = ClientDataManager.getClientById( clientId );
					var activityIdArr_unsynced = ClientCard.getUnsyncedActivities( clientJson ).map( act => act.id );
					var resultJson = {};

					Util.callAfterEach( 0, activityIdArr_unsynced, resultJson, function( item, idx, nextCall ) {
						// each item calling..
						ActivitySyncUtil.clickSyncActivity( divSyncIconTag, cardDivTag, item, { clientCard: true, nextCall: nextCall, resultJson: resultJson } );						
					}, 
					function( idx, resultJson ) 
					{
						// Finish the client call..
						//delete ActivitySyncUtil.clientSyncStatus[ clientId ];

						// If any of activity sync failed, show with bottom msg..
						if ( resultJson[ Constants.status_failed ] > 0 || resultJson[ Constants.status_error ] > 0 ) ActivitySyncUtil.clientSyncBottomMsg( cardDivTag, clientId );
					});		
				//}
			}
			else
			{
				ActivitySyncUtil.clientSyncBottomMsg( cardDivTag, clientId );
			}
		}
	});
};


// ===============================================
// ---- NOT RELATED to activitySync, but more of bottom section msg?


ActivitySyncUtil.clientSyncBottomMsg = function( cardDivTag, clientId )
{
	// Display the bottom layered area msg.
	SyncManagerNew.bottomMsgShow( undefined, undefined, cardDivTag, function( divBottomTag ) 
	{
		// Most recent activity: [2022-05-15 03:15pm] ERROR - error msg...
		// Activities Summary: total 4 activities with 0 errors, 1 fails..
		var clientJson = ClientDataManager.getClientById( clientId );

		// 'confirmClients' activities link show
		ActivitySyncUtil.confirmClients_Activities( clientJson.activities, clientId, divBottomTag );

		// 2 info display - recent activity, summary.
		var recentActivityMsg = ActivitySyncUtil.getSummaryMsg_recentActivity( clientJson.activities );  //'[2022-05-15 03:15pm] ERROR - error msg';
		var activitySummaryMsg = ActivitySyncUtil.getSummaryMsg_activities( clientJson.activities ); //'total 4 activities with 0 errors, 1 fails';

		if ( recentActivityMsg ) SyncManagerNew.bottomMsg_sectionRowAdd( divBottomTag, 'Most recent activity', recentActivityMsg );
		if ( activitySummaryMsg ) SyncManagerNew.bottomMsg_sectionRowAdd( divBottomTag, 'Activity summary', activitySummaryMsg, { sectionMarginTop: '12px' } );
	});
};


ActivitySyncUtil.confirmClients_Activities = function( activities, clientId, divBottomTag )
{
	if ( activities )
	{
		//var bHasConfirmClientsCase = false;
		var actNo = 0;
		var confirmClientsDivTag = $( '<div style="margin: 8px 2px 10px 2px; padding: 4px; border: 1px solid lightBlue; background-color: cornsilk;"><div style="font-size: 14px; color: tomato;">Confirmation Required:</div></div>' );

		activities.forEach( act => 
		{
			if ( act.confirmClients && act.confirmClients.length > 0 && act.processing.status === Constants.status_error )
			{
				// Display activities to confirm..  Not only recent Activity..  <-- with border line and padding..
				//bHasConfirmClientsCase = true;
				actNo++;

				var activityTag = $( '<div style="margin: 3px 0px 0px 8px;"></div>' );

				var transTypes = act.transactions.map( trans => ( trans.type ) ? trans.type: '' ).join( ', ' );

				// 1. Add createdDate, transTypes, status, # of clients choice..  <-- but can decide to go with new client?
				var actInfoStr = 'ACT#' + actNo + ': [Created] ' + Util.getStr( act.date.createdLoc ) + ', [TransTypes] ' + transTypes + ', ' + act.confirmClients.length + ' Clients';
				var actInfoTag = $( '<div style="font-size: 14px; cursor: pointer; color: #333;"></div>' ).text( actInfoStr ).attr( 'title', 'Click to select client' );
				activityTag.append( actInfoTag );

				var hiddenClientListDivTag = $( '<div style="display: none; margin: 2px 0px 0px 7px;"></div>' );

				var radioName = 'cConfirm_' + act.id;

				act.confirmClients.forEach( cClient => 
				{
					var cStr = Util.getStr( cClient.clientDetails.firstName ) + ' ' + Util.getStr( cClient.clientDetails.lastName ) + ', ' + Util.getStr( cClient.clientDetails.age ) + ', Created: ' + cClient.date.createdLoc + ', id: ' + cClient._id;
					var cTag = $( '<div style="font-size: 13px; padding: 3px;"><input type="radio" name="' + radioName + '" value="' + cClient._id + '" style="width: unset;"><span class="cTitle"></span></div>' );
					cTag.find( '.cTitle' ).text( cStr );

					hiddenClientListDivTag.append( cTag );					
				});
				var newCTag = $( '<div style="font-size: 13px; padding: 3px;"><input type="radio" name="' + radioName + '" value="newClient" style="width: unset;"><span class="cTitle">New Client</span></div>' );
				var btnCConfirmTag = $( '<div style="font-size: 13px; padding: 3px;"><button class="btnCConfirm cbtn c_cb">Confirm</button></div>' );
				
				hiddenClientListDivTag.append( newCTag );					
				hiddenClientListDivTag.append( btnCConfirmTag );					
				
				// TODO: Add Confirm button => execute the activityEdit create and remove this list.. + undo?
				//   + add radio button with next line layer..
				// on click, confirm + create the activityEdit of existing activity (of the recentActivity).. <-- with search by this id..

				actInfoTag.click( function( e ) {  hiddenClientListDivTag.toggle();  });
				btnCConfirmTag.click( function( e ) 
				{
					var radioVal = $( 'input[name="' + radioName + '"]:checked' ).val();

					// Get the selected radio button..
					if ( !radioVal ) alert( 'Confirm client is not selected, yet!' );
					else
					{
						var reply = confirm( 'This client, ' + radioVal + ', identifies the desired client definitely?' );
						if ( reply === true ) 
						{
							// Create 'editActivity' payload & process it.
							ActivitySyncUtil.editActivity_confirmClient( act, clientId, radioVal, function() 
							{							
								// Update the client status..
								ClientCard.reRenderClientCardsById( clientId );

								// Hide the confirm client section..
								confirmClientsDivTag.remove();
							});
						}
					}
				});

				activityTag.append( hiddenClientListDivTag );

				// 2. Add event to display list of clients as choice..
				confirmClientsDivTag.append( activityTag );
			}
		});

		if ( actNo > 0 )
		{
			// NEW: If the most recent acivity has 'error' and confirmClients data, list those clients..  <-- selectable events to be implemented later time.
			divBottomTag.append( confirmClientsDivTag );
		}
	}
};

ActivitySyncUtil.editActivity_confirmClient = function( act, clientId, clientChoice, callBack )
{
	var actClone = Util.cloneJson( act );
	if ( actClone.confirmClients ) delete actClone.confirmClients;
	if ( actClone.processing ) delete actClone.processing;
	
	var data = { activityPayload: { searchValues: {}, captureValues: actClone } };

	// Fill 'searchValues' & clientId
	if ( clientChoice === 'newClient' ) data.activityPayload.searchValues.newClientCase = true;
	else 
	{
		data.currTempClientId = clientId;
		data.clientId = clientChoice;
		data.activityPayload.searchValues._id = clientChoice;
		// NOTE: we need to change the 'c_reg' transaction to 'c_upd'
		ActivityDataManager.replaceTransType( actClone, 'c_reg', 'c_upd' );
		ActivityDataManager.replaceTransType( act, 'c_reg', 'c_upd' );  // Also change original since this will be backed up and we like to have this affected.

		data.editActivityId = act.id;  // flag to send to methods 'generateActivityPayloadJson' for existing activity edit case.
	}

	JobAidHelper.submitActivity( data, function( client, activity ) {
		// console.log( client ); // console.log( activity );
		if ( callBack ) callBack();
	});

};

ActivitySyncUtil.getSummaryMsg_recentActivity = function( activities )
{
	var msgStr = '';

	if ( activities && activities.length > 0 )
	{
		var recentActivity = ActivityDataManager.getLastActivity( activities );

		if ( recentActivity )
		{
			var dateTimeStr = UtilDate.formatDate( recentActivity.date.createdLoc, 'yyyy-MM-dd HH:mm' );
			var statusStr = recentActivity.processing.status;
			//.toUpperCase();
			var statusMsg = '';

			var historyList = recentActivity.processing.history;
			if ( historyList.length > 0 )
			{
				var latestItem = historyList[ historyList.length - 1];    
				statusMsg = SyncManagerNew.getMsgFormatted( latestItem.msg, statusStr );
			}

			msgStr = '[' + dateTimeStr + '] ' + statusStr.toUpperCase() + ' - ' + statusMsg;
		}
	}

	return msgStr;
};


ActivitySyncUtil.getSummaryMsg_activities = function( activities )
{
	var msgStr = '';

	if ( !activities ) activities = [];

	// '4 activities in total - has 0 errors, 1 fails';
	var totalCount = activities.length;
	var errorList = activities.filter( act => ActivityDataManager.getActivityStatus( act ) === Constants.status_error );
	var failedList = activities.filter( act => ActivityDataManager.getActivityStatus( act ) === Constants.status_failed );

	msgStr = totalCount + ' activities in total - has ' + errorList.length + ' errors, ' + failedList.length + ' fails';
		
	return msgStr;
};


// ---------------------------------------------

// NEW - If current div card belongs to clientDetail Activity List, reload the favList..
ActivitySyncUtil.clientActivityList_FavListReload = function( cardDivTag )
{
	if ( cardDivTag && cardDivTag.length > 0 )
	{
		var tabClientActivitiesTag_Visible = cardDivTag.closest( 'div[tabbuttonid=tab_clientActivities]:visible' );

		if ( tabClientActivitiesTag_Visible.length > 0 ) tabClientActivitiesTag_Visible.find( 'div.favReRender' ).click();	
	}
};


ActivitySyncUtil.syncUpActivity_IfOnline = function( activityId, returnFunc, failFunc )
{
	// Main SyncUp Processing --> Calls 'SyncManagerNew.performSyncUp_Activity' eventually.
	if ( ConnManagerNew.isAppMode_Online() ) SyncManagerNew.syncUpActivity( activityId, undefined, returnFunc );
	else
	{
		if ( failFunc ) failFunc();
	}
};


// ==== Methods ======================
ActivitySyncUtil.displayActivitySyncStatus = function( activityId )
{
    if ( activityId )
    {
        var activityJson = ActivityDataManager.getActivityById( activityId );

        if ( activityJson )
        {
            var divSyncIconTag = $( 'div.activityStatusIcon[activityId="' + activityId + '"]' );
            var divSyncStatusTextTag = $( 'div.activityStatusText[activityId="' + activityId + '"]' );
            
            var statusVal = ( activityJson && activityJson.processing ) ? activityJson.processing.status: '';
        
				ActivitySyncUtil.displayStatusLabelIcon( divSyncIconTag, divSyncStatusTextTag, statusVal );
	
				// NEW - Update Client Sync Status - for each activity status update.
				if ( ConfigManager.isClientSync_ClientLevel() ) 
				{
					var client = ClientDataManager.getClientByActivityId( activityId );	
					ActivitySyncUtil.displayStatusLabelIcon_ClientCard( client );
				}

            // If the SyncUp is in Cooldown time range, display the FadeIn UI with left time
            if ( SyncManagerNew.isSyncReadyStatus( statusVal ) ) ActivitySyncUtil.syncUpCoolDownTime_CheckNProgressSet( activityId, divSyncIconTag );
        }
    }
};


ActivitySyncUtil.displayStatusLabelIcon = function( divSyncIconTag, divSyncStatusTextTag, statusVal, statusCustomJson )
{
	var bRotating = false;
	// reset..
	divSyncIconTag.empty();
	divSyncStatusTextTag.empty();

	var imgIcon = $( '<img>' );

	if ( statusVal === Constants.status_custom )        
	{
		if ( !statusCustomJson ) statusCustomJson = {};
		var color = ( statusCustomJson.color ) ? statusCustomJson.color: '#2aad5c';

		divSyncStatusTextTag.css( 'color', color ).html( statusCustomJson.text ).attr( 'term', statusCustomJson.term );

		var imgSrc = '';
		if ( statusCustomJson.img ) imgSrc = 'images/' + statusCustomJson.img;
		else if ( statusCustomJson.imgFull ) imgSrc = statusCustomJson.imgFull;
		
		imgIcon.attr( 'src', imgSrc );
	}
	else if ( statusVal === Constants.status_submit )        
	{
		// already sync..
		divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync' ).attr( 'term', 'activitycard_status_sync' );
		imgIcon.attr( 'src', 'images/sync.svg' ); //sync.svg //divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
	}
	else if ( statusVal === Constants.status_submit_wMsg )        
	{
		// already sync..
		divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync/Msg*' );
		imgIcon.attr( 'src', 'images/sync_msd.svg' ); 
	}
	else if ( statusVal === Constants.status_submit_wMsgRead )        
	{
		// already sync..
		divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync/Msg' );
		imgIcon.attr( 'src', 'images/sync_msdr.svg' );
	}
	else if ( statusVal === Constants.status_downloaded )        
	{
		// already sync..
		divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Downloaded' ).attr( 'term', 'activitycard_status_downloaded' );
		imgIcon.attr( 'src', 'images/sync.svg' ); //sync.svg //divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
	}
	else if ( statusVal === Constants.status_queued )
	{
		divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Pending' ).attr( 'term', 'activitycard_status_pending' );
		imgIcon.attr( 'src', 'images/sync-pending_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-pending_36.svg)' );
	}
	else if ( statusVal === Constants.status_processing )
	{
		divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Processing' ).attr( 'term', 'activitycard_status_processing' );
		imgIcon.attr( 'src', 'images/sync-pending_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-pending_36.svg)' );    

		// NOTE: We are rotating if in 'processing' status!!!
		bRotating = true;
	}        
	else if ( statusVal === Constants.status_failed )
	{
		// Not closed status, yet
		divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Failed' ).attr( 'term', 'activitycard_status_failed' );
		imgIcon.attr( 'src', 'images/sync-postponed_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-postponed_36.svg)' );
	}
	else if ( statusVal === Constants.status_error )
	{
		divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Error' ).attr( 'term', 'activitycard_status_error' );
		imgIcon.attr( 'src', 'images/sync-error_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-error_36.svg)' );
	}

	divSyncIconTag.append( imgIcon );
	FormUtil.rotateTag( divSyncIconTag, bRotating );

	return bRotating;
};


ActivitySyncUtil.displayStatusLabelIcon_ClientCard = function( client )
{	
	var color_error = 'tomato';
	var color_failed = 'darksalmon';
	
	var bRotating = false;
	var clientId = client._id;

	var divSyncIconTag = $( 'div.activityStatusIcon[clientId="' + clientId + '"]' );
	var divSyncStatusTextTag = $( 'div.activityStatusText[clientId="' + clientId + '"]' );

	divSyncIconTag.empty().attr( 'status', '' ).attr( 'title', '' ).append( '<img class="clientSyncIconImg">' ); //.css( 'border', 'none' );  // unset (vs none)
	divSyncStatusTextTag.empty().attr( 'status', '' );

	var imgIcon = divSyncIconTag.find( 'img.clientSyncIconImg' );


	// '*' with hover detail text: failed / errored count
	var failedList = client.activities.filter( act => ActivityDataManager.getActivityStatus( act ) === Constants.status_failed );
	if ( failedList.length > 0 ) divSyncStatusTextTag.append( '<span title="' + failedList.length + ' failed" style="font-weight: bold; color: ' + color_failed + '; padding-right: 3px;">*</span>' );

	var erroredList = client.activities.filter( act => ActivityDataManager.getActivityStatus( act ) === Constants.status_error );
	if ( erroredList.length > 0 ) divSyncStatusTextTag.append( '<span title="' + erroredList.length + ' errored" style="font-weight: bold; color: ' + color_error + '; padding-right: 3px;">*</span>' );
	

	// Sync Status Title & Icon
	// 'Processing' vs 'Pending'('Failed') vs 'Synced'('Error')
	if ( client.activities.filter( act => ActivityDataManager.getActivityStatus( act ) === Constants.status_processing ).length > 0 ) 
	{
		divSyncStatusTextTag.attr( 'status', Constants.status_processing ).append( '<span class="spanStatusTxt" term="activitycard_status_processing" style="color: #B1B1B1;">Processing</span>' );
		imgIcon.attr( 'src', 'images/sync-pending_36.svg' );		
		divSyncIconTag.attr( 'status', Constants.status_processing );
		bRotating = true;	
	}
	else if ( client.activities.filter( act => SyncManagerNew.statusSyncable( ActivityDataManager.getActivityStatus( act ) ) ).length > 0 ) 
	{
		divSyncStatusTextTag.attr( 'status', Constants.status_queued ).append( '<span class="spanStatusTxt" term="activitycard_status_pending" style="color: #B1B1B1;">Pending</span>' );
		imgIcon.attr( 'src', 'images/sync-pending_36.svg' );
		divSyncIconTag.attr( 'status', Constants.status_queued );
	}
	else
	{
		divSyncStatusTextTag.attr( 'status', Constants.status_submit ).append( '<span class="spanStatusTxt" term="activitycard_status_sync" style="color: #2aad5c;">Sync</span>' );
		imgIcon.attr( 'src', 'images/sync.svg' );
		divSyncIconTag.attr( 'status', Constants.status_submit );
	}


	// If last one is 'failed' or 'errored' status, show that status instead..
	var lastActivity = ActivityDataManager.getLastActivity( client.activities );
	var lastActStatus = ActivityDataManager.getActivityStatus( lastActivity );

	if ( lastActStatus === Constants.status_error ) 
	{
		divSyncStatusTextTag.find( 'span.spanStatusTxt').remove();
		divSyncStatusTextTag.attr( 'status', Constants.status_error ).append( '<span class="spanStatusTxt" term="activitycard_status_error" style="color: #FF0000;">Error</span>' );
		imgIcon.attr( 'src', 'images/sync-error_36.svg' );
		divSyncIconTag.attr( 'status', Constants.status_error ).attr( 'title', 'Last Activity Status: ' + lastActStatus.toUpperCase() );
	}
	else if ( lastActStatus === Constants.status_failed ) 
	{
		divSyncStatusTextTag.find( 'span.spanStatusTxt').remove();		
		divSyncStatusTextTag.attr( 'status', Constants.status_failed ).append( '<span class="spanStatusTxt" term="activitycard_status_failed" style="color: #FF0000;">Failed</span>' );
		imgIcon.attr( 'src', 'images/sync-postponed_36.svg' );
		divSyncIconTag.attr( 'status', Constants.status_failed ).attr( 'title', 'Last Activity Status: ' + lastActStatus.toUpperCase() );

		ActivitySyncUtil.syncUpCoolDownTime_CheckNProgressSet( lastActivity.id, divSyncIconTag );
	}
	//if ( lastActStatus === Constants.status_error ) imgIcon.css( 'background-color', color_error );


	FormUtil.rotateTag( divSyncIconTag, bRotating );
};


// -----------------------------------------

// SHOULD BE OBSOLETE
ActivitySyncUtil.getSyncButtonDivTag = function( activityId )
{
	return $( 'div.activityStatusIcon[activityId="' + activityId + '"]' );
};


// ----------------------------------------------
// -- CoolDown 
ActivitySyncUtil.syncUpCoolDownTime_CheckNProgressSet = function( activityId, syncIconDivTag )
{
	// Unwrap previous one 1st..
	ActivitySyncUtil.clearCoolDownWrap( syncIconDivTag );

	ActivityDataManager.checkActivityCoolDown( activityId, function( timeRemainMs ) 
	{            
		if ( syncIconDivTag.length > 0 && timeRemainMs > 0 )
		{
			// New one can be called here..
			ActivitySyncUtil.syncUpCoolDownTime_disableUI2( activityId, syncIconDivTag, timeRemainMs );
		}
	});
};

ActivitySyncUtil.syncUpCoolDownTime_disableUI = function( activityId, syncIconDivTag, timeRemainMs )
{
	ActivityDataManager.clearSyncUpCoolDown_TimeOutId( activityId );

	syncIconDivTag.addClass( 'syncUpCoolDown' );

	var timeOutId = setTimeout( function() {

		// TODO: This sometimes does not work - if the tag is re-rendered..  <-- get class instead..
		syncIconDivTag.removeClass( 'syncUpCoolDown' );
	}, timeRemainMs );

	ActivityDataManager.setSyncUpCoolDown_TimeOutId( activityId, timeOutId );
};


ActivitySyncUtil.syncUpCoolDownTime_disableUI2 = function( activityId, syncIconDivTag, timeRemainMs )
{
	// Set CoolDown UI (Tags) & related valriable for 'interval' to use.

	syncIconDivTag.addClass( 'syncUpCoolDown' );
	var imgTag = syncIconDivTag.find( 'img' );
	imgTag.wrap( '<div class="myBar" style="position: absolute; background-color: lightGray;"></div>' );

	var myBarTag = syncIconDivTag.find( '.myBar' );        
	var fullWidthSize = syncIconDivTag.width();
	var coolDownTime = ConfigManager.coolDownTime;
	
	myBarTag.width( ActivitySyncUtil.getPercentageWidth( timeRemainMs, coolDownTime, fullWidthSize ) );


	// Interval..
	var intervalId = setInterval( function() 
	{
		var myBarTag = syncIconDivTag.find( '.myBar' );

		if ( myBarTag.length === 0 ) 
		{
			clearInterval( intervalId );
			syncIconDivTag.removeClass( 'syncUpCoolDown' );
		} 
		else
		{
			timeRemainMs -= ActivitySyncUtil.coolDownMoveRate;
			
			if ( timeRemainMs <= 0 ) // or check perc..
			{
				clearInterval( intervalId );
				ActivitySyncUtil.clearCoolDownWrap( syncIconDivTag ); // imgTag.unwrap();
			}
			else 
			{
				// if ( ConfigManager.coolDownTimeOverride ) // NOT IMPLEMENTED, YET
				myBarTag.width( ActivitySyncUtil.getPercentageWidth( timeRemainMs, coolDownTime, fullWidthSize ) );
			}
		}

	}, ActivitySyncUtil.coolDownMoveRate );  // update refresh rate
};


// NOTE: Use Div width changes by time..
// http://ww2.cs.fsu.edu/~faizian/cgs3066/resources/Lecture12-Animating%20Elements%20in%20Javascript.pdf
ActivitySyncUtil.clearCoolDownWrap = function( syncIconDivTag ) // pass id instead?  
{
	if ( syncIconDivTag.length > 0 )
	{
		syncIconDivTag.removeClass( 'syncUpCoolDown' );

		var imgTag = syncIconDivTag.find( 'img' );
		if ( imgTag.length > 0 && imgTag.parent( '.myBar' ).length > 0 ) imgTag.unwrap();
	}
};


ActivitySyncUtil.getPercentageWidth = function( timeRemainMs, coolDownTime, fullWidthSize )
{
	var perc = ( timeRemainMs / coolDownTime );
	var width = ( fullWidthSize * perc ).toFixed( 1 );
	//console.log( 'width: ' + width + ', timeRemainMs: ' + timeRemainMs );
	return width;
};

