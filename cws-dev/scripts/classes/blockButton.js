// -------------------------------------------
// -- BlockButton Class/Methods
function BlockButton( cwsRenderObj, blockObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
		
	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function() {}

	me.render = function( buttonsJson, blockTag, passedData )
	{
		if ( buttonsJson !== undefined )
		{
			var btnHolderTag;
			btnDivSecTag = $( '<div class="btnDivSec"></div>' );
			blockTag.append( btnDivSecTag );
			btnHolderTag = btnDivSecTag;


			// STEP 1. IF 'MAIN TAB' MODE, RENDER ALL THE TABS AND CONTENS (AND ANCHOR TABS AS WELL)
			if ( me.blockObj.blockType === FormUtil.blockType_MainTab )
			{
				// Main Tab Part
				var ulTagTag = $( '<ul class="tabs"></ul>' );
				btnDivSecTag.append( ulTagTag );
				//btnHolderTag = ulTagTag;

				// Add just one li & display - for content display later on.
				// btnDivSecTag.append( '<ul class="tab_content"><li class="active"><div class="content__wrapper"></div></li></ul>' );
				var ulContentTag = $( '<ul class="tab_content"></ul>' );
				btnDivSecTag.append( ulContentTag );


				// SETUP THE CONTENT...  (LAYOUT?)
				for( var i = 0; i < buttonsJson.length; i++ )
				{
					var tabNo = i + 1;
					
					var liTabTag = $( '<li tabId="' + tabNo + '"></li>' );
					var liContentTag = $( '<li tabId="' + tabNo + '" class="list-item" style="display: list-item"><a class="expandable"></a></li>' );

					ulTagTag.append( liTabTag );
					ulContentTag.append( liContentTag );
				}
			}
			else if ( me.blockObj.blockType === FormUtil.blockType_MainTabContent )
			{
				// Main Content Part
				btnHolderTag = blockTag.find( '.formDivSec' );
			}
			else
			{
				// Normal Block case..
				//console.log( 'Normal Block case..' );
			}


			// Main Render: block button tag generate
			for( var i = 0; i < buttonsJson.length; i++ )
			{
				me.renderBlockButton( i + 1, buttonsJson[i], btnHolderTag, passedData );
			}


			if ( me.blockObj.blockType === FormUtil.blockType_MainTab ) 
			{
				// Setup the tab click for opening tab content area
				FormUtil.setUpTabAnchorUI( btnHolderTag );	

				// Click on 1st/Last-Recorded tab.
				setTimeout( function() 
				{
					/* START > Edited by Greg: 2018/11/26 */
					/*var lastTab = FormUtil.getUserLastSelectedTab();

					if ( lastTab )
					{
						btnHolderTag.find( 'li' )[ lastTab-1 ].click();
					}
					else*/
					{
						btnHolderTag.find( 'li:first-child' ).click();
					}
					/* END > Edited by Greg: 2018/11/26 */

				}, 100 );

				//console.log( 'click 1st tab button' );
			}

		}
	}

	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.renderBlockButton = function( btnNo, btnData, divTag, passedData )
	{
		var btnJson = FormUtil.getObjFromDefinition( btnData, me.cwsRenderObj.configJson.definitionButtons );
		var btnTag = me.generateBtnTag( btnNo, btnJson, btnData, divTag );
			
		// this is not used on mainTab case..
		if ( me.blockObj.blockType !== FormUtil.blockType_MainTab ) 
		{
			me.setUpBtnClick( btnTag, btnJson, passedData );

			divTag.append( btnTag );	
		}
		else
		{
			// NOTE: 
			// In 'Tab'/'Anchor', there is 2 separate actions happending.
			// When 'Tab'/'Anchor' is clicked, the matching div of that tab is shown/switched.
			//   We can call that div as - tab_Content_Wrapper div.
			//	 This is setup by calling 'FormUtil.setUpTabAnchorUI'.
			// Another event is the click event handler that recreates the content.
			// Which is done by below.

			btnTag.click( function() {

				var liContentTag = divTag.find( 'ul.tab_content li[tabId="' + btnNo + '"]' );

				// Remove the existing/previous block render div.
				liContentTag.find( 'div.block' ).remove();

				me.renderBlockTabContent( liContentTag, btnJson.onClick );	

				//console.log( 'tab clicked - content block (re)created' );
			});
			

			// If 'MainTab' rendering, generate all the contents ahead.
			// var liContentTag = divTag.find( 'ul.tab_content li[tabId="' + btnNo + '"]' );
			// me.renderBlockTabContent( liContentTag, btnJson.onClick );		
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
					var liTabTag = divTag.find( 'ul.tabs li[tabId="' + btnNo + '"]' );
					var aContentTag = divTag.find( 'ul.tab_content li[tabId="' + btnNo + '"] a.expandable' );

					liTabTag.append( $('<img src="' + btnJson.imageSrc + '" class="tab-image"><label ' + FormUtil.getTermAttr( btnJson ) + '>' + btnJson.defaultLabel + '</label>' ) );
					aContentTag.append( $('<div class="icon-row"><img src="' + btnJson.imageSrc + '"><span ' + FormUtil.getTermAttr( btnJson ) + '>' + btnJson.defaultLabel + '</span></div>') );
					aContentTag.append( $('<div class="icon-arrow"><img class="expandable-arrow" src="images/arrow_down.svg"></div>') );

					// In 'li' vs 'anchor' click action sync, 'anchor' is the main one called - 'FormUtil.setUpTabAnchorUI( tag )'
					// Thus, set 'anchor' as the main tag..
					btnTag = aContentTag;
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
					btnTag = $( '<div ' + FormUtil.getTermAttr( btnJson ) + ' class="tb-content-buttom btn divBtn">' + btnJson.defaultLabel + '</div>' );
				}
				else
				{
					btnTag = $( '<button ' + FormUtil.getTermAttr( btnJson ) + ' ranid="' + Util.generateRandomId() + '" class="tb-content-buttom ' + btnJson.buttonType + '" btnNo="' + btnNo + '">' + btnJson.defaultLabel + '</button>' );
				}
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

					// TODO: ACTIVITY ADDING - Placed Activity Addition here - since we do not know which block is used vs displayed
					//	Until the button within block is used.. (We should limit to certain type of button to do this, actually.)
					ActivityUtil.addAsActivity( 'block', me.blockObj.blockJson, me.blockObj.blockId );

					// display 'loading' image in place of click-img (assuming content will be replaced by new block)
					if ( btnJson.buttonType === 'listRightImg' )
					{
						var loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading.gif"></div>' );
						btnTag.hide();
						btnTag.parent().append( loadingTag );
					} 

					me.blockObj.actionObj.handleClickActions( $( this ), btnJson.onClick );

				});
			}
			else if( btnJson.onClickItem !== undefined )
			{
				btnTag.click( function() 
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

						var loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading.gif"></div>' );
						btnTag.hide();
						btnTag.parent().append( loadingTag );
					} 

					var idx = $( this ).closest(".itemBlock").attr("idx");
					me.blockObj.actionObj.handleItemClickActions( $( this ), btnJson.onClickItem, idx );
					// , passedData ); <-- 'passedData' is not used anymore.
					//	It retrieves from DHIS/WebService (making retrieveByClientId call) (using clientId again..)

				});
			}
		}
	}


	me.renderBlockTabContent = function( liContentTag, onClick )
	{
		if ( onClick && onClick.length > 0 )
		{
			var actionJsonArr = FormUtil.convertNamedJsonArr( onClick, me.cwsRenderObj.configJson.definitionActions );
			var actionJson = Util.getFromList( actionJsonArr, 'openBlock', 'actionType' );

			if ( actionJson && actionJson.blockId !== undefined )
			{
				var blockJson = FormUtil.getObjFromDefinition( actionJson.blockId, me.cwsRenderObj.configJson.definitionBlocks );

				// Create the block and render it.
				var newBlockObj = new Block( me.cwsRenderObj, blockJson, actionJson.blockId, liContentTag, actionJson  );	
				newBlockObj.render();

				if ( actionJson.payloadConfig )
				{
					FormUtil.setPayloadConfig( newBlockObj, actionJson.payloadConfig, me.cwsRenderObj.configJson.definitionForms[ me.cwsRenderObj.configJson.definitionBlocks[ actionJson.blockId ].form ] );
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