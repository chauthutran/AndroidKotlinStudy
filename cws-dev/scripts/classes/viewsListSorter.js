
function ViewsListSorter( blockList )
{
    var me = this;

    me.blockListObj = blockList;
    me.viewItemObj;

    me.sortList_Items;
    me.sortList_CurrentItem;
    me.sortList_CurrentTagLI;

    me.containerTag;

    me.blockList_TagUL;
    me.blockList_TagsLI;

    me.element;
    me.sortList_Tagbutton;
    me.sortList_TagUL;

    me.filteredData_ForBlockList = [];


    me.initialize_UI = function()
    {
        me.blockList_TagUL = $( "#renderBlock .listDiv .tab__content_act" );
        me.blockList_TagsLI = $( "li[itemid]", me.blockList_TagUL );
        me.containerTag = $( "div.viewsFilterAndSortContainer" );
    
        me.element = $(`
            <div class="viewsSorter">
                <button class="buttonSortOrder"></button>
                <ul></ul>
            </div>
        `);

        $( me.containerTag ).append( me.element );

        me.sortList_Tagbutton = $( "button", me.element );
        me.sortList_TagUL = $( "ul", me.element );

        me.sortList_Tagbutton.click( () => me.sortList_TagUL.css( "display", "flex" ) );

        $( document ).click( ev => ( ev.target != me.sortList_Tagbutton[0] ) && me.sortList_TagUL.hide() );

    };

    me.runApply_SortList = function( viewItem, filteredData, callBack )
    {
        me.viewItemObj = viewItem;

        me.updateUI_AndRunSort( filteredData, callBack )
    }

    me.updateUI_AndRunSort = function( filteredData, callBack )
    {
        me.setInitialData( filteredData );

        me.initialize_SortItems_UI();

        me.runApply_ViewSort( filteredData, callBack );
    };

    me.setInitialData = function( filteredData )
    {
        me.filteredData_ForBlockList = filteredData;

        me.sortList_Items = me.viewItemObj.sort; 
        me.sortList_CurrentItem = me.sortList_Items[ 0 ];
    }


    me.initialize_SortItems_UI = function ()
    {
        me.sortList_TagUL = $( ".viewsSorter > ul" );

        me.sortList_TagUL.empty();

        for ( var i = 0; i < me.sortList_Items.length; i++ )
        {
            var sortObj = me.sortList_Items[ i ];
            var li = $(`<li sortid="${sortObj.id}" >${sortObj.name}</li>`);

            li.click( function()
            {
                me.blockListObj.switchSorter( this );
            });

            me.sortList_TagUL.append( li );

            if ( sortObj.groupAfter != undefined && sortObj.groupAfter === 'true' )
            {
                var liGroup = $(`<li><hr class="filterGroupHR"></li>`);
                me.sortList_TagUL.append( liGroup );
            }

        }

        // mark 1st item in list as "selected"
        me.updateMenuItem_Tag( me.sortList_TagUL.children() [ 0 ] );

    };



//  # 4
    me.runApply_ViewSort = function( filteredData, callBack )
    {
        var sortData = Util.cloneArray( filteredData );
        var sortEval;

        try 
        {

            if ( filteredData && filteredData.length )
            {

                sortData.sort(function(a, b) {

                    if ( me.sortList_CurrentItem.order.toLowerCase().indexOf( 'desc' ) )
                    {
                        sortEval = '( a.' + me.sortList_CurrentItem.field + ' < b.' + me.sortList_CurrentItem.field + ' ) ? -1 : ' +
                                        ' ( b.' + me.sortList_CurrentItem.field + ' < a.' + me.sortList_CurrentItem.field + ' ) ? 1 ' +
                                        ' : 0 ';
                    }
                    else
                    {
                        sortEval = '( a.' + me.sortList_CurrentItem.field + ' > b.' + me.sortList_CurrentItem.field + ' ) ? -1 : ' +
                                        ' ( b.' + me.sortList_CurrentItem.field + ' > a.' + me.sortList_CurrentItem.field + ' ) ? 1 ' +
                                        ' : 0 ';
                    }

                    return eval( sortEval );
    
                });

            }

            callBack ( sortData );

        }
        catch (err) 
        {
            console.log( 'error running viewsListManager.runApply_ViewSort on field [' + me.sortList_CurrentItem.field + ']');
            console.log( sortEval );
        }

    }


    me.switch_ApplyNewSort = function ( sortTag, callBack )
    {
        me.updateMenuItem_Tag( sortTag );

        me.sortList_CurrentItem = me.sortListItem_FromTag( sortTag );
        me.sortList_CurrentTagLI = sortTag;

        me.runApply_ViewSort( me.filteredData_ForBlockList, function( sortedData ) {

            callBack( sortedData );

        })

    }


    me.updateMenuItem_Tag = function( sortTag )
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


    me.initialize_UI();

}
