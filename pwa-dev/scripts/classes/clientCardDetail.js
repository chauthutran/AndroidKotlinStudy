// -------------------------------------------
// -- ClientCardDetail Class/Methods

function ClientCardDetail( clientId, isRestore )
{
	var me = this;

    me.clientId = clientId;
    me.isRestore = isRestore;
    me.actionObj;
    me.cardSheetFullTag;

	// ===============================================
	// === Initialize Related ========================

    me.initialize = function() 
    { 
        me.actionObj = new Action( SessionManager.cwsRenderObj, {} );

        // sheetFull Initialize / populate template
        me.cardSheetFullTag = FormUtil.sheetFullSetup( ClientCardDetail.cardFullScreen, { title: 'Client Detail', term: '', cssClasses: [ 'clientDetail' ] } );

        // create tab click events
        FormUtil.setUpEntryTabClick( me.cardSheetFullTag.find( '.tab_fs' ) ); 
    
        // ADD TEST/DUMMY VALUE
        me.cardSheetFullTag.find( '.client' ).attr( 'itemid', me.clientId )

        // ReRender
        me.cardSheetFullTag.find( '.clientDetailRerender' ).off( 'click' ).click( function() {
            // me.render();
            me.cardSheetFullTag.find( 'div.clientRerender' ).click();
            me.cardSheetFullTag.find( '.tab_fs__head li.primary.active' ).click();
        });
    };

    // ----------------------------------

    me.render = function()
    {
        INFO.client = ClientDataManager.getClientById( me.clientId ); // to be used as 'eval' reference in other places.. // Or INFO.getINFOJson();

        // Header content set  <--- This looks for all with $( 'div.card[itemid="' + me.clientId + '"]' );
        //      - this catches not only generated full sheet html card part.
        var clientCard = new ClientCard( me.clientId, {'detailViewCase': true } );
        var clientCardTag = me.cardSheetFullTag.find( '.client[itemid]' );
        clientCard.setClientCardTag( clientCardTag );
        clientCard.render();

        // set tabs contents
        me.setFullPreviewTabContent( me.clientId, me.cardSheetFullTag );
                
        TranslationManager.translatePage();    
    };

    // ----------------------------------------------------

    me.setFullPreviewTabContent = function( clientId, sheetFullTag )
    {

        // #1. Client Details 
        var clientDetailsTabTag = sheetFullTag.find( '[tabButtonId=tab_clientDetails]' );
        var clientProfileBlockId = ConfigManager.getSettingsClientDef()[ App.clientProfileBlockId ]; // Get client Profile Block defition from config.
        sheetFullTag.find( '.tab_fs li[rel=tab_clientDetails]' ).click( function() 
        {
            clientDetailsTabTag.html( '' );

            var passedData = me.getPassedData_FromClientDetail( clientId );            
            FormUtil.renderBlockByBlockId( clientProfileBlockId, SessionManager.cwsRenderObj, clientDetailsTabTag, passedData );

            clientDetailsTabTag.find( 'div.block' ).css( 'width', '98% !important' );
        });
        

        // #2. Client Activities
        var activityTabBodyDivTag = sheetFullTag.find( '[tabButtonId=tab_clientActivities]' );
        sheetFullTag.find( '.tab_fs li[rel=tab_clientActivities]' ).click( function() 
        {
            activityTabBodyDivTag.html( '<div class="activityList tabContentList"></div>' );
            var activityListDivTag = activityTabBodyDivTag.find( '.activityList' );

            var clientJson = ClientDataManager.getClientById( clientId ); // for changed client data?

            if ( clientJson ) me.populateActivityCardList( clientJson.activities, activityListDivTag );


            var favIconsObj = new FavIcons( 'clientActivityFav', activityTabBodyDivTag, activityTabBodyDivTag
            , { 'mainFavPreClick': function( blockTag, blockContianerTag ) 
            {
                // Clear the list?
                blockTag.html( '' ); //activityListBlockTag.html( '' );

                // Get proper client into INFO.client - since other client could been loaded by clicks.
                INFO.client = ClientDataManager.getClientById( me.clientId );
            }});
            favIconsObj.render();
    
        });


        // #3. Relationship
        var relationshipTabTag = sheetFullTag.find( '[tabButtonId=tab_relationships]' );
        var relationshipListObj = new ClientRelationshipList( clientId, relationshipTabTag, 'clientRelationTab' );
        sheetFullTag.find( '.tab_fs li[rel=tab_relationships]' ).click( function() 
        {
            relationshipListObj.render();  // Rendering logic could be replaced with 'itemCardList' definition on 'clientDef'
        });

        
        if ( DevHelper.devMode && SessionManager.isTestLoginCountry() )
        {
            // #4. Payload TreeView
            sheetFullTag.find( 'li.primary[rel="tab_previewPayload"]' ).attr( 'style', '' );
            sheetFullTag.find( 'li.secondary[rel="tab_previewPayload"]' ).removeClass( 'tabHide' );

            sheetFullTag.find( '.tab_fs li[rel=tab_previewPayload]' ).click( function() 
            {
                var jv_payload = new JSONViewer();
                sheetFullTag.find( '[tabButtonId=tab_previewPayload]' ).find(".payloadData").append( jv_payload.getContainer() );
                jv_payload.showJSON( ClientDataManager.getClientById( clientId ), -1, 1 );
            });
            

            // #5. Dev (Optional)
            sheetFullTag.find( 'li.primary[rel="tab_optionalDev"]' ).attr( 'style', '' );
            sheetFullTag.find( 'li.secondary[rel="tab_optionalDev"]' ).removeClass( 'tabHide' );

            var devTabTag = sheetFullTag.find( '[tabButtonId=tab_optionalDev]' );    
            sheetFullTag.find( '.tab_fs li[rel=tab_optionalDev]' ).click( function() 
            {
                // A. Client Activity Request Add
                me.setUpClientActivityRequestAdd( clientId, devTabTag, sheetFullTag );

                // B. TextArea for get clientJson
                me.setUpClientJsonEdit( clientId, devTabTag, sheetFullTag );
            });    
        } 


        // -----------------------------------------
        // Default click 'Client'
        var defaultTab = sheetFullTag.find( '.tab_fs li[rel=tab_clientDetails]' ).first();
        // But wants to not display the selection dropdown when size is mobile..        
        defaultTab.attr( 'openingClick', 'Y' );
        defaultTab.click();
        setTimeout( function() { defaultTab.attr( 'openingClick', '' ); }, 400 );
    };


    me.getPassedData_FromClientDetail = function( clientId )
    {
        var passedData = { displayData: [], resultData: [] };

        try
        {
            var displayDataArr = [];
            displayDataArr.push( { id: "id", value: clientId } );
    
            var clientJson = ClientDataManager.getClientById( clientId );
    
            for ( var id in clientJson.clientDetails ) 
            {
                displayDataArr.push( { id: id, value: clientJson.clientDetails[id] } );
            }
    
            passedData.displayData = displayDataArr;    
        }
        catch( errMsg ) { console.log( 'ERROR in ClientCardDetails.getPassedData_FromClientDetail, ' + errMsg ); }

        return passedData;
    };
    // ------------------------------

    me.setUpClientActivityRequestAdd = function( clientId, devTabTag, sheetFullTag )
    {
        var newActivityTemplateJson = me.getTempActivityRequestJson( clientId );

        var taClientActivityNewTag = devTabTag.find( '.taClientActivityNew' ).val( JSON.stringify( newActivityTemplateJson, undefined, 4 ) );
        var spClientActivityNewResultTag = devTabTag.find( '.spClientActivityNewResult' ).text( '' );
    
        devTabTag.find( '.btnClientActivityCreate' ).off( 'click' ).click( function() 
        {
            try
            {
                var mainActionJson = ConfigManager.getActionQueueActivity();
                mainActionJson.clientId = clientId;
                mainActionJson.payloadJson = JSON.parse( taClientActivityNewTag.val() );  // 'payloadJson' is a special json
    
                var actionsList = [ mainActionJson,
                    { "actionType": "reloadClientTag" },
                    { "actionType": "topNotifyMsg", "message": "New activity queue added." },
                    { "actionType": "evalAction", "eval": " $( 'li.primary[rel=tab_optionalDev]').click();" } ];
    
                me.actionObj.handleClickActionsAlt( actionsList, taClientActivityNewTag.closest( 'div' ), devTabTag, function( resultStr ) {
                    //spClientActivityNewResultTag.text( 'Create Performed.  Result: ' + resultStr );
                });
            }
            catch( errMsg )
            {
                alert( 'FAILED to create client activity.' );
            }
        });
    };


    me.setUpClientJsonEdit = function( clientId, devTabTag, sheetFullTag )
    {
        var clientJson = ClientDataManager.getClientById( clientId );

        var taClientJsonTag = devTabTag.find( '.taClientJson' ).val( JSON.stringify( clientJson, undefined, 4 ) );
        var spClientJsonResultTag = devTabTag.find( '.spClientJsonResult' ).text( '' );
    
        devTabTag.find( '.btnSave' ).off( 'click' ).click( function() 
        {
            try
            {
                var clientJsonNew = JSON.parse( taClientJsonTag.val() );
    
                // save with client Id
                ClientDataManager.updateClient_wtActivityReload( clientId, clientJsonNew );
    
                // Refresh this tab content by clicking the tab.
                sheetFullTag.find( '.tab_fs li[rel=tab_optionalDev]' ).click();
    
                // Update the message?
                // devTabTag.find( '.spClientJsonResult' ).text( 'Updated Client Json' );
                MsgManager.msgAreaShow( 'Client Edit Done!!' );
            }
            catch( errMsg )
            {
                alert( 'FAILED to update client data.' );
            }
        });
    };

    // ------------------------------

    me.addTempActivity = function( clientId )
    {
        var newTempActivity = Util.cloneJson( ClientCardDetail.activityTemplateJson );

        // SessionManager.sessionData.login_UserName;  // INFO.login_UserName

        var newPayloadDate = new Date();
        newTempActivity.date.capturedLoc = Util.formatDate( newPayloadDate.toUTCString() );
        newTempActivity.date.capturedUTC = Util.formatDate( newPayloadDate.toString() );
        newTempActivity.date.createdOnDeviceUTC = newTempActivity.date.capturedLoc;
        
        newTempActivity.activeUser = SessionManager.sessionData.login_UserName;
        newTempActivity.id = SessionManager.sessionData.login_UserName + '_' + Util.formatDate( newPayloadDate.toUTCString(), 'yyyyMMdd_HHmmss' ) + newPayloadDate.getMilliseconds();;
        

        var clientJson = ClientDataManager.getClientById( clientId );
        clientJson.activities.push( newTempActivity );
        
        // save with client Id
        ClientDataManager.updateClient( clientId, clientJson );    
    };


    me.getTempActivityRequestJson = function( clientId )
    {
        var newTempActivity = Util.cloneJson( ClientCardDetail.activityTemplateJson );
        var capJson = newTempActivity.captureValues;
        var schJson = newTempActivity.searchValues;

        schJson._id = clientId;

        var newPayloadDate = new Date();
        var dateJson = capJson.date;
        dateJson.capturedLoc = Util.formatDate( newPayloadDate.toString() );
        dateJson.capturedUTC = Util.formatDate( newPayloadDate.toUTCString() );
        dateJson.createdOnDeviceUTC = dateJson.capturedUTC;
        
        capJson.activeUser = SessionManager.sessionData.login_UserName;
        capJson.id = SessionManager.sessionData.login_UserName + '_' + Util.formatDate( newPayloadDate.toUTCString(), 'yyyyMMdd_HHmmss' ) + newPayloadDate.getMilliseconds();;

        return newTempActivity;
    };


    // =============================================

    me.populateActivityCardList = function( activityList, listTableTbodyTag )
    {
        if ( activityList.length === 0 ) 
        {
            
        }
        else
        {
            for( var i = activityList.length - 1; i >= 0; i-- )
            {
                var activityJson = activityList[i];

                try
                {
                    var activityCardObj = me.createActivityCard( activityJson, listTableTbodyTag );

                    activityCardObj.render();    
                }
                catch( errMsg ) { console.log( 'ERROR in ClientCardDetail.populateActivityCardList, ' + errMsg ); }
            }    

            //listBottomDivTag.show().css( 'color', '#4753A3' ).text( ( currPosJson.endReached ) ? '[END]' : 'MORE' );

            TranslationManager.translatePage();
            //if ( scrollEndFunc ) scrollEndFunc();
        }
    };

    me.createActivityCard = function( activityJson, listTableTbodyTag )
    {
        var divActivityCardTag = $( ActivityCardTemplate.cardDivTag );

        divActivityCardTag.attr( 'itemId', activityJson.id );
        //divActivityCardTag.attr( 'group', groupAttrVal );

        listTableTbodyTag.append( divActivityCardTag );

        return new ActivityCard( activityJson.id, { 'displaySetting': 'clientActivity' } );
    };


    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

};


