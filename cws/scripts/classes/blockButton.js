// -------------------------------------------
// -- BlockButton Class/Methods
function BlockButton( cwsRenderObj, blockObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
		
	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function() {}

	// -----------------------------------
	me.renderBlockButtons = function( buttonsJson, blockTag, passedData )
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
					var liContentTag = $( '<li tabId="' + tabNo + '"><a class="expandable"></a></li>' );

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
				console.log( 'Normal Block case..' );
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
					var lastTab = FormUtil.getUserLastSelectedTab();

					if ( lastTab )
					{
						btnHolderTag.find( 'li' )[ lastTab-1 ].click();
					}
					else
					{
						btnHolderTag.find( 'li:first-child' ).click();
					}
					/* END > Edited by Greg: 2018/11/26 */

				}, 100 );

				//console.log( 'click 1st tab button' );
			}

		}
	}
	
	// -----------------------------------
	// ---- 2nd level methods -----------

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

				console.log( 'tab clicked - content block (re)created' );
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
					btnTag = $( '<div style="padding:14px;" class=""><input type="radio" class="stayLoggedIn" style="width: 1.4em; height: 1.4em;"><span style="vertical-align: top; margin-left: 5px; ">'+btnJson.defaultLabel+'</span></div>' );
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

					liTabTag.append( $('<img src="' + btnJson.imageSrc + '" class="tab-image"><label>' + btnJson.defaultLabel + '</label>' ) );
					aContentTag.append( $('<div class="icon-row"><img src="' + btnJson.imageSrc + '">' + btnJson.defaultLabel + '</div>') );
					aContentTag.append( $('<div class="icon-arrow"><img class="expandable-arrow" src="img/arrow_down.svg"></div>') );

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
					btnTag = $( '<div class="tb-content-buttom btn divBtn">' + btnJson.defaultLabel + '</div>' );
				}
				else
				{
					btnTag = $( '<button ranid="' + Util.generateRandomId() + '" class="tb-content-buttom ' + btnJson.buttonType + '" btnNo="' + btnNo + '">' + btnJson.defaultLabel + '</button>' );
				}
			}
			else if ( btnJson.buttonType === 'listRightImg' )
			{
				console.log( 'btnJson.buttonType === listRightImg' );
				
				console.log( btnJson );

				// NOTE: THIS IS ONLY USED ON LIST VIEW
				// FOR NOW, LET's find the div tag of this '

				btnTag = $( '<img src="' + btnJson.img + '" style="cursor: pointer;" ranid="' + Util.generateRandomId() + '" class="rotate90 btnType ' + btnJson.buttonType + '" btnNo="' + btnNo + '">' );
				//btnTag = $( '<img src="' + btnJson.img + '" class="rotate90 ' + btnJson.buttonType + '" style="cursor: pointer;">' );

				//btnJson.img": "favbar_arrows.svg",
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
				btnTag.click( function() {

					me.blockObj.actionObj.handleClickActions( $( this ), btnJson.onClick );
	
					console.log( 'button click handler created' );
				});
			}
			else if( btnJson.onClickItem !== undefined )
			{
				btnTag.click( function() {

					var idx = $( this ).closest(".itemBlock").attr("idx");
					
					me.blockObj.actionObj.handleItemClickActions( $( this ), btnJson.onClickItem, idx, passedData );
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
				
				// TODO: Since this is 'Tab' content, we should remove the previous same content div
				// We could keep the block in this 'blockButton' object
				// and create 'delete' method that deletes object as well as hides the area
	
				// Create the block and render it.
				var newBlockObj = new Block( me.cwsRenderObj, blockJson, actionJson.blockId, liContentTag );	
				newBlockObj.renderBlock();
			}
		}
	}

	// -------------------------------
	
	me.initialize();
}