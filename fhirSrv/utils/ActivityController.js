const fetch = require("node-fetch");
const {
	_FHIR_HOST,
	_PRACTITIONER_LIST
} = require('./../config');

const {RESTRequestUtils} = require("./RESTRequestUtils");
const requestUtils = new RESTRequestUtils();

const {Utils} = require("./Utils");
const utils = new Utils();

class ActivityController {

	constructor() {};

	loadActivities = function (exeFunc) {
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
							var clinicReferredTo = me.getInfoFromItem(item, "referral");

							// , Date captured, client names.
							resultData.push({id: qrId, patientId, firstName, lastName, activityId, trxType, activityType, voucherCodes, referralDate, clinicReferredTo });
						}

						exeFunc({status: "success", data: resultData});
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
		return (found) ? found.value : "";
	};

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
}

module.exports = {
	ActivityController
};