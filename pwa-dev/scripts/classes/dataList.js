// -------------------------------------------
// -- DataList Class/Methods
// -- (Web Service) Returned data list rendering as list..
function DataList( cwsRenderObj, blockObj ) 
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.blockObj = blockObj;
    me.blockJson;        

    me.jsonListData;

    me.debugMode = false;
    
	me.initialize = function() 
    {
    }

	// -----------------------------------

    me.render = function( blockJson, newBlockTag, jsonListData )
	{
        me.blockJson = blockJson;
        var dataList = jsonListData.displayData;
        // NOTE 1. 'dataList' is 2 dimentional data.  1D: Client.  2D: Attributes (id/val) in client.
        //  [
        //     [ 'displayName': 'clientId', 'id': 'clientId', 'value': '---'  ]
        //     [ 'displayName': 'CORE - Age', 'id': 'age', 'value': '---'  ]
        //     [ 'displayName': 'Status', 'id': 'statusClient', 'value': '---'  ]  <-- This is generated attribute by 'Action' expression
        //  ]
        
        // NOTE 1.X
        // actionExpression generating new attribute example  MZ
        //"act_eval_checkClient": {
        //    "actionType": "evaluation",
        //    "expression": "'$${KRdnyGwNZyW}' === 'ISS' ? 'v_iss' : '$${clientId}'.length !== 0 ? 'c_reg' : 'c_non'",
        //    "attribute": { "id": "statusClient" }


		if ( blockJson && blockJson.list === 'dataList' && dataList )
        {
            if ( dataList.length === 0 ) me.renderAsEmptyList( newBlockTag );
            else me.renderListByGroup( dataList, blockJson, newBlockTag );
        }

        TranslationManager.translatePage();
	};


    // -----------------------------------------------------

    me.renderAsEmptyList = function( newBlockTag )
    {
        // Emmpty case
        var divTag = $( '<div class="emptyListDiv" ></div>' );
        var aTag = $( '<a term="">List is empty.</a>' ); // MISSING TRANSLATION

        divTag.append( aTag );
        newBlockTag.append( divTag );
    };


    me.renderListByGroup = function( dataList, blockJson, newBlockTag )
    {
        // 1. Create Search Result div tag
        var divFormContainerTag = me.createSearchResultDivTag( dataList );
        newBlockTag.append( divFormContainerTag );

        // 2. Create and Populate data list by groupIds and group values
        // 2.1 Modify data into groups 
        var dataListByGroups = me.groupDataList( blockJson.groupBy, dataList );
        var groupIdList = Object.keys( dataListByGroups );
        // NOTE 2. 'blockJson.group' is group metadata (definition).  Could be multiple groups definitions.
        //          'groupId' ('statusClient') is the attribute Id.  It looks for clients that has this attribute Id.
        // 'statusClient': { 'opened': true, ... 'values': [  'v_iss': { ---- button: --- }] }
        //      --> 'v_iss' is the matchign value.  Get only clients that has this attribute value ('v_iss') for groupId.

        // 'statusClient': {
        //   'c_reg': [ [-- client attr arr -- ], [-- client attr arr -- ] ]
        //   'v_iss': [ [-- client attr arr -- ], [-- client attr arr -- ] ]
        

        // 2.2 Render data by group
        groupIdList.forEach( groupId => 
        {
            // Ex. groupId = 'statusClient'
            var groupDataList = dataListByGroups[groupId];
            var groupValueList = Object.keys( groupDataList );
            var groupByFieldBlockTag = me.createGroupByFieldItemRow( groupId );
 
            divFormContainerTag.append( groupByFieldBlockTag );

            var divGroupByFieldContentTag = groupByFieldBlockTag.find( '.divGroupByFieldContent' );
             
            groupValueList.forEach( groupValue => 
            {
                // Ex. groupValue = 'c_reg'
                var clientsInVal = groupDataList[groupValue];

                if( clientsInVal.length > 0 )
                {
                    // clientsInVal - list of clients that has matching id (groupId) and val (groupVal)
                    var valDef =  me.getValueDef( blockJson.groupBy, groupId, groupValue );

                    // 'valDef' is definition of the matching value - what to display:  Ex. 'v_iss': { -- valDef -- }
                    //   'values': [  'v_iss': { ---- button: --- }  ] }
                    var dataListbByGroupTag = me.renderDataList_ByValDef( blockJson.displayResult, blockJson, clientsInVal, groupValue, valDef, groupId );
                    divGroupByFieldContentTag.append( dataListbByGroupTag );
                }                    
            }); 
        });
    };


    // Group data list by groups if any
    // Result : { "<groupId>" : { "<groupValue>" : [ /* Data List */ ] } }
    me.groupDataList = function( groupDataList, dataList )
    {
        var listByGroups = {};

        for( var i in groupDataList )
        {
            var groupData = groupDataList[i];
            var groupId = Object.keys( groupData )[0];
            var groupValueList = groupData[groupId].values;

            for( var j=0; j<groupValueList.length; j++ )
            {
                var groupValueData = groupValueList[j];
                var groupValueName = Object.keys(groupValueData)[0];

                var dataListByGroupValue = me.findDataListByGroupValue( dataList, groupValueName );
                if( dataListByGroupValue.length > 0 )
                {
                    if( listByGroups[groupId] == undefined )
                    {
                        listByGroups[groupId] = {};
                    }
                    
                    listByGroups[groupId][groupValueName] = dataListByGroupValue;
                }
            }
        }

        return listByGroups;
    };

    /**
     * Get group configuration by Group Id
     * [
            {
                "<groupId_1>": {
                    "values": [
                        {
                            "<groupId_1_value_1>": {
                                "buttons": ["btnImg_selectClient_smsReminder_Ipc"],
                                "icon": {
                                    "path": "images/open.svg",
                                    "width": "56px",
                                    "height": "56px"
                                },
                                "opened": "true",
                                "0.Info": "active/issued",
                                "order": "1"
                            }
                        },
                        {    "<groupId_1_value_2>": { .. } }
                    ],
                    "term": ""
                }
                ,"<groupId_2>": { }
    */
    me.getValueDef = function( groupDefList, searchGroupId, searchGroupValue )
    {
        var foundValDef;

        groupDefList.forEach( groupDef => 
        {
            if ( groupDef[searchGroupId] )
            {
                var matchingGroupDef = groupDef[searchGroupId];
                var valuesDef = matchingGroupDef.values;

                valuesDef.forEach( valDef => 
                {
                    if ( valDef[searchGroupValue] )
                    {
                        foundValDef = valDef[searchGroupValue];
                        foundValDef.nameConfig = me.getGroupValueTranslationInfo( searchGroupValue );
                    }
                })
            }
        });

        return foundValDef;
    };

    me.getGroupValueTranslationInfo = function( groupValue )
    {
        var dcd = ConfigManager.getConfigJson();
        var ret = { id: '', name: groupValue, term: ''};

        if ( dcd && dcd.definitionOptions )
        {
            for (var optObj in dcd.definitionOptions) 
            {
                var defOptGroup = dcd.definitionOptions[ optObj ];

                for( var p = 0; p < defOptGroup.length; p++ )
                {
                    if ( defOptGroup[p].value == groupValue )
                    {
                        ret = defOptGroup[p];
                    }
                }
            }
        }

        return ret;
    };
    
    // ===================================================================================
    // Create Search result div tags

    // Create Search result DIV
    me.createSearchResultDivTag = function( jsonList )
    {
        var divFormContainerTag = $( '<div class="formDivSec"/>' );
        var summaryTag = me.createSearchResultSummaryTag( jsonList ); // Create Search Result Summary

        divFormContainerTag.append( summaryTag );
        return divFormContainerTag;
    };

    // Create Search Result Summary
    me.createSearchResultSummaryTag = function( jsonList )
    {
        var summaryTag = $("<div class='groupBySearchResults'>");
        //summaryTag.append("<strong><span class='groupByHeaderValue' term='datalist_groupBy_circByVoucherStatus'>Circumcision by Voucher Status</span></strong>:");
        summaryTag.append("<strong> " + jsonList.length + " </strong>");
        summaryTag.append("<label term='dataListSearch_resultFor'>results</label>");
        
        return summaryTag;
    };

  
    // ================================================================================================================================================
   
    /** 
     * 
     * GroupData :
        {
            "buttons": ["btnImg_selectClient_smsReminder_Ipc"],
            "icon": {
                "path": "images/open.svg",
                "width": "56px",
                "height": "56px"
            },
            "opened": "true",
            "0.Info": "active/issued",
            "order": "1"
        } 
    **/

    me.renderDataList_ByValDef = function( displayedAttributeList, blockJson, dataList, groupValue, groupDataConfig )
    {
        var groupDivTag = $("<div groupVal='" + groupValue + "' class='divGroupByValue'/>");

        var divGroupByTitleTag = me.getGroupByValueTag_WtToggle();
        divGroupByTitleTag.find( '.groupByFieldValue' ).append(  "<span term='" + Util.getStr( groupDataConfig.nameConfig.term ) + "'>" 
            + Util.getStr( me.getNameOfGroupValue( groupValue ) )
            + "</span>: <strong class=''>" + dataList.length + "</strong>" );

        groupDivTag.append( divGroupByTitleTag );

        // Create table for data list
        groupDivTag.append("<table class='searchResultTable'><tbody></tbody></table>" );

        var tbody = groupDivTag.find("tbody");
        for( var i in dataList )
        {
            var rowTag = me.createDataItemTableRow( displayedAttributeList, blockJson, groupDataConfig, dataList[i] );
            tbody.append( rowTag );
        }

        me.setupEvents_GroupByHeader( groupDivTag.find( '.imgGrpByIcon' ), groupDivTag.find( '.searchResultTable' ) );

        return groupDivTag;
    };

    
    me.setupEvents_GroupByHeader = function( expendIconTag, contentTag )
    {
        FormUtil.setClickSwitchEvent2( expendIconTag, contentTag, [ 'imggroupByExpanded', 'imggroupByCollapsed' ] );
    };

   
    me.createGroupByFieldItemRow = function( groupId )
    {
        var groupByDef = me.resolveDefinitionFieldItem( { 'id': groupId, 'defaultName': groupId } );

        var groupByFieldDiv = $( "<div class='divGroupByField' groupId='" + groupId + "' style='margin: 4px 0 10px 0;'></div>" );

        var divGroupByTitleTag = me.getGroupByTitleTag_WtToggle();
        divGroupByTitleTag.find( '.groupByFieldName' ).append( "<span term='" + Util.getStr( groupByDef.term ) + "'>" + + Util.getStr( groupByDef.name ) + "</span>" );

        groupByFieldDiv.append( divGroupByTitleTag );

        groupByFieldDiv.append( "<div class='divGroupByFieldContent' style='margin: 8px 0 0 20px;'></div>");

        me.setupEvents_GroupByHeader( groupByFieldDiv.find( '.imgGrpByIcon' ), groupByFieldDiv.find( '.divGroupByFieldContent' ) );

        return groupByFieldDiv;
    }


    me.getGroupByTitleTag_WtToggle = function()
    {
        var divTag = $( '<div class="divGroupByTitle"></div>' );

        divTag.append( "<div class='imgGrpByIcon imggroupByExpanded' style='display: inline-block; vertical-align: top;'></div>" );
        divTag.append( "<div class='groupByFieldName' style='display: inline-block; vertical-align: text-bottom;'></div>");

        return divTag;
    };

    me.getGroupByValueTag_WtToggle = function()
    {
        var divTag = $( '<div class="divGroupByValueTitle"></div>' );

        divTag.append( "<div class='imgGrpByIcon imggroupByExpanded' style='display: inline-block; vertical-align: top;'></div>" );
        divTag.append( "<div class='groupByFieldValue' style='display: inline-block; vertical-align: text-bottom;'></div>");

        return divTag;
    };

    me.createDataItemTableRow = function( displayedAttributeList, blockJson, groupConfig, dataItem )
    {
        var rowTag = $("<tr class='itemBlock'></tr>");

        // Add icon column
        var iconColTag = $("<td class='resultsImgContainer'></td>");
        var imgTag = $('<img class="imgSearchResultUser" style="width:56px">');

        if ( groupConfig.icon && groupConfig.icon.path )
        {
            imgTag.attr("src", groupConfig.icon.path );
        }
        else
        {
            imgTag.attr("src", "images/user.svg" );
        }

        iconColTag.append( imgTag );
        rowTag.append( iconColTag );


        // Add data item information column
        var dataColTag = $("<td style='padding-left:16px;'></td>");
        rowTag.append( dataColTag );

        var dataLineCount = 0;

        displayedAttributeList.forEach( attrId => 
        {
            for ( var z = 0; z < dataItem.length; z++ )
            {
                var data = dataItem[z];

                if ( data.id === attrId && data.value != "" )
                {
                    var fieldObj = me.resolveDefinitionFieldItem({ id: data.id, defaultName: '' });
                    var divTag = $("<div class='divItemBlockLine'></div>");
    
                    divTag.append("<label class='titleLabel' term='" + fieldObj.term + "'>" + me.getNameOfDataItemField( data ) + "</label>" );
                    divTag.append("<span fieldid='" + data.id + "'>: " + data.value + "</span></div>");
    
                    dataColTag.append( divTag );
    
                    if ( dataLineCount === 0 ) divTag.css( 'margin-top', '8px' );
    
                    dataLineCount++;
    
                    break;
                }
            }
        });


        // Add Buttons 
        var buttonsColTag = $("<td class='searchResultGroupByButtons'>");
        rowTag.append( buttonsColTag );

        var hidenValuesTag = me.renderHiddenValuesTag( blockJson.keyList, dataItem ); // replace `blockJson.keyList` with `[ "clientId" ]` to remove dependency on dcdConfig use of `keyList` array 
        buttonsColTag.append( hidenValuesTag );
        
        if ( groupConfig.buttons != undefined) 
        {
            me.renderButtons(buttonsColTag, groupConfig.buttons, dataItem);
        }
        else 
        {
            // Readjust json for passing
            var passedData = Util.cloneJson( dataItem );
            passedData.displayData = dataItem;
            passedData.resultData = {};

            // BUTTON LIST
            var buttonDefList = [];
            if (blockJson.itemButtons) buttonDefList = blockJson.itemButtons;
            else if (blockJson.buttons) buttonDefList = blockJson.buttons;

            me.renderButtons( buttonsColTag, buttonDefList, passedData);
        }

        return rowTag;
    };


    me.renderButtons = function( divItemTag, itemButtons, dataItem )
    {
        if ( itemButtons )
        {
            var newItemBtn = new BlockButton(  me.cwsRenderObj, me.blockObj );

            newItemBtn.render( itemButtons, divItemTag, dataItem );
        } 
    }
    

    me.renderHiddenValuesTag = function( hiddenIdList, dataItem )
    {
        var divTag = $("<div></div>");
        if ( hiddenIdList )
        {
            for( var i=0; i<hiddenIdList.length; i++ )
            {
                var hiddenId = hiddenIdList[i];
                var foundData = Util.getFromList( dataItem, hiddenId, "id" );

                if ( foundData )
                {
                    divTag.append("<input type='hidden' name='" + hiddenId + "' value='" + foundData.value + "' display='hiddenVal' >");
                }
            }
        }

        return divTag;
    };

    
    me.getNameOfGroupValue = function( groupValue )
    {
        var name = me.getGroupValueTranslationInfo( groupValue ).defaultName;
		return ( name == undefined ) ? groupValue : name;
    };


    me.getNameOfDataItemField = function( objFieldData )
    {
        //var ObjData = me.resolveDefinitionFieldItem( objFieldData );
        return ( objFieldData.displayName ) ? objFieldData.displayName : objFieldData.id;
    };


    me.resolveDefinitionFieldItem = function( objFieldData )
    {
        var dcd = ConfigManager.getConfigJson();
        var retField = { id: objFieldData.id, name: '', term: ''};

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

                        if ( dcd.definitionFields[ i ].term && dcd.definitionFields[ i ].term != "" )
                        {
                            retField.name = TranslationManager.translateText( dcd.definitionFields[ i ].defaultName, dcd.definitionFields[ i ].term )
                            retField.term = dcd.definitionFields[ i ].term;
                        }
                    }
                }    
            }
            catch ( errMsg ) {  }

            if ( retField.id != "" )
            {
                retField.id = objFieldData.id;
                retField.name = objFieldData.name;
            }
           
            return retField;
        }
        else
        {

            var name = ( objFieldData.name ) ? objFieldData.name : objFieldData.id;
            objFieldData.name = name;
            return objFieldData;
        }
    };

    // ======================================================================================================
    // Supportive methods

    me.findDataListByGroupValue = function( dataList, groupId )
    {
        var list = [];
        for( var i in dataList )
        {
            var data = dataList[i];
            var found = Util.getFromList( data, groupId, "value" );
            if( found )
            {
                list.push( data );
            }
        }

        return list;
    };

}