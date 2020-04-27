// =========================================
//   BlockListView Class/Methods
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
//                  - rendered control events
//
//      3. events
//          - class actions are events driven..
//          - set events handler that will perform the class actions
//          
//      NOTE: BlockList class should also follow above method templating logic.
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
function BlockListView( cwsRenderObj, blockList, viewListNames )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockListObj = blockList;
    //me.blockList_UL_Tag = blockList_UL_Tag;
    me.nav2Tag;
    me.viewListNames = viewListNames;

    me.mainList;
    me.viewsDefinitionList; // = SessionManager.sessionData.dcdConfig.definitionActivityListViews; // full complete view def list
    me.viewListDefs = [];
    me.groupByDefinitionList;
    me.groupByGroups = [];

    me.viewDef_Selected;  // Need to set 'undefined' when view is cleared?

    me.viewFilteredList = [];
    //me.viewsList_CurrentItem;
    
    //me.viewListNames = [];  // List of view names - used on this blockList

    // --- Tags -----------------------
    // View Filter Related Tag
    me.viewSelectTag;
    //me.recordPager;

    // Sort Related Tag
    me.sortListButtonTag; // sortList_Tagbutton
    me.sortListDivTag; //     me.sortListUlTag; // sortList_TagUL

    //<div class="Nav2" style="display:none;"></div>

    me.containerTagTemplate = `
    <div class="field" style="border: 1px solid rgba(51, 51, 51, 0.54);">
      <div class="field__label"><label>Label</label><span>*</span></div>
      <div class="fiel__controls">
        <div class="field__selector">
          <select class="selViewsListSelector" mandatory="true">
          </select>
        </div>
        <div class="field__right" style="display: block;"></div>
      </div>
    </div>
    <div class="Nav2__icon" style="transform: rotate(0deg);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.62497 2V21.0951L5.87888 19.349C5.73243 19.2026 5.49407 19.2026 5.34763 19.349C5.20118 19.4954 5.20118 19.7324 5.34763 19.8789L7.73435 22.2656C7.88081 22.4121 8.11783 22.4121 8.26429 22.2656L10.651 19.8789C10.7975 19.7324 10.7975 19.4954 10.651 19.349C10.5046 19.2026 10.2675 19.2026 10.1211 19.349L8.37497 21.0951V2H7.62497ZM16 2C15.904 2 15.8089 2.03615 15.7356 2.10937L13.3489 4.49609C13.2025 4.64254 13.2025 4.87959 13.3489 5.02604C13.4953 5.17249 13.7324 5.17249 13.8789 5.02604L15.625 3.27995V22.375H16.375V3.27995L18.1211 5.02604C18.2675 5.17249 18.5059 5.17249 18.6523 5.02604C18.7988 4.87959 18.7988 4.64254 18.6523 4.49609L16.2656 2.10937C16.1924 2.03615 16.0959 2 16 2Z" class="c_50"></path>
      </svg>
    </div>
    <div class="Menus_display" style="display: none;">
      <div class="menu_item_comtainer">
        <div class="menu_item_text">Option line</div>
      </div>
    </div>`;

    //             <option selected="" disabled="disabled">Select an option</option>

    /*
        <select mandatory="true">
            <option selected="" disabled="disabled">Select an option</option>
            <option value="Option1">View 1</option>
            <option value="Option2">View 2</option>
            <option value="Option3">View 3</option>
            <option value="Option4">View 4</option>
            <option value="Option5">View 5</option>
          </select>

        <div class="Menus_display" style="display: none;">
        <div class="menu_item_comtainer">
            <div class="menu_item_text">Option line</div>
        </div>
        <div class="menu_item_comtainer">
            <div class="menu_item_text">And other option line..</div>
        </div>
        <div class="menu_item_comtainer">
            <div class="menu_item_text">And other option line..</div>
        </div>
        <div class="menu_item_comtainer">
            <div class="menu_item_text">And other option line..</div>
        </div>
        </div>          
    */


    /* `
        <li class="viewsFilterAndSortContainer inputDiv">

            <div class="field">
                <div class="field__label">
                    <label term="" class="">Select a view</label>
                </div>

                <div class="fiel__controls">
                    <div class="field__left">
                        <div class="viewsListContainerTag">
                            <div class="select viewsListContainerSelect">
                                <select class="selector selViewsListSelector"></select>
                            </div>
                        </div>
                    </div>
                    <div class="field__right" style="display:block">
                        <div class="viewsSorter">
                            <button class="buttonSortOrder"></button>
                            <ul class="ulSortOrder"></ul>
                        </div>
                    </div>
                </div>

            </div>

        </li>`;*/

    me.viewOptionTagTemplate = `<option value=""></option>`;
    //me.sortLiTagTemplate = `<li class="liSort" sortid="" ></li>`;

    me.sortDivTagTemplate = `<div class="menu_item_comtainer" sortid="">
        <div class="menu_item_text">Option line</div>
    </div>`;
    
    //`<li class="liSort" sortid="" ></li>`;

    // ----------------------------

    me.initialize = function()
    {
        me.nav2Tag = $( 'div.Nav2' ).show();

        me.setUpInitialData();
    };
    
    // ----------------------------

    me.render = function()
    {
        // Clear previous UI & Set containerTag with templates
        me.clearClassTag( me.nav2Tag );        
        me.setClassContainerTag( me.nav2Tag, me.containerTagTemplate );

        // Set viewList/sort related class variables
        me.setClassVariableTags( me.nav2Tag );
        
        // Populate controls - view related.  Sort related are done in view select event handling.
        me.populateControls( me.viewListDefs, me.viewSelectTag );

        // Events handling
        me.setRenderEvents( me.viewSelectTag, me.sortListButtonTag );
    };

    // ----------------------------
    
    me.viewSelect_1st = function()
    {
        var firstOptionVal = me.viewSelectTag.find( 'option:first' ).attr( 'value' );
        
        me.viewSelectTag.val( firstOptionVal ).change();        
    };

    // ====================================================
    // ----------------------------

    me.setUpInitialData = function()
    {
        me.mainList = ActivityDataManager.getActivityList();
        me.viewsDefinitionList = SessionManager.sessionData.dcdConfig.definitionActivityListViews; // full complete view def list    
        me.groupByDefinitionList = JSON.parse( JSON.stringify( SessionManager.sessionData.dcdConfig.definitionGroupBy ) ); // full complete view def list

        // Set Filter View name list and those view's definition info.
        //me.viewListNames = me.blockListObj.blockObj.blockJson.viewListNames;  // These are just named list..  We need proper def again..
        me.viewListDefs = me.getActivityListViewDefinitions( me.viewListNames, me.viewsDefinitionList );
    };

    // -----------------

    me.clearClassTag = function( nav2Tag )
    {
        nav2Tag.html( '' );
    };

    me.setClassContainerTag = function( nav2Tag, containerTagTemplate )
    {
        // Set HTML from template 
        nav2Tag.append( containerTagTemplate );
    };

    me.setClassVariableTags = function ( nav2Tag )
    {
        // View Filter Tags
        me.viewSelectTag = nav2Tag.find( 'select.selViewsListSelector' );

        // Sort Related Tags
        me.sortListButtonTag = nav2Tag.find( 'div.Nav2__icon' ); // sortList_Tagbutton
        me.sortListDivTag = nav2Tag.find( 'div.Menus_display' ); // sortList_TagUL
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


    // -------------------------------------
    // -- View Filter Operation Related

    me.switchViewNSort = function( viewName, viewListDefs, mainList )
    {
        //me.viewsList_CurrentItem = viewItem;
        //var viewDef = me.getViewsItemConfig( viewName );
        me.viewDef_Selected = Util.getFromList( viewListDefs, viewName, "id" );

        if ( me.viewDef_Selected )
        {
            me.viewFilteredList = me.viewFilterData( me.viewDef_Selected, mainList ); 
        

            // Populate Sort List - based on viewDef..
            me.populateSorts( me.sortListDivTag, me.viewDef_Selected.sort ); 
    
    
            // Sort with 1st one..
            me.sortList_wt1stOne( me.viewDef_Selected.sort, me.viewFilteredList );    
        }
        else
        {
            console.log( 'Selected View definition not found!' );
        }   

    
        // Once the viewFiltered List is decided and sorted, reRender it 
        me.blockListObj.reRenderWithList( me.viewFilteredList );  // there is 'callBack' param..  

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
                //if ( me.hasGroupBy() ) 
                //{
                //    activityItem = me.evalGroupByCondition( viewDef.groupBy, activityItem );
                //}
                filteredData.push( activityItem );
            }
        }

        //if ( me.hasGroupBy() )
        //{
        //    me.setGroupBy_GroupsAndFilterValues( viewDef, filteredData );
        //}

        
        return filteredData;
    };


    /*
    me.setGroupBy_GroupsAndFilterValues = function( viewDef, mainList )
    {
        me.groupByGroups = []; //(re)set to empty array
        if ( me.hasGroupBy() &&
             me.groupByDefinitionList[ viewDef.groupBy ].groupType && 
             me.groupByDefinitionList[ viewDef.groupBy ].groupType === 'unique' )
        {
            me.groupByGroups = me.getGroupByGroups_FromUniqueValues( viewDef.groupBy, mainList );
        }
        else if ( me.hasGroupBy() )
        {
            me.groupByGroups = JSON.parse( JSON.stringify( me.groupByDefinitionList[ viewDef.groupBy ].groups ));
        }
        for ( var i = 0; i < mainList.length; i++ )
        {
            var activityItem = mainList[ i ];
            var groupByResult = activityItem[ viewDef.groupBy ];
            if ( ! activityItem[ 'groupBy' ] ) activityItem[ 'groupBy' ] = {};
            activityItem[ 'groupBy' ] [ viewDef.groupBy ] = me.getAttributeFromGroupBy_Group( groupByResult, 'id' ).toUpperCase();
        }
    }
    me.clearGroupBy_UsedInBlockList_status = function()
    {
        for ( var i = 0; i < me.groupByGroups.length; i++ )
        {
            me.groupByGroups[ i ].created = 0;
        }
    }
    me.getAttributeFromGroupBy_Group = function( evalField, attr )
    {
        for ( var i = 0; i < me.groupByGroups.length; i++ )
        {
            if ( eval( me.groupByGroups[ i ].eval ) )
            {
                return ( me.groupByGroups[ i ][ attr ] );
            }
        }
    }
    me.getGroupByGroups_FromUniqueValues = function( groupBy, mainList )
    {
        var ret = [];
        var matches = [];
        for ( var i = 0; i < mainList.length; i++ )
        {
            var activityItem = mainList[ i ];
            if ( ! matches.includes( activityItem[ groupBy ] ) )
            {
                matches.push( activityItem[ groupBy ] );
                ret.push( { "id": ( activityItem[ groupBy ] ).toString().trim().toUpperCase(), "name": activityItem[ groupBy ].toString().trim(), "term": "",  "eval": " evalField === " + ( isNaN( activityItem[ groupBy ] ) ? "'" + activityItem[ groupBy ] + "'" : activityItem[ groupBy ] ), "created": 0 } );
            }
        }
        return ret;
    }
    me.evalGroupByCondition = function( groupBy, activityItem )
    {
        var evalField = me.groupByDefinitionList[ groupBy ].evalField; // Variable 'evalField' expected within 'query' statement  <  do not rename
        var activity = activityItem; // Variable 'activity' expected within 'query' statement  <  do not rename
        var groupByResult = eval( evalField );
        if ( groupByResult === undefined )
        {
            groupByResult = 'undefined';
        }
        else
        {
            if( typeof( groupByResult ) === 'number' && isNaN( groupByResult ) )
            {
                groupByResult = 'NaN';
            }
        }
        activityItem[ groupBy ] = groupByResult;
        return activityItem;
    };
    */


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

    me.populateSorts = function ( sortListDivTag, sortList )
    {
        //sortListDivTag.html( '' );
        sortListDivTag.find( 'div.menu_item_comtainer' ).remove();
        
        if ( sortList )
        {
            for ( var i = 0; i < sortList.length; i++ )
            {

                var sortDef = sortList[ i ];
                var divTag = $( me.sortDivTagTemplate );

                divTag.attr( 'sortid', sortDef.id );
                divTag.find( 'div.menu_item_text' ).html( sortDef.name );

                sortListDivTag.append( divTag );

                me.setSortDivTagClickEvent( divTag, me.viewDef_Selected.sort );

                // TODO: DO THIS LATER
                //if ( sortDef.groupAfter != undefined && sortDef.groupAfter === 'true' )
                //{
                //    var liGroup = $(`<li><hr class="filterGroupHR"></li>`);
                //    sortListDivTag.append( liGroup );
                //}
            }
        }

        // For below, we can use .css to mark the bold for selected.
        // me.updateMenuItem_Tag( me.sortListDivTag.children()[0] );
    };


    me.sortList_wt1stOne = function( sortDefs, viewFilteredList )
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
            //if ( me.hasGroupBy() )
            //{
            //    me.evalGroupBySort( sortDef.field, viewFilteredList, me.viewDef_Selected.groupBy, sortDef.order.toLowerCase() );
            //}
            //else
            //{
                
            me.evalSort( sortDef.field, viewFilteredList, sortDef.order.toLowerCase() );
            //}

            // TODO: There is no updated sort visual for now
            //me.updateSortLiTag( $( me.sortListDivTag ).find( 'li[sortid="' + sortDef.id + '"]' ) );
        }
        catch ( errMsg ) 
        {
            console.log( 'Error on BlockListView.sortList, errMsg: ' + errMsg );
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

    me.evalGroupBySort = function( fieldEvalStr, list, groupBy, orderStr )
    {
        var isDescending = orderStr.indexOf( 'desc' );
        list.sort( function(a, b) {
            var sortEval = ( ! isDescending ) ? '( a.groupBy.' + groupBy + ' + b.' + fieldEvalStr + ' < b.groupBy.' + groupBy + ' + a.' + fieldEvalStr + ' ) ? -1 : ' +
                                ' ( b.groupBy.' + groupBy + ' + a.' + fieldEvalStr + ' < a.groupBy.' + groupBy + ' + b.' + fieldEvalStr + ' ) ? 1 ' +
                                ' : 0 '
                            : '( a.groupBy.' + groupBy + ' + b.' + fieldEvalStr + ' > b.groupBy.' + groupBy + ' + a.' + fieldEvalStr + ') ? -1 : ' +
                                ' ( b.groupBy.' + groupBy + ' + a.' + fieldEvalStr + ' > a.groupBy.' + groupBy + ' + b.' + fieldEvalStr + ' ) ? 1 ' +
                                ' : 0 ';
            return eval( sortEval );
        });
        console.log( list );
    };

    // ---------------------------------------------------------
    // -- Events Related

    me.setViewListEvent = function( viewSelectTag )
    {
        viewSelectTag.change( function() {
            me.switchViewNSort( $( this ).val(), me.viewListDefs, me.mainList );
        });
    };


    me.setSortOtherEvents = function( sortListButtonTag )
    {
        $(".Nav2__icon").click(function () {
            if ($('.Menus_display').is(':visible')) {
                $('.Menus_display').css('display', 'none');
                $('.fab-wrapper').show();
                $('.Nav2__icon').css('transform', 'rotate(0deg)');
            } else {
                $('.Menus_display').css('display', 'table-row');
                $('.fab-wrapper').css('display', 'none');
                $('.Nav2__icon').css('transform', 'rotate(180deg)');
            }
        });
    
        $(".menu_item_comtainer").click(function () {
            $('.Menus_display').css('display', 'none');
            $('.Nav2__icon').css('transform', 'rotate(0deg)');
            $('.fab-wrapper').show();
        });

        /*
        sortListButtonTag.off( 'click' );
        $( document ).off( 'click' );

        sortListButtonTag.click( function() {
            me.sortListDivTag.css( "display", "flex" );
        });

        $( document ).click( function( event ) 
        {
            // If click target is not sortButton, hide the UL;            
            if ( event.target != me.sortListButtonTag[0] )
            {
                me.sortListDivTag.hide();
            }
        });
        */

        // me.sortListDivTag click events are created when we create sort list from selected view
    };


    me.setSortDivTagClickEvent = function( divTag, sortDefs )
    {
        divTag.click( function()
        {
            var sortId = $( this ).attr( 'sortid' );

            // get sortId and get sortDef from it..
            var sortDef = Util.getFromList( sortDefs, sortId, "id" );

            if ( sortDef )
            {
                me.sortList( sortDef, me.viewFilteredList );                        

                //me.clearGroupBy_UsedInBlockList_status();
                
                // TODO:
                //      - This should call 'setActivityListNRender()'
                me.blockListObj.reRenderWithList( me.viewFilteredList );  // there is 'callBack' param..            
            }
        });
    };


    // NOTE: Not used anymore?
    me.updateSortLiTag = function( sortTag )
    {
        for ( var i = 0; i < me.viewDef_Selected.sort.length; i++ )
        {
            if ( $( sortTag ).attr( 'sortid' ) === me.viewDef_Selected.sort[ i ].id )
            {
                $( me.sortListDivTag ).find( 'li[sortid="' + me.viewDef_Selected.sort[ i ].id + '"]' ).css("font-weight","bolder");
            }
            else
            {
                $( me.sortListDivTag ).find( 'li[sortid="' + me.viewDef_Selected.sort[ i ].id + '"]' ).css("font-weight","normal");
            }
        }
    }
    me.hasGroupBy = function()
    {
        return ( ( me.viewDef_Selected.groupBy ) && ( me.viewDef_Selected.groupBy !== '' ) );
    }
    // =-===============================

    me.initialize();
}
