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

    me.listTableTbodyTag;    // was me.blockList_UL_Tag;
    me.divSyncDownTag = $('#divSyncDown');
    me.imgSyncDownTag = $('#imgSyncDown');

    // --------- Templates --------------------


    me.template_listTableTag = `<table class="list">
        <tbody>
        </tbody>
    </table>`;

    me.tempalte_trActivityTag = `<tr class="activity">
        <td>
            <div class="list_three_line">

                <div class="list_three_line__container">

                    <div class="list_three_line-suppor_visuals i-metod_provision_40"></div>

                    <div class="list_three_item_content">
                        <div class="list_three_line-date">24 Feb 2020 - 13:15</div>
                        <div class="list_three_line-text"><b>Greg R.</b> | Male 21<br>
                        Service: 3x Pills</div>
                    </div>

                    <div class="list_three_item_cta">
                        <div class="list_three_item_status color_status_pending">Pending</div>
                        <div class="list_three_item_cta1"></div>
                        <div class="list_three_item_cta2"></div>
                    </div>

                </div>

            </div>
        </td>
    </tr>`;

    me.tempalte_trActivityEmptyTag = `<tr class="activity emptyList">
        <td>
            <div class="list_three_line" term="${Util.termName_listEmpty}">List is empty.</div>
        </td>
    </tr>`;

    
    me.template_ActivityCard = `<li itemid="" class="activityItemCard">
        <a class="expandable" itemid="" >

            <div class="icon-row listItem">

                <table class="listItem_table">
                    <tr>
                        <td class="listItem_selector_drag" style="width:2px;opacity:0.65;vertical-align:top;">
                            <div style="overflow-y:hidden;" class="listItem">&nbsp;</div>
                        </td>

                        <td class="listItem_icon_activityType">
                            <div style="width: 56px;"></div>
                        </td>

                        <td class="listItem_data_preview">
                            <div class="divListItemContent">
                                <div class="listItem_label_title">---Date---</div>
                            </div>
                        </td>


                        <td class="listItem_action_sync">
                            <div class="act-r">
                                <div class="listItem_statusOption"></div>
                            </div>

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
                    <img src="images/client.svg" style="width:18px;height:18px;opacity:0.5">&nbsp;<span class="act_btn_showDetails" term="">see more</span>
                </div>
                <!-- <div class="act-l-expander">
                    <img class="expandable-arrow" src="images/arrow_down.svg" >
                </div> -->
            </div>

            <div class="act-preview"></div>

        </a>
    </li>`;

    me.template_ActivityCardEmpty = `<li class="emptyListLi activityItemCard">
            <a class="expandable" style="" term="${Util.termName_listEmpty}">List is empty.</a>
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

        me.listTableTbodyTag = me.setClassContainerTag( blockTag );

        // Other Initial Render Setups - syncDown setup, favIcons, etc..
        me.otherInitialRenderSetup( me.divSyncDownTag, me.imgSyncDownTag, me.cwsRenderObj );

        // Set class level tags
        me.setClassVariableTags( blockTag );

        // Populate controls - ActivityLists, viewFilter/sort, related.
        me.populateControls( me.blockJson, me.hasView, me.activityList, me.listTableTbodyTag );

        // Events handling
        //me.setRenderEvents();
    };


    // Used by viewFilter.. - 
    me.reRenderWithList = function( newActivityList, callBack )
    {
        if ( me.listTableTbodyTag )
        {
            $( window ).scrollTop( 0 ); // Scroll top
            me.lastScrollTop = 0;

            me.activityList = newActivityList;  // NOTE: We expect this list already 'cloned'...

            me.clearExistingList( me.listTableTbodyTag ); // remove li.activityItemCard..
            me.pagingDataReset( me.pagingData );

            // This removes the top view - if view exists..
            me.populateActivityCardList( me.activityList, me.listTableTbodyTag );

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
        blockTag.find( 'table.list' ).remove();
    };

    me.setClassContainerTag = function( blockTag )
    {
        var listTableTag = $( me.template_listTableTag );
        
        blockTag.append( listTableTag );

        /*
        // Block/BlockList HTML related setup
        var listDivTag = $( '#listTemplateDiv > div.wrapper' ).clone(); // Copy from list html template located in index.html
        blockTag.append( listDivTag );

        var listTableTag = listDivTag.find( 'ul.tab__content_act');

        FormUtil.setUpTabAnchorUI( listTableTag ); // Set click event +e heights
        
        return listTableTag;
        */

        return listTableTag.find( 'tbody' );
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


    me.populateControls = function ( blockJson, hasView, activityList, listTableTbodyTag )
    {
        
        if ( hasView )
        {
            me.BlockListViewObj = new BlockListView( me.cwsRenderObj, me, blockJson.activityListViews );
            me.BlockListViewObj.render();

            // After setting up 'view', select 1st one will fire (eventually) 'reRender' of this class ( 'populateActivityCardList' with some clean up )?
            me.BlockListViewObj.viewSelect_1st();    
        }
        else
        {
            me.pagingDataReset( me.pagingData );            
            me.populateActivityCardList( activityList, listTableTbodyTag );
        }
    };

    me.clearExistingList = function( listTableTbodyTag )
    {
        listTableTbodyTag.find( 'tr.activity' ).remove();
        //listTableTbodyTag.find( 'li.blockListGroupBy' ).remove();
    };


    // ----------------------------------------

    // ===========================================================
    // === #1 Render() Related Methods ============

    // Previously ==> me.renderBlockList_Content( blockTag, me.cwsRenderObj, me.blockObj );
    // Add paging here as well..
    me.populateActivityCardList = function( activityList, listTableTbodyTag, scrollStartFunc, scrollEndFunc )
    {        
        if ( activityList.length === 0 ) 
        {
            // if already have added emtpyList, no need to add emptyList
            if ( me.listTableTbodyTag.find( 'tr.emptyList' ).length === 0 )
            {
                me.listTableTbodyTag.append( $( me.tempalte_trActivityEmptyTag ) );
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
                    var activityJson = activityList[i];
                    var groupByGroupIdxVal = '';
                    
                    //if ( me.hasView && me.BlockListViewObj.groupByGroups.length )
                    //{
                    //    groupByGroupIdxVal = me.evalCreateGroupByGroup( activityJson, listTableTbodyTag, me.BlockListViewObj );
                    //}

                    var activityCardObj = me.createActivityCard( activityJson, listTableTbodyTag, groupByGroupIdxVal );

                    activityCardObj.render();
                }    
    
                if ( scrollEndFunc ) scrollEndFunc();    
            }
        }
    };

    /*
    me.evalCreateGroupByGroup = function( activityJson, targTag, blockListViewObj )
    {
        var retGroup = '';
        for ( var g=0; g < blockListViewObj.groupByGroups.length; g++ )
        {
            if ( activityJson.groupBy[ blockListViewObj.viewDef_Selected.groupBy ] === blockListViewObj.groupByGroups[ g ].id )
            {
                retGroup = blockListViewObj.groupByGroups[ g ].id;
                if ( ! blockListViewObj.groupByGroups[ g ].created )
                {
                    var liContentTag = $( '<li class="blockListGroupBy opened" />' );
                    //var anchorTag = $( '<a class="blockListGroupBySection" groupBy="' + ( blockListViewObj.groupByGroups[ g ].id ).toUpperCase() + '" style=""><img src="images/arrow_up.svg" class="arrow" style="padding-right:4px;">' + ( blockListViewObj.groupByGroups[ g ].name ) + '</a>' );
                    var anchorTag = $( '<a class="blockListGroupBySection" />' );

                    //anchorTag.css( 'background', 'url(images/arrow_up.svg)' );
                    anchorTag.text( blockListViewObj.groupByGroups[ g ].name  );

                    targTag.append( liContentTag );
                    liContentTag.append( anchorTag );

                    anchorTag.click( function() {
                        //var imgTag = this.children[ 0 ];
                        var groupByClickTag = $( this );
                        me.evalToggleCalGroupCards( targTag, 'groupBy', blockListViewObj.groupByGroups[ g ].id );
                        groupByClickTag.parent()[ 0 ].classList.toggle( "opened" );
                        //imgTag.classList.toggle( "rotateImg" );
                        //groupByClickTag.classList.toggle( "rotateImg" );
                    });
                    blockListViewObj.groupByGroups[ g ][ 'created' ] = 1;
                    break;
                }
                else
                {
                    break;
                }
            }
        }
        return retGroup;
    };
    me.evalToggleCalGroupCards = function( parentTag, attrName, attrVal )
    {        
        parentTag.find( 'li.activityItemCard' ).each( function(){ 
            var li = $( this );
            console.log( li.attr( attrName ) + ' == ' + attrVal );
            if ( li.attr( attrName ) == attrVal )
            {
                if ( li.is( ':visible' ) )
                {
                    li.hide();
                }
                else
                {
                    li.show();
                }
            }
        });
    };
    */

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
        if ( me.listTableTbodyTag.is( ":visible" ) && me.activityList.length > 0 )
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
        me.populateActivityCardList( me.activityList, me.listTableTbodyTag, function() {

            me.cwsRenderObj.pulsatingProgress.show();
            
        }, function() {

            setTimeout( function() { me.cwsRenderObj.pulsatingProgress.hide(); }, 250 );

        });
    };

    
    // ------------------------------------
    // --- Create Activity Card Related -------------

    me.createActivityCard = function( activityJson, listTableTbodyTag, groupByIdxVal )
    {
        var activityCardTrTag = $( me.tempalte_trActivityTag );
        listTableTbodyTag.append( activityCardTrTag );     

        activityCardTrTag.attr( 'itemId', activityJson.activityId );
      
        if ( groupByIdxVal && groupByIdxVal !== '' ) activityCardTrTag.attr( 'groupBy', groupByIdxVal );
        return new ActivityCard( activityJson.activityId, me.cwsRenderObj );
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

            $( 'div.Nav2' ).show();

            //SyncManagerNew.syncDown( cwsRenderObj, 'Manual', me.afterSyncDownload );

            // THIS SHOULD BE SET ON APP LEVEL - ONCE  <-- cwsRender or apps class..
            //$('.sheet_bottom-fs').show( 'slide', { direction: 'down' }, 200 );//css('display', 'block');
            //$('.sheet_bottom-scrim').show();  //   opacity: 0.2;  <-- css changed
        });

        $(".sheet_bottom-scrim").click(function () {
            $('.sheet_bottom-fs').css('display', 'none');
            $('.sheet_bottom-scrim').css('display', 'none');
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