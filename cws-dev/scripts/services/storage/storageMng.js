// ============================
// = GOAL:
//      1. Create Our Layer Of API - For Both 'CallBack' & 'Promise'?
//          A . Use one method.  If 'callBack' is passed, use call back.  Otherwise, use promise.
//
//      2. 'Storage' Option:
//          A. Need to support Both..
//          B. But How would the switching occur?  Check Setting Info everytime of call, probably.
//              - But, Create Each Method to Call each Storage Specifically
//                Since we can easily use both case by case.
//
//      3. We could make static method..  with 'must' setup..
//          - But we could go through global initialization - to instantiate this 'storageManager' class
//              Expose the as globally?  Benefit!  will be undefined if not instantiated <-- easy to tell?
//
//      [NOTE]:
//          - EASY seperation between STATIC vs 'NEW' is if it stores local values...  Used multiple instance or not..
//                Or simply can be shared as global one.
//
//      [WARNINGS!!]
//          - '.setDriver()' sets for all 'localforage' usage at same time.
//            so, if 2nd call to 'setDriver' with indexedDB is called before 1st is done,
//            1st call might be effected and use indexedDB as well..
//          [SOLUTION] - Make sure to finish current operation before calling others..
//            --> Make sure the 'wait' is performed?  ASK TRAN!!
//
// ============================

function StorageMng() {};

//StorageMng.Type_IndexedDB = localforage.INDEXEDDB;
//StorageMng.Type_localStorage = localforage.LOCALSTORAGE;
//localforage.ready()

StorageMng.StorageType_LocalStorage = "LocalStorage"; // "LS"
StorageMng.StorageType_IndexedDB = "IndexedDB"; // "IDB"

// ===================================
// == OUR LAYER API ==================

// --- GET (READ)
StorageMng.getItem = async function( storageTypeStr, key, callBack )
{
  return localforage.setDriver( StorageMng.getStorageTypeDriver( storageTypeStr ) ).then( () => { // then( function() {
    //return StorageMng.getItem( key, callBack );
    return localforage.getItem( key, callBack );
  });
};

// --- SET (SAVE) (CREATE/UPDATE)
StorageMng.setItem = async function( storageTypeStr, key, value, callBack )
{
  return localforage.setDriver( StorageMng.getStorageTypeDriver( storageTypeStr ) ).then( () => {
    //return StorageMng.setItem( key, value, callBack );
    return localforage.setItem( key, value, callBack );  
  });
};

// -- DELETE a item
StorageMng.removeItem = async function( storageTypeStr, key, callBack )
{
  return localforage.setDriver( StorageMng.getStorageTypeDriver( storageTypeStr ) ).then( () => { 
    return localforage.removeItem( key, callBack );
  });
};

StorageMng.clear = async function( storageTypeStr, callBack )
{
  return localforage.setDriver( StorageMng.getStorageTypeDriver( storageTypeStr ) ).then( () => { 
    return localforage.clear( callBack );
  });
};

// ===================================
// == OTHER INFO/CASES.. ==================


// Method to get localForage storage type driver
StorageMng.getStorageTypeDriver = function( storageTypeStr )
{
  if ( storageTypeStr === StorageMng.StorageType_LocalStorage ) return localforage.LOCALSTORAGE;
  else if ( storageTypeStr === StorageMng.StorageType_IndexedDB ) return localforage.INDEXEDDB;
};



/*
localforage.setDriver( localforage.LOCALSTORAGE ).then( function() {

// Note: you must call config() before you interact with your data. 
// This means calling config() before using getItem(), ....
localforage.config({
    driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
    name        : 'myApp',
    version     : 1.0,
    size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
    storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
    description : 'some description'
});

*/


// ===================================
// == SAMPLE TRY ==================

/*
// Forcing localstorage here. Feel free to switch to other drivers :)
localforage.setDriver( localforage.LOCALSTORAGE ).then( function() {

  var key = 'STORE_KEY';
  // var value = 'What we save offline';
  var value = new Uint8Array(8);
  value[0] = 65
  // var value = undefined;
  var UNKNOWN_KEY = 'unknown_key';

  localforage.setItem(key, value, function() {

    console.log('Saved: ' + value);

    localforage.getItem(key, function(err, readValue) {

      console.log('Read: ', readValue);
    });

    // Since this key hasn't been set yet, we'll get a null value
    localforage.getItem(UNKNOWN_KEY, function(err, readValue) {
      console.log('Result of reading ' + UNKNOWN_KEY, readValue);
    });

  });

});
*/
