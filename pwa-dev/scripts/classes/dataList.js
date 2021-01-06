// -------------------------------------------
// -- DataList Class/Methods

//const Util = require("../utils/util");

// -- (Web Service) Returned data list rendering as list..
function DataList( cwsRenderObj, blockObj ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;
    me.blockJson;        

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
        me.jsonListData = jsonListData;
                
		if ( blockJson && blockJson.list === 'dataList' && jsonListData )
        {
            // jsonListData = search result array returned by web service.
            me.renderDataList( jsonListData.displayData, blockJson.displayResult, newBlockTag, blockJson );	
        }

        TranslationManager.translatePage();
	}

    me.renderDataList = function( jsonList, itemDisplayAttrList, blockTag, blockJson )
    {
        if ( jsonList === undefined || jsonList.length == 0 )
        {
            // Emmpty case
            var divTag = $( '<div class="emptyListDiv" ></div>' );
            var aTag = $( '<a term="">List is empty.</a>' ); // MISSING TRANSLATION

            divTag.append( aTag );
            blockTag.append( divTag );
        }
        else
        {

            var dataJson = jsonList;
            var searchPostPayload = FormUtil.getLastPayload( 'sent' );
            var divFormContainerTag = $( '<div class="formDivSec">' ); // GREG: find existing class "formDivSec"
            blockTag.append( divFormContainerTag );

            var dvgrpBySearchContainer = $( '<div class="groupBySearchContainer" />' );
            var dvgrpBySearchSummary = $( '<div class="groupBySearchResults" />' );
            dvgrpBySearchSummary.html( '<strong>' + jsonList.length + '</strong> ' + '<label term="dataListSearch_resultFor">results for</label>' + ' ' + FormUtil.jsonReadFormat( searchPostPayload ) );
            divFormContainerTag.append( dvgrpBySearchContainer );
            dvgrpBySearchContainer.append( dvgrpBySearchSummary );

            
            if ( blockJson.groupBy )
            {
                me.groupByRender( dvgrpBySearchContainer, blockJson, dataJson, itemDisplayAttrList );
            }
            else
            {
                me.renderSearchResultBlocks( divFormContainerTag, itemDisplayAttrList, undefined, undefined, jsonList, blockJson )
            }
        }
    }


    me.groupByRender = function( dvgrpBySearchContainer, blockJson, dataJson, itemDisplayAttrList )
    {
        for( var g = 0; g < blockJson.groupBy.length; g++ )
        {
            var bGroupByObj = blockJson.groupBy[g];

            var lookup = {};
            var uniqValues = [];
            var fldGroupByID, fldGroupByObj, fldGroupByButtons;
            var complexGroupBy = false;

            if ( typeof bGroupByObj === "object" ) 
            {
                var keys = Object.keys( bGroupByObj );
                fldGroupByObj = bGroupByObj;
                fldGroupByID = keys[ 0 ];   // ex. 'statusVoucher'
                complexGroupBy = true;
                fldGroupByButtons = fldGroupByObj[ fldGroupByID ].buttons;
            }
            else throw "not supported groupBy type.";


            // iterate + tally unique values
            // 'dataJson' is 2 dimentional array with objects paired with 'id' / 'value'..
            // 'statusVoucher, v_iss', 'statusVoucher, v_iss', 'statusVoucher, v_rdx'
            // 'v_iss: 2', 'v_rdx: 1'
            for( var i = 0; i < dataJson.length; i++ )
            {
                for( var p = 0; p < dataJson[ i ].length; p++ )
                {
                    if ( dataJson[ i ][ p ].id == fldGroupByID )
                    {
                        var unqVal = dataJson[ i ][ p ].value;
                        if (! uniqValues.includes( unqVal ) ) 
                        {
                            lookup[unqVal] = 1;
                            uniqValues.push( unqVal );
                        }
                        else
                        {
                            lookup[unqVal] += 1;
                        }
                    }
                }
            }

            // store tally of unique values
            var grpByArr = [];
            for (val in lookup) {
                var count = lookup[ val ];
                grpByArr.push({ "value": val, "count": count, "order": count, "opened": false, "buttons": fldGroupByButtons });
            }

            // create 'grpByArr' with 'val' and their 'count' with other prop - to be populated later.

            if ( complexGroupBy ) // always true - obj type groupby.
            {
                if ( fldGroupByObj[ fldGroupByID ].values )
                {
                    // go through arrays of 'values' and process them..
                    for( var v = 0; v < fldGroupByObj[ fldGroupByID ].values.length; v++ )
                    {
                        var keyValObj = fldGroupByObj[ fldGroupByID ].values[ v ];
                        var keyVal = Object.keys( keyValObj )[ 0 ];

                        for( var r = 0; r < grpByArr.length; r++ )
                        {
                            if ( grpByArr[ r ].value == keyVal )
                            {
                                if ( keyValObj[ keyVal ].buttons )
                                {
                                    grpByArr[ r ].buttons = keyValObj[ keyVal ].buttons;
                                }
                                else
                                {
                                    grpByArr[ r ].buttons = blockJson.itemButtons;
                                }
                                if ( keyValObj[ keyVal ].opened != undefined )
                                {
                                    grpByArr[ r ].opened = keyValObj[ keyVal ].opened;
                                }
                                if ( keyValObj[ keyVal ].order != undefined )
                                {
                                    grpByArr[ r ].order = keyValObj[ keyVal ].order;
                                }
                            }
                        }

                    }

                }
                else
                {
                    if ( fldGroupByObj[ fldGroupByID ].buttons )
                    {

                    }
                }

            }

            if ( me.debugMode ) console.customLog( grpByArr );

            uniqValues.sort();

            grpByArr.sort(function(a, b)
            {
                if (a.order < b.order) { return -1; }
                if (b.order < a.order) return 1;
                else return 0;
            });

            // If there is no result, do not do this. But, if there is result
            if ( uniqValues.length )
            {
                // build layout
                // 'statusVoucher' translation is placed in 'definiotoinField' <-- resolvedefinitionFieldObj
                var fieldObj = me.resolvedefinitionFieldObj( { "id": fldGroupByID, "name": fldGroupByID } );
                var dvgrpByFieldHeader = $( '<div class="groupByFieldHeader" />' );
                dvgrpByFieldHeader.append( $( '<div class=""> <table style="width:100%" ><tr><td class="imggroupByFldHeader" ><div id="imggroupByFldHeader_' + g + '" class="imggroupByExpanded" /> </td> <td> <span class="groupByHeaderValue" term="' + ( fieldObj.term.length ? fieldObj.term : fieldObj.name ) + '">' +me.resolvedefinitionField( fieldObj ) + '</span></td></tr></table> </div>' ) );
                dvgrpBySearchContainer.append( dvgrpByFieldHeader );

                // 'g' is groupBy index/count..
                var dvgrpByFieldBlock = $( '<div id="groupByFieldBlock_' + g + '" class="groupByFieldBlock">' );
                dvgrpBySearchContainer.append( dvgrpByFieldBlock );

                for( var r = 0; r < grpByArr.length; r++ )
                {
                    var groupByObj = grpByArr[r];

                    if (me.debugMode) console.customLog(fldGroupByID, groupByObj.value );

                    // value = 'c_reg' - get the translation term from optionDefinition list..
                    var fieldOptObj = me.resolvedefinitionOptionObj( groupByObj.value );
                    var tblGrpBy = $( '<table id="groupByFieldBlock_' + g + '_' + r + '" class="groupByFieldResultTable" />' );
                    var trGrpBy = $( '<tr />' );
                    var tdGrpBy = $( '<td colspan=2 />' );                    
                    var dvGrpByTitle = $( '<div class="groupByField" />' );

                    dvGrpByTitle.html( '<div class=""> <table style="width:100%" ><tr><td class="groupByImgTd" ><div id="imggroupBy_' + g + '_' + r + '" class="' 
                        + ( groupByObj.opened != undefined ? ( groupByObj.opened == "true" ? 'imggroupByExpanded' : 'imggroupByCollapsed' ) : 'imggroupByCollapsed' ) 
                        + '" /> </td> <td class="groupByFieldName"> <span term="' + fieldOptObj.term + '">' + me.resolvedefinitionOptionValue( groupByObj.value )
                        + '</span>: <strong class="">' + groupByObj.count + '</strong></td></tr></table> </div>' );
                    dvGrpByTitle.attr( 'title', groupByObj.value );

                    var dvGrpByRows = $( '<div id="groupResults_' + g + '_' + r + '" class="groupByResultBlock" style="' 
                        + ( groupByObj.opened != undefined ? ( groupByObj.opened == "true" ? '' : 'display:none;' ) : 'display:none;' ) + '" />' );

                    dvgrpByFieldBlock.append( tblGrpBy );
                    tblGrpBy.append( trGrpBy );
                    trGrpBy.append( tdGrpBy );
                    tdGrpBy.append( dvGrpByTitle );
                    dvGrpByTitle.append( dvGrpByRows );

                    me.renderSearchResultBlocks( dvGrpByRows, itemDisplayAttrList, fldGroupByID, groupByObj.value, dataJson, blockJson, groupByObj.buttons )

                    FormUtil.setClickSwitchEvent( $( "#imggroupBy_" + g + "_" + r),  $( "#groupResults_" + g + "_" + r), [ 'imggroupByExpanded', 'imggroupByCollapsed' ] );

                }

                FormUtil.setClickSwitchEvent( $( "#imggroupByFldHeader_" + g ),  $( "#groupByFieldBlock_" + g), [ 'imggroupByExpanded', 'imggroupByCollapsed' ] );

            }

        }
    };

    // TODO: NOT USED ANYMORE?
    me.actionExpressionEvaluate = function( jsonList, actionTypeObj )
    {
        for( var a = 0; a < actionTypeObj.length; a++ )
        {
            var expString = actionTypeObj[ a ].expression;

            for( var i = 0; i < jsonList.length; i++ )
            {
                var myCondTest = expString.replace( new RegExp( '[$${]', 'g'), '' ).replace( new RegExp( '}', 'g'), '' );
    
                for( var p = 0; p < jsonList[ i ].length; p++ )
                {
                    var regFind = new RegExp(jsonList[ i ][ p ].id, 'g');
                    myCondTest = myCondTest.replace(  regFind, jsonList[ i ][ p ].value );
                }
    
                var result =  eval( myCondTest );

                if ( actionTypeObj[ a ].attribute )
                {
                    jsonList[ i ].push ( { "displayName": actionTypeObj[ a ].attribute.displayName, "id": actionTypeObj[ a ].attribute.id, "value": result } );
                }
                else
                {
                    jsonList[ i ].push ( { "displayName": "evaluation_" + a, "id": "evaluation_" + a, "value": result } );
                }
    
            }
        }

        return jsonList;
    }

    me.renderSearchResultBlocks = function( divFormContainerTag, itemDisplayAttrList, fieldId, lookupVal, jsonList, blockJson, itemButtons )
    {
        var searchPostPayload = FormUtil.getLastPayload();
        var newjsonList = [];

        if ( me.debugMode ) console.customLog( itemButtons );

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

        for( var r = 0; r < newjsonList.length; r++ )
        {
            try
            {
                if (r > 0) {
                    var divSpacerTag = $('<div class="searchResultTableSpacer" />');
                    divFormContainerTag.append(divSpacerTag);
                }

                var itemAttrDataList = (newjsonList[r]);
                var objResult = me.blockDataValidResultArray(itemDisplayAttrList, itemAttrDataList);
                var validResultData = objResult.length;
                var tblObjTag = $('<table class="searchResultTable" id="searchResult_' + r + '">');

                divFormContainerTag.append(tblObjTag);

                if (blockJson.displayHeader) {

                    var tritemHeaderTag = $('<tr>');
                    var tditemHeaderTag = $('<td class="groupByResultHeader">');

                    tblObjTag.append(tritemHeaderTag);
                    tritemHeaderTag.append(tditemHeaderTag);

                    var imginfoTag = $('<img src="images/about.svg" class="imgSearchResultAbout" >');
                    var lblSpacer = $('<span>&nbsp;&nbsp;</span>');
                    var labelTag = $('<span class="groupByHeaderField">' + me.resolvedefinitionField({ "id": blockJson.displayHeader[0], "name": blockJson.displayHeader[0] }) + '</span> : <span class="groupByHeaderValue" >' + FormUtil.lookupJsonArr(itemAttrDataList, 'id', 'value', blockJson.displayHeader[0]) + '</span>');

                    tditemHeaderTag.append(imginfoTag);
                    tditemHeaderTag.append(lblSpacer);
                    tditemHeaderTag.append(labelTag);

                }

                var trTopObjTag = $('<tr class="itemBlock">');
                var tdLeftIconTag = $('<td rowspan=2 class="resultsImgContainer">');
                var tdIconTag = $('<img src="images/user.svg" class="imgSearchResultUser" style="width:60px;" >');
                var tdLeftobjTag = $('<td class="">');

                tblObjTag.append(trTopObjTag);
                trTopObjTag.append(tdLeftIconTag);
                tdLeftIconTag.append(tdIconTag);
                trTopObjTag.append(tdLeftobjTag);

                if (!validResultData) {
                    var divAttrTag = $('<div class="" />');
                    var labelTag = $('<label class="titleLabel" />');
                    var valueTag = $('<span class="">');

                    tdLeftobjTag.append(divAttrTag);
                    divAttrTag.append(labelTag);
                    divAttrTag.append(valueTag);

                    labelTag.html('dcd Config issue');
                    valueTag.html('no valid IDs for "displayResult":[]');
                }
                else {

                    var condObj;

                    for (var i = 0; i < newjsonList.length; i++) {
                        for (var p = 0; p < newjsonList[i].length; p++) {
                            if (newjsonList[i][p].id == 'condition') {
                                condObj = newjsonList[i][p];
                            }
                        }
                    }

                    for (var o = 0; o < objResult.length; o++) {
                        var fieldObj = me.resolvedefinitionFieldObj({ id: objResult[o].id, defaultName: '' });
                        var divAttrTag = $('<div class="" />');
                        var labelTag = $('<label class="titleLabel" />');
                        var valueTag = $('<span id="' + objResult[o].id + '" class="">');

                        tdLeftobjTag.append(divAttrTag);
                        divAttrTag.append(labelTag);
                        divAttrTag.append(valueTag);

                        if (fieldObj.term && fieldObj.term.length) labelTag.attr("term", fieldObj.term);

                        labelTag.html(me.resolvedefinitionField(objResult[o]));
                        valueTag.html(': ' + me.resolvedefinitionOptionValue(objResult[o].value));

                        if (objResult[o].id == '') //added from search criteria
                        {
                            //labelTag.css('font-weight',"600");
                            valueTag.css('color', '#909090');
                        }

                    };

                    var tdRightobjTag = $('<td class="searchResultGroupByButtons" info="' + r + '" ></td>');
                    trTopObjTag.append(tdRightobjTag);

                    me.renderHiddenKeys(blockJson.keyList, itemAttrDataList, tdRightobjTag); // replace `blockJson.keyList` with `[ "clientId" ]` to remove dependency on dcdConfig use of `keyList` array 

                    if (itemButtons != undefined) {
                        me.renderButtons(tdRightobjTag, itemButtons);
                    }
                    else {
                        // Readjust json for passing
                        var passedData = Util.getJsonDeepCopy(me.jsonListData);
                        passedData.displayData = itemAttrDataList;
                        passedData.resultData = {};

                        // BUTTON LIST
                        var buttonDefList = [];
                        if (blockJson.itemButtons) buttonDefList = blockJson.itemButtons;
                        else if (blockJson.buttons) buttonDefList = blockJson.buttons;

                        me.renderButtons(tdRightobjTag, buttonDefList, passedData);
                    }
                }
            }
            catch( errMsg )
            {
                console.customLog( 'ERROR in renderSearchResultBlocks, errMsg: ' + errMsg );
            }
        }
    }


    me.blockDataValidResultArray = function( itemDisplayAttrList, searchResults )
    {
        // ONLY return array pairs where payload contains expected UID fields
        var validResults = [];

        // If 'displayResult' is not on definition, send all. 
        if ( !itemDisplayAttrList || itemDisplayAttrList.length === 0 ) 
        {
            validResults = searchResults;
        }
        else
        {
            for( var a = 0; a < itemDisplayAttrList.length; a++ )
            {
                var idStr = itemDisplayAttrList[a];
    
                var itemData = Util.getFromList( searchResults, idStr, "id" );

                if ( itemData && itemData.value )
                {   
                    validResults.push ( { 'id': itemData.id, 'name': itemData.displayName, 'value': itemData.value } );
                }    
            }
        }

        return validResults;
    };


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

    me.renderButtons = function( divItemTag, itemButtons, passedData )
    {
        if ( itemButtons )
        {
            var newItemBtn = new BlockButton(  me.cwsRenderObj, me.blockObj );

            newItemBtn.render( itemButtons, divItemTag, passedData );
        } 
    }

    me.renderDataValueTag = function( attrData, divItemTag )
    {    
        // Set Text..
        var spanDivTag = $( '<div class="searchResultDisplayValue" >' + attrData.displayName + ": <b>" + attrData.value + '</b></div>' );
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
        var dcd = ConfigManager.getConfigJson();
        var retName = '';

        if ( dcd && dcd.definitionFields )
        {
            try
            {
                for( var i = 0; i < dcd.definitionFields.length; i++ )
                {
                    if ( objFieldData.id === dcd.definitionFields[ i ].id )
                    {
                        if ( ( dcd.definitionFields[ i ].term ).toString().length )
                        {
                            retName = TranslationManager.translateText( dcd.definitionFields[ i ].defaultName, dcd.definitionFields[ i ].term )
                        }
                        else
                        {
                            retName = dcd.definitionFields[ i ].defaultName;
                        }
                    }
                }    
            }
            catch ( errMsg ) {  }

            if ( retName.length == 0 )
            {
                return ( objFieldData.name ) ? objFieldData.name : objFieldData.id;
            }
            else
            {
                return retName;
            }
        }
        else
        {
            return ( objFieldData.name ) ? objFieldData.name : objFieldData.id;
        }
    }

    me.resolvedefinitionFieldObj = function( objFieldData )
    {
        var dcd = ConfigManager.getConfigJson();
        var retField = { id: '', name: '', term: ''};

        if ( dcd && dcd.definitionFields )
        {
            try
            {
                for( var i = 0; i < dcd.definitionFields.length; i++ )
                {
                    if ( objFieldData.id === dcd.definitionFields[ i ].id )
                    {
                        retField.id = objFieldData.id;
                        retField.name = dcd.definitionFields[ i ].defaultName;

                        if ( ( dcd.definitionFields[ i ].term ).toString().length )
                        {
                            retField.name = TranslationManager.translateText( dcd.definitionFields[ i ].defaultName, dcd.definitionFields[ i ].term )
                            retField.term = dcd.definitionFields[ i ].term;
                        }
                    }
                }    
            }
            catch ( errMsg ) {  }

            if ( retField.id.length == 0 )
            {
                retField.id = objFieldData.id;
                retField.name = objFieldData.name;
            }

            return retField;

        }
        else
        {
            return ( objFieldData.name ) ? objFieldData.name : objFieldData.id;
        }
    }

    me.resolvedefinitionOptionObj = function( val )
    {
        var dcd = ConfigManager.getConfigJson();
        var ret = { id: '', name: val, term: ''};

        if ( dcd && dcd.definitionOptions )
        {
            for (var optObj in dcd.definitionOptions) 
            {
                var defOptGroup = dcd.definitionOptions[ optObj ];

                for( var p = 0; p < defOptGroup.length; p++ )
                {
                    if ( defOptGroup[p].value == val )
                    {
                        ret = defOptGroup[p]
                    }
                }
            }
        }

        return ret;

    }

    me.resolvedefinitionOptionValue = function( val )
    {
        var dcd = ConfigManager.getConfigJson();
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

}