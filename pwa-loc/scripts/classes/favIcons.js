// -------------------------------------------
// -- FavIconList Class/Methods
function FavIcons( favType, targetBlockTag, targetBlockContainerTag, options )
{
    var me = this;

    // NEW 1: Take in param as paranetTag, favName
    me.favType = favType;
    me.targetBlockTag = targetBlockTag;
    me.targetBlockContainerTag = targetBlockContainerTag;
    me.options = options;

    me.mainFavClickPre;
    me.mainFavClickPost;

    // ---------------
    me.favIconsTag;
    me.favMainButtonTag;
    me.favReRenderTag;

    // --------------
    me.favListByType;

    // ========================================

    // TODO: ORGANIZE THE METHODS..

    // ========================================

    me.initialize = function() 
    {
        // 1. Create FavIcons Tag 
        me.favIconsTag = $( FavIcons.favButtonContainer );
        me.favReRenderTag = me.favIconsTag.find( 'div.favReRender' );
        me.favMainButtonTag = me.favIconsTag.find( 'div.fab' );

        if ( me.options )
        {
            me.mainFavClickPre = me.options.mainFavClickPre;
            me.mainFavClickPost = me.options.mainFavClickPost;

            if ( me.options.favMainIcon )
            {
                me.favMainButtonTag.find( 'svg' ).remove();
                me.favMainButtonTag.html( '<img src="'+ me.options.favMainIcon + '" style="width:36px; height:36px; margin: 10px 0px 0px 10px;">' );
            }
        }

        me.targetBlockTag.append( me.favIconsTag );
        
        // 2. Events Setup
        me.setFavMainClickEvent( me.favMainButtonTag, me.favIconsTag ); //  Default '+' button event..
        me.setReRenderClickEvent( me.favReRenderTag );

        // 3. Set favList by type
        me.favListByType = FavIcons.getFavListByType( me.favType );

        // 4. Initially, hide this tag, and show it on 'render()'
        me.favIconsTag.hide();
    }

    // -----------------------------------------    

    // Fav Main + button click events
    me.setFavMainClickEvent = function( favMainButtonTag, favIconsTag )
    {
        favMainButtonTag.click( function(e)
        {
            e.stopPropagation(); // other events are canceled..

            var thisTag = $( this );
            var favItemsTag = favIconsTag.find( '.fab__child-section' );

            if ( thisTag.hasClass( 'c_600' ) )
            {
                // Show Fav List
                favItemsTag.css( 'display', 'table-row' );
                thisTag.addClass( 'w_button' ).removeClass( 'c_600' ).css( 'transform', 'rotate(45deg)' );

                FormUtil.setUpHideOnBodyClick( function() {
                    favItemsTag.css( 'display', 'none' );
                    thisTag.removeClass( 'w_button' ).addClass( 'c_600' ).css( 'transform', 'rotate(0deg)' );
                });		
            }
            else
            {
                // Hide Fav List
                favItemsTag.css( 'display', 'none' );
                thisTag.removeClass( 'w_button' ).addClass( 'c_600' ).css( 'transform', 'rotate(0deg)' );
            }
        });
    };

    me.isFavMainButtonOpen = function()
    {
        return me.favMainButtonTag.hasClass( 'w_button' );
    };

    me.closeFavMainButton = function()
    {
        if ( me.isFavMainButtonOpen() ) me.favMainButtonTag.click();
    };

    me.setReRenderClickEvent = function( favReRenderTag )
    {
        favReRenderTag.click( function () 
        {
            me.render();
        });
    };

    // -----------------------------------------

    // NEW 2: Clear /Reset existing list
    // NEW 3: Depending on online/offline, relist the 'favList' selections.
    me.render = function() 
    {        
        var favListArr = []; // 'render' return the final favList (after eval filtering + on/offline consideration)

        try
        {              
            if ( me.favListByType )
            {
                me.favIconsTag.show();

                if ( me.favListByType.mainButtonMode )
                {
                    // 1. Get favListArr from online status
                    var favMainBtnJson;
                    if ( ConnManagerNew.isAppMode_Online() ) favMainBtnJson = me.favListByType.mainButtonMode.online;
                    else favMainBtnJson = me.favListByType.mainButtonMode.offline;
    
                    // 2. Click event
                    me.setFavItemClickEvent( me.favMainButtonTag, favMainBtnJson, me.targetBlockTag, me.targetBlockContainerTag, function( favJson ) {
                        if ( favJson.mainFavRemove ) me.favMainButtonTag.remove();
                    });
                }
                else
                {
                    // 1. Clear any previous generated item
                    me.clearExistingFavItems( me.favIconsTag );
                    me.closeFavMainButton();
    
    
                    // 2. Get favListArr from online status
                    if ( ConnManagerNew.isAppMode_Online() ) favListArr = me.filterFavListByEvalActions( me.favListByType.online, me.favListByType.evalActions_online );
                    else favListArr = me.filterFavListByEvalActions( me.favListByType.offline, me.favListByType.evalActions_offline );
    
    
                    // 3. favItems populate
                    me.populateFavItems( favListArr, me.favIconsTag, me.targetBlockTag, me.targetBlockContainerTag );
    
    
                    // 4. Translate the favItem terms
                    TranslationManager.translatePage();
                }
            }
        }
        catch( errMsg )
        {
            console.log( 'ERROR in FavIcons.render, ' + errMsg );
            MsgManager.msgAreaShowErr( 'ERROR in FavIcons.render, ' + errMsg );
        }

        return favListArr;
    };

    // ---------------------------------------


    me.filterFavListByEvalActions = function( refFavListArr, evalActions )
    {
        var filteredFavListArr = [];
        var favIdsObj = {};  // Unique Fav Id List Store.

        if ( refFavListArr )
        {
            if ( evalActions )
            {
                // 1. Get FavId array to 'favIdsObj'
                evalActions.forEach( evalAction => 
                {
                    var evalActionJson = FormUtil.getObjFromDefinition( evalAction, ConfigManager.getConfigJson().definitionEvalActions );

                    me.performEvalAction( evalActionJson, favIdsObj );
                }); 


                // 2. Add the actual fav object from id, FOLLOW THE original list order..  
                refFavListArr.forEach( favItem => 
                {
                    if ( favItem.id && favIdsObj[ favItem.id ] === true )
                    {
                        filteredFavListArr.push( favItem );
                    }
                });
            }
            else
            {
                filteredFavListArr = refFavListArr;
            }	
        }

        return filteredFavListArr;
    };

	me.performEvalAction = function( evalAction, favIdsObj )
	{
		if ( evalAction && ConfigManager.checkByCountryFilter( evalAction.countryFilter ) )
		{			
			// If condition does not exist, it is considered as pass/true.
			// If it exists, check eval to see if condition evaluates as true.
			if ( evalAction.condition === undefined || me.checkCondition( evalAction.condition ) === true )
			{
                // MORE LIKE me.performAdd/Remove..
				me.performCondiShowHide( evalAction.shows, favIdsObj, true );
				me.performCondiShowHide( evalAction.hides, favIdsObj, false );
				//me.performCondiAction( evalAction.actions, false );

				if ( evalAction.optionsChange ) me.evalActions_optionsChange( evalAction.optionsChange, formDivSecTag );
				if ( evalAction.runEval ) 
				{
                    var runEvalStr;
					try {		
						runEvalStr = Util.getEvalStr( evalAction.runEval );  // Handle array into string joining
						if ( runEvalStr ) returnVal = eval( runEvalStr );				
					} catch( errMsg ) { 
                        console.log( 'FavIcons.performEvalAction, runEval err: ' + errMsg + ', runEvalStr: ' + runEvalStr ); 
                    }
				}
			}
			else
			{
				// If not true condition, run 'conditionInverse' (if it exists)
				if ( evalAction.conditionInverse !== undefined )
				{
					if ( evalAction.conditionInverse.indexOf( "shows" ) >= 0 ) me.performCondiShowHide( evalAction.shows, favIdsObj, false );
					if ( evalAction.conditionInverse.indexOf( "hides" ) >= 0 ) me.performCondiShowHide( evalAction.hides, favIdsObj, true );
				}		
			}            
		}
	};

	me.checkCondition = function( evalCondition )
	{
		var result = false;

		try
		{
			// Handle array into string joining
			evalCondition = Util.getEvalStr( evalCondition );

			if ( evalCondition )
			{
				result = eval( evalCondition );	
			}
		}
		catch( errMsg ) 
		{
			console.log( 'ERROR in favIcons.checkCondition, ' + errMsg );
		}

		return result;
	};


	me.performCondiShowHide = function( idList, favIdsObj, visible )
	{
        try
        {
            if ( idList )
            {
                for ( var i = 0; i < idList.length; i++ )
                {
                    var idStr = idList[i];

                    if ( visible ) favIdsObj[ idStr ] = true;
                    else delete favIdsObj[ idStr ];
                }
            }    
        }
        catch ( errMsg ) { console.log( 'ERROR in FavIcons.performCondiShowHide, ' + errMsg ); }
	};


    // ---------------------------------------


    me.clearExistingFavItems = function( favIconsTag )
    {
        favIconsTag.find( 'div.fab__child-section' ).remove();
    };
    
    // -------------------------------------------
    // ---- POPULATE FAV ITEMS RELATED
    me.populateFavItems = function( favItems, favIconsTag, targetBlockTag, targetBlockContainerTag )
    {
        if ( favItems )
        {
            var favButtonSectionTag = favIconsTag.find( '.fab__section' );

            favItems.forEach( favItem => 
            {
                // NEW: If 'hideInFavList': true ( displayType': 'notInFav' ) in def, do not render here..
                //      - For displaying the fav in 'schedule' convert only. 
                if ( favItem.hideInFavList ) {
                    console.log( 'hide in favList detected' );
                }
                else
                {
                    // 1. FavItem Tag from template
                    var favItemTag = $( FavIcons.favButtonRowItem );
                    favItemTag.insertBefore( favButtonSectionTag );
                    
                    // 2. Click event
                    me.setFavItemClickEvent( favItemTag, favItem, targetBlockTag, targetBlockContainerTag, function() {
                        me.closeFavMainButton();
                    });
                    //{ 'closeFavMainBtn': true } );

                    // 3. populate the favItem content
                    me.populateFavItemDetail( favItemTag, favItem );
                }
            });
        }
    };


    me.setFavItemClickEvent = function( favItemTag, favItem, targetBlockTag, targetBlockContainerTag, runFunc )
    {
        favItemTag.off( 'click' ).click( function() 
        {
            if ( favItem )
            {
                if ( me.mainFavClickPre ) me.mainFavClickPre( targetBlockTag, targetBlockContainerTag );
            
                if ( runFunc ) runFunc( favItem );

                if ( favItem.target )
                {
                    //SessionManager.cwsRenderObj.setAppTitle( favItem.target.blockId, favItem.name, favItem.term );
                    SessionManager.cwsRenderObj.renderFavItemBlock( favItem.target.blockId, favItem.target.options
                        ,targetBlockContainerTag, favItem );
                        
                    if ( me.mainFavClickPost ) me.mainFavClickPost( targetBlockTag, targetBlockContainerTag );
                }
                else if ( favItem.onClick )
                {
                    var actionObj = new Action( SessionManager.cwsRenderObj, {} );
                    actionObj.handleClickActionsAlt( favItem.onClick, targetBlockTag, targetBlockContainerTag );

                    if ( me.mainFavClickPost ) me.mainFavClickPost( targetBlockTag, targetBlockContainerTag );
                }
            }
        });
    };


    me.populateFavItemDetail = function( favItemTag, favItem )
    {
        var svgIconTag = favItemTag.find( 'div.svgIcon' ); // fab__child c_200 
        var contentTag = favItemTag.find( '.fab__child-text' );
        var activityTypeDef = ( favItem.activityType ) ? FavIcons.getActivityTypeByRef( 'name', favItem.activityType ) : undefined;

        favItemTag.attr( 'favId', favItem.id ); 
        favItemTag.attr( 'favName', favItem.name ); 

        contentTag.attr( 'term', favItem.term );        
        contentTag.attr( 'displayName', favItem.name );

        if ( favItem.target )
        {
            contentTag.attr( 'blockId', favItem.target.blockId );
            contentTag.attr( 'actionType', favItem.target.actionType );    
        }

        contentTag.html( favItem.name );

        // svg icon setup - if available (by local file path reference)
        FavIcons.generateSvgIconFromPath( favItem, activityTypeDef, svgIconTag );        
        //svgIconTag.css( 'background-color', 'transparent' ); // SHOULD ALWAYS BE TRANSPARENT, RIGHT?
    };
    
    // ------------------------------------

	me.initialize();
}


