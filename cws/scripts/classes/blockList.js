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
        var dateTimeStr = $.format.date( itemData.created, " yy-MM-dd HH:mm ");

        if ( FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings.redeemDefs && FormUtil.dcdConfig.settings.redeemDefs.statusOptions )
        {
            var statusOpt = me.getStatusOpt ( itemData );

            if ( statusOpt )
            {
                var dateTimeTag = $( '<div class="icon-row" />' );
                var tblObj = $( '<table style="width:100%;">' ); 
                var trObj = $( '<tr>' ); 
                var tdLeftObj = $( '<td id="icon_' + itemData.id + '">' ); 
                var tdRightObj = $( '<td>' ); 

                //var iconObj = $( '<div id="redeemListIcon_' + unqID + '" />' ); //img : changed from img to span as svg will be appended
                var labelDtm = $( '<div>' + dateTimeStr + '</div>' );

                tblObj.append( trObj );
                trObj.append( tdLeftObj );
                trObj.append( tdRightObj );
                tblObj.append( trObj );

                dateTimeTag.append( tblObj );
                tdRightObj.append( labelDtm );

                me.appendStatusOptThemeIcon ( tdLeftObj, statusOpt );
            }
            else
            {
                var dateTimeTag = $( '<div class="icon-row"><img src="img/act.svg">' + dateTimeStr + '</div>' );
            }
        }
        else
        {
            var dateTimeTag = $( '<div class="icon-row"><img src="img/act.svg">' + dateTimeStr + '</div>' );
        }
        
        var expandArrowTag = $( '<div class="icon-arrow"><img class="expandable-arrow" src="img/arrow_down.svg"></div>' );
        
        //var statusSecDivTag = $( '<div class="icons-status"><small class="statusName" style="color: #7dd11f;">{status}</small><small class="statusIcon"><img src="img/open.svg"></small><small  class="syncIcon"><img src="img/sync.svg"></small><small  class="errorIcon"><img src="img/alert.svg"></small></div>' );
        var statusSecDivTag = $( '<div class="icons-status"><small  class="syncIcon"><img src="img/sync-n.svg"></small></div>' );
        var voucherTag = $( '<div class="act-r"><small>'+itemData.data.payloadJson.voucherCode+' - eVoucher</small></div>' ); //FormUtil.dcdConfig.countryCode : country code not necessary to 99.9% of health workers

        anchorTag.append( dateTimeTag, expandArrowTag, statusSecDivTag, voucherTag );

        // Content that gets collapsed/expanded 
        var contentDivTag = $( '<div class="act-l" ' + itemAttrStr + ' style="position: relative; background-color: rgba(255, 218, 109, 0.507);"></div>' );
        contentDivTag.append( '<span ' + FormUtil.getTermAttr( itemData ) + '>' + itemData.title + '</span>' );
        var itemActionButtonsDivTag = $( '<div class="listItemDetailActionButtons"></div>' );
        contentDivTag.append( itemActionButtonsDivTag );

        // Click Events
        me.setContentDivClick( contentDivTag );

        // Append to 'li'
        liContentTag.append( anchorTag, contentDivTag );

        // Append the liTag to ulTag
        listContentUlTag.append( liContentTag );

        // Populate the Item Content
        me.populateData_RedeemItemTag( itemData, liContentTag );

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

    me.appendStatusOptThemeIcon = function ( iconObj, statusOpt )
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

            if ( FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings.redeemDefs && FormUtil.dcdConfig.settings.redeemDefs.size )
            {
                $( iconObj ).html( $(iconObj).html().replace(/{WIDTH}/g, FormUtil.dcdConfig.settings.redeemDefs.size.width ) );
                $( iconObj ).html( $(iconObj).html().replace(/{HEIGHT}/g, FormUtil.dcdConfig.settings.redeemDefs.size.height ) );

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
        /*
        var statusTag = $( '<div class="icons-status">
                <small class="statusName open-color">open</small>
                <small class="statusIcon"><img src="img/open.svg"></small>
        */

        //var smallStatusNameTag = statusSecDivTag.find( 'small.statusName' );
        //var imgStatusIconTag = statusSecDivTag.find( 'small.statusIcon img' );
        var imgSyncIconTag = statusSecDivTag.find( 'small.syncIcon img' );
        //var imgErrIconTag = statusSecDivTag.find( 'small.errorIcon img' );

        if ( itemData.status === me.status_redeem_submit )
        {
            //smallStatusNameTag.text( 'submitted' ).css( 'color', '#e48825' ); // Redeemed?
            //imgStatusIconTag.attr( 'src', 'img/lock.svg' );
            imgSyncIconTag.attr ( 'src', 'img/sync-n.svg' );
            //imgErrIconTag.css ( 'visibility', 'hidden' );
        }
        else if ( itemData.status === me.status_redeem_failed )
        {
            //smallStatusNameTag.text( 'invalid' ).css( 'color', '#e48825' ); //Invalid?
            //imgStatusIconTag.attr( 'src', 'img/lock.svg' );
            if ( !itemData.networkAttempt || (itemData.networkAttempt && itemData.networkAttempt < cwsRenderObj.storage_offline_ItemNetworkAttemptLimit ) )
            {
                imgSyncIconTag.attr ( 'src', 'img/sync-n.svg' ); // should show the 'active' icon: sync-banner.svg
            }
            else
            {
                imgSyncIconTag.attr ( 'src', 'img/sync-n.svg' );
            }
            //imgErrIconTag.css ( 'visibility', 'visible' );
        }
        else
        {
            //smallStatusNameTag.text( 'open' ).css( 'color', '#787878' ); //Unmatched?
            //imgStatusIconTag.attr( 'src', 'img/open.svg' );
            imgSyncIconTag.attr ( 'src', 'img/sync-banner.svg' );
            //imgErrIconTag.css ( 'visibility', 'hidden' );

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

                    var myTag = mySyncIcon.parent().parent().parent().siblings();
                    var redeemID = myTag.attr( 'itemid' );
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
                                me.appendStatusOptThemeIcon ( $( '#icon_' + fetchItemData.id ), me.getStatusOpt ( fetchItemData ) )
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
        tempJsonData.title = "Voucher: " + submitJson.payloadJson.voucherCode + " - " + dateTimeStr;
        tempJsonData.created = dateTimeStr;
        tempJsonData.owner = FormUtil.login_UserName; // Added by Greg: 2018/11/26 > identify record owner
        tempJsonData.id = Util.generateRandomId();
        tempJsonData.status = status;
        tempJsonData.network = ConnManager.getAppConnMode_Online(); // Added by Greg: 2018/11/26 > record network status at time of creation
        tempJsonData.data = submitJson;

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