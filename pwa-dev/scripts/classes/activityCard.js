// -------------------------------------------
// -- ActivityCard Class/Methods
//      - Mainly used for syncManager run one activity item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where activity items are processed (in sync)
//              without being displayed on the app list.  
//
function ActivityCard( activityId, activityCardDivTag, options )
{
	var me = this;

    me.activityId = activityId;
    me.options = ( options ) ? options : {};
    me.activityCardDivTag = activityCardDivTag;

	// =============================================
	// === Initialize Related ========================

    me.initialize = function() { };

    // ----------------------------------------------------

    me.render = function()
    {        
        // #2. replace all me.getActivityCardDivTag()?  At least, check them out!!


        // var activityCardDivTag = me.getActivityCardDivTag();

        var activityCardDivTag = me.activityCardDivTag;

        // If tag has been created), perform render
        if ( activityCardDivTag.length > 0 )
        {
            var activityJson = ActivityDataManager.getActivityById( me.activityId );
            var detailViewCase = ( me.options.detailViewCase ) ? true: false;  // Used for detailed view popup - which reuses 'render' method.

            try
            {
                var activityContainerTag = activityCardDivTag.find( '.activityContainer' );
                var activityTypeIconTag = activityCardDivTag.find( '.activityIcon' );
                var activityContentTag = activityCardDivTag.find( '.activityContent' );
                var activityRerenderTag = activityCardDivTag.find( '.activityRerender' );
                var favIconTag = activityCardDivTag.find( '.favIcon' );
                var activityPhoneCallTag = activityCardDivTag.find( '.activityPhone' );

                // 1. activityType (Icon) display (LEFT SIDE)
                me.activityTypeDisplay( activityTypeIconTag, activityJson );
                me.activityIconClick_displayInfo( activityTypeIconTag, activityJson );


                // 2. previewText/main body display (MIDDLE)
                me.setActivityContentDisplay( activityContentTag, activityJson, me.options );
                if ( !detailViewCase ) me.activityContentClick_FullView( activityContentTag, activityJson.id );


                // 3. 'SyncUp' Button Related
                // click event - for activitySubmit.., icon/text populate..
                me.setupSyncBtn( activityCardDivTag, me.activityId, detailViewCase, me.options );  // clickEnable - not checked for SyncBtn/Icon

                // 4. schedule 'favIcon' action button setup
                ActivityCard.setupFavIconBtn( favIconTag, me.activityId, me.options );

                // 5. 'phoneNumber' action  button setup
                me.setupPhoneCallBtn( activityPhoneCallTag, me.activityId, me.options );

                // 6. clickable rerender setup
                me.setUpReRenderByClick( activityRerenderTag );

            }
            catch( errMsg )
            {
                console.log( 'Error on ActivityCard.render, errMsg: ' + errMsg );
            }
        }
    };

    // -----------------------------------------------------

    me.getActivityCardDivTag = function()
    {
        //if ( me.options.parentTag_Override ) return me.options.parentTag_Override.find( 'div.card[itemid="' + me.activityId + '"]' );            
        return $( 'div.card[itemid="' + me.activityId + '"]' );
    };

    // -----------------------------------------------------

    me.activityIconClick_displayInfo = function( activityIconTag, activityJson )
    {
        activityIconTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            console.log( activityJson );
        });
    };

    me.activityContentClick_FullView = function( activityContentTag, activityId )
    {
        activityContentTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();

            var activityCardDetail = new ActivityCardDetail( activityId );
            activityCardDetail.render();
        });
    };

    
    me.setupSyncBtn = function( activityCardDivTag, activityId, detailViewCase, options )
    {
        var divSyncIconTag = activityCardDivTag.find( '.activityStatusIcon' ).attr( 'activityId', activityId );
        var divSyncStatusTextTag = activityCardDivTag.find( '.activityStatusText' ).attr( 'activityId', activityId );

        // if 'detailView' mode, the bottom message should not show..
        if ( detailViewCase ) divSyncIconTag.addClass( 'detailViewCase' );


        // NOTE: This is setting for this tag only, so might not need to set for others??
        ActivitySyncUtil.displayActivitySyncStatus( activityId );
        
        var syncOptions =  {};
        if ( options.displaySetting === 'clientActivity' && ConfigManager.isClientSync_ClientLevel() )  syncOptions.clientSync = true;

        ActivitySyncUtil.setSyncIconClickEvent( divSyncIconTag, activityCardDivTag, activityId, syncOptions );
    };


    me.setupPhoneCallBtn = function( divPhoneCallTag, activityId, options )
    {
        divPhoneCallTag.empty().hide();

        // If this activityCard is on client detail activityList, hide it/ do not render it.
        if ( options.displaySetting === 'clientActivity' ) { }
        else
        {
            var clientObj = ClientDataManager.getClientByActivityId( activityId );
    
            if ( clientObj.clientDetails && clientObj.clientDetails.phoneNumber )
            {
                var phoneNumber = Util.trim( clientObj.clientDetails.phoneNumber ); // should we define phoneNumber field in config? might change to something else in the future
    
                if ( phoneNumber && phoneNumber !== '+' )
                {
                    var cellphoneTag = $('<img src="images/cellphone.svg" class="phoneCallAction" />');
    
                    cellphoneTag.click( function(e) {
        
                        e.stopPropagation();
        
                        if ( Util.isMobi() )
                        {
                            window.location.href = `tel:${phoneNumber}`;
                        }
                        else
                        {
                            alert( phoneNumber );
                        }
                    });
        
                    divPhoneCallTag.append( cellphoneTag );
                    divPhoneCallTag.show();
                }
            }
        }
    };

    // ------------------------------------------

    me.setUpReRenderByClick = function( activityRerenderTag )
    {
        activityRerenderTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            me.render();
        } );    
    };


    me.setActivityContentDisplay = function( divActivityContentTag, activity, options )
    {
        try
        {
            var activitySettings = ConfigManager.getActivityTypeConfig( activity );

            // Choose to use generic display (Base/Settings) or activity display ones (if available).
            var displayBase = '';
            var displaySettings = [];
                    
            if ( options.displaySetting === 'clientActivity' )
            {
                displayBase = ConfigManager.getClientActivityCardDefDisplayBase();
                displaySettings = ConfigManager.getClientActivityCardDefDisplaySettings();
            }
            else 
            {
                displayBase = ( activitySettings && activitySettings.displayBase ) ? activitySettings.displayBase : ConfigManager.getActivityDisplayBase();
                displaySettings = ( activitySettings && activitySettings.displaySettings ) ? activitySettings.displaySettings : ConfigManager.getActivityDisplaySettings();

                var view = options.viewDef_Selected;
                if ( view )
                {
                    var hasViewDisplayData = false;

                    if ( view.displayBase ) {
                        hasViewDisplayData = true;
                        displayBase = view.displayBase;
                    } 
    
                    if ( view.displaySettings ) {
                        hasViewDisplayData = true;
                        displaySettings = view.displaySettings;
                    }
                }
            }

            InfoDataManager.setINFOdata( 'activity', activity );
            InfoDataManager.setINFOclientByActivity( activity );
    
            FormUtil.setCardContentDisplay( divActivityContentTag, displayBase, displaySettings, Templates.cardContentDivTag );
        }
        catch ( errMsg )
        {
            console.log( 'ERROR in activityCard.setActivityContentDisplay, errMsg: ' + errMsg );
        }
    };

    /* - Replaced by Static Methods..
    me.reRenderActivityDiv = function()
    {
        // There are multiple places presenting same activityId info.
        // We can find them all and reRender their info..
        var activityCardTags = $( 'div.card[itemid="' + me.activityId + '"]' );
        var reRenderClickDivTags = activityCardTags.find( 'div.activityRerender' );   
        
        reRenderClickDivTags.click();
    }
    */


    // -------------------------------
    // --- Display Icon/Content related..
    
    me.syncUpStatusDisplay = function( activityCardDivTag, activityJson )
    {
        try
        {
            // 1. Does it find hte matching status?
            var activitySyncUpStatusConfig = ConfigManager.getActivitySyncUpStatusConfig( activityJson );
            if ( activitySyncUpStatusConfig ) activityCardDivTag.find( '.listItem_statusOption' ).html( activitySyncUpStatusConfig.label );

            me.setActivitySyncUpStatus( activityCardDivTag, activityJson.processing );
        }
        catch( errMsg )
        {
            console.log( 'Error on ActivityCard.syncUpStatusDisplay, errMsg: ' + errMsg );
        }        
    };


    me.activityTypeDisplay = function( activityTypeIconTag, activityJson )
    {
        try
        {
            var activityTypeConfig = ConfigManager.getActivityTypeConfig( activityJson );
    
            // SyncUp icon also gets displayed right below ActivityType (as part of activity type icon..)
            var activitySyncUpStatusConfig = ConfigManager.getActivitySyncUpStatusConfig( activityJson );

            // TODO: Bring this method up from 'formUtil' to 'activityCard'?
            // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)

            FormUtil.appendActivityTypeIcon( activityTypeIconTag
                , activityTypeConfig
                , activitySyncUpStatusConfig
                , undefined
                , undefined
                , activityJson );
                
        }
        catch( errMsg )
        {
            console.log( 'Error on ActivityCard.activityTypeDisplay, errMsg: ' + errMsg );
        }        
    };                

    me.getListPreviewData = function( dataJson, previewConfig )
    { 
        if ( previewConfig )
        {
            var dataRet = $( '<div class="previewData listDataPreview" ></div>' );
        
            for ( var i=0; i< previewConfig.length; i++ ) 
            {
                var dat = me.mergePreviewData( previewConfig[ i ], dataJson );
                dataRet.append ( $( '<div class="listDataItem" >' + dat + '</div>' ) );
            }
        }
        return dataRet;
    };

    
    me.mergePreviewData = function ( previewField, Json )
    {
        var ret = '';
        var flds = previewField.split( ' ' );
        if ( flds.length )
        {
            for ( var f=0; f < flds.length; f++ )
            {
                for ( var key in Json ) 
                {
                    if ( flds[f] == key && Json[ key ] )
                    {
                        ret += flds[ f ] + ' ';
                        ret = ret.replace( flds[f] , Json[ key ] );
                    }
                }
            }
        }
        else
        {
            if ( previewField.length )
            {
                ret = previewField;
                for ( var key in Json ) 
                {
                    if ( previewField == key && Json[ key ] )
                    {
                        ret = ret.replace( previewField , Json[ key ] );
                    }
                }
            }
        }
        return ret;
    };


    me.setActivitySyncUpStatus = function( activityCardDivTag, activityProcessing ) 
    {
        try
        {
            var imgSyncIconTag = activityCardDivTag.find( 'small.syncIcon img' );

            if ( activityProcessing.status === Constants.status_queued )
            {
                imgSyncIconTag.attr ( 'src', 'images/sync-banner.svg' );
            }
            else if ( activityProcessing.status === Constants.status_failed )
            {        
                imgSyncIconTag.attr ( 'src', 'images/sync_error.svg' );
                //imgSyncIconTag.attr ( 'src', 'images/sync-n.svg' );
            }

            imgSyncIconTag.css ( 'transform', '' );
        }
        catch ( errMsg )
        {
            console.log( 'Error on ActivityCard.setActivitySyncUpStatus, errMsg: ' + errMsg );
        }
    };


    // remove this activity from list  (me.activityJson.id ) <-- from common client 

    // =============================================

    // === Full Detail Popup Related METHODS ========================

          
    // =============================================
	// === Other Supporting METHODS ========================

    // Update ActivityCard UI based on current activityItem data
    me.updateUI = function( divListItemTag, activityJson )
    {
        me.updateItem_UI_Button( divListItemTag.find( 'small.syncIcon img' ) );

        // PUT: Any other changes reflected on the ActivityCard - by submit..
    };


    me.updateItem_UI_Button = function( btnTag )
    {
        if ( btnTag.length > 0 )
        {
            if ( btnTag.hasClass( 'clicked' ) )
            { 
                btnTag.removeClass( 'clicked' );
            }
        }        
    };

    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

};


