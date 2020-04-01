// =========================================
//   BlockList Class/Methods
//          - Display List like 'activityList' - within BlockObject (Parent)
//
//   -- CLASS METHOD TEMPLATING THOUGHTS:
//      - Below are the common standard methods of instantiating classes in this project:
//
//      1. initialize()
//          - Set values from parents class or other related ones.
//          * SHOULD be the ones that needs to be set only once on instantiation
//
//      2. render()
//          - renders the class - can be called after calculation/perform operation/changes
//          * SHOULD take care of displaying data that were changed/set.
//          * SHOULD be able to be called again..  
//              - Simply reRendering on the space like classDiv, after clearing(reset) any previous one.
//          * COULD HAVE 
//                  - set classDiv(section) content
//                  - set rendered tag class variables
//                  - populate(create) controls based on data
//                  - rendered control evetns
//
//      3. events
//          - class actions are events driven..
//          - set events handler that will perform the class actions
//          
// -- Pseudo WriteUp: 
//
//      - MAIN FEATURES:
//
//          1. InitialSetup() - Set some variables like below  <-- used rather than 'initialize' due to not having this ready on instantiation time
//                  - 'me.activytList' - from cwsRender activity full list (but copy of the list, not influencing the actual list)
//                  - 'me.blockJson' set from passed 'blockJson'
//                 
//          1. Render() - Perform 'rendering' of blockList with main data from cwsRender
//                  [Kind of Initialization Part]
//                  - Set Frame HTML (by cloning from templat) 
//                  - Set Other Related Initial things
//                  [True Rendering Part]
//                  - Set ActivityList from main list on cwsRender.
//                  - Populate ActivityItems (using 'ActivityList')
//
//          2. ReRender() - reRender the list with param 'newActivityList'.
//
//          2. ReRenderWithMainData() - call 'reRender' with newActivityList data.
//
//          3. AddActivityItem() - Add ActivityItem (on top) to main list and perform 'reRender'.
//
//      - MORE:
//          1. Add viewFilter Implementation..
//          2. SyncDownload Implementation..
//
//      - OTHERS:
//          1. GroupBy
//          2. Scrolling
//
//      - TERMS:
//          1. ActivityCard - Displayed Activity (UI) in the list
//          2. me.activityList - the json data list of activity, but this is just referenece list.
//              The main actual list is in cwsRenderObj and this only makes different list reference..
//
//
// -------------------------------------------------
function BlockList( cwsRenderObj, blockObj, blockJson ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;     
    me.blockJson = blockJson;   

    me.activityList = [];

    me.hasView = false;  
    me.BlockListViewObj;

    me.scrollEnabled = true;
    me.lastScrollTop = 0;  // For tracking scroll up vs down

    me.pagingData = { 'pagingSize': 15, 'currPosition': 0 };  //, 'currPage': 0 };

    // -------- Tags --------------------------

    me.blockList_UL_Tag;
    me.divSyncDownTag = $('#divSyncDown');
    me.imgSyncDownTag = $('#imgSyncDown');

    // --------- Templates --------------------

    me.template_ActivityCard = `<li itemid="" class="activityItemCard">
        <a class="expandable" itemid="" style="padding:4px;">

            <div class="icon-row listItem">

                <table class="listItem_table">
                    <tr>
                        <td class="listItem_selector_drag" style="width:2px;opacity:0.65;vertical-align:top;">
                            <div style="overflow-y:hidden;" class="listItem">&nbsp;</div>
                        </td>

                        <td class="listItem_icon_activityType" style="width: 60px;">
                            <div style="width: 56px;"></div>
                        </td>

                        <td class="listItem_data_preview">
                            <div class="divListItemContent">
                                <div class="listItem_label_date">---Date---</div>
                            </div>
                        </td>

                        <td class="listItem_voucher_status">
                            <div class="act-r"><span id="listItem_queueStatus">success</span></div>
                        </td>

                        <td class="listItem_action_sync">
                            <div class="icons-status divListItem_icon_sync">
                                <small class="syncIcon">
                                    <img src="images/sync-n.svg" class="listItem_icon_sync" />
                                </small>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="act-l">
                <div class="act-l-more">
                    <img src="images/client.svg" style="width:18px;height:18px;opacity:0.5">&nbsp;<span term="">see more</span>
                </div>
                <div class="act-l-expander" style="display:none;">
                </div>
            </div>
        </a>
    </li>`;

    me.template_ActivityCardEmpty = `<li class="emptyListLi activityItemCard">
            <a class="expandable" style="min-height: 60px; padding: 23px; color: #888;" term="${Util.termName_listEmpty}">List is empty.</a>
        </li>`;


    // ===========================================================
    // === Main Features =========================

    // ----------------------------
    me.initialize = function() 
    { 
        me.setUpInitialData( me.cwsRenderObj, me.blockJson );

        me.setClassEvents( me.cwsRenderObj );
    };

    // --------------------------------------- --------

    //  Render BlockList
    me.render = function( blockTag, passedData, options )
    {        
        // Clear previous UI & Set containerTag with templates
        me.clearClassTag( blockTag );        
        me.blockList_UL_Tag = me.setClassContainerTag( blockTag );
        // Other Initial Render Setups - syncDown setup, favIcons, etc..
        me.otherInitialRenderSetup( me.divSyncDownTag, me.imgSyncDownTag, me.cwsRenderObj );

        // Set class level tags
        me.setClassVariableTags( blockTag );

        // Populate controls - ActivityLists, viewFilter/sort, related.
        me.populateControls( me.blockJson, me.hasView, me.activityList, me.blockList_UL_Tag );

        // Events handling
        //me.setRenderEvents();
    };


    // Used by viewFilter.. - 
    me.reRenderWithList = function( newActivityList, callBack )
    {
        if ( me.blockList_UL_Tag )
        {
            $( window ).scrollTop( 0 ); // Scroll top
            me.lastScrollTop = 0;

            me.activityList = newActivityList;  // NOTE: We expect this list already 'cloned'...

            me.clearExistingList( me.blockList_UL_Tag ); // remove li.activityItemCard..
            me.pagingDataReset( me.pagingData );

            // This removes the top view - if view exists..
            me.populateActivityCardList( me.activityList, me.blockList_UL_Tag );

            if ( callBack ) callBack();
        }
        else
        {
            console.log( ' ===> Error on blockList.reRenderWithList - blockList_UI_Tag not available - probably not rendered, yet' );
        } 
    };


    me.reRender = function( callBack )
    {
        // When reRendering, if view exists, select 1st view to render the 1st view list.
        // If no view, list full data as they are.
        if ( me.hasView ) me.BlockListViewObj.viewSelect_1st(); 
        else 
        {
            var newActivityList = Util.cloneArray( ActivityDataManager.getActivityList() );

            me.reRenderWithList( newActivityList, callBack );    
        }
    };


    // -----------------------------------------------
    // -- Class Events ...

    me.setClassEvents = function( cwsRenderObj )
    {
        if ( me.scrollEnabled ) cwsRenderObj.setScrollEvent( me.setScrollEvent );
    };

    // -----------------------------------------------
    // -- Related Methods...

    me.setUpInitialData = function( cwsRenderObj, blockJson )
    {
        me.activityList = Util.cloneArray( ActivityDataManager.getActivityList() );
        //me.blockJson = blockJson;
        
        me.hasView = ( blockJson.activityListViews && blockJson.activityListViews.length > 0 );
    };


    me.clearClassTag = function( blockTag )
    {
        // Clear any previous ones of this class
        blockTag.find( 'div.listDiv' ).remove();
    };

    me.setClassContainerTag = function( blockTag )
    {
        // Block/BlockList HTML related setup
        var listDivTag = $( '#listTemplateDiv > div.listDiv' ).clone(); // Copy from list html template located in index.html
        blockTag.append( listDivTag );

        var blockList_UL_Tag = listDivTag.find( 'ul.tab__content_act');

        FormUtil.setUpTabAnchorUI( blockList_UL_Tag ); // Set click event + heights
        
        return blockList_UL_Tag;
    };


    me.otherInitialRenderSetup = function( divSyncDownTag, imgSyncDownTag, cwsRenderObj )
    {
        SyncManagerNew.setBlockListObj( me ); // Not Utilized, yet.
        me.setupForSyncDownload( divSyncDownTag, imgSyncDownTag, cwsRenderObj ); // Set 'SyncDownload' display show + click event
        me.cwsRenderObj.favIcons_Update();
    };


    me.setClassVariableTags = function ( blockTag )
    {
        me.blockTag = blockTag;
    };


    me.populateControls = function ( blockJson, hasView, activityList, blockList_UL_Tag )
    {
        if ( hasView )
        {
            me.BlockListViewObj = new BlockListView( me.cwsRenderObj, me, blockList_UL_Tag, blockJson.activityListViews );
            me.BlockListViewObj.render();

            // After setting up 'view', select 1st one will fire (eventually) 'reRender' of this class ( 'populateActivityCardList' with some clean up )?
            me.BlockListViewObj.viewSelect_1st();    
        }
        else
        {
            me.pagingDataReset( me.pagingData );            
            me.populateActivityCardList( activityList, blockList_UL_Tag );
        }
    };

    me.clearExistingList = function( blockList_UL_Tag )
    {
        blockList_UL_Tag.find( 'li.activityItemCard' ).remove();
    };


    // ----------------------------------------

    // ===========================================================
    // === #1 Render() Related Methods ============

    // Previously ==> me.renderBlockList_Content( blockTag, me.cwsRenderObj, me.blockObj );
    // Add paging here as well..
    me.populateActivityCardList = function( activityList, blockList_UL_Tag, scrollStartFunc, scrollEndFunc )
    {        
        if ( activityList.length === 0 ) 
        {
            // if already have added emtpyList, no need to add emptyList
            if ( me.blockList_UL_Tag.find( 'li.emptyListLi' ).length === 0 )
            {
                me.blockList_UL_Tag.append( $( me.template_ActivityCardEmpty ) );
            }
        }
        else
        {
            var currPosJson = me.getCurrentPositionRange( activityList.length, me.pagingData );
            me.setNextPagingData( me.pagingData, currPosJson );            

            if ( !currPosJson.endAlreadyReached )
            {
                if ( scrollStartFunc ) scrollStartFunc();

                //for( var i = 0; i < activityList.length; i++ )
                for ( var i = currPosJson.startPosIdx; i < currPosJson.endPos; i++ )
                {
                    var activityCardLiTag = me.createActivityCard( activityList[i] );
    
                    if ( activityCardLiTag ) blockList_UL_Tag.append( activityCardLiTag );        
                }    
    
                if ( scrollEndFunc ) scrollEndFunc();    
            }
        }
    };
        

    // ------------------------------------
    // --- Paging Related -------------

    me.getCurrentPositionRange = function( activityListSize, pagingData )
    {
        var currPosJson = {};
        
        currPosJson.startPosIdx = pagingData.currPosition;
                
        var nextPageEnd = pagingData.currPosition + pagingData.pagingSize;
        if ( nextPageEnd >= activityListSize ) nextPageEnd = activityListSize;  // if nextPageEnd is over the limit, set to limit.

        currPosJson.endPos = nextPageEnd; 
        
        currPosJson.endAlreadyReached = ( currPosJson.startPosIdx === currPosJson.endPos );

        return currPosJson;
    };


    me.setNextPagingData = function( pagingData, currPosJson )
    {
        pagingData.currPosition = currPosJson.endPos;
    };

    
    me.pagingDataReset = function( pagingData )
    {
        pagingData.currPosition = 0;
    };


    // ------------------------------------
    // --- Scrolling Related -------------

    me.setScrollEvent = function()
    {
        //Infinite Scroll

        // Scroll only if this tag is visible, and there are activities
        if ( me.blockList_UL_Tag.is( ":visible" ) && me.activityList.length > 0 )
        {                    
            var currScrollTop = $(window).scrollTop();
            var scrollDirection = ( currScrollTop > me.lastScrollTop ) ? 'Down' : 'Up';
            me.lastScrollTop = currScrollTop;

            if ( scrollDirection === 'Down' )
            {
                //page height
                var scrollHeight = $(document).height();

                //scroll position
                var scrollPos = $(window).height() + $(window).scrollTop();

                // fire if the scroll position is 100 pixels above the bottom of the page
                if ( ( ( scrollHeight - 100 ) >= scrollPos ) / scrollHeight == 0 ) {

                    me.scrollList();
                }
            }
        }
    };


    // Get next paging amount data and display it
    me.scrollList = function()
    {
        // 2. check current paging, get next paging record data.. - populateActivityList has this in it.
        me.populateActivityCardList( me.activityList, me.blockList_UL_Tag, function() {

            me.cwsRenderObj.pulsatingProgress.show();
            
        }, function() {

            setTimeout( function() { me.cwsRenderObj.pulsatingProgress.hide(); }, 250 );

        });
    };

    
    // ------------------------------------
    // --- Create Activity Card Related -------------

    // Populate one Activity Card
    // TODO: Move this to 'ActivityItem' class (rename it as 'ActivityCard')
    me.createActivityCard = function( activityJson, groupBy )
    {
        var activityCardLiTag;

        try
        {
            activityCardLiTag = $( me.template_ActivityCard );
            var activityCardAnchorTag = activityCardLiTag.find( 'a.expandable' );
            var contentDivTag = activityCardLiTag.find( 'div.listItem' );

            var divListItemContentTag = activityCardLiTag.find( 'div.divListItemContent' );

            // --- See More Related Tags
            var divSeeMoreTag = activityCardAnchorTag.find( 'div.act-l' );
            var divSeeMoreBtnTag = divSeeMoreTag.find( 'div.act-l-more' );
            var divSeeMoreContentTag = divSeeMoreTag.find( 'div.act-l-expander' );



            // get/set json from 2 types...  <-- Set it as one type now!!!




            // Probably need to populate only one of below 2
            activityCardLiTag.attr( 'itemId', activityJson.activityId );
            activityCardAnchorTag.attr( 'itemId', activityJson.activityId );


            var activityTrans = me.getCombinedTrans( activityJson );


            // click event - for activitySubmit..
            var listItem_icon_syncTag = activityCardLiTag.find( '.listItem_icon_sync' );
            listItem_icon_syncTag.click( function( e ) 
            {
                e.stopPropagation();  // Stops calling parent tags event calls..
                me.activitySubmitSyncClick( activityJson, activityCardLiTag.find( 'div.listItem' ) ); 
            });


            // Div ActivityCard main content Div click --> By toggling class, Shows hidden div about 'showMore'
            contentDivTag.click( function( e ) 
            {
                e.stopPropagation();                
                activityCardAnchorTag.toggleClass( 'expanded' ); 
                // TODO: Later, remove all other 'expanded'
                // Need to switch 'see more' to 'see less' and visa versa..
            });
            

            // divSeeMoreBtnTag click to display more/less --> By toggling class
            divSeeMoreBtnTag.click( function( e ) 
            {
                e.stopPropagation();
                divSeeMoreContentTag.toggleClass( 'act-l-more-open' );

                if ( divSeeMoreContentTag.hasClass( 'act-l-more-open' ) )
                {
                    console.log( activityJson );

                    var jsonViewer = new JSONViewer();
                    divSeeMoreContentTag.append( jsonViewer.getContainer() );
                    jsonViewer.showJSON( activityTrans );
                }
                else
                {
                    divSeeMoreContentTag.html( '' );
                }
            });


            // ActivityCard data display (preview)
            me.setActivityContentDisplay( activityJson, activityTrans, divListItemContentTag, me.cwsRenderObj.configJson );

            // GREG change
            //me.updateActivityCard_UI_Preview( activityJson, activityCardLiTag );

            me.updateActivityCard_UI_Icon( activityCardLiTag, activityJson, me.cwsRenderObj );            
        }
        catch( errMsg )
        {
            activityCardLiTag = undefined;
            console.log( 'Error on createActivityCard, errMsg: ' + errMsg );
        }

        return activityCardLiTag;        
    };


    me.setActivityContentDisplay = function( activityItem, activityTrans, divListItemContentTag, configJson )
    {
        var displaySettings = ConfigUtil.getActivityDisplaySettings( configJson );
        var divLabelTag = divListItemContentTag.find( 'div.listItem_label_date' );

        //console.log( 'displaySettings: ', displaySettings );
        var activity = activityItem;  // also, declare 'activity', so that it can be used...?


        if ( !displaySettings )
        {
            // If displaySettings does not exists, simply display the date label <-- fixed display
            // Title - date description..
            if ( activityItem.created ) divLabelTag.html( $.format.date( activityItem.created, "MMM dd, yyyy - HH:mm" ) );
        }
        else
        {
            divLabelTag.remove();
            //"displaySetting": [
            //    "'<b><i>' + activityItem.created + '</i></b>'",
            //    "activityTrans.firstName + ' ' + activityTrans.lastName"
            // ],

            // <-- Should be activity.activityDate.deviceDate, activity.firstName, activity.lastName..

            
            for( var i = 0; i < displaySettings.length; i++ )
            {
                // Need 'activityItem', 'activityTrans'
                var dispSettingEvalStr = displaySettings[ i ];
                var displayEvalResult = "------------";
    
                try
                {
                    displayEvalResult = eval( dispSettingEvalStr );
                    //divListItemContentTag.append( '<div class="activityContentDisplay">' + displayEvalResult + '</div>' );
                }
                catch ( errMsg )
                {
                    console.log( 'Error on BlockList.setActivityContentDisplay, errMsg: ' + errMsg );
                }
    
                divListItemContentTag.append( '<div class="activityContentDisplay">' + displayEvalResult + '</div>' );    
            }
        }                    
    };


    me.getCombinedTrans = function( activityJson )
    {
        var jsonShow = {};

        try
        {
            var tranList = activityJson.transactions;

            for( var i = 0; i < tranList.length; i++ )
            {
                var tranData = tranList[i].dataValues;

                if ( tranData )
                {
                    for ( var prop in tranData ) 
                    {
                        jsonShow[ prop ] = tranData[ prop ];
                    }
                }
            }
        }
        catch ( errMsg )
        {
            console.log( 'Error during BlockList.getCombinedTrans, errMsg: ' + errMsg );
        }

        return jsonShow;
    };


    me.activitySubmitSyncClick = function( activityJson, divListItemTag )
    {        
        if ( SyncManagerNew.syncStart() )
        {
            try
            {
                var activityItem = new ActivityItem( activityJson, divListItemTag, me.cwsRenderObj );
    
                SyncManagerNew.syncUpItem( activityItem, function( success ) {
    
                    SyncManagerNew.syncFinish();     
                    //console.log( 'BlockList submitButtonListUpdate: isSuccess - ' + success );        
                });    
            }
            catch( errMsg )
            {
                console.log( 'ERROR on running on activityItem Sync, errMsg - ' + errMsg );
                SyncManagerNew.syncFinish();     
            }
        }
    };
                

    me.updateActivityCard_UI_Preview = function( itemData, activityCardLiTag )
    {
        var activityType = FormUtil.getActivityType ( itemData );


        // GREG: WHY DO WE USE 'previewJson' in 'data'!!!!  Why do we need it?
        var previewDivTag = me.getListDataPreview( itemData.data.previewJson, activityType.previewData );

        //console.log( itemData );
        //console.log( activityType.previewData );
        //console.log( previewDivTag );

        activityCardLiTag.find( '.listDataPreview' ).empty().append( previewDivTag );
    };


    // GREG CHANGES
    me.getListDataPreview = function( dataJson, previewConfig )
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


    // GREG CHANGES
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

    
    me.updateActivityCard_UI_Icon = function( activityCardLiTag, itemJson, cwsRenderObj )
    {
        try
        {
            // update card 'status' (submit/fail/queue)
            FormUtil.setStatusOnTag( activityCardLiTag.find( 'small.syncIcon' ), itemJson, cwsRenderObj );

            // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)
            FormUtil.appendActivityTypeIcon ( activityCardLiTag.find( '.listItem_icon_activityType' ) 
                , FormUtil.getActivityType ( itemJson )
                , FormUtil.getStatusOpt ( itemJson )
                , cwsRenderObj );
        }
        catch( errMsg )
        {
            console.log( 'Error on BlockList.updateActivityCard_UI_Icon, errMsg: ' + errMsg );
        }        
    };


    // ===========================================================
    // === Exposed to Outside Methods ============

    // =============================================
    // === OTHER METHODS ========================


    // --------------------------------------
    // -- TEMP PLACEMENT..  MOVE IT LATER..

    // Show the button + click event    
    me.setupForSyncDownload = function( divSyncDownTag, imgSyncDownTag, cwsRenderObj )
    {
        divSyncDownTag.show(); 

        imgSyncDownTag.off( "click" ).click( () => {

            SyncManagerNew.syncDown( cwsRenderObj, 'Manual', me.afterSyncDownload );
        });
    };


    me.afterSyncDownload = function( success ) 
    {
        if ( success )
        {
            // blockList UI Listing update??
            me.reRenderWtMainData( function() {
                console.log( 'Finished calling reRender() after syncDownload' );
            });       
        }
        else
        {
            console.log( 'syncDownload returned with failure..');
        }
    };

    // =============================================

    me.initialize();
}