// -------------------------------------------
// -- BlockList Class/Methods
function DataList( cwsRenderObj, blockObj ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;
    me.blockJson;        
    me.itemDisplayAttrList = [];    // matches to block.displayResult <-- which lists which attr to display on html

    me.jsonListData;
	
	
	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================



	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function() // jsonListData, blockJson ) 
    {
        //me.jsonListData = jsonListData;
        //me.blockJson = blockJson;
    }

	// -----------------------------------

    me.renderList = function( blockJson, newBlockTag, jsonListData )
	{
        me.blockJson = blockJson;
        if ( blockJson.displayResult ) me.itemDisplayAttrList = blockJson.displayResult;

        me.jsonListData = jsonListData;
                
		if ( blockJson && blockJson.list === 'dataList' && jsonListData )
        {
            me.renderDataList( jsonListData.displayData, me.itemDisplayAttrList, newBlockTag, blockJson );	
            //me.dataList_Display( newBlockTag );
        }
	}

    /*
    me.dataList_Display = function( blockTag )
    {
        me.renderDataList( me.jsonListData.displayData, blockTag );	
    }
    */

    me.renderDataList = function( jsonList, itemDisplayAttrList, blockTag, blockJson )
    {    

        if ( jsonList === undefined || jsonList.length == 0 )
        {
            // Emmpty case
            var divTag = $( '<div class="emptyListDiv" style="min-height: 40px; margin: 10px;"></div>' );
        
            var spanTag = $( '<span style="color: #888; font-weight: bold;">List is empty.</span>' );

            divTag.append( spanTag );

            blockTag.append( divTag );
        }
        else
        {
  
            for( var i = 0; i < jsonList.length; i++ )
            {
                var itemAttrDataList = jsonList[i];

                if ( me.blockDataContainsKeyListValue(itemDisplayAttrList, itemAttrDataList) )
                {

                    var divItemTag = $( '<div class="inputDiv itemBlock" idx="' + i + '" style="border:1px solid #F5F5F5;"></div>' );
                    blockTag.append( divItemTag );

                    // Generate and append items
                    me.renderIconTag( itemAttrDataList, divItemTag );
                    me.renderHiddenKeys( blockJson.keyList, itemAttrDataList, divItemTag );
                    me.renderItemAttrs( itemDisplayAttrList, itemAttrDataList, divItemTag );
                    
                    // Generate Button - with click event
                    me.renderButtons( divItemTag, blockJson.itemButtons );

                }
            }	
        }
    }

    me.blockDataContainsKeyListValue = function( itemAttrList, searchResults )
    {
        /* ONLY display results where any part of the resulting payload contains compliant/expected result data */
        var iMatch = 0;

        for( var a = 0; a < itemAttrList.length; a++ )
        {
            for( var i = 0; i < searchResults.length; i++ )
            {
                if ( itemAttrList[a] == searchResults[i].id )
                {
                    return true;
                }

            }
        }

    }

    me.renderHiddenKeys = function( keyList, itemAttrDataList, divItemTag )
    {
        if ( keyList )
        {
            for( var i = 0; i < keyList.length; i++ )
            {
                var keyId = keyList[i];
                var itemData = Util.getFromList( itemAttrDataList, keyId, "id" );

                if ( itemData )
                {
                    var containerDivTag = $( '<div></div>' );
                    divItemTag.append( containerDivTag );

                    itemData.defaultValue = itemData.value;
                    itemData.display = 'hiddenVal';
                    
                    FormUtil.renderInputTag( itemData, containerDivTag );    
                }
            }
        }
    }

    me.renderItemAttrs = function ( displayAttrList, itemAttrDataList, divItemTag )
    {        
        for( var i = 0; i < displayAttrList.length; i++ )
        {
            var attrId = displayAttrList[i];
            var attrData = Util.getFromList( itemAttrDataList, attrId, "id" );

            if ( attrData ) me.renderDataValueTag( attrData, divItemTag );
        }
    }
    
    me.renderButtons = function( divItemTag, itemButtons )
    {
        if ( itemButtons )
        {
            var newItemBtn = new BlockButton(  me.cwsRenderObj, me.blockObj );

            newItemBtn.renderBlockButtons( itemButtons, divItemTag );

            //me.blockObj.blockButtonObj.renderBlockButtons( itemButtons, divItemTag );//, itemData );
        } 
    }

    me.renderDataValueTag = function( attrData, divItemTag )
    {    
        // Set Text..
        //var spanDivTag = $( '<div> ' + attrData.displayName + " : <b>" + attrData.value + '</b></div>' );
        var spanDivTag = $( '<div style="margin:0 0 0 14px">' + attrData.displayName + ": <b>" + attrData.value + '</b></div>' );
        //var spanDivTag = $( '<div style="margin:0 0 0 45px"> ' + attrData.value + '</div>' );
        divItemTag.append( spanDivTag );
    }

    me.convertData = function( jsonList, idx )
    {
        var converted = {};
        converted.resultData = JSON.parse( JSON.stringify( jsonList.resultData ) );
        converted.displayData = JSON.parse( JSON.stringify( jsonList.displayData[idx] ) );
        return converted;
    }
  
    me.renderIconTag = function( valueData, parentItemTag )
    {
        var lastData = localStorage.getItem( 'lastPayload.posted' ); //added by Greg (2018/12/05)
        var labelText;

        if ( lastData )
        {
            labelText = JSON.parse(lastData).data.phoneNumber;
        }
        else if ( valueData.length )
        {
            labelText = valueData[0].value;
        }

        // Set Icons..
        //var iconListTag = $( '<div class="icons-status" style="padding:2px;width:100%;"> <img src="img/mobile.svg" style="-webkit-filter: contrast(60%);filter: contrast(60%);"> <span style="font-size:11pt;"> ' + labelText +' </span> </div>' );
        var iconListTag = $( '<div class="icons-status" style="padding:2px;width:100%;"> <strong style="font-size:11pt;"> ' + labelText +' </strong> </div>' );
        parentItemTag.append( iconListTag );
    }
  
	// -------------------------------
	
	// me.initialize();
}