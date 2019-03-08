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
	
	me.debugMode = false;
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
        }
	}

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

            var searchPostPayload = FormUtil.getLastPayload();
            var divFormContainerTag = $( '<div class="formDivSec">' ); // GREG: find existing class "formDivSec"
            blockTag.append( divFormContainerTag );

            var dvgrpBySearchSummary = $( '<div class="groupBySearchResults" />' );
            dvgrpBySearchSummary.html( '<strong>' + jsonList.length + '</strong> ' + 'results for' + ' ' + FormUtil.jsonReadFormat( searchPostPayload ) );
            divFormContainerTag.append( dvgrpBySearchSummary );

            if ( blockJson.groupBy && blockJson.groupBy.length )
            {
                for( var g = 0; g < blockJson.groupBy.length; g++ )
                {
                    var lookup = {};
                    var result = [];
                    var filter = [];

                    for( var i = 0; i < jsonList.length; i++ )
                    {
                        for( var p = 0; p < jsonList[ i ].length; p++ )
                        {
                            if ( jsonList[ i ][ p ].id == blockJson.groupBy[g] )
                            {
                                var unqVal = jsonList[ i ][ p ].value;
                                if (! result.includes( unqVal ) ) 
                                {
                                    lookup[unqVal] = 1;
                                    result.push( unqVal );
                                    filter.push( { "id": blockJson.groupBy[g], "value": unqVal } );
                                }
                                else
                                {
                                    lookup[unqVal] += 1;
                                }
                            }
                        }
                    }

                    var grpByArr = [];
                    for (grp in lookup) {
                        var count = lookup[grp];
                        grpByArr.push({"group": grp, "count": count});
                    }

                    if ( me.debugMode ) console.log( lookup );
                    if ( me.debugMode ) console.log( grpByArr );
                    if ( me.debugMode ) console.log( result );
                    if ( me.debugMode ) console.log( filter );

                    result.sort();

                    grpByArr.sort(function(a, b)
                    {
                        if (a.count < b.count) { return -1; }
                        if (b.count < a.count) return 1;
                        else return 0;
                    });

                    if ( result.length )
                    {

                        var dvgrpByFieldHeader = $( '<div class="groupByFieldHeader" />' );
                        dvgrpByFieldHeader.append( $( '<div class=""> <table style="width:100%" ><tr><td style="width:18px;height:18px;"><div id="imggroupByFldHeader_' + g + '" class="imggroupByExpanded" /> </td> <td> <span class="">' +me.resolvedefinitionField( { "id": blockJson.groupBy[g], "name": blockJson.groupBy[g] } ) + '</span></td></tr></table> </div>' ) );
                        divFormContainerTag.append( dvgrpByFieldHeader );

                        var dvgrpByFieldBlock = $( '<div id="groupByFieldBlock_' + g + '" class="groupByFieldBlock">' );
                        divFormContainerTag.append( dvgrpByFieldBlock );

                        for( var r = 0; r < grpByArr.length; r++ )
                        {
                            var tblGrpBy = $( '<table id="groupByFieldBlock_' + g + '_' + r + '"  />' );
                            var trGrpBy = $( '<tr />' );
                            var tdGrpBy = $( '<td colspan=2 />' );                    
                            var dvGrpByTitle = $( '<div class="groupByField" />' );

                            dvGrpByTitle.html( '<div class=""> <table style="width:100%" ><tr><td style="width:18px;height:18px;"><div id="imggroupBy_' + g + '_' + r + '" class="imggroupByCollapsed" /> </td> <td> <span class="groupByFieldName">' + me.resolvedefinitionOptionValue( grpByArr[ r ].group ) + '</span>: <span class="">' + grpByArr[ r ].count + '</span></td></tr></table> </div>' );
                            dvGrpByTitle.attr( 'title', blockJson.groupBy[g] );

                            var dvGrpByRows = $( '<div id="groupResults_' + g + '_' + r + '" class="groupByResultBlock" style="display:none;" />' );

                            dvgrpByFieldBlock.append( tblGrpBy );
                            tblGrpBy.append( trGrpBy );
                            trGrpBy.append( tdGrpBy );
                            tdGrpBy.append( dvGrpByTitle );
                            dvGrpByTitle.append( dvGrpByRows );

                            me.renderSearchResultBlocks( dvGrpByRows, itemDisplayAttrList, blockJson.groupBy[g], grpByArr[ r ].group, jsonList, blockJson )

                            FormUtil.setClickSwitchEvent( $( "#imggroupBy_" + g + "_" + r),  $( "#groupResults_" + g + "_" + r), [ 'imggroupByExpanded', 'imggroupByCollapsed' ], me );

                        }

                        FormUtil.setClickSwitchEvent( $( "#imggroupByFldHeader_" + g ),  $( "#groupByFieldBlock_" + g), [ 'imggroupByExpanded', 'imggroupByCollapsed' ], me );

                    }

                }

                var dvgrpBySearchFooter = $( '<div class="groupBySearchResults" />' );
                divFormContainerTag.append( dvgrpBySearchFooter );

            }
            else
            {

                me.renderSearchResultBlocks( divFormContainerTag, itemDisplayAttrList, undefined, undefined, jsonList, blockJson )

            }
        }
    }

    me.renderSearchResultBlocks = function( divFormContainerTag, itemDisplayAttrList, fieldId, lookupVal, jsonList, blockJson )
    {
        var searchPostPayload = FormUtil.getLastPayload();
        var newjsonList = [];

        for( var i = 0; i < jsonList.length; i++ )
        {
            if ( fieldId && lookupVal )
            { 
                var itemAttrDataFiltered = ( jsonList[i] ).filter(a=>a.id==fieldId&&a.value==lookupVal);
                if ( itemAttrDataFiltered.length ) newjsonList.push ( jsonList[i] );
            }
            else
            {
                newjsonList.push ( jsonList[i] );
            }
        }

        for( var i = 0; i < newjsonList.length; i++ )
        {
            if ( i > 0 )
            {
                var divSpacerTag = $( '<div class="searchResultTableSpacer" />' );
                divFormContainerTag.append( divSpacerTag );
            }

            var itemAttrDataList = ( newjsonList[i] );
            var objResult = me.blockDataValidResultArray(itemDisplayAttrList, itemAttrDataList);
            var validResultData = objResult.length;
            var tblObjTag = $( '<table class="searchResultTable" id="searchResult_'+i+'">' );

            divFormContainerTag.append( tblObjTag );
            if ( me.debugMode ) console.log( itemAttrDataList );

            if ( blockJson.displayHeader )
            {
                if ( me.debugMode ) console.log( blockJson.displayHeader );

                var tritemHeaderTag = $( '<tr>' );
                var tditemHeaderTag = $( '<td class="groupByResultHeader">' );

                tblObjTag.append( tritemHeaderTag );
                tritemHeaderTag.append( tditemHeaderTag );

                var imginfoTag = $( '<img src="img/about.svg" style="opacity:0.5;width:18px;height:18px;">' );
                var lblSpacer = $( '<span>&nbsp;&nbsp;</span>' );
                var labelTag = $( '<span>' + me.resolvedefinitionField( { "id": blockJson.displayHeader[0], "name": blockJson.displayHeader[0] } ) + '</span> : <span class="groupByHeaderValue" >' + FormUtil.lookupJsonArr( itemAttrDataList, 'id', 'value', blockJson.displayHeader[0] ) + '</span>' );

                tditemHeaderTag.append( imginfoTag );
                tditemHeaderTag.append( lblSpacer );
                tditemHeaderTag.append( labelTag );

            }

            var trTopObjTag = $( '<tr class="itemBlock">' );
            var tdLeftobjTag = $( '<td>' );

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