// 1. show various prompt Dialogs
// 2. run switch or cancel events

// -------------------------------------------
// -- AppModeSwitchPrompt NEW Class/Methods
function AppModeSwitchPrompt() {};


AppModeSwitchPrompt.showInvalidNetworkMode_Dialog = function ( appMode ) 
{
    // DISPLAYS WHEN CLICKING 'ONLINE SEARCH' BUTTON > but networkMode = Offline

    var switchPromptTag = $( '#networkSwitch' );
    var switchPromptContentObj = $(Templates.ConnManagerNew_Dialog_notSupportedMode);

    var friendlyTitle = ConnManagerNew.isStrONLINE( appMode ) ? 'Back Online!' : 'you need to start again :-('; // <move into templates/(new)translations class
    var switchPromptText = Templates.ConnManagerNew_Dialog_prompt_notSupportedMode;
    var btnActionText = 'Got to activity list';

    switchPromptTag.empty();
    switchPromptTag.append(switchPromptContentObj);

    var dvTitle = switchPromptTag.find('.title');
    var dvPrompt = switchPromptTag.find('.prompt');
    var btnAction = switchPromptTag.find('.runAction');

    dvTitle.html( friendlyTitle );
    dvPrompt.html( switchPromptText );
    btnAction.html( btnActionText.toUpperCase() );

    btnAction.click(function () {

        AppModeSwitchPrompt.hideDialog();

        // >> Decide on appropriate way forward:
        //ConnManagerObj._cwsRenderObj.handleAppMode_Switch();
        //ConnManagerObj._cwsRenderObj.startBlockExecute();

    });

    // TODO: REMOVE IT..
    //cwsRenderObj.langTermObj.translatePage();

    AppModeSwitchPrompt.showDialog();
};



AppModeSwitchPrompt.showManualSwitch_Dialog = function ( switchTo_appMode, disableCancel ) 
{
    // DISPLAYS WHEN USER CLICKs 'CLOUD' ICON in NAV HEADER > manual networkMode switch (to opposite of current)
    //var switchChoiseStr = switchTo_appMode.toUpperCase();
    // === 'OFFLINE';
    var isSwitchToOffline = ConnManagerNew.isStrOFFLINE( switchTo_appMode );
    var isSwitchToOnline = !isSwitchToOffline;

    var switchPromptTag = $( '#networkSwitch' );
    var switchPromptContentObj = ( isSwitchToOffline ) ? $( Templates.ConnManagerNew_Dialog_Manual_goOffline_Opts ) : $( Templates.ConnManagerNew_Dialog_Manual_goOnline );

    var friendlyTitle = ( isSwitchToOffline ) ? 'Go Offline' : 'Back Online';
    var switchPromptText = ( isSwitchToOffline ) ? Templates.ConnManagerNew_Dialog_prompt_manualOffline : Templates.ConnManagerNew_Dialog_prompt_manualOnline;
    var btnActionText = ( isSwitchToOffline ) ? 'GO OFFLINE': 'ACCEPT';

    switchPromptTag.empty();
    switchPromptTag.append( switchPromptContentObj );

    var dvTitle = switchPromptTag.find('.title');
    var imgIcon = switchPromptTag.find('.icon');
    var dvPrompt = switchPromptTag.find('.prompt');
    var btnCancel = switchPromptTag.find('.cancel');
    var btnAction = switchPromptTag.find('.runAction');

    imgIcon.addClass( switchTo_appMode.toLowerCase() );

    dvTitle.html( friendlyTitle );
    btnAction.html( btnActionText );

    if ( isSwitchToOnline )
    {
        // calculate elapsed time since going 'OFFLINE'
        var timeWaited = AppModeSwitchPrompt.getTimeWaitedText();

        dvPrompt.html( switchPromptText + '<br><br>You have been offline for ' + timeWaited );
    }
    else
    {
        dvPrompt.html( switchPromptText );
    }


    if ( disableCancel === undefined )
    {
        btnCancel.click( function () {

            if ( isSwitchToOnline )
            {
                var callBackTimeMs = Number( switchPromptTag.find( "input[name='switch_waitingTimeOpt']:checked" ).val() );
                AppModeSwitchPrompt.runAndSetManualSwitchAction( ConnManagerNew.OFFLINE, callBackTimeMs );
            }

            AppModeSwitchPrompt.cancelSwitchAction();

        });            
    }
    else
    {
        if ( disableCancel === true )
        {
            btnCancel.hide();
        }
    }

    btnAction.click( function () {

        var callBackTimeMs = Number( switchPromptTag.find( "input[name='switch_waitingTimeOpt']:checked" ).val() );
        AppModeSwitchPrompt.runAndSetManualSwitchAction( switchTo_appMode, callBackTimeMs );

        /*
        if ( isSwitchToOffline )
        {
            // restart network check so that timer follows directly behind new planned 'restart' networkMode

            // TODO: JAMES: THIS SHOULD BE MUCH SIMPLER..
            //ScheduleManager.restart_checkNSet_ServerAvailable();
        }
        else
        {
            ConnManagerNew.update_UI( ConnManagerNew.statusInfo );
        }
        */

    });

    //ConnManagerNew._cwsRenderObj.langTermObj.translatePage();

    AppModeSwitchPrompt.showDialog();

};

