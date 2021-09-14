// -------------------------------------------
// -- ClientCardDetail Class/Methods

function ClientCardDetail( clientId, isRestore )
{
	var me = this;

    me.clientId = clientId;
    me.isRestore = isRestore

	// ===============================================
	// === Initialize Related ========================

    me.initialize = function() { };

    // ----------------------------------

    me.render = function()
    {
        INFO.client = ClientDataManager.getClientById( me.clientId ); // to be used as 'eval' reference in other places..
        // Or INFO.getINFOJson();


        // initialize / populate template
        var cardSheetFullTag = $( ClientCardDetail.cardFullScreen );
        $( 'body' ).append( cardSheetFullTag );

        // create tab click events
        FormUtil.setUpEntryTabClick( cardSheetFullTag.find( '.tab_fs' ) ); 
    
        // ADD TEST/DUMMY VALUE
        cardSheetFullTag.find( '.client' ).attr( 'itemid', me.clientId )

        // ReRender
        cardSheetFullTag.find( '.clientDetailRerender' ).off( 'click' ).click( function() {
            me.render();
        });


        // Header content set  <--- This looks for all with $( 'div.card[itemid="' + me.clientId + '"]' );
        //      - this catches not only generated full sheet html card part.
        var itemCard = new ClientCard( me.clientId , {'detailViewCase': true } ); // { 'parentTag_Override': cardSheetFullTag, 'disableClicks': true } 
        itemCard.render();


        // set tabs contents
        me.setFullPreviewTabContent( me.clientId, cardSheetFullTag );
    

        FormUtil.sheetFullSetup_Show( cardSheetFullTag, 'clientCardDetail', me.clientId, me.isRestore );
        cardSheetFullTag.find( 'img.btnBack' ).off( 'click' ).click( function()
            { 
               cardSheetFullTag.remove();
               $("#activityListViewNav").show();
            });
        
            
        TranslationManager.translatePage();    
    };

    // ----------------------------------------------------

    me.setFullPreviewTabContent = function( clientId, sheetFullTag )
    {
        var clientJson = ClientDataManager.getClientById( clientId );
    
        // #1 clientDetails properties = key        

        var passedData = {
            "displayData": [
                { id: "id", value: clientJson._id }
            ],
            "resultData": []
        };

        for ( var id in clientJson.clientDetails )
        {
            passedData.displayData.push( {"id": id, "value": clientJson.clientDetails[id] } );
        }

        var clientDetailsTabTag = sheetFullTag.find( '[tabButtonId=tab_clientDetails]' );
        var clientProfileBlockId = ConfigManager.getSettingsClientDef()[ App.clientProfileBlockId ]; // Get client Profile Block defition from config.

        sheetFullTag.find( '.tab_fs li[rel=tab_clientDetails]' ).click( function() 
        {
            clientDetailsTabTag.html( '' );
            FormUtil.renderBlockByBlockId( clientProfileBlockId, SessionManager.cwsRenderObj, clientDetailsTabTag, passedData );
            clientDetailsTabTag.find( 'div.block' ).css( 'width', '98% !important' );
        });
        

        // #2. payload Preview
        var activityTabBodyDivTag = sheetFullTag.find( '[tabButtonId=tab_clientActivities]' );
        sheetFullTag.find( '.tab_fs li[rel=tab_clientActivities]' ).click( function() 
        {
            activityTabBodyDivTag.html( '' ).append( '<div blockId="activityList" /><div blockId="addForm" />' );
            var activityListBlockTag = activityTabBodyDivTag.find( '[blockId="activityList"]' );

            me.renderActivityList( activityListBlockTag, clientJson );

            var favIconsObj = new FavIcons( 'clientActivityFav', activityListBlockTag, activityTabBodyDivTag, function( parentTag ) {
                // clear the list?
                parentTag.html( '' ); //activityListBlockTag.html( '' );
            });
            favIconsObj.render();
    
        });


        // #3. Relationship
        var relationshipTabTag = sheetFullTag.find( '[tabButtonId=tab_relationships]' );
        var relationshipListObj = new ClientRelationshipList( clientJson, relationshipTabTag );
        sheetFullTag.find( '.tab_fs li[rel=tab_relationships]' ).click( function() 
        {
            relationshipListObj.render();
        });


        // #4. Dev (Optional)
        if ( DevHelper.devMode )
        {
            sheetFullTag.find( 'li.primary[rel="tab_optionalDev"]' ).attr( 'style', '' );
            sheetFullTag.find( 'li.2ndary[rel="tab_optionalDev"]' ).removeClass( 'tabHide' );

            var devTabTag = sheetFullTag.find( '[tabButtonId=tab_optionalDev]' );    
            sheetFullTag.find( '.tab_fs li[rel=tab_optionalDev]' ).click( function() 
            {
                var clientJson = ClientDataManager.getClientById( clientId );
                
                // get clientJson
                var taClientJsonTag = devTabTag.find( '.taClientJson' ).val( JSON.stringify( clientJson, undefined, 4 ) );
                var spClientJsonResultTag = devTabTag.find( '.spClientJsonResult' ).text( '' );

                devTabTag.find( '.btnAddActivityTemplate' ).off( 'click' ).click( function() 
                {
                    // Add
                    me.addTempActivity( clientId );

                    // Refresh this tab content by clicking the tab.
                    sheetFullTag.find( '.tab_fs li[rel=tab_optionalDev]' ).click();

                    // Update the message?
                    devTabTag.find( '.spClientJsonResult' ).text( 'Added Template Activity Json' );
                });


                devTabTag.find( '.btnSave' ).off( 'click' ).click( function() {

                    try
                    {
                        var clientJsonNew = JSON.parse( taClientJsonTag.val() );

                        // save with client Id
                        ClientDataManager.updateClient( clientId, clientJsonNew );

                        // Refresh this tab content by clicking the tab.
                        sheetFullTag.find( '.tab_fs li[rel=tab_optionalDev]' ).click();

                        // Update the message?
                        devTabTag.find( '.spClientJsonResult' ).text( 'Updated Client Json' );
                    }
                    catch( errMsg )
                    {
                        alert( 'FAILED to update client data.' );
                    }
                });
            });    
        } 


        // -----------------------------------------
        // Default click 'Client'
        sheetFullTag.find( '.tab_fs li[rel=tab_clientDetails]' ).click();

    };    


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


    me.renderActivityList = function( activityListBlockTag, clientJson )
    {
        me.populateActivityCardList( clientJson.activities, activityListBlockTag );
        activityListBlockTag.show();
    }

    
    me.setFullPreviewTabContent_Events = function( sheetFullTag, clientJson )
    {
        var activityTabTag = sheetFullTag.find( '[tabButtonId=tab_clientActivities]' );

        activityTabTag.find(".fab-wrapper").click( function(){
        
            // clear existing data on this tab content
            sheetFullTag.find("[blockId='activityList']").hide();

            // #1 clientDetails properties = key
            var passedData = {
                "displayData": [
                    { id: "id", value: clientJson._id }
                ],
                "resultData": []
            };

            for( var id in clientJson.clientDetails )
            {
                passedData.displayData.push( {"id": id, "value": clientJson.clientDetails[id] } );
            }

            // Get client Profile Block defition from config.
            var clientProfileBlockId = ConfigManager.getSettingsClientDef().issueVoucherBlock;
            FormUtil.renderBlockByBlockId( clientProfileBlockId, SessionManager.cwsRenderObj, sheetFullTag.find("[blockId='addForm']"), passedData );

        });
    }   

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

        return new ActivityCard( activityJson.id );
    };


    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

};


