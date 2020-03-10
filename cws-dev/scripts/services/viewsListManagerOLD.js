// ViewsList class >> fetches 'views' from dcdConfig (definitionActivityListViews)
// First draft pseudoCode write up (2020-02-05): greg
// - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- ---
//
// 1. create viewsListController ( and control(s?) )
//  
//  1.1 create viewsList control
//  1.1.1 fetch activityListViews from DCDconfig
//  1.1.2 populate viewsList items 

// 2. create viewsListSorter
//  
//  2.1 create sortList control
//  2.2 populate sortList items
//
// 3. run/apply viewsList-filter query
//  3.1 set current viewsList item
//  3.2 fetch activityData with filter 
//   3.2.1 get activityData
//   3.2.2 run filter rules against activityData
//      >> *change run against 'memory' redeemList/activityList data (right now doing getDataManager fetch)
//  3.3 run sorting on fitered-activityData

// 4. run/apply sortOrder indexing
//  4.1 apply sort order to filtered activityData 
//
// 5. create viewsList 'cards' in blockList
//  5.1 clear redeemList/activityList content
//  5.2 build activity/block List results/layout
// - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- ---


// CHANGE: blockList has a copy of activityItemList..  
// At start of blockList, 

// If view list in config does not exist, blockList.activityItemList = [];
//  and do copy of array contents..  for... blockList.activityItemList each,  activityItemList.push( cwsRender._activityList.list.items);

// If we do have 'viewList' in blockList config, depends on the selection of the view, 
// we generate different list, we use cwsRender._activityList.list.items to filter or sort and push to --> blockList.activityItemList.push( );
// list blockList.activityItemList

// What we didn't describe --> html generation...  <-- 100 by filter --> you are displaying 15 at a time..


