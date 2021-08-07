// -------------------------------------------
// -- ActivityCardDetail Class/Methods

function ActivityCardDetail( activityId, isRestore )
{
	var me = this;

    me.activityId = activityId;
    me.isRestore = isRestore

	// ===============================================
	// === Initialize Related ========================

    me.initialize = function() { };

    // ----------------------------------
    
    me.render = function()
    {
        console.log( 'activity showFullPreview..' );

        if ( activityId ) 
        {
            // initialize
            var sheetFull = $( '#activityDetail_FullScreen' );

            // populate template
            sheetFull.html( ActivityCardDetail.cardFullScreen );

            // If devMode, show Dev tab (primary) + li ones (2ndary <-- smaller screen hidden li)
            if ( DevHelper.devMode )
            {
                me.setUpActivityDetailTabDev( sheetFull, activityId );
            } 

            // create tab click events
            FormUtil.setUpEntryTabClick( sheetFull.find( '.tab_fs' ) ); 
        
            // ADD TEST/DUMMY VALUE
            sheetFull.find( '.activity' ).attr( 'itemid', activityId )
            

            // ReRender
            sheetFull.find( '.activityDetailRerender' ).off( 'click' ).click( function() {
                me.showFullPreview( activityId );
            });
                        

            // Header content set
            var actCard = new ActivityCard( activityId, {'detailViewCase': true }
                //, { 'parentTag_Override': sheetFull, 'disableClicks': true } 
            );
            actCard.render();

            // set tabs contents
            me.setFullPreviewTabContent( activityId, sheetFull );
        

            FormUtil.sheetFullSetup_Show( sheetFull, 'activityCardDetail', activityId, me.isRestore );

            
            TranslationManager.translatePage();            
        }
    };
    

    // ----------------------------------------------------


    me.setUpActivityDetailTabDev = function( sheetFullTag, activityId )
    {
        sheetFullTag.find( 'li.primary[rel="tab_optionalDev"]' ).attr( 'style', '' );
        sheetFullTag.find( 'li.2ndary[rel="tab_optionalDev"]' ).removeClass( 'tabHide' );

        var statusSelTag = sheetFullTag.find( '.devActivityStatusSel' );
        var statusSelResultTag = sheetFullTag.find( '.devActivityStatusResult' );

        statusSelTag.change( function() 
        {
            var statusVal = $( this ).val();

            ActivityDataManager.activityUpdate_Status( activityId, statusVal, function() 
            {
                var msg = "With 'DEV' mode, activity status has been manually changed to '" + statusVal + "'";

                statusSelResultTag.text( msg );
                ActivityDataManager.activityUpdate_History( activityId, statusVal, msg, 0 );                         
            });
        });
    };


    me.setFullPreviewTabContent = function( activityId, sheetFullTag )
    {
        var clientObj = ClientDataManager.getClientByActivityId( activityId );
        var activityJson = ActivityDataManager.getActivityById( activityId );
    
        var arrDetails = [];
    
        // 1 clientDetails properties = key
        for ( var key in clientObj.clientDetails ) 
        {
            arrDetails.push( { 'name': key, 'value': me.getFieldOption_LookupValue( key, clientObj.clientDetails[ key ] ) } );
        }

        var clientDetailsTabTag = sheetFullTag.find( '[tabButtonId=tab_previewDetails]' );
        var titleTag = $( '<label term="activityDetail_details_title">clientDetails:</label>' );

        clientDetailsTabTag.html( FormUtil.displayData_Array( titleTag, arrDetails, 'clientDetail' ) ); //activityListPreviewTable
    
        // 2. payload Preview
        var jv_payload = new JSONViewer();
        sheetFullTag.find( '[tabButtonId=tab_previewPayload]' ).find(".payloadData").append( jv_payload.getContainer() );
        jv_payload.showJSON( activityJson );
    

        // 3. sync History
        var syncHistoryTag = $( '[tabButtonId=tab_previewSync]' ).html( JsonBuiltTable.buildTable( activityJson.processing.history ) );
        syncHistoryTag.find( '.bt_td_head' ).filter( function( i, tag ) { return ( $( tag ).html() === 'responseCode' ); } ).html( 'response code' );
        
        // Set event for "Remove" button for "Pending" client
        var activity = ActivityDataManager.getActivityById( activityId );
        var removeActivityBtn = sheetFullTag.find("#removeActivity");
        if (activity.processing.status == Constants.status_queued || activity.processing.status == Constants.status_failed )
        {
            removeActivityBtn.click( function()
            {    
                var result = confirm("Are you sure you want to delete this activity?");
                if( result )
                {                    
                    me.removeActivityNCard( activityId, sheetFullTag.find( 'img.btnBack' ) );
                }               
            });
        }
        else
        {
            removeActivityBtn.remove();
        }
    };    
    
    me.getFieldOption_LookupValue = function( key, val )
    {
        var fieldOptions = me.getFieldOptions( key );
        var retValue = val;

        // If the field is in 'definitionFields' & the field def has 'options' name, get the option val.
        try
        {
            if ( fieldOptions )
            {
                var matchingOption = Util.getFromList( fieldOptions, val, "value" );
    
                if ( matchingOption )
                {
                    retValue = ( matchingOption.term ) ? TranslationManager.translateText( matchingOption.defaultName, matchingOption.term ) : matchingOption.defaultName;
                }
            }    
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR in AcitivityCard.getFieldOptionLookupValue, errMsg: ' + errMsg );
        }

        //console.log( key + ': ' + retValue + ' (' + val + ')' );
        return retValue;
    };

    me.getFieldOptions = function( fieldId )
    {
        var defFields = ConfigManager.getConfigJson().definitionFields;
        var defOptions = ConfigManager.getConfigJson().definitionOptions;

        var matchingOptions;
        var optionsName;

        // 1. Check if the field is defined in definitionFields & has 'options' field for optionsName used.
        if ( defFields )
        {
			var matchField = Util.getFromList( defFields, fieldId, "id" );

            if ( matchField && matchField.options )
            {
               optionsName =  matchField.options;
            }
        }

        // 2. Get options by name.
        if ( optionsName && defOptions )
        {
            matchingOptions = defOptions[ optionsName ];
        }

        return matchingOptions;
    };

    me.removeActivityNCard = function( activityId, btnBackTag )
    {
        ActivityDataManager.removeTempClient_Activity( activityId );

        //var client = ClientDataManager.getClientByActivityId( activityId );
        //ClientDataManager.removeClient( client );

        ClientDataManager.saveCurrent_ClientsStore( function()
        {
            $( '#pageDiv' ).find("[itemid='" + activityId + "']").remove();
            btnBackTag.click();
        });
    };


    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

}

