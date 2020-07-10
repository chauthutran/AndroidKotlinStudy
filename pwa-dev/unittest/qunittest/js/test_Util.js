
QUnit.test( "Util.sortByKey", function() {
	var jsonData = [{
		"name": "Test 2",
		"created": "2019-01-02"
	},
	{
		"name": "Test 3",
		"created": "2019-01-02"
	},
	{
		"name": "Test 1",
		"created": "2019-01-02"
	}];

	var sortedData = Util.sortByKey( jsonData, 'name', undefined, 'Acending'); 
	ok( sortedData[0].name == "Test 1" && sortedData[1].name == "Test 2" && sortedData[2].name == "Test 3" , "Sort successfully !!!" );
});



