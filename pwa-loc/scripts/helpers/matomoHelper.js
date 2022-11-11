// =========================================
// === Message with entire screen blocking
function MatomoHelper() {};

MatomoHelper.enabled = true;
MatomoHelper.prcCheckEnabled = false;
MatomoHelper.processed = {};

MatomoHelper.processQueueList = function ( sourceDesc ) 
{
    if ( navigator.onLine )
    {
        //console.log( "[MatomoHelper] - processQueueList, getQueue: " + Util.getStr( sourceDesc ) );

        if ( MatomoHelper.enabled )
        {
            MatomoHelper.getQueue().then(function (queue) 
            {
                //console.log( "[MatomoHelper] - Queue Processing" );
        
                queue.openCursor().onsuccess = function(event) 
                {
                    var cursor = event.target.result;
                    if (cursor && navigator.onLine) 
                    {
                        cursor.continue();
    
                        try
                        {
                            var queueId = cursor.value.id;
                            var secondsQueuedAgo = ((Date.now() - cursor.value.created) / 1000);

                            console.log("[MatomoHelper] - Cursor: " + cursor.key + ", " + queueId);
            

                            // #1. Build/Modify new request info (header/method/body)
                            var init = {
                                headers: cursor.value.headers,
                                method: cursor.value.method
                            };
                            if (cursor.value.body) init.body = cursor.value.body;
            
                            if (cursor.value.url.includes('?')) cursor.value.url += '&cdo=' + secondsQueuedAgo + '&fromWFAHelper=Y';
                            else if (init.body) init.body = init.body.replace('&idsite=', '&cdo=' + secondsQueuedAgo + '&fromWFAHelper=Y' + '&idsite=');
            
                            // Handle the old address - replace with new.
                            MatomoHelper.fixUrl_PSI( cursor.value ); // 'matomo.solidlines.io' ==> 'matomo.psi-mis.org'
                            MatomoHelper.fixUrl_CurrentTime( cursor.value );
    
                            //if ( !MatomoHelper.processed[queueId] ) {  if ( MatomoHelper.prcCheckEnabled ) MatomoHelper.processed[queueId] = true;

                            // #2. Submit the rquest
                            fetch(cursor.value.url, init).then(function (response) 
                            {
                                //console.log('[MatomoHelper] - Fetch - server response', response);
            
                                // If success, remove from the queue
                                if (response.status < 400) { 
                                    MatomoHelper.getQueue().then(function (queue) {  
                                        queue.delete(queueId);  
                                        //if ( MatomoHelper.prcCheckEnabled && MatomoHelper.processed[queueId] ) delete MatomoHelper.processed[queueId];
                                    });
                                }
                                else {
                                    //if ( MatomoHelper.prcCheckEnabled && MatomoHelper.processed[queueId] ) delete MatomoHelper.processed[queueId];
                                }                
                            }).catch(function (error) {
                                console.error('[MatomoHelper] - Fetch Failed:', error);
                                //if ( MatomoHelper.prcCheckEnabled && MatomoHelper.processed[queueId] ) delete MatomoHelper.processed[queueId];
                                // throw error
                            });
                        }
                        catch ( errMsg )
                        {
                            console.log( '[MatomoHelper] - ERROR in MatomoHelper.processQueueList' );
                        }
                    }
                    else {                  
                        //console.log( "[MatomoHelper] - Finished Queue Processing" );
                    }
                };
            });
        }
    }
};

MatomoHelper.fixUrl_PSI = function( urlObj )
{
    if ( urlObj.url && urlObj.url.indexOf( 'matomo.solidlines.io' ) >= 0 ) urlObj.url = urlObj.url.replace( 'matomo.solidlines.io', 'matomo.psi-mis.org' );
};

MatomoHelper.fixUrl_CurrentTime = function( urlObj )
{
    try
    {
        if ( urlObj.url && urlObj.created ) 
        {
            urlObj.url += '&cdt=' + Math.floor(urlObj.created / 1000);
        }
    }
    catch( errMsg )
    {
        console.log( 'ERROR in fixUrl_CurrentTime, ' + errMsg );
    }
};


MatomoHelper.getQueue = function()
{
    return new Promise(function(resolve, reject) {
        // do a thing, possibly async, then...

        if (!indexedDB) {
            reject(new Error('No support for IndexedDB'));
            return;
        }
        var request = indexedDB.open("matomo", 1);

        request.onerror = function() {
            console.error("[MatomoHelper] - Error", request.error);
            reject(new Error(request.error));
        };

        request.onupgradeneeded = function(event) {
            console.log('[MatomoHelper] - onupgradeneeded')
            var db = event.target.result;

            if (!db.objectStoreNames.contains('requests')) {
                db.createObjectStore('requests', {autoIncrement : true, keyPath: 'id'});
            }
        };

        request.onsuccess = function(event) {
            var db = event.target.result;
            let transaction = db.transaction("requests", "readwrite");
            let requests =transaction.objectStore("requests");
            resolve(requests);
        };
    });
};
