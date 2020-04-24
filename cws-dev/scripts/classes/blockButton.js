// -------------------------------------------
// -- BlockButton Class/Methods
function BlockButton( cwsRenderObj, blockObj, validationObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	me.validationObj = validationObj;
	me.actionObj;

	me.divTabsContainer = ` <div class="tab_fs" /> `;
	me.divTabsTargetContainer = ` <div class="tab_fs__container" /> `;
	me.ulTabsHead = ` <ul class="tab_fs__head" /> `;
	me.divHeadIcon = ` <div class="tab_fs__head-icon" /> `;
	me.divHeadIconExp = ` <div class="tab_fs__head-icon_exp" /> `;
	me.divHeadTextSpan = ` <span /> `;
	me.ulTab2ndary = ` <ul class="2ndary" style="display:none" /> `;
	me.liTab2ndary = ` <li class="2ndary" style="display:none" /> `;
	me.divTabsTargetElement = ` <div class="tab_fs__container-content" /> `;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function() {
		me.actionObj = new Action( me.cwsRenderObj, me.blockObj );
	}

	me.render = function( buttonsJson, blockTag, passedData )
	{

		var btnTabsUlTag;

		if ( buttonsJson !== undefined )
		{

			// STEP 1. IF 'MAIN TAB' MODE, RENDER ALL THE TABS AND CONTENTS (AND ANCHOR TABS AS WELL)
			if ( me.blockObj.blockType === FormUtil.blockType_MainTab )
			{
				var btnTabsContainerTag = $( me.divTabsContainer );
				blockTag.append( btnTabsContainerTag );
	
				var btnContentContainerTag = $( me.divTabsTargetContainer );
				blockTag.append( btnContentContainerTag );

				// Main Tab Part
				btnTabsUlTag = $( me.ulTabsHead );
				btnTabsContainerTag.append( btnTabsUlTag );

				var expIconTag = $( me.divHeadIconExp );
				btnTabsContainerTag.append( expIconTag );

				// SETUP EMPTY PLACE HOLDERS FOR TABS + TAB-CONTENT (pregenerated)
				for( var i = 0; i < buttonsJson.length; i++ )
				{
					// MAIN DISPLAY TAB
					var liTabTag = $( '<li class="primary" />' );
					var dvTabContentTag = $( me.divHeadIcon );
					var spTabTextTag = $( me.divHeadTextSpan );
					var dvContentTag = $( me.divTabsTargetElement );

					liTabTag.attr( 'rel', buttonsJson[ i ] );
					dvTabContentTag.attr( 'rel', buttonsJson[ i ] );
					spTabTextTag.attr( 'rel', buttonsJson[ i ] );

					dvContentTag.attr( 'id', buttonsJson[ i ] );
					
					btnTabsUlTag.append( liTabTag );
					liTabTag.append( dvTabContentTag );
					liTabTag.append( spTabTextTag );
					btnContentContainerTag.append( dvContentTag );

					if ( btnTabsUlTag )
					{
						// SECONDARY DISPLAY TAB (hidden, but shown for small screen layout)
						let ulTabTag = $( me.ulTab2ndary );
		
						for( var a = 0; a < buttonsJson.length; a++ )
						{
							if ( a !== i )
							{
								var li2ndaryTabTag = $( me.liTab2ndary );
								var dv2ndaryTabContentTag = $( me.divHeadIcon );
								var sp2ndaryTabTextTag = $( me.divHeadTextSpan );
		
								li2ndaryTabTag.attr( 'rel', buttonsJson[ a ] );
								dv2ndaryTabContentTag.attr( 'rel', buttonsJson[ a ] );
								sp2ndaryTabTextTag.attr( 'rel', buttonsJson[ a ] );

								li2ndaryTabTag.append( dv2ndaryTabContentTag );
								li2ndaryTabTag.append( sp2ndaryTabTextTag );
								ulTabTag.append( li2ndaryTabTag );
							}
						}

						btnTabsUlTag.find( 'li.primary[rel=' + buttonsJson[ i ] + ']' ).append( ulTabTag );

					}


				}


			}
			else if ( me.blockObj.blockType === FormUtil.blockType_MainTabContent )
			{
				// Main Content Part
				btnTabsContainerTag = blockTag; //.find( '#' + buttonsJson[ i ] ); //#pageDiv
			}

			var btnArr = Util.cloneArray( buttonsJson );

			// Main Render: block button tag generate
			for( var i = 0; i < buttonsJson.length; i++ )
			{
				me.renderBlockButton( i + 1, buttonsJson[i], btnTabsContainerTag, passedData );
			}


			if ( me.blockObj.blockType === FormUtil.blockType_MainTab ) 
			{
				// Setup the tab click for opening tab content area
				FormUtil.setUpNewUITab( btnTabsContainerTag ); //expIconTag

				// Click on 1st/Last-Recorded tab.
				setTimeout( function() 
				{
					btnTabsContainerTag.find( 'li:first' ).click();

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

		}
	}

	me.generateBtnTag = function( btnNo, btnJson, btnData, divTag )
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
					var liTabTag = divTag.find( 'li[rel=' + btnData + ']' );
					var liDivTag = divTag.find( 'div[rel=' + btnData + ']' );
					var liSpanTag = divTag.find( 'span[rel=' + btnData + ']' );

					liDivTag.css( 'background', 'url(' + btnJson.imageSrc + ')' );
					liSpanTag.text( btnJson.defaultLabel );
					btnTag = liTabTag;
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