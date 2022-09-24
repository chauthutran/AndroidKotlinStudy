function NetworkHelper() { };

NetworkHelper.arrTimes = [];
NetworkHelper.i = 0;
NetworkHelper.timesToTest = 5;
NetworkHelper.testImage = "../../images/px.gif"; // small image in your server
NetworkHelper.dummyImage = new Image();


NetworkHelper.reset = function () 
{    
    NetworkHelper.arrTimes = [];
    NetworkHelper.i = 0;
    NetworkHelper.timesToTest = 5;
    NetworkHelper.testImage = "../../images/px.gif"; // small image in your server
    NetworkHelper.dummyImage = new Image();
};

NetworkHelper.performLatency = function ( callBack ) 
{    
    NetworkHelper.reset();
    NetworkHelper.testLatency( callBack );
};

// test and average time took to download image from server, called recursively timesToTest times
NetworkHelper.testLatency = function ( callBack ) 
{    
    var tStart = new Date().getTime();

    if (NetworkHelper.i < NetworkHelper.timesToTest - 1) 
    {
        NetworkHelper.dummyImage.src = NetworkHelper.testImage + '?t=' + tStart;

        NetworkHelper.dummyImage.onload = function () 
        {
            var tEnd = new Date().getTime();
            var tTimeTook = tEnd - tStart;
            NetworkHelper.arrTimes[NetworkHelper.i] = tTimeTook;
            NetworkHelper.testLatency( callBack );
            NetworkHelper.i++;
        };
    } 
    else 
    {
        // calculate average of array items then callback
        var sum = NetworkHelper.arrTimes.reduce(function (a, b) { return a + b; });
        var avg = sum / NetworkHelper.arrTimes.length;
        callBack(avg);
    }
};