// =====================================
// #0. GO THROUGH ALL AND CHANGE ALL BELOW METHOD'S PARAM!!!!

ActivityCard.cardDivTag = `<div class="activity card">

    <div class="activityContainer card__container">

        <card__support_visuals class="activityIcon card__support_visuals" />

        <card__content class="activityContent card__content" />

        <card__cta class="activityStatus card__cta">
            <div class="activityStatusText card__cta_status"></div>
            <div class="favIcon card__cta_one" style="cursor: pointer; display:none;"></div>
            <div class="activityPhone card__cta_one" style="cursor: pointer; display:none;"></div>
            <div class="activityStatusIcon card__cta_two mouseDown" style="cursor:pointer;"></div>
        </card__cta>

        <div class="activityRerender" style="float: left; width: 1px; height: 1px;"></div>

    </div>

</div>`;

ActivityCard.cardHighlightColor = '#fcffff'; // #fffff9


ActivityCard.getActivityTagAll_ById = function( activityId )
{
    return $( 'div.card[itemid="' + activityId + '"]' );
};

// #1. For 'syncManagerNew' call, call ActivityCard.renderAll( activityId );
ActivityCard.reRenderAllById = function( activityId )
{
    if ( activityId ) ActivityCard.getActivityTagAll_ById( activityId ).find( '.activityRerender' ).click();
};


