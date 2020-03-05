// =========================================
//   BlockListViewList Class/Methods
//          - View List - filter by view dropdown and sorting controls
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
//          1. Initialize() - Set some variables like 
//                  - viewListNames from the block definition
//                  - viewListDefinition which holds detailed properties of view (for each view in viewListNames)
//                  - mainList which is the full list of activities from cwsRender Object
//
//          2. Render() - setUp the controls and populate the view list (select option tags with data)
//                  - set rendered control events
//
//          3. viewSelect_1st - called to select 1st 'view' on populated View List
//
//          4. Sort Populate and Event - are done when 'view' is selected due to each view has sorting list & definitions
//
// =========================================
function blockListViewList( blockList, blockList_UL_Tag, callBack )
{
    var me = this;

    me.blockListObj = blockList;
    me.blockList_UL_Tag = blockList_UL_Tag;

    me.mainList; // = me.blockListObj.cwsRenderObj._activityListData.list;
    me.viewsDefinitionList; // = FormUtil.dcdConfig.definitionActivityListViews; // full complete view def list
    me.viewListDefs = [];

    me.viewDef_Selected;  // Need to set 'undefined' when view is cleared?

    me.viewFilteredList = [];
    //me.viewsList_CurrentItem;
    
    me.viewListNames = [];  // List of view names - used on this blockList

    // --- Tags -----------------------
    // View Filter Related Tag
    me.viewSelectTag;
    //me.recordPager;

    // Sort Related Tag
    me.sortListButtonTag; // sortList_Tagbutton
    me.sortListUlTag; // sortList_TagUL


    // --- Templates ----------------
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
        me.setUpInitialData();
    };
    
    // ----------------------------

    me.render = function()
    {
        // Clear previous UI & Set containerTag with templates
        me.clearClassTag( me.blockList_UL_Tag );        
        me.setClassContainerTag( me.blockList_UL_Tag, me.containerTagTemplate );

        // Set viewList/sort related class variables
        me.setClassVariableTags( me.blockList_UL_Tag );
        
        // Populate controls - view related.  Sort related are done in view select event handling.
        me.populateControls( me.viewListDefs, me.viewSelectTag );

        // Events handling
        me.setRenderEvents( me.viewSelectTag, me.sortListButtonTag );
    };

    // ----------------------------
    
    me.viewSelect_1st = function()
    {
        var firstOptionVal = me.viewSelectTag.find( 'option.first' ).attr( 'value' );
        
        me.viewSelectTag.val( firstOptionVal ).change();        
    };

    //me.sortSelect_1st = function()
    //{
    //    me.sortListUlTag.find( 'li.liSort:first' ).click();       
    //};

    // ----------------------------

    me.setUpInitialData = function()
    {
        me.mainList = me.blockListObj.cwsRenderObj._activityListData.list;
        me.viewsDefinitionList = FormUtil.dcdConfig.definitionActivityListViews; // full complete view def list    

        // Set Filter View name list and those view's definition info.
        me.viewListNames = me.blockListObj.blockObj.blockJson.viewListNames;  // These are just named list..  We need proper def again..
        me.viewListDefs = me.getActivityListViewDefinitions( me.viewListNames, me.viewsDefinitionList );
    };

    // -----------------

    me.clearClassTag = function( blockList_UL_Tag )
    {
        // Clear any previous ones of this class
        blockList_UL_Tag.find( 'div.viewsFilterAndSortContainer' ).remove();
    };

    me.setClassContainerTag = function( blockList_UL_Tag, containerTagTemplate )
    {
        // Set HTML from template 
        blockList_UL_Tag.append( containerTagTemplate );
    };

    me.setClassVariableTags = function ( blockList_UL_Tag )
    {
        // View Filter Tags
        me.viewSelectTag = blockList_UL_Tag.find( 'select.selViewsListSelector' );
        // Sort Related Tags
        me.sortListButtonTag = blockList_UL_Tag.find( 'button.buttonSortOrder' ); // sortList_Tagbutton
        me.sortListUlTag = blockList_UL_Tag.find( 'ul.ulSortOrder' ); // sortList_TagUL
    };


    me.populateControls = function ( viewListDefs, viewSelectTag )
    {
        // Populate ViewList (select tag options, which is each view)       
        me.populateViewList( viewListDefs, viewSelectTag );

        // Populate Sort is done in 'View' select event
        //    Since selected view contains the sorting definition.
    };


    me.setRenderEvents = function ( viewSelectTag, sortListButtonTag )
    {
        // Set Event, View - View select event
        me.setViewListEvent( viewSelectTag );
        
        // Set Event, Sort - Sort button click related event, not main sort selection event
        me.setSortOtherEvents( sortListButtonTag );

        // Set Sort selection/click Event (Main one) is done in 'View' select event
        //    Since selected view contains the sorting definition.
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

    me.populateViewList = function( viewListDefs, viewSelectTag )
    {
        // Add options
        viewListDefs.forEach( viewDef =>
        {
            var optionTag = $( me.viewOptionTagTemplate ).attr( 'value', viewDef.id ).html( viewDef.name );
            //`<option value="${viewDef.id}">${viewDef.name}</option>` );
            viewSelectTag.append( optionTag );
        });
    };


    // -------------
    // -- Events

    me.setViewListEvent = function( viewSelectTag )
    {
        viewSelectTag.change( function() {
            me.switchViewNSort( $( this ).val(), me.viewListDefs, me.mainList );
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

    me.switchViewNSort = function( viewName, viewListDefs, mainList )
    {
        //me.viewsList_CurrentItem = viewItem;
        //var viewDef = me.getViewsItemConfig( viewName );
        me.viewDef_Selected = Util.getFromList( viewListDefs, viewName, "id" );

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
