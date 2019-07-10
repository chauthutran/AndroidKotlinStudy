function MapUtil() {}


MapUtil.showInfo = function()
{
	$( 'div.info-floating-container' ).show();
    $( 'div.info-contents-container' ).html( MapUtil.getInfoContents() );

    setTimeout( function() {

        $( 'div.info-floating-container' ).hide();
        $( 'div.info-contents-container' ).empty();

    }, 10000 );

}

MapUtil.showAbout = function()
{
	$( 'div.info-floating-container' ).show();
	$( 'div.info-contents-container' ).html( MapUtil.getAboutContents() );
}

MapUtil.getAboutContents = function()
{
    return '<div style="background-Color:#fff;">' + 
            ' <table>' + 
            '  <tr>' + 
            '   <td style="width:20px;padding:0 3px 0 3px;vertical-align:top"><img src="images/Connect.svg" style="width:18px;height:18px;"></td>' + 
            '   <td>' + 
            '     <div style="line-height:1.5;font-size:14px;" term=""><strong>' + $( 'div.panel-header-title' ).html() + ' ' + $( '#appVersion').html() + '</strong></div>' +
            '     <div style="line-height:2;font-size:12px;" term="">Connecting you to provider sites and health services!</div>' +
            '     <div style="line-height:2;" ><u>coming soon</u>' + 
            '           <br> ~ franchisee opportunities' + 
            '           <br> ~ global health products' + 
            '    </div>' +
            '   </td>' + 
            '  </tr>' + 
            ' </table>' + 
            '</div>';
}

MapUtil.getInfoContents = function()
{
    return '<div style="background-Color:#FFF;">' + 
            ' <table>' + 
            '  <tr>' + 
            '   <td style="width:20px;padding:0 3px 0 3px;vertical-align:top"><img src="images/Connect.svg" style="width:18px;height:18px;"></td>' + 
            '   <td term="">Your current position is designated by an animated place marker. Move to a new position by dragging this marker. ' +
            '    <li class="fas fa-arrows-alt"></li>' +
            '   </td>' + 
            '  </tr>' + 
            ' </table>' + 
            '</div>';
}

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