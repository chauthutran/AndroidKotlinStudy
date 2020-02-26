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
function ViewsListFilter( blockList, callBack )
{
    var me = this;

    me.blockListObj = blockList;

    me.viewsListSorterObj;

    me.containerTag;
    me.viewsList_Items;
    me.viewsList_CurrentItem;
    
    me.element;
    me.selectTag;
    me.recordPager;

    me.blockList_TagUL;
    me.blockList_TagsLI;

    me.containerTag = $(`
        <div class="viewsFilterAndSortContainer inputDiv">
            <div class="viewsFilter">
                <label term="" class="from-string titleDiv">Select a view</label>
                <div class="viewsListContainerTag"></div>
            </div>
        </div>
    `);

    me.element = $(`
        <div class="select viewsListSelector" style="flex-grow:1;">
            <select class='selector'></select>
        </div>
    `);

    // move into new [blockListPager] class
    me.recordPager = $(`
        <div class="blockListPager" style="">
            <img class="pagerLeft" src="images/arrow_left.svg" style="opacity:0" >
            <img class="pagerRight" src="images/arrow_right.svg" style="opacity:0" >
            <span class="pagerInfo"></span>
        </div>
    `);


    me.initialize = function()
    {
        me.initializeDefaults();

        me.create_UI_Controls();

        me.runFirstView();
    }

    me.initializeDefaults = function()
    {
        me.activityListViews = me.blockListObj.blockObj.blockJson.activityListViews;

        me.selectTag = $("select", me.element);
        me.blockList_TagUL = $("#renderBlock .listDiv .tab__content_act");
        me.blockList_TagsLI = $("li[itemid]", me.blockList_TagUL);
    }

    me.create_UI_Controls = function ()
    {
        me.createDropDown_List( me.activityListViews );

        if ( me.showRecordPager )
        {
            me.blockListObj.createPager_UI( me.recordPager ); //me.createPager_UI_withEvents()
        }
    }

    me.runFirstView = function()
    {
        if ( me.activityListViews.length )
        {
            me.runApply_ViewsListFilter( me.activityListViews[ 0 ], callBack );
        }
    }

    me.createDropDown_List = function ( arrViews )
    {
        me.viewsList_Items = me.getViewsListDefinitions( arrViews );

        me.populateDropDown_WithEvents( me.viewsList_Items, me.selectTag );

        me.blockListObj.createViewsList_UI ( me.containerTag );   
    }

    me.populateDropDown_WithEvents = function( viewControllers, selectElement )
    {
        $( "div.viewsListContainerTag" , me.containerTag).append( me.element ); //, me.viewsListSorterObj.element );

        viewControllers.forEach( controller =>
        {
            var option = $(`
                <option value="${controller.id}">
                    ${controller.name}
                </option>
            `);
            selectElement.append( option );
        });

        selectElement.on( "change", function( event ) {

            me.blockListObj.switchFilter( event.target.value );

        });

    }


    me.runApply_ViewsListFilter  = function ( viewName, callBack )
    {
        me.setCurrentView( viewName );

        me.runDataFetch_AndFilter( me.viewsList_CurrentItem, function( filteredItems ) {

            if ( callBack ) callBack( me.viewsList_CurrentItem, filteredItems );

        });
    }




    me.getViewsListDefinitions = function( arrViews )
    {
        var allViews = FormUtil.dcdConfig.definitionActivityListViews;
        var retObj = [];

        for ( var i = 0; i < arrViews.length; i++ )
        {
            var viewObj = { 
                id: allViews[ arrViews[ i ] ].id,
                name: allViews[ arrViews[ i ] ].name,
                text: allViews[ arrViews[ i ] ].name,
                query: allViews[ arrViews[ i ] ].query,
                sort: allViews[ arrViews[ i ] ].sort,
                groupBy: allViews[ arrViews[ i ] ].groupBy
            }

            retObj.push ( viewObj );
        }

        return retObj;
    }

    me.setCurrentView = function( itemID )
    {
        me.viewsList_CurrentItem = me.getViewsItemConfig( itemID );
    };

    me.getViewsItemConfig = function( itemID )
    {
        var itemConfig = me.viewsList_Items.find( function ( controller ) {
            return controller.id == itemID;
        }) 

        return( itemConfig )
    };


    me.runDataFetch_AndFilter = function( viewsListConfig, callBack )
    {

        me.getFilteredData( viewsListConfig, function( filteredData ){

            callBack( filteredData );

        } );

    };

    me.getFilteredData = function( viewsListConfig, callBack )
    {
        // 1. fetch cwsRenderObj._activityListData data array
        // 2. apply filters

        var filterData = []; 
        var allData = me.blockListObj.cwsRenderObj._activityListData;

        if ( allData && allData.list )
        {
            for ( var i = 0; i < allData.list.length; i++ )
            {
                if ( me.runQuery_Success( viewsListConfig.query, allData.list[ i ] ) )
                {
                    filterData.push( allData.list[ i ] );
                }
            }
        }

        callBack( filterData )
    }

    me.runQuery_Success = function( query, activityItem )
    {
        var success = false;
        try {
            success = eval( query );
        }
        catch ( err ) {
            console.log( 'error evaluating viewList query : ' + err);
        }
        return success;
    };



    me.createPager_UI_withEvents = function()
    {
        //var leftPager = $( ".pagerLeft", me.recordPager );
        //var rightPager = $( ".pagerRight", me.recordPager );

        //leftPager.click( () => me.pageDirection( -1 ) );
        //rightPager.click( () => me.pageDirection( 1 ) );

        //return me.recordPager;
    }

    /*me.pageDirection = function( nextPageDirection )
    {

        if ( nextPageDirection > 0 )
        {
            // next 15
            console.log( 'next ' );

            me.viewsListSorterObj.sortList_Pager_UI_start();

            //me.blockListObj.cwsRenderObj.pulsatingProgress.show();
            me.blockListObj.blockList_RecordsLoading = 1;

            //setTimeout( function() {
            //    me.blockListObj.AddBlockListItems_ToList( me.filteredData_ForBlockList, function( recordFrom, recordTo, recordCount ){
            //        me.viewsListSorterObj.sortList_Pager_UI_finish( recordFrom, recordTo, recordCount );
            //    } );
            //}, 500 );

        }
        else
        {
            // prev 15
            console.log( 'prev ' );
        }
    }*/

    me.initialize();
}