ActivityCardDetail.cardFullScreen = `
<div class="wapper_card">
  <div class="sheet-title c_900">
    <img src='images/arrow_back.svg' class='btnBack'>
    <span>Details</span>
  </div>
  <div class="card _tab activity">
    <div class="activityDetailRerender" style="float: left; width: 1px; height: 1px;"></div>
    <div class="card__container">
      <card__support_visuals class="activityIcon card__support_visuals" />
      <card__content class="activityContent card__content" />
      <card__cta class="activityStatus card__cta">
        <div class="activityStatusText card__cta_status" />
        <div class="activityPhone card__cta_one" style="cursor: pointer;"></div>
        <div class="activityStatusIcon card__cta_two" style="cursor: pointer;"></div>
      </card__cta>
    </div>

    <div class="tab_fs">

      <div class="button warning button-full_width" id="removeActivity"
        style="height: 12px; min-height: 12px !important; background-color: whitesmoke; border: solid 1px silver;">
        <div class="button__container">
          <div class="button-label" style="line-height: 12px; color: tomato; font-size: 8px;">Remove Pending Activity</div>
        </div>
      </div>

      <ul class="tab_fs__head" style="background-color: #fff;">

        <li class="primary active" rel="tab_previewDetails">
          <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
          <span term="activityDetail_tab_details" rel="tab_previewDetails">Details</span>

          <ul class="2ndary" style="display: none; z-index: 1;">

            <li class="2ndary" style="display:none" rel="tab_previewPayload">
              <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
              <span term="activityDetail_tab_payload" rel="tab_previewPayload">Payload</span>
            </li>
  
            <li class="2ndary" style="display:none" rel="tab_previewSync">
              <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
              <span term="activityDetail_tab_sync" rel="tab_previewSync">Sync</span>
            </li>

            <li class="2ndary tabHide" style="display:none" rel="tab_optionalDev">
              <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
              <span term="activityDetail_tab_dev" rel="tab_optionalDev">Dev</span>
            </li>    

          </ul>
        </li>

        <li class="primary" rel="tab_previewPayload">
          <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
          <span term="activityDetail_tab_payload" rel="tab_previewPayload">Payload</span>

          <ul class="2ndary" style="display: none; z-index: 1;">

            <li class="2ndary" style="display:none" rel="tab_previewDetails">
              <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
              <span term="activityDetail_tab_details" rel="tab_previewDetails">Details</span>
            </li>
  
            <li class="2ndary" style="display:none" rel="tab_previewSync">
              <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
              <span term="activityDetail_tab_sync" rel="tab_previewSync">Sync</span>
            </li>

            <li class="2ndary tabHide" style="display:none" rel="tab_optionalDev">
              <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
              <span term="activityDetail_tab_dev" rel="tab_optionalDev">Dev</span>
            </li>    

          </ul>
        </li>

        <li class="primary" rel="tab_previewSync">
          <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
          <span term="activityDetail_tab_sync" rel="tab_previewSync">Sync</span>
          <ul class="2ndary" style="display: none; z-index: 1;">

            <li class="2ndary" style="display:none" rel="tab_previewDetails">
              <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
              <span term="activityDetail_tab_details" rel="tab_previewDetails">Details</span>
            </li>

            <li class="2ndary" style="display:none" rel="tab_previewPayload">
              <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
              <span term="activityDetail_tab_payload" rel="tab_previewPayload">Payload</span>
            </li>

            <li class="2ndary tabHide" style="display:none" rel="tab_optionalDev">
              <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
              <span term="activityDetail_tab_dev" rel="tab_optionalDev">Dev</span>
            </li>            

          </ul>
        </li>

        <li class="primary tab_optionalDev" rel="tab_optionalDev" style="display: none;">
          <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
          <span term="activityDetail_tab_dev" rel="tab_optionalDev">Dev</span>

          <ul class="2ndary" style="display: none; z-index: 1;">

            <li class="2ndary" style="display:none" rel="tab_previewDetails">
              <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
              <span term="activityDetail_tab_details" rel="tab_previewDetails">Details</span>
            </li>

            <li class="2ndary" style="display:none" rel="tab_previewPayload">
              <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
              <span term="activityDetail_tab_payload" rel="tab_previewPayload">Payload</span>
            </li>
  
            <li class="2ndary" style="display:none" rel="tab_previewSync">
              <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
              <span term="activityDetail_tab_sync" rel="tab_previewSync">Sync</span>
            </li>

          </ul>
        </li>

      </ul>
      <div class="tab_fs__head-icon_exp"></div>
    </div>

    <div class="tab_fs__container">
      <div class="tab_fs__container-content active sheet_preview" tabButtonId="tab_previewDetails"
        blockid="tab_previewDetails" />
      <div class="tab_fs__container-content" tabButtonId="tab_previewPayload" blockid="tab_previewPayload" style="display:none;">
        <button id="editPaylayLoadBtn" term="activityDetail_tab_payload_btn_Edit">Edit</button>
        <div class="payloadData"></div>
        <div class="editForm" style="display: none;"></div>
      </div>
      <div class="tab_fs__container-content" tabButtonId="tab_previewSync" blockid="tab_previewSync" style="display:none;" />
      <div class="tab_fs__container-content" tabButtonId="tab_optionalDev" blockid="tab_optionalDev" style="display:none;">
        <div>Status Change: 
          <select class="devActivityStatusSel" style="border: solid 1px #ccc; width: 120px;">
            <option value="">Select One</option>
            <option value="queued">Pending</option>
            <option value="processing">Processing</option>
            <option value="submit">Synced</option>
            <option value="failed">Failed</option>
            <option value="error">Error</option>
          </select>
          <span class="devActivityStatusResult"></span>
        </div>
      </div>
    </div>
  </div>
</div>`;
