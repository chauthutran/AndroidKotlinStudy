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
            var divFormContainerTag = $( '<div class="formDivSec">' ); // GREG: find existing class "formDivSec"
            blockTag.append( divFormContainerTag );

            var searchPostPayload =  FormUtil.getLastPayload() // JSON.parse( localStorage.getItem('lastPayload.posted') ).data;

            for( var i = 0; i < jsonList.length; i++ )
            {
                var itemAttrDataList = jsonList[i];
                var objResult = me.blockDataValidResultArray(itemDisplayAttrList, itemAttrDataList);

                if ( objResult.length )
                {
                    var tblObjTag = $( '<table style="width:100%;" id="searchResult_'+i+'">' );
                    var trTopObjTag = $( '<tr class="itemBlock">' );
                    var tdLeftobjTag = $( '<td>' );

                    divFormContainerTag.append( tblObjTag );
                    
                    tblObjTag.append( trTopObjTag );
                    trTopObjTag.append( tdLeftobjTag );

                    // add search criteria to results field list > what if search criteria already part of output specification?
                    for(var k in searchPostPayload) 
                    {
                        objResult.push ( { 'id': '', 'name': k, 'value': searchPostPayload[k] } );
                    }

                    //objResult.forEach( function(jsonData) {
                    for( var o = 0; o < objResult.length; o++ )
                    {
                        var divAttrTag = $( '<div class="tb-content-result inputDiv" />' );
                        var labelTag = $( '<label class="from-string titleDiv" />' );
                        var valueTag = $( '<div id="'+objResult[o].id+'" class="form-type-text">');

                        tdLeftobjTag.append( divAttrTag );
                        divAttrTag.append( labelTag );
                        divAttrTag.append( valueTag );

                        labelTag.html( objResult[o].name );
                        valueTag.html( objResult[o].value );

                        if ( objResult[o].id == '' ) //added from search criteria
                        {
                            labelTag.css('font-weight',"600");
                            valueTag.css('color','#909090');

                            //labelTag.css('color',"#8F5959");
                            //valueTag.css('color',"#612A2A");
                        }

                    };

                    var tdRightobjTag = $( '<td style="text-align:left;vertical-align:middle;width:50px;">' );
                    trTopObjTag.append( tdRightobjTag );

                    me.renderHiddenKeys( blockJson.keyList, itemAttrDataList, tdRightobjTag );
                    me.renderButtons( tdRightobjTag, blockJson.itemButtons );

                    if ( i < (jsonList.length - 1))
                    {
                        /* START > LINE SEPARATOR */
                        var trBottomObjTag = $( '<tr>' );
                        var tdBottomtobjTag = $( '<td colspan=2 style="padding:0 10px 0 10px;">' );
                        var divObjTag = $( '<div style="height:10px;width:100%;border-bottom:2px solid #808080" />' );

                        tblObjTag.append( trBottomObjTag );
                        trBottomObjTag.append( tdBottomtobjTag );
                        tdBottomtobjTag.append( divObjTag );
                        /* END > LINE SEPARATOR */
                    }

                    // Generate and append items
                    //me.renderIconTag( blockJson, itemAttrDataList, divItemTag );
                    //me.renderHiddenKeys( blockJson.keyList, itemAttrDataList, divItemTag );
                    //me.renderItemAttrs( itemDisplayAttrList, itemAttrDataList, divItemTag );
                    
                    // Generate Button - with click event
                    //me.renderButtons( divItemTag, blockJson.itemButtons );

                }
            }	
        }
    }

    me.blockDataValidResultArray = function( itemAttrList, searchResults )
    {

        /* ONLY return array pairs where payload contains expected UID fields */
        var validResults = [];

        for( var a = 0; a < itemAttrList.length; a++ )
        {
            for( var i = 0; i < searchResults.length; i++ )
            {
                if ( itemAttrList[a] == searchResults[i].id )
                {
                    if ( searchResults[i].value )
                    {   
                        validResults.push ( { 'id': itemAttrList[a], 'name': searchResults[i].displayName, 'value': searchResults[i].value } );
                    }
                }

            }
        }

        return validResults;

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
  
	// -------------------------------
	
	// me.initialize();
}