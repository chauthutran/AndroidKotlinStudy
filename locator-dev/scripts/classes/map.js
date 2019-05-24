// -------------------------------------------
// -- Map Class/Methods

function CwSMap() {

    var me = this;

    me.googleStreets = true;

    me.cwsRenderObj;
    me.mapLibObj;

    me.mapTargetDiv = 'mapApp'; //$( '#mapApp' );
    me.mapDiv = $( '#mapApp' );
    me.panelBottom = $( '#panelBottom' );

    me.defaultCoordinatePoint;

    me.controlSearchbox
    me.controlTileLayerOptions;
    me.controlScale;
    me.controlZoom;
    me.controlLocateUser;
    me.controlListViewRound;
    me.controlPOCsearch;

    me.displayControlLocateUser = false;
    me.displayControlScale = false;
    me.displayControlListViewRound = true;

    me.defaultBaseLayer; // loaded in baseLayer fetch call "me.getBaseLayers()" // 'Open.StreetMap'; //'Roadmap'; //'Open.StreetMap';
    me.baseLayers;

    me.searchControlOpts = [];
    me.searchType = {};
    me.searchWords = [];
    me.mapDefaults = { zoomControl: false, renderer: L.svg({ padding: 100 }) };
    me.distanceScale = { 'close': 500, 'nearby': 2000, 'further': 3000, '5km': 5000, '10km': 10000 }; //examples of predefined distance options for later use

// ==== Methods ======================

me.initialise = function( cwsRender)
{
    me.cwsRenderObj = cwsRender;

    me.mapLibObj = new L.map( me.mapTargetDiv, me.mapDefaults );

    me.initialiseMapControls();
    me.initialiseMapEvents();
 
    //if ( Util.isMobi() ) me.mapDiv.css( 'width', '100vw' ); //100vw = 100% of viewport (not of parent element)
    //else 
    me.mapDiv.css( 'width', '100%' );

    me.initialisePageControls();
    me.initialiseSearchControlOptions();
    me.initialiseEvents();

}

me.render = function( defCoords )
{

    me.restoreMapDefaults();

    if ( defCoords )
    {
        me.defaultCoordinatePoint = defCoords;
    }
    else
    {
        me.defaultCoordinatePoint = [ 0, 0 ]; //[ 27.84076, 82.76148 ];
    }


    $( '#mapApp' ).show( 'fast' );

    me.mapLibObj.invalidateSize();

    if ( ! defCoords ) 
    {
        me.mapLibObj.setView( me.defaultCoordinatePoint, 10, { animate: true, duration: .1 } ); //flyTo
        me.mapLibObj.locate( { setView: true, maxZoom: 16 } );
        me.mapLibObj.on('locationfound', me.onLocationFound );
    }
    else
    {
        var radius = 10000; //metres - hardcoded
        var zoomLevel = 14;

        if ( me.defaultCoordinatePoint && me.defaultCoordinatePoint[ 0 ] )
        {
            if ( ( me.defaultCoordinatePoint[0] ).toString().indexOf('.') )
            {
                zoomLevel = ( ( ( me.defaultCoordinatePoint[0] ).toString().split( '.' )[1] ).toString().length * 2 );

                if ( ( ( me.defaultCoordinatePoint[0] ).toString().split( '.' )[1] ).toString().length >= 5 )
                {
                    radius = 50; 
                }
                else if ( ( ( me.defaultCoordinatePoint[0] ).toString().split( '.' )[1] ).toString().length >= 4 )
                {
                    radius = 100; // 4 decimals is within 11.132m
                }
                else if ( ( ( me.defaultCoordinatePoint[0] ).toString().split( '.' )[1] ).toString().length <= 3 )
                {
                    radius = 500;
                }
            }
        }

        me.mapLibObj.setView( me.defaultCoordinatePoint, 14 ); 
        var myMarkerIcon = L.AwesomeMarkers.icon({
            icon: '',
            markerColor: 'red',
            prefix: 'fa',
            html: 'A'
            });
    
        L.marker( me.defaultCoordinatePoint, {icon: myMarkerIcon } ).addTo( me.mapLibObj )
            .bindPopup( me.myLocationPopupPromptMessage( me.defaultCoordinatePoint ) ); //.openPopup();

    }

    $( "div.search-options-inner" ).empty();
    $( "div.search-options-inner" ).append( me.returnSearchOptionsContent() );

    me.setMapDefaults();
}

me.initialiseEvents = function()
{
    
    $( 'div.listview-toggle' ).on('click', function(e) { 

        me.toggleShowPanelBottom();

    });
}

me.initialiseMapEvents = function()
{
    me.mapLibObj.on('click', function(e) { 

        if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);

        if ( $( 'div.search-options-container' ).is( ':visible') ) $(".search-options-container").toggle("slide", { direction: "up" }, 200);

    });

    me.mapLibObj.on('resize', function () {

        me.mapLibObj.invalidateSize();
        me.resizeSearchBox();

    });

}

