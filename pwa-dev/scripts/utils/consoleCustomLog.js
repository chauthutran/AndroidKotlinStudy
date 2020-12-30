// -------------------------------------------
// -- ConsoleCustomLog Class/Methods

function ConsoleCustomLog() {};

ConsoleCustomLog.customLogData = [];

ConsoleCustomLog.divDialogTagId = '#divCustomLogDisplay';

// -------------------------------------
// Custom console log method:

console.customLog = function ( msg, label ) 
{
    if ( msg )
    {
        // TODO: Ways to display / show the location of error?

        console.log( msg );

        // NOTE, this could make the app size to get much bigger, 
        // Thus, we might want to limit the number of storage --> 200?
        ConsoleCustomLog.customLogData.push( { 'msg': msg, 'label': label } );
    
        if ( ConsoleCustomLog.customLogData.length > 200 ) ConsoleCustomLog.customLogData.shift();    
    }
};


ConsoleCustomLog.clearLogs = function()
{
    ConsoleCustomLog.customLogData = [];
};

// -------------------------------------
// Data UI show/hide 

ConsoleCustomLog.showDialog = function()
{
    var divDialogTag = $( ConsoleCustomLog.divDialogTagId );

    try
    {
        // populate the content here..
        var divMainContentTag = divDialogTag.find( 'div.divMainContent' );

        // Display the content..
        ConsoleCustomLog.setMainContent( divMainContentTag, ConsoleCustomLog.customLogData );


        // Add events..
        ConsoleCustomLog.addEvents( divMainContentTag, divDialogTag );

    }
    catch( errMsg )
    {
        console.customLog( errMsg );
    }

    divDialogTag.show();
    $('.scrim').show();
};


ConsoleCustomLog.addEvents = function( divMainContentTag, divDialogTag )
{

    // Close Button
    var btnCloseTag = divDialogTag.find( 'div.close' );
    btnCloseTag.off( 'click' ).click( function () {
        ConsoleCustomLog.hideDialog();                
    });           


    // Command Example Selection
    var selLogRunCommandCaseTag = divDialogTag.find( '.selLogRunCommandCase' );
    selLogRunCommandCaseTag.off( 'change' ).change( function() 
    {
        var caseStr = selLogRunCommandCaseTag.val();

        var inputCommandTag = divDialogTag.find( '.inputLogRunCommand' );

        if ( caseStr === 'custom' )
        {
            inputCommandTag.val( '' );
        }
        else if ( caseStr === 'loadSampleData' )
        {
            inputCommandTag.val( 'DevHelper.loadSampleData(20);' );
        }
        else if ( caseStr === 'removeSampleData' )
        {
            inputCommandTag.val( 'DevHelper.removeSampleData();' );
        }
        else if ( caseStr === 'listClientData' )
        {
            inputCommandTag.val( 'JSON.stringify( ClientDataManager.getClientList() );' );
        }

        else if ( caseStr === 'overrideSyncLastDwDate' )
        {
            var lastDwDateStr = AppInfoManager.getSyncLastDownloadInfo();

            inputCommandTag.val( 'AppInfoManager.updateSyncLastDownloadInfo( "' + lastDwDateStr + '" );' );
        }
        else if ( caseStr === 'showOtherUsefulCommands' )
        {
            console.customLog( '1. ClientDataManager.getClientById( "-----" );' );
            console.customLog( '2. ClientDataManager.getClientByActivityId( "------" );' );
            inputCommandTag.val( '/* Commands shown on above log area. */' );
        }

        else if ( caseStr === 'devMode' )
        {
            inputCommandTag.val( 'DevHelper.setDevMode( true );' );
        }

        else if ( caseStr === 'serverLinkOff' )
        {
            inputCommandTag.val( 'WsCallManager.setWsTarget_NoServer(); ConnManagerNew.checkNSet_ServerAvailable();' );
        }
        else if ( caseStr === 'serverLinkOn' )
        {
            inputCommandTag.val( 'WsCallManager.setWsTarget(); ConnManagerNew.checkNSet_ServerAvailable();' );
        }

        else if ( caseStr === 'serverAvailableCheck' )
        {
            inputCommandTag.val( 'ConnManagerNew.checkNSet_ServerAvailable();' );
        }
        else if ( caseStr === 'disableConnCheck' )
        {
            inputCommandTag.val( 'clearInterval( ScheduleManager.timerID_serverAvilableCheck );' );
        }
        else if ( caseStr === 'reEnableConnCheck' )
        {
            inputCommandTag.val( 'ScheduleManager.schedule_serverStatus_Check( false );' );
        }        
        else if ( caseStr === 'clearLogs' )
        {
            inputCommandTag.val( 'ConsoleCustomLog.clearLogs();' );
        }
    });


    // Run Command Button
    var btnLogRunCommandTag = divDialogTag.find( '.btnLogRunCommand' );
    btnLogRunCommandTag.off( 'click' ).click( function() {

        var runCommandVal = divDialogTag.find( '.inputLogRunCommand' ).val();

        console.customLog( 'runCommandVal: ' + runCommandVal );

        Util.tryCatchContinue( function() {

            var valueResult = eval( runCommandVal );
            console.customLog( valueResult );

            ConsoleCustomLog.setMainContent( divMainContentTag, ConsoleCustomLog.customLogData );

        }, "LogRunCommand Execute" );

    });
};
        

ConsoleCustomLog.setMainContent = function( divMainContentTag, customLogData )
{

  //divMainContent.empty();
  //var contentHtml = ConsoleCustomLog.generateContentHtml( ConsoleCustomLog.customLogData );        
  divMainContentTag.html( ConsoleCustomLog.generateContentHtml( customLogData ) );

};

ConsoleCustomLog.hideDialog = function()
{
    $('.scrim').hide();
    $( ConsoleCustomLog.divDialogTagId ).hide();
};

// ---------------------------------------------------

ConsoleCustomLog.generateContentHtml = function( customLogData )
{
    var contentHtml = "";

    for ( var i = 0; i < customLogData.length; i++ )
    {
        var logDataJson = customLogData[i];

        if ( logDataJson && logDataJson.msg )
        {
            contentHtml += '<div class="logText">' + logDataJson.msg + '</div>'
        }
    }

    return contentHtml;
};
