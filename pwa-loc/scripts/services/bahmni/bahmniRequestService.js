function BahmniRequestService() { };

BahmniRequestService.SERVICE_BASE_URL = "http://localhost:3020/";
BahmniRequestService.pingLANNetwork = "https://172.30.1.77:8443/bahmni_test/patient.json";

BahmniRequestService.composeURL = function (bahmniUrl) {
	var baseUrlService = (WsCallManager.checkLocalDevCase(window.location.origin)) ? BahmniRequestService.SERVICE_BASE_URL : "";
	return baseUrlService + bahmniUrl;
};

BahmniRequestService.ping = function (url, exeFunc) {

	if ( url.indexOf( 'bahmni_test' ) >= 0 ) // Local Area Network Laptop Test Case - mock service
	{
			$.ajax({
			url: url, //BahmniRequestService.pingLANNetwork,
			type: "GET",
			headers: { 'Content-Type': 'application/json' },
			dataType: "json",
			success: function (response) {
				var urlObj = new URL(url);
				exeFunc({ status: "success", urlInfo: urlObj });
			},
			error: function (errMsg) {
				exeFunc({ status: "error" });
			}
		});
	}
	else {
		BahmniRequestService.sendPostRequest("syncDataRun", url, {}, function (response) {
			exeFunc(response);
		});
	}
}


BahmniRequestService.sendGetRequest = function (id, url, exeFunc) {
	$.ajax({
		url: BahmniRequestService.composeURL(url),
		type: "GET",
		headers: { 'Content-Type': 'application/json', 'Authorization': eval(INFO.bahmni_authBasicEval) },
		dataType: "json",
		success: function (response) {
			if (response.error) {
				INFO.bahmniResponseData[id] = [];
				exeFunc({ data: response.error.message, status: "error", url, id });
			}
			else {
				INFO.bahmniResponseData[id] = response;
				var urlObj = new URL(url);
				exeFunc({ data: response, status: "success", urlInfo: urlObj });
			}
		},
		error: function (errMsg) {
			INFO.bahmniResponseData[id] = [];
			exeFunc({ data: errMsg.statusText, status: "error", url, id });
		}
	});
}

BahmniRequestService.sendPostRequest = function (id, url, data, exeFunc) {
	$.ajax({
		url: BahmniRequestService.composeURL(url),
		type: "POST",
		headers: { 'Content-Type': 'application/json', 'Authorization': eval(INFO.bahmni_authBasicEval) },
		dataType: "json",
		data: JSON.stringify(data),
		async: true,
		success: function (response) {
			if (response.error) {
				INFO.bahmniResponseData[id] = [];
				exeFunc({ msg: response.error.message, status: "error", url, id });
			}
			else {
				INFO.bahmniResponseData[id] = response;
				var urlObj = new URL(url);
				exeFunc({ data: response, status: "success", urlInfo: urlObj });
			}
		},
		error: function (errMsg) {
			INFO.bahmniResponseData[id] = [];
			exeFunc({ msg: errMsg.statusText, status: "error", url, id });
		}
	});
}

BahmniRequestService.resetResponseData = function () {
	INFO.bahmniResponseData = {};
}
