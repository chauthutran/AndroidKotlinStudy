// =========================================
//   ClientList Class/Methods
//          - Display List like 'clientList' - within BlockObject (Parent)
// -------------------------------------------------

function ClientList( cwsRenderObj, blockObj, blockJson ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;     
    me.blockJson = blockJson;   
    me.blockTag;

    me.clientList = [];
    me.viewGroupByData; // set from '---ListView'
    me.viewDef_Selected;

    me.hasView = false;  
    me.clientListViewObj;

    me.scrollEnabled = true;
    //me.scrollLoadingNextPage = false;
    me.lastScrollTop = 0;  // For tracking scroll up vs down
    me.scrollingTimeOutId;
    me.scrollingTimeOutDuration = 2000;  // 1 sec is 1000
    me.scrollFireHeight = 10; // The hight it will fire the scrolling before reaching bottom
    
    me.blockListDiv_marginBottom = '30px'; // To Lift the list, avoid collpase with Fav.

    me.pagingData = ConfigManager.getSettingPaging();
    me.pagingData.currPosition = 0;

    // -------- Tags --------------------------

    me.listTableTbodyTag;    // was me.blockList_UL_Tag;
    me.listBottomDivTag;

    // --------- Templates --------------------
    me.template_clientListReRenderTag = `<div class="clientListRerender" style="float: left; width: 1px; height: 1px;"></div>`;

    me.template_listDivTag = `<div class="list" />`;

    me.template_divClientDetailEmptyTag = `<div class="client emptyList">
            <div class="list_three_line" term="${Util.termName_listEmpty}">List is empty.</div>
    </div>`;

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
        me.blockTag = blockTag;
        me.clearClassTag( blockTag ); // Clear previous UI & Set containerTag with templates
        blockTag.css( 'margin-bottom', me.blockListDiv_marginBottom ); // For 'Fav' button not overlapping..

        me.listTableTbodyTag = me.setClassContainerTag( blockTag );

        // Other Initial Render Setups - syncDown setup, FavIcons, etc..
        var favIconsObj = new FavIcons( 'clientListFav', blockTag, me.cwsRenderObj.pageDivTag, { 'favMainIcon': 'images/favMain_search.svg' } );
        favIconsObj.render();


        // Populate controls - clientLists, viewFilter/sort, related.
        me.populateControls( me.blockJson, me.hasView, me.clientList, me.listTableTbodyTag );


        // Clickable rerender setup
        me.setUpReRenderByClick( blockTag.find( 'div.clientListRerender' ) );
    };


    me.setUpReRenderByClick = function( clientListRerenderTag )
    {
        clientListRerenderTag.off( 'click' ).click( function( e ) {
            e.stopPropagation();  // Stops calling parent tags event calls..
            me.reRender();
        } );    
    };


    // Used by viewFilter.. - 
    me.reRenderWithList = function( newClientList, groupByData, viewDef_Selected ) //callBack )
    {
        if ( me.listTableTbodyTag )
        {
            $( 'body' ).scrollTop( 0 ); // Scroll top
            me.lastScrollTop = 0;

            me.clientList = newClientList;  // NOTE: We expect this list already 'cloned'...
            me.viewGroupByData = groupByData;
            me.viewDef_Selected = viewDef_Selected;

            me.clearExistingList( me.listTableTbodyTag ); // remove li.clientItemCard..
            me.pagingDataReset( me.pagingData );

            // TEMP
            //me.scrollLoadingNextPage = true;
            //me.cwsRenderObj.pulsatingProgress.show();

            // This removes the top view - if view exists..
            me.populateClientCardList( me.clientList, me.viewGroupByData, me.viewDef_Selected, me.listTableTbodyTag, me.scrollStartFunc ); //, me.scrollEndFunc );

        }
        else
        {
            console.log( 'ERROR on blockList.reRenderWithList - blockList_UI_Tag not available - probably not rendered, yet' );
        } 
    };


    me.reRender = function( callBack )
    {
        // When reRendering, if view exists, select 1st view to render the 1st view list.
        // If no view, list full data as they are.
        if ( me.hasView ) me.clientListViewObj.viewSelect_1st(); 
        else 
        {
            var newClientList = Util.cloneJson( ClientDataManager.getClientList() );

            me.reRenderWithList( newClientList, me.viewGroupByData, me.viewDef_Selected ); //, callBack );    
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
        me.clientList = Util.cloneJson( ClientDataManager.getClientList() );
        //me.blockJson = blockJson;
        
        me.hasView = ( blockJson.clientListViews && blockJson.clientListViews.length > 0 );
    };


    me.clearClassTag = function( blockTag )
    {
        // Clear any previous ones of this class
        blockTag.find( 'table.list' ).remove();
    };

    me.setClassContainerTag = function( blockTag )
    {
        blockTag.append( me.template_clientListReRenderTag );

        var listTableTag = $( me.template_listDivTag );
        blockTag.append( listTableTag );

        me.listBottomDivTag = $( ItemCardList.template_listBottomDivTag );
        blockTag.append( me.listBottomDivTag );

        return listTableTag; //listTableTag.find( 'tbody' );
    };


    me.populateControls = function ( blockJson, hasView, clientList, listTableTbodyTag )
    {

        if ( hasView )
        {
            me.clientListViewObj = new ClientListView( me.cwsRenderObj, me, blockJson.clientListViews );
            me.clientListViewObj.render();

            // After setting up 'view', select 1st one will fire (eventually) 'reRender' of this class ( 'populateClientCardList' with some clean up )?
            me.clientListViewObj.viewSelect_1st();    
        }
        else
        {
            me.pagingDataReset( me.pagingData );

            me.populateClientCardList( clientList, me.viewGroupByData, me.viewDef_Selected, listTableTbodyTag, me.scrollStartFunc ); //, me.scrollEndFunc );
        }
    };

    me.clearExistingList = function( listTableTbodyTag )
    {
        listTableTbodyTag.find( 'div.client' ).remove();
        listTableTbodyTag.find( 'div.blockListGroupBy' ).remove();
    };


    // ----------------------------------------

    // ===========================================================
    // === #1 Render() Related Methods ============

    // Previously ==> me.renderBlockList_Content( blockTag, me.cwsRenderObj, me.blockObj );
    // Add paging here as well..
    me.populateClientCardList = function( clientList, viewGroupByData, viewDef_Selected, listTableTbodyTag, scrollStartFunc ) //scrollEndFunc )
    {
        if ( clientList.length === 0 ) 
        {
            // If already have added emtpyList, no need to add emptyList
            if ( me.listTableTbodyTag.find( 'div.emptyList' ).length === 0 )
            {
                me.listTableTbodyTag.append( $( me.template_divClientDetailEmptyTag ) );
            }

            // Need to hide the ending/more indication bottom tag..
            me.listBottomDivTag.hide();
        }
        else
        {
            // Designed to handle with/without scrolling:
            // If setting has no scrolling/paging, me.pagingData has 'enabled': false, and will return endPos as full list size.
            var currPosJson = me.getCurrentPositionRange( clientList.length, me.pagingData );
            me.setNextPagingData( me.pagingData, currPosJson );            

            //me.pagingData.endAlreadyReached = currPosJson.endReached_Previously;
            me.pagingData.endReached = currPosJson.endReached;  // endReached - could been reached with this page or already..

            if ( !currPosJson.endReached_Previously )
            {
                if ( scrollStartFunc && currPosJson.startPosIdx > 0 ) scrollStartFunc();

                //for( var i = 0; i < clientList.length; i++ )
                for ( var i = currPosJson.startPosIdx; i < currPosJson.endPos; i++ )
                {
                    var clientJson = clientList[i];

                    var clientCardObj = me.createClientCard( clientJson, listTableTbodyTag, viewGroupByData, viewDef_Selected );

                    clientCardObj.render();
                }    
            }


            // If paging is enabled, display the paging status
            if ( me.pagingData.enabled ) ItemCardList.showListButtonNote( me.listBottomDivTag, currPosJson.endReached, me.scrollList );

            TranslationManager.translatePage();
        }
    };

    // ------------------------------------
    // --- Paging Related -------------

    me.getCurrentPositionRange = function( clientListSize, pagingData )
    {
        var currPosJson = { 'endReached': false };
        currPosJson.startPosIdx = pagingData.currPosition;
        
        // If paging is disabled, put 'nextPageEnd' to the full clientListSize.
        var nextPageEndPos = ( pagingData.enabled ) ? pagingData.currPosition + pagingData.pagingSize : clientListSize;
        if ( nextPageEndPos >= clientListSize ) 
        {
            nextPageEndPos = clientListSize;  // if nextPageEnd is over the limit, set to limit.
            currPosJson.endReached = true;
        }

        currPosJson.endPos = nextPageEndPos; 

        // Before start of this, end has reached already..
        currPosJson.endReached_Previously = ( currPosJson.startPosIdx === currPosJson.endPos );
        
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
        if ( me.listTableTbodyTag.is( ":visible" ) && me.clientList.length > 0 ) // && !me.scrollLoadingNextPage )
        {                    
            if ( scrollDirection === 'Down' 
                && !me.pagingData.endReached )
            {
                //doc height
                var docHeight = $( document ).height();

                //scroll position (on screen)
                var scrollPos = $( 'body' ).scrollTop() + $( 'body' ).height();

                // fire if the scroll position is within 100 pixels above the bottom of the page
                if ( scrollPos >= ( docHeight - me.scrollFireHeight ) )  // - 100  <-- due to 'listEnd' div + margin bottom, those cover the height..  
                {
                    me.scrollList();
                }
            }
        }

    };


    // Get next paging amount data and display it
    me.scrollList = function()
    {
        // TEMP STOP
        // me.scrollLoadingNextPage = true;
        // me.cwsRenderObj.pulsatingProgress.show();

        // 2. check current paging, get next paging record data.. - populateClientList has this in it.
        me.populateClientCardList( me.clientList, me.viewGroupByData, me.viewDef_Selected, me.listTableTbodyTag, me.scrollStartFunc ); //, me.scrollEndFunc );

    };


    // TODO: Need to mark it with ID?  for ending it?  OR a queue?
    me.scrollStartFunc = function()
    {
        // Used?
        //me.scrollLoadingNextPage = true;
        
        // Set time out of hiding..
        if ( me.scrollingTimeOutId ) clearTimeout( me.scrollingTimeOutId );
        me.cwsRenderObj.pulsatingProgress.show();
        me.scrollingTimeOutId = setTimeout( function() { me.cwsRenderObj.pulsatingProgress.hide() }, me.scrollingTimeOutDuration );
    };

    me.scrollEndFunc = function()
    {
        //me.cwsRenderObj.pulsatingProgress.hide(); 
        //me.scrollLoadingNextPage = false;
        //setTimeout( function() { }, 250 );
    };

    // Want to start over the pulsa if new request is made...
    
    // ------------------------------------
    // --- Create Client Card Related -------------

    me.createClientCard = function( clientJson, listTableTbodyTag, viewGroupByData, viewDef_Selected )
    {
        var groupAttrVal = me.setGroupDiv( clientJson, viewGroupByData, listTableTbodyTag );

        var clientCard = new ClientCard( clientJson._id, { viewDef_Selected: viewDef_Selected } );

        listTableTbodyTag.append ( clientCard.createClientCardTag( groupAttrVal ) );

        return clientCard;
    };


    // ------------------------------------
    // --- Create GROUP Related -------------

    me.setGroupDiv = function( clientJson, viewGroupByData, listTableTbodyTag )
    {
        var groupAttrVal = '';

        try
        {            
            if ( viewGroupByData && viewGroupByData.groupByUsed )
            {
                var groupJson = viewGroupByData.activitiesRefGroupBy[ clientJson._id ];

                groupAttrVal = groupJson.id;

                if ( groupJson.id !== undefined )
                {        
                    // get previous client groupBy
                    var lastClientTrTag = listTableTbodyTag.find( 'div.client' ).last();

                    if ( lastClientTrTag && lastClientTrTag.length === 1 )
                    {
                        // get groupby
                        var lastGroupId = lastClientTrTag.attr( 'group' );

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
        var tdGroupSpanTag = $( '<span></span>' );
        tdGroupSpanTag.text( groupJson.name );
        if( groupJson.term ) tdGroupSpanTag.attr( 'term', groupJson.term );
    
        tdGroupTag.append( tdGroupSpanTag );
        tdGroupTag.append( '<span style="margin-left: 5px;">(' + groupJson.activities.length + ')' + '</span>' );
        //tdGroupTag.text( groupJson.name +  ); // attr( 'group', groupJson.id ).

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
                
                var clientTrTags = tableTag.find( 'div.client[group="' + groupId + '"]' );
        
                // Toggle 'opened' status..
                if ( opened )
                {
                    // hide it
                    trTag.removeClass( 'opened' );
                    clientTrTags.hide();
                } 
                else 
                {
                    trTag.addClass( 'opened' );
                    clientTrTags.show( 'fast' );
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