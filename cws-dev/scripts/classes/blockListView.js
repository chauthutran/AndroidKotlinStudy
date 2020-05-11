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

//      ** ADDED: GroupBy:
//          - If selected 'viewDef' has 'groupBy' definition, 
//              Create alternative list to 'viewActivityList' --> 'activityList_groupBy' activityList..

//
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
    me.viewsDefinitionList; // = ConfigManager.getConfigJson().definitionActivityListViews; // full complete view def list
    me.viewListDefs = [];
    me.groupByDefinitionList;
    me.groupByGroups = [];

    me.viewDef_Selected;  // Need to set 'undefined' when view is cleared?

    me.viewFilteredList = [];
    //me.viewsList_CurrentItem;
    me.groupByData = {}; // { 'groupByList': {}, 'activitiesRefGroupBy': {}, 'groupByDef': {}, 'groupByUsed': false };
    //List = [];  // NEW GROUP BY?

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
        $( '#pageDiv' ).css( 'height', 'calc(100% - 106px)' );

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
        me.viewsDefinitionList = ConfigManager.getConfigJson().definitionActivityListViews; // full complete view def list    
        me.groupByDefinitionList = Util.getJsonDeepCopy( ConfigManager.getConfigJson().definitionGroupBy ); // full complete view def list

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
        
            // NOTE: TODO: if groupBy exists, we need different sorting?!! <-- 
            me.groupByData = me.setGroupByList( me.viewDef_Selected, me.viewFilteredList, me.groupByDefinitionList ); 


            // TODO: Sort would be effected by GROUP BY <-- If exists and used, 
            // Populate Sort List - based on viewDef..
            me.populateSorts( me.sortListDivTag, me.viewDef_Selected.sort, me.groupByData ); 
    
    
            // Sort with 1st one..
            me.sortList_wt1stOne( me.viewDef_Selected.sort, me.viewFilteredList );    
        }
        else
        {
            console.log( 'Selected View definition not found!' );
        }   

    
        // Once the viewFiltered List is decided and sorted, reRender it 
        me.blockListObj.reRenderWithList( me.viewFilteredList, me.groupByData );  // there is 'callBack' param..  

    };

    
    me.viewFilterData = function( viewDef, mainList )
    {
        var filteredData = []; 
        
        var INFO = {};

        for ( var i = 0; i < mainList.length; i++ )
        {
            var activity = mainList[ i ]; 
            INFO.activity = activity;
            
            if ( Util.evalTryCatch( viewDef.query, INFO, 'BlockListView.viewFilterData()' ) === true )
            {
                // If the 'activity' in mainList meets the 'query' expression, add as 'viewFilteredData' list.
                filteredData.push( activity );
            }
        }

        return filteredData;
    };


    // --------------------------------------------
    // --- GroupBy Related -----

    me.setGroupByList = function( viewDef, activityList, groupByDefinitionList )
    {
        var groupByData = { 'groupByList': {}, 'groupListArr': [], 'activitiesRefGroupBy': {}, 'groupByDef': {}, 'groupByUsed': false, 'groupSort': '' };  // reset list.

        // If groupBy exists for this 'view', create groupBy category list and 
        if ( viewDef.groupBy )
        {
            var groupByDef = groupByDefinitionList[ viewDef.groupBy ];            

            if ( groupByDef )
            {
                groupByData.groupByDef = groupByDef;

                for ( var i = 0; i < activityList.length; i++ )
                {
                    var activity = activityList[i];
    
                    // GroupJson could be 'unique' one created from activity, or from group list.
                    var groupJson = me.getGroup_FromViewDef( activity, groupByDef );
    
                    // Set groupByData.groupByList & activitiesRefGroupBy with 'groupJson' & activityId
                    me.setGroupByData_withActivity( groupJson, activity, groupByData );
                }

                // Set 'groupByUsed' true/false.
                groupByData.groupByUsed = ( Util.objKeyCount( groupByData.groupByList ) > 0 );
            }
        }

        return groupByData;
    };


    me.getGroup_FromViewDef = function( activity, groupByDef )
    {
        var groupMatched;

        try
        {
            var activityTrans = ActivityDataManager.getCombinedTrans( activity );
            var client = ClientDataManager.getClientByActivityId( activity.activityId );
            //var clientDetails = ( client ) ? client.clientDetails: {};
    
            var INFO = { 'activity': activity, 'client': client, 'activityTrans': activityTrans };

            var evalField = Util.evalTryCatch( groupByDef.evalField, INFO, 'BlockListView.getGroupId_FromViewDef()' );
    
    
            if ( groupByDef.groupType === 'unique' )
            {
                // Each value is a group (automatic grouping).  set 'evaledVal' as groupId, but as string.
                var evalVal = '' + evalField;
    
                groupMatched = { 'id': evalVal, 'name': evalVal }; //, 'term': evalVal };
            }
            else
            {
                // See which group this falls in?
                if ( groupByDef.groups )
                {
                    for ( var i = 0; i < groupByDef.groups.length; i++ )
                    {
                        var groupDef = groupByDef.groups[i];
    
                        var INFO2 = { 'evalField': evalField };
                        
                        if ( Util.evalTryCatch( groupDef.eval, INFO2, 'BlockListView.getGroupId_FromViewDef() Groups' ) === true )
                        {
                            groupMatched = Util.getJsonDeepCopy( groupDef );
                            break;                        
                        }
                    }
                }
            }            
        }
        catch ( errMsg )
        {
            console.log( 'Error in BlockListView.getGroup_FromViewDef(), errMsg: ' + errMsg );
        }

        return groupMatched;
    };

    
    me.setGroupByData_withActivity = function( groupJson, activity, groupByData )
    {
        // ?? TODO: HOW SHOULD WE FORMAT THE GROUPS?  WITH 'ACTIVITIES' IN IT?
        if ( groupJson && groupJson.id && activity.activityId )
        {            
            //var matchingGroup = Util.getFromList( groupByData.groupByList, groupJson.id, 'id' );

            var existingGroup_InList = groupByData.groupByList[ groupJson.id ];

            if ( existingGroup_InList )
            {
                existingGroup_InList.activities.push( activity );
                // If already in list, use that group..
                groupByData.activitiesRefGroupBy[ activity.activityId ] = existingGroup_InList;
            }
            else
            {
                groupJson.activities = []; // reset the 'activities' list

                groupJson.activities.push( activity );

                // add the groupJson to groupByList..
                groupByData.groupByList[ groupJson.id ] = groupJson;
                groupByData.groupListArr.push( groupJson );
                groupByData.activitiesRefGroupBy[ activity.activityId ] = groupJson;
            }
        }
    };

    // --- GroupBy Related -----
    // --------------------------------------------


    // -------------------------------------
    // -- Sorting Operation Related

    me.populateSorts = function ( sortListDivTag, sortList, groupByData )
    {
        //sortListDivTag.html( '' );
        sortListDivTag.find( 'div.menu_item_comtainer' ).remove();
        
        if ( me.usedGroupBy( groupByData ) )
        {
            // Use the sorting in the groupBy..
            //console.log( '**** Use GroupBy sorting!! ******' );

            // TODO: NEED TO SETUP GROUP SORTING..
        }
        else if ( sortList )
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
        // TODO: DUPLICATE CALL AS BELOW?
        if ( me.usedGroupBy( me.groupByData ) ) 
        {
            me.sortList_ByGroup( me.groupByData );
        }
        else if ( sortDefs && sortDefs.length > 0 )
        {
            me.sortList( sortDefs[0], viewFilteredList );
        }
    };


    me.sortList_ByGroup = function( groupByData )
    {
        if ( !groupByData.groupSort ) groupByData.groupSort = 'Acending';
        else if ( groupByData.groupSort === 'Acending' ) groupByData.groupSort = 'Decending';
        else if ( groupByData.groupSort === 'Decending' ) groupByData.groupSort = 'Acending';

        me.viewFilteredList = me.groupBySorting( groupByData, groupByData.groupSort );                
    };

    me.sortList = function( sortDef, viewFilteredList )
    {
        try 
        {
            me.evalSort( sortDef.field, viewFilteredList, sortDef.order.toLowerCase() );

            // TODO: There is no updated sort visual for now
            //me.updateSortLiTag( $( me.sortListDivTag ).find( 'li[sortid="' + sortDef.id + '"]' ) );
        }
        catch ( errMsg ) 
        {
            console.log( 'Error on BlockListView.sortList, errMsg: ' + errMsg );
        }                   
    };


    me.groupBySorting = function( groupByData, sortOrder )
    {
        // 1. sort the group list?
        var usedGroupList_Sorted = Util.sortByKey( groupByData.groupListArr, "id", undefined, sortOrder );

        // 2. recreate view list based on the sorting? - loop through the group and get full activity list..
        return me.getNewActivityList_FromGroupList( usedGroupList_Sorted );
    }


    me.getNewActivityList_FromGroupList = function( groupList )
    {
        var newActivityList = [];

        for ( var i = 0; i < groupList.length; i++ )
        {
            var group = groupList[ i ];

            for ( var x = 0; x < group.activities.length; x++ )
            {
                newActivityList.push( group.activities[ x ] );
            }
        }

        return newActivityList;
    }

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

            if ( me.usedGroupBy( me.groupByData ) )
            {
                me.sortList_ByGroup( me.groupByData );

                me.blockListObj.reRenderWithList( me.viewFilteredList, me.groupByData );
            }
            else
            {
                if ($('.Menus_display').is(':visible')) {
                    $('.Menus_display').css('display', 'none');
                    $('.fab-wrapper').show();
                    $('.Nav2__icon').css('transform', 'rotate(0deg)');
                } else {
                    $('.Menus_display').css('display', 'table-row');
                    $('.fab-wrapper').css('display', 'none');
                    $('.Nav2__icon').css('transform', 'rotate(180deg)');
                }    
            }
        });
    
        $(".menu_item_comtainer").click(function () {
            $('.Menus_display').css('display', 'none');
            $('.Nav2__icon').css('transform', 'rotate(0deg)');
            $('.fab-wrapper').show();
        });

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
                me.blockListObj.reRenderWithList( me.viewFilteredList, me.groupByData );  // there is 'callBack' param..            
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
    };



    me.usedGroupBy = function( groupByData )
    {
        return groupByData.groupByUsed;
    };

    // =-===============================

    me.initialize();
}
