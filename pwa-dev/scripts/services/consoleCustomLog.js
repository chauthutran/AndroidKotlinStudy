// -------------------------------------------
// -- Utility Class/Methods

function ConsoleCustomLog() {};

ConsoleCustomLog.customLogData = [];

ConsoleCustomLog.divDialogTagId = '#divCustomDataDisplay';

// -------------------------------------
// Custom console log method:

console.customLog = function ( msg, label ) 
{
    console.log( msg );

    // NOTE, this could make the app size to get much bigger, 
    // Thus, we might want to limit the number of storage --> 200?
    ConsoleCustomLog.customLogData.push( { 'msg': msg, 'label': label } );

    if ( ConsoleCustomLog.customLogData.length > 200 ) ConsoleCustomLog.customLogData.shift();
};

// -------------------------------------
// Data UI show/hide 

ConsoleCustomLog.showDialog = function()
{
    var divDialogTag = $( ConsoleCustomLog.divDialogTagId );

    try
    {
        // populate the content here..
        var divMainContent = divDialogTag.find( 'div.divMainContent' );
        divMainContent.empty();
        
        var contentHtml = ConsoleCustomLog.generateContentHtml( ConsoleCustomLog.customLogData );        
        
        divMainContent.append( contentHtml );

        var btnCancel = divDialogTag.find( 'div.cancel' );

        btnCancel.off( 'click' ).click( function () {
            ConsoleCustomLog.hideDialog();                
        });           

    }
    catch( errMsg )
    {
        console.customLog( errMsg );
    }

    divDialogTag.show();
    $('.scrim').show();
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