// -------------------------------------------------

FavIcons.favButtonContainer = `<div class="fab-wrapper">
    <div class="fab__section">
        <div class="fab c_600" style="transform: rotate(0deg);">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M35 27H29V21H27V27H21V29H27V35H29V29H35V27V27Z" class="c_600"></path>
            </svg>
        </div>
    </div>
    <div class="favReRender" style="float: left; width: 1px; height: 1px;"></div>
</div> `;

FavIcons.favButtonRowItem = `<div class="fab__child-section">
    <div class="fab__child c_200 svgIcon" style="background-color: transparent;" />
    <div class="fab__child-text" />
</div>`;

// -------------------------------------------------

FavIcons.favIconSize = '40px';

FavIcons.generateSvgIconFromPath = function( favItem, activityTypeDef, svgIconTag )
{
    var svgPathStr;
    if ( activityTypeDef && activityTypeDef.icon ) svgPathStr = activityTypeDef.icon.path;
    else if ( favItem.img ) svgPathStr = favItem.img;

    if ( svgPathStr )
    {
        try 
        {
            svgIconTag.each( function() 
            {
                var iconDivTag = $( this );

                if ( iconDivTag.find( 'img' ).length === 0 )
                {
                    iconDivTag.html( '<img src="'+ svgPathStr + '" style="width:' + FavIcons.favIconSize + '; height:' + FavIcons.favIconSize + ';">' );
                }
            });
        }
        catch ( errMsg )
        {
            console.log( 'Error on FavIcons.generateSvgIconFromPath, errMsg: ' + errMsg );
        }
    }
};


