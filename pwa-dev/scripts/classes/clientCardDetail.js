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

        
        TranslationManager.translatePage();    
    };

    // ----------------------------------------------------

    me.setFullPreviewTabContent = function( clientId, sheetFullTag )
    {
        var clientJson = ClientDataManager.getClientById( clientId );;
    
        var arrDetails = [];
    
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

        // TODO: We can also use simpler version of data 'results.clientId', results

        var clientDetailsTabTag = sheetFullTag.find( '[tabButtonId=tab_clientDetails]' );

        // Get client Profile Block defition from config.
        var clientProfileBlockId = ConfigManager.getConfigJson().settings.clientProfileBlock;
        FormUtil.renderBlockByBlockId( clientProfileBlockId, SessionManager.cwsRenderObj, clientDetailsTabTag, passedData );

        
        // #2. payload Preview

        // LIST ACTIVITIES... <-- LIST
        var listTableTbodyTag = sheetFullTag.find( '[tabButtonId=tab_clientActivities]' ).find( '.list' );        
        me.populateActivityCardList( clientJson.activities, listTableTbodyTag );

        // #3. relationship?
        var relationshipTabTag = sheetFullTag.find( '[tabButtonId=tab_relationships]' );

        var relationshipListObj = new ClientRelationshipList( clientJson, relationshipTabTag );

        // Remove previously loaded div blocks - clear out.
        sheetFullTag.find( '.tab_fs li[rel=tab_relationships]' ).click( function() {
            relationshipListObj.render();
        });

    };    

    // =============================================

    me.populateActivityCardList = function( activityList, listTableTbodyTag )
    {
        if ( activityList.length === 0 ) 
        {
            
        }
        else
        {
            //var listBottomDivTag = $( '.listBottom' );

            for( var i = 0; i < activityList.length; i++ )
            {
                var activityJson = activityList[i];

                var activityCardObj = me.createActivityCard( activityJson, listTableTbodyTag );

                activityCardObj.render();
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

}


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

                        </ul>
                    </li>

                </ul>
                <div class="tab_fs__head-icon_exp"></div>
            </div>

            <div class="tab_fs__container">

                <div class="tab_fs__container-content active sheet_preview" tabButtonId="tab_clientDetails"
                    blockid="tab_clientDetails" />

                <div class="tab_fs__container-content" tabButtonId="tab_clientActivities" blockid="tab_clientActivities" style="display:none;">
                    <div class="list"></div>
                </div>

                <div class="tab_fs__container-content" tabButtonId="tab_relationships" blockid="tab_relationships" style="display:none;" />

            </div>

        </div>
    </div>
</div>`;

//function ClientCardDetail( _clientJsonFormTag, _clientJson, _cwsRenderObj, _blockObj ) { ..... }
//ClientCardDetail.NOT_ALLOW_EDIT_FIELDS = [ "country", "activeUsers", "countryType", "voucherCodes", "creditedUsers", "voucherCode", "clientId" ];