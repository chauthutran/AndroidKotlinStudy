// -------------------------------------------
// -- BlockList Class/Methods
function BlockList( cwsRenderObj, blockObj ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;        

    //me.redeemList;  // NOTE: Replaced by cwsRenderObj._activityDataListStorage
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
    me.lastSyncDate;
    me.showredeemListDateGroups = false;
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


    // TODO: JAMES - Working on here..
    me.redeemList_Display = function( blockTag )
    {
        
        me.renderRedeemList( me.cwsRenderObj._activityListData, blockTag, function() {

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
    }


    me.renderRedeemList = function( redeemObj, blockTag, callBack )
    {

        $( window ).scrollTop(0);

        // Remove any previous render.
        blockTag.find( 'div.listDiv' ).remove();

        DataManager.getData( 'session', function( data ){

            me.lastSyncDate = data[ 'syncDate' ];

            // Copy from list html template
            $( '#listTemplateDiv > div.listDiv' ).clone().appendTo( blockTag );

            //var listUlLiActiveTag = blockTag.find( 'li.active' );
            var listContentUlTag = blockTag.find( '.tab__content_act' );

            me.redeemListTargetTag = listContentUlTag;

            if ( redeemObj && redeemObj.length )
            {
                var lidateGroupPaddTop = $( '<li class="dateGroupPaddTop"></li>' );

                listContentUlTag.append( lidateGroupPaddTop );

                me.redeemList = redeemObj.filter( a=> a.owner == FormUtil.login_UserName );

                if ( me.options && me.options.filter )
                {
                    for( var o=0; o<me.options.filter.length; o++ )
                    {
                        var filterObj = me.options.filter[o];
                        var keys = Object.keys(filterObj);
                        var keyValue = filterObj[keys[0]];

                        me.redeemList = redeemObj.filter( a=> a[keys[0]] == keyValue );
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

        });

    }

    me.evalScrollOnBottom = function()
    {
        if ( !me.redeemListLimit && me.newBlockTag.find( 'div.listDiv' ) && me.newBlockTag.find( 'div.listDiv' ).is(':visible') && ( FormUtil.syncRunning == undefined || FormUtil.syncRunning == 0 ) )
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

        me.refreshRedeemListArray( function(){

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

        });

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

        me.evalCallEnabled( itemData, tdVoucherIdObj )

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

        expandedDivTag.click( function(e){
            e.stopPropagation();
        });

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
                moreDivTag.find( 'span' ).html( 'see less' );

                //expandedDivTag.empty();
                expandedDivTag.html( FormUtil.loaderRing() )

                DataManager.getItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id, function( fetchItemData ){

                    var trxDetails = Util.activityListPreviewTable( 'transaction', me.getTrxDetails( itemData, 'name:value' ) );
                    //var prevDetails = Util.activityListPreviewTable( 'preview', Util.jsonToArray ( itemData.data.previewJson, 'name:value' ) );
                    var historyDetails = Util.activityListPreviewTable( 'upload history', me.getTrxHistoryDetails ( itemData.history, 'name:value' ) );
                    var prevDetails = Util.jsonToArray ( itemData.data.previewJson, 'name:value' );

                    expandedDivTag.empty();

                    expandedDivTag.append( trxDetails );
                    expandedDivTag.append( historyDetails );

                    if ( prevDetails && prevDetails.length )
                    {
                        expandedDivTag.append( Util.activityListPreviewTable( 'preview', prevDetails ) );
                    } 
    
                } );
            }
            else
            {
                moreDivTag.find( 'span' ).html( 'see more' );
            }

        })

        // Populate the Item Content
        me.populateData_RedeemItemTag( itemData, liContentTag );

    }

    me.evalCallEnabled = function( itemData, targTag )
    {
        var activityType = FormUtil.getActivityType ( itemData );

        if ( activityType && activityType.calls )
        {

            var phoneNumber = itemData.data.payloadJson[ activityType.calls.phoneNumberField ];
            var evalConditions = activityType.calls.evalConditions;

            /*if ( activityType.calls.evalArray )
            {
                var paylDetails = Util.jsonObjToThisArray ( itemData.data.payloadJson, activityType.calls.evalArray, 'name:value' );
            }
            else
            {*/
                //console.log( itemData.data.payloadJson );
                //var paylDetails = Util.jsonToArray ( itemData.data.payloadJson, 'name:value' );
            //}

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
                                    alert( phoneNumber )
                                }
                            });

                            targTag.append( cellphoneTag );

                        }

                    })

                }


            }

        }

    }

	me.checkCondition = function( evalCondition, arrData, callBack )
	{
		var result = false;

		if ( evalCondition )
		{
			try
			{
				var afterCondStr = me.conditionVarToVal( evalCondition, arrData )

                result = eval( afterCondStr );	
                console.log( afterCondStr + ' >> ' + result );
			}
			catch(ex) 
			{
				console.log( 'Failed during condition eval: ' );
				console.log( ex );
			}
		}

		if ( callBack ) callBack( result );
	}

	
	me.conditionVarToVal = function( evalCondition, arrData )
	{
        var evalString = evalCondition;

        for ( var i = 0; i < arrData.length; i++ )
		{
			var idStr = arrData[i];
            evalString = Util.replaceAll( evalString, '$$(' + idStr.name + ')', idStr.value );
            //console.log( evalString, idStr.name, idStr.value );
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
        // TODO: THIS SHOULD BE PLACED IN ActivityItem class.
        //  We should create Activity Item object at this point.
        //      And have all theses populate method in the activityItem class..

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

    // NOTE: JAMES/GREG --> SyncManagerNew.syncItem calling place..
    me.submitButtonListUpdate = function( statusSecDivTag, itemLiTag, itemData )
    {
        // TODO: Find a way to reset/clear previous events, etc and add new one as needed
        if ( itemData.status != me.status_redeem_submit )
        {
            // TODO: Find a way to reset/clear previous events, etc and add new one as needed
            var imgSyncIconTag = statusSecDivTag.find( 'small.syncIcon img' );

            imgSyncIconTag.click( function(e) {

                e.stopPropagation();

                var divListItemTag = $( this ).parents( 'div.listItem' );

                


                //DataManager.getItemFromData( Constants.storageName_RedeemList, itemData.id, function( ItemData_refreshed ){

                    console.log( 'clicking activityItem on blockList, itemData: ' );
                    console.log( ItemData_refreshed );

                    // TODO: 
                    //if ( ItemData_refreshed.status != me.status_redeem_submit )
                    //{
                        if ( SyncManagerNew.syncStart() )
                        {
                            var activityItem = new ActivityItem( ItemData_refreshed, divListItemTag, me.cwsRenderObj );
        
                            SyncManagerNew.syncItem( activityItem, function( success ) {
        
                                console.log( 'BlockList submitButtonListUpdate: isSuccess - ' + success );
    
                            });
                        }
                    //}

                //} );
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
            // Greg: consider adding a loop back into FormUtil.updateSyncListItems() ? OR naturally let blockList handle this as it seems to be the next step 
            //       pwa MUST re-initialize 'syncManager' queue+fail arrays
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
    
    me.refreshRedeemListArray = function( callBack )
    {
        // check the last recorded date for a sync run; if that date is different to localStorage (session:syncDate) we need to reload me.redeemList with fresh copy of activity/redeemList for rendering up-to-date statuses for records
        DataManager.getData( 'session', function( data ){

            var lastSyncDate = data[ 'syncDate' ];

            if ( lastSyncDate != me.lastSyncDate )
            {
                DataManager.getData( 'redeemList', function( activityList ){

                    me.redeemList = activityList.list.filter( a=> a.owner == FormUtil.login_UserName );
                    me.lastSyncDate = data[ 'syncDate' ];

                    if ( callBack ) callBack();
                });
            }
            else
            {
                if ( callBack ) callBack();
            }

        });

    }

	// =============================================

	me.initialize();
}