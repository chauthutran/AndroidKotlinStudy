// =========================================
//   BlockList Class/Methods
//          - Display List like 'activityList' - within BlockObject (Parent)
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
//
//          1. InitialSetup() - Set some variables like below  <-- used rather than 'initialize' due to not having this ready on instantiation time
//                  - 'me.activytList' - from cwsRender activity full list (but copy of the list, not influencing the actual list)
//                  - 'me.blockJson' set from passed 'blockJson'
//                 
//          1. Render() - Perform 'rendering' of blockList with main data from cwsRender
//                  [Kind of Initialization Part]
//                  - Set Frame HTML (by cloning from templat) 
//                  - Set Other Related Initial things
//                  [True Rendering Part]
//                  - Set ActivityList from main list on cwsRender.
//                  - Populate ActivityItems (using 'ActivityList')
//
//          2. ReRender() - reRender the list with param 'newActivityList'.
//
//          2. ReRenderWithMainData() - call 'reRender' with newActivityList data.
//
//          3. AddActivityItem() - Add ActivityItem (on top) to main list and perform 'reRender'.
//
//      - MORE:
//          1. Add viewFilter Implementation..
//          2. SyncDownload Implementation..
//
//      - OTHERS:
//          1. GroupBy
//          2. Scrolling
//
// -------------------------------------------------
function BlockList( cwsRenderObj, blockObj ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;     
    me.blockJson;   

    me.activityList = [];
    me.blockList_UL_Tag;
    me.recordsLoading = 0;
    me.recordCounter = 0;

    me.options;
    me.blockTag;

    me.groupByItems;
    me.showGroupBy = false;
    me.debugMode = StatusInfoManager.debugMode; //( ( location.href ).indexOf( '.psi-mis.org' ) < 0 || ( location.href ).indexOf( 'cws-' ) >= 0 );

    me.viewsListFilterObj;
    me.viewsListSorterObj;
    me.paging_lastItm;

    me.BlockListViewObj;

    me.template_ActivityCard = `<li itemid="" class="activityItemCard">
        <a class="expandable" itemid="" style="padding:4px;">

            <div class="icon-row listItem">

                <table class="listItem_table">
                    <tr>
                        <td class="listItem_selector_drag" style="width:2px;opacity:0.65;vertical-align:top;">
                            <div style="overflow-y:hidden;" class="listItem">&nbsp;</div>
                        </td>

                        <td class="listItem_icon_activityType" style="width: 60px;">
                            <div style="width: 56px;"></div>
                        </td>

                        <td class="listItem_data_preview">
                            <div class="listItem_label_date">---Date---</div>
                            <div class="previewData listDataPreview">
                                <div class="listDataItem">birthYear </div>
                                <div class="listDataItem">walkIn_motherName treatment reason </div>
                            </div>
                        </td>

                        <td class="listItem_voucher_status">
                            <div class="act-r"><span id="listItem_queueStatus">success</span></div>
                        </td>

                        <td class="listItem_action_sync">
                            <div class="icons-status" class="divListItem_icon_sync">
                                <small class="syncIcon">
                                    <img src="images/sync-n.svg" class="listItem_icon_sync" />
                                </small>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </a>
    </li>`;

    
    me.template_ActivityCardEmpty = `<li class="emptyListLi activityItemCard">
            <a class="expandable" style="min-height: 60px; padding: 23px; color: #888;" term="${Util.termName_listEmpty}">List is empty.</a>
        </li>`;

    // -------- Tags --------------------------

    me.divSyncDownTag = $('#divSyncDown');
    me.imgSyncDownTag = $('#imgSyncDown');


    // ===========================================================
    // === Main Features =========================

    // ----------------------------
    me.initialize = function() {};

    me.initialSetup = function( blockJson )
    {
        me.setUpInitialData( me.cwsRenderObj, blockJson );
    }
    
    // -----------------------------------------------

    //  Render BlockList
    me.render = function( blockTag, passedData, options )
    {        
        // Clear previous UI & Set containerTag with templates
        me.clearClassTag( blockTag );        
        me.blockList_UL_Tag = me.setClassContainerTag( blockTag );
        // Other Initial Render Setups - syncDown setup, favIcons, etc..
        me.otherInitialRenderSetup( me.divSyncDownTag, me.imgSyncDownTag, me.cwsRenderObj );

        // Set class level tags
        me.setClassVariableTags( blockTag );
        

        // Populate controls - ActivityLists, viewFilter/sort, related.
        me.populateControls( me.blockJson, me.activityList, me.blockList_UL_Tag );

        // Events handling
        //me.setRenderEvents();
    };


    // Calls with new viewFilter..
    me.reRender = function( newActivityList, callBack )
    {
        if ( me.blockList_UL_Tag )
        {
            $( window ).scrollTop( 0 ); // Scroll top

            me.activityList = newActivityList;  // NOTE: We expect this list already 'cloned'...

            me.clearExistingList( me.blockList_UL_Tag );


            // This removes the top view - if view exists..
            me.populateActivityList( me.activityList, me.blockList_UL_Tag );

            if ( callBack ) callBack();
        }
        else
        {
            console.log( ' ===> Error on blockList.reRender - blockList_UI_Tag not available - probably not rendered, yet' );
        } 
    };


    // Add one and reRender it
    me.addActivityItem = function( activityItem, callBack )
    {   
        me.cwsRenderObj._activityListData.list.unshift( activityItem ); // We should have a method for this in 'cwsRender' or some class.        
        // DataManager2.saveData_RedeemList( cwsRenderObj._activityListData, function () {

        me.reRenderWtMainData( callBack );
    };


    // reRender using activityList from cwsRenderObj - Can be called from 'SyncDown'
    me.reRenderWtMainData = function( callBack )
    {
        var newActivityList = Util.cloneArray( me.cwsRenderObj._activityListData.list );

        me.reRender( newActivityList, callBack );    
    };


    // -----------------------------------------------
    // -- Related Methods...

    me.setUpInitialData = function( cwsRenderObj, blockJson )
    {
        me.activityList = Util.cloneArray( cwsRenderObj._activityListData.list );
        me.blockJson = blockJson;
    };


    me.clearClassTag = function( blockTag )
    {
        // Clear any previous ones of this class
        blockTag.find( 'div.listDiv' ).remove();
    };

    me.setClassContainerTag = function( blockTag )
    {
        // Block/BlockList HTML related setup
        var listDivTag = $( '#listTemplateDiv > div.listDiv' ).clone(); // Copy from list html template located in index.html
        blockTag.append( listDivTag );

        var blockList_UL_Tag = listDivTag.find( 'ul.tab__content_act');

        FormUtil.setUpTabAnchorUI( blockList_UL_Tag ); // Set click event + heights
        
        return blockList_UL_Tag;
    };


    me.otherInitialRenderSetup = function( divSyncDownTag, imgSyncDownTag, cwsRenderObj )
    {
        SyncManagerNew.setBlockListObj( me ); // Not Utilized, yet.
        me.setupForSyncDownload( divSyncDownTag, imgSyncDownTag, cwsRenderObj ); // Set 'SyncDownload' display show + click event
        me.cwsRenderObj.favIcons_Update();
    };


    me.setClassVariableTags = function ( blockTag )
    {
        me.blockTag = blockTag;
    };


    me.populateControls = function ( blockJson, activityList, blockList_UL_Tag )
    {
        if ( blockJson.activityListViews && blockJson.activityListViews.length > 0 )
        {
            me.BlockListViewObj = new BlockListView( me.cwsRenderObj, me, blockList_UL_Tag, blockJson.activityListViews );
            me.BlockListViewObj.render();

            // After setting up 'view', select 1st one will fire (eventually) 'reRender' of this class ( 'populateActivityList' with some clean up )?
            me.BlockListViewObj.viewSelect_1st();    
        }
        else
        {
            me.populateActivityList( activityList, blockList_UL_Tag );
        }
    };

    me.clearExistingList = function( blockList_UL_Tag )
    {
        blockList_UL_Tag.find( 'li' ).remove();
    };


    // ----------------------------------------

    // ===========================================================
    // === #1 Render() Related Methods ============

    // Previously ==> me.renderBlockList_Content( blockTag, me.cwsRenderObj, me.blockObj );
    me.populateActivityList = function( activityList, blockList_UL_Tag )
    {        
        if ( activityList.length === 0 ) 
        {
            me.blockList_UL_Tag.append( $( me.template_ActivityCardEmpty ) );
        }
        else
        {
            for( var i = 0; i < activityList.length; i++ )
            {
                me.createActivityListCard( activityList[i], blockList_UL_Tag );
            }    
        }
    };
        

    // Populate one Activity Item
    me.createActivityListCard = function( itemData, listContentUlTag, groupBy )
    {
        var liActivityItemCardTag = $( me.template_ActivityCard );
        listContentUlTag.append( liActivityItemCardTag );

        //var liActivityItemCardTag = activityCardTag.find( 'li.activityItemCard' );
        var anchorActivityItemCardTag = liActivityItemCardTag.find( 'a.expandable' );

        try
        {
            // Probably need to populate only one of below 2
            liActivityItemCardTag.attr( 'itemId', itemData.id );
            anchorActivityItemCardTag.attr( 'itemId', itemData.id );

            // Title - date description..
            liActivityItemCardTag.find( 'div.listItem_label_date' ).html( $.format.date( itemData.created, "dd MMM yyyy - HH:mm" ) );

            var listItem_icon_syncTag = liActivityItemCardTag.find( '.listItem_icon_sync' );

            // click event - for activitySubmit..
            listItem_icon_syncTag.click( function(e) {                
                e.stopPropagation();  // Stops calling parent tags event calls..
                console.log( 'activityCard Submit Clicked - ' + itemData.id );
            });


            // Populate the button image & click event
            //me.populateData_RedeemItemTag( itemData, liActivityItemCardTag );
            
        }
        catch( errMsg )
        {
            console.log( 'Error on createActivityListCard, errMsg: ' + errMsg );
        }
    };


    // ===========================================================
    // === Exposoed to Outside Methods ============





    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------
    // -- OLD CODES BELOW..

    me.setActivityListData = function( activityList )
    {
        me.activityList = Util.cloneArray( activityList );
    }

    // For each item/data, populate activity..

    // Populate Data..
    // Render Activities..


    // -================================================


    me.renderBlockList_Content = function( blockTag, cwsRenderObj, blockObj, callBack )
    {
        var blockList_UL_Tag = me.initializeBlockList_UI( blockTag );

        if ( me.hasViewsList( blockObj ) ) 
        {
            me.initializeViewsList_ClassesAndData( function() {

                document.addEventListener('scroll', function (event) {

                    // blockList_UL_Tag  <-- probably need to pass this...
                    me.loadBlockList_Data();

                }, true);

                if ( callBack ) callBack();
            });
        }
        else
        {
            console.log( 'test2.B' );

            me.setData_ForBlockList( cwsRenderObj._activityListData.list );

            // document.addEventListener('scroll', function (event) { me.loadBlockList_Data(); }, true);

            me.populateActivityListData( me.activityList, blockList_UL_Tag );
            //me.loadBlockList_Data();

            if ( callBack ) callBack();
        }

        return blockList_UL_Tag;
    }




    // New Method - like 'loadBlockList_Data...
    me.populateActivityListData = function( activityList, blockList_UL_Tag )
    {
        for( var i = 0; i < activityList.length; i++ )
        {
            var activityItem = activityList[i];
            var listGroup;

            activityItem.hours = Util.ageHours( activityItem.created );

            if ( me.showGroupBy )
            {
                // add generic groupBy code here abouts (when the time comes)
                listGroup = me.evalCreateGroupBy_Block( activityItem.hours, blockList_UL_Tag )
            }

            console.log( 'test z1' );

            me.createActivityListCard( activityItem, blockList_UL_Tag, listGroup );

            me.recordCounter += 1;
        }        
    };




    // --------------------------------------
    // -- TEMP PLACEMENT..  MOVE IT LATER..

    // Show the button + click event    
    me.setupForSyncDownload = function( divSyncDownTag, imgSyncDownTag, cwsRenderObj )
    {
        divSyncDownTag.show(); 

        imgSyncDownTag.off( "click" ).click( () => {

            SyncManagerNew.syncDown( cwsRenderObj, 'Manual', me.afterSyncDownload );
        });
    };


    me.afterSyncDownload = function( success ) 
    {
        if ( success )
        {
            // blockList UI Listing update??
            me.reRenderWtMainData( function() {
                console.log( 'Finished calling reRender() after syncDownload' );
            });       
        }
        else
        {
            console.log( 'syncDownload returned with failure..');
        }
    };

    // ===========================================================

    // ===========================================================


    me.blockListCard_Handle_ShowMore_Contents = function( expandedDivTag, moreDivTag, itemID  )
    {
        expandedDivTag.toggleClass( 'act-l-more-open' );  

        if ( expandedDivTag.hasClass( 'act-l-more-open' ) )
        {
            moreDivTag.find( 'span' ).html( 'see less' );

            expandedDivTag.html( FormUtil.loaderRing() );

            var itemData = Util.getFromList( me.cwsRenderObj._activityListData.list, itemID, "id" );
            var trxDetails = Util.activityListPreviewTable( 'transaction', me.getTrxDetails( itemData, 'name:value' ) );
            var historyDetails = Util.activityListPreviewTable( 'upload history', me.getTrxHistoryDetails ( itemData.history, 'name:value' ) );
            var prevDetails = Util.jsonToArray ( itemData.data.previewJson, 'name:value' );

            expandedDivTag.empty();

            expandedDivTag.append( trxDetails );
            expandedDivTag.append( historyDetails );

            if ( prevDetails && prevDetails.length )
            {
                expandedDivTag.append( Util.activityListPreviewTable( 'preview', prevDetails ) );
            } 

        }
        else
        {
            moreDivTag.find( 'span' ).html( 'see more' );
        }
    }


    me.blockListCard_ShowPhoneIcon_Check = function( itemData, targTag )
    {
        var activityType = FormUtil.getActivityType ( itemData );

        if ( activityType && activityType.calls )
        {
            var phoneNumber = itemData.data.payloadJson[ activityType.calls.phoneNumberField ];
            var evalConditions = activityType.calls.evalConditions;

            if ( evalConditions )
            {
                var paylDetails = Util.jsonToArray ( itemData.data.payloadJson, 'name:value' );

                for( var i = 0; ( i < evalConditions.length ) ; i++ )
                {
                    var phoneCondition = evalConditions[ i ].condition;

                    me.checkCondition( phoneCondition, paylDetails, function( passConditionTest ){

                        if ( passConditionTest )
                        {
                            var cellphoneTag = $('<img src="images/cellphone.svg" class="phoneCallAction" />');
    
                            cellphoneTag.click( function(e) {
    
                                e.stopPropagation();
    
                                if ( Util.isMobi() )
                                {
                                    window.location.href = `tel:${phoneNumber}`;
                                }
                                else
                                {
                                    alert( phoneNumber );
                                }
                            });

                            targTag.append( cellphoneTag );
                        }
                    })
                }
            }
        }
    };


    me.clearBlockList_UI_ForReload = function()
    {
        me.clearBlockListResults()

        $( window ).scrollTop( 0 );
    }


    me.loadBlockList_Data = function( callBack )
    {
        var activityList = me.activityList;

        console.log( 'test2.C' );
        console.log( activityList );


        me.AddToBlockList_NextPage( activityList, callBack );

        /*
        me.addToBlockList_Allowed_Check( function(){

            // if groupBy in use --> only allow adding of items if bottom group is Exanded (open)
            var liGroupBys = me.blockList_UL_Tag.find( 'li.activityItemGroup' );

            if ( liGroupBys.length > 0 ) // if list already loaded with GroupBy sections
            {
                if ( $( liGroupBys[ liGroupBys.length-1 ] ).hasClass( 'opened' ) )
                {
                    me.AddToBlockList_NextPage( activityList, callBack );
                }
            }
            else
            {
                me.AddToBlockList_NextPage( activityList, callBack );
            }

        }, function(){
            if ( me.activityList.length === 0 )
            {
                me.showList_EmptyTag()
            }
        });
        */
    }





    me.addToBlockList_Allowed_Check = function( callBackPass, callBackFail )
    {
        var check_recordsExistForLoading = ( me.activityList.length > 0 );
        var check_recordsCanStillBeLoaded = ! ( parseFloat( me.recordCounter ) >= parseFloat( me.activityList.length ) ); //me.blockList_Scrolling_LimitReached;
        var check_blockListScreenIsLoaded = me.blockList_UL_Tag && me.blockList_UL_Tag.is(':visible');
        var check_blockListNotAlreadyScrolling = ( FormUtil.syncRunning === undefined || FormUtil.syncRunning === 0 );
        var check_scrollBar_NotAtTopOfScreen = ( ( $( window ).scrollTop() + $( window ).height() + 85) > $( document ).height() );
        var check_blockList_NotLoadingRecords = ( me.recordsLoading == 0 );

        var Pass = ( check_recordsExistForLoading &&
                    check_recordsCanStillBeLoaded && 
                    check_blockListScreenIsLoaded && 
                    check_blockListNotAlreadyScrolling && 
                    check_scrollBar_NotAtTopOfScreen &&
                    check_blockList_NotLoadingRecords );

        if ( Pass )
        {  
            callBackPass();
        }
        else
        {
            callBackFail();
        }
    }


    me.AddToBlockList_NextPage = function( blockListData, callBack )
    {
        me.cwsRenderObj.pulsatingProgress.show();
        me.recordsLoading = 1;

        me.getBlockList_NextPage( blockListData, function( refreshed_DataList, recordFrom, recordTo ){


            console.log( 'refreshed_DataList: ' );
            console.log( refreshed_DataList );

            
            // add viewsSort_CurrentItem.field > here to auto sort (not by created data)
            if ( ( refreshed_DataList === undefined || refreshed_DataList.length == 0 ) && ( blockListData === undefined || blockListData.length == 0 ) )
            {
                me.showList_EmptyTag();
            }

            for( var i = 0; i < refreshed_DataList.length; i++ )
            {
                var activityItem = refreshed_DataList[i];
                var listGroup;

                activityItem.hours = Util.ageHours( activityItem.created );

                if ( me.showGroupBy )
                {
                    // add generic groupBy code here abouts (when the time comes)
                    listGroup = me.evalCreateGroupBy_Block( activityItem.hours, me.blockList_UL_Tag )
                }

                me.createActivityListCard( activityItem, me.blockList_UL_Tag, listGroup );

                me.recordCounter += 1;
            }


            // TODO: COMMENTED OUT TEMP
            //FormUtil.setUpTabAnchorUI( me.blockList_UL_Tag, '.expandable', 'click' ); // add click event (expander to show voucher details) to newly created items


            me.scrollingRecordLimitReached_Check();

            // UX timeout
            setTimeout( function() {
                me.cwsRenderObj.pulsatingProgress.hide();
            }, 250 );

            me.recordsLoading = 0;

            if ( callBack ) callBack( recordFrom, recordTo, blockListData.length );

        });

    }

    me.scrollingRecordLimitReached_Check = function()
    {
        //me.blockList_Scrolling_LimitReached = ( parseFloat( me.recordCounter ) == parseFloat( me.activityList.length ) );

        // record (display count) limit reached
        if ( parseFloat( me.recordCounter ) >= parseFloat( me.activityList.length ) )
        {
            $( document ).off( 'scroll' );
        }
    }

	me.checkCondition = function( evalCondition, arrData, callBack )
	{
		var result = false;

		if ( evalCondition )
		{
			try
			{
				var afterCondStr = me.conditionVarToVal( evalCondition, arrData );

                result = eval( afterCondStr );	
			}
			catch(ex) 
			{
				console.log( 'Failed during condition eval: ' );
				console.log( ex );
			}
		}

		if ( callBack ) callBack( result );
	};

	
	me.conditionVarToVal = function( evalCondition, arrData )
	{
        var evalString = evalCondition;

        for ( var i = 0; i < arrData.length; i++ )
		{
            var idStr = arrData[i];

            evalString = Util.replaceAll( evalString, '$$(' + idStr.name + ')', idStr.value );
		}

		return evalString;
    }

    
    me.getTrxDetails = function( dataObj, designLayout )
    {
        var ret = {};
        var fldList = 'id:id,created:dateCreated,network:createdOnline,networkAttempt:uploadAttempts,status:recordStatus,returnJson.response:lastError';
        var arrFld = fldList.split(',');

        for ( var i=0; i< arrFld.length; i++ )
        {
            var fld = arrFld[ i ].split( ':' );

            if ( fld[ 0 ].indexOf( '.' ) > 0 )
            {
                var splitFlds = fld[ 0 ].split( '.' );

                if ( dataObj[ splitFlds[ 0 ]] && dataObj[ splitFlds[ 0 ]][ splitFlds[ 1 ] ] ) ret[ fld[ 1 ]] = dataObj[ splitFlds[ 0 ]][ splitFlds[ 1 ] ];
            }
            else
            {
                if ( dataObj[ fld[ 0 ]] ) ret[ fld[ 1 ]] = dataObj[ fld[ 0 ] ];
            }
            
        }

        return Util.jsonToArray( ret, designLayout ); 

    }

    me.getTrxHistoryDetails = function( dataObj, designLayout )
    {
        var ret = {};

        if ( dataObj && dataObj.length )
        {
            for ( var i=0; i< dataObj.length; i++ )
            {
                ret[ ( i + 1) + '.attempt' ] = dataObj[ i ][ 'syncAttempt' ] ;
                ret[ ( i + 1) + '.succeeded' ] = dataObj[ i ][ 'success' ] ;
                ret[ ( i + 1) + '.server_response' ] = ( dataObj[ i ][ 'returnJson' ] && dataObj[ i ][ 'returnJson' ][ 'response' ] ? dataObj[ i ][ 'returnJson' ][ 'response' ] : '' ) ;
            }

            return Util.jsonToArray( ret, designLayout ); 
        }

    }

    me.getListDataPreview = function( dataJson, previewConfig )
    {
        if ( previewConfig )
        {
            var dataRet = $( '<div class="previewData listDataPreview" ></div>' );

            for ( var i=0; i< previewConfig.length; i++ ) 
            {
                var dat = me.mergePreviewData( previewConfig[ i ], dataJson );
                dataRet.append ( $( '<div class="listDataItem" >' + dat + '</div>' ) );
            }

        }

        return dataRet;

    }

    me.mergePreviewData = function ( previewField, Json )
    {
        var ret = '';
        var flds = previewField.split( ' ' );

        if ( flds.length )
        {
            for ( var f=0; f < flds.length; f++ )
            {
                for ( var key in Json ) 
                {
                    if ( flds[f] == key && Json[ key ] )
                    {
                        ret += flds[ f ] + ' ';
                        ret = ret.replace( flds[f] , Json[ key ] );
                    }
                }
            }
        }
        else
        {
            if ( previewField.length )
            {
                ret = previewField;

                for ( var key in Json ) 
                {
                    if ( previewField == key && Json[ key ] )
                    {
                        ret = ret.replace( previewField , Json[ key ] );
                    }
                }
            }
        }

        return ret;

    }

    me.populateData_RedeemItemTag = function( itemData, itemLiTag )
    {    
        // NOTE: Good place to create ActivityItem class.
        //      - But for efficiency, we are creating it when 'click' event happens

        var statusSecDivTag = itemLiTag.find( 'div.icons-status' );

        FormUtil.setStatusOnTag( statusSecDivTag, itemData, me.cwsRenderObj ); 

        // Click Events 
        //me.submitButtonListUpdate( statusSecDivTag, itemLiTag, itemData );
    }

    me.setContentDivClick = function( contentDivTag )
    {
        contentDivTag.click( function() {

            console.log( 'setContentDivClick clicked' );

            contentDivClickedTag = $( this );

            var itemId = contentDivClickedTag.attr( 'itemId' );
            var itemClicked = Util.getFromList( me.activityList, itemId, "id" );

        });        
    }

    // NOTE: JAMES/GREG --> SyncManagerNew.syncItem calling place..
    me.submitButtonListUpdate = function( statusSecDivTag, itemLiTag, itemData )
    {
        // TODO: Find a way to reset/clear previous events, etc and add new one as needed
        if ( itemData.status != Constants.status_redeem_submit )
        {
            // TODO: Find a way to reset/clear previous events, etc and add new one as needed
            var imgSyncIconTag = statusSecDivTag.find( 'small.syncIcon img' );

            imgSyncIconTag.click( function(e) {

                e.stopPropagation();

                var divListItemTag = $( this ).parents( 'div.listItem' );

                // DataManager2.getItemFromData( Constants.storageName_redeemList, itemData.id, function( ItemData_refreshed ){                
                var ItemData_refreshed = Util.getFromList( me.cwsRenderObj._activityListData.list, itemData.id, "id" );

                // TODO: 
                //if ( ItemData_refreshed.status != Constants.status_redeem_submit )
                //{
                if ( SyncManagerNew.syncStart() )
                {
                    try
                    {
                        var activityItem = new ActivityItem( ItemData_refreshed, divListItemTag, me.cwsRenderObj );

                        SyncManagerNew.syncItem( activityItem, function( success ) {

                            SyncManagerNew.syncFinish();     
                            //console.log( 'BlockList submitButtonListUpdate: isSuccess - ' + success );        
                        });    
                    }
                    catch( errMsg )
                    {
                        console.log( 'ERROR on running on activityItem Sync, errMsg - ' + errMsg );
                        SyncManagerNew.syncFinish();     
                    }
                }
                //}

            });
        }
    }

	// =============================================


	// =============================================
	// === OTHER METHODS ========================


    me.activityList_Add = function (submitJson, status, callBack) {

        try {
            var dateTimeStr = (new Date()).toISOString();
            var tempJsonData = {};

            tempJsonData.title = 'added' + ' [' + dateTimeStr + ']'; // MISSING TRANSLATION
            tempJsonData.created = dateTimeStr;
            tempJsonData.owner = FormUtil.login_UserName; // Added by Greg: 2018/11/26 > identify record owner
            tempJsonData.id = Util.generateRandomId();
            tempJsonData.status = status;
            tempJsonData.queueStatus = 'pending'; //DO NOT TRANSLATE?
            tempJsonData.archived = 0;
            tempJsonData.network = ConnManagerNew.statusInfo.appMode.toLowerCase(); // Added by Greg: 2018/11/26 > record network status at time of creation
            tempJsonData.data = submitJson;
            tempJsonData.activityType = me.lastActivityType(ActivityUtil.getActivityList(), 'eVoucher'); // Added by Greg: 2019/01/29 > determine last activityType declared in dcd@XX file linked to activityList (history)

            // TODO: ACTIVITY ADDING ==> FINAL PLACE FOR ACTIVITY LIST
            tempJsonData.activityList = ActivityUtil.getActivityList();
            tempJsonData.syncActionStarted = 0;
            tempJsonData.history = [];

            me.cwsRenderObj._activityListData.list.push(tempJsonData);
            //console.log('blockList.redeemList_Add - Before saveData_RedeemList');

            DataManager2.saveData_RedeemList(me.cwsRenderObj._activityListData, function () {

                //console.log('blockList.redeemList_Add - after saveData_RedeemList');
                callBack();

                FormUtil.gAnalyticsEventAction(function (analyticsEvent) {

                    // added by Greg (2019-02-18) > test track googleAnalytics
                    ga('send', {
                        'hitType': 'event',
                        'eventCategory': 'redeemList_Add',
                        'eventAction': analyticsEvent,
                        'eventLabel': FormUtil.gAnalyticsEventLabel()
                    });
                });

            });
        }

        catch (errMsg) {
            // Temporarily use 'alert' to get noticed about this...  for now..
            alert('ERROR during blockList.redeemList_Add, errMsg: ' + errMsg);
        }

        // Greg: consider adding a loop back into FormUtil.updateSyncListItems() ? OR naturally let blockList handle this as it seems to be the next step 
        //       pwa MUST re-initialize 'syncManager' queue+fail arrays
    }

    me.updateDivStatusColor = function( status, divTag )
    {
        // Set background color of Div
        var divBgColor = "";

        if ( status === Constants.status_redeem_submit ) divBgColor = 'LightGreen';
        else if ( status === Constants.status_redeem_queued ) divBgColor = 'LightGray';
        else if ( status === Constants.status_redeem_failed ) divBgColor = 'Tomato';

        if ( divBgColor != "" ) divTag.css( 'background-color', divBgColor );         
    }

    me.lastActivityType = function( json, defVal )
    {
        if ( json )
        {
            for ( var i = json.length; i--; )
            {
                if ( json[ i ].defJson && json[ i ].defJson.activityType )
                {
                    return json[ i ].defJson.activityType;
                }
            }
        }
        else
        {
            return defVal;
        }
    }


    me.showList_EmptyTag = function()
    {
        var liTag = $( '<li class="emptyListLi"></li>' );
        var spanTag = $( '<a class="expandable" style="min-height: 60px; padding: 23px; color: #888;" term="' + Util.termName_listEmpty + '">List is empty.</a>' );

        liTag.append( spanTag );
        me.blockList_UL_Tag.append( liTag );
    };

    me.showList_EndTag = function()
    {
        var liTag = $( '<li class="endOfListLi"></li>' );
        var spanTag = $( '<a class="expandable" style="min-height: 60px; padding: 23px; color: #888;" term="' + Util.termName_listEmpty + '">End of list</a>' );

        liTag.append( spanTag );
        me.blockList_UL_Tag.append( liTag );
    };

    me.evalCreateGroupBy_Block = function( ageHours, targTag )
    {
        var retGroup = '';
        for ( var g=0; g < me.groupByItems.length; g++ )
        {
            if ( ( parseInt( ageHours ) < parseInt( me.groupByItems[ g ].hours ) ) )
            {
                retGroup = me.groupByItems[ g ].hours;

                if ( me.groupByItems[ g ].created == 0 )
                {
                    var liContentTag = $( '<li class="activityItemGroup opened"></li>' );
                    var anchorTag = $( '<a class="activityItemGroupSection" peGroup="' + retGroup + '" style=""><img src="images/arrow_up.svg" class="arrow" style="padding-right:4px;">' + me.groupByItems[ g ].name + '</a>' );

                    targTag.append( liContentTag );
                    liContentTag.append( anchorTag );

                    anchorTag.click( function() {

                        var imgTag = this.children[ 0 ];
                        var groupByClickTag = $( this );

                        me.toggleGroupBy_Contents( groupByClickTag.parent().parent(), 'groupBy', retGroup );

                        groupByClickTag.parent()[ 0 ].classList.toggle( "opened" );

                        imgTag.classList.toggle( "rotateImg" );

                    });

                    me.groupByItems[ g ].created = 1;
                    break;
                }
                else
                {
                    break;
                }
            }
        }
        return retGroup;
    }

    me.toggleGroupBy_Contents = function( parentTag, attrName, attrVal )
    {        
        var liArr = parentTag.find( 'li' );

        for( var i = 0; i < liArr.length ; i++ )
        {
            if ( liArr[ i ] && $( liArr[ i ] ).attr( attrName ) && $( liArr[ i ] ).attr( attrName ) == attrVal )
            {
                $( liArr[ i ] ).css( 'display', ( $( liArr[ i ] ).css( 'display' ) == 'none' ) ? 'block' : 'none' );
            }
        }

    }

	// =============================================


	// =============================================
	// === EVENTS METHODS ========================


    // ------------------------------------------------
    // NEW: James Ones
    me.reloadActivityList = function()
    {
        me.setData_ForBlockList( me.cwsRenderObj._activityListData.list, true );
    }

    // Use Util..
    me.appendData_ActivityList = function( additionalList )
    {
        //Util.mergeArray();
    }


    //
    // ----------------------------------------------

    me.setData_ForBlockList = function( activityList, withRefesh )
    {
        me.paging_lastItm = 0;
        me.recordCounter = 0;
        me.activityList = Util.cloneArray( activityList ); //[...activityList];

        if ( withRefesh )
        {
            me.loadBlockList_Data();
        }
    }

    me.hasViewsList = function()
    {
        return ( me.blockObj.blockJson.activityListViews && me.blockObj.blockJson.activityListViews.length );
    }

    me.initializeViewsList_ClassesAndData = function( callBack ) //viewList
    {
        me.viewsListFilterObj = new ViewsListFilter( me, function( defaultView, filteredData ){

            me.viewsListSorterObj = new ViewsListSorter( me );

            me.viewsListSorterObj.runApply_SortList( defaultView, filteredData, function( sortedData ){

                me.setData_ForBlockList( sortedData, true );

                callBack();
        
            } );

        } );
    }


    // OBSOLETE - TO BE REMOVED..
    me.createViewsList_UI = function( viewsContainerTag )
    {
        me.blockList_UL_Tag.append( viewsContainerTag );
    }

    me.createPager_UI = function( pagerBlockTag )
    {
        me.blockList_UL_Tag.append( pagerBlockTag );
    }

    // OBSOLETE - TO BE REMOVED...
    me.switchFilter = function( viewName )
    {
        me.clearBlockList_UI_ForReload();

        me.viewsListFilterObj.runApply_ViewsListFilter( viewName, function( viewItem, filteredData ){

            me.viewsListSorterObj.runApply_SortList( viewItem, filteredData, function( sortedData ){

                me.setData_ForBlockList( sortedData, true );

            } );

        } );

    }

    me.switchSorter = function( thisSortTag )
    {
        me.clearBlockList_UI_ForReload();

        me.viewsListSorterObj.switch_ApplyNewSort( thisSortTag, function( sortedData ){

            me.setData_ForBlockList( sortedData, true );

        } );

    }

    me.clearBlockListResults = function()
    {
        me.blockList_UL_Tag.find( 'li.activityItemCard' ).remove();
        me.blockList_UL_Tag.find( 'li.activityItemGroup' ).remove();
        me.blockList_UL_Tag.find( 'li.emptyListLi' ).remove();
        me.blockList_UL_Tag.find( 'li.endOfListLi' ).remove();
    };

    me.getBlockList_NextPage = function( dataList, callBack )
    {
        console.log( 'dataList: ' );
        console.log( dataList );

        var pageFrom = me.paging_lastItm;
        var pageUntil = ( parseInt( me.paging_lastItm + Constants.activityList_PageSize ) < dataList.length ) ? parseInt( me.paging_lastItm + Constants.activityList_PageSize ) : dataList.length; 
        var pageResults = [];

        for ( var i = pageFrom; i < pageUntil; i++ )
        {
            pageResults.push( dataList[ i ] );
        }

        me.paging_lastItm = i;

        if ( callBack ) callBack( pageResults, ( pageResults.length) ? 1 : 0, i );
    }

    // =============================================

    me.initialize();
}