FavIcons.getActivityTypeByRef = function( prop, activityType )
{
    var activityTypeStyle;

    try
    {
        if ( activityType )
        {
            var itemList = ConfigManager.getActivityDef().activityTypes; 
            
            var styleInfo = Util.getFromList( itemList, activityType, prop );

            if ( styleInfo ) activityTypeStyle = Util.cloneJson( styleInfo );
        }    
    }
    catch( errMsg ) {
        console.log( 'ERROR in FavIcons.getActivityTypeByRef, activityType: ' + activityType + ', ' + errMsg );
    }
    
    return activityTypeStyle;
};


FavIcons.populateFavItemIcon = function( favItemTag, favItemJson )
{
    var activityTypeDef = ( favItemJson.activityType ) ? FavIcons.getActivityTypeByRef( 'name', favItemJson.activityType ) : undefined;

    favItemTag.attr( 'title', TranslationManager.translateText( favItemJson.name, favItemJson.term ) );
    favItemTag.attr( 'favId', favItemJson.id ); 
    favItemTag.attr( 'favName', favItemJson.name );

    // svg icon setup - if available (by local file path reference)
    FavIcons.generateSvgIconFromPath( favItemJson, activityTypeDef, favItemTag );        
};


FavIcons.getFavListByType = function( favType )
{
    var favList = ConfigManager.getConfigJson().favList;

    // 'favType': 'activityListFav', 'clientListFav', 'clientActivityFav', 'clientRelFav'
    if ( favList && favType && favList[ favType ] ) return favList[ favType ]
    else
    {
        // Could be simple type, which we should return entire one..
        // If the 'favList' is not simple type, return undefined..
        if ( favList.online || favList.offline ) return favList;
        else return undefined;
    }
};


