// -------------------------------------------
// -- RESTUtil Class/Methods

function RESTUtil() {}

// ==== Methods ======================
RESTUtil.retrieveJson = function( url, returnFunc )
{
    fetch( url )
    .then( response => {
        if ( response.ok ) return response.json();
        else throw Error( response.statusText );
    })
    .then( jsonData => {
        returnFunc( jsonData );
    })
    .catch( error => {  
        console.log( 'Failed to retrieve url - ' + url );
        console.log( error );  
        //alert( 'Failed to load the config file' );
        returnFunc();
    });
};