// --------------------------------------------------
// #3. Perform Sync Process Related
//      <-- Could be moved to 'syncManagerNew' class?

ActivityCard.highlightActivityDiv = function( activityId, bHighlight )
{
    // If the activityTag is found on the list, highlight it during SyncAll processing.
    var activityDivTag = ActivityCard.getActivityTagAll_ById( activityId );

    if ( activityDivTag.length > 0 )
    {
        if ( bHighlight ) activityDivTag.css( 'background-color', ActivityCard.cardHighlightColor );
        else activityDivTag.css( 'background-color', '' );
    }
};

// ---------------------------------------

ActivityCard.setupFavIconBtn = function( favIconTag, activityId, option )
{
    var option = ( option ) ? option : {};

    favIconTag.empty().hide();

    // Override the icon if 'favId' exists..  <-- scheduled..
    var activityJson = ActivityDataManager.getActivityById( activityId );
    var activityStatus = ActivityDataManager.getActivityStatus( activityJson );

    if ( activityJson.formData && activityJson.formData.sch_favId && SyncManagerNew.statusSynced( activityStatus ) )
    {
        // display favId instead.. + click event..            
        var favItemJson = FavIcons.getFavItemJson( 'clientActivityFav', activityJson.formData.sch_favId );

        if ( favItemJson )
        {
            FavIcons.populateFavItemIcon( favIconTag, favItemJson );
            favIconTag.show();

            // OPEN FavId As New Activity Entry: Different btw Activity vs ClientDetail opening.
            if ( option.clientCardId )
            {
                favIconTag.off( 'click' ).click( function() {
                    // 1. Open up client Detail..
                    var clientCardDetail = new ClientCardDetail( option.clientCardId );
                    clientCardDetail.render( { openTabRel: 'tab_clientActivities', openFav_ActId: option.activityId } );   
                });                
                // Pass activityId in 'openFav_ActId', so that we click on favIcon as we list/render activityCard 
            }
            else if ( option.fromActivityList )
            {
                favIconTag.off( 'click' ).click( function() 
                {                    
                    // With some INFO.sch_activityList_openAsActivity flag, we can open as sheetFull..                    
                    if ( ConfigManager.getActivitySch_favClickOpen() === 'clientDetail' )
                    {
                        var clientJson = ClientDataManager.getClientByActivityId( activityId );
                        if ( clientJson )
                        {
                            var clientCardDetail = new ClientCardDetail( clientJson._id );
                            clientCardDetail.render( { openTabRel: 'tab_clientActivities', openFav_ActId: activityId } );    
                        }    
                    }
                    else 
                    {
                        InfoDataManager.setINFOclientByActivity( activityJson );

                        var onClickActions = Util.cloneJson( favItemJson.onClick );
                        onClickActions.forEach( action => 
                        {
                            if ( action.actionType === 'openBlock' )
                            {
                                action.openSheetFull = { term: "", title: "Schedule Use", cssClasses: ["scheduleUse"] };
                            }
                        });

                        var actionObj = new Action( SessionManager.cwsRenderObj, {} );
                        actionObj.handleClickActionsAlt( onClickActions ); //, targetBlockTag, targetBlockContainerTag );    
                    }
                });
            }
            else 
            {
                // From ActivityCard List from Client
                var targetBlockTag = favIconTag.closest( '[tabButtonId=tab_clientActivities]' );
                if ( targetBlockTag.length >= 1 ) 
                {
                    FavIcons.setFavItemClickEvent( favIconTag, favItemJson, targetBlockTag, targetBlockTag, function() {
                        targetBlockTag.empty();
                    }, function( renderedBlockId) 
                    {
                        if ( renderedBlockId )
                        {
                            // Mark the block with activityEdit and scheduleConvert..
                            ActivityDataManager.setEditModeActivityId( renderedBlockId, activityId, { scheduleConvert: 'true' } );
                        }
                    } );
                }
            }
        }
    }
};
