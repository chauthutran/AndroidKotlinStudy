// =========================================
// === Message with entire screen blocking
function MatomoHelper() {}

MatomoHelper.dataList = [];

MatomoHelper.getQueueList = function () 
{
    MatomoHelper.getQueue().then(function (queue) 
    {
        MatomoHelper.dataList = [];
       
        queue.openCursor().onsuccess = function(event) 
        {
            var cursor = event.target.result;
            if (cursor) {
                cursor.continue();
                console.log( cursor.value ); 
                MatomoHelper.dataList.push( cursor.value );
            }  
        }

    });
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
            console.error("Error", request.error);
            reject(new Error(request.error));
        };

        request.onupgradeneeded = function(event) {
            console.log('onupgradeneeded')
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


MatomoHelper.syncQueue = function()
{
    // check something in indexdb
    return MatomoHelper.getQueue().then(function (queue) {
        queue.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor && navigator.onLine) {
                cursor.continue();
                var queueId = cursor.value.id;

                var secondsQueuedAgo = ((Date.now() - cursor.value.created) / 1000);
                secondsQueuedAgo = parseInt(secondsQueuedAgo, 10);

                // if (secondsQueuedAgo > maxTimeLimit) { // too old  MatomoHelper.getQueue().then(function (queue) {  queue.delete(queueId);

                console.log("Cursor " + cursor.key);

                var init = {
                    headers: cursor.value.headers,
                    method: cursor.value.method,
                }
                if (cursor.value.body) {
                    init.body = cursor.value.body;
                }

                if (cursor.value.url.includes('?')) {
                    cursor.value.url += '&cdo=' + secondsQueuedAgo;
                } else if (init.body) {
                    // todo test if this actually works for bulk requests
                    init.body = init.body.replace('&idsite=', '&cdo=' + secondsQueuedAgo + '&idsite=');
                }

                fetch(cursor.value.url, init).then(function (response) {
                    console.log('server response', response);
                    if (response.status < 400) {
                        MatomoHelper.getQueue().then(function (queue) {
                            queue.delete(queueId);
                        });
                    }
                }).catch(function (error) {
                    console.error('Send to Server failed:', error);
                    throw error
                })
            }
            else {
                console.log("No more entries!");
            }
        };
    });
};
