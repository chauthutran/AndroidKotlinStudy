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
    me.viewGroupByData; // set from 'blockListView'

    me.hasView = false;  
    me.BlockListViewObj;

    me.scrollEnabled = true;
    me.scrollLoadingNextPage = false;
    me.lastScrollTop = 0;  // For tracking scroll up vs down

    me.pagingData = ConfigManager.getSettingPaging(); // 'pagingSize': ( $( '#pageDiv' ).height() / 90 ) --> 90 = standard height for 1 activityCard
    me.pagingData.currPosition = 0;

    // -------- Tags --------------------------

    me.listTableTbodyTag;    // was me.blockList_UL_Tag;
    // --------- Templates --------------------


    me.template_listDivTag = `<div class="list" />`;
    /*
    me.template_listDivTag = `<table class="list">
        <tbody>
        </tbody>
    </table>`;
    */

    /*me.template_divActivityTag = `<tr class="activity">
        <td>
            <div class="list_three_line">

                <div class="activityContainer list_three_line__container">

                    <div class="activityIcon list_three_line-suppor_visuals"></div>

                    <div class="activityContent list_three_item_content">
                    </div>

                    <div class="activityStatus list_three_item_cta">
                        <div class="activityStatusText list_three_item_status"></div>
                        <div class="activityPhone list_three_item_cta1"></div>
                        <div class="activityStatusIcon list_three_item_cta2"></div>
                    </div>

                    <div class="activityRerender" style="float: left; width: 1px; height: 1px;"></div>

                </div>
            </div>
        </td>
    </tr>`;*/
    me.template_divActivityTag = `<div class="activity list_three_line">

        <div class="activityContainer list_three_line__container">

            <div class="activityIcon avatar_circle" />

            <div class="activityContent list_three_item_content" />

            <div class="activityStatus list_three_item_cta">
                <div class="activityStatusText list_three_item_status"></div>
                <div class="activityPhone list_three_item_cta1"></div>
                <div class="activityStatusIcon list_three_item_cta2"></div>
            </div>

            <div class="activityRerender" style="float: left; width: 1px; height: 1px;"></div>

        </div>

    </div>`;

    /*me.template_divActivityEmptyTag = `<tr class="activity emptyList">
        <td>
            <div class="list_three_line" term="${Util.termName_listEmpty}">List is empty.</div>
        </td>
    </tr>`;*/
    me.template_divActivityEmptyTag = `<div class="activity emptyList">
            <div class="list_three_line" term="${Util.termName_listEmpty}">List is empty.</div>
    </div>`;

    /*me.template_groupDivTag = `<tr class="blockListGroupBy opened">
        <td class="blockListGroupBySection"></td>
    </tr>`;*/
    me.template_groupDivTag = `<div class="blockListGroupBy opened">
        <div class="blockListGroupBySection" />
    </div>`;

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
        me.otherInitialRenderSetup();

        // Set class level tags
        me.setClassVariableTags( blockTag );

        // Populate controls - ActivityLists, viewFilter/sort, related.
        me.populateControls( me.blockJson, me.hasView, me.activityList, me.listTableTbodyTag );

        // Events handling
        //me.setRenderEvents();
    };


    // Used by viewFilter.. - 
    me.reRenderWithList = function( newActivityList, groupByData, callBack )
    {
        if ( me.listTableTbodyTag )
        {
            $( 'body' ).scrollTop( 0 ); // Scroll top
            me.lastScrollTop = 0;

            me.activityList = newActivityList;  // NOTE: We expect this list already 'cloned'...
            me.viewGroupByData = groupByData;

            me.clearExistingList( me.listTableTbodyTag ); // remove li.activityItemCard..
            me.pagingDataReset( me.pagingData );

            me.scrollLoadingNextPage = true;
            me.cwsRenderObj.pulsatingProgress.show();

            // This removes the top view - if view exists..
            me.populateActivityCardList( me.activityList, me.viewGroupByData, me.listTableTbodyTag, function(){

                me.scrollLoadingNextPage = true;
                me.cwsRenderObj.pulsatingProgress.show();

            }, function(){

                setTimeout( function() { 

                    me.cwsRenderObj.pulsatingProgress.hide(); 
                    me.scrollLoadingNextPage = false;
    
                }, 250 );

            } );

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

            me.reRenderWithList( newActivityList, me.viewGroupByData, callBack );    
        }
    };


    // -----------------------------------------------
    // -- Class Events ...

    me.setClassEvents = function( cwsRenderObj )
    {
        cwsRenderObj.setScrollEvent( me.evalBlockListScroll );
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
        var listTableTag = $( me.template_listDivTag );

        blockTag.append( listTableTag );

        var listFavButtonTag = $( Templates.favButtonContainer ); // Copy from list html template located in index.html

        blockTag.append( listFavButtonTag );

        return listTableTag; //listTableTag.find( 'tbody' );
    };


    me.otherInitialRenderSetup = function()
    {
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

            me.populateActivityCardList( activityList, me.viewGroupByData, listTableTbodyTag, function(){

                me.scrollLoadingNextPage = true;
                me.cwsRenderObj.pulsatingProgress.show();

            }, function(){

                setTimeout( function() { 

                    me.cwsRenderObj.pulsatingProgress.hide(); 
                    me.scrollLoadingNextPage = false;
    
                }, 250 );

            } );
        }
    };

    me.clearExistingList = function( listTableTbodyTag )
    {
        listTableTbodyTag.find( 'div.activity' ).remove();
        listTableTbodyTag.find( 'div.blockListGroupBy' ).remove();
    };


    // ----------------------------------------

    // ===========================================================
    // === #1 Render() Related Methods ============

    // Previously ==> me.renderBlockList_Content( blockTag, me.cwsRenderObj, me.blockObj );
    // Add paging here as well..
    me.populateActivityCardList = function( activityList, viewGroupByData, listTableTbodyTag, scrollStartFunc, scrollEndFunc )
    {
        if ( activityList.length === 0 ) 
        {
            // If already have added emtpyList, no need to add emptyList
            if ( me.listTableTbodyTag.find( 'div.emptyList' ).length === 0 )
            {
                me.listTableTbodyTag.append( $( me.template_divActivityEmptyTag ) );
            }

            if ( scrollEndFunc ) scrollEndFunc();
        }
        else
        {
            // Designed to handle with/without scrolling:
            // If setting has no scrolling/paging, me.pagingData has 'enabled': false, and will return endPos as full list size.
            var currPosJson = me.getCurrentPositionRange( activityList.length, me.pagingData );
            me.setNextPagingData( me.pagingData, currPosJson );            

            //console.log( me.pagingData );
            //console.log( currPosJson );
            me.pagingData.endAlreadyReached = currPosJson.endAlreadyReached;


            if ( !currPosJson.endAlreadyReached )
            {

                if ( scrollStartFunc ) scrollStartFunc();

                //for( var i = 0; i < activityList.length; i++ )
                for ( var i = currPosJson.startPosIdx; i < currPosJson.endPos; i++ )
                {
                    var activityJson = activityList[i];

                    var activityCardObj = me.createActivityCard( activityJson, listTableTbodyTag, viewGroupByData );

                    activityCardObj.render();
                }    

            }

            if ( scrollEndFunc ) scrollEndFunc();
        }
    };

    // ------------------------------------
    // --- Paging Related -------------

    me.getCurrentPositionRange = function( activityListSize, pagingData )
    {
        var currPosJson = {};
        currPosJson.startPosIdx = pagingData.currPosition;
        
        // If paging is disabled, put 'nextPageEnd' to the full activityListSize.
        var nextPageEnd = ( pagingData.enabled ) ? pagingData.currPosition + pagingData.pagingSize : activityListSize;
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

    me.evalBlockListScroll = function()
    {
        //Infinite Scroll

        var currScrollTop = $( 'body' ).scrollTop();
        var scrollDirection = ( currScrollTop > me.lastScrollTop ) ? 'Down' : 'Up';

        me.lastScrollTop = currScrollTop;

        // Scroll only if this tag is visible, and there are activities
        if ( me.listTableTbodyTag.is( ":visible" ) && me.activityList.length > 0 && ! me.scrollLoadingNextPage )
        {                    
            if ( scrollDirection === 'Down' && ( me.pagingData.endAlreadyReached === undefined || me.pagingData.endAlreadyReached === false ) )
            {
                //doc height
                var docHeight = $( document ).height();

                //scroll position (on screen)
                var scrollPos = $( 'body' ).scrollTop() + $( 'body' ).height();

                // fire if the scroll position is within 100 pixels above the bottom of the page
                if ( scrollPos > ( docHeight - 100 ) )  
                {
                    me.scrollList();
                }
            }
        }

    };


    // Get next paging amount data and display it
    me.scrollList = function()
    {
        me.scrollLoadingNextPage = true;
        me.cwsRenderObj.pulsatingProgress.show();

        // 2. check current paging, get next paging record data.. - populateActivityList has this in it.
        me.populateActivityCardList( me.activityList, me.viewGroupByData, me.listTableTbodyTag, function(){

            me.scrollLoadingNextPage = true;
            me.cwsRenderObj.pulsatingProgress.show();

        }, function(){

            setTimeout( function() { 

                me.cwsRenderObj.pulsatingProgress.hide(); 
                me.scrollLoadingNextPage = false;

            }, 250 );

        } );
    };

    
    // ------------------------------------
    // --- Create Activity Card Related -------------

    me.createActivityCard = function( activityJson, listTableTbodyTag, viewGroupByData )
    {
        var activityCardTrTag = $( me.template_divActivityTag );

        activityCardTrTag.attr( 'itemId', activityJson.id );

        var groupAttrVal = me.setGroupDiv( activityJson, viewGroupByData, listTableTbodyTag );

        activityCardTrTag.attr( 'group', groupAttrVal );

        listTableTbodyTag.append( activityCardTrTag );     

        return new ActivityCard( activityJson.id, me.cwsRenderObj );
    };


    // ------------------------------------
    // --- Create GROUP Related -------------

    me.setGroupDiv = function( activityJson, viewGroupByData, listTableTbodyTag )
    {
        var groupAttrVal = '';

        try
        {            
            if ( viewGroupByData && viewGroupByData.groupByUsed )
            {
                var groupJson = viewGroupByData.activitiesRefGroupBy[ activityJson.id ];

                groupAttrVal = groupJson.id;

                if ( groupJson.id !== undefined )
                {        
                    // get previous activity groupBy
                    var lastActivityTrTag = listTableTbodyTag.find( 'div.activity' ).last();

                    if ( lastActivityTrTag && lastActivityTrTag.length === 1 )
                    {
                        // get groupby
                        var lastGroupId = lastActivityTrTag.attr( 'group' );

                        if ( lastGroupId )
                        {                    
                            if ( groupJson.id !== lastGroupId )
                            {
                                // create groupBy Tag..                        
                                me.createGroupDiv( groupJson, listTableTbodyTag );
                            }
                        }
                    }
                    else
                    {
                        // if 1st one, create the group tag..
                        me.createGroupDiv( groupJson, listTableTbodyTag );
                    }
                }
            }
        }
        catch( errMsg )
        {
            console.log( 'Error in BlockList.setGroupDiv(), errMsg: ' + errMsg );
        }

        return groupAttrVal;
    };


    me.createGroupDiv = function( groupJson, listTableTbodyTag )
    {
        var groupTrTag = $( me.template_groupDivTag );
        groupTrTag.attr( 'group', groupJson.id );

        var tdGroupTag = groupTrTag.find( 'div.blockListGroupBySection' );
        tdGroupTag.text( groupJson.name + ' (' + groupJson.activities.length + ')' ); // attr( 'group', groupJson.id ).

        // Set event
        me.setTdGroupClick( tdGroupTag, listTableTbodyTag );


        listTableTbodyTag.append( groupTrTag );

        return groupTrTag;
    };


    me.setTdGroupClick = function( tdGroupTag, tableTag )
    {
        tdGroupTag.off( 'click' ).click( function() 
        {
            try
            {    
                var tdGroupClickTag = $( this );

                var trTag = tdGroupClickTag.closest( 'div.blockListGroupBy' );
                var opened = trTag.hasClass( 'opened' );
                var groupId = trTag.attr( 'group' );
                
                var activityTrTags = tableTag.find( 'div.activity[group="' + groupId + '"]' );
        
                // Toggle 'opened' status..
                if ( opened )
                {
                    // hide it
                    trTag.removeClass( 'opened' );
                    activityTrTags.hide();
                } 
                else 
                {
                    trTag.addClass( 'opened' );
                    activityTrTags.show( 'fast' );
                }
            }
            catch( errMsg )
            {
                console.log( 'Error in BlockList.setTdGroupClick(), errMsg: ' + errMsg );
            }
        });        
    };


    // ===========================================================
    // === Exposed to Outside Methods ============

    // =============================================
    // === OTHER METHODS ========================

    // =============================================

    me.initialize();
}