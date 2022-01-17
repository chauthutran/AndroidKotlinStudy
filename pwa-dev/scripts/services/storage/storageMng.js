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
    return localforage.setItem( key, value, callBack );  // this 'callBack' is successCallBack.  If fails, it does not call this 'callBack'
  });
}

// -------------------------------
// --- TEST await...

StorageMng.getItem_IDB = async function( key )
{
  await localforage.setDriver( StorageMng.getStorageTypeDriver( StorageMng.StorageType_IndexedDB ) );
  return await localforage.getItem( key );
};

StorageMng.setItem_IDB = async function( key, value )
{
  await localforage.setDriver( StorageMng.getStorageTypeDriver( StorageMng.StorageType_IndexedDB ) );
  await localforage.setItem( key, value );
};

// -------------------------------


// TRAN TODO : StorageMng.removeItem doesn't work ( using unit test to test) 
// -- DELETE a item
StorageMng.removeItem = async function( storageTypeStr, key, callBack )
{
  return localforage.setDriver( storageTypeStr ).then( () => { 
    return localforage.removeItem( key, callBack );
  });
}
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
