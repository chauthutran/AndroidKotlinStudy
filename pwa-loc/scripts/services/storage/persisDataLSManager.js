//	TODO: ?: Rename to 'LSPersisDataLSManager'?
function PersisDataLSManager() {}

// ---------------------------
PersisDataLSManager.persisData_LS;

// --- top level keys (all object?)
PersisDataLSManager.KEY_PERSISDATA = "persisData";
PersisDataLSManager.KEY_VOUCHER_CODES = "voucherCodes";
PersisDataLSManager.KEY_JOB_FILING_STATUS = "jobFilingStatus";

// --- keys of object prop
PersisDataLSManager.KEY_TRANSLATION = "translation"; 
PersisDataLSManager.KEY_LANG_TERMS = "langTerms"; 
PersisDataLSManager.KEY_LANG_CODE = "langCode"; 
PersisDataLSManager.KEY_LANG_LASTTRYDT = "langLastTryDT"; 

// ----------------------------------------------------

PersisDataLSManager.initialDataLoad_LocalStorage = function()
{
    var persisData_LS = LocalStgMng.getJsonData( PersisDataLSManager.KEY_PERSISDATA );
    if ( !persisData_LS ) persisData_LS = {}; // if not exists, set as emtpy obj to store data.
    
    // If 'translation' not exists, create it.
    if ( !persisData_LS[ PersisDataLSManager.KEY_TRANSLATION ] ) persisData_LS[ PersisDataLSManager.KEY_TRANSLATION ] = {};

    PersisDataLSManager.persisData_LS = persisData_LS;
};

// --------------------------------------------

// Save to local storage
PersisDataLSManager.savePersisData = function( persisData_LS )
{
    // Get persisData_LS from localStorage if any. If not, use default persisData_LS
    if ( !persisData_LS ) persisData_LS = PersisDataLSManager.persisData_LS;
    
    LocalStgMng.saveJsonData( PersisDataLSManager.KEY_PERSISDATA, persisData_LS );
};

// ------------------------------------------------------------------------------------  
// ----------------  GET / UPDATE/ REMOVE Data by Key

PersisDataLSManager.getData = function( keyword )
{
    if ( keyword ) return PersisDataLSManager.persisData_LS[keyword];
    else return PersisDataLSManager.persisData_LS;
};

PersisDataLSManager.updateData = function( keyword, jsonData )
{
    // Get persisData_LS from localStorage if any. If not, use default persisData_LS
    var persisData_LS = PersisDataLSManager.persisData_LS;
    
    // Update data of persisData_LS by using keyword
    persisData_LS[keyword] = jsonData;

    PersisDataLSManager.savePersisData( persisData_LS );
};

PersisDataLSManager.removeData = function( keyword )
{
     // Get persisData_LS from localStorage if any. If not, use default persisData_LS
     var persisData_LS = PersisDataLSManager.persisData_LS;
    
     // Update data of persisData_LS by using keyword
     delete persisData_LS[keyword];
     
     // Update the 'persisData_LS' data
     PersisDataLSManager.savePersisData( persisData_LS );     
};
    
    
// --------------------------------------------------
// ------ 1st level 'key': 'value' get/update

PersisDataLSManager.updateKey_StrValue = function( key, valueStr )
{
    var persisData_LS = PersisDataLSManager.persisData_LS;
        
    persisData_LS[key] = valueStr;

    // Update data in memory
    PersisDataLSManager.savePersisData( persisData_LS );
};

PersisDataLSManager.getKeyValue = function( key )
{
    var persisData_LS = PersisDataLSManager.persisData_LS;
        
    var value = persisData_LS[key];
    if ( value === undefined ) value = '';

    return value;
};

// ------------------------------------

PersisDataLSManager.getPropertyValue = function( mainKey, subKey )
{
    // Get persisData_LS from localStorage if any. If not, use default persisData_LS
    var persisData_LS = PersisDataLSManager.persisData_LS;    
    var mainInfo = persisData_LS[mainKey];

    return ( mainInfo == undefined ) ? undefined : persisData_LS[mainKey][subKey];
};

PersisDataLSManager.updatePropertyValue = function( mainKey, subKey, valStr )
{
    // Get persisData_LS from localStorage if any. If not, use default persisData_LS
    var persisData_LS = PersisDataLSManager.persisData_LS;
    
    // Update sub value by using keyword
    if( persisData_LS[mainKey] == undefined )
    {
        persisData_LS[mainKey] = {};
    }
    
    persisData_LS[mainKey][subKey] = valStr;

    // Update data in memory
    PersisDataLSManager.savePersisData( persisData_LS );
};

PersisDataLSManager.removeProperty = function( mainKey, subKey )
{
    // Get persisData_LS from localStorage if any. If not, use default persisData_LS
    var persisData_LS = PersisDataLSManager.persisData_LS;

    if ( persisData_LS[mainKey] )
    {
        Util.tryCatchContinue( function() 
        {
            delete persisData_LS[mainKey][subKey];

            // Update the 'persisData_LS' data
            PersisDataLSManager.savePersisData( persisData_LS );  

        }, 'PersisDataLSManager.removeProperty' );
    }
};


