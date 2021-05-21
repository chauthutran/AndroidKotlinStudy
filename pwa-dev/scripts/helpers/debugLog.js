function DebugLog() {};


DebugLog.start = function()
{
    var consoleLogTag = $("#console");
    
    consoleLogTag.show();

    DebugLog.setup_Events( consoleLogTag );
};


DebugLog.setup_Events = function( consoleLogTag )
{
    consoleClearBtnTag = $("#consoleClearBtn");
    consoleMinimizeBtnTag = $("#consoleMinimizeBtn");
    //consoleSummaryTag = $("#consoleSummary");
    
    var consoleOutputTag = $("#consoleOutput");
    var consoleInputTag = $("#consoleInput");

    var consoleClearBtnTag = $("#consoleClearBtn");


    console.log = function (text) {
            var consoleLine = "<p class=\"console-line\"></p>";
            consoleOutputTag.append($(consoleLine).html( "> " + text ));
    };

    console.error = function(text) {
        var consoleLine = "<p class=\"console-line-error\"></p>";
        consoleOutputTag.append( $(consoleLine).html( "> " + text ) );
    };
    
    console.debug = console.info =  console.log;


    consoleInputTag.change( function() {
        var value = consoleInputTag.val();
        consoleInputTag.val("");
        console.log( "> " + eval( value ) );
    });


    consoleClearBtnTag.click( function()
    {
        consoleOutputTag.html("");
    });

    
    consoleMinimizeBtnTag.click( function() {
        consoleLogTag.hide();
    });
};
