// -------------------------------------------
// -- BlockButton Class/Methods
function BlockButton( cwsRenderObj, blockObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	me.actionObj;

	// Tabs Related HTMLs
	me.divTabsContainer = ` <div class="tab_fs" /> `;
	me.divTabsTargetContainer = ` <div class="tab_fs__container" /> `;
	me.ulTabsHead = ` <ul class="tab_fs__head" /> `;
	me.divHeadIcon = ` <div class="tab_fs__head-icon" /> `;
	me.divHeadIconExp = ` <div class="tab_fs__head-icon_exp" style="cursor: pointer; pointer-events: none;" /> `;  // Quick Fix, but not good one
	me.divHeadTextSpan = ` <span /> `;
	me.ulTabsecondary = ` <ul class="secondary" style="display:none" /> `;
	me.liTabsecondary = ` <li class="secondary" style="display:none" /> `;
	me.divTabsTargetElement = ` <div class="tab_fs__container-content" /> `;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function() {
		me.actionObj = new Action( me.cwsRenderObj, me.blockObj );
	};

	me.render = function( buttonsId, blockTag, passedData )
	{
		if ( buttonsId )
		{			
			// 'MainTab' type block - tab buttons   VS.   Buttons inside the block
			if ( me.blockObj.blockType === FormUtil.blockType_MainTab )
			{
				// STEP 1. MainTab case, blockDivTag has 2 main sections: 1. 
				var tabButtonsDivTag = me.createTabsBtnNContentTags( buttonsId, blockTag );
	

				// STEP 2. Main Render: block button tag generate
				for( var i = 0; i < buttonsId.length; i++ )
				{
					var btnId = buttonsId[ i ];
					me.renderBlockButton( btnId, tabButtonsDivTag, passedData );
					// No need to append since it was already created on 'createTabsBtnNContentTags'
				}
	
	
				// STEP 3. Setup the tab click for opening tab content area
				FormUtil.setUpEntryTabClick( tabButtonsDivTag ); //expIconTag
	
				// Click on 1st/Last-Recorded tab.
				setTimeout( function() 
				{
					tabButtonsDivTag.find( 'li:first' ).click();
				}, 100 );
				
			}
			else
			{
				// STEP 2. Main Render: block button tag generate
				for( var i = 0; i < buttonsId.length; i++ )
				{
					var btnId = buttonsId[ i ];
					var btnTag = me.renderBlockButton( btnId, blockTag, passedData );
					if ( btnTag ) blockTag.append( btnTag );
				}
			}
		}
	};


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.createTabsBtnNContentTags = function( buttonsId, blockTag )
	{
		// Tab Button div section & Tab Content div section create
		var btnTabsContainerTag = $( me.divTabsContainer );
		var btnContentContainerTag = $( me.divTabsTargetContainer );

		blockTag.append( btnTabsContainerTag );
		blockTag.append( btnContentContainerTag );


		// Main Tab Part
		var btnTabsUlTag = $( me.ulTabsHead );
		btnTabsContainerTag.append( btnTabsUlTag );

		var expIconTag = $( me.divHeadIconExp );
		btnTabsContainerTag.append( expIconTag );

		// TODO: Add to on tab click event..


		btnTabsUlTag.css( '--tabs', ( buttonsId.length > 0 ) ? buttonsId.length : 1 );

		// SETUP EMPTY PLACE HOLDERS FOR TABS + TAB-CONTENT (pregenerated)
		for( var i = 0; i < buttonsId.length; i++ )
		{
			var tabButtonId = FormUtil.getObjDefId( buttonsId[i] );

			// MAIN DISPLAY TAB
			var liTabTag = $( '<li class="primary" />' );
			var dvTabContentTag = $( me.divHeadIcon );
			var spTabTextTag = $( me.divHeadTextSpan );
			var dvContentTag = $( me.divTabsTargetElement );

			liTabTag.attr( 'rel', tabButtonId );
			dvTabContentTag.attr( 'rel', tabButtonId );
			spTabTextTag.attr( 'rel', tabButtonId );

			dvContentTag.attr( 'tabButtonId', tabButtonId );
			
			btnTabsUlTag.append( liTabTag );
			liTabTag.append( dvTabContentTag );
			liTabTag.append( spTabTextTag );
			btnContentContainerTag.append( dvContentTag );

			if ( btnTabsUlTag )
			{
				// SECONDARY DISPLAY TAB (hidden, but shown for small screen layout)
				let ulTabTag = $( me.ulTabsecondary );

				for( var a = 0; a < buttonsId.length; a++ )
				{
					if ( a !== i )
					{
						var otherTabButtonId = FormUtil.getObjDefId( buttonsId[a] );

						var lisecondaryTabTag = $( me.liTabsecondary );
						var dvsecondaryTabContentTag = $( me.divHeadIcon );
						var spsecondaryTabTextTag = $( me.divHeadTextSpan );

						lisecondaryTabTag.attr( 'rel',otherTabButtonId );
						dvsecondaryTabContentTag.attr( 'rel', otherTabButtonId );
						spsecondaryTabTextTag.attr( 'rel',otherTabButtonId );

						lisecondaryTabTag.append( dvsecondaryTabContentTag );
						lisecondaryTabTag.append( spsecondaryTabTextTag );
						ulTabTag.append( lisecondaryTabTag );
					}
				}

				btnTabsUlTag.find( 'li.primary[rel=' + tabButtonId + ']' ).append( ulTabTag );
			}
		}	
		
		return btnTabsContainerTag;
	};
	

	me.renderBlockButton = function( btnId, targetTag, passedData )
	{
		var btnTag;

		//var targetDivTag;  // target Div where the buttons will be added.
		var btnJson = FormUtil.getObjFromDefinition( btnId, ConfigManager.getConfigJson().definitionButtons );

		if ( btnJson && FormUtil.checkConditionEval( btnJson.conditionEval ) )
		{		
			btnId = FormUtil.getObjDefId( btnId );
		
			// For TabButtons Case, they are already generaeted with some html at this point...  Simply adding more details.
			btnTag = me.generateBtnTag( btnJson, btnId, targetTag );
			
			// Block Button Click Setup
			me.setUpBtnClick( btnTag, btnJson, btnId, passedData );	
		}

		return btnTag;
	};


	me.generateBtnTag = function( btnJson, btnId, divTag )
	{
		var btnTag;

		if ( btnJson !== undefined )
		{
			if ( btnJson.buttonType === 'radioButton' )
			{
				btnTag = $( '<div style="padding:14px;" class=""><input type="radio" class="stayLoggedIn" style="width: 1.4em; height: 1.4em;">'
					+ '<span ' + FormUtil.getTermAttr( btnJson ) + ' style="vertical-align: top; margin-left: 5px; ">' + btnJson.defaultLabel + '</span></div>' );
			}
			else if ( btnJson.buttonType === 'imageButton' )
			{
				// New UI Tab Button
				if ( me.blockObj.blockType === FormUtil.blockType_MainTab )
				{
					var liTabTag = divTag.find( 'li[rel=' + btnId + ']' );
					var liDivTag = divTag.find( 'div[rel=' + btnId + ']' );
					var liSpanTag = divTag.find( 'span[rel=' + btnId + ']' );

					liTabTag.attr( 'title', btnJson.defaultLabel );	
					liDivTag.css( 'background', 'url(' + btnJson.imageSrc + ')' );
					liSpanTag.text( btnJson.defaultLabel );
					FormUtil.addTag_TermAttr( liSpanTag, btnJson );

					btnTag = liTabTag;
				}
				else
				{
					btnTag = $( '<div class="btnType ' + btnJson.buttonType + '"><img src="' + btnJson.imageSrc + '"></div>' );
				}
			}
			else if ( btnJson.buttonType === 'textButton' )
			{
				var btnIdAttr = ' btnId="' + btnId + '"';

				if ( me.blockObj.blockType === FormUtil.blockType_MainTabContent )
				{
					btnTag = $( '<div ' + btnIdAttr + ' class="button primary mouseDown button-full_width ' + btnJson.buttonType + '" />' );
				}
				else
				{
					btnTag = $( '<button ' + btnIdAttr + ' ' + FormUtil.getTermAttr( btnJson ) + ' ranid="' + Util.generateRandomId() + '" class="button primary button-full_width ' + btnJson.buttonType + '" />' );
				}

				var btnContainerTag = $( '<div class="button__container" />' );
				var btnLabelTag = $( '<div ' + FormUtil.getTermAttr( btnJson ) + ' class="button-label" />' );

				btnTag.append( btnContainerTag );
				btnContainerTag.append( btnLabelTag );

				btnLabelTag.text( btnJson.defaultLabel );

			}
			else if ( btnJson.buttonType === 'listRightImg' )
			{
				btnTag = $( '<img src="' + ( btnJson.img ? btnJson.img : 'images/arrow_right.svg' ) + '" style="cursor: pointer;" ranid="' + Util.generateRandomId() + '" class="btnType ' + btnJson.buttonType + '" >' );
				btnTag.on( 'error', function (){
					$( this).attr( 'src', 'images/arrow_right.svg' );
					return false;
				});

				if ( divTag )
				{
					//console.log( svgStyle );
					btnTag.attr( 'width', '60px' ); // ( divTag.css( 'width' ) ? divTag.css( 'width' ) : '60px' ) ); //svgStyle.width
					btnTag.attr( 'height', '60px' ); // ( divTag.css( 'height' ) ? divTag.css( 'height' ) : '60px' ) );	//svgStyle.height
				}
			}
		}

		if ( btnTag === undefined )
		{
			var caseNA = ( btnId !== undefined && typeof btnId === 'string' ) ? btnId : "NA";
			btnTag = $( '<div class="btnType unknown">' + caseNA + '</div>' );
		}

		return btnTag;
	};


	me.setUpBtnClick = function( btnTag, btnJson, btnId, passedData )
	{
		if ( btnJson && btnTag )
		{
			if ( btnJson.onClick )
			{
				btnTag.click( function() 
				{
					// gAnalytics Event
					GAnalytics.setEvent( 'ButtonClick', btnId, 'formButton', 1 );
					//GAnalytics.setEvent = function(category, action, label, value = null) 

					// Clear All Previous Msgs..
					MsgManager.msgAreaClearAll();

					if ( me.networkModeNotSupported( btnJson, ConnManagerNew.statusInfo.appMode ) )
					{
						AppModeSwitchPrompt.showInvalidNetworkMode_Dialog( ConnManagerNew.statusInfo.appMode, cwsRenderObj );
					}
					else
					{
						if ( me.blockObj.blockType === FormUtil.blockType_MainTab ) 
						{
							var blockDivTag = btnTag.closest( 'div.block' );
							var btnTargetParentTag = me.blockObj.blockTag.find( '.tab_fs__container-content[tabButtonId="' + btnId + '"]' );

							// TEMP: NOTE: For 'MainTab image button click', 
							//		We could have clear content on 'onClick' action list, but for now... do this as initial default action..
							btnTargetParentTag.empty();

							me.actionObj.handleClickActions( btnTag, btnJson.onClick, btnTargetParentTag, blockDivTag, undefined, passedData );
						}	
						else
						{
							//var blockDivTag = btnTag.closest( '.block' );
							// TODO: 'tab_fs__container-content' <-- TEMPORARY FIX <-- WILL NOT WORK WITH ALL BLOCK MODEL, BUT ONLY TAB BASED ONES.. 
							var blockDivTag = btnTag.closest( 'div.block' );
							var formDivSecTag = blockDivTag.find( '.formDivSec' );
	
							// NOTE: TRAN VALIDATION
							var validationPass = ( btnJson.bypassValidation || Validation.checkFormEntryTagsData( formDivSecTag, 'showMsg' ) );

							if ( validationPass )
							{				
								// TODO: ACTIVITY ADDING - Placed Activity Addition here - since we do not know which block is used vs displayed
								//	Until the button within block is used.. (We should limit to certain type of button to do this, actually.)
								ActivityUtil.addAsActivity( 'block', me.blockObj.blockJson, me.blockObj.blockId );

								// NOTE: buttons normally do not need to get passedData unless we want to pass something on action..
								// If the button has action that does queueActivity, we would need current block's show/hideCase in passedData.
								if ( !passedData ) passedData = me.blockObj.passedData;

								me.actionObj.handleClickActions( btnTag, btnJson.onClick, me.blockObj.parentTag, blockDivTag, formDivSecTag, passedData );
							}
						}	
					}			
				});
			}
		    // 'onClickItem' --> dataList (search result list) button click.  Usually opens up new block to display info related to search result
			else if( btnJson.onClickItem )
			{
				btnTag.click( function() 
				{
					// gAnalytics Event
					GAnalytics.setEvent( 'ButtonClick', btnId, 'dataListButton', 1 );
					//GAnalytics.setEvent = function(category, action, label, value = null) 

					// Clear All Previous Msgs..
					MsgManager.msgAreaClearAll();

					//var btnTag = $( this );
					var blockDivTag = btnTag.closest( 'div.block' );
					var itemBlockTag = btnTag.closest( '.itemBlock' );
						
					if( Validation.checkFormEntryTagsData( itemBlockTag, 'showMsg' ) )
					{
						// TODO: ACTIVITY ADDING
						ActivityUtil.addAsActivity( 'block', me.blockObj.blockJson, me.blockObj.blockId );

						// display 'loading' image in place of click-img (assuming content will be replaced by new block)
						if ( btnJson.buttonType === 'listRightImg' )
						{
							// TODO: GREG <-- You can use .closest( '.---' ) instead
							var parentDiv = btnTag.parent().parent().parent().parent().parent()[0];

							for( var i = 0; i < parentDiv.children.length; i++ )
							{
								let tbl = parentDiv.children[i];

								if ( tbl != btnTag.parent().parent().parent().parent()[0] )
								{
									$( tbl ).css('opacity','0.4');
								}

							}

							var loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading_small.svg"></div>' );
							btnTag.hide();
							btnTag.parent().append( loadingTag );
						} 

						var idx = btnTag.closest(".itemBlock").attr("idx");
						me.actionObj.handleItemClickActions( btnTag, btnJson.onClickItem, idx, blockDivTag, itemBlockTag, passedData );
						// , passedData ); <-- 'passedData' is not used anymore.
						//	It retrieves from DHIS/WebService (making retrieveByClientId call) (using clientId again..)
					}
				});
			}
		}
	}

	me.networkModeNotSupported = function( btnJson, appMode )
	{
		return ( btnJson.notSupportedMode 
			&& btnJson.notSupportedMode[ appMode.toLowerCase() ] );
	}

	me.getActionCases = function( objClick )
	{
		var ret = { show: [], hide: [] };

		for( var o = 0; o < objClick.length; o++ )
		{
			if ( objClick[ o].showCase )
			{
				for( var i = 0; i < objClick[ o].showCase.length; i++ )
				{
					if ( ! ( ret.show ).includes( objClick[ o].showCase[ i ] ) )
					{
						ret.show.push( objClick[ o].showCase[ i ] );
					}
				}
			}

			if ( objClick[ o].hideCase )
			{
				for( var i = 0; i < objClick[ o].hideCase.length; i++ )
				{
					if ( ! ( ret.hide ).includes( objClick[ o].hideCase[ i ] ) )
					{
						ret.hide.push( objClick[ o].hideCase[ i ] );
					}
				}

			}
		}

		return ret;

	}

	// -------------------------------
	
	me.initialize();
}