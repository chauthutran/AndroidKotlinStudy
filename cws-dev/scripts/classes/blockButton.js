// -------------------------------------------
// -- BlockButton Class/Methods
function BlockButton( cwsRenderObj, blockObj, validationObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	me.validationObj = validationObj;
	me.actionObj;
		
	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function() {
		me.actionObj = new Action( me.cwsRenderObj, me.blockObj );
	}

	me.render = function( buttonsJson, blockTag, passedData )
	{

		if ( buttonsJson !== undefined )
		{

			// STEP 1. IF 'MAIN TAB' MODE, RENDER ALL THE TABS AND CONTENTS (AND ANCHOR TABS AS WELL)
			if ( me.blockObj.blockType === FormUtil.blockType_MainTab )
			{
				var btnTabsContainerTag = $( '<div class="tab_fs" />' );
				blockTag.append( btnTabsContainerTag );
	
				var btnContentContainerTag = $( '<div class="tab_fs__container" />' );
				blockTag.append( btnContentContainerTag );

				// Main Tab Part
				var ulTagTag = $( '<ul class="tab_fs__head" />' );
				btnTabsContainerTag.append( ulTagTag );

				var expIconTag = $( '<div class="tab_fs__head-icon_exp" />' );
				btnTabsContainerTag.append( expIconTag );

				// SETUP EMPTY PLACE HOLDERS FOR TABS + TAB-CONTENT (pregenerated)
				for( var i = 0; i < buttonsJson.length; i++ )
				{
					//var tabNo = i + 1;
					var liTabTag = $( '<li rel="' + buttonsJson[ i ] + '" />' );
					var dvTabContentTag = $( '<div class="tab_fs__head-icon" />' );
					var dvContentTag = $( '<div id="' + buttonsJson[ i ] + '" class="tab_fs__container-content" />' );

					ulTagTag.append( liTabTag );
					liTabTag.append( dvTabContentTag );
					btnContentContainerTag.append( dvContentTag );
				}
			}
			else if ( me.blockObj.blockType === FormUtil.blockType_MainTabContent )
			{
				// Main Content Part
				btnTabsContainerTag = blockTag; //.find( '#' + buttonsJson[ i ] ); //#pageDiv
			}

			// Main Render: block button tag generate
			for( var i = 0; i < buttonsJson.length; i++ )
			{
				me.renderBlockButton( i + 1, buttonsJson[i], btnTabsContainerTag, passedData );
			}

			if ( me.blockObj.blockType === FormUtil.blockType_MainTab ) 
			{
				// Setup the tab click for opening tab content area
				FormUtil.setUpTabAnchorUI( btnTabsContainerTag );	

				// Click on 1st/Last-Recorded tab.
				setTimeout( function() 
				{
					btnTabsContainerTag.find( 'li:first-child' ).click();

				}, 100 );

			}

		}
	}

	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.renderBlockButton = function( btnNo, btnData, divTag, passedData )
	{
		var btnJson = FormUtil.getObjFromDefinition( btnData, SessionManager.sessionData.dcdConfig.definitionButtons );
		var btnTag = me.generateBtnTag( btnNo, btnJson, btnData, divTag );

		// this is not used on mainTab case..
		if ( me.blockObj.blockType !== FormUtil.blockType_MainTab ) 
		{
			me.setUpBtnClick( btnTag, btnJson, passedData );

			divTag.append( btnTag );
		}
		else
		{

			btnTag.click( function() {

				var dvContentTag = divTag.siblings().find( '#' + btnData );

				me.renderBlockTabContent( dvContentTag, btnJson.onClick );	

			});

			//divTag.append( btnTag );

		}
	}

	me.generateBtnTag = function( btnNo, btnJson, btnData, divTag )
	{
		var btnTag;

		if ( btnJson !== undefined )
		{
			if ( btnJson.buttonType === 'radioButton' )
			{
				/*if ( me.blockObj.blockType === FormUtil.blockType_MainTabContent )
				{
					btnTag = $( '<div class="tb-content-buttom ">' + btnJson.defaultLabel + '</div>' );
				}
				else*/
				{
					btnTag = $( '<div style="padding:14px;" class=""><input type="radio" class="stayLoggedIn" style="width: 1.4em; height: 1.4em;">'
						+ '<span ' + FormUtil.getTermAttr( btnJson ) + ' style="vertical-align: top; margin-left: 5px; ">' + btnJson.defaultLabel + '</span></div>' );
				}
			}
			else if ( btnJson.buttonType === 'imageButton' )
			{
				// NEW - added 'tabs' style..
				if ( me.blockObj.blockType === FormUtil.blockType_MainTab )
				{
					// Append on your own ( both li and anchor )
					var liTabTag = divTag.find( 'li[rel="' + btnData + '"]' );
					var liDivTag = liTabTag.find( 'div' );

					liDivTag.css( 'background', 'url(' + btnJson.imageSrc + ')' );
					liTabTag.append( $( '<span>' + btnJson.defaultLabel + '</span>' ) );

					btnTag = liTabTag; //aContentTag;
				}
				else
				{
					btnTag = $( '<div class="btnType ' + btnJson.buttonType + '"><img src="' + btnJson.imageSrc + '"></div>' );
				}
			}
			else if ( btnJson.buttonType === 'textButton' )
			{
				if ( me.blockObj.blockType === FormUtil.blockType_MainTabContent )
				{
					btnTag = $( '<div class="button primary button-full_width" />' );
				}
				else
				{
					btnTag = $( '<button ' + FormUtil.getTermAttr( btnJson ) + ' ranid="' + Util.generateRandomId() + '" class="button primary button-full_width ' + btnJson.buttonType + '" btnNo="' + btnNo + '" />' );
				}

				var btnContainerTag = $( '<div class="button__container" />' );
				var btnLabelTag = $( '<div ' + FormUtil.getTermAttr( btnJson ) + ' class="button-label" />' );

				btnTag.append( btnContainerTag );
				btnContainerTag.append( btnLabelTag );

				btnLabelTag.text( btnJson.defaultLabel );

			}
			else if ( btnJson.buttonType === 'listRightImg' )
			{
				btnTag = $( '<img src="' + btnJson.img + '" style="cursor: pointer;" ranid="' + Util.generateRandomId() + '" class="btnType ' + btnJson.buttonType + '" btnNo="' + btnNo + '">' );
				//btnTag = $( '<img src="' + btnJson.img + '" class="rotate90 ' + btnJson.buttonType + '" style="cursor: pointer;">' );
			}
		}

		if ( btnTag === undefined )
		{
			var caseNA = ( btnData !== undefined && typeof btnData === 'string' ) ? btnData : "NA";
			btnTag = $( '<div class="btnType unknown">' + caseNA + '</div>' );
		}

		console.log( btnTag );
		return btnTag;
	}

	me.setUpBtnClick = function( btnTag, btnJson, passedData )
	{
		if ( btnJson && btnTag )
		{
			if ( btnJson.onClick !== undefined )
			{
				btnTag.click( function() 
				{
					var blockDivTag = btnTag.closest( '.block' );
					var formDivSecTag = blockDivTag.find( '.formDivSec' );
			
					// NOTE: TRAN VALIDATION
					if( me.validationObj.checkFormEntryTagsData( formDivSecTag ) )
					{				
						// TODO: ACTIVITY ADDING - Placed Activity Addition here - since we do not know which block is used vs displayed
						//	Until the button within block is used.. (We should limit to certain type of button to do this, actually.)
						ActivityUtil.addAsActivity( 'block', me.blockObj.blockJson, me.blockObj.blockId );

						// display 'loading' image in place of click-img (assuming content will be replaced by new block)
						if ( btnJson.buttonType === 'listRightImg' )
						{
							var loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading_small.svg"></div>' );
							btnTag.hide();
							btnTag.parent().append( loadingTag );
						} 

						me.actionObj.handleClickActions( btnTag, btnJson.onClick, blockDivTag, formDivSecTag );
					}
				});
			}
			else if( btnJson.onClickItem !== undefined )
			{
				btnTag.click( function() 
				{
					//var btnTag = $( this );
					var blockDivTag = btnTag.closest( 'div.block' );
					var itemBlockTag = btnTag.closest( '.itemBlock' );
						
					if( me.validationObj.checkFormEntryTagsData( itemBlockTag ) )
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
						me.actionObj.handleItemClickActions( btnTag, btnJson.onClickItem, idx, blockDivTag, itemBlockTag );
						// , passedData ); <-- 'passedData' is not used anymore.
						//	It retrieves from DHIS/WebService (making retrieveByClientId call) (using clientId again..)
					}
				});
			}
		}
	}


	me.renderBlockTabContent = function( liContentTag, onClick )
	{
		if ( onClick && onClick.length > 0 )
		{
			var actionJsonArr = FormUtil.convertNamedJsonArr( onClick, SessionManager.sessionData.dcdConfig.definitionActions );
			var actionJson = Util.getFromList( actionJsonArr, 'openBlock', 'actionType' );

			if ( actionJson && actionJson.blockId !== undefined )
			{
				var blockJson = FormUtil.getObjFromDefinition( actionJson.blockId, SessionManager.sessionData.dcdConfig.definitionBlocks );

				// Create the block and render it.
				var newBlockObj = new Block( me.cwsRenderObj, blockJson, actionJson.blockId, liContentTag, actionJson  );
				newBlockObj.render();

				if ( actionJson.payloadConfig )
				{
					FormUtil.block_payloadConfig = actionJson.payloadConfig;
					FormUtil.setPayloadConfig( newBlockObj, actionJson.payloadConfig, SessionManager.sessionData.dcdConfig.definitionForms[ blockJson.form ] );
				}
				else
				{
					FormUtil.block_payloadConfig = '';
				}

			}
		}
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