ClientCardDetail.activityTemplateJson = 
{
    "date": {
        "capturedUTC": "",
        "capturedLoc": "",
    },
    "activeUser": "",
    "location": {},
    "id": "",
    "type": "",
    "transactions": [
        {
            "dataValues": {
            },
            "type": "s_info"
        }
    ]
};



ClientCardDetail.cardFullScreen = `
<div class="sheet_full-fs detailFullScreen">
    <div class="wapper_card">

        <div class="sheet-title c_900">
            <img src='images/arrow_back.svg' class='btnBack'>
            <span>Details</span>
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
                        <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                        <span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>

                        <ul class="2ndary" style="display: none; z-index: 1;">

                            <li class="2ndary" style="display:none" rel="tab_clientActivities">
                                <div class="tab_fs__head-icon i-payloads_24" rel="tab_clientActivities"></div>
                                <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activity</span>
                            </li>  

                            <li class="2ndary" style="display:none" rel="tab_relationships">
                                <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                                <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                            </li>

                            <li class="2ndary" style="display:none" rel="tab_optionalDev">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                                <span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Def</span>
                            </li>

                        </ul>
                    </li>

                    <li class="primary" rel="tab_clientActivities">
                        <div class="tab_fs__head-icon i-payloads_24" rel="tab_clientActivities"></div>
                        <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>

                        <ul class="2ndary" style="display: none; z-index: 1;">

                            <li class="2ndary" style="display:none" rel="tab_clientDetails">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                                <span term="activityDetail_tab_details" rel="tab_clientDetails">Details</span>
                            </li>

                            <li class="2ndary" style="display:none" rel="tab_relationships">
                                <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                                <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                            </li>

                            <li class="2ndary" style="display:none" rel="tab_optionalDev">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                                <span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Def</span>
                            </li>
                            
                        </ul>
                    </li>
                    
                    <li class="primary" rel="tab_relationships">
                        <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                        <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                        <ul class="2ndary" style="display: none; z-index: 1;">

                            <li class="2ndary" style="display:none" rel="tab_clientDetails">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                                <span term="activityDetail_tab_details" rel="tab_clientDetails">Details</span>
                            </li>

                            <li class="2ndary" style="display:none" rel="tab_clientActivities">
                                <div class="tab_fs__head-icon i-payloads_24" rel="tab_clientActivities"></div>
                                <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>
                            </li>

                            <li class="2ndary" style="display:none" rel="tab_optionalDev">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                                <span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Def</span>
                            </li>

                        </ul>
                    </li>

                    
                    <li class="primary" rel="tab_optionalDev" style="display: none;">
                        <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                        <span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
                        <ul class="2ndary" style="display: none; z-index: 1;">

                            <li class="2ndary" style="display:none" rel="tab_clientDetails">
                                <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                                <span term="activityDetail_tab_details" rel="tab_clientDetails">Details</span>
                            </li>

                            <li class="2ndary" style="display:none" rel="tab_clientActivities">
                                <div class="tab_fs__head-icon i-payloads_24" rel="tab_clientActivities"></div>
                                <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>
                            </li>

                            <li class="2ndary" style="display:none" rel="tab_relationships">
                                <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                                <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                            </li>

                        </ul>
                    </li>

                </ul>
                <div class="tab_fs__head-icon_exp"></div>
            </div>

            <div class="tab_fs__container" style="padding: 0px !important;">

                <div class="tab_fs__container-content active sheet_preview" tabButtonId="tab_clientDetails"
                    blockid="tab_clientDetails" style="overflow-x: hidden !important;" />

                <div class="tab_fs__container-content" tabButtonId="tab_clientActivities" blockid="tab_clientActivities" style="display:none;" />

                <div class="tab_fs__container-content" tabButtonId="tab_relationships" blockid="tab_relationships" style="display:none;" />

                <div class="tab_fs__container-content" tabButtonId="tab_optionalDev" blockid="tab_optionalDev" style="display:none;">
                    <div>
                        <span>Client Json:</span>
                        <div> 
                            <button class="btnAddActivityTemplate">Add Activity Template</button> 
                            <button class="btnSave">Save</button> 
                        </div>
                        <div> <span class="spClientJsonResult"></span> </div>
                        <div>
                            <textarea class="taClientJson" cols=100 rows=30 style="width: 98%; font-size: smaller;"></textarea>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
</div>`;

//function ClientCardDetail( _clientJsonFormTag, _clientJson, _cwsRenderObj, _blockObj ) { ..... }
//ClientCardDetail.NOT_ALLOW_EDIT_FIELDS = [ "country", "activeUsers", "countryType", "voucherCodes", "creditedUsers", "voucherCode", "clientId" ];