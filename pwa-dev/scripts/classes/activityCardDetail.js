// -------------------------------------------
// -- ActivityCardDetail Class/Methods

function ActivityCardDetail(activityId, isRestore) {
	var me = this;

	me.activityId = activityId;
	me.isRestore = isRestore;
	me.cardSheetFullTag;

	// ===============================================
	// === Initialize Related ========================

	me.initialize = function () {
		me.cardSheetFullTag = FormUtil.sheetFullSetup(ActivityCardDetail.cardFullScreen, { title: 'Activity Detail', term: '', cssClasses: ['activityDetail'] });

		// If devMode, show Dev tab (primary) + li ones (secondary <-- smaller screen hidden li)
		if (DevHelper.devMode) me.setUpActivityDetailTabDev(me.cardSheetFullTag, me.activityId);

		// create tab click events
		FormUtil.setUpEntryTabClick(me.cardSheetFullTag.find('.tab_fs'));

		// ADD TEST/DUMMY VALUE
		me.cardSheetFullTag.find('.activity').attr('itemid', me.activityId)

		// ReRender
		me.cardSheetFullTag.find('.activityDetailRerender').off('click').click(function () {
			me.showFullPreview(me.activityId);
		});
	};

	// ----------------------------------

	me.render = function () {
		if (me.activityId) {
			INFO.activity = ActivityDataManager.getActivityById(me.activityId);

			// Header content set
			var actCard = new ActivityCard(me.activityId, { 'detailViewCase': true });
			actCard.render();

			// set tabs contents
			me.setFullPreviewTabContent(me.activityId, me.cardSheetFullTag);

			TranslationManager.translatePage();
		}
	};

	// ----------------------------------------------------

	me.setUpActivityDetailTabDev = function (sheetFullTag, activityId) {
		sheetFullTag.find('li.primary[rel="tab_optionalDev"]').attr('style', '');
		sheetFullTag.find('li.secondary[rel="tab_optionalDev"]').removeClass('tabHide');

		var statusSelTag = sheetFullTag.find('.devActivityStatusSel');
		var statusSelResultTag = sheetFullTag.find('.devActivityStatusResult');

		statusSelTag.change(function () {
			var statusVal = $(this).val();

			ActivityDataManager.activityUpdate_Status(activityId, statusVal, function () {
				var msg = "With 'DEV' mode, activity status has been manually changed to '" + statusVal + "'";

				statusSelResultTag.text(msg);
				ActivityDataManager.activityUpdate_History(activityId, statusVal, msg, 0);
			});
		});
	};


	me.showClientDetails = function (clientObj, tabTag) {
		if (clientObj && clientObj.clientDetails) {
			FormUtil.renderPreviewDataForm(clientObj.clientDetails, tabTag);
		}
	};

	me.setFullPreviewTabContent = function( activityId, sheetFullTag ) 
	{
		var clientObj = ClientDataManager.getClientByActivityId(activityId);
		var activityJson = ActivityDataManager.getActivityById(activityId);

		// TAB #1. Client Details
		var clientDetailsTabTag = sheetFullTag.find('[tabButtonId=tab_previewDetails]');
		me.showClientDetails(clientObj, clientDetailsTabTag);


		if (activityJson) 
		{			
			// TAB #2. Payload Preview
			var payloadTabTag = sheetFullTag.find( '[tabButtonId=tab_previewPayload]' );
			sheetFullTag.find( '.tab_fs li[rel=tab_previewPayload]' ).click( function() 
			{
				payloadTabTag.html( '' );

				// depending on the click, render it?
				var payloadDataDivTag = me.populatePayloadDataDiv( payloadTabTag, activityJson );

				// Set up "activityEditBtn"
				me.setUpActivityEditBtn( payloadTabTag, activityJson );
				// SetUp Edit Button + info tags Div
			});

			
			// TAB #3. Sync History
			if ( activityJson.processing && activityJson.processing.history ) 
			{
				var syncHistoryTag = $('[tabButtonId=tab_previewSync]').html(JsonBuiltTable.buildTable(activityJson.processing.history));
				syncHistoryTag.find('.bt_td_head').filter(function (i, tag) { return ($(tag).html() === 'responseCode'); }).html('response code');
			}

			// Set event for "Remove" button for "Pending" client
			var removeActivityBtn = sheetFullTag.find('.removeActivity').hide();
			if ( SyncManagerNew.statusSyncable( activityJson.processing.status ) ) 
			{
				removeActivityBtn.show().click(function () {
					var result = confirm("Are you sure you want to delete this activity?");
					if (result) {
						me.removeActivityNCard(activityId, sheetFullTag.find('img.btnBack'));
					}
				});
			}
		}
	};


	me.populatePayloadDataDiv = function( payloadTabTag, activityJson )
	{
		payloadTabTag.html( '' );
		payloadTabTag.append( ActivityCardDetail.divPayloadDataTag );

		var payloadDataDivTag = payloadTabTag.find( 'div.divPayloadData' );
		var payloadDataTag = payloadDataDivTag.find( 'div.payloadData' );

		var jv_payload = new JSONViewer();
		payloadDataTag.append( jv_payload.getContainer() );
		jv_payload.showJSON( activityJson );

		return payloadDataDivTag;
	};


	me.removeActivityNCard = function( activityId, btnBackTag ) 
	{
		var client = ActivityDataManager.deleteExistingActivity_Indexed(activityId);
		if (client && client.activities.length === 0) ClientDataManager.removeClient(client);

		ClientDataManager.saveCurrent_ClientsStore(() => {
			btnBackTag.click();

			//var activityCardTags = $( '[itemid="' + activityId + '"]' );  //  $( '#pageDiv' ).   .remove();

			// We also need to find all clientCard Tag with this.. and reload it..
			var divSyncIconTags = $('div.activityStatusIcon[activityId="' + activityId + '"]');
			divSyncIconTags.closest('div.card__container').find('div.clientRerender').click();

			// tab clientActivity reClick - to influence the activity list & favList..
			var tabClientActivitiesTag = $('[itemid="' + activityId + '"]').closest('div[tabbuttonid=tab_clientActivities]');
			if (tabClientActivitiesTag.length > 0) tabClientActivitiesTag.find('div.favReRender').click();

			// Finally, remove all activityCards of this id.
			$('[itemid="' + activityId + '"]').remove(); // activityCardTags
		});
	};


	// =============================================
	// === Activity 'EDIT' Form - Related Methods ========================

	me.setUpActivityEditBtn = function( payloadTabTag, activityJson )
	{
		try 
		{
			var activityEditBtnTag = payloadTabTag.find( '.activityEditBtn' ).hide();
			var infoTag = payloadTabTag.find( '.activityEditInfo' ).hide();

			if( activityJson ) 
			{
				var editable = false;
				var formData = ActivityDataManager.getActivityForm( activityJson );
				var status = activityJson.processing.status;

				var activityEditing = ConfigManager.getSettingsActivityDef().activityEditing;

				// We provide 2 ActivityEditing Case: 1. On Error Status.  2. On Synced status & 'activityEditing': true
				if ( activityEditing && ConfigManager.isSourceTypeMongo() && SyncManagerNew.statusSynced( status ) ) editable = true;
				if ( status === Constants.status_error) editable = true;

				if( editable ) 
				{
					if ( me.checkBlockActivityEdit_Limit( formData, activityJson, infoTag ) )
					{
						activityEditBtnTag.show();

						activityEditBtnTag.off('click').click(function (e) 
						{
							payloadTabTag.html( '' );

							me.loadEditActivityForm( formData, activityJson, payloadTabTag );
						});	
					}
				}
			}
		}
		catch (errMsg) {
			console.customLog('ERROR in ActivityCard.setUpActivityEditBtn, errMsg: ' + errMsg);
		}
	};


	me.checkBlockActivityEdit_Limit = function( formData, activityJson, infoTag )
	{
		var info_pre = 'activityEdit not available: ';

		try
		{
			if ( !formData ) 
			{
				infoTag.attr( 'title', info_pre + 'formData does not exist.' ).show();
				console.log( '[formData does not exist.]' );
				return false;
			}


			var blockJson = FormUtil.getObjFromDefinition( formData.blockId, ConfigManager.getConfigJson().definitionBlocks );

			if ( !blockJson )
			{
				infoTag.attr( 'title', info_pre + 'blockId, ' + formData.blockId + ', does not exist' ).show();
				console.log( '[userRoles not meet]' );
				return false;
			}

			if ( blockJson.activityEdit_Limit )
			{
				editLimitJson = blockJson.activityEdit_Limit;
				// 1. 'userRoles' should be check/used on above 'editable' button show/hide..
	
				// If userRoles exists, check if any of the userRoles exists in current login userRoles
				if ( editLimitJson.userRoles && !ConfigManager.matchUserRoles( editLimitJson.userRoles, ConfigManager.login_UserRoles ) )
				{
					infoTag.attr( 'title', info_pre + 'userRoles not meet' ).show();
					console.log( '[userRoles not meet]' );
					return false;
				}
					
				// 2. If 'conditionEval' exists, return false if the condition if not true. ('editableEval' also checks on above condition...
				if ( editLimitJson.conditionEval )
				{
					INFO.activity = activityJson;

					if ( !FormUtil.checkConditionEval( editLimitJson.conditionEval ) ) 
					{
						infoTag.attr( 'title', info_pre + 'conditionEval not true' ).show();
						console.log( '[conditionEval not true]' );
						return false;
					}
				}
			}
		}
		catch( errMsg )
		{
			//showFailMsg += ' [error catched]';
			infoTag.attr( 'title', info_pre + 'Error on code' ).show();
			console.log( 'ERROR in activityCardDetail.checkBlockActivityEdit_Limit, ' + errMsg );
			return false;
		}

		// Show with icon for the false reason? for edit information show?
		return true;
	};


	me.loadEditActivityForm = function( editForm, activityJson, payloadTabTag ) 
	{
		var blockJson = FormUtil.getObjFromDefinition( editForm.blockId, ConfigManager.getConfigJson().definitionBlocks );

		if ( blockJson ) 
		{
			var fieldDataArr = editForm.data;

			// copy 'name' field to 'id
			if ( fieldDataArr )
			{
				fieldDataArr.forEach( fieldJson => { fieldJson.id = fieldJson.name; });
			}

			var passedData = { showCase: editForm.showCase, hideCase: editForm.hideCase, formDataArr: fieldDataArr };

			var blockObj = FormUtil.renderBlockByBlockId( editForm.blockId, SessionManager.cwsRenderObj, payloadTabTag, passedData, undefined, undefined, 'blockList');
			var blockTag = blockObj.blockTag;

			// NOTE: Bottom Padding is done by display: flex , which is defined by class 'sheet_preview'

			if ( activityJson ) 
			{
				ActivityDataManager.setEditModeActivityId_blockTag( blockTag, activityJson.id );
				
				// nonEditable fields disable/readOnly
				if ( blockJson.activityEdit_Limit && blockJson.activityEdit_Limit.nonEditableFields )
				{		
					blockJson.activityEdit_Limit.nonEditableFields.forEach( fieldName => 
					{
						var fieldTags = FormUtil.getFieldTagsByName( fieldName, blockTag );
						FormUtil.disableFieldTags( fieldTags );
					});
				}				
			}
		}
		else {
			alert("Cannot find block with id '" + editForm.blockId + "'");
		}
	};

	// =============================================
	// === Run initialize - when instantiating this class  ========================

	me.initialize();

}

