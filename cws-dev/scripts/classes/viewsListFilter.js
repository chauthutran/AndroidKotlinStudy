// ViewsList class >> fetches 'views' from dcdConfig (definitionActivityListViews)
// First draft pseudoCode write up (2020-02-05): greg
// - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- ---
//
// 1. create viewsList controller ( and other control(s?) )
//  
//      1.1 create viewsList control
//
// 2. create viewsList sorter
//  
//      2.1 create sortList control
//      2.2 populate sortList items
//
// 3. run/apply viewsList-filter query
//
//      3.1 set current viewsList item
//
//      3.2 fetch activityData with filter 
//      3.2.1 get activityData
//      3.2.2 run filter rules against activityData
//        >> *change run against 'memory' redeemList/activityList data (right now doing getDataManager fetch)
//
//      3.3 run/apply sorting on fitered-activityData
//
// 4. run/apply sortOrder
//
// 5. pass payload to blockList 

// - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- ---


// CHANGE: blockList has a copy of activityItemList..  
// At start of blockList, 

// If view list in config does not exist, blockList.activityItemList = [];
//  and do copy of array contents..  for... blockList.activityItemList each,  activityItemList.push( cwsRender._activityList.list.items);

// If we do have 'viewList' in blockList config, depends on the selection of the view, 
// we generate different list, we use cwsRender._activityList.list.items to filter or sort and push to --> blockList.activityItemList.push( );
// list blockList.activityItemList

