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
    me.lastRedeemDate;
    me.redeemListLimit;
    me.options;
    me.newBlockTag;

    me.storageName_RedeemList = "redeemList";
    me.status_redeem_submit = "submit";
    me.status_redeem_queued = "queued";
    me.status_redeem_failed = "failed";
	
	
	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================



	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function() {
        me.redeemListLimit = false;
    }

	// -----------------------------------

    me.renderList = function( list, newBlockTag, passedData, options )
	{
		if ( list !== undefined )
		{
			if ( typeof list === 'string' ) 
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

                    if ( FormUtil.dcdConfig && FormUtil.dcdConfig.favActionList  )
                    {
                        me.setFloatingListMenuIconEvents( me.newBlockTag.find( '.floatListMenuIcon' ), me.newBlockTag.find( '.floatListMenuSubIcons' ) );
                    }
                    else
                    {
                        me.newBlockTag.find( '.floatListMenuIcon' ).hide();
                    }

				}
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

        // Remove any previous render.
        blockTag.find( 'div.listDiv' ).remove();

        // Copy from list html template
        $( '#listTemplateDiv > div.listDiv' ).clone().appendTo( blockTag );

        var listContentUlTag = blockTag.find( '.tab__content_act' );
        me.redeemListTargetTag = listContentUlTag;

        /* START > Added by Greg: 2018/11/26 */
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

            //MsgManager.msgAreaShow( 'loading ' + ( ( me.redeemListScrollSize < me.redeemList.length) ? me.redeemListScrollSize : arrNewFirst.length ) );

            if ( me.redeemList === undefined || me.redeemList.length == 0 )
            {
                var liTag = $( '<li class="emptyListLi"></li>' );
                var spanTag = $( '<a class="expandable" style="min-height: 60px; padding: 10px; color: #888; font-weight: 800;">List is empty.</a>' );
                liTag.append( spanTag );
                listContentUlTag.append( liTag );
            }
            else
            {
 
                for( var i = 0; ( ( i < me.redeemList.length) && ( i < parseInt(me.redeemListScrollSize) ) ) ; i++ )
                {
                    me.lastRedeemDate =  me.redeemList[i].created;
                    me.renderRedeemListItemTag( me.redeemList[i], me.redeemListTargetTag );
                }

                if ( ( me.redeemList.length >= parseInt(me.redeemListScrollSize) ) )
                {
                    //attach window scroll event listener to call me.appendRedeemListOnScrollBottom()
                    setTimeout( function() {
                        document.addEventListener('scroll', function (event) {
                            me.evalScrollOnBottom()
                        }, true /*Capture event*/);
                        //console.log ('initialised eval scroll');
                    }, 750 );
                }

                if ( i < parseInt(me.redeemListScrollSize) )
                {
                    me.redeemListLimit = true;
                    document.removeEventListener('scroll', me.evalScrollOnBottom());
                    //console.log('removed scroll event');
                }

            }

            /*setTimeout( function() {
                MsgManager.msgAreaClear();
            }, 500 );*/

        }
        else
        {
            /* START > Edited by Greg: 2018/11/26 */
            var liTag = $( '<li class="emptyListLi"></li>' );
            var spanTag = $( '<a class="expandable" style="min-height: 60px; padding: 10px; color: #888; font-weight: 800;">List is empty.</a>' );
            liTag.append( spanTag );
            listContentUlTag.append( liTag );
            /* END > Edited by Greg: 2018/11/26 */
        }
        /* END > Added by Greg: 2018/11/26 */

    }

    me.evalScrollOnBottom = function()
    {
        if ( !me.redeemListLimit )
        {
            setTimeout( function() {
                if ( ( $( window ).scrollTop() + $( window ).height() + 50) > $( document ).height() )
                {
                    //MsgManager.msgAreaShow( 'fetching rows ' );
                    me.appendRedeemListOnScrollBottom();
                }
            }, 500 );
        }
    }

    me.appendRedeemListOnScrollBottom = function()
    {

        if ( me.lastRedeemDate ) me.redeemList = me.redeemList.filter(a=>a['created']<me.lastRedeemDate);

        for( var i = 0; ( ( i < me.redeemList.length) && ( i < parseInt(me.redeemListScrollSize)) ) ; i++ )
        {
            me.lastRedeemDate =  me.redeemList[i].created;
            me.renderRedeemListItemTag( me.redeemList[i], me.redeemListTargetTag );
        }

        //console.log(' scroll listener added ' + i);
        FormUtil.setUpTabAnchorUI( me.newBlockTag.find( 'ul.tab__content_act') ); // add click event (expander to show voucher details) to newly created items

        if ( i < parseInt(me.redeemListScrollSize) )
        {
            me.redeemListLimit = true;
            document.removeEventListener('scroll', me.evalScrollOnBottom());
            //console.log('removed scroll event');
        }

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
        var dateTimeTag = $( '<div class="icon-row"><img src="img/act.svg">' + dateTimeStr + '</div>' );
        var expandArrowTag = $( '<div class="icon-arrow"><img class="expandable-arrow" src="img/arrow_down.svg"></div>' );
        //var statusSecDivTag = $( '<div class="icons-status"><small class="statusName" style="color: #7dd11f;">{status}</small><small class="statusIcon"><img src="img/open.svg"></small><small  class="syncIcon"><img src="img/sync.svg"></small><small  class="errorIcon"><img src="img/alert.svg"></small></div>' );
        var statusSecDivTag = $( '<div class="icons-status"><small  class="syncIcon"><img src="img/sync.svg"></small><small  class="errorIcon"><img src="img/alert.svg"></small></div>' );
        var voucherTag = $( '<div class="act-r"><small><b>'+itemData.data.payloadJson.voucherCode+'</b> - eVoucher</small></div>' ); //FormUtil.dcdConfig.countryCode : country code not necessary to 99.9% of health workers

        anchorTag.append( dateTimeTag, expandArrowTag, statusSecDivTag, voucherTag );

        // Content that gets collapsed/expanded 
        var contentDivTag = $( '<div class="act-l" ' + itemAttrStr + ' style="position: relative; background-color: beige;"></div>' );
        contentDivTag.append( '<span>' + itemData.title + '</span>' );
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
        var imgErrIconTag = statusSecDivTag.find( 'small.errorIcon img' );

        if ( itemData.status === me.status_redeem_submit )
        {
            //smallStatusNameTag.text( 'submitted' ).css( 'color', '#e48825' ); // Redeemed?
            //imgStatusIconTag.attr( 'src', 'img/lock.svg' );
            imgSyncIconTag.attr ( 'src', 'img/sync.svg' );
            imgErrIconTag.css ( 'visibility', 'hidden' );
        }
        else if ( itemData.status === me.status_redeem_failed )
        {
            //smallStatusNameTag.text( 'invalid' ).css( 'color', '#e48825' ); //Invalid?
            //imgStatusIconTag.attr( 'src', 'img/lock.svg' );
            imgSyncIconTag.attr ( 'src', 'img/sync-n.svg' );
            imgErrIconTag.css ( 'visibility', 'visible' );
        }
        else
        {
            //smallStatusNameTag.text( 'open' ).css( 'color', '#787878' ); //Unmatched?
            //imgStatusIconTag.attr( 'src', 'img/open.svg' );
            imgSyncIconTag.attr ( 'src', 'img/sync-n.svg' );
            imgErrIconTag.css ( 'visibility', 'hidden' );

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
        // remove previous ones
        //itemActionButtonsDivTag.find( 'button.actionBtn' ).remove();

        if ( itemData.status != me.status_redeem_submit ) // changed by Greg (2018/11/27) from '== !' to '!=' > was failing to test correctly
        {
            var imgSyncIconTag = statusSecDivTag.find( 'small.syncIcon img' );

            imgSyncIconTag.click( function(e) {

                var mySyncIcon = $( this );
                var dtmRedeemAttempt = (new Date() ).toISOString();

                mySyncIcon.rotate({ count:999, forceJS: true, startDeg: true });

                itemData.lastAttempt = dtmRedeemAttempt;

                //$(this).parent().parent().parent().siblings().html( 'Connecting...' );
                var myTag = mySyncIcon.parent().parent().parent().siblings();
                var redeemID = myTag.attr( 'itemid' );
                var loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;">Connecting... </div>' );

                myTag.html( '' );
                myTag.append( loadingTag );

                e.stopPropagation();                

                // if offline, alert it!!
                if ( ConnManager.isOffline() )
                {
                    alert( 'Currently in offline.  Need to be in online for this.' );
                    myTag.html( itemData.title );
                    $(this).stop();
                }
                else
                {

                    FormUtil.submitRedeem( itemData.data.url, itemData.data.payloadJson, itemData.data.actionJson, loadingTag, function( success, returnJson )
                    {
                        //console.log( 'Redeem submittion isSucccess: ' + success );

                        mySyncIcon.stop();

                        var dtmRedeemDate = (new Date() ).toISOString();

                        if ( success )
                        {
                            itemData.redeemDate = dtmRedeemDate;
                            itemData.status = me.status_redeem_submit;
                            itemData.returnJson = returnJson;
                            myTag.html( 'Success' );
                        }
                        else 
                        {
                            itemData.status = me.status_redeem_failed;
                            myTag.html( 'Error redeeming' );
                        }

                        setTimeout( function() {
                            myTag.html( itemData.title );
                        }, 2000 );

                        DataManager.updateItemFromData( me.storageName_RedeemList, itemData.id, itemData );

                        me.populateData_RedeemItemTag( itemData, itemLiTag );
                    } );

                }

            });
        }

    }

    // -----------------------------
    // Old Toggling Event
    me.toggleDetail = function( itemData, listItemTag )
    {
        var expandStr = listItemTag.attr( 'expand' );

        if ( expandStr === 'true' )
        {
            // collapse - if found
            listItemTag.find( 'div.listItemDetail' ).hide( 'fast' );

            listItemTag.attr( 'expand', 'false' );
        }
        else
        {
            // expand - if not exists, create one..
            listItemTag.find( 'div.listItemDetail' ).remove();

            divListItemDetailTag = $( '<div class="listItemDetail"></div>' ); 
            listItemTag.append( divListItemDetailTag ).attr( 'expand', 'true' );

            var spanDetailTag = $( '<span></span>' ); 
            spanDetailTag.text( JSON.stringify( itemData.data.payloadJson ) );

            divListItemDetailTag.append( spanDetailTag );


            // Add buttons - 'close' and 'submit'?
            var divButtonsTag = $( '<div class="listItemDetailActionButtons" style="margin-top: 5px;"></div>' );
            var btnCloseTag = $( '<button class="actionBtn btnCloseListItemDetail">Close</button>' );
            var btnRemoveTag = $( '<button class="actionBtn btnRemoveListItemDetail">Remove</button>' );
            var btnRedeemSubmitTag = $( '<button class="actionBtn btnSubmitRedeem">Redeem Submit</button>' );

            btnCloseTag.click( function(e) {
                e.stopPropagation();
                me.toggleDetail( itemData, listItemTag );
            });

            btnRemoveTag.click( function(e) {
                e.stopPropagation();                
                DataManager.removeItemFromData( me.storageName_RedeemList, itemData.id );                
                me.redeemList_Reload( listItemTag );
            });
            
            btnRedeemSubmitTag.click( function(e) {
                e.stopPropagation();                

                // if offline, alert it!!
                if ( ConnManager.isOffline() )
                {
                    alert( 'Currently in offline.  Need to be in online for this.' );
                }
                else
                {
                    var loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading.gif"></div>' );
                    divButtonsTag.append( loadingTag );
                    FormUtil.submitRedeem( itemData.data.url, itemData.data.payloadJson, itemData.data.actionJson, loadingTag, function( success, returnJson )
                    {
                        //console.log( 'Redeem submittion isSucccess: ' + success );
    
                        if ( success )
                        {
                            itemData.status = me.status_redeem_submit;
                            itemData.returnJson = returnJson;
                            
                            me.toggleDetail( itemData, listItemTag );
                        }
                        else 
                        {
                            itemData.status = me.status_redeem_failed;
                        }    
                        
                        DataManager.updateItemFromData( me.storageName_RedeemList, itemData.id, itemData );
                            
                        me.renderRedeemListItemTag( itemData, listItemTag );
                    } );
                }
            });


            divButtonsTag.append( btnCloseTag );
            divButtonsTag.append( btnRemoveTag );
            if ( itemData.status != me.status_redeem_submit ) divButtonsTag.append( btnRedeemSubmitTag );
            
            divListItemDetailTag.append( divButtonsTag );

        }
    }


    me.submitForListedItem = function( itemData, queueTag )
    {
        //console.log( itemData );
        /*
        // TODO: 'isOffline' works?
        if ( ConnManager.isOffline() )
        {
            queueTag.css( 'background-color', 'orange' );
    
            setTimeout( function() {
                alert( 'Not Online!!' );
    
                queueTag.css( 'background-color', '#d6d6e8' );
            }, 200 );
        }
        else
        {
            var url = me.getServerUrl() + "/eRefWSTest/api/submitForQueue";
            
            // TODO: this is part that should be moved to web service..
            queueData.processed = "Processed at " + (new Date() ).toISOString();
            //queueData.id = Util.generateRandomId();
            queueData.status = "processed";					
            var dataId = queueData.id;
            queueTag.css( 'background-color', 'lightGreen' );
    
    
            fetch( url, {  
                method: 'POST',  
                //headers: { 'auth': '1234' },  
                body: JSON.stringify( queueData )
            })
            .then( response => response.json() )  
            .then( responseJson => {
    
                console.log( 'Removal Request success: ', responseJson);  
    
                // This worked..
                DataManager.removeItemFromData( me.storageName_Queue, queueData.id );
                            
                // get the tag...
                //var divTag = $( '#' + dataId ); // '<div class="queueDiv"></div>' );
                queueTag.css( 'background-color', 'yellow' ).hide( 500 );
    
                //me.renderQueueList( responseJson.list, blockTag );
    
                // Queue refresh, etc..
                alert( 'submitted data: ' + JSON.stringify( queueData ) );
    
            })  
            .catch(function (error) {  
            console.log('Request failure: ', error);  
            });			
        }	
        */
    }
	// =============================================


	// =============================================
	// === OTHER METHODS ========================
    
    me.renderRedeemListItemTag_Old = function( itemData, divItemTag )
    {    
        // Set status color
        me.updateDivStatusColor( itemData.status, divItemTag );
       
        // Set Text..
        var spanTitleTag = $( '<span class="titleSpan"></span>' );
        spanTitleTag.text( itemData.title );
    
        divItemTag.append( spanTitleTag );
    
        divItemTag.off( 'click' ).click( function() {


            me.toggleDetail( itemData, $( this ) );
            // me.submitForListedItem( itemData, $( this ) );
        } );
    }

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
        // me.toggleDetail( itemData, listItemTag );
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