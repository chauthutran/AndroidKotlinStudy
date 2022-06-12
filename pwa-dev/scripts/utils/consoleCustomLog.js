// -------------------------------------------
// -- ConsoleCustomLog Class/Methods

function ConsoleCustomLog() {};

ConsoleCustomLog.customLogData = [];

ConsoleCustomLog.divDialogTagId = '#divCustomLogDisplay';

// -------------------------------------
// Custom console log method:

console.customLog = function ( msg, label ) 
{
    console.log( msg );

    if ( msg )
    {
        //console.log( msg );
        
        // TODO: Ways to display / show the location of error?
        // NOTE: WAYS TO TELL WHICH METHOD CALLED THIS --> console.log(new Error('I was called').stack) OR Use 'this' on caller!!!

        // Add to debug appInfo - only if the msg is string..
        //var log = { 'dateTime': ( new Date() ).toISOString(), 'msg': Util.getStr( msg, 400 ), 'label': label };
        //AppInfoManager.addToCustomLogHistory( log );

        // NOTE, this could make the app size to get much bigger, 
        // Thus, we might want to limit the number of storage --> 200?
        //ConsoleCustomLog.customLogData.push( { 'msg': msg, 'label': label } );    
        //if ( ConsoleCustomLog.customLogData.length > 200 ) ConsoleCustomLog.customLogData.shift();    
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

// ----------------------------------
// -- MOSTLY FOR Displaying the error message on mobile device - on start & during use.

ConsoleCustomLog.debugConsoleStart = function()
{
    var consoleLogTag = $( '#console' ).show();
    ConsoleCustomLog.debugConsoleEvents( consoleLogTag );
};

ConsoleCustomLog.debugConsoleEvents = function( consoleLogTag )
{
    var consoleMainContentTag = $( '#consoleMainContent' );
    var consoleClearBtnTag = $( '#consoleClearBtn' );
    var consoleMinimizeBtnTag = $( '#consoleMinimizeBtn' );    
    var consoleRestoreBtnTag = $( '#consoleRestoreBtn' );    
    var consoleExitBtnTag = $( '#consoleExitBtn' );    
    var consoleOutputTag = $( '#consoleOutput' );
    var consoleInputTag = $( '#consoleInput' );
    var consoleClearBtnTag = $( '#consoleClearBtn' );

    consoleClearBtnTag.click( e => consoleOutputTag.html( '' ) );
    consoleExitBtnTag.click( e => { if ( confirm( 'Confirm Exit?' ) ) consoleLogTag.hide(); } );
    consoleMinimizeBtnTag.click( e => { consoleLogTag.css( 'height', '12px' ); consoleMainContentTag.hide(); } );
    consoleRestoreBtnTag.click( e => { consoleLogTag.css( 'height', '20%' ); consoleMainContentTag.show(); } );
    // NOTE: Could further improve by adding & removing min-height on 'min'/'restore - or do by class add/remove.

    console.log = (text) => { consoleOutputTag.append( $( '<p class="console-line"></p>' ).html( "> " + text ) ); consoleMainContentTag.scrollTop(10000); }
    console.error = (text) => { consoleOutputTag.append( $( '<p class="console-line-error"></p>' ).html( "> " + text ) ); consoleMainContentTag.scrollTop(10000); }
    console.debug = console.info =  console.log;

    consoleInputTag.change( function() {
        var value = consoleInputTag.val();
        consoleInputTag.val( '' );
        console.log( eval( value ) );
    });
};