// ----------------------------------------------
// ------ Translatoin langTerms

PersisDataLSManager.updateLangTerms = function( jsonData )
{
    PersisDataLSManager.updatePropertyValue( PersisDataLSManager.KEY_TRANSLATION, PersisDataLSManager.KEY_LANG_TERMS, jsonData );
};

PersisDataLSManager.getLangTerms = function()
{
    return PersisDataLSManager.getPropertyValue( PersisDataLSManager.KEY_TRANSLATION, PersisDataLSManager.KEY_LANG_TERMS );
};	


// GETS USED WHEN UserInfo gets 1st created..
PersisDataLSManager.getLangCode = function()
{
	var langCode = '';

	try
	{        
        var langCode = PersisDataLSManager.getPropertyValue( PersisDataLSManager.KEY_TRANSLATION, PersisDataLSManager.KEY_LANG_CODE );
             	        
        if ( !langCode )
        {
            langCode = ( navigator.language ).toString().substring(0,2);

            if ( langCode ) PersisDataLSManager.setLangCode( langCode );
        }        
	}
	catch ( err )
	{
		console.log( 'Error in PersisDataLSManager.getLangCode: ' + err );
	}

	return langCode;
};

PersisDataLSManager.setLangCode = function( langCode )
{
    PersisDataLSManager.updatePropertyValue( PersisDataLSManager.KEY_TRANSLATION, PersisDataLSManager.KEY_LANG_CODE, langCode );
};


PersisDataLSManager.getLangLastDateTime = function()
{
    var langLastDateTime = PersisDataLSManager.getPropertyValue( PersisDataLSManager.KEY_TRANSLATION, PersisDataLSManager.KEY_LANG_LASTTRYDT );
    return ( langLastDateTime ) ? langLastDateTime : "";
};

PersisDataLSManager.setLangLastDateTime = function( dateObj )
{
    var langLastDateTimeStr = Util.formatDate( dateObj );
    PersisDataLSManager.updatePropertyValue( PersisDataLSManager.KEY_TRANSLATION, PersisDataLSManager.KEY_LANG_LASTTRYDT, langLastDateTimeStr );
};


// ----------------------------------------------------
// ---- VoucherCodes Queue Related

PersisDataLSManager.getVoucherCodes_queue = function() 
{
    // After getting the list, use the top one?  and add to bottom 
    var queue = PersisDataLSManager.getPropertyValue( PersisDataLSManager.KEY_VOUCHER_CODES, 'queue' );
    if ( !queue ) queue = [];

    return queue;
};

PersisDataLSManager.updateVoucherCodes_queue = function( queueData ) 
{
    PersisDataLSManager.updatePropertyValue( PersisDataLSManager.KEY_VOUCHER_CODES, 'queue', queueData );
};

// -----------------

PersisDataLSManager.getVoucherCodes_usedQueue = function() 
{
    return PersisDataLSManager.getPropertyValue( PersisDataLSManager.KEY_VOUCHER_CODES, 'usedQueue' );
};

PersisDataLSManager.updateVoucherCodes_usedQueue = function( usedQueueData ) 
{
    PersisDataLSManager.updatePropertyValue( PersisDataLSManager.KEY_VOUCHER_CODES, 'usedQueue', usedQueueData );
};

// -----------------

PersisDataLSManager.getVoucherCodes_info = function() 
{
    return PersisDataLSManager.getPropertyValue( PersisDataLSManager.KEY_VOUCHER_CODES, 'info' );
};

PersisDataLSManager.updateVoucherCodes_info = function( infoData ) 
{
    PersisDataLSManager.updatePropertyValue( PersisDataLSManager.KEY_VOUCHER_CODES, 'info', infoData );
};

// ----------------------------------------------
// ------ Job Aid Filiing Status info

PersisDataLSManager.getJobFilingStatus = function() 
{ 
    return PersisDataLSManager.getData( PersisDataLSManager.KEY_JOB_FILING_STATUS ); 
};

PersisDataLSManager.getJobFilingProjDirStatus = function( projDir )
{
    var jobFilingStatusJson = PersisDataLSManager.getJobFilingStatus();

    return ( jobFilingStatusJson && jobFilingStatusJson[ projDir ] ) ? jobFilingStatusJson[ projDir ] : {};    
};

PersisDataLSManager.updateJobFilingProjDirStatus = function( projDir, jsonData )
{
    PersisDataLSManager.updatePropertyValue( PersisDataLSManager.KEY_JOB_FILING_STATUS, projDir, jsonData );
};

PersisDataLSManager.deleteJobFilingProjDir = function( projDir )
{
    PersisDataLSManager.removeProperty( PersisDataLSManager.KEY_JOB_FILING_STATUS, projDir );
};
