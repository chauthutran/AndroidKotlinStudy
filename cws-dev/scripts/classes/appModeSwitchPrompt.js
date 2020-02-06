
// 1. show prompt
// 2. hide prompt
// 3. run switch 
// 4. cancel switch

// -------------------------------------------
// -- AppModeSwitchPrompt NEW Class/Methods

function AppModeSwitchPrompt() {


};


AppModeSwitchPrompt.showPrompt = function()
{

    try {

        var questionStr = "Network changed: switch to '" + ConnManagerNew.statusInfo.appMode_PromptedMode.toUpperCase() + "' mode?";
        var btnSwitch = $( '<a term="" class="notifBtn" ">SWITCH</a>' );

        $( btnSwitch ).click( function(){

            // make part of cwsRender obj > think about
            ConnManagerNew.acceptPrompt_AppModeSwitch( ConnManagerNew.statusInfo );

        });

        var msgID = 'ConnManagerNew_switch';

        MsgManager.notificationMessage( questionStr, 'notificationDark', btnSwitch,'', 'right', 'top', 20000, true, MsgManager.ConnManagerNew.rejectPrompt_AppModeSwitch, msgID );

        return msgID;

    }
    catch ( err ) {
        
    }

}

AppModeSwitchPrompt.hidePrompt = function( Prompt_MsgID )
{
    try{
        MsgManager.clearReservedMessage( Prompt_MsgID );
        return;
    }
    catch (err) {
        console.log( 'error during [AppModeSwitchPrompt.hidePrompt]: ' + err)
        return Prompt_MsgID;
    }

}

AppModeSwitchPrompt.runSwitchAction = function()
{

}

AppModeSwitchPrompt.cancelSwitchAction = function()
{

}