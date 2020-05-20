// 1. show various prompt Dialogs
// 2. run switch or cancel events

// -------------------------------------------
// -- AppModeSwitchPrompt NEW Class/Methods

function AppModeSwitchPrompt( ConnManagerNew ) {

    var me = this;

    me.ConnManagerObj = ConnManagerNew;

    // MAIN METHODS FOR SHOWING DIALOGS RELATED TO NETWORK CHANGES


    me.showInvalidNetworkMode_Dialog = function ( appMode ) 
    {
        // DISPLAYS WHEN CLICKING 'ONLINE SEARCH' BUTTON > but networkMode = Offline

        var switchPromptTag = $( '#networkSwitch' );
        var switchPromptContentObj = $(Templates.ConnManagerNew_Dialog_notSupportedMode);

        var friendlyTitle = (appMode.toUpperCase() === 'ONLINE' ? 'Back Online!' : 'you need to start again :-('); // <move into templates/(new)translations class
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

            me.hideDialog();

            // >> Decide on appropriate way forward:
            //ConnManagerObj._cwsRenderObj.handleAppMode_Switch();
            //ConnManagerObj._cwsRenderObj.startBlockExecute();

        });

        // TODO: REMOVE IT..
        me.ConnManagerObj._cwsRenderObj.langTermObj.translatePage();

        me.showDialog();
    }

    me.showManualSwitch_Dialog = function ( switchTo_appMode, disableCancel ) 
    {
        // DISPLAYS WHEN USER CLICKs 'CLOUD' ICON in NAV HEADER > manual networkMode switch (to opposite of current)

        var switchPromptTag = $( '#networkSwitch' );
        var switchPromptContentObj = ( switchTo_appMode.toUpperCase() === 'OFFLINE' ? $( Templates.ConnManagerNew_Dialog_Manual_goOffline_Opts ) : $( Templates.ConnManagerNew_Dialog_Manual_goOnline ) );

        var friendlyTitle = ( switchTo_appMode.toUpperCase() === 'OFFLINE' ? 'Go Offline' : 'Back Online' );
        var switchPromptText = ( switchTo_appMode.toUpperCase() === 'OFFLINE' ? Templates.ConnManagerNew_Dialog_prompt_manualOffline : Templates.ConnManagerNew_Dialog_prompt_manualOnline );
        var btnActionText = ( switchTo_appMode.toUpperCase() === 'OFFLINE' ? 'GO OFFLINE': 'ACCEPT' );

        switchPromptTag.empty();
        switchPromptTag.append( switchPromptContentObj );

        var dvTitle = switchPromptTag.find('.title');
        var imgIcon = switchPromptTag.find('.icon');
        var dvPrompt = switchPromptTag.find('.prompt');
        var btnCancel = switchPromptTag.find('.cancel');
        var btnAction = switchPromptTag.find('.runAction');

        imgIcon.addClass( switchTo_appMode.toLowerCase() )

        dvTitle.html( friendlyTitle );
        btnAction.html( btnActionText );

        if ( switchTo_appMode.toUpperCase() === 'ONLINE' )
        {
            // calculate elapsed time since going 'OFFLINE'
            var timeWaited = me.getTimeWaitedText();

            dvPrompt.html( switchPromptText + '<br><br>You have been offline for ' + timeWaited );

        }
        else
        {
            dvPrompt.html( switchPromptText );
        }

        if ( disableCancel === undefined )
        {
            btnCancel.click( function () {

                if ( switchTo_appMode.toUpperCase() === 'ONLINE' )
                {
                    me.runAndSetManualSwitchAction( 'Offline', true );
                }

                me.cancelSwitchAction();

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

            me.runAndSetManualSwitchAction( ( switchTo_appMode.toUpperCase() === 'OFFLINE' ? 'Offline' : 'Online' ) );

            if ( switchTo_appMode.toUpperCase() === 'OFFLINE' )
            {
                // restart network check so that timer follows directly behind new planned 'restart' networkMode
                ScheduleManager.restart_checkNSet_ServerAvailable();
            }
            else
            {
                me.ConnManagerObj.update_UI( me.ConnManagerObj.statusInfo );
            }

        });

        me.ConnManagerObj._cwsRenderObj.langTermObj.translatePage();

        me.showDialog();

    }

    me.showManualSwitch_NetworkUnavailable_Dialog = function( rePromptWithCancel )
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

        btnCancel.click(function () {

            me.cancelSwitchAction();

            if ( rePromptWithCancel )
            {
                me.showManualSwitch_Dialog( 'OFFLINE', true )
            }

        });

        me.ConnManagerObj._cwsRenderObj.langTermObj.translatePage();

        me.showDialog();
    }

    me.showManualSwitch_ServerUnavailable_Dialog = function()
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

        imgIcon.addClass( 'unavailable' )

        dvTitle.html( friendlyTitle );
        dvPrompt.html( switchPromptText );
        btnCancel.html( 'OK' );

        btnCancel.click(function () {
            me.cancelSwitchAction();
        });

        me.ConnManagerObj._cwsRenderObj.langTermObj.translatePage();

        me.showDialog();
    }

    me.runAndSetManualSwitchAction = function( newMode, repeat )
    {
        var newStatusInfo = me.ConnManagerObj.statusInfo;
        var switchPromptTag = $( '#networkSwitch' );
        var switchOpt = ( repeat === undefined ? switchPromptTag.find( "input[name='switch_waitingTimeOpt']:checked" ).val() : newStatusInfo.manual_Offline.retryOption ); //( '.[name=switch_waitingTimeOpt]' );

        newStatusInfo.appMode = newMode;
        newStatusInfo.appMode_PromptedMode = newMode;

        if ( newMode.toUpperCase() === 'OFFLINE' )
        {
            // MAIN Setting (true when switching to OFFLINE)
            newStatusInfo.manual_Offline.enabled = true;

            newStatusInfo.manual_Offline.retryOption = switchOpt;
            newStatusInfo.manual_Offline.retryDateTime = ( new Date( ( new Date ).getTime() + parseInt( switchOpt ) * 60 * 1000 ) ).toISOString();
            newStatusInfo.manual_Offline.initiated = ( new Date ).toISOString();

            newStatusInfo.serverAvailable = false;

            me.ConnManagerObj.acceptPrompt_AppModeSwitch( newStatusInfo );
        }
        else
        {
            // MAIN Setting (false when switching to ONLINE)
            me.ConnManagerObj.statusInfo.manual_Offline.enabled = false;

            me.ConnManagerObj.acceptPrompt_AppModeSwitch( newStatusInfo );
        }

        me.hideDialog();

    }




    // OTHER CLICK-BUTTON METHODS


    me.runSwitchAction = function () 
    {

        me.hideDialog();

        me.ConnManagerObj.acceptPrompt_AppModeSwitch( statusInfo );
    }

    me.cancelSwitchAction = function () 
    {
        // do other things
        me.hideDialog();
    }

    me.showDialog = function()
    {
        $('.scrim').show();
        $( '#networkSwitch' ).fadeIn();
    }

    me.hideDialog = function()
    {
        $('.scrim').hide();
        $( '#networkSwitch' ).empty();
        $( '#networkSwitch' ).hide();
    }


    me.getTimeWaitedText = function()
    {
        var dtmLastInitiated = new Date( me.ConnManagerObj.statusInfo.manual_Offline.initiated );
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

    }


};

