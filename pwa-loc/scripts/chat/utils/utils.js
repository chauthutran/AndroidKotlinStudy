

function Utils() {}

// ==============================================================================
// For URL

Utils.getParamValueFromURL = function( paramName ) {
    return (new URLSearchParams(window.location.search)).get( paramName );
}


Utils.checkInternetStatusOnline = function() {
    return (navigator.onLine);
    
    // if (navigator.onLine) {
    //     return 
        // alert("Hi! You're online!!!");
    // } else {
        // alert("Oops! You're offline. Please check your network connection...");
    // }
}


// ==============================================================================
// For MESSAGES

Utils.formatMessage = function(sender, receiver, msg, filetype, name ) {
    return {
        sender,
        receiver,
        msg,
        filetype,
        name,
        datetime: DateUtils.getDbCurrentDateTime()
    };
}

Utils.mergeWithOfflineMessages = function( messageList, username1, username2 ) {
    var list = getOfflineMessages();
    for( var i=0; i<list.length; i++ )
    {
        const message = list[i];
        if( message.sender == username1 || message.receiver == username1 
            || message.sender == username2 || message.receiver == username2 )
            {
                messageList.push( message );
            }
    }

    return Utils.sortByKey( messageList, "datetime" );
}


// ==============================================================================
// For LIST

Utils.sortByKey = function( array, key, order ) {
	return array.sort( function( a, b ) {
		
		var x = a[key]; 
		var y = b[key];

		if ( x === undefined ) x = "";
		if ( y === undefined ) y = "";
		
		if ( order === undefined )
		{
			return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
		}
		else
		{
			if ( order == "asc" ) return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
			else if ( order == "desc" ) return ( ( x > y ) ? -1 : ( ( x < y ) ? 1 : 0 ) );
		}
	});
};


Utils.findItemFromList = function( list, value, propertyName ) {
	let item;

	if( list )
	{
		// If propertyName being compare to has not been passed, set it as 'id'.
		if ( propertyName === undefined )
		{
			propertyName = "id";
		}

		for( let i = 0; i < list.length; i++ )
		{
			let listItem = list[i];

			if ( listItem[propertyName] == value )
			{
				item = listItem;
				break;
			}
		}
	}

	return item;
}

Utils.removeFromArray = function( list, value, propertyName )
{
	var index;

	if( list )
	{
		$.each( list, function( i, item )
		{
			if ( item[ propertyName ] == value ) 
			{
				index = i;
				return false;
			}
		});
	
		if ( index !== undefined ) 
		{
			list.splice( index, 1 );
		}
	}
	

	return list;
}


// ==============================================================================
// For COLOR

Utils.stringToLightColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

Utils.stringToDarkColour = function(str) {
    const col = Utils.stringToLightColour( str );
    const amt = -50;
    return (((col & 0x0000FF) + amt) | ((((col >> 8) & 0x00FF) + amt) << 8) | (((col >> 16) + amt) << 16)).toString(16); 
}



// ==============================================================================
// For TEXT

Utils.insertText = function( inputField, insertedValue ) {
    var cursorPos = inputField.prop('selectionStart');
    var v = inputField.val();
    var textBefore = v.substring( 0, cursorPos );
    var textAfter  = v.substring( cursorPos, v.length );
    inputField.val( textBefore + insertedValue + textAfter );
}



Utils.convertUnicodeEmoji = function( text ) {
	// console.log(text);
	// const pattern = /[^\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug;
	// return text.replace(pattern, match => Utils.convertWhaspEmoji(match) );

	// return Utils.convertWhaspEmoji( text );

	
	var textArr = text.split(" ");
	var result = [];
	console.log(textArr);
	for( var j=0;j<textArr.length; j++ )
	{
		var word = textArr[j];
	
		// UTF-8 String
		if(word.charCodeAt(0) > 127)
		{
			console.log("utf8 : "  + word) ;
			result.push( Utils.convertWhaspEmoji( word ) );
			
		}
		else
		{
			result.push( word );
		}
	}
	
	return result.join("");
}

Utils.convertWhaspEmoji = function( unicodeEmoji ) {
	const utf8 = new Uint8Array(
		Array.prototype.map.call(
			unicodeEmoji, 
			c => c.charCodeAt(0)
		)
	);
console.log( new TextDecoder('utf8').decode(utf8));
	return new TextDecoder('utf8').decode(utf8);
}