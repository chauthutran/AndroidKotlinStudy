function ClientConversation( _clientId, _conversationsTabTag )
{
    var me = this;

	me.clientId = _clientId;
	me.conversationsTabTag = _conversationsTabTag;
	me.clientJson;

	// --------------------------------
	// Init method

    me.initialize = function()
    {
        me.clientJson = ClientDataManager.getClientById(me.clientId);
    };

    // ----------------------------------------------------------------------------------------

    me.render = function()
    {
        $( 'li.clearfix' ).remove();

        var conversations = me.clientJson.conversations;

        conversations = conversations.filter( conv => conv.app === 'LAC_CB' );

        for( var i = conversations.length - 1; i >= 0; i-- )
        {
            var conv = conversations[i];

            // ADJUST 'conv' json
            // Change time 'UTC' to 'local'
            if ( conv.timeUTC ) conv.time = UtilDate.dateUTCToLocalStr( conv.timeUTC );

            // Adjust 
            if ( !conv.direction ) conv.direction = '';
            if ( !conv.time ) conv.time = '';
            

            me.conversationsTabTag.find("ul").append( me.generateMessageTag( conv ) );
        }
    };

    me.generateMessageTag = function( conv )
    {
        var date = DateUtils.formatDisplayDateTime(conv.time);

        if ( [ 'incoming', 'from' ].indexOf( conv.direction ) >= 0 )
        {
            return $( `<li class="clearfix ">
                        <div class="message-data">
                            <span class="message-data-time">${date}</span>
                            <span class="message-data-name" style="margin-left: 5px;">Client</span> <i class="fa fa-circle me"></i>
                        </div>
                        <div class="messageConv my-message">
                            <span>${conv.msg}</span>
                        </div>
                    </li>` );
        }
        else if ( [ 'outgoing', 'to' ].indexOf( conv.direction ) >= 0 )
        {
            return $(`<li class="clearfix">
                    <div class="message-data align-right">
                        <span class="message-data-time">${date}</span>
                        <span class="message-data-name" style="margin-left: 5px;">Agent</span> <i class="fa fa-circle me"></i>
                        
                    </div>
                    <div class="messageConv other-message float-right">
                        <span>${conv.msg}</span>
                    </div>
                </li>`);
        }
    };


	// --------------------------------
	// RUN Init method

    me.initialize();
}