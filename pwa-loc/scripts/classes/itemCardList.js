// =========================================
//   ItemCardList Class/Methods
//          - Display List like 'ItemCardList' - within BlockObject (Parent)
// -------------------------------------------------

function ItemCardList( cwsRenderObj, blockObj, blockDefJson ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;     
    me.blockDefJson = blockDefJson;   

    me.itemCardList = [];

    me.scrollEnabled = true;
    //me.scrollLoadingNextPage = false;
    me.lastScrollTop = 0;  // For tracking scroll up vs down
    me.scrollingTimeOutId;
    me.scrollingTimeOutDuration = 2000;  // 1 sec is 1000
    me.scrollFireHeight = 10; // The hight it will fire the scrolling before reaching bottom
    
    me.blockListDiv_marginBottom = '0px'; // To Lift the list, avoid collpase with Fav.

    // Paging is false..
    me.pagingData = { "enabled": false, "pagingSize": 100 }; ///ConfigManager.getSettingPaging();
    me.pagingData.currPosition = 0;

    me.useLocalClientMatch = true;  // The passed data (client) will check clientId to see if local client exists and usee local one.

    // -------- Tags --------------------------

    me.listTableTbodyTag;    // was me.blockList_UL_Tag;
    //me.listBottomDivTag;

    // --------- Templates --------------------

    me.template_listDivTag = `<div class="list" />`;

    // BELOW USED TO HAVE/START WITH: <div class="client emptyList">
    me.template_divItemDetailEmptyTag = `<div class="item emptyList">
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
        me.setUpInitialData( me.cwsRenderObj, me.blockDefJson );

        me.setClassEvents( me.cwsRenderObj );
    };

    // --------------------------------------- --------

    //  Render BlockList
    me.render = function( blockTag, passedData, options )
    {        
        // Clear previous UI & Set containerTag with templates
        me.clearClassTag( blockTag );        

        // Does not have fav in here.
        // blockTag.css( 'margin-bottom', me.blockListDiv_marginBottom ); // For 'Fav' button not overlapping..

        me.listTableTbodyTag = me.setClassContainerTag( blockTag );

        
        // Set class level tags
        me.setClassVariableTags( blockTag );


        // 2. Data Set - passed data.
        me.itemCardList = ( passedData && passedData.itemJsonList ) ? passedData.itemJsonList: [];
        

        // 3. Populate controls - ItemCardLists, viewFilter/sort, related.
        me.populateControls( me.blockDefJson, me.itemCardList, me.listTableTbodyTag );


        if ( me.blockDefJson.bottomButton ) me.populateBottomButton( me.blockDefJson.bottomButton, me.listTableTbodyTag, blockTag );


        TranslationManager.translatePage();
    };


    me.populateBottomButton = function( bottomButtonDef, listTableTbodyTag, blockTag )
    {
        var btnJson = FormUtil.getObjFromDefinition( bottomButtonDef, ConfigManager.getConfigJson().definitionButtons );

        if ( btnJson )
        {
            // NOTE: If bottom button exists, it will add bottom layer, which we should give bottom space on list by margin-bottom
            listTableTbodyTag.css( 'margin-bottom', '100px' );

            // ---------------------------------
            // button button..
            var sheetBottomBtnDivTag = $( Templates.sheetBottomBtn );
            blockTag.append( sheetBottomBtnDivTag );
    
    
            var titleMsgTag = sheetBottomBtnDivTag.find( 'div.sheetBottomBtnTitle' );
            if ( !btnJson.titleMsg ) btnJson.titleMsg = { title: '', term: '' }; //else titleDivTag.hide();
            titleMsgTag.text( Util.getStr( btnJson.titleMsg.title ) ).attr( 'term', Util.getStr( btnJson.titleMsg.term ) );
    
    
            var sheetBottomBtnTag = sheetBottomBtnDivTag.find( 'div.sheetBottomBtn' );
            sheetBottomBtnTag.find( 'div.button-label' ).text( btnJson.defaultLabel ).attr( 'term', Util.getStr( btnJson.term ) ); //'New Client' );  // btnJson.name
    
            if ( btnJson.onClick )
            {
                sheetBottomBtnTag.click( function() 
                {        
                    //GAnalytics.setEvent( 'ButtonClick', btnId, 'formButton', 1 );
                    MsgManager.msgAreaClearAll();
                    //if ( me.networkModeNotSupported( btnJson, ConnManagerNew.statusInfo.appMode ) )
        
                    var formDivSecTag = undefined;
                    var passedData = {};
        
                    var actionObj = new Action( me.cwsRenderObj, me.blockObj );
                    actionObj.handleClickActions( sheetBottomBtnTag, btnJson.onClick, me.blockObj.parentTag, blockTag, formDivSecTag, passedData );
                });        
            }
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

    me.setUpInitialData = function( cwsRenderObj, blockDefJson )
    {
        me.itemCardList = [];
        //me.hasView = ( blockDefJson.itemCardListViews && blockDefJson.itemCardListViews.length > 0 );
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

        //me.listBottomDivTag = $( ItemCardList.template_listBottomDivTag );
        //blockTag.append( me.listBottomDivTag );

        return listTableTag; //listTableTag.find( 'tbody' );
    };


    me.setClassVariableTags = function( blockTag )
    {
        me.blockTag = blockTag;
    };


    me.populateControls = function( blockDefJson, itemCardList, listTableTbodyTag )
    {
        me.pagingDataReset( me.pagingData );

        me.populateItemCardList( itemCardList, listTableTbodyTag, blockDefJson, me.scrollStartFunc ); //, me.scrollEndFunc );
    };

    me.clearExistingList = function( listTableTbodyTag )
    {
        listTableTbodyTag.find( 'div.item' ).remove();
    };


    // ----------------------------------------

    // ===========================================================
    // === #1 Render() Related Methods ============

    // Previously ==> me.renderBlockList_Content( blockTag, me.cwsRenderObj, me.blockObj );
    // Add paging here as well..
    me.populateItemCardList = function( itemCardList, listTableTbodyTag, blockDefJson, scrollStartFunc, scrollEndFunc )
    {
        if ( itemCardList.length === 0 ) 
        {
            // If already have added emtpyList, no need to add emptyList
            if ( listTableTbodyTag.find( 'div.emptyList' ).length === 0 )
            {
                if ( blockDefJson.emtpyListMsg ) listTableTbodyTag.append( blockDefJson.emtpyListMsg );
                else listTableTbodyTag.append( $( me.template_divItemDetailEmptyTag ) );
            }

            // Need to hide the ending/more indication bottom tag..
            // me.listBottomDivTag.hide();
        }
        else
        {
            // Designed to handle with/without scrolling:
            // If setting has no scrolling/paging, me.pagingData has 'enabled': false, and will return endPos as full list size.
            var currPosJson = me.getCurrentPositionRange( itemCardList.length, me.pagingData );
            me.setNextPagingData( me.pagingData, currPosJson );            

            //me.pagingData.endAlreadyReached = currPosJson.endReached_Previously;
            me.pagingData.endReached = currPosJson.endReached;  // endReached - could been reached with this page or already..

            if ( !currPosJson.endReached_Previously )
            {
                if ( scrollStartFunc && currPosJson.startPosIdx > 0 ) scrollStartFunc();

                //for( var i = 0; i < itemCardList.length; i++ )
                for ( var i = currPosJson.startPosIdx; i < currPosJson.endPos; i++ )
                {
                    var itemJson = itemCardList[i];

                    var itemCardObj = new ItemCard( itemJson, listTableTbodyTag, blockDefJson, blockObj );
                    itemCardObj.render();
                }    
            }

            // If paging is enabled, display the paging status
            // if ( me.pagingData.enabled ) ItemCardList.showListButtonNote( me.listBottomDivTag, currPosJson.endReached );

            TranslationManager.translatePage();
        }
    };

    // ------------------------------------
    // --- Paging Related -------------

    me.getCurrentPositionRange = function( itemCardListSize, pagingData )
    {
        var currPosJson = { 'endReached': false };
        currPosJson.startPosIdx = pagingData.currPosition;
        
        // If paging is disabled, put 'nextPageEnd' to the full itemCardListSize.
        var nextPageEndPos = ( pagingData.enabled ) ? pagingData.currPosition + pagingData.pagingSize : itemCardListSize;
        if ( nextPageEndPos >= itemCardListSize ) 
        {
            nextPageEndPos = itemCardListSize;  // if nextPageEnd is over the limit, set to limit.
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
        if ( me.listTableTbodyTag.is( ":visible" ) && me.itemCardList.length > 0 ) // && !me.scrollLoadingNextPage )
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

        // 2. check current paging, get next paging record data.. - populateItemCardList has this in it.
        me.populateItemCardList( me.itemCardList, me.listTableTbodyTag, me.scrollStartFunc ); //, me.scrollEndFunc );

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
    // --- Create Item Card Related -------------

    // =============================================
    // === OTHER METHODS ========================

    // =============================================

    me.initialize();
};


ItemCardList.showListButtonNote_BACK = function( listBottomTag, endReached )
{
    var endNoteText = ( endReached ) ? '[ -------------------- END -------------------- ]' : 'MORE';
    listBottomTag.css( 'color', '#4753A3' ).text( endNoteText );

    listBottomTag.show();
};

ItemCardList.showListButtonNote = function( listBottomTag, endReached, scrollListCall )
{
    listBottomTag.html( '' );

    var textDivTag = $( '<div style="text-align: center; color: #4753A3; display: inline-block;"></div>' );
    var endNoteText = '';

    if ( endReached ) endNoteText = '[ -------------------- END -------------------- ]';
    else
    {
        endNoteText = 'MORE';
        textDivTag.css( 'cursor', 'pointer' ).addClass( 'mouseDown' ).click( scrollListCall );
    }

    textDivTag.text( endNoteText );
    listBottomTag.append( textDivTag ).show();
};


ItemCardList.template_listBottomDivTag = `<div class="listBottom" style="text-align: center; color: #4753A3; display:none;"></div>`;