AppModeSwitchPrompt.showManualSwitch_NetworkUnavailable_Dialog = function( rePromptWithCancel )
{
    // DISPLAYS WHEN SERVER UNAVAILABLE BUT TRYING TO GO ONLINE

    var switchPromptTag = $( '#networkSwitch' );
    var switchPromptContentObj = ( Templates.ConnManagerNew_Dialog_NoInternet );

    var friendlyTitle = 'No internet :~(';
    var switchPromptText = Templates.ConnManagerNew_Dialog_prompt_network_Unavailable;

    switchPromptTag.empty();
    switchPromptTag.append( switchPromptContentObj );

    var dvTitle = switchPromptTag.find('.title');
    var imgIcon = switchPromptTag.find('.icon');
    var dvPrompt = switchPromptTag.find('.prompt');
    var btnCancel = switchPromptTag.find('.cancel');

    imgIcon.addClass( 'unavailable' )

    dvTitle.html( friendlyTitle );
    dvPrompt.html( switchPromptText );

    if ( rePromptWithCancel )
    {
        btnCancel.html( 'OK' );
    }
    else
    {
        btnCancel.html( 'CANCEL' );
    }

    btnCancel.click( function () {

        AppModeSwitchPrompt.cancelSwitchAction();

        if ( rePromptWithCancel )
        {
            AppModeSwitchPrompt.showManualSwitch_Dialog( ConnManagerNew.OFFLINE, true );
        }

    });

    //ConnManagerNew._cwsRenderObj.langTermObj.translatePage();

    AppModeSwitchPrompt.showDialog();
};


AppModeSwitchPrompt.showManualSwitch_ServerUnavailable_Dialog = function()
{
    // DISPLAYS WHEN SERVER UNAVAILABLE BUT TRYING TO GO ONLINE

    var switchPromptTag = $( '#networkSwitch' );
    var switchPromptContentObj = ( Templates.ConnManagerNew_Dialog_ServerUnavailable );

    var friendlyTitle = 'PSI CwS DWS not available :(';
    var switchPromptText = Templates.ConnManagerNew_Dialog_prompt_switchOnline_Unavailable;

    switchPromptTag.empty();
    switchPromptTag.append( switchPromptContentObj );

    var dvTitle = switchPromptTag.find('.title');
    var imgIcon = switchPromptTag.find('.icon');
    var dvPrompt = switchPromptTag.find('.prompt');
    var btnCancel = switchPromptTag.find('.cancel');

    imgIcon.addClass( 'unavailable' );

    dvTitle.html( friendlyTitle );
    dvPrompt.html( switchPromptText );
    btnCancel.html( 'OK' );

    btnCancel.click(function () {
        AppModeSwitchPrompt.cancelSwitchAction();
    });

    ConnManagerNew._cwsRenderObj.langTermObj.translatePage();

    AppModeSwitchPrompt.showDialog();
}


AppModeSwitchPrompt.runAndSetManualSwitchAction = function( newAppModeStr, callBackTimeMs )
{
    ConnManagerNew.setManualAppModeSwitch( newAppModeStr, callBackTimeMs );

    AppModeSwitchPrompt.hideDialog();
};


/*
// OTHER CLICK-BUTTON METHODS
AppModeSwitchPrompt.runSwitchAction = function () 
{
    AppModeSwitchPrompt.hideDialog();

    ConnManagerNew.acceptPrompt_AppModeSwitch( statusInfo );
}
*/


AppModeSwitchPrompt.cancelSwitchAction = function () 
{
    // do other things
    AppModeSwitchPrompt.hideDialog();
};

AppModeSwitchPrompt.showDialog = function()
{
    $('.scrim').show();
    $( '#networkSwitch' ).fadeIn();
};

AppModeSwitchPrompt.hideDialog = function()
{
    $('.scrim').hide();
    $( '#networkSwitch' ).empty();
    $( '#networkSwitch' ).hide();
};


AppModeSwitchPrompt.getTimeWaitedText = function()
{
    var dtmLastInitiated = new Date( ConnManagerNew.statusInfo.manual_Offline.initiated );
    var objTime = Util.timeCalculation( new Date(), dtmLastInitiated );

    if ( objTime.hh > 6 )
    {
        timeWaited =  ' > 6hrs';
    }
    else if ( objTime.hh > 1 )
    {
        timeWaited =  objTime.hh + ' hours ' + objTime.mm + ' mins' ;
    }
    else
    {
        timeWaited =  objTime.mm + ' mins ' + objTime.ss + ' secs' ;
    }

    return timeWaited;
};



