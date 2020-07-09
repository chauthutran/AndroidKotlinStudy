

var Db_Username = "TestClientDataManager_Username";


function clearDb( keyName )
{
//   if( keyName == undefined )  Constants.storageName_clientList + '_' + Db_Username;
  DataManager2.deleteDataByStorageType ( DataManager2.dbStorageType_indexdb , keyName );
}

function cleanAll()
{
  DataManager2.deleteAllStorageData( function(){
    console.log("All test data is clearn !!");
  } ) 
}