FavIcons.getFavItemJson = function( favType, favItemId )
{
    var favItemJson;

    var favListByType = FavIcons.getFavListByType( favType ); //'clientActivityFav' );

    var favListArr = ( ConnManagerNew.isAppMode_Online() ) ? favListByType.online: favListByType.offline;

    favItemJson = Util.getFromList( favListArr, favItemId, "id" );

    return favItemJson;
};


// A bit simplified version of 'me.setFavItemClickEvent'
FavIcons.setFavItemClickEvent = function( favItemTag, favItem, targetBlockTag, targetBlockContainerTag, beforeRunFunc, afterRunFunc )
{
    favItemTag.off( 'click' ).click( function() 
    {
        if ( favItem )
        {
            //if ( me.mainFavClickPre ) me.mainFavClickPre( targetBlockTag, targetBlockContainerTag );
        
            if ( beforeRunFunc ) beforeRunFunc( favItem );

            if ( favItem.target )
            {
                //SessionManager.cwsRenderObj.setAppTitle( favItem.target.blockId, favItem.name, favItem.term );
                var blockObj = SessionManager.cwsRenderObj.renderFavItemBlock( favItem.target.blockId, favItem.target.options
                    ,targetBlockContainerTag, favItem );

                //var renderedBlockId = ( blockObj && blockObj.blockId ) ? blockObj.blockId : undefined;
                if ( afterRunFunc ) afterRunFunc( INFO.lastRenderedBlockId );
            }
            else if ( favItem.onClick )
            {
                var actionObj = new Action( SessionManager.cwsRenderObj, {} );
                actionObj.handleClickActionsAlt( favItem.onClick, targetBlockTag, targetBlockContainerTag, function( resultStr ) 
                {
                    if ( resultStr === "Success" )                    
                    {
                        if ( afterRunFunc ) afterRunFunc( INFO.lastRenderedBlockId );                        
                    }
                });
            }    
        }
    });
};