ActivityCardDetail.cardFullScreen = `
<div class="sheet_full-fs detailFullScreen">
  <div class="wapper_card">
    <div class="sheet-title c_900">
      <img src='images/arrow_back.svg' class='btnBack'>
      <span class="sheetTopTitle">Details</span>
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

      <div class="divActivityModBtns" style="">
        <div class="button warning button-full_width removeActivity"
        style="display:none; height: 12px; min-height: 12px !important; background-color: whitesmoke; border: solid 1px silver;">
          <div class="button__container">
            <div class="button-label" style="line-height: 12px; color: tomato; font-size: 8px;">Remove Pending Activity</div>
          </div>
        </div>
      </div>

      <div class="tab_fs">

        <ul class="tab_fs__head" style="background-color: #fff;">

          <li class="primary active" rel="tab_previewDetails">
            <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
            <span term="activityDetail_tab_details" rel="tab_previewDetails">Details</span>

            <ul class="secondary" style="display: none; z-index: 1;">

              <li class="secondary" style="display:none" rel="tab_previewPayload">
                <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
                <span term="activityDetail_tab_payload" rel="tab_previewPayload">Payload</span>
              </li>
    
              <li class="secondary" style="display:none" rel="tab_previewSync">
                <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
                <span term="activityDetail_tab_sync" rel="tab_previewSync">Sync</span>
              </li>

              <li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                <span term="activityDetail_tab_dev" rel="tab_optionalDev">Dev</span>
              </li>    

            </ul>
          </li>

          <li class="primary" rel="tab_previewPayload">
            <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
            <span term="activityDetail_tab_payload" rel="tab_previewPayload">Payload</span>

            <ul class="secondary" style="display: none; z-index: 1;">

              <li class="secondary" style="display:none" rel="tab_previewDetails">
                <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
                <span term="activityDetail_tab_details" rel="tab_previewDetails">Details</span>
              </li>
    
              <li class="secondary" style="display:none" rel="tab_previewSync">
                <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
                <span term="activityDetail_tab_sync" rel="tab_previewSync">Sync</span>
              </li>

              <li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                <span term="activityDetail_tab_dev" rel="tab_optionalDev">Dev</span>
              </li>    

            </ul>
          </li>

          <li class="primary" rel="tab_previewSync">
            <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
            <span term="activityDetail_tab_sync" rel="tab_previewSync">Sync</span>
            <ul class="secondary" style="display: none; z-index: 1;">

              <li class="secondary" style="display:none" rel="tab_previewDetails">
                <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
                <span term="activityDetail_tab_details" rel="tab_previewDetails">Details</span>
              </li>

              <li class="secondary" style="display:none" rel="tab_previewPayload">
                <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
                <span term="activityDetail_tab_payload" rel="tab_previewPayload">Payload</span>
              </li>

              <li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
                <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
                <span term="activityDetail_tab_dev" rel="tab_optionalDev">Dev</span>
              </li>            

            </ul>
          </li>

          <li class="primary tab_optionalDev" rel="tab_optionalDev" style="display: none;">
            <div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
            <span term="activityDetail_tab_dev" rel="tab_optionalDev">Dev</span>

            <ul class="secondary" style="display: none; z-index: 1;">

              <li class="secondary" style="display:none" rel="tab_previewDetails">
                <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
                <span term="activityDetail_tab_details" rel="tab_previewDetails">Details</span>
              </li>

              <li class="secondary" style="display:none" rel="tab_previewPayload">
                <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
                <span term="activityDetail_tab_payload" rel="tab_previewPayload">Payload</span>
              </li>
    
              <li class="secondary" style="display:none" rel="tab_previewSync">
                <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
                <span term="activityDetail_tab_sync" rel="tab_previewSync">Sync</span>
              </li>

            </ul>
          </li>

        </ul>
        <div class="tab_fs__head-icon_exp"></div>
      </div>

      <div class="tab_fs__container">
        <div class="tab_fs__container-content active sheet_preview" tabButtonId="tab_previewDetails" blockid="tab_previewDetails" />
        <div class="tab_fs__container-content sheet_preview" tabButtonId="tab_previewPayload" blockid="tab_previewPayload" style="display:none;" />
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
  </div>
</div>`;

ActivityCardDetail.divPayloadDataTag = `
	<div class="divPayloadData">
		<div class="divActivityEdit">
			<button class="activityEditBtn" term="activityDetail_tab_payload_btn_Edit" style="display:none;">Edit</button>
			<img src="images/about.svg" class="activityEditInfo" style="display:none; margin-bottom: -10px; width: 20px; opacity: 0.6;" />		
		</div>
		<div class="payloadData"></div>
	</div>
`;

ActivityCardDetail.clientInfoTag = `
  <div class="fieldBlock field">
    <div class="field__label">
      <label class="fieldName"></label>
    </div>
    <div class="fiel__controls">
      <div class="field__left fieldValue"></div>
      <div class="field__right" style="display: none;"></div>
    </div>
  </div>
`; 