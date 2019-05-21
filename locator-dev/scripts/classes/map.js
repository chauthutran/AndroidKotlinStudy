// -------------------------------------------
// -- Map Class/Methods

function CwSMap() {

    var me = this;

    me.googleStreets = true;

    me.cwsRenderObj;
    me.mapLibObj;

    me.mapTargetDiv = 'mapApp'; //$( '#mapApp' );
    me.mapApp = $( '#mapApp' );
    me.mapData = $( '#mapData' );

    me.lastSetView;
    me.controlTileLayerOptions;
    me.customFloatControl;

    me.defaultBaseLayer; // loaded in baseLayer fetch call "me.getBaseLayers()" // 'Open.StreetMap'; //'Roadmap'; //'Open.StreetMap';
    me.baseLayers;

    me.mapDefaults = { zoomControl: false, renderer: L.svg({ padding: 100 }) };
    me.distanceScale = { 'close': 500, 'nearby': 2000, 'further': 3000, '5km': 5000, '10km': 10000 }; //examples of predefined distance options for later use


// ==== Methods ======================

me.initialise = function( cwsRender)
{
    me.cwsRenderObj = cwsRender;
    me.mapLibObj = new L.map( me.mapTargetDiv, me.mapDefaults );

    // add locate-button > custom control for auto finding user's geoLocation
    L.control.locate().addTo( me.mapLibObj );

    // load base layers
    me.baseLayers = me.getBaseLayers();
    me.controlTileLayerOptions = L.control.layers( me.baseLayers , null, {position:'bottomright', opacitySlider: true}).addTo( me.mapLibObj );
    me.baseLayers[ me.defaultBaseLayer ].addTo( me.mapLibObj );

    // custom text search floating control 
    me.customFloatControl = L.control();
    me.customFloatControl.onAdd = function ( map ) {
        this._div = L.DomUtil.create('div', 'searchMap');
        this._div.innerHTML = me.floatingSearchLayout();
        return this._div;
    };
    me.customFloatControl.addTo( me.mapLibObj );

}

me.render = function( setView )
{

    if ( setView )
    {
        me.lastSetView = setView;
    }
    else
    {
        me.lastSetView = [ 0, 0 ]; //[ 27.84076, 82.76148 ];
    }


    $( '#mapApp' ).show( 'fast' );

    me.mapLibObj.invalidateSize();


    if ( ! setView ) 
    {
        //me.mapLibObj.setView( me.lastSetView, 10);

        me.mapLibObj.flyTo( me.lastSetView, 10, { animate: true, duration: .1 } );

        me.mapLibObj.locate( { setView: true, maxZoom: 16 } );

        //console.log( 'locating your position' );
        me.mapLibObj.on('locationfound', me.onLocationFound );
    }
    else
    {
        var radius = 10000; //metres - hardcoded
        var zoomLevel = 14;

        if ( me.lastSetView && me.lastSetView[ 0 ] )
        {
            if ( ( me.lastSetView[0] ).toString().indexOf('.') )
            {
                zoomLevel = ( ( ( me.lastSetView[0] ).toString().split( '.' )[1] ).toString().length * 2 );

                if ( ( ( me.lastSetView[0] ).toString().split( '.' )[1] ).toString().length >= 5 )
                {
                    radius = 50; 
                }
                else if ( ( ( me.lastSetView[0] ).toString().split( '.' )[1] ).toString().length >= 4 )
                {
                    radius = 100; // 4 decimals is within 11.132m
                }
                else if ( ( ( me.lastSetView[0] ).toString().split( '.' )[1] ).toString().length <= 3 )
                {
                    radius = 500;
                }
            }
        }

        me.mapLibObj.setView( me.lastSetView, 14 ); //
        var myMarkerIcon = L.AwesomeMarkers.icon({
            icon: '',
            markerColor: 'darkblue',
            prefix: 'fa',
            html: 'A'
            });
    
        L.marker( me.lastSetView, {icon: myMarkerIcon } ).addTo( me.mapLibObj )
            .bindPopup( me.myLocationPopupPromptMessage( me.lastSetView ) ).openPopup();

        //L.circle( me.lastSetView, radius, { stroke: true, weight: 2, color: '#ffffff', fillColor: '#136AEC', fillOpacity: 0.4 }  ).addTo( me.mapLibObj ).bindPopup( me.myLocationPopupPromptMessage( me.lastSetView ) ).openPopup();

        setTimeout(function(){ me.createPopupResults() }, 5000);
    }

}

me.onLocationFound = function(e) {

    var radius = 15; //( e.accuracy / 2 );
console.log( e );

    /*var myMarkerIcon = L.AwesomeMarkers.icon({
        icon: '',
        markerColor: 'darkblue',
        prefix: 'fa',
        html: 'A'
        });*/

    /*L.marker( e.latlng, {icon: myMarkerIcon } ).addTo( me.mapLibObj )
        .bindPopup( me.myLocationPopupPromptMessage( true, radius) ).openPopup();*/

    me.lastSetView = [ e.latlng.lat, e.latlng.lng ];

    L.circle( e.latlng, radius, { stroke: true, weight: 2, color: '#ffffff', fillColor: '#136AEC', fillOpacity: 0.4 }  ).addTo( me.mapLibObj ).bindPopup( me.myLocationPopupPromptMessage( e.latlng ) ).openPopup();

    setTimeout(function(){ me.createPopupResults() }, 5000);
}

me.myLocationPopupPromptMessage = function( latlng )
{
    console.log ( latlng);
    if ( latlng[0] ) console.log( MapUtil.toDegreesMinutesAndSeconds( latlng[0] ) );
    if ( latlng.lat ) console.log( MapUtil.toDegreesMinutesAndSeconds( latlng.lat ) );
    if ( latlng[1] ) console.log( MapUtil.toDegreesMinutesAndSeconds( latlng[1] ) );
    if ( latlng.lng ) console.log( MapUtil.toDegreesMinutesAndSeconds( latlng.lng ) );
    if ( latlng )
    {
        //return "<div style='padding:2px;'>" + latlng[0] + "," + latlng[1] + "</div>";
		return "Your chosen location<div style='padding:2px;'><div style='height:4px;border-bottom:1px solid #C0C0C0;'>&nbsp;</div><div style='padding:4px 2px 2px 2px;' id='loadIntialResults'>Finding nearby clinics <img src='images/loading.gif'></div></div>";
    }
    else
    {
        return "hello map";
    }

}

me.floatingSearchLayout = function()
{
    return '<div style="padding:5px;border-radius: 5px;background-Color:#fff;width:100%;"><i style="font-size:18px" class="fa">&#xf002;</i>&nbsp;<input type=text style="font-size:12pt;border:1px solid #F5F5F5;color:#C0C0C0;" value="Clinic Name" onclick="this.value=null;this.style.color=0"></div>';
}

me.restoreMapDefaults = function()
{
    me.mapApp.css( 'height', '100%' ); //screen.height + 'px'
    me.mapApp.css( 'zIndex', '100' );
    me.mapData.hide();

    if ( me.lastSetView )
    {
        console.log( ' got here ' );
        me.mapLibObj.setView( me.lastSetView );
        me.mapLibObj.invalidateSize();
    }
}

me.getBaseLayers = function()
{

    if ( ! me.googleStreets )
    {   
        var Open_StreetMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { opacity: 1 }); //, attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        var OpenTopoMap = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { opacity: 1, maxZoom: 17 }); //,attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        //var OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {opacity: 1, maxZoom: 18,attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
        var Hydda_Full = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', { opacity: 1 }); //, attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        var HikeBike_HikeBike = L.tileLayer('http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', { opacity: 1, maxZoom: 19 }); //,attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        //var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {opacity: 1, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',subdomains: 'abcd',maxZoom: 19});

        var baseMaps = {
            "Open.StreetMap": Open_StreetMap,
            "Topographic": OpenTopoMap,
            "Hydda.Full": Hydda_Full,
            "HikeBike": HikeBike_HikeBike
            //"PRINT: CartoDB.Positron": CartoDB_Positron
        };

        me.defaultBaseLayer = "Open.StreetMap";
    }
    else
    {

		var roadMutant = L.gridLayer.googleMutant({
			maxZoom: 24,
			type:'roadmap',
            styles: [
                { featureType: 'transit', elementType: 'labels.icon', stylers: [ {visibility: 'on'} ] },
                { featureType: 'poi.business', stylers: [ {visibility: 'on'} ] }
            ]
        
        });

		var satMutant = L.gridLayer.googleMutant({
			maxZoom: 24,
			type:'satellite'
		});

		var terrainMutant = L.gridLayer.googleMutant({
			maxZoom: 24,
			type:'terrain'
		});

		var hybridMutant = L.gridLayer.googleMutant({
			maxZoom: 24,
			type:'hybrid'
        });

		var trafficMutant = L.gridLayer.googleMutant({
			maxZoom: 24,
			type:'roadmap'
        });

		var transitMutant = L.gridLayer.googleMutant({
			maxZoom: 24,
			type:'roadmap'
        });

        var baseMaps = {
			'Roadmap': roadMutant,
			'Aerial': satMutant,
			'Terrain': terrainMutant,
			'Hybrid': hybridMutant,
			'Traffic': trafficMutant,
			'Transit': transitMutant
        };

        me.defaultBaseLayer = "Roadmap";

    }

    return baseMaps;
}

me.createPopupResults = function()
{
    $( '#loadIntialResults' ).html( '~ found 5 nearby:1000m' );

    var mapH = ( screen.height < 600 ) ? 300 : (screen.height / 2);

    me.cwsRenderObj.focusRelegator.css( 'zIndex', 100 );
    me.cwsRenderObj.focusRelegator.show();

    //me.mapApp.css( 'height', ( mapH + 25 ) );
    me.mapData.css( 'top', mapH + 'px' );
    me.mapData.css( 'height', ( screen.height - mapH ) + 'px' );
    me.mapData.css( 'zIndex', 101 );
    me.mapData.show( 'slow' );

    setTimeout(function(){ 
        me.mapLibObj.invalidateSize();
        me.mapData.html( '<img src="images/mockup_SearchResults.png">' );
    }, 400);

    /*var latLon = L.latLng( me.lastSetView[0], me.lastSetView[1] );
    var bounds = latLon.toBounds( 500 ); // 500 = metres
    me.mapLibObj.panTo( latLon ).fitBounds( bounds );*/

}

}
