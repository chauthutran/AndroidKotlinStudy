function ChatApp( userName )
{
    var me = this;

    me.socketIOObj;
    me.socket;
    me.username = userName;
    me.curUser = {};

    me.chatFormObj;

    // ------------------------------------------------------------------------
	// INIT method

    me.init = function() 
    {
        var userNameParam = Utils.getParamValueFromURL("username");

        if ( !me.username && userNameParam ) me.username = userNameParam;

        if ( me.username )
        {
            me.initSocketIO();
        }
    }

    me.initSocketIO = function() {
        me.socketIOObj = new SocketIO( me.username );
        me.socket = me.socketIOObj.socket;
        me.chatFormObj = me.socketIOObj.chatFormObj;
    }


    // ------------------------------------------------------------------------
	// RUN init method

    me.init();
}