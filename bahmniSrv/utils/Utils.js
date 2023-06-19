
const fetch = require("node-fetch");

class Utils {
	sendGetRequest(url, exeFunc) {};
	sendPostRequest(url, data, exeFunc) {};
}
  
class RequestUtils extends Utils {

	constructor() {
		super();
	};

    sendGetRequest = function( url, exeFunc ) {
        console.log(url);

        fetch(url, {
            method:'GET', 
            headers: {'Authorization': 'Basic ' + btoa('superman:Nuchange123')}})
            .then(response => response.json())
            .then((result) => {
                exeFunc({status: "success", data: result});
            }).catch((error) => {
                exeFunc({status: "error", data: error});
            });
	};

    sendPostRequest = function( url, data, exeFunc ) {
        console.log(url);
        
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", 'Authorization': 'Basic ' + btoa('superman:Nuchange123') },
            body: JSON.stringify(data)
        })
        .then((response) => response.json())
        .then((result) => {
            if( result.error )
            {
                exeFunc({status: "error", data: result.error.message});
            }
            else {
                exeFunc({status: "success", data: result});
            }
        }).catch((error) => {
            exeFunc({status: "error", data: error});
        });
	};

}

module.exports = {
    RequestUtils
};
  