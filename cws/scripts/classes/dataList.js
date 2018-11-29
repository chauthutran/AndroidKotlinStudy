// -------------------------------------------
// -- BlockList Class/Methods
function DataList( cwsRenderObj, blockObj ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;
    me.blockJson;        

    me.jsonListData;
	
	
	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================



	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function( jsonListData, blockJson ) 
    {
        me.jsonListData = jsonListData;
        me.blockJson = blockJson;
    }

	// -----------------------------------

    me.renderList = function( list, newBlockTag )
	{
		if ( list !== undefined )
		{
			if ( typeof list === 'string' ) 
			{
				if ( list === 'dataList' )
				{
					me.dataList_Display( newBlockTag );
				}
			}
		}
	}

    me.dataList_Display = function( blockTag )
    {
        me.renderDataList( me.jsonListData.displayData, blockTag );	
    }
    

    me.renderDataList = function( jsonList, blockTag )
    {    
        if ( jsonList === undefined || jsonList.length == 0 )
        {
            var divTag = $( '<div class="emptyListDiv" style="min-height: 40px; margin: 10px;"></div>' );
        
            var spanTag = $( '<span style="color: #888; font-weight: bold;">List is empty.</span>' );

            divTag.append( spanTag );

            blockTag.append( divTag );
        }
        else
        {
            for( var i = 0; i < jsonList.length; i++ )
            {
                 var divItemTag = $( '<div class="inputDiv itemBlock" idx="' + i + '"></div>' );
                 blockTag.append( divItemTag );
                 me.renderItemTag( jsonList[i], divItemTag );

                 var itemData = me.convertData( me.jsonListData, i );
console.log( ' ---- START : ' +  me.blockJson.displayResult ) ;
                 me.renderButtons( itemData, divItemTag );
console.log( ' END : ' +  me.blockJson.displayResult ) ;
            }	
        }
    }

    me.renderItemTag = function ( itemData, divItemTag )
    {
        console.log( me.blockJson.displayResult );
        for( var i = 0; i< me.blockJson.displayResult.length; i++ )
        {
            for( var j = 0; j < itemData.length; j++ )
            {
                if( itemData[j].id === me.blockJson.displayResult[i] )
                {
                    me.renderDataValueTag( itemData[j], divItemTag );
                }
            }  
        }
    }
    
    me.renderButtons = function( itemData, blockTag )
    {
        me.blockObj.blockButtonObj.renderBlockButtons( me.blockJson.itemButtons, blockTag, itemData );
    }

    me.renderDataValueTag = function( valueData, divItemTag )
    {    
        // Set Text..
        var spanDivTag = $( '<div> ' + valueData.displayName + " : <b>" + valueData.value + '</b></div>' );
        divItemTag.append( spanDivTag );
    }

    me.convertData = function( jsonList, idx )
    {
        var converted = {};
        converted.resultData = JSON.parse( JSON.stringify( jsonList.resultData ) );
        converted.displayData = JSON.parse( JSON.stringify( jsonList.displayData[idx] ) );
        return converted;
    }
    
	// -------------------------------
	
	// me.initialize();
}