ClientCardDetail.activityTemplateJson = 
{
    "searchValues": { "_id": "" },
    "captureValues": {
        "date": { "capturedUTC": "", "capturedLoc": "", },
        "id": "",
        "activeUser": "",
        "location": {},
        "type": "",
        "transactions": [
            { "type": "s_info", "dataValues": { }, "clientDetails": { } }
        ]
    }
};


ClientCardDetail.cardFullScreen = `
<div class="sheet_full-fs detailFullScreen">
    <div class="wapper_card">

        <div class="sheet-title c_900">
            <img src='images/arrow_back.svg' class='btnBack'>
            <span class="sheetTopTitle">Details</span>
        </div>

        <div class="card _tab client">
            <div class="clientDetailRerender" style="float: left; width: 1px; height: 1px;"></div>
            <div class="card__container">
                <card__support_visuals class="clientIcon card__support_visuals" />
                <card__content class="clientContent card__content" />
                <card__cta class="activityStatus card__cta">
                    <div class="activityStatusText card__cta_status" />
                    <div class="clientPhone card__cta_one" style="cursor: pointer;"></div>
                    <div class="activityStatusIcon card__cta_two" style="cursor: pointer;"></div>
                </card__cta>
                <div class="clientRerender" style="float: left; width: 1px; height: 1px;"></div>
            </div>

            <div class="tab_fs">

                <ul class="tab_fs__head" style="background-color: #fff;">

                    <li class="primary active" rel="tab_clientDetails">
                        <div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
                        <span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>

                        <ul class="secondary" style="display: none; z-index: 1;">

                            <li class="secondary" style="display:none" rel="tab_clientActivities">
                                <div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
                                <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activity</span>
                            </li>  

                            <li class="secondary" style="display:none" rel="tab_relationships">
                                <div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
                                <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                            </li>

                            <li class="secondary tabHide" style="display:none" rel="tab_previewPayload">
                                <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
                                <span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
                            </li>
                            
                            <li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                                <span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
                            </li>

                        </ul>
                    </li>

                    <li class="primary" rel="tab_clientActivities">
                        <div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
                        <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>

                        <ul class="secondary" style="display: none; z-index: 1;">

                            <li class="secondary" style="display:none" rel="tab_clientDetails">
                                <div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
                                <span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>
                            </li>

                            <li class="secondary" style="display:none" rel="tab_relationships">
                                <div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
                                <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                            </li>

                            <li class="secondary tabHide" style="display:none" rel="tab_previewPayload">
                                <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
                                <span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
                            </li>
                            
                            <li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                                <span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
                            </li>
                            
                        </ul>
                    </li>
                    
                    <li class="primary" rel="tab_relationships">
                        <div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
                        <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                        <ul class="secondary" style="display: none; z-index: 1;">

                            <li class="secondary" style="display:none" rel="tab_clientDetails">
                                <div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
                                <span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>
                            </li>

                            <li class="secondary" style="display:none" rel="tab_clientActivities">
                                <div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
                                <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>
                            </li>

                            <li class="secondary tabHide" style="display:none" rel="tab_previewPayload">
                                <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
                                <span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
                            </li>

                            <li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                                <span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
                            </li>

                        </ul>
                    </li>
                    
                    <li class="primary" rel="tab_previewPayload" style="display: none;">
                        <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
                        <span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
                        <ul class="secondary" style="display: none; z-index: 1;">

                            <li class="secondary" style="display:none" rel="tab_clientDetails">
                                <div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
                                <span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>
                            </li>

                            <li class="secondary" style="display:none" rel="tab_clientActivities">
                                <div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
                                <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>
                            </li>

                            <li class="secondary" style="display:none" rel="tab_relationships">
                                <div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
                                <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                            </li>

                            <li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                                <span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
                            </li>

                        </ul>
                    </li>
                    
                    <li class="primary" rel="tab_optionalDev" style="display: none;">
                        <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                        <span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
                        <ul class="secondary" style="display: none; z-index: 1;">

                            <li class="secondary" style="display:none" rel="tab_clientDetails">
                                <div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
                                <span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>
                            </li>

                            <li class="secondary" style="display:none" rel="tab_clientActivities">
                                <div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
                                <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>
                            </li>

                            <li class="secondary" style="display:none" rel="tab_relationships">
                                <div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
                                <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                            </li>

                            <li class="secondary tabHide" style="display:none" rel="tab_previewPayload">
                                <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
                                <span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
                            </li>

                        </ul>
                    </li>

                </ul>
                <div class="tab_fs__head-icon_exp"></div>
            </div>

            <div class="tab_fs__container" style="padding: 0px !important;">

                <div class="tab_fs__container-content sheet_preview active" tabButtonId="tab_clientDetails"
                    blockid="tab_clientDetails" style="overflow-x: hidden !important;" />

                <div class="tab_fs__container-content sheet_preview" tabButtonId="tab_clientActivities" blockid="tab_clientActivities" style="display:none;" />

                <div class="tab_fs__container-content sheet_preview" tabButtonId="tab_relationships" blockid="tab_relationships" style="display:none;" />

                <div class="tab_fs__container-content sheet_preview" tabButtonId="tab_previewPayload" blockid="tab_previewPayload" style="display:none;">
                    <div class="payloadData"></div>
                </div>              

                <div class="tab_fs__container-content sheet_preview" tabButtonId="tab_optionalDev" blockid="tab_optionalDev" style="display:none;">
                    
                    <div style="margin-top: 5px;">
                        <div> <span style="font-size: small; font-weight: bold; color: #555;">New Activity Json Request: </span> <button class="btnClientActivityCreate">Create</button> <span class="spClientActivityNewResult"></span> </div>
                        <div>
                            <textarea class="taClientActivityNew" rows=15 style="width: 98%; font-size: small;"></textarea>
                        </div>
                    </div>

                    <div style="margin-top: 8px;">
                        <div> <span style="font-size: small; font-weight: bold; color: #555;">Client Edit [Local Only]: </span> <button class="btnSave">Save</button> <span class="spClientJsonResult"></span> </div>
                        <div>
                            <textarea class="taClientJson" rows=20 style="width: 98%; font-size: small;"></textarea>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    </div>
</div>`;

//function ClientCardDetail( _clientJsonFormTag, _clientJson, _cwsRenderObj, _blockObj ) { ..... }
//ClientCardDetail.NOT_ALLOW_EDIT_FIELDS = [ "country", "activeUsers", "countryType", "voucherCodes", "creditedUsers", "voucherCode", "clientId" ];