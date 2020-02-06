// ViewsList class >> fetches 'views' from dcdConfig (definitionActivityListViews)
// First draft pseudoCode write up (2020-02-05): greg
// - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- ---
//
// 1. create viewsListController (and control(s?))
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
    me.blockList_TagUL;
    me.blockList_TagsLI;

//  # 1
    me.createViewsList_Controllers = function ( arrViews )
    {
        me.createViewsList_Controls();

        me.createViewsList_Items( arrViews );

        return me.viewsList_ContainerTag;
    }

//  # 3
    me.runApply_ViewsListFilter  = function ( viewsListName )
    {
        me.setViewsList_CurrentItem( viewsListName );

        // - -- --- -- - New code logic as per pseudocode - -- --- -- - 
        // - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- --  
        me.viewsList_RunDataFetch_WithFilter( me.viewsList_CurrentItem, function( filteredItems ) {

            me.viewsListSorterObj.sortList_RunSort( filteredItems, function( sortedItems ) {

                me.blockListObj.evalScrollOnBottom();

            })
        })
        // - -- --- -- - -- --- -- - -- --- -- - -- --- -- - -- --- -- 



        // - -- --- -- - -- --- OLD CODE logic  - -- --- -- - -- --- -

        me.prepareTagsLi();
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
            <div class="tb-content-filterView inputDiv">
                <label term="" class="from-string titleDiv">Select a view</label>
                <div style="display:flex;align-items:center;">
                </div>
            </div>
        `);

        me.element = $(`
            <div class="select" style="flex-grow:1;">
                <select class='selector'></select>
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
                <option value="${controller.name}">
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

    me.setViewsList_CurrentItem = function( name )
    {
        me.viewsList_CurrentItem = me.getViewsListConfig( name );

        me.viewsListSorterObj.setSortList_CurrentItem( me.viewsList_CurrentItem );
    }

    me.getViewsListConfig = function( itemName )
    {
        return me.viewsList_Items.find( function ( controller ) {
            return controller.name == itemName;
        });
    }


    me.viewsList_RunDataFetch_WithFilter = function( viewsListConfig, callBack )
    {
        //TO DO
        var filteredData = viewsListConfig; // cwsRender.__activityListData.list
        callBack( filteredData ); // return evalResultsFiltered ( cwsRender.__activityListData )
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
    }

    me.prepareTagsLi = function ()
    {
        me.blockList_TagUL = $("#renderBlock .listDiv .tab__content_act");
        me.blockList_TagsLI = $("li[itemid]", me.blockList_TagUL);
        me.groupsLi = $("li.dateGroup", me.blockList_TagUL);
        
        me.groupsLi.each( ( key, li ) => $(li).hide() );
    }

}



function ViewsListSorter( viewsList )
{
    var me = this;
    
    me.viewsListObj = viewsList; //do we need this?

    me.sortList_Items;
    me.sortList_CurrentItem;

    me.blockList_TagUL;
    me.blockList_TagsLI;

    me.element;
    me.sortList_Tagbutton;
    me.sortList_TagUL;


//  # 2
    me.setSortList_CurrentItem = function( viewsList_CurrentItem )
    {
        me.sortList_Items = viewsList_CurrentItem.sort; //passes array obj

        me.createSortList_Items();

    };

    me.createSortList_Items = function ()
    {
        me.sortList_TagUL.empty();

        me.sortList_Items.forEach( ( obj ) => {

            var li = $(`<li sortid="${obj.id}" >${obj.name}</li>`);

            li.click( function()
            {
                me.prepareTagsLi();
                me.sortList_CurrentItem && me.sortList_CurrentItem.css("font-weight","normal");
                me.runApply_ViewsListSort( obj.getFeature );
                me.sortList_CurrentItem = li;
                li.css("font-weight","bolder")
                me.sortList_TagUL.hide();
            });

            me.sortList_TagUL.append( li );

            if ( obj.groupAfter != undefined ) console.log( obj );
            if ( obj.groupAfter != undefined && obj.groupAfter === 'true' )
            {
                var liGroup = $(`<li><hr class="filterGroupHR"></li>`);
                me.sortList_TagUL.append( liGroup );

            }

        });

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
    
    me.sortList_RunSort = function( filteredData, callBack )
    {
        //TO DO
        var sortedData = filteredData;
        callBack ( sortedData );
    }


    me.runApply_ViewsListSort = function ( getFeature )
    {
        me.blockList_TagsLI.detach().sort( function (liA, liB)
        {
            const arr=[], 
            idA = $(liA).attr("itemid"),
            idB = $(liB).attr("itemid"),
            compare = function()
            {
                if ( arr.idA && arr.idB )
                {
                    var result = arr.idA.localeCompare( arr.idB );
                    if(result == 0) return 0;
                    return result > 0 ? 1 : -1
                }
            };

            DataManager.getItemFromData( "redeemList", idA, card =>
            {
                const value = getFeature( card )
                arr.push({idA:value})
                if(arr.length == 2) return compare();
            });

            DataManager.getItemFromData( "redeemList", idB, card =>
            {
                const value = getFeature( card );
                arr.push({idB:value})
                if(arr.length == 2) return compare();
            });

        });

        me.blockList_TagUL.append( me.blockList_TagsLI );

    }

    me.prepareTagsLi = function ()
    {
        me.blockList_TagUL = $("#renderBlock .listDiv .tab__content_act");
        me.blockList_TagsLI = $("li[itemid]", me.blockList_TagUL);
        me.groupsLi = $("li.dateGroup", me.blockList_TagUL);
        
        me.groupsLi.each( ( key, li ) => $(li).hide() );
    }

    me.createSortList_Controllers();

}
