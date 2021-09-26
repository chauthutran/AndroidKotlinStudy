// -------------------------------------------
// -- ActivitySyncUtil Class/Methods

function ActivitySyncUtil() {}

ActivitySyncUtil.coolDownMoveRate = 300; // 100 would move 10 times per sec..


// ==== Methods ======================

ActivitySyncUtil.setSyncIconClickEvent = function( divSyncIconTag, cardDivTag, activityId )
{
	divSyncIconTag.off( 'click' ).on( 'click', function( e ) 
	{
		// This could be called again after activityJson/status is changed, thus, get everything again from activityId
		e.stopPropagation();  // Stops calling parent tags event calls..

		var activityJson = ActivityDataManager.getActivityById( activityId );
		var statusVal = ( activityJson.processing ) ? activityJson.processing.status: '';
		
		// NOTE:
		//  - If status is not syncable one, display bottom message
		//  - If offline, display the message about it.
		if ( SyncManagerNew.isSyncReadyStatus( statusVal ) )
		{
			// If Sync Btn is clicked while in coolDown mode, display msg...  Should be changed..
			ActivityDataManager.checkActivityCoolDown( activityId, function( timeRemainMs )
			{         
				// Display Left Msg <-- Do not need if?                          
				var leftSec = UtilDate.getSecFromMiliSec( timeRemainMs );
				var coolTime = UtilDate.getSecFromMiliSec( ConfigManager.coolDownTime );
				MsgManager.msgAreaShow( '<span term="' + ConfigManager.getSettingsTermId( "coolDownMsgTerm" ) + '">In coolDown mode, left: </span>' + '<span>' + leftSec + 's / ' + coolTime + 's' + '</span>' ); 

			}, function() 
			{
				// Main SyncUp Processing --> Calls 'activityCard.performSyncUp' eventually.
				ActivitySyncUtil.syncUpActivity_IfOnline( activityId, function() {}
				, function() {
					MsgManager.msgAreaShow( 'Sync is not available with offline AppMode..' );
				} );
			});
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
		}
	});  
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

			
            // If the SyncUp is in Cooldown time range, display the FadeIn UI with left time
            if ( SyncManagerNew.isSyncReadyStatus( statusVal ) ) ActivitySyncUtil.syncUpCoolDownTime_CheckNProgressSet( activityId, divSyncIconTag );
        }
    }
};


ActivitySyncUtil.displayStatusLabelIcon = function( divSyncIconTag, divSyncStatusTextTag, statusVal )
{
	// reset..
	divSyncIconTag.empty();
	divSyncStatusTextTag.empty();

	var imgIcon = $( '<img>' );

	if ( statusVal === Constants.status_submit )        
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
		FormUtil.rotateTag( divSyncIconTag, true );
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

