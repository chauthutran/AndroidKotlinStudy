// -------------------------------------------
// -- ConsoleCustomLog Class/Methods

function ConsoleCustomLog() {};

ConsoleCustomLog.customLogData = [];

ConsoleCustomLog.divDialogTagId = '#divCustomDataDisplay';

// -------------------------------------
// Custom console log method:

console.customLog = function ( msg, label ) 
{
    if ( msg )
    {
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
        else if ( caseStr === 'runTestStart' )
        {
            inputCommandTag.val( 'DevHelper.testRunStart();' );
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
