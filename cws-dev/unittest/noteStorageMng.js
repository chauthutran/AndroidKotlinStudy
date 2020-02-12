// ============================
// = NOTE:
//
//    LocalStorage:
//      - put data in individual data?  Or put it in one data per app?
//
// ============================

function NoteStorageMng() {};

NoteStorageMng.key = "noteList";
NoteStorageMng.initialList = { noteList: [], lastIndex: 0 };

NoteStorageMng.StorageType_LocalStorage = "LS";
NoteStorageMng.StorageType_IndexedDB = "IDB";

// --------------------------------------------------

// --- GET (READ)
// GET 
NoteStorageMng.getItem = async function( storageType, callBack )
{
  return StorageMng.getItem( NoteStorageMng.getLocalForageDriver( storageType ), NoteStorageMng.key, callBack );
};

// --- SET (SAVE) (CREATE/UPDATE)

// SET 
NoteStorageMng.setItem = async function( storageType, jsonVal, callBack )
{
  return StorageMng.setItem( NoteStorageMng.getLocalForageDriver( storageType ), NoteStorageMng.key, jsonVal, callBack );
};

// -----------------------------------------

// Get Initial List Json
NoteStorageMng.getInitialList = function()
{
  // Need to get independent object, not same referenced one.
  var listStr = JSON.stringify( NoteStorageMng.initialList );
  return JSON.parse( listStr );
};


// Method to get localForage storage type driver
NoteStorageMng.getLocalForageDriver = function( storageType )
{
  if ( storageType === NoteStorageMng.StorageType_LocalStorage ) return localforage.LOCALSTORAGE;
  else if ( storageType === NoteStorageMng.StorageType_IndexedDB ) return localforage.INDEXEDDB;
}; 

try {
    
  // module.exports = HTMLTemplate;
  // module.exports = NoteStorageMng;
  // module.exports = AppSettingMng;
  // module.exports = StorageMng;
  module.exports = NoteStorageMng;
} catch (error) {
  console.log('we caught an error');
}
