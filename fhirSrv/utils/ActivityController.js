
const { Blob } = require('node:buffer');

const {
	_FHIR_HOST,
	_PRACTITIONER_LIST
} = require('./../config');

const {RESTRequestUtils} = require("./RESTRequestUtils");
const requestUtils = new RESTRequestUtils();

const {Utils} = require("./Utils");
const utils = new Utils();

class ActivityController {

	constructor() {
		this.headers = ["qrId", "patientId", "firstName", "lastName", "activityId", "trxType", "activityType", 
				"voucherCodes", "referralDate", "clinicReferred", "dateCaptured", "orginalData"];
	};

	loadActivities = function (type, exeFunc) {
		var me = this;

		me.getPractitionersByIds(function (response) {
			if (response.status == "success") {
				me.getQRsByPractitionerIds(response.data, function(qrResponse) {
					if( qrResponse.status == "success" )
					{
						var resultData = [];
						var list = qrResponse.data.fhirResult.entry;
						for (var i = 0; i < list.length; i++) {
							var item = list[i].resource;
							var qrId = item.id;
							var patientId = item.subject.reference.replace("Patient/",""); // NEED to add info of firstName, lastName
							var firstName = me.getInfoFromItem(item, "firstName");
							var lastName = me.getInfoFromItem(item, "lastName");
							var activityId = me.getInfoFromExtension(item, "http://sample.info/activityId"); // OR should I get it from item[x].linkId = "activityid"
							var trxType = me.getInfoFromExtension(item, "http://sample.info/transType");
							var activityType = me.getInfoFromExtension(item, "http://sample.info/activityType");
							var voucherCodes = me.getInfoFromItem(item, "voucherCode");
							var referralDate = me.getInfoFromItem(item, "referralDate");
							var clinicReferred = me.getInfoFromItem(item, "referral");
							var dateCaptured = item.authored;

							resultData.push({qrId: qrId, patientId, firstName, lastName, activityId, dateCaptured, trxType, activityType, voucherCodes, referralDate, clinicReferred, orginalData: item });
						}

						if( type == "csv" )
						{
							if( resultData.length > 0 )
							{
								var headers = Object.keys(resultData[0]);
								// exeFunc(me.exportCSVFile(headers, resultData));

								exeFunc({status: "success", data: me.convertToCSV(headers, resultData)});
							}
							else
							{
								exeFunc({status: "success", data: ""});
							}
						}
						else
						{
							exeFunc({status: "success", data: resultData});
						}
					}
					else
					{
						exeFunc(qrResponse);
					}
				})
			}
			else
			{
				exeFunc(response);
			}
		})
	}

	getInfoFromExtension = function( data, urlVal )
	{
		var found = utils.findItemFromList(data.extension, urlVal, "url");
		return (found) ? found.valueString : "";
	};

	getQRsByPractitionerIds = function (ids, exeFunc) {

		if( ids.length > 0 )
		{
			var url = _FHIR_HOST + "QuestionnaireResponse?subject:Patient.general-practitioner=" + ids.join(",")
			requestUtils.sendGetRequest(url, function (response) {
				exeFunc(response);
			});
		}
		else
		{
			exeFunc({status: "success", data: []});
		}
	};

	
	
	exportCSVFile = function(headers, jsonList, fileTitle) {
		if (headers) {
			jsonList.unshift(headers);
		}

		// Convert Object to JSON
		// var jsonObject = JSON.stringify(jsonList);

		var csv = this.convertToCSV(headers, jsonList);

		var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

		var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		if (navigator.msSaveBlob) { // IE 10+
			navigator.msSaveBlob(blob, exportedFilenmae);
		} else {
			var link = document.createElement("a");
			if (link.download !== undefined) { // feature detection
				// Browsers that support HTML5 download attributef
				var url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", exportedFilenmae);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	}

	// --------------------------------------------------------------------------------
	// Supportive methods

	getInfoFromItem = function( data, propValue )
	{
		var found = utils.findItemFromList(data.item, propValue, "linkId" );
		if( found && found.answer && found.answer.length > 0 )
		{
			return found.answer[0].valueString;
		}

		return "";
	};

	getPractitionersByIds = function (exeFunc) {
		var url = _FHIR_HOST + "Practitioner?identifier=" + _PRACTITIONER_LIST;
		
		requestUtils.sendGetRequest(url, function (response) {
			if (response.status == "success") {
				var idList = [];
				var entry = response.data.fhirResult.entry;
				for (var i = 0; i < entry.length; i++) {
					var id = entry[i].resource.id;
					idList.push(id);
				}

				exeFunc({ status: response.status, data: idList });
			} else {
				exeFunc(response);
			}
		});
	};

	convertToCSV = function( headers, list )
	{
		console.log(headers);
		var me = this;
		var csv = list.map(function(row){
			return headers.map(function(fieldName){
				return JSON.stringify(row[fieldName]).split(",").join("###COMMA###");
			}).join(',')
		});

		csv.unshift(headers.join(',')) // add header column
		csv = csv.join('\r\n'); // break into separate lines

		return csv;
	};

	replacerValue = function( key, value)
	{
		console.log(key + ": " + value);
		if(key=="orginalData" ) console.log(value);

		if( value == null ) return "";

		if(key=="orginalData" ) {
			console.log();
			return "\\" + JSON.stringify(value).replace( /\\"/g , "\"\"" ) + "\\";
		}

		return value;
	}

}

module.exports = {
	ActivityController
};