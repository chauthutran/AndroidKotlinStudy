function RESTUtil(){}
RESTUtil.retrieveJson=function(url,returnFunc)
{RESTUtil.performREST(url,undefined,returnFunc)};RESTUtil.performREST=function(url,payloadData,returnFunc)
{fetch(url,payloadData).then(response=>{if(response.ok)return response.json();else if(response.statusText)throw Error(response.statusText)}).then(jsonData=>{returnFunc(!0,jsonData)}).catch(error=>{console.log('Failed to retrieve url - '+url);console.log(error);returnFunc(!1)})}