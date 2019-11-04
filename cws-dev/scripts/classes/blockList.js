// -------------------------------------------
// -- BlockList Class/Methods
function BlockList( cwsRenderObj, blockObj ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;        

    me.redeemList;
    me.redeemListTargetTag;
    me.redeemListScrollSize = 15; // move where?
    me.redeemListScrollingState = 0;
    me.redeemListScrollCount = 0;
    me.redeemListScrollLimit = 0;
    me.redeemListScrollExists = 0;
    me.lastRedeemDate;
    me.redeemListLimit;
    me.options;
    me.newBlockTag;

    me.storageName_RedeemList = cwsRenderObj.storageName_RedeemList; // "redeemList";
    me.status_redeem_submit = cwsRenderObj.status_redeem_submit; //"submit"; 
    me.status_redeem_queued = cwsRenderObj.status_redeem_queued; //"queued"; 
    me.status_redeem_failed = cwsRenderObj.status_redeem_failed; //"failed";

    me.redeemListDateGroups;
    me.showredeemListDateGroups = true;
    me.debugMode = ( ( location.href ).indexOf( '.psi-mis.org' ) < 0 || ( location.href ).indexOf( 'cws-' ) >= 0 );


	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function() {
        me.redeemListLimit = false;
    }

	// -----------------------------------

    me.render = function( list, newBlockTag, passedData, options )
	{
        me.redeemListDateGroups = FormUtil.getCommonDateGroups();

		if ( list === 'redeemList' )
        {
            if ( options )
            {
                me.options = options;
            }

            if ( newBlockTag )
            {
                me.newBlockTag = newBlockTag;

                me.redeemList_Display( me.newBlockTag );

                // Add Event from 'FormUtil'
                //  - To Enable click
                FormUtil.setUpTabAnchorUI( me.newBlockTag.find( 'ul.tab__content_act') );

            }


        }
    }


    me.redeemList_Display = function( blockTag )
    {

        DataManager.getOrCreateData( me.storageName_RedeemList, function( jsonStorageData ){

            me.renderRedeemList( jsonStorageData, blockTag, function(){

                if ( FormUtil.dcdConfig && FormUtil.dcdConfig.favList  )
                {
                    me.cwsRenderObj.favIconsObj.initialize();

                    me.setFloatingListMenuIconEvents( $( '#pageDiv' ).find( '.floatListMenuIcon' ), $( '#pageDiv' ).find( '.floatListMenuSubIcons' ) );
                }
                else
                {
                    $( '#pageDiv' ).find( '.floatListMenuIcon' ).hide();
                }

            } );

        } );

    }

    me.renderRedeemList = function( redeemObj, blockTag, callBack )
    {

        $( window ).scrollTop(0);

        // Remove any previous render.
        blockTag.find( 'div.listDiv' ).remove();

        // Copy from list html template
        $( '#listTemplateDiv > div.listDiv' ).clone().appendTo( blockTag );

        //var listUlLiActiveTag = blockTag.find( 'li.active' );
        var listContentUlTag = blockTag.find( '.tab__content_act' );

        me.redeemListTargetTag = listContentUlTag;

        if ( redeemObj && redeemObj.list )
        {
            var lidateGroupPaddTop = $( '<li class="dateGroupPaddTop"></li>' );

            listContentUlTag.append( lidateGroupPaddTop );
    
            me.redeemList = redeemObj.list.filter( a=> a.owner == FormUtil.login_UserName );

            if ( me.options && me.options.filter )
            {
                for( var o=0; o<me.options.filter.length; o++ )
                {
                    var filterObj = me.options.filter[o];
                    var keys = Object.keys(filterObj);
                    var keyValue = filterObj[keys[0]];

                    me.redeemList = redeemObj.list.filter( a=> a[keys[0]] == keyValue );
                }
            }

            ( me.redeemList ).sort(function (a, b) {
                var a1st = -1, b1st =  1, equal = 0; // zero means objects are equal
                if (b.created > a.created) {
                    return b1st;
                }
                else if (a.created > b.created) {
                    return a1st;
                }
                else {
                    return equal;
                }
            });

            if ( me.lastRedeemDate ) me.redeemList = me.redeemList.filter( a=> a['created'] < me.lastRedeemDate );

            if ( me.redeemList === undefined || me.redeemList.length == 0 )
            {
                var liTag = $( '<li class="emptyListLi"></li>' );
                var spanTag = $( '<a class="expandable" style="min-height: 60px; padding: 10px; color: #888;" term="' + Util.termName_listEmpty + '">List is empty.</a>' );

                liTag.append( spanTag );
                listContentUlTag.append( liTag );

                if ( callBack ) callBack();
            }
            else
            {
                me.cwsRenderObj.pulsatingProgress.show();
                me.redeemListScrollLimit = me.redeemList.length;

                if ( parseInt(me.redeemListScrollCount) < me.redeemListScrollLimit )
                {
                    //attach window scroll event listener to call me.appendRedeemListOnScrollBottom()
                   if ( me.redeemListScrollExists == 0)
                   {
                        document.addEventListener('scroll', function (event) {
                            me.evalScrollOnBottom();
                        }, true );

                        me.redeemListScrollExists = 1;

                        me.evalScrollOnBottom();

                    }
                }
                else
                {
                    me.redeemListLimit = true;
                    document.removeEventListener( 'scroll', me.evalScrollOnBottom() );
                    me.redeemListScrollExists = 0;
                }

                setTimeout( function() {
                    me.cwsRenderObj.pulsatingProgress.hide();
                }, 500 );

                if ( callBack ) callBack();

            }

        }
        else
        {

            var liTag = $( '<li class="emptyListLi"></li>' );
            var spanTag = $( '<a class="expandable" style="padding: 19px 5px 15px 19px; color: #888;"><img src="images/unavail.svg" class="tab-image" alt="active"><label class="from-string titleDiv" style="padding:0 0 0 16px;" term="' + Util.termName_listEmpty + '">List is empty.</label></a>' );

            liTag.append( spanTag );
            listContentUlTag.append( liTag );

            if ( callBack ) callBack();

        }

    }

    me.evalScrollOnBottom = function()
    {
        if ( !me.redeemListLimit && $( 'div.listDiv' ).is(':visible') )
        {
            if ( ( $( window ).scrollTop() + $( window ).height() + 85) > $( document ).height() )
            {
                if ( me.redeemListScrollingState == 0 )
                {

                    var aCalGroups = me.newBlockTag.find( 'li.dateGroup' );

                    if ( aCalGroups.length > 0 ) // if list already loaded with dateGroupSections
                    {

                        if ( $( aCalGroups[ aCalGroups.length-1 ] ).hasClass( 'opened' ) )
                        {
                            me.cwsRenderObj.pulsatingProgress.show();
                            me.redeemListScrollingState = 1;
        
                            setTimeout( function() {
                                me.appendRedeemListOnScrollBottom();
                            }, 500 );
                        }

                    }
                    else
                    {
                        me.cwsRenderObj.pulsatingProgress.show();
                        me.redeemListScrollingState = 1;
    
                        setTimeout( function() {
                            me.appendRedeemListOnScrollBottom();
                        }, 500 );   
                    }

                }
            }
        }
    }

    me.evalCreateDateGroup = function( ageHours, targTag )
    {
        var retGroup = '';
        for ( var g=0; g < me.redeemListDateGroups.length; g++ )
        {
            if ( ( parseInt( ageHours ) < parseInt( me.redeemListDateGroups[ g ].hours ) ) )
            {
                retGroup = me.redeemListDateGroups[ g ].hours;

                if ( me.redeemListDateGroups[ g ].created == 0 )
                {
                    var liContentTag = $( '<li class="dateGroup opened"></li>' );
                    var anchorTag = $( '<a class="dateGroupSection" peGroup="' + retGroup + '" style=""><img src="images/arrow_up.svg" class="arrow" style="padding-right:4px;">' + me.redeemListDateGroups[ g ].name + '</a>' );

                    targTag.append( liContentTag );
                    liContentTag.append( anchorTag );

                    anchorTag.click( function() {

                        var imgTag = this.children[ 0 ];
                        var calendardGroupClickedTag = $( this );

                        me.evalToggleCalGroupCards( calendardGroupClickedTag.parent().parent(), 'calGroup', retGroup );

                        calendardGroupClickedTag.parent()[ 0 ].classList.toggle( "opened" );

                        imgTag.classList.toggle( "rotateImg" );

                    });

                    me.redeemListDateGroups[ g ].created = 1;
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

    me.evalToggleCalGroupCards = function( parentTag, attrName, attrVal )
    {        
        var liArr = parentTag.find( 'li' );

        for( var i = 0; i < liArr.length ; i++ )
        {
            if ( liArr[ i ] && $( liArr[ i ] ).attr( attrName ) && $( liArr[ i ] ).attr( attrName ) == attrVal )
            {
                $( liArr[ i ] ).css( 'display', ( $( liArr[ i ] ).css( 'display' ) == 'none' ) ? 'block' : 'none' );
            }
        }

        //var liDtmGrp = parentTag.find( 'li.dateGroup' );
        //console.log ( liDtmGrp )

        //var imgTag = parentTag.children[ 0 ].children[ 0 ];
        //var calendardGroupClickedTag = $( this );

        //me.evalToggleCalGroupCards( calendardGroupClickedTag.parent().parent(), 'calGroup', retGroup );
        //imgTag.classList.toggle( "rotateImg" );
        //console.log( imgTag );

    }

    me.appendRedeemListOnScrollBottom = function()
    {
        if ( me.lastRedeemDate ) me.redeemList = me.redeemList.filter(a=>a['created']<me.lastRedeemDate);

        for( var i = 0; ( ( i < me.redeemList.length) && ( i < parseInt(me.redeemListScrollSize)) ) ; i++ )
        {
            me.lastRedeemDate =  me.redeemList[i].created;
            me.redeemList[i].hours = Util.ageHours( me.redeemList[i].created )

            var calendarGroup = me.evalCreateDateGroup( me.redeemList[i].hours, me.redeemListTargetTag )

            me.createRedeemListCard( me.redeemList[i], me.redeemListTargetTag, calendarGroup );
            me.redeemListScrollCount += 1;
        }

        FormUtil.setUpTabAnchorUI( me.newBlockTag.find( 'ul.tab__content_act'), '.expandable', 'click' ); // add click event (expander to show voucher details) to newly created items

        if ( parseInt( me.redeemListScrollCount ) == parseInt( me.redeemListScrollLimit ) )
        {
            me.redeemListLimit = true;
            document.removeEventListener( 'scroll', me.evalScrollOnBottom() );
            me.redeemListScrollExists = 0;
        }

        me.cwsRenderObj.pulsatingProgress.hide();
        me.redeemListScrollingState = 0;

    }


    // TODO: Split into HTML frame create and content populate?
    // <-- Do same for all class HTML and data population?  <-- For HTML create vs 'data populate'/'update'

    me.createRedeemListCard = function( itemData, listContentUlTag, calGroup )
    {   
        var bIsMobile = Util.isMobi();
        var itemAttrStr = 'itemId="' + itemData.id + '"' + ( ( calGroup ) ? ' calGroup="' + calGroup + '" ' : '' );
        var liContentTag = $( '<li ' + itemAttrStr + '></li>' );

        // Anchor for clickable header info
        var anchorTag = $( '<a class="expandable" ' + itemAttrStr + ' style="' + ( !bIsMobile ? 'padding:4px;' : '' ) + '"></a>' );
        var dateTimeStr = $.format.date( itemData.created, "dd MMM yyyy - HH:mm" );

        if ( FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings.redeemDefs && FormUtil.dcdConfig.settings.redeemDefs.activityTypes )
        {
            var activityType = FormUtil.getActivityType ( itemData );
            var statusOpt = FormUtil.getStatusOpt ( itemData );

            if ( statusOpt )
            {
                var blockListItemTag = $( '<div class="icon-row listItem" />' );
                var tblObj = $( '<table id="listItem_table_' + itemData.id + '" class="listItem_table" >' );
                var trObj1 = $( '<tr>' );
                var tdDragObj = $( '<td id="listItem_selector_drag_' + itemData.id + '" rowspan=2 class="" style="' + ( bIsMobile ? 'width:2px;' : 'width:2px;' ) + 'opacity:0.65;vertical-align:top;" ><div style="overflow-y:hidden;' + ( bIsMobile ? '' : '' ) + '" class="' + ( bIsMobile ? '' : '' ) + ' listItem">&nbsp;</div></td>' );
                var tdIconObj = $( '<td id="listItem_icon_activityType_' + itemData.id + '" rowspan=2 class="listItem_icon_activityType" >' ); 
                var tdDataPreviewObj = $( '<td id="listItem_data_preview_' + itemData.id + '" rowspan=2 class="listItem_data_preview" >' ); 
                var tdVoucherIdObj = $( '<td id="listItem_voucher_status_' + itemData.id + '" rowspan=2 class="listItem_voucher_status" >' ); 
                var tdActionSyncObj = $( '<td id="listItem_action_sync_' + itemData.id + '" class="listItem_action_sync" >' ); 
                var labelDtm = $( '<div class="listItem_label_date" >' + dateTimeStr + '</div>' );

                tblObj.append( trObj1 );
                trObj1.append( tdDragObj );
                trObj1.append( tdIconObj );
                trObj1.append( tdDataPreviewObj );
                trObj1.append( tdVoucherIdObj );
                trObj1.append( tdActionSyncObj );
                tblObj.append( trObj1 );
                blockListItemTag.append( tblObj );
                tdDataPreviewObj.append( labelDtm );

                FormUtil.appendActivityTypeIcon ( tdIconObj, activityType, statusOpt, me.cwsRenderObj );

            }
            else
            {
                var blockListItemTag = $( '<div class="icon-row"><img src="images/act.svg">' + dateTimeStr + '</div>' );
            }
        }
        else
        {
            var blockListItemTag = $( '<div class="icon-row"><img src="images/act.svg">' + dateTimeStr + '</div>' );
        }

        var expandArrowTag = $( '<div class="icon-arrow listExpand"><img class="expandable-arrow" src="images/arrow_down.svg" ></div>' );
        var trObj2 = $( '<tr id="listItem_trExpander_' + itemData.id + '">' );
        var tdExpandObj = $( '<td id="listItem_expand_' + itemData.id + '" rowspan=1 >' ); 

        tblObj.append( trObj2 );
        trObj2.append( tdExpandObj );
        tdExpandObj.append( expandArrowTag );

        var previewDivTag = me.getListDataPreview( itemData.data.previewJson, activityType.previewData )
        tdDataPreviewObj.append( previewDivTag );

        var voucherTag = $( '<div class="act-r"><span id="listItem_queueStatus_' + itemData.id + '">'+ ( ( itemData.queueStatus ) ? itemData.queueStatus : 'pending' ) +'</span></div>' ); //<br>' + itemData.activityType + ' //FormUtil.dcdConfig.countryCode : country code not necessary to 99.9% of health workers
        tdVoucherIdObj.append( voucherTag );
        
        DataManager.getItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id, function( fetchItemData ){

            var paylDetails = Util.jsonToArray ( fetchItemData.data.payloadJson, 'name:value' );

            if ( paylDetails && paylDetails.length )
            {
                //ADD DCDconfig lookup to get 'phoneNumber' defined field name (linked to current activityType)
                var cellReservedField = "phoneNumber"; //getConfigPhoneCallField

                //  CELLPHONE 
                var cellphoneNumber = paylDetails.filter( item => { if ( item.name.indexOf( cellReservedField ) >= 0 ){ return item.value } } );

                if ( cellphoneNumber && cellphoneNumber.length && cellphoneNumber.length > 0 ) 
                {

                    //ADD DCDconfig lookup to compare defined rules [show/hide logic] for rendering phoneCall action event
                    var passConditionTest = false;

                    if ( 1 == 1 ) passConditionTest = true

                    if ( passConditionTest )
                    {
                        var cellphoneTag = $('<img src="images/cellphone.svg" class="phoneCallAction" />');

                        cellphoneTag.click( function(e) {
    
                            e.stopPropagation();
    
                            if ( Util.isMobi() )
                            {
                                window.open(`tel:${cellphoneNumber[0].value}`)
                            }
                            else
                            {
                                alert( cellphoneNumber[0].value )
                            }
                        });
    
                        tdVoucherIdObj.append( cellphoneTag );
                    }

                } 
                //  
            } 

        });

        

        var statusSecDivTag = $( '<div class="icons-status"><small  class="syncIcon"><img src="images/sync-n.svg" id="listItem_icon_sync_' + itemData.id + '" class="listItem_icon_sync ' + ( statusOpt.name == me.status_redeem_submit ? 'listItem_icon_sync_done' : '' ) + '" ></small></div>' );
        tdActionSyncObj.append( statusSecDivTag );

        // Content that gets collapsed/expanded 
        var contentDivTag = $( '<div class="act-l " id="listItem_networkResults_' + itemData.id + '" ></div>' );
        //contentDivTag.append( '<span ' + FormUtil.getTermAttr( itemData ) + '>' + itemData.title + '</span>' );

        var moreDivTag = $( '<div class="act-l-more"></div>' );
        contentDivTag.append( moreDivTag );
        moreDivTag.append( '<img src="images/client.svg" style="width:18px;height:18px;opacity:0.5">&nbsp;<span term="">see more</span>' );

        var expandedDivTag = $( '<div class="act-l-expander" style="display:none"></div>' );
        contentDivTag.append( expandedDivTag );

        // Click Events
        me.setContentDivClick( contentDivTag );

        anchorTag.append( blockListItemTag );
        anchorTag.append( contentDivTag );
        liContentTag.append( anchorTag ); 
        listContentUlTag.append( liContentTag );

        moreDivTag.click( function(e){

            e.stopPropagation();

            expandedDivTag.toggleClass( 'act-l-more-open' );  

            if ( expandedDivTag.hasClass( 'act-l-more-open' ) )
            {
                expandedDivTag.empty();

                DataManager.getItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id, function( fetchItemData ){

                    console.log( fetchItemData );

                    var trxDetails = Util.arrayToHTMLtable( 'transaction', me.getTrxDetails( fetchItemData, 'name:value' ) );
                    //var prevDetails = Util.arrayToHTMLtable( 'preview', Util.jsonToArray ( itemData.data.previewJson, 'name:value' ) );
                    var historyDetails = Util.arrayToHTMLtable( 'upload history', me.getTrxHistoryDetails ( fetchItemData.history, 'name:value' ) );
                    var paylDetails = Util.jsonToArray ( fetchItemData.data.payloadJson, 'name:value' );

                    
                    expandedDivTag.append( trxDetails );
                    expandedDivTag.append( historyDetails );
                    
                    if ( paylDetails && paylDetails.length )
                    {
                        //console.log("PAYLOADDDD",paylDetails)
                        expandedDivTag.append( Util.arrayToHTMLtable( 'payload', paylDetails ) );
                    } 
    
                });
            }


        })

        // Populate the Item Content
        me.populateData_RedeemItemTag( itemData, liContentTag );

    }

    me.getTrxDetails = function( dataObj, designLayout )
    {
        var ret = {};
        var fldList = 'id:id,created:dateCreated,network:createdOnline,networkAttempt:uploadAttempts,status:recordStatus,returnJson.response:last_error';
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
                ret[ 'attempt_' + ( i + 1) ] = dataObj[ i ][ 'syncAttempt' ] ;
                ret[ 'success_' + ( i + 1) ] = dataObj[ i ][ 'success' ] ;
                ret[ 'response_' + ( i + 1) ] = ( dataObj[ i ][ 'returnJson' ] && dataObj[ i ][ 'returnJson' ][ 'response' ] ? dataObj[ i ][ 'returnJson' ][ 'response' ] : '' ) ;
            }

            return Util.jsonToArray( ret, designLayout ); 

        }

    }

    me.getListDataPreview = function( payloadJson, previewData )
    {
        if ( previewData )
        {
            var dataRet = $( '<div class="previewData listDataPreview" ></div>' );

            for ( var i=0; i< previewData.length; i++ ) 
            {
                var dat = me.mergePreviewData( previewData[ i ], payloadJson );
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
        var statusSecDivTag = itemLiTag.find( 'div.icons-status' );

        FormUtil.setStatusOnTag( statusSecDivTag, itemData, me.cwsRenderObj ); 

        // Click Events
        me.submitButtonListUpdate( statusSecDivTag, itemLiTag, itemData );

    }

    me.setContentDivClick = function( contentDivTag )
    {
        contentDivTag.click( function() {

            contentDivClickedTag = $( this );

            var itemId = contentDivClickedTag.attr( 'itemId' );
            var itemClicked = Util.getFromList( me.redeemList, itemId, "id" );

        });        
    }


    me.submitButtonListUpdate = function( statusSecDivTag, itemLiTag, itemData )
    {

        if ( itemData.status != me.status_redeem_submit ) // changed by Greg (2018/11/27) from '== !' to '!=' > was failing to test correctly
        {
            var imgSyncIconTag = statusSecDivTag.find( 'small.syncIcon img' );

            imgSyncIconTag.click( function(e) {

                e.stopPropagation();

                var bProcess = false;
                //var fetchItemData = DataManager.getItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id );
                DataManager.getItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id, function( fetchItemData ){

                    if ( fetchItemData && fetchItemData.networkAttempt == undefined ) // no counter exists for this item
                    {
                        if ( ! ConnManager.networkSyncConditions )
                        {
                            // MISSING TRANSLATION
                            MsgManager.notificationMessage ( 'Currently offline. Network must be online for this.', 'notificationDark', undefined, '', 'right', 'top', undefined, undefined, undefined, 'OfflineSyncWarning' );
                        }
                        else
                        {
                            bProcess = true;
                        }
                    }
                    else
                    {   
                        //  counter exists for this item AND counter is below limit
                        if ( fetchItemData.networkAttempt < me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
                        {
                            bProcess = true;
                        }
                        else
                        {
                            MsgManager.msgAreaShow( 'Network upload FAIL LIMIT exceeded: ' + me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit );
                        }
                    }

                    if ( bProcess )
                    {
                        if ( fetchItemData.status == me.status_redeem_submit )
                        {
                            bProcess = false;
                        }
                    }

                    if ( bProcess )
                    {
                        // CHECK IF ITEM ALREADY BEING SYNCRONIZED ELSEWHERE IN THE SYSTEM
                        //var dataItm = DataManager.getItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id );
                        DataManager.getItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id, function( dataItm ){

                            if ( dataItm.syncActionStarted == 0 )
                            {
                                //console.log( e );
                                //console.log( statusSecDivTag.find( 'small.syncIcon img' ) );
                                var mySyncIcon = statusSecDivTag.find( 'small.syncIcon img' ); //$( this );
                                var dtmRedeemAttempt = (new Date() ).toISOString();

                                mySyncIcon.rotate({ count:999, forceJS: true, startDeg: 0 });

                                fetchItemData.lastAttempt = dtmRedeemAttempt;

                                var redeemID = mySyncIcon.attr( 'id' ).replace( 'listItem_icon_sync_','' );
                                //var myTag = $( '#listItem_networkResults_' + redeemID );
                                var myQueueStatus = $( '#listItem_queueStatus_' + itemData.id );
                                var loadingTag = $( '<div class="loadingImg syncConnecting" >Connecting to network... </div>' ); //MISSING TRANSLATION

                                //myTag.empty();
                                //myTag.append( loadingTag );

                                e.stopPropagation();

                                // if offline, alert it!! OR data server unavailable
                                if ( ConnManager.isOffline() )
                                {
                                    // MISSING TRANSLATION
                                    MsgManager.notificationMessage ( 'Current mode: offline. Need to be online for this.', 'notificationDark', undefined, '', 'right', 'top', undefined, undefined, undefined, 'OfflineSyncWarning' );
                                    //myTag.html( fetchItemData.title );
                                    mySyncIcon.stop();
                                }
                                else
                                {
                                    //itemData.state = 1; //added to avoid duplicate calls sometimes occurring??? 1=in use, 0=unused
                                    FormUtil.submitRedeem( fetchItemData.data.url, fetchItemData.data.payloadJson, fetchItemData.data.actionJson, loadingTag, function( success, returnJson )
                                    {
                                        var itmHistory = fetchItemData.history;

                                        mySyncIcon.stop();

                                        fetchItemData.returnJson = returnJson;

                                        // added by Greg (2019-01-14) > record network sync attempts (for limit management)
                                        if ( fetchItemData.networkAttempt ) fetchItemData.networkAttempt += 1; //this increments several fold?? e.g. jumps from 1 to 3, then 3 to 7??? 
                                        else fetchItemData.networkAttempt = 1;

                                        // Added 2019-01-08 > check returnJson.resultData.status != 'fail' value as SUCCESS == true always occurring
                                        if ( success && ( returnJson.resultData.status != 'fail' ) )
                                        {
                                            var dtmRedeemDate = (new Date() ).toISOString();

                                            fetchItemData.redeemDate = dtmRedeemDate;
                                            fetchItemData.title = 'saved to network' + ' [' + dtmRedeemDate + ']'; // MISSING TRANSLATION
                                            fetchItemData.status = me.status_redeem_submit;
                                            fetchItemData.queueStatus = 'success'; // MISSING TRANSLATION

                                            if ( fetchItemData.activityList ) delete fetchItemData.activityList;

                                            myQueueStatus.html( fetchItemData.queueStatus )
                                            statusSecDivTag.find( '.listItem_icon_sync' ).addClass( 'listItem_icon_sync_done' );
                                            //myTag.html( fetchItemData.title );

                                        }
                                        else 
                                        {
                                            if ( returnJson && returnJson.displayData && ( returnJson.displayData.length > 0 ) ) 
                                            {
                                                var msg = JSON.parse( returnJson.displayData[0].value ).msg;
        
                                                fetchItemData.title = msg.toString().replace(/--/g,'<br>'); // hardcoding to create better layout
                                            }

                                            /* only when sync-test exceeds limit do we mark item as FAIL */
                                            if ( fetchItemData.networkAttempt >= me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
                                            {
                                                fetchItemData.status = me.status_redeem_failed;
                                                fetchItemData.queueStatus = me.status_redeem_failed;
                                            }
                                            else
                                            {
                                                fetchItemData.queueStatus = 'retry'; // MISSING TRANSLATION
                                            }
        
                                            //myTag.html( 'Error redeeming' );
                                        }

                                        if ( returnJson )
                                        {
                                            itmHistory.push ( { "syncType": "item-icon-Click", "syncAttempt": dtmRedeemAttempt, "success": success, "returnJson": returnJson } );
                                        }
                                        else
                                        {
                                            itmHistory.push ( { "syncType": "item-icon-Click", "syncAttempt": dtmRedeemAttempt, "success": success } );
                                        }
        
                                        FormUtil.setStatusOnTag( itemLiTag.find( 'div.icons-status' ), fetchItemData, me.cwsRenderObj ); 
        
                                        fetchItemData.history = itmHistory;
        
                                        DataManager.updateItemFromData( me.storageName_RedeemList, fetchItemData.id, fetchItemData );

                                        myQueueStatus.html( fetchItemData.queueStatus )
        
                                        setTimeout( function() {
                                            FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + fetchItemData.id ), FormUtil.getActivityType ( fetchItemData ), FormUtil.getStatusOpt ( fetchItemData ), me.cwsRenderObj )
                                        }, 1000 );
        
                                    } );
        
                                }
        
                            }
                        } );

                    }

                } )

            });

        }

    }

	// =============================================


	// =============================================
	// === OTHER METHODS ========================


    me.redeemList_Add = function( submitJson, status, callBack )
    {
        var dateTimeStr = (new Date() ).toISOString();
        var tempJsonData = {};

        tempJsonData.title = 'added' + ' [' + dateTimeStr + ']'; // MISSING TRANSLATION
        tempJsonData.created = dateTimeStr;
        tempJsonData.owner = FormUtil.login_UserName; // Added by Greg: 2018/11/26 > identify record owner
        tempJsonData.id = Util.generateRandomId();
        tempJsonData.status = status;
        tempJsonData.queueStatus = 'pending'; //DO NOT TRANSLATE?
        tempJsonData.archived = 0;
        tempJsonData.network = ConnManager.getAppConnMode_Online(); // Added by Greg: 2018/11/26 > record network status at time of creation
        tempJsonData.data = submitJson;
        tempJsonData.activityType = me.lastActivityType( ActivityUtil.getActivityList(), 'eVoucher' ); // Added by Greg: 2019/01/29 > determine last activityType declared in dcd@XX file linked to activityList (history)

        // TODO: ACTIVITY ADDING ==> FINAL PLACE FOR ACTIVITY LIST
        tempJsonData.activityList = ActivityUtil.getActivityList();
        tempJsonData.syncActionStarted = 0;
        tempJsonData.history = [];

        FormUtil.gAnalyticsEventAction( function( analyticsEvent ) {

            // added by Greg (2019-02-18) > test track googleAnalytics
            ga('send', { 'hitType': 'event', 'eventCategory': 'redeemList_Add', 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });

            if ( me.debugMode )
            {
                console.log( tempJsonData );
                console.log( JSON.stringify( tempJsonData ) );    
            }

            DataManager.insertDataItem( me.storageName_RedeemList, tempJsonData, callBack );
        });
    }

    me.redeemList_Reload = function( listItemTag )
    {
        var blockTag = listItemTag.closest( 'div.block' );
        blockTag.find( 'div.redeemListDiv' ).remove();
        me.redeemList_Display( blockTag );
    }

    me.updateDivStatusColor = function( status, divTag )
    {
        // Set background color of Div
        var divBgColor = "";

        if ( status === me.status_redeem_submit ) divBgColor = 'LightGreen';
        else if ( status === me.status_redeem_queued ) divBgColor = 'LightGray';
        else if ( status === me.status_redeem_failed ) divBgColor = 'Tomato';

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
	// =============================================


	// =============================================
	// === EVENTS METHODS ========================

    me.setFloatingListMenuIconEvents = function( iconTag, SubIconListTag )
	{
        FormUtil.setClickSwitchEvent( iconTag, SubIconListTag, [ 'on', 'off' ], me.cwsRenderObj );
	}

	// =============================================

	me.initialize();
}