me.initialiseMapControls = function()
{
    
    if ( ! Util.isMobi() )
    {
        me.controlZoom = L.control.zoom( { position: 'bottomright' } ).addTo( me.mapLibObj );
    }

    // round 'List' floating icon
    me.controlListViewRound = me.createListviewControl();

    // show miles/kilometers
    me.controlScale = L.control.scale( { metric: true } ).addTo( me.mapLibObj );


    // load base layers
    me.baseLayers = me.getBaseLayers();
    me.baseLayers[ me.defaultBaseLayer ].addTo( me.mapLibObj ); // load default base layer


    // custom text search floating control 
    var searchboxControl = createSearchboxControl ();
    me.controlSearchbox = new searchboxControl({
        sidebarTitleText: 'Provider Locator',
        sidebarMenuItems: {
            Items: [
                { type: "button", name: "My Location", onclick: "document.getElementsByClassName('leaflet-control-locate')[0].children[0].click();", icon: "fas fa-map-marker-alt", group: 0 },
                { type: "link", name: "My Appointments", href: "#", icon: "icon-cloudy", group: 1 },
                { type: "button", name: "My Ratings", onclick: "alert('button 1 clicked !')", icon: "icon-potrait", group: 0 },
                { type: "button", name: "Find Beer", onclick: "button2_click();", icon: "icon-local-dining", group: 1 },
                { type: "link", name: "Refer Someone", href: '#', icon: "icon-bike", group: 0 },
            ]
        }
    });
    me.controlSearchbox._searchfunctionCallBack = function (searchkeywords)
    {
        if (!searchkeywords) {
            searchkeywords = "The search call back is clicked !!"
        }
        else
        {
            me.refreshSearchWordsContainer();
            me.addAllSearchWords();
            me.addSearchWord ( searchkeywords );

            if ( ! $( ".search-words-container" ).is( ':visible' ) ) $( ".search-words-container" ).toggle("slide", { direction: "up" }, 200);
            if ( ! $( ".search-results-container" ).is( ':visible' ) ) $( ".search-results-container" ).toggle("slide", { direction: "up" }, 200);

            $( ".search-results-inner" ).html( me.loadingIcon() );

        }

    }
    me.mapLibObj.addControl( me.controlSearchbox );


    // add locate-button > custom control for auto finding user's geoLocation
    me.controlLocateUser = L.control.locate( { position: 'topright' } ).addTo( me.mapLibObj );
}

me.toggleShowPanelBottom = function()
{
    var mapH = ( screen.height < 600 ) ? 300 : (screen.height / 2);

    if ( me.panelBottom.css( 'height') != ( screen.height - mapH ) + 'px' ) 
    { 
        me.panelBottom.css( 'height', ( screen.height - mapH ) + 'px' );
    }
    if ( me.panelBottom.css( 'top') != mapH + 'px' ) 
    { 
        me.panelBottom.css( 'top', mapH + 'px' );
    }
    if ( me.panelBottom.css( 'z-index') != '101' ) 
    { 
        me.panelBottom.css( 'z-index', '101' );
    }

    if ( me.panelBottom.is( ':visible' ) )
    {
        me.cwsRenderObj.focusRelegator.hide();
    }
    else
    {
        me.cwsRenderObj.focusRelegator.show();
    }   

    me.panelBottom.toggle("slide", { direction: "down" }, 200);

    //me.panelBottom.css( 'zIndex', 101 );
}

