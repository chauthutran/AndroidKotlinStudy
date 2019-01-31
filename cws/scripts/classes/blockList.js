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
		if ( list === 'redeemList' )
        {
            if ( options )
            {
                me.options = options;
            }

            if ( newBlockTag )
            {
                me.newBlockTag = newBlockTag;
            }

            me.redeemList_Display( me.newBlockTag );

            // Add Event from 'FormUtil'
            //  - To Enable click
            FormUtil.setUpTabAnchorUI( me.newBlockTag.find( 'ul.tab__content_act') );

            if ( FormUtil.dcdConfig && FormUtil.dcdConfig.favList  )
            {
                me.setFloatingListMenuIconEvents( me.newBlockTag.find( '.floatListMenuIcon' ), me.newBlockTag.find( '.floatListMenuSubIcons' ) );
            }
            else
            {
                me.newBlockTag.find( '.floatListMenuIcon' ).hide();
            }

        }
    }


    me.redeemList_Display = function( blockTag )
    {
        var jsonStorageData = DataManager.getOrCreateData( me.storageName_RedeemList );

        me.renderRedeemList( jsonStorageData.list, blockTag );	
    }

    me.renderRedeemList = function( redeemList, blockTag )
    {

        $(window).scrollTop(0);

        // Remove any previous render.
        blockTag.find( 'div.listDiv' ).remove();

        // Copy from list html template
        $( '#listTemplateDiv > div.listDiv' ).clone().appendTo( blockTag );

        var listUlLiActiveTag = blockTag.find( 'li.active' );
        var listContentUlTag = blockTag.find( '.tab__content_act' );

        me.redeemListTargetTag = listContentUlTag;

        if ( redeemList )
        {
            me.redeemList = redeemList.filter(a=>a.owner==FormUtil.login_UserName);

            if ( me.options && me.options.filter )
            {
                for( var o=0; o<me.options.filter.length; o++ )
                {
                    var filterObj = me.options.filter[o];
                    var keys = Object.keys(filterObj);
                    var keyValue = filterObj[keys[0]];

                    me.redeemList = redeemList.filter(a=>a[keys[0]]==keyValue);
                }
                //listUlLiActiveTag.find( 'label' ).html('List');
            }

            (me.redeemList).sort(function (a, b) {
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

            if ( me.lastRedeemDate ) me.redeemList = me.redeemList.filter(a=>a['created']<me.lastRedeemDate);

            if ( me.redeemList === undefined || me.redeemList.length == 0 )
            {
                var liTag = $( '<li class="emptyListLi"></li>' );
                var spanTag = $( '<a class="expandable" style="min-height: 60px; padding: 10px; color: #888;" term="' + Util.termName_listEmpty + '">List is empty.</a>' );

                liTag.append( spanTag );
                listContentUlTag.append( liTag );
            }
            else
            {
                me.cwsRenderObj.pulsatingProgress.show();
                me.redeemListScrollLimit = me.redeemList.length;

                /*for( var i = 0; ( ( i < me.redeemList.length) && ( i < parseInt(me.redeemListScrollSize) ) ) ; i++ )
                {
                    me.lastRedeemDate =  me.redeemList[i].created;
                    me.renderRedeemListItemTag( me.redeemList[i], me.redeemListTargetTag );
                    me.redeemListScrollCount += 1;
                }*/

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

            }

        }
        else
        {

            var liTag = $( '<li class="emptyListLi"></li>' );
            var spanTag = $( '<a class="expandable" style="min-height: 60px; padding: 10px; color: #888;"><br>&nbsp;<label class="from-string titleDiv" term="' + Util.termName_listEmpty + '">List is empty.</label></a>' );

            liTag.append( spanTag );
            listContentUlTag.append( liTag );

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
                    me.cwsRenderObj.pulsatingProgress.show();
                    me.redeemListScrollingState = 1;

                    setTimeout( function() {
                        me.appendRedeemListOnScrollBottom();
                    }, 500 );

                }
                
            }
        }
       
    }

    me.appendRedeemListOnScrollBottom = function()
    {

        if ( me.lastRedeemDate ) me.redeemList = me.redeemList.filter(a=>a['created']<me.lastRedeemDate);

        for( var i = 0; ( ( i < me.redeemList.length) && ( i < parseInt(me.redeemListScrollSize)) ) ; i++ )
        {
            me.lastRedeemDate =  me.redeemList[i].created;
            me.renderRedeemListItemTag( me.redeemList[i], me.redeemListTargetTag );
            me.redeemListScrollCount += 1;
        }

        FormUtil.setUpTabAnchorUI( me.newBlockTag.find( 'ul.tab__content_act') ); // add click event (expander to show voucher details) to newly created items

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

    me.renderRedeemListItemTag = function( itemData, listContentUlTag )
    {   

        var itemAttrStr = 'itemId="' + itemData.id + '"';
        var liContentTag = $( '<li ' + itemAttrStr + '></li>' );

        // Anchor for clickable header info
        var anchorTag = $( '<a class="expandable" ' + itemAttrStr + '></a>' );
        var dateTimeStr = $.format.date( itemData.created, "dd MMM yyyy - HH:mm ");

        if ( FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings.redeemDefs && FormUtil.dcdConfig.settings.redeemDefs.activityTypes )
        {
            var activityType = me.getActivityType ( itemData );
            //console.log( activityType );
            var statusOpt = me.getStatusOpt ( itemData );

            if ( statusOpt )
            {
                var blockListItemTag = $( '<div class="icon-row listItem" />' );
                var tblObj = $( '<table style="width:100%;">' ); 
                var trObj1 = $( '<tr>' );
                var tdIconObj = $( '<td id="listItem_icon_activityType_' + itemData.id + '" rowspan=2 style="overflow:hidden;" >' ); 
                var tdDataPreviewObj = $( '<td id="listItem_data_preview_' + itemData.id + '" rowspan=2 style="vertical-align:top;padding:2px;font-size:calc(10px + 0.6vw);width:50%;" >' ); 
                var tdVoucherIdObj = $( '<td id="listItem_voucher_code_' + itemData.id + '" rowspan=2 style="vertical-align:top;padding:2px;font-size:calc(10px + 0.6vw);" >' ); 
                var tdActionSyncObj = $( '<td id="listItem_action_sync_' + itemData.id + '" style="width:50px;position: relative;top: -4px;" >' ); 

                var labelDtm = $( '<div>' + dateTimeStr + '</div>' );

                tblObj.append( trObj1 );
                trObj1.append( tdIconObj );
                trObj1.append( tdDataPreviewObj );
                trObj1.append( tdVoucherIdObj );
                trObj1.append( tdActionSyncObj );

                tblObj.append( trObj1 );

                blockListItemTag.append( tblObj );
                tdDataPreviewObj.append( labelDtm );

                me.appendActivityTypeIcon ( tdIconObj, activityType, statusOpt );
            }
            else
            {
                var blockListItemTag = $( '<div class="icon-row"><img src="img/act.svg">' + dateTimeStr + '</div>' );
            }
        }
        else
        {
            var blockListItemTag = $( '<div class="icon-row"><img src="img/act.svg">' + dateTimeStr + '</div>' );
        }

        var expandArrowTag = $( '<div class="icon-arrow listExpand"><img class="expandable-arrow" src="img/arrow_down.svg" style="width:24px;height:24px;position:relative;top:-8px;"></div>' );

        var trObj2 = $( '<tr>' );
        tblObj.append( trObj2 );
        var tdExpandObj = $( '<td id="listItem_expand_' + itemData.id + '" rowspan=1 >' ); 
        trObj2.append( tdExpandObj );
        tdExpandObj.append( expandArrowTag );

        var previewDivTag = me.getListDataPreview( itemData.data.payloadJson, activityType.previewData )
        tdDataPreviewObj.append( previewDivTag );

        var voucherTag = $( '<div class="act-r"><small>'+ ( ( itemData.data.payloadJson.voucherCode ) ? itemData.data.payloadJson.voucherCode : itemData.id ) +'<br>' + itemData.activityType + '</small></div>' ); //FormUtil.dcdConfig.countryCode : country code not necessary to 99.9% of health workers
        tdVoucherIdObj.append( voucherTag );

        var statusSecDivTag = $( '<div class="icons-status"><small  class="syncIcon"><img src="img/sync-n.svg" style="width:28px;height:28px;"></small></div>' );
        tdActionSyncObj.append( statusSecDivTag );

        anchorTag.append( blockListItemTag );

        // Content that gets collapsed/expanded 
        var contentDivTag = $( '<div class="act-l" id="listItem_networkResults_' + itemData.id + '" style="position: relative;font-size:calc(10px + 0.6vw);"></div>' );
        contentDivTag.append( '<span ' + FormUtil.getTermAttr( itemData ) + '>' + itemData.title + '</span>' );
        //var itemActionButtonsDivTag = $( '<div class="listItemDetailActionButtons"></div>' );
        //itemActionButtonsDivTag.append( $( '<span>' + JSON.stringify( itemData.data.payloadJson ) + '</span>' ) );
        //contentDivTag.append( itemActionButtonsDivTag );

        // Click Events
        me.setContentDivClick( contentDivTag );

        // Append to 'li'
        liContentTag.append( anchorTag, contentDivTag );

        // Append the liTag to ulTag
        listContentUlTag.append( liContentTag );

        // Populate the Item Content
        me.populateData_RedeemItemTag( itemData, liContentTag );

    }

    me.getActivityType = function( itemData )
    {
        var opts = FormUtil.dcdConfig.settings.redeemDefs.activityTypes;

        for ( var i=0; i< opts.length; i++ )
        {
            if ( opts[i].name == itemData.activityType )
            {
                return opts[i];
            }
        }

    }

    me.getStatusOpt = function( itemData )
    {
        var opts = FormUtil.dcdConfig.settings.redeemDefs.statusOptions;

        for ( var i=0; i< opts.length; i++ )
        {
            if ( opts[i].name == itemData.status )
            {
                return opts[i];
            }
        }

    }


    me.getListDataPreview = function( payloadJson, previewData )
    {
        if ( previewData )
        {
            var dataRet = $( '<div class="previewData" style="width:100%;float:left;font-weight:400;"></div>' );

            for ( var i=0; i< previewData.length; i++ ) 
            {
                var dat = me.mergePreviewData( previewData[ i ], payloadJson );
                dataRet.append ( $( '<div class="" style="">' + dat + '</div>' ) );
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

    me.appendActivityTypeIcon = function ( iconObj, activityType, statusOpt )
    {
        // read local SVG xml structure, then replace appropriate content 'holders'
        $.get( activityType.icon.path, function(data) {

            var svgObject = ( $(data)[0].documentElement );

            if ( activityType.icon.colors )
            {
                if ( activityType.icon.colors.background )
                {
                    $( svgObject ).html( $(svgObject).html().replace(/{BGFILL}/g, activityType.icon.colors.background) );
                    $( svgObject ).attr( 'colors.background', activityType.icon.colors.background );
                }
                if ( activityType.icon.colors.foreground )
                {
                    $( svgObject ).html( $(svgObject).html().replace(/{COLOR}/g, activityType.icon.colors.foreground) );
                    $( svgObject ).attr( 'colors.foreground', activityType.icon.colors.foreground );
                }

            }

            $( iconObj ).empty();
            $( iconObj ).append( svgObject );

            if ( FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings.redeemDefs && FormUtil.dcdConfig.settings.redeemDefs.activityIconSize )
            {
                $( iconObj ).html( $(iconObj).html().replace(/{WIDTH}/g, FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width ) );
                $( iconObj ).html( $(iconObj).html().replace(/{HEIGHT}/g, FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.height ) );

            }

            var statusIconObj = $( '<div id="' + iconObj.attr( 'id' ).replace( 'listItem_icon_activityType_','icon_status_' ) + '" style="position:relative;left:' + ( FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width - FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width ) + 'px;top:-' + (FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height + 3) + 'px;">&nbsp;</div>' );
            $( '#' + iconObj.attr( 'id' ) ).css( 'width', ( FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width + 4 ) + 'px' )

            $( iconObj ).append( statusIconObj )

            me.appendStatusIcon ( statusIconObj, statusOpt )
        });

    }

    me.appendStatusIcon = function ( iconObj, statusOpt )
    {

        // read local SVG xml structure, then replace appropriate content 'holders'
        $.get( statusOpt.icon.path, function(data) {

            var svgObject = ( $(data)[0].documentElement );

            if ( statusOpt.icon.colors )
            {
                if ( statusOpt.icon.colors.background )
                {
                    $( svgObject ).html( $(svgObject).html().replace(/{BGFILL}/g, statusOpt.icon.colors.background) );
                    $( svgObject ).attr( 'colors.background', statusOpt.icon.colors.background );
                }
                if ( statusOpt.icon.colors.foreground )
                {
                    $( svgObject ).html( $(svgObject).html().replace(/{COLOR}/g, statusOpt.icon.colors.foreground) );
                    $( svgObject ).attr( 'colors.foreground', statusOpt.icon.colors.foreground );
                }

            }

            $( iconObj ).empty();
            $( iconObj ).append( svgObject );

            if ( FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings.redeemDefs && FormUtil.dcdConfig.settings.redeemDefs.statusIconSize )
            {
                $( iconObj ).html( $(iconObj).html().replace(/{WIDTH}/g, FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width ) );
                $( iconObj ).html( $(iconObj).html().replace(/{HEIGHT}/g, FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height ) );

            }


        });

    }

    me.populateData_RedeemItemTag = function( itemData, itemLiTag )
    {    
        var statusSecDivTag = itemLiTag.find( 'div.icons-status' );

        me.setStatusOnTag( statusSecDivTag, itemData ); 

        //var itemActionButtonsDivTag = itemLiTag.find( 'div.act-l div.listItemDetailActionButtons');

        // Click Events
        me.submitButtonListUpdate( statusSecDivTag, itemLiTag, itemData );

    }

    me.setStatusOnTag = function( statusSecDivTag, itemData ) 
    {

        var imgSyncIconTag = statusSecDivTag.find( 'small.syncIcon img' );

        if ( itemData.status === me.status_redeem_submit )
        {
            imgSyncIconTag.attr ( 'src', 'img/sync-n.svg' );
        }
        else if ( itemData.status === me.status_redeem_failed )
        {

            if ( !itemData.networkAttempt || (itemData.networkAttempt && itemData.networkAttempt < cwsRenderObj.storage_offline_ItemNetworkAttemptLimit ) )
            {
                imgSyncIconTag.attr ( 'src', 'img/sync-n.svg' ); // should show the 'active' icon: sync-banner.svg
            }
            else
            {
                if ( itemData.networkAttempt >= cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
                {
                    imgSyncIconTag.attr ( 'src', 'img/sync_error.svg' );
                }
                else
                {
                    imgSyncIconTag.attr ( 'src', 'img/sync-n.svg' );
                }
            }
        }
        else
        {
            imgSyncIconTag.attr ( 'src', 'img/sync-banner.svg' );
        }

    }


    me.setContentDivClick = function( contentDivTag )
    {
        contentDivTag.click( function() {

            contentDivClickedTag = $( this );

            var itemId = contentDivClickedTag.attr( 'itemId' );

            var itemClicked = Util.getFromList( me.redeemList, itemId, "id" );
            //console.log( 'itemDiv clicked - ' + JSON.stringify( itemClicked ) ); // + itemAnchorTag.outerHtml() );
        });        
    }


    me.submitButtonListUpdate = function( statusSecDivTag, itemLiTag, itemData )
    {

        if ( itemData.status != me.status_redeem_submit ) // changed by Greg (2018/11/27) from '== !' to '!=' > was failing to test correctly
        {
            var imgSyncIconTag = statusSecDivTag.find( 'small.syncIcon img' );

            imgSyncIconTag.click( function(e) {

                var bProcess = false;
                var fetchItemData = DataManager.getItemFromData( me.storageName_RedeemList, itemData.id )
                console.log( itemData);
                console.log( fetchItemData);
                console.log( itemData == fetchItemData);

                if ( !fetchItemData.networkAttempt ) // no counter exists for this item
                {
                    bProcess = true;
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

                    var mySyncIcon = $( this );
                    var dtmRedeemAttempt = (new Date() ).toISOString();

                    mySyncIcon.rotate({ count:999, forceJS: true, startDeg: true });

                    fetchItemData.lastAttempt = dtmRedeemAttempt;

                    var redeemID = mySyncIcon.parent().parent().parent().attr( 'id' ).replace( 'listItem_action_sync_','' );
                    console.log( redeemID );
                    console.log( '#listItem_networkResults_' + redeemID );
                    var myTag = $( '#listItem_networkResults_' + redeemID );
                    var loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;">Connecting... </div>' );

                    myTag.empty();
                    myTag.append( loadingTag );

                    e.stopPropagation();                

                    // if offline, alert it!! OR data server unavailable
                    if ( ConnManager.isOffline() )
                    {
                        alert( 'Currently in offline.  Need to be in online for this.' );
                        myTag.html( fetchItemData.title );
                        $(this).stop();
                    }
                    else
                    {
                        //itemData.state = 1; //added to avoid duplicate calls sometimes occurring??? 1=in use, 0=unused
                        FormUtil.submitRedeem( fetchItemData.data.url, fetchItemData.data.payloadJson, fetchItemData.data.actionJson, loadingTag, function( success, returnJson )
                        {

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
                                fetchItemData.status = me.status_redeem_submit;
                                //itemData.returnJson = returnJson;
                                myTag.html( 'Success' );
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
                                }

                                myTag.html( 'Error redeeming' );
                            }

                            //itemData.state = 0; //1=in use, 0=unused

                            me.setStatusOnTag( itemLiTag.find( 'div.icons-status' ), fetchItemData ); 

                            DataManager.updateItemFromData( me.storageName_RedeemList, fetchItemData.id, fetchItemData );

                            setTimeout( function() {
                                myTag.html( fetchItemData.title );
                                me.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + fetchItemData.id ), me.getActivityType ( fetchItemData ), me.getStatusOpt ( fetchItemData ) )
                            }, 1000 );

                        } );

                    }

                }

            });
        }

    }

	// =============================================


	// =============================================
	// === OTHER METHODS ========================


    me.redeemList_Add = function( submitJson, status )
    {
        var dateTimeStr = (new Date() ).toISOString();

        var tempJsonData = {};
        tempJsonData.title = ( ( submitJson.payloadJson.voucherCode ) ? "Voucher: " + submitJson.payloadJson.voucherCode  + " - " : "") + dateTimeStr;
        tempJsonData.created = dateTimeStr;
        tempJsonData.owner = FormUtil.login_UserName; // Added by Greg: 2018/11/26 > identify record owner
        tempJsonData.id = Util.generateRandomId();
        tempJsonData.status = status;
        tempJsonData.network = ConnManager.getAppConnMode_Online(); // Added by Greg: 2018/11/26 > record network status at time of creation
        tempJsonData.data = submitJson;
        tempJsonData.activityType = me.lastActivityType( ActivityUtil.getActivityList() ); // Added by Greg: 2019/01/29 > determine last activityType declared in dcd@XX file linked to activityList (history)
        // TODO: ACTIVITY ADDING ==> FINAL PLACE FOR ACTIVITY LIST
        tempJsonData.activityList = ActivityUtil.getActivityList();
        console.log( 'tempJsonData.activityList' );
        console.log( tempJsonData.activityList );

        DataManager.insertDataItem( me.storageName_RedeemList, tempJsonData );	
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

    me.lastActivityType = function( json )
    {
        for ( var i = json.length; i--; )
        {
            console.log( 'eval lastActivityType: ' + json[ i ].defJson.activityType );
            if ( json[ i ].defJson && json[ i ].defJson.activityType )
            {
                return json[ i ].defJson.activityType;
            }
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