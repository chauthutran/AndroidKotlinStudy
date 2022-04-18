// -------------------------------------------
// -- ActivitySyncUtil Class/Methods

function ActivitySyncUtil() {}

ActivitySyncUtil.coolDownMoveRate = 300; // 100 would move 10 times per sec..


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


ActivitySyncUtil.setSyncIconClickEvent_ClientCard = function( divSyncIconTag, cardDivTag, activityIdArr )
{
	divSyncIconTag.off( 'click' ).on( 'click', function( e ) 
	{
		e.stopPropagation();


		Util.callAfterEach( 0, activityIdArr, function( item, idx, continueCallBack ) {
			// each item calling..
			ActivitySyncUtil.clickSyncActivity( divSyncIconTag, cardDivTag, item, { clientCard: true, continueCallBack: continueCallBack } );
		}); //, function( idx ) {  // finihsed - with all or last one  });
	});
};


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
		if ( options.syncDisabled )
		{
			if ( options.syncDisabledMsg ) MsgManager.msgAreaShow( options.syncDisabledMsg );

			if ( options.continueCallBack ) options.continueCallBack();  // END POINT
		}
		else
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
				// Main SyncUp Processing --> Calls 'activityCard.performSyncUp' eventually.
				ActivitySyncUtil.syncUpActivity_IfOnline( activityId, function() 
				{
					if ( options.continueCallBack ) options.continueCallBack();  // END POINT

					ActivitySyncUtil.clientActivityList_FavListReload( cardDivTag );
				}, 
				function() { 
					if ( options.continueCallBack ) options.continueCallBack();  // END POINT					

					MsgManager.msgAreaShow( 'Sync is not available with offline AppMode..' ); // TODO: should be called only once?  or discontinue the process..
				});
			});
		}
	}  
	else if ( statusVal === Constants.status_processing ) 
	{ 
		if ( options.continueCallBack ) options.continueCallBack();  // END POINT
	}
	else
	{
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

		if ( options.continueCallBack ) options.continueCallBack();  // END POINT
	}	
};


// NEW - If current div card belongs to clientDetail Activity List, reload the favList..
ActivitySyncUtil.clientActivityList_FavListReload = function( cardDivTag )
{
	var tabClientActivitiesTag_Visible = cardDivTag.closest( 'div[tabbuttonid=tab_clientActivities]:visible' );

	if ( tabClientActivitiesTag_Visible.length > 0 )
	{
		tabClientActivitiesTag_Visible.find( 'div.favReRender' ).click();
	}        
};


ActivitySyncUtil.syncUpActivity_IfOnline = function( activityId, returnFunc, failFunc )
{
	// Main SyncUp Processing --> Calls 'activityCard.performSyncUp' eventually.
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
		divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Error' );
		imgIcon.attr( 'src', 'images/sync-error_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-error_36.svg)' );
	}

	divSyncIconTag.append( imgIcon );
	FormUtil.rotateTag( divSyncIconTag, bRotating );

	return bRotating;
};


ActivitySyncUtil.displayStatusLabelIcon_ClientCard = function( client )
{	
	var bRotating = false;
	var isAllSynced = true;
	var clientId = client._id;

	var divSyncIconTag = $( 'div.activityStatusIcon[clientId="' + clientId + '"]' );
	var divSyncStatusTextTag = $( 'div.activityStatusText[clientId="' + clientId + '"]' );

	divSyncIconTag.empty();
	divSyncStatusTextTag.empty();

	var imgIcon = $( '<img>' );

	for ( var i = 0; i < client.activities.length; i++ )
	{
		var act = client.activities[i];
		var status = ActivityDataManager.getActivityStatus( act );

		if ( status === Constants.status_processing )
		{
			divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Processing' ).attr( 'term', 'activitycard_status_processing' );
			imgIcon.attr( 'src', 'images/sync-pending_36.svg' );		
			bRotating = true;	
			isAllSynced = false;
			break;
		}
		else if ( SyncManagerNew.statusSyncable( status ) )
		{
			divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Pending' ).attr( 'term', 'activitycard_status_pending' );
			imgIcon.attr( 'src', 'images/sync-pending_36.svg' );
			isAllSynced = false;
			break;
		}
	}

	if ( isAllSynced ) // 'Error' one is also considered Nothing to Sync
	{
		divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync' ).attr( 'term', 'activitycard_status_sync' );
		imgIcon.attr( 'src', 'images/sync.svg' );		
	}

	divSyncIconTag.append( imgIcon );
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

