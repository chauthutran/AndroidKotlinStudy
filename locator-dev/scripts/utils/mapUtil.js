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