//navigator.geolocation.getCurrentPosition( function( location ) {
//    me.onLocationFound( location );
    //var latlng = new L.LatLng( location.coords.latitude, location.coords.longitude );
    //me.mapLibObj.setView( latlng, 10, { animate: true, duration: .1 } ); //flyTo
//} );
//$( 'div.leaflet-control-locate' ).children()[0].click();

function locateMe()
{
    document.getElementsByClassName('leaflet-control-locate')[0].children[0].click();
}

me.onLocationFound = function(e) {

    var radius = 15; //( e.accuracy / 2 );

    me.defaultCoordinatePoint = [ e.latlng.lat, e.latlng.lng ];

    L.circle( e.latlng, radius, { stroke: true, weight: 2, color: '#ffffff', fillColor: '#136AEC', fillOpacity: 0.4 }  ).addTo( me.mapLibObj ).bindPopup( me.myLocationPopupPromptMessage( e.latlng ) ); //.openPopup();

}

me.setMapDefaults = function()
{
    if ( me.displayControlListViewRound )
    {
        $( 'div.listview-toggle' ).show();
    }
    else
    {
        $( 'div.listview-toggle' ).hide();
    }
    if ( me.displayControlScale )
    {
        $( 'div.leaflet-control-scale' ).show();
    }
    else
    {
        $( 'div.leaflet-control-scale' ).hide();
    }
    if ( me.displayControlLocateUser )
    {
        $( 'div.leaflet-control-locate' ).show();
    }
    else
    {
        $( 'div.leaflet-control-locate' ).hide();
    }
 
    // remove current + reload base default base layer
    //if ( me.baseLayers ) me.mapLibObj.removeLayer( me.baseLayers[ me.defaultBaseLayer ] );

    //me.baseLayers = me.getBaseLayers();
    //me.baseLayers[ me.defaultBaseLayer ].addTo( me.mapLibObj ); // load default base layer

}