// What we didn't describe --> html generation...  <-- 100 by filter --> you are displaying 15 at a time..
function blockListViewList( blockList, blockList_UL_Tag, callBack )
{
    var me = this;

    me.blockListObj = blockList;
    me.blockList_UL_Tag = blockList_UL_Tag;

    me.mainList = me.blockListObj.cwsRenderObj._activityListData.list;
    me.viewsDefinitionList = FormUtil.dcdConfig.definitionActivityListViews; // full complete view def list
    me.viewDefs = [];

    me.viewDef_Selected;  // Need to set 'undefined' when view is cleared?

    me.viewFilteredList = [];
    //me.viewsList_CurrentItem;
    
    
    // View Filter Related Tag
    me.selectTag;
    //me.recordPager;

    // Sort Related Tag
    me.sortListButtonTag; // sortList_Tagbutton
    me.sortListUlTag; // sortList_TagUL


    // TODO: On Config, 'sort' need to be moved to definitions...

    me.containerTagTemplate = `
        <div class="viewsFilterAndSortContainer inputDiv">
            <div class="viewsFilter">
                <label term="" class="from-string titleDiv">Select a view</label>
                <div class="viewsListContainerTag">
                    <div class="select divViewsListSelector" style="flex-grow:1;">
                        <select class='selector selViewsListSelector'></select>
                    </div>            
                </div>                
            </div>

            <div class="viewsSorter">
                <button class="buttonSortOrder"></button>
                <ul class="ulSortOrder" ></ul>            
            </div>

        </div>
    `;

    
    me.viewOptionTagTemplate = `<option value=""></option>`;
    me.sortLiTagTemplat = `<li class="liSort" sortid="" ></li>`;


    // ----------------------------

    me.initialize = function()
    {
        me.setViewFilterData();

        me.create_UI_Controls( me.blockList_UL_Tag, me.containerTagTemplate, me.viewDefs );

        me.runFirstView( me.activityListViews ); 
        // BUT WE ALSO NEED TO APPLY THE 1ST SORT AS WELL.. 
    };

    // ----------------------------

    me.setViewFilterData = function()
    {
        // Set Filter View name list and those view's definition info.
        me.activityListViews = me.blockListObj.blockObj.blockJson.activityListViews;  // These are just named list..  We need proper def again..
        me.viewDefs = me.getActivityListViewDefinitions( me.activityListViews, me.viewsDefinitionList );
    };


    me.create_UI_Controls = function ( blockList_UL_Tag, containerTagTemplate, viewDefs )
    {
        blockList_UL_Tag.append( containerTagTemplate );

        // View Filter Tags
        me.selectTag = blockList_UL_Tag.find( 'select.selViewsListSelector' );

        me.populateViewList( viewDefs, me.selectTag );
        me.setViewListEvent( me.selectTag );


        // Sort Related Tags
        me.sortListButtonTag = blockList_UL_Tag.find( 'button.buttonSortOrder' ); // sortList_Tagbutton
        me.sortListUlTag = blockList_UL_Tag.find( 'ul.ulSortOrder' ); // sortList_TagUL
        
        // sort button click related event
        me.setSortOtherEvents( me.sortListButtonTag );

        // sort populate & click event are set on view selection
        //me.sortListConfig = me.viewItemObj.sort; 
        //me.populateSorts( me.sortListUlTag );
    };


    me.runFirstView = function( activityListViews )
    {
        if ( activityListViews && activityListViews.length > 0 )
        {            
            me.switchViewNSort( activityListViews[ 0 ], me.viewDefs, me.mainList );
        }
    };


    // ============================================

    // 
    me.getActivityListViewDefinitions = function( activityViewNameList, viewsDefinitionList )
    {
        var retObj = [];

        for ( var i = 0; i < activityViewNameList.length; i++ )
        {
            var viewName = activityViewNameList[i];
            var viewDef = viewsDefinitionList[ viewName ];

            if ( viewDef ) retObj.push ( viewDef );
            //name: viewsDef[ viewName ].name,
            //text: viewsDef[ viewName ].name,
            //query: viewsDef[ viewName ].query,
        }

        return retObj;
    };


    // -----------------------
    // -- Populate Control & Perform Filtering related..

    me.populateViewList = function( viewDefs, selectTag )
    {
        // Add options
        viewDefs.forEach( viewDef =>
        {
            var optionTag = $( me.viewOptionTagTemplate ).attr( 'value', viewDef.id ).html( viewDef.name );
            //`<option value="${viewDef.id}">${viewDef.name}</option>` );
            selectTag.append( optionTag );
        });
    };


    // -------------
    // -- Events

    me.setViewListEvent = function( selectTag )
    {
        selectTag.change( function() {
            me.switchViewNSort( $( this ).val(), me.viewDefs, me.mainList );
        });
    };


    me.setSortOtherEvents = function( sortListButtonTag )
    {
        sortListButtonTag.click( function() {
            me.sortListUlTag.css( "display", "flex" );
        });

        $( document ).click( function( event ) 
        {
            // If click target is not sortButton, hide the UL;            
            if ( event.target != me.sortListButtonTag[0] )
            {
                me.sortListUlTag.hide();
            }
        });

        // me.sortListUlTag click events are created when we create sort list from selected view
    };


    me.setSortLiTagClickEvent = function( liTag )
    {
        liTag.click( function()
        {
            var sortId = $( this ).attr( 'sortid' );

            // get sortId and get sortDef from it..
            var sortDef = Util.getFromList( sortDefs, sortId, "id" );

            if ( sortDef )
            {
                me.sortList( sortDef, me.viewFilteredList );                        

                me.blockListObj.reRender( me.viewFilteredList );  // there is 'callBack' param..            
            }
        });
    };


    // -------------------------------------
    // -- View Filter Operation Related

    me.switchViewNSort = function( viewName, viewDefs, mainList )
    {
        //me.viewsList_CurrentItem = viewItem;
        //var viewDef = me.getViewsItemConfig( viewName );
        me.viewDef_Selected = Util.getFromList( viewDefs, viewName, "id" );

        me.viewFilteredList = me.viewFilterData( me.viewDef_Selected, mainList ); 
        

        // Populate Sort List - based on viewDef..
        me.populateSorts( me.sortListUlTag, me.viewDef_Selected.sort ); 

        // Sort with 1st one..
        me.sortList_1stOne( me.viewDef_Selected.sort, me.viewFilteredList );


        // Once the viewFiltered List is decided and sorted, reRender it 
        me.blockListObj.reRender( me.viewFilteredList );  // there is 'callBack' param..            
    };


    me.viewFilterData = function( viewDef, mainList )
    {
        var filteredData = []; 

        for ( var i = 0; i < mainList.length; i++ )
        {
            var activityItem = mainList[ i ];

            // Below eval use 'activityItem' object, thus, we need to declare it..
            if ( me.evalQueryCondition( viewDef.query, activityItem ) )
            {
                filteredData.push( activityItem );
            }
        }

        return filteredData;
    };

    me.evalQueryCondition = function( query, activityItem )
    {
        // NOTE: Param 'activityItem' object is assumed to be used within 'query' statement, thus, do not remove it.
        var success = false;

        try {
            success = eval( query );
        }
        catch ( err ) {
            console.log( 'error evaluating viewList query : ' + err);
        }

        return success;
    };

    
    // -------------------------------------
    // -- Sorting Operation Related

    me.populateSorts = function ( sortListUlTag, sortList )
    {
        sortListUlTag.empty();

        if ( sortList )
        {
            for ( var i = 0; i < sortList.length; i++ )
            {
                var sortDef = sortList[ i ];
                var liTag = $( me.sortLiTagTemplat ).attr( 'sortid', sortDef.id ).html( sortDef.name );
                // `<li class="liSort selected" sortid="${sortDef.id}" >${sortDef.name}</li>` );

                sortListUlTag.append( liTag );
    
                me.setSortLiTagClickEvent( liTag );
    
                //if ( sortObj.groupAfter != undefined && sortObj.groupAfter === 'true' )
                //{
                //    var liGroup = $(`<li><hr class="filterGroupHR"></li>`);
                //    me.sortList_TagUL.append( liGroup );
                //}
            }                
        }

        // For below, we can use .css to mark the bold for selected.
        // me.updateMenuItem_Tag( me.sortListUlTag.children()[0] );
    };


    me.sortList_1stOne = function( sortDefs, viewFilteredList )
    {
        if ( sortDefs && sortDefs.length > 0 )
        {
            me.sortList( sortDefs[0], viewFilteredList );
        }
    };


    me.sortList = function( sortDef, viewFilteredList )
    {
        try 
        {
           me.evalSort( sortDef.field, viewFilteredList, sortDef.order.toLowerCase() );
        }
        catch ( errMsg ) 
        {
            console.log( 'Error on blockListViewList.sortList, errMsg: ' + errMsg );
        }                   
    };


    // Could be Util method...
    me.evalSort = function( fieldEvalStr, list, orderStr )
    {
        var isDescending = orderStr.indexOf( 'desc' );

        list.sort( function(a, b) {

            var sortEval = ( isDescending ) ? '( a.' + fieldEvalStr + ' < b.' + fieldEvalStr + ' ) ? -1 : ' +
                                ' ( b.' + fieldEvalStr + ' < a.' + fieldEvalStr + ' ) ? 1 ' +
                                ' : 0 '
                            : '( a.' + fieldEvalStr + ' > b.' + fieldEvalStr + ' ) ? -1 : ' +
                                ' ( b.' + fieldEvalStr + ' > a.' + fieldEvalStr + ' ) ? 1 ' +
                                ' : 0 ';
    
            return eval( sortEval );    
        });          
    };


    // =-===============================

    me.initialize();
}
