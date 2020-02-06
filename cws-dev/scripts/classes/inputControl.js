// -------------------------------------------
// -- InputControl Class/Methods
//

// * / * / * /  pseudocode for inputControl.js * \ * \ * \ 

// 1. create an input control and label (radio, select, multicheckbox, etc)

// 1.1 create label
// 1.2 create custom control 

// 1.2.1 check control type from supported list (e.g. 'map' == unsupported )
// 1.2.2 run appropriate createControl method: createInputText(), createInputYear(), createInputMultiCheckbox(), createInputAutoComplete(), createInputTelephone(mask/rules/etc), *createInputMap()

// 1.3 handle validations, rules, masks, etc 
// 1.4 handle dynamic/calculated values (-e.g. uniqueID [PE-2020-IFPP-0000001-FE-PREGANT])

// 2. Fill control with value (defaultValue / received from server)


function InputControl( inputControlJson, divInputTag, formTag, dataValue )
{
    var me = this;

    me.InputControlJson = inputControlJson;
    me.divInputTag = divInputTag;
    me.formTag = formTag;
    me.dataValue = dataValue;

    me.inputLabelTag;
    me.inputControlTag;

    me.createLabel = function()
    {
        $( divInputTag ).append( $('<label term="' + ( me.InputControlJson.term ? me.InputControlJson.term : '' ) + '" class="from-string titleDiv">' + me.InputControlJson.defaultName + '</label>') )
    }

    me.createInputControl = function()
    {

        if ( formItemJson.controlType === "DROPDOWN_LIST" )
        {
            me.createDropDown();
        }
        else if ( formItemJson.controlType === "INT" )
        {
            me.createInt();
        }
        else if ( formItemJson.controlType === "SHORT_TEXT" )
        {
            me.createShortText();
        }
    }

    me.initialize = function()
    {
        me.createLabel();
        me.createInputControl();
    }

    me.initialize();
}

/*

    {
    "defaultName": "demo - generatePattern()",
    "id": "activityId",
    "controlType": "SHORT_TEXT",
    "defaultValue": "##{generatePattern(dcdConfig.countryCode-XXXX-0000-YYYYMMDD-SEQ[DD:2],-)}",
    "payload": {
        "default": {
            "defaultValue": "##{generatePattern(dcdConfig.countryCode-XXXX-0000-YYYYMMDD-SEQ[DD:2],-)}",
            "dataTargets": {
                "": "activityId"
            }
        }
    }

*/