me.myLocationPopupPromptMessage = function( latlng )
{
    var coords = MapUtil.transformIncomingCoordinates( latlng );

    if ( latlng )
    {
        return "Your location<div style='padding:2px;'><div style='height:4px;'>&nbsp;</div><strong>" + MapUtil.toDegreesMinutesAndSeconds( coords[0] ) + " " + MapUtil.toDegreesMinutesAndSeconds( coords[1] ) + "</strong></div>";
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
    me.mapDiv.css( 'height', '100%' ); //screen.height + 'px'
    me.mapDiv.css( 'zIndex', '100' );

    me.panelBottom.hide();

    if ( me.defaultCoordinatePoint )
    {
        me.mapLibObj.setView( me.defaultCoordinatePoint );
        me.mapLibObj.invalidateSize();
    }

    me.resizeSearchBox();
    
    me.setMapDefaults();

}

me.getBaseLayers = function()
{

    if ( ! me.googleStreets )
    {   
        var Open_StreetMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { opacity: 1 }); //, attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        var OpenTopoMap = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { opacity: 1, maxZoom: 17 }); //,attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        var Hydda_Full = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', { opacity: 1 }); //, attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        var HikeBike_HikeBike = L.tileLayer('http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', { opacity: 1, maxZoom: 19 }); //,attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

        var baseMaps = {
            "Open.StreetMap": Open_StreetMap,
            "Topographic": OpenTopoMap,
            "Hydda.Full": Hydda_Full,
            "HikeBike": HikeBike_HikeBike
        };

        me.defaultBaseLayer = "Open.StreetMap";
    }
    else
    {

        // see gMap featureTypes + elementTypes, etc: https://developers.google.com/maps/documentation/javascript/style-reference
        var poiBusCheck = 'off';
        var poiMedCheck = 'on';

        //if ( me.searchType && me.searchType.name ) poiBusCheck = ( ( me.searchType.name ).indexOf( 'google' ) >= 0 ? 'on' : 'off' );
        //if ( me.searchType && me.searchType.name ) poiMedCheck = ( ( me.searchType.name ).indexOf( 'google' ) >= 0 ? 'on' : 'off' );

        var poiBusiness = { featureType: 'poi.business', stylers: [ {visibility: poiBusCheck } ] }
        var poiMedical = { featureType: 'poi.business', stylers: [ {visibility: poiMedCheck } ] }

		var roadMutant = L.gridLayer.googleMutant({
			maxZoom: 24,
			type:'roadmap',
            styles: [
                poiBusiness,
                poiMedical
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

me.refreshBaseLayer = function()
{
    me.mapLibObj.removeLayer( me.baseLayers[ me.defaultBaseLayer ] );
    me.baseLayers = me.getBaseLayers();
    me.baseLayers[ me.defaultBaseLayer ].addTo( me.mapLibObj ); // load default base layer
}

me.createPopupResults = function()
{
    var mapH = ( screen.height < 600 ) ? 300 : (screen.height / 2);

    me.cwsRenderObj.focusRelegator.css( 'zIndex', 100 );
    me.cwsRenderObj.focusRelegator.show();

    //me.mapDiv.css( 'height', ( mapH + 25 ) );
    me.panelBottom.css( 'top', mapH + 'px' );
    me.panelBottom.css( 'height', ( screen.height - mapH ) + 'px' );
    me.panelBottom.css( 'zIndex', 101 );
    me.panelBottom.show( 'slow' );

    setTimeout(function(){ 
        me.mapLibObj.invalidateSize();
        me.panelBottom.html( '<img src="images/mockup_SearchResults.png">' );
    }, 400);

    /*var latLon = L.latLng( me.defaultCoordinatePoint[0], me.defaultCoordinatePoint[1] );
    var bounds = latLon.toBounds( 500 ); // 500 = metres
    me.mapLibObj.panTo( latLon ).fitBounds( bounds );*/

}

me.initialisePageControls = function()
{
    me.panelBottom.empty();

    me.panelBottom.append( me.createPanelBottomDefaults() )
}

me.createPanelBottomDefaults = function()
{
    var dvPanelFrame = $( '<div id="panelBottomFrame" style="width:100%;height:100%;display:flex;border:2px solid #FFF;border-radius:2px;background-Color:#F5F5F5;"></div>' );
    var dvPanelCloser = $( '<div style="width:100%;right:0;height:1px" ><a class="panelBottom-close fas fa-angle-down"></a>' );
    
    dvPanelFrame.append( dvPanelCloser );

    return dvPanelFrame;

}

me.initialiseSearchControlOptions = function()
{
    me.searchControlOpts.push( { label: 'Show my Location', name: 'myLocation', class: 'fa fa-map-marker', eventHandler: 'Util.checkDataExists', parm: 0, selected: 0, type: 'action', enabled: ( FormUtil.geoLocationState == 'granted' ) } );
    me.searchControlOpts.push( { label: 'CwS Outlets', name: 'cwsProvider', class: 'fas fa-briefcase-medical', eventHandler: 'Util.checkDataExists', parm: 1, selected: 1, type: 'filter', enabled: true } );
    me.searchControlOpts.push( { label: 'Google Places', name: 'googlePlaces', class: 'fas fa-globe', eventHandler: 'Util.checkDataExists', parm: 2, selected: 0, type: 'filter', enabled: true } );

    //if ( me.searchType === {} ) 
    me.searchType = me.searchControlOpts[2];

}

me.returnSearchOptionsContent = function()
{
    var ret = document.createElement('div');
    var panelObj = me.searchControlOpts;

    for ( var i = 0; i < panelObj.length; i++ )
    {
        if ( panelObj[ i ].enabled )
        {
            var tblStyle;
            if ( ! panelObj[ i ].selected )
            {
                tblStyle = 'opacity:0.25';
            }
            else
            {
                tblStyle = 'opacity:1;';
            }

            var tbl = document.createElement('table');
            tbl.setAttribute( 'id', 'searchOpt_' + panelObj[ i ].name );
            tbl.setAttribute( 'class', 'searchOptTable' );
            tbl.setAttribute( 'style', tblStyle );

            var tr  = document.createElement('tr');
            var td1  = document.createElement('td');
            td1.setAttribute( 'id', 'searchOptIcon_' + panelObj[ i ].name );
            td1.setAttribute( 'style', 'text-align:center;padding: 8px 12px 8px 8px;width: 45px;' );

            var spanStyle = 'font-size:14pt;';
            var faSpan  = document.createElement('span');

            tr.setAttribute( 'dataTargets', escape( JSON.stringify( panelObj[ i ] ) ) );

            tr.onclick = function () {

                var attrDataTargets = this.getAttribute( 'datatargets' );

                me.unhighlightSearchOptions();

                //$( '#searchOptIcon_' + JSON.parse( unescape( this.getAttribute( 'datatargets' ) ) ).name ).css( 'color','#2C98F0' );
                $( this.parentElement ).css( 'opacity', '1' );

                // slight delay for click event action
                setTimeout(function(){ 

                    if ( attrDataTargets )
                    {
                        var dataTargs = JSON.parse( unescape( attrDataTargets ) );

                        me.setSearchType( dataTargs );
                        me.clearSearchWords();
                        me.refreshSearchWordsContainer();

                        if ( $( 'div.search-options-container' ).is( ':visible') ) $(".search-options-container").toggle("slide", { direction: "up" }, 200);
                        if ( $( 'div.search-words-container' ).is( ':visible') ) $("div.search-words-container").toggle("slide", { direction: "up" }, 200);

                        me.setMapDefaults();
                        //me.refreshBaseLayer();

                    }

                }, 150);

            };

            faSpan.setAttribute( 'class', panelObj[ i ].class );
            faSpan.setAttribute( 'style', spanStyle );

            var td2  = document.createElement('td');
            td2.setAttribute( 'style', 'font-size:12pt;padding:8px' + spanStyle);

            var txt = document.createTextNode( panelObj[ i ].label );

            tbl.appendChild( tr );
            tr.appendChild( td1 );
            td1.appendChild( faSpan );

            tr.appendChild( td2 );
            td2.appendChild( txt );

            ret.appendChild( tbl );
        }

    }

    return ret;

}

me.unhighlightSearchOptions = function()
{
    var panelObj = me.searchControlOpts;

    for ( var i = 0; i < panelObj.length; i++ )
    {
        $( '#searchOpt_' + panelObj[ i ].name ).css( 'opacity', '0.25');
    }
}

me.createListviewControl = function()
{

    L.Control.Listview = L.Control.extend({
        onAdd: function(map) {
            var dv = L.DomUtil.create('div');
            //dv.classList.add( 'leaflet-control' );
            dv.classList.add( 'searchbox-shadow' );
            dv.classList.add( 'listview-toggle' );
            dv.innerHTML = ( ( '<a class="fas fa-list offset-listview-toggle"></a>' ) );
            return dv;
        },
        onRemove: function(map) {
            // Nothing to do here
        }
    });

    var newControl = L.control.listview = function(opts) {
        return new L.Control.Listview( opts );
    }

    newControl({ position: 'topright' }).addTo( me.mapLibObj );

    return newControl;
}

me.resizeSearchBox = function()
{
    if ( me.displayControlListViewRound )
    {
        $( '.searchbox' ).css( 'width', (screen.width < 500 ? ( screen.width - ( 16 * 3 ) - 40 ) : 450 ) ); //16 = margin (x3 left+middle+right), 40 = list icon width
    }
    else
    {
        $( '.searchbox' ).css( 'width', (screen.width < 500 ? ( screen.width - ( 16 * 2 ) ) : 450 ) ); //16 = margin (x3 left+middle+right), 40 = list icon width
    }

}

me.setSearchType = function( optObj )
{
    me.searchType = optObj;
    me.updateSearchType( optObj );
}

me.updateSearchType = function( selectedObj )
{
    for ( var i = 0; i < me.searchControlOpts.length; i++ )
    {
        if ( me.searchControlOpts[ i ].name == selectedObj.name )
        {
            me.searchControlOpts[ i ].selected = 1;
        }
        else
        {
            me.searchControlOpts[ i ].selected = 0;
        }
    }
}

me.clearSearchWords = function()
{
    var wordsContainer = $( ".search-words-inner" );

    wordsContainer.empty();
    me.searchWords = [];

}
me.refreshSearchWordsContainer = function()
{
    var wordsContainer = $( ".search-words-inner" );
    wordsContainer.empty();

    var tbl = document.createElement('table');
    tbl.setAttribute( 'id', 'searchWordCriteria' );
    tbl.setAttribute( 'style', 'width:100%;' );

    var tr  = document.createElement('tr');
    var td1  = document.createElement('td');
    td1.setAttribute( 'style', 'text-align:center;padding: 4px 12px 0px 4px;width: 45px;vertical-align: text-top;' );

    var spanStyle = 'font-size:14pt;color:#2C98F0';
    var faSpan  = document.createElement('span');

    faSpan.setAttribute( 'class', me.searchType.class );
    faSpan.setAttribute( 'style', spanStyle );

    var td2  = document.createElement('td');
    td2.setAttribute( 'id', 'searchWordsDisplayUI' );
    td2.setAttribute( 'style', 'padding:2px;display:flex;flex-wrap:wrap;' );

    var td3  = document.createElement('td');
    td3.setAttribute( 'id', 'searchWordsProgressContainer' );
    td3.setAttribute( 'style', 'text-align:center;padding: 8px 12px 8px 8px;width: 45px;' );


    tbl.appendChild( tr );
    tr.appendChild( td1 );
    td1.appendChild( faSpan );

    tr.appendChild( td2 );
    tr.appendChild( td3 );

    wordsContainer.append( tbl );
}
me.addAllSearchWords = function( word )
{
    if ( me.searchWords.length )
    {
        for ( var i = 0; i < me.searchWords.length; i++ )
        {
            $( "#searchWordsDisplayUI" ).append( me.createSearchWord( me.searchWords[ i ] ) );
        }
    }
    else
    {
        if ( $( 'div.search-words-container' ).is( ':visible') ) $("div.search-words-container").toggle("slide", { direction: "up" }, 200);
    }

}
me.removeSearchWord = function( word )
{
    if ( me.searchWords.includes( word ) )
    {
        var index = me.searchWords.indexOf( word );

        if (index > -1) {
            me.searchWords.splice(index, 1);
        }
    }

}
me.addSearchWord = function( word )
{
    if ( ! me.searchWords.includes( word ) )
    {
        me.searchWords.push( word );

        $( "#searchWordsDisplayUI" ).append( me.createSearchWord( word ) );
    }
}
me.createSearchWord = function( word )
{
    var tbl = document.createElement('table');
    var tr  = document.createElement('tr');
    var td1  = document.createElement('td');
    var txt = document.createTextNode( word );

    td1.setAttribute( 'style', 'padding: 0 2px 0 2px;' );

    tbl.setAttribute( 'class', 'search-word' );
    tbl.appendChild( tr );
    tr.appendChild( td1 );
    td1.appendChild( txt );

    var td2  = document.createElement('td');
    var a  = document.createElement('a');
    a.setAttribute( 'class', 'search-word-close-button' );
    a.setAttribute( 'data', word );

    var txt = document.createTextNode( 'X' );

    a.onclick = function () {

        me.removeSearchWord( this.getAttribute( 'data' ) );
        me.refreshSearchWordsContainer();
        me.addAllSearchWords();

    }

    tr.appendChild( td2 );
    td2.appendChild( a );
    a.appendChild( txt );

    return tbl;
}

me.loadingIcon = function()
{
    return '<div style="padding:10px;"> searching...   <img src="images/loading.gif" > </div>';
}
me.runWordSearch = function()
{
    return null;
}

}
