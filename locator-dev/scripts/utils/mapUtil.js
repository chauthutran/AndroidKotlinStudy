function MapUtil() {}

MapUtil.toDegreesMinutesAndSeconds = function(coordinate) 
{
    var absolute = Math.abs(coordinate);
    var degrees = Math.floor(absolute);
    var minutesNotTruncated = (absolute - degrees) * 60;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    return degrees + "°" + Util.paddNumeric( minutes, 2 ) + "'" + Util.paddNumeric( seconds, 2 ) + '"';
}

MapUtil.convertDMS = function(lat, lng) 
{
    var latitude = toDegreesMinutesAndSeconds(lat);
    var latitudeCardinal = lat >= 0 ? "N" : "S";

    var longitude = toDegreesMinutesAndSeconds(lng);
    var longitudeCardinal = lng >= 0 ? "E" : "W";

    return latitude + " " + latitudeCardinal + "\n" + longitude + " " + longitudeCardinal;
}

MapUtil.transformIncomingCoordinates = function( incoming )
{
    //console.log( incoming.constructor );
    if (Array.isArray ( incoming ) )
    {

    }
    else if ( incoming.constructor == "string" )
    {
        //assume JSON?
    }
    return incoming;
}


//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
MapUtil.crowDistance = function ( lat1, lon1, lat2, lon2 ) 
{
  var rE = 6371; // radius of earth (metres)
  var dLat = MapUtil.toRad(lat2-lat1);
  var dLon = MapUtil.toRad(lon2-lon1);
  var lat1 = MapUtil.toRad(lat1);
  var lat2 = MapUtil.toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = rE * c;

  return d; // in metres
}

// Converts numeric degrees to radians
MapUtil.toRad = function( Value ) 
{
    return Value * Math.PI / 180;
}