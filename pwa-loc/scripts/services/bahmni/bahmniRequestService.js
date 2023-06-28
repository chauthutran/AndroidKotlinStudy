function BahmniRequestService() {}

BahmniRequestService.SERVICE_BASE_URL = "http://localhost:3020/";

BahmniRequestService.composeURL = function( bahmniUrl )
{
    var baseUrlService = ( WsCallManager.checkLocalDevCase( window.location.origin ) ) ? BahmniRequestService.SERVICE_BASE_URL : "";
    return baseUrlService + bahmniUrl;
};

BahmniRequestService.sendGetRequest = function(id, url, exeFunc )
{
    $.ajax({
        url: BahmniRequestService.composeURL(url),
        type: "GET",
        headers: { 'Content-Type': 'application/json','Authorization': eval(INFO.bahmni_authBasicEval) },
        dataType: "json", 
        success: function (response) 
        {
            if( response.error)
            {
                INFO.bahmniResponseData[id] = [];
                exeFunc({data: response.error.message, status: "error"});
            }
            else
            {
                INFO.bahmniResponseData[id] = response;
                exeFunc({data: response, status: "success"});
            }
        },
        error: function ( errMsg ) {
            INFO.bahmniResponseData[id] = [];
            exeFunc({ data: errMsg, status: "error" });
        }
    });
}

BahmniRequestService.sendPostRequest = function(id, url, data, exeFunc )
{
    $.ajax({
        url: BahmniRequestService.composeURL(url),
        type: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': eval(INFO.bahmni_authBasicEval) },
        dataType: "json", 
        data: JSON.stringify(data),
        async: true,
        success: function (response) 
        {
            if( response.error)
            {
                INFO.bahmniResponseData[id] = [];
                exeFunc({msg: response.error.message, status: "error"});
            }
            else
            {
                INFO.bahmniResponseData[id] = response;
                exeFunc({data: response, status: "success"});
            }
        },
        error: function ( errMsg ) {
            INFO.bahmniResponseData[id] = [];
            exeFunc({msg: errMsg, status: "error"});
        }
    });
}