function ViewsList( blockList )
{
    var me = this;

    me.blockListObj = blockList;
    me.viewsListSorterObj;

    me.viewsList_ContainerTag;
    me.viewsList_Items;
    me.viewsList_CurrentItem;
    me.viewsListTag; //rename?
    me.element;
    me.select;
    me.recordPager;

    me.blockList_TagUL;
    me.blockList_TagsLI;

    me.filteredData_ForBlockList; // temp holder of last filtered activityList (for reuse/sorting/etc)

    me.showRecordPager = false;

//  # 1
    me.createViewsList_Controllers = function ( arrViews )
    {
        me.createViewsList_Controls();

        me.createViewsList_Items( arrViews );

        // run 1st time only [default to 1st filter in list]
        setTimeout( function(){
            me.runApply_ViewsListFilter( arrViews[ 0 ] );
        }, 500);

        return me.viewsList_ContainerTag;
    }

//  # 3
    me.runApply_ViewsListFilter  = function ( viewsListName )
    {
        me.setViewsList_CurrentItem( viewsListName );

        // - -- --- -- - New code logic as per pseudocode - -- --- -- - 
        // - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- --  
        me.viewsList_RunDataFetch_AndFilter( me.viewsList_CurrentItem, function( filteredItems ) {

            me.viewsListSorterObj.sortList_RunSort( filteredItems, function( sortedItems ) {

                me.filteredData_ForBlockList = sortedItems;

                me.blockListObj.blockList_Paging_lastItm = 0;

                me.blockListObj.evalScrollOnBottom( me.filteredData_ForBlockList, function( recordFrom, recordTo, recordCount ){

                    me.viewsListSorterObj.sortList_Pager_UI_finish( recordFrom, recordTo, recordCount );

                } );

            })
        })
        // - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- -- 



        // - -- --- -- - -- --- OLD CODE logic  - -- --- -- - -- --- -

        me.blockList_TagsLI.hide();

        // Change: fetch data from 'memory' not DataManager/DB
        me.blockList_TagsLI.each( function ( key, li ) 
        {
            // NB: variable [activityItem] IS RESERVED FOR EVALUATIONS INSIDE me.viewsList_CurrentItem.query
            var activityItem = Util.getFromList( me.blockListObj.cwsRenderObj._activityListData.list, li.getAttribute("itemid"), "id" );
            var evaluate = me.viewListItem_Filter( me.viewsList_CurrentItem.query, activityItem );

            if( evaluate ) $( li ).show();
        });

        // - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- -- 

    }


    me.createViewsList_Controls = function()
    {

        me.initializeViewsList_Defaults();

        me.viewsListSorterObj = new ViewsListSorter( me ); // check if sort array contains anything

        me.viewsListTag = $( "div" , me.viewsList_ContainerTag).append( me.element, me.viewsListSorterObj.element );

    }

    me.initializeViewsList_Defaults = function()
    {
        me.viewsList_ContainerTag = $(`
            <div class="viewsListFIlterAndSortContainer inputDiv">
                <label term="" class="from-string titleDiv">Select a view</label>
                <div class="viewsListContainerTag">
                </div>
            </div>
        `);

        me.element = $(`
            <div class="select" style="flex-grow:1;">
                <select class='selector'></select>
            </div>
        `);

        me.recordPager = $(`
            <div class="viewsListPager" style="">
                <img class="pagerLeft" src="images/arrow_left.svg" style="opacity:0" >
                <img class="pagerRight" src="images/arrow_right.svg" style="opacity:0" >
                <span class="pagerInfo"></span>
            </div>
        `);

        me.select = $("select", me.element);
        me.blockList_TagUL = $("#renderBlock .listDiv .tab__content_act");
        me.blockList_TagsLI = $("li[itemid]", me.blockList_TagUL);
    }

    me.createViewsList_Items = function ( arrViews )
    {
        me.viewsList_Items = me.getViewControllersFromList( arrViews, FormUtil.dcdConfig.definitionActivityListViews );

        me.createViewsList_ItemsNEvents( me.viewsList_Items, me.select );
    }

    me.createViewsList_ItemsNEvents = function( viewControllers, selectElement )
    {
        viewControllers.forEach( controller =>
        {
            var option = $(`
                <option value="${controller.id}">
                    ${controller.name}
                </option>
            `);
            selectElement.append( option );
        });

        selectElement.on( "change", function( event )
        {
            me.runApply_ViewsListFilter ( event.target.value );

            // previously this was passing the 'viewsList' rule to blockList (for scroll-on-end refetch filter)
            //me.blockListObj.viewsListFilter = event.target.value;
        });
    }

    me.getViewControllersFromList = function( arrViews, allViews )
    {
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

    me.setViewsList_CurrentItem = function( itemID )
    {
        me.getViewsListItemConfig( itemID, function( viewsListItem ){

            me.viewsList_CurrentItem = viewsListItem;
            me.filteredData_ForBlockList = [];

            me.blockListObj.clearExistingList();

            me.viewsListSorterObj.createSortList_FomViewsListItem( me.viewsList_CurrentItem );

        } );

    };

    me.getViewsListItemConfig = function( itemID, callBack )
    {
        var itemConfig = me.viewsList_Items.find( function ( controller ) {
            return controller.id == itemID;
        }) 

        callBack( itemConfig )
    };


    me.viewsList_RunDataFetch_AndFilter = function( viewsListConfig, callBack )
    {
        //why do we need this [viewsList_getBlockListData_AndRunFilter] >> can't it be done by [viewsList_RunDataFetch_AndFilter]?
        me.viewsList_getBlockListData_AndRunFilter( viewsListConfig, function( filteredData ){

            callBack( filteredData ); // return evalResultsFiltered ( cwsRender.__activityListData )

        } );

    };

    me.viewsList_getBlockListData_AndRunFilter = function( viewsListConfig, callBack )
    {
        // 1. fetch blockList data array
        // 2. apply filters

        var filterData = me.blockListObj.cwsRenderObj._activityListData;
        var returnData = []; //{ 'list': [] };

        if ( filterData && filterData.list )
        {
            for ( var i = 0; i < filterData.list.length; i++ )
            {
                if ( me.viewListItem_Filter( viewsListConfig.query, filterData.list[ i ] ) )
                {
                    //returnData.list.push( filterData.list[ i ] );
                    returnData.push( filterData.list[ i ] );
                }
            }
        }

        callBack( returnData )
    }

    me.viewListItem_Filter = function( query, activityItem )
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



    me.createPager_ObjectNEvents = function()
    {
        if ( me.showRecordPager )
        {
            var leftPager = $( ".pagerLeft", me.recordPager );
            var rightPager = $( ".pagerRight", me.recordPager );
    
            leftPager.click( () => me.pageDirection( -1 ) );
            rightPager.click( () => me.pageDirection( 1 ) );
    
            return me.recordPager;
        }

    }

    me.pageDirection = function( nextPageDirection )
    {

        if ( nextPageDirection > 0 )
        {
            // next 15
            console.log( 'next ' );

            me.viewsListSorterObj.sortList_Pager_UI_start();

            me.blockListObj.cwsRenderObj.pulsatingProgress.show();
            me.blockListObj.redeemListScrollingState = 1;

            setTimeout( function() {

                me.blockListObj.appendRedeemListOnScrollBottom( me.filteredData_ForBlockList, function( recordFrom, recordTo, recordCount ){

                    me.viewsListSorterObj.sortList_Pager_UI_finish( recordFrom, recordTo, recordCount );

                } );

            }, 500 );

        }
        else
        {
            // prev 15
            console.log( 'prev ' );
        }
    }

}



function ViewsListSorter( viewsList )
{
    var me = this;

    me.viewsListObj = viewsList; //do we need this?

    me.sortList_Items;
    me.sortList_CurrentItem;
    me.sortList_CurrentTagLI;

    me.blockList_TagUL;
    me.blockList_TagsLI;

    me.element;
    me.sortList_Tagbutton;
    me.sortList_TagUL;


//  # 2
    me.createSortList_FomViewsListItem = function( viewsList_CurrentItem )
    {

        me.sortList_Items = viewsList_CurrentItem.sort; //passes array obj
        me.sortList_CurrentItem = me.sortList_Items[ 0 ];

        me.createSortList_Items();
    };

    me.createSortList_Items = function ()
    {
        me.sortList_TagUL.empty();

        for ( var i = 0; i < me.sortList_Items.length; i++ )
        {
            var sortObj = me.sortList_Items[ i ];
            var li = $(`<li sortid="${sortObj.id}" >${sortObj.name}</li>`);

            li.click( function()
            {
                me.sortList_ApplySortItem( this );
                me.sortList_TagUL.hide();
            });

            me.sortList_TagUL.append( li );

            if ( sortObj.groupAfter != undefined && sortObj.groupAfter === 'true' )
            {
                var liGroup = $(`<li><hr class="filterGroupHR"></li>`);
                me.sortList_TagUL.append( liGroup );
            }

            if ( i === 0 ) 
            {
                me.sortList_CurrentItem = sortObj;
                me.sortList_CurrentTagLI = li;
                li.css("font-weight","bolder");
            }

        }

    };


    me.createSortList_Controllers = function()
    {
        me.blockList_TagUL = $( "#renderBlock .listDiv .tab__content_act" );
        me.blockList_TagsLI = $( "li[itemid]", me.blockList_TagUL );
    
        me.element = $(`
            <div class="divSortOrder">
                <button class="buttonSortOrder"></button>
                <ul></ul>
            </div>
        `);

        me.sortList_Tagbutton = $( "button", me.element );
        me.sortList_TagUL = $( "ul", me.element );

        me.sortList_Tagbutton.click( () => me.sortList_TagUL.css( "display", "flex" ) );

        $( document ).click( ev => ( ev.target != me.sortList_Tagbutton[0] ) && me.sortList_TagUL.hide() );
    };

//  # 4
    me.sortList_RunSort = function( filteredData, callBack )
    {
        var sortedData = filteredData;

        try {

            sortedData.sort(function(a, b)
            {
                if ( me.sortList_CurrentItem.order.toLowerCase().indexOf( 'desc' ) )
                {
                    //old method
                    //if ( a[ me.sortList_CurrentItem.field ] < b[ me.sortList_CurrentItem.field ] ) return -1;
                    //if ( b[ me.sortList_CurrentItem.field ] < a[ me.sortList_CurrentItem.field ] ) return 1;
                    //else return 0;

                    var sortEval = '( a.' + me.sortList_CurrentItem.field + ' < b.' + me.sortList_CurrentItem.field + ' ) ? -1 : ' +
                                    ' ( b.' + me.sortList_CurrentItem.field + ' < a.' + me.sortList_CurrentItem.field + ' ) ? 1 ' +
                                    ' : 0 ';
                }
                else
                {
                    //old method
                    //if ( a[ me.sortList_CurrentItem.field ] > b[ me.sortList_CurrentItem.field ] ) return -1;
                    //if ( b[ me.sortList_CurrentItem.field ] > a[ me.sortList_CurrentItem.field ] ) return 1;
                    //else return 0;

                    var sortEval = '( a.' + me.sortList_CurrentItem.field + ' > b.' + me.sortList_CurrentItem.field + ' ) ? -1 : ' +
                                    ' ( b.' + me.sortList_CurrentItem.field + ' > a.' + me.sortList_CurrentItem.field + ' ) ? 1 ' +
                                    ' : 0 ';

                }

                return eval( sortEval );

            });

            callBack ( sortedData );

        }
        catch (err) {
            console.log( 'error running viewsListManager.sortList_RunSort on field [' + me.sortList_CurrentItem.field + ']');
        }

    }


    me.sortList_ApplySortItem = function ( sortTag )
    {

        var sortObj = me.sortListItem_FromTag( sortTag );

        me.sortList_CurrentTagLI = sortTag;
        me.sortList_CurrentItem = sortObj;

        me.sortList_Pager_UI_start();
        me.sortListItem_SelectTag( sortTag );

        me.viewsListObj.blockListObj.clearExistingList();

        // UX delay
        setTimeout( function(){

            me.sortList_RunSort( me.viewsListObj.filteredData_ForBlockList, function( sortedItems ) {

                me.filteredData_ForBlockList = sortedItems;
    
                me.viewsListObj.blockListObj.blockList_Paging_lastItm = 0;
                me.viewsListObj.blockListObj.redeemListScrollLimit = sortedItems.length;

                me.viewsListObj.blockListObj.evalScrollOnBottom( me.viewsListObj.filteredData_ForBlockList, function( recordFrom, recordTo, recordCount ){

                    me.sortList_Pager_UI_finish( recordFrom, recordTo, recordCount );

                } );
    
            })

        }, 250);

    }

    me.sortList_Pager_UI_start = function()
    {
        $( '.pagerLeft' ).css( 'opacity', 0.25 );
        $( '.pagerRight' ).css( 'opacity', 0.25 );
        $( '.pagerInfo' ).css( 'opacity', 0.25 );
        //$( '.pagerInfo' ).html( '' );
    }

    me.sortList_Pager_UI_finish = function( recordFrom, recordTo, recordCount )
    {
        $( '.pagerLeft' ).css( 'opacity', ( recordFrom > 1 ) ? 0.5 : 0.25 );
        $( '.pagerRight' ).css( 'opacity', ( recordTo === recordCount ) ? 0.25 : 0.5 );
        $( '.pagerInfo').html( recordFrom + ' - ' + recordTo + ' of ' + recordCount )
        $( '.pagerInfo' ).css( 'opacity', ( recordCount ) ? 1 : 0.25 );
    }

    me.sortListItem_SelectTag = function( sortTag )
    {
        for ( var i = 0; i < me.sortList_Items.length; i++ )
        {
            if ( $( sortTag ).attr( 'sortid' ) === me.sortList_Items[ i ].id )
            {
                $( me.sortList_TagUL ).find( 'li[sortid="' + me.sortList_Items[ i ].id + '"]' ).css("font-weight","bolder");
            }
            else
            {
                $( me.sortList_TagUL ).find( 'li[sortid="' + me.sortList_Items[ i ].id + '"]' ).css("font-weight","normal");
            }
        }

    }

    me.sortListItem_FromTag = function( sortTag )
    {

        for ( var i = 0; i < me.sortList_Items.length; i++ )
        {
            if ( $( sortTag ).attr( 'sortid' ) === me.sortList_Items[ i ].id )
            {
                return me.sortList_Items[ i ];
            }
        }

    }

    me.createSortList_Controllers();

}
