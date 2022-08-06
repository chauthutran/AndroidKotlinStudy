// 1. show various prompt Dialogs
// 2. run switch or cancel events

// -------------------------------------------
// -- AppModeSwitchPrompt NEW Class/Methods
function AppModeSwitchPrompt() {};


AppModeSwitchPrompt.showInvalidNetworkMode_Dialog = function ( appMode, cwsRenderObj ) 
{
    // DISPLAYS WHEN CLICKING 'ONLINE SEARCH' BUTTON > but networkMode = Offline

    var switchPromptTag = $( '#networkSwitch' );
    var switchPromptContentObj = $(Templates.ConnManagerNew_Dialog_notSupportedMode);

    var friendlyTitle = ConnManagerNew.isStrONLINE( appMode ) ? '<span term="networkSwitch_titleBackOnline">Back Online!<span>' : '<span term="networkSwitch_titleNeedStartAgain">you need to start again :-(</span>'; // <move into templates/(new)translations class
    var switchPromptText = Templates.ConnManagerNew_Dialog_prompt_notSupportedMode;
    var btnActionText = '<span term="networkSwitch_btnGoToactivityList">Go to activity list</span>';

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
    });


    TranslationManager.translatePage();

    AppModeSwitchPrompt.showDialog();
};


AppModeSwitchPrompt.showManualSwitch_Dialog = function ( switchTo_appMode, cwsRenderObj ) 
{
    // DISPLAYS WHEN USER CLICKs 'CLOUD' ICON in NAV HEADER > manual networkMode switch (to opposite of current)
    var isSwitchToOffline = ConnManagerNew.isStrOFFLINE( switchTo_appMode );
    var isSwitchToOnline = !isSwitchToOffline;

    var switchPromptTag = $( '#networkSwitch' );
    var switchPromptContentObj = ( isSwitchToOffline ) ? $( Templates.ConnManagerNew_Dialog_Manual_goOffline_Opts ) : $( Templates.ConnManagerNew_Dialog_Manual_goOnline );
    switchPromptTag.empty().append( switchPromptContentObj );


    // ---------------
    // Modify the prompt content

    var friendlyTitle = ( isSwitchToOffline ) ? '<span term="networkSwitch_titleGoOffline">Go Offline</span>' : '<span term="networkSwitch_titleBackOnline">Back Online</span>';
    var switchPromptText = ( isSwitchToOffline ) ? Templates.ConnManagerNew_Dialog_prompt_manualOffline : Templates.ConnManagerNew_Dialog_prompt_manualOnline;
    var btnActionText = ( isSwitchToOffline ) ? '<span term="networkSwitch_btnGoOffline">GO OFFLINE</span>': '<span term="networkSwitch_btnAccept">ACCEPT</span>';

    var dvTitle = switchPromptTag.find('.title');
    var imgIcon = switchPromptTag.find('.icon');
    var dvPrompt = switchPromptTag.find('.prompt');
    var btnCancel = switchPromptTag.find('.cancel');
    var btnAction = switchPromptTag.find('.runAction');

    imgIcon.addClass( switchTo_appMode.toLowerCase() );

    dvTitle.html( friendlyTitle );
    btnAction.html( btnActionText );
    // calculate elapsed time since going 'OFFLINE'
    //var timeWaited = AppModeSwitchPrompt.getTimeWaitedText();
    //switchPromptText += ( isSwitchToOnline ) ? '<br><br>You have been offline for ---' : '';    
    dvPrompt.html( switchPromptText );


    // ---------------
    // Event Handler:

    // Switch(MAIN Action) Button Related
    btnAction.click( function () {
        var callBackTime = Number( switchPromptTag.find( "input[name=switch_waitingTimeOpt]:checked" ).val() );
        ConnManagerNew.setManualAppModeSwitch( switchTo_appMode, callBackTime );
        AppModeSwitchPrompt.hideDialog();
    });

    btnCancel.click( function () {
        AppModeSwitchPrompt.hideDialog();                
    });            

    // ---------------

    TranslationManager.translatePage();
    
    AppModeSwitchPrompt.showDialog();
};


AppModeSwitchPrompt.showManualSwitch_NetworkUnavailable_Dialog = function( cwsRenderObj )
{
    // DISPLAYS WHEN SERVER UNAVAILABLE BUT TRYING TO GO ONLINE

    var switchPromptTag = $( '#networkSwitch' );
    var switchPromptContentObj = ( Templates.ConnManagerNew_Dialog_NoInternet );

    var friendlyTitle = '<span term="networkSwitch_titleNoInternet">No internet :~(</span>';
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
        btnCancel.html( '<span term="networkSwitch_btnOK">OK</span>' );
    }
    else
    {
        btnCancel.html( '<span term="networkSwitch_btnCANCEL">CANCEL</span>' );
    }

    btnCancel.click( function () {

        AppModeSwitchPrompt.cancelSwitchAction();

        //if ( rePromptWithCancel )
        //{
        //    AppModeSwitchPrompt.showManualSwitch_Dialog( ConnManagerNew.OFFLINE, cwsRenderObj, true );
        //}

    });

    TranslationManager.translatePage();

    AppModeSwitchPrompt.showDialog();
};


AppModeSwitchPrompt.showManualSwitch_ServerUnavailable_Dialog = function( cwsRenderObj )
{
    // DISPLAYS WHEN SERVER UNAVAILABLE BUT TRYING TO GO ONLINE

    var switchPromptTag = $( '#networkSwitch' );
    var switchPromptContentObj = ( Templates.ConnManagerNew_Dialog_ServerUnavailable );

    var friendlyTitle = '<span term="networkSwitch_titleServerUnavailable">Backend webService not available :(</span>';
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

    
    TranslationManager.translatePage();

    AppModeSwitchPrompt.showDialog();
}


AppModeSwitchPrompt.runAndSetManualSwitchAction = function( newAppModeStr, callBackTimeMs )
{
    ConnManagerNew.setManualAppModeSwitch( newAppModeStr, callBackTimeMs );

    AppModeSwitchPrompt.hideDialog();
};


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



