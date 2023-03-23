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
    }


    // ----------------------------------------------------------------------------------------

    me.render = function()
    {
        const conversations = me.clientJson.conversations;
        for( var i=0; i<conversations.length; i++ )
        {
            me.conversationsTabTag.find("ul").append( me.generateMessageTag(conversations[i]) );
        }
    }

    me.generateMessageTag = function( conversation )
    {
        const date = DateUtils.formatDisplayDateTime(conversation.time);
        if( conversation.direction == "from" )
        {
            return $( `<li id="${conversation.time}" class="clearfix ">
                        <div class="message-data align-right">
                            <span class="message-data-time">${date}</span> &nbsp; &nbsp;
                            <span class="message-data-name"> </span> <i class="fa fa-circle me"></i>
                        </div>
                        <div class="message other-message float-right">
                            <span>${conversation.msg}</span>
                        </div>
                    </li>` )
        }

        return $(`<li id="${conversation.time}" class="">
                    <div class="message-data">
                        <span class="message-data-time">${date}</span> &nbsp; &nbsp;
                        <span class="message-data-name"> </span> <i class="fa fa-circle me"></i>
                        
                        </div>
                        <div class="message my-message">
                            <span>${conversation.msg}</span>
                        </div>
                </li>`)
    }


	// --------------------------------
	// RUN Init method

    me.initialize();
}