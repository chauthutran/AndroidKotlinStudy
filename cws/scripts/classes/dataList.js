// -------------------------------------------
// -- DataList Class/Methods
// -- (Web Service) Returned data list rendering as list..
function DataList( cwsRenderObj, blockObj ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;
    me.blockJson;        
    me.itemDisplayAttrList = [];    // matches to block.displayResult <-- which lists which attr to display on html

    me.jsonListData;
	
	me.debugMode = true;
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

    me.render = function( blockJson, newBlockTag, jsonListData )
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
        if ( me.debugMode ) console.log( jsonList );
        if ( jsonList === undefined || jsonList.length == 0 )
        {
            // Emmpty case
            var divTag = $( '<div class="emptyListDiv" style="min-height: 40px; margin: 10px;"></div>' );
            var spanTag = $( '<a style="min-height: 60px; padding: 10px; color: #888;" term="">List is empty.</a>' );

            divTag.append( spanTag );
            blockTag.append( divTag );
        }
        else
        {
            var divFormContainerTag = $( '<div class="formDivSec">' ); // GREG: find existing class "formDivSec"
            blockTag.append( divFormContainerTag );

            if ( me.blockJson.groupBy && me.blockJson.groupBy.length )
            {
                //jsonList.sort
                if ( me.debugMode ) console.log( me.blockJson.groupBy );

                var lookup = {};
                var result = [];
                var filter = [];

                for( var i = 0; i < jsonList.length; i++ )
                {
                    for( var p = 0; p < jsonList[ i ].length; p++ )
                    {
                        if ( jsonList[ i ][ p ].id == me.blockJson.groupBy[0] )
                        {
                            var unqVal = jsonList[ i ][ p ].value;
                            if (! result.includes( unqVal ) ) 
                            {
                                if ( lookup[unqVal] == undefined) lookup[unqVal] = 1;
                                else lookup[unqVal] += 1;
                                result.push( unqVal );
                                filter.push( { "id": me.blockJson.groupBy[0], "value": unqVal } );
                            }
                        }
                    }
                }

                if ( me.debugMode ) console.log( lookup );
                if ( me.debugMode ) console.log( result );
                if ( me.debugMode ) console.log( filter );

                result.sort();

                for( var r = 0; r < result.length; r++ )
                {
                    var tblSort = $( '<table class="groupBysortTable" >' );
                    var trSort = $( '<tr>' );
                    var tdSort = $( '<td colspan=2>' );
    
                    tdSort.html( '<span>' + me.resolvedefinitionField( { "id": me.blockJson.groupBy[0], "name": me.blockJson.groupBy[0] } ) + '</span> &gt; <strong class="groupByFieldName">' + me.resolvedefinitionOptionValue( result[ r ] ) + '</strong>' );
                    tdSort.attr( 'title', me.blockJson.groupBy[0] );
    
                    divFormContainerTag.append( tblSort );
                    tblSort.append( trSort );
                    trSort.append( tdSort );
    
                    me.renderDataListGroupBy( divFormContainerTag, itemDisplayAttrList, me.blockJson.groupBy[0], result[ r ], jsonList, blockJson )
                }


            }
            else
            {

                var searchPostPayload = FormUtil.getLastPayload(); 

                for( var i = 0; i < jsonList.length; i++ )
                {
                    var itemAttrDataList = jsonList[i];
                    var objResult = me.blockDataValidResultArray(itemDisplayAttrList, itemAttrDataList);
                    var validResultData = objResult.length;

                    var tblObjTag = $( '<table class="searchResultTable" id="searchResult_'+i+'">' );
                    var trTopObjTag = $( '<tr class="itemBlock">' );
                    var tdLeftobjTag = $( '<td>' );

                    divFormContainerTag.append( tblObjTag );
                    tblObjTag.append( trTopObjTag );
                    trTopObjTag.append( tdLeftobjTag );

                    if ( !validResultData )
                    {
                        var divAttrTag = $( '<div class="tb-content-result inputDiv" />' );
                        var labelTag = $( '<label class="from-string titleDiv" />' );
                        var valueTag = $( '<div class="form-type-text">');

                        tdLeftobjTag.append( divAttrTag );
                        divAttrTag.append( labelTag );
                        divAttrTag.append( valueTag );

                        labelTag.html( 'dcd Config issue' );
                        valueTag.html( 'no valid IDs for "displayResult":[]' );
                    }
                    else
                    {

                        // add search criteria to results field list > what if search criteria already part of output specification?
                        for(var k in searchPostPayload) 
                        {
                            objResult.push ( { 'id': '', 'name': k, 'value': searchPostPayload[k] } );
                        }

                        for( var o = 0; o < objResult.length; o++ )
                        {
                            var divAttrTag = $( '<div class="tb-content-result inputDiv" />' );
                            var labelTag = $( '<label class="from-string titleDiv" />' );
                            var valueTag = $( '<div id="'+objResult[o].id+'" class="form-type-text">');

                            tdLeftobjTag.append( divAttrTag );
                            divAttrTag.append( labelTag );
                            divAttrTag.append( valueTag );

                            labelTag.html( me.resolvedefinitionField( objResult[o] ) );
                            valueTag.html( me.resolvedefinitionOptionValue( objResult[o].value ) );

                            if ( objResult[o].id == '' ) //added from search criteria
                            {
                                //labelTag.css('font-weight',"600");
                                valueTag.css('color','#909090');

                                //labelTag.css('color',"#8F5959");
                                //valueTag.css('color',"#612A2A");
                            }

                        };

                        var tdRightobjTag = $( '<td style="text-align:left;vertical-align:middle;width:40px;">' );
                        trTopObjTag.append( tdRightobjTag );

                        me.renderHiddenKeys( blockJson.keyList, itemAttrDataList, tdRightobjTag );
                        me.renderButtons( tdRightobjTag, blockJson.itemButtons );

                        /*if ( i < (jsonList.length - 1))
                        {
                            / START > LINE SEPARATOR /
                            var trBottomObjTag = $( '<tr>' );
                            var tdBottomtobjTag = $( '<td colspan=2 style="padding:0 10px 0 10px;">' );
                            var divObjTag = $( '<div style="height:10px;width:100%;border-bottom:2px solid #808080" />' );

                            tblObjTag.append( trBottomObjTag );
                            trBottomObjTag.append( tdBottomtobjTag );
                            tdBottomtobjTag.append( divObjTag );
                            / END > LINE SEPARATOR /
                        }*/

                    }
                }
            }
        }
    }

    me.renderDataListGroupBy = function( divFormContainerTag, itemDisplayAttrList, fieldId, lookupVal, jsonList, blockJson )
    {
        var searchPostPayload = FormUtil.getLastPayload();

        for( var i = 0; i < jsonList.length; i++ )
        {
            var itemAttrDataFiltered = ( jsonList[i] ).filter(a=>a.id==fieldId&&a.value==lookupVal);

            if ( itemAttrDataFiltered.length )
            {
                var itemAttrDataList = ( jsonList[i] );
                var objResult = me.blockDataValidResultArray(itemDisplayAttrList, itemAttrDataList);
                var validResultData = objResult.length;

                var tblObjTag = $( '<table style="width:100%;border-bottom: 10px solid #F5F5F5;" id="searchResult_'+i+'">' );
                var trTopObjTag = $( '<tr class="itemBlock">' );
                var tdLeftobjTag = $( '<td>' );

                divFormContainerTag.append( tblObjTag );
                tblObjTag.append( trTopObjTag );
                trTopObjTag.append( tdLeftobjTag );

                if ( !validResultData )
                {
                    var divAttrTag = $( '<div class="tb-content-result inputDiv" />' );
                    var labelTag = $( '<label class="from-string titleDiv" />' );
                    var valueTag = $( '<div class="form-type-text">');

                    tdLeftobjTag.append( divAttrTag );
                    divAttrTag.append( labelTag );
                    divAttrTag.append( valueTag );

                    labelTag.html( 'dcd Config issue' );
                    valueTag.html( 'no valid IDs for "displayResult":[]' );
                }
                else
                {

                    // add search criteria to results field list > what if search criteria already part of output specification?
                    for(var k in searchPostPayload) 
                    {
                        objResult.push ( { 'id': '', 'name': k, 'value': searchPostPayload[k] } );
                    }

                    for( var o = 0; o < objResult.length; o++ )
                    {
                        var divAttrTag = $( '<div class="tb-content-result inputDiv" />' );
                        var labelTag = $( '<label class="from-string titleDiv" />' );
                        var valueTag = $( '<div id="'+objResult[o].id+'" class="form-type-text">');

                        tdLeftobjTag.append( divAttrTag );
                        divAttrTag.append( labelTag );
                        divAttrTag.append( valueTag );

                        labelTag.html( me.resolvedefinitionField( objResult[o] ) );
                        valueTag.html( me.resolvedefinitionOptionValue( objResult[o].value ) );

                        if ( objResult[o].id == '' ) //added from search criteria
                        {
                            //labelTag.css('font-weight',"600");
                            valueTag.css('color','#909090');

                            //labelTag.css('color',"#8F5959");
                            //valueTag.css('color',"#612A2A");
                        }

                    };

                    var tdRightobjTag = $( '<td style="text-align:left;vertical-align:middle;width:40px;">' );
                    trTopObjTag.append( tdRightobjTag );

                    me.renderHiddenKeys( blockJson.keyList, itemAttrDataList, tdRightobjTag );
                    me.renderButtons( tdRightobjTag, blockJson.itemButtons );

                    /*if ( i < (jsonList.length - 1))
                    {
                        / START > LINE SEPARATOR /
                        var trBottomObjTag = $( '<tr>' );
                        var tdBottomtobjTag = $( '<td colspan=2 style="padding:0 10px 0 10px;">' );
                        var divObjTag = $( '<div style="height:10px;width:100%;border-bottom:2px solid #808080" />' );

                        tblObjTag.append( trBottomObjTag );
                        trBottomObjTag.append( tdBottomtobjTag );
                        tdBottomtobjTag.append( divObjTag );
                        / END > LINE SEPARATOR /
                    }*/

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

            newItemBtn.render( itemButtons, divItemTag );
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

    me.resolvedefinitionField = function( objFieldData )
    {
        var dcd = FormUtil.dcdConfig;
        var retName = '';

        //console.log( objFieldData );

        if ( dcd && dcd.definitionFields )
        {
            for( var i = 0; i < dcd.definitionFields.length; i++ )
            {
                if ( objFieldData.id === dcd.definitionFields[ i ].id )
                {
                    if ( ( dcd.definitionFields[ i ].term ).toString().length )
                    {
                        retName = me.cwsRenderObj.langTermObj.translateText( dcd.definitionFields[ i ].defaultName, dcd.definitionFields[ i ].term )
                    }
                    else
                    {
                        retName = dcd.definitionFields[ i ].defaultName;
                    }
                }
            }

            if ( retName.length == 0 )
            {
                return objFieldData.name;
            }
            else
            {
                return retName;
            }
        }
        else
        {
            return objFieldData.name;
        }

    }

    me.resolvedefinitionOptionValue = function( val )
    {
        var dcd = FormUtil.dcdConfig;
        var ret = '';

        if ( dcd && dcd.definitionOptions )
        {
            for (var optObj in dcd.definitionOptions) 
            {
                var defOptGroup = dcd.definitionOptions[ optObj ];

                for( var p = 0; p < defOptGroup.length; p++ )
                {
                    if ( defOptGroup[p].value == val )
                    {
                        ret = defOptGroup[p].defaultName
                    }
                }
            }
        }

        if ( ret.length )
        {
            return ret;
        }
        else
        {
            return val;
        }

    }
	// -------------------------------
	
	// me.initialize();
}