
/* https://latest-data.ippf.org/api/dataStore/Connect_config/secret_passphrase ( POST )
 {
	"secretPassphrase": "secretPassphrase"
}

*/

function DBStorage() {

  var me = this;

 //  me.query_url_secretPassphrase = "api/dataStore/Connect_config/secret_passphrase";
  me.dbName = "cwsdb";
  me.dbStorageObject = "cwsStorageObject";
  me.dbVersion = 1;
  me.connectStatus = '';

  me.connect = function()
  {
       return new Promise((resolve, reject) => {
          // In the following line, you should include the prefixes of implementations you want to test.
         var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

         // DON'T use "var indexedDB = ..." if you're not in a function.
         // Moreover, you may need references to some window.IDB* objects:
         indexedDB.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
         indexedDB.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
         // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)


         // Let us open our database
         const request = indexedDB.open( me.dbName, me.dbVersion );
         request.onupgradeneeded = function(event) {
             var db = event.target.result;

             db.onerror = function(event) {
               console.log( 'Error loading database.' );
             };

             // Create an objectStore for this database
             var objectStore = db.createObjectStore( me.dbStorageObject, { keyPath: "name" } );

             // define what data items the objectStore will contain
             objectStore.createIndex("value", "value", { unique: false });

             // console.log( 'Object store created.' );
           };

         request.onsuccess = function() {
            me.connectStatus = ' ~ idxDb connect SUCCESS';
            resolve(request.result);
         }; 
         request.onerror = function() {
            me.connectStatus = ' ~ idxDb connect ERROR';
            reject(request.error);
         }; 
         request.onblocked = () => console.warn('pending till unblocked');
       });

  };


 me.storeData = function(conn, data) {
   return new Promise((resolve, reject) => {
     const tx = conn.transaction( me.dbStorageObject, "readwrite" );
     const store = tx.objectStore( me.dbStorageObject );
     const request = store.put(data);
     request.onsuccess = () => resolve(request.result);
     request.onerror = () => reject(request.error);
   });
 };


 me.retrieveData = function( conn, key )
 {
   return new Promise((resolve, reject) => {
     const tx = conn.transaction( me.dbStorageObject, "readwrite" );
     const store = tx.objectStore( me.dbStorageObject );
     const request = store.get( key );
     request.onsuccess = () => resolve(request.result);
     request.onerror = () => reject(request.error);
   });
 };


// ----------------------------------------------------


 me.loadAllData = async function( successFunc ) {

   let conn;
     try {
       conn = await me.connect();

       var list = [];
       // // Open our object store and then get a cursor list of all the different data items in the IDB to iterate through
       var objectStore = conn.transaction( me.dbStorageObject ).objectStore( me.dbStorageObject );

       objectStore.openCursor().onsuccess = function(event) {

           var cursor = event.target.result;
           // if there is still another cursor to go, keep runing this code
           if(cursor) {
           
             // build the to-do list entry and put it into the list item via innerHTML.
             list.push({"name": cursor.value.name , "value": cursor.value.value }) ;

             // continue on to the next item in the cursor
             cursor.continue();

           // if there are no more cursor items to iterate through, say so, and exit the function
           } else {
             // console.log( 'Entries all retrieved.' );
           }

         }

         successFunc( list );
     } finally {
       if ( conn ) conn.close();
     }

 };


   me.addData = async function ( key, value ) 
   {
     let conn;
     try {
       conn = await me.connect();
       await me.storeData( conn, { name: key, value: value } );

     } finally {
       if ( conn ) conn.close();
     }
   };


   me.getData = async function ( key, exeFunc ) 
   {
     let conn;
     try {
       //console.log('connect - waiting');
       conn = await me.connect();
       //console.log('connect - done');
       var data = await me.retrieveData( conn, key );
       //console.log('connect - retrieving data');
       data = ( data === undefined || data === null ) ? undefined : data;
       //console.log( data );
       if ( exeFunc ) exeFunc( data );

     } finally {
       if( conn ) conn.close();
     }
   };


   me.deleteData = async function( key )
   {
     let conn;
     try {
       let conn = await me.connect( me.dbName, me.dbVersion );
     
       var transaction = conn.transaction( [me.dbStorageObject ], "readwrite" );
       var request = transaction.objectStore( me.dbStorageObject ).delete(key);

       console.log( 'Delete successfuly.' ); 
     } finally {
       if( conn ) conn.close();
     }
   };

}
