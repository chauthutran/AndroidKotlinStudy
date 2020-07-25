
function ManifestData() {}

ManifestData.get = function( url ) {
	return $.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		async: false
	}).responseText;
};
