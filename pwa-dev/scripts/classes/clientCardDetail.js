// -------------------------------------------
// -- ClientCardDetail Class/Methods
// 
//      - When clicking on the clientCard body
//          - Create this class (new) and call 'render' of the instance.
//
//      ** This could be static class.  Since always run as

function ClientCardDetail( clientId, clientCardObj, options )
{
	var me = this;

    me.clientId = clientId;
    me.clientCardObj = clientCardObj;
    me.options = ( options ) ? options : {};

	// =============================================
	// === Initialize Related ========================

    me.initialize = function() 
    { 
        // Setup event here?  or on Render?
    };

    // ----------------------------------------------------

    me.render = function()
    {        
        //var clientCardDivTag = me.getClientCardDivTag();

        // If tag has been created), perform render
        //if ( clientCardDivTag.length > 0 )
        //{
        //    var clientJson = ClientDataManager.getClientById( me.clientId );

        try
        {
            //var activityContainerTag = clientCardDivTag.find( '.activityContainer' );

        }
        catch( errMsg )
        {
            console.customLog( 'Error on ClientCard.render, errMsg: ' + errMsg );
        }
    };

    // -----------------------------------------------------


    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

}

