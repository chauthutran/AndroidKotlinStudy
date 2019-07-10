// -------------------------------------------
// -- Map Class/Methods

function CwSMap() {

    var me = this;

    me.cwsRenderObj;
    me.mapLibObj;
    me.mappedData;

    me.mapTargetDiv = 'mapApp';
    me.mapDiv = $( '#mapApp' );
    me.panelBottom = $( '#panelBottom' );
    me.panelFloat; //= $( 'div.info-floating-container' );

    me.mapPadding = 100;
    me.mapFlyAnimationDelay = 2;
    me.defaultCoordinatePoint;
    me.defaultZoomlevel = 3;
    me.pointOverZoomlevel = 12;

    me.viewSet = false;

    me.googleStreets = true;    //obtained from QueryString: 'google=1' / 'google=true'
    me.advancedMode = false;    //obtained from QueryString: 'advanced=1' / 'advanced=true' / 'adv=1' / 'adv=true'
    me.useClusterGroups = true; //obtained from QueryString: 'cluster=1' / 'cluster=false'

    /* 
      QueryString options:
        'c=' { COORDINATES, e.g. -33.916999,18.4167 } > optional but directs app to predefined position

        'poi=' { NUMERIC, e.g. 1 } > map should find provider at coordinates (c) and display summary information 

        'isoc=' { TEXT, e.g. 'cm' } > ISO country code for map (runs a search against variable 'countryOpts' to locate default coordinate points ) for map positioning 

        'service=' + 'serv=' { TEXT } > serice code(s) [comma delimited] to include in output
 
        'advanced=' + 'adv=' { NUMERIC/BOOLEAN, e.g. '1' or 'true' } > show advanced selector options in search bar (change number of search points or bubble search area)

        'top=' { NUMERIC, e.g. 3 } > number of provider points to show on map; defaults to 10;

        'google=' { NUMERIC/BOOLEAN } > use google map layer; default = true, so 'false' or '0' switches to open street maps

        'cluster=' { NUMERIC/BOOLEAN } > use clusterGroups; default = true

    */

    me.mapDownIntvCounter;

    me.controlSearchbox
    me.controlTileLayerOptions;
    me.controlScale;
    me.controlZoom;
    me.controlLocateUser;
    me.controlListViewRound;
    me.controlPOCsearch;

    me.displayControlLocateUser = false;
    me.displayControlScaleDistance = false;
    me.displayControlListViewRound = false;

    me.defaultBaseLayer;
    me.baseLayers;

    me.searchControlOpts = [];
    me.searchType = {};
    me.searchWords = [];
    me.mapOptions = { zoomControl: false, tap: true, renderer: L.svg({ padding: me.mapPadding }) };
    me.countryCode = '';
    me.serviceFilter = '';

    me.viewMode = {};
    me.distanceScale = [ { name: ' < 1km', distance: 1000, faIcon: 'fas fa-walking'}, { name: ' < 5km', distance: 5000, faIcon: 'fas fa-taxi' }, { name: '< 10km', distance: 10000, faIcon: 'fas fa-taxi' }, { name: '< 50km', distance: 50000, faIcon: 'fas fa-taxi' }, { name: '< 100km', distance: 100000, faIcon: 'fas fa-taxi' }, { name: '>  100km', distance: 10000000, faIcon: 'fas fa-plane' } ]; //examples of predefined distance options for later use
    me.distanceThreshold = { 'limitSearchCount': 10, 'limitSearchDistance': 5000 };

    me.markerGroup;
    me.clusterGroup;
    me.mapMarkerIdx;
    me.lastMarker;

    me.circleRadiusMarker;

    me.lastPositionClicked;
    me.iconPositionCycler;

// ==== Methods ======================

me.initialise = function( cwsRender)
{
    me.cwsRenderObj = cwsRender;

    // instantiate Leaflet Map object
    me.mapLibObj = new L.map( me.mapTargetDiv, me.mapOptions );

    me.initialiseDefaults();
    me.initialiseMapControls();
    me.initialiseMapEvents();


    me.initialisePageControls();
    me.initialiseSearchControlOptions();
    me.initialiseEvents();

}

me.render = function( defCoords, poi )
{
    me.initialiseMapsDefaults();

    if ( defCoords )
    {
        me.defaultCoordinatePoint = defCoords;
    }
    else
    {
        me.defaultCoordinatePoint = [ 0, 23 ]; //[ 27.84076, 82.76148 ];
    }


    me.mapDiv.css( 'width', '100%' );
    me.mapDiv.show( 'fast' );
    me.mapLibObj.invalidateSize();


    if ( ! defCoords ) 
    {
        me.mapLibObj.setView( me.defaultCoordinatePoint, me.defaultZoomlevel, { animate: true, duration: me.mapFlyAnimationDelay } ); //flyTo
        me.mapLibObj.locate( { setView: true, maxZoom: 16 } );
        me.viewSet = true;

        if ( me.countryCode.length )
        {
            console.log( ' ~ start up path 1 (iso country in querystring) ');
            setTimeout( function() {

                me.evalCountryCodeStartup();

            }, ( me.mapFlyAnimationDelay * 1000 ) );
        }
        else
        {
            console.log( ' ~ start up path 2 (country selector) ');
            me.promptCountryOptions();
        }

    }
    else
    {
        if ( me.countryCode.length == 0 )
        {
            // required for both POI and non-POI
            me.countryCode = me.nearestCountryAttr( 'iso' );
        }

        me.mapLibObj.setView( me.defaultCoordinatePoint, me.defaultZoomlevel );
        me.viewSet = true;

        if ( poi && poi == true )
        {
            console.log( ' ~ start up path 3 (poi > from shared link) ');

            me.runSearch( true, true, true );

            setTimeout( function() {

                me.mapLibObj.flyTo( [ me.defaultCoordinatePoint[0], me.defaultCoordinatePoint[1] ], me.pointOverZoomlevel, { animate: true, duration: me.mapFlyAnimationDelay } ); //
                me.getMapDataPreviewFromID( undefined, me.mappedData[ 0 ] )

            }, ( me.mapFlyAnimationDelay * 1000 ) );
        }
        else
        {
            console.log( ' ~ start up path 4 (my coordinate in querystring) ');

            me.createMyCoordinateMarker( false );
            me.mapLibObj.flyTo( [ me.defaultCoordinatePoint[0], me.defaultCoordinatePoint[1] ], ( me.pointOverZoomlevel / 2), { animate: true, duration: me.mapFlyAnimationDelay } ); //

            setTimeout( function() {

                me.runSearch( true, false );

                setTimeout( function() {
                    MapUtil.showInfo()
                }, ( me.mapFlyAnimationDelay * 1000 ) );

            }, ( me.mapFlyAnimationDelay * 1000 ) );

        }

    }

    $( "div.search-options-inner" ).empty();
    $( "div.search-options-inner" ).append( me.returnSearchOptionsContent() );

    //me.unhighlightSearchOptions();

    me.setMapDefaults();

}

me.initialiseDefaults = function()
{
    //me.displayControlListViewRound = ( Util.isMobi() );

    me.viewMode = { "listView": { "active": "false", "controls": [ {"#controlbox": [ { "width": "{screen.width}" }, { "margin": "20px 0 20px 0" } ] }, {".searchbox": [ { "height": "58px" } ] }, {".search-results-inner": [ { "box-shadow": "none" } ] }, { "#boxcontainer": [ { "width": "{screen.width} - 80" }, { "box-shadow": "rgba(0, 0, 0, 0.1) 0px 1px 0px 0px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px" } ] }, { ".leaflet-overlay-pane": [ { "display": "none" } ] }, { ".searchbox-hidebutton-container": [ { "display": "none" } ] }, { ".listview-toggle": [ { "margin": "30px 20px 0 0 !important" } ] }, { ".search-results-container": [ { "margin": "0" } ] }, { ".leaflet-tile-pane": [ {"display": "none"} ] }, { ".leaflet-marker-pane": [ {"display": "none"} ] }, { ".leaflet-shadow-pane": [ {"display": "none"} ] } ] }, "mapView": { "active": "true", "controls": [ {"#controlbox": [ { "width": "" }, { "margin": "" } ] }, {".searchbox": [ { "height": "" } ] }, {".search-results-inner": [ { "box-shadow": "" } ] }, { "#boxcontainer": [ { "width": "" }, { "box-shadow": "" } ] }, { ".leaflet-overlay-pane": [ { "display": "" } ] }, { ".searchbox-hidebutton-container": [ { "display": "" } ] }, { ".listview-toggle": [ { "margin": "" }, { "margin-top": "" } ] },  { ".search-results-container": [ { "margin": "" } ] }, { ".leaflet-tile-pane": [ {"display": ""} ] }, { ".leaflet-marker-pane": [ {"display": ""} ] }, { ".leaflet-shadow-pane": [ {"display": ""} ] } ] }  };
    //me.viewMode = { "listView": { "active": "false", "controls": [ {"#controlbox": [ { "width": "{screen.width}" }, { "margin": "20px 0 20px 0" } ] }, {".searchbox": [ { "height": "58px" } ] }, {".search-results-inner": [ { "box-shadow": "none" } ] }, { "#boxcontainer": [ { "width": "{screen.width} - 80" }, { "box-shadow": "rgba(0, 0, 0, 0.1) 0px 1px 0px 0px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px" } ] }, { ".searchbox-hidebutton-container": [ { "display": "none" } ] }, { ".listview-toggle": [ { "margin": "30px 20px 0 0 !important" } ] }, { ".search-results-container": [ { "margin": "0" } ] }, { ".leaflet-tile-pane": [ {"display": "none"} ] }, { ".leaflet-marker-pane": [ {"display": "none"} ] }, { ".leaflet-shadow-pane": [ {"display": "none"} ] } ] }, "mapView": { "active": "true", "controls": [ {"#controlbox": [ { "width": "" }, { "margin": "" } ] }, {".searchbox": [ { "height": "" } ] }, {".search-results-inner": [ { "box-shadow": "" } ] }, { "#boxcontainer": [ { "width": "" }, { "box-shadow": "" } ] }, { ".searchbox-hidebutton-container": [ { "display": "" } ] }, { ".listview-toggle": [ { "margin": "" }, { "margin-top": "" } ] },  { ".search-results-container": [ { "margin": "" }, { "height": "" } ] }, { ".leaflet-tile-pane": [ {"display": ""} ] }, { ".leaflet-marker-pane": [ {"display": ""} ] }, { ".leaflet-shadow-pane": [ {"display": ""} ] } ] }  };
    //me.viewMode = { "listView": { "active": "false", "controls": [ {"#controlbox": [ { "width": "{screen.width}" }, { "margin": "20px 0 20px 0" } ] }, {".searchFooter-collapser": [ { "color": "#000" } ] }, {".searchbox": [ { "height": "58px" } ] }, {".search-results-inner": [ { "box-shadow": "none" } ] }, { "#boxcontainer": [ { "width": "{screen.width} - 80" }, { "box-shadow": "rgba(0, 0, 0, 0.1) 0px 1px 0px 0px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px" } ] }, { ".searchbox-hidebutton-container": [ { "display": "none" } ] }, { ".listview-toggle": [ { "margin": "30px 20px 0 0 !important" } ] }, { ".search-results-container": [ { "margin": "0" }, { "margin": "" } ] }, { ".leaflet-tile-pane": [ {"display": "none"} ] }, { ".leaflet-marker-pane": [ {"display": "none"} ] }, { ".leaflet-shadow-pane": [ {"display": "none"} ] } ] }, "mapView": { "active": "true", "controls": [ {"#controlbox": [ { "width": "" }, { "margin": "" } ] }, {".searchbox": [ { "height": "" } ] }, {".search-results-inner": [ { "box-shadow": "" } ] }, {".searchFooter-collapser": [ { "color": "" } ] }, { "#boxcontainer": [ { "width": "" }, { "box-shadow": "" } ] }, { ".searchbox-hidebutton-container": [ { "display": "" } ] }, { ".listview-toggle": [ { "margin": "" }, { "margin-top": "" } ] },  { ".search-results-container": [ { "margin": "" }, { "height": "" } ] }, { ".leaflet-tile-pane": [ {"display": ""} ] }, { ".leaflet-marker-pane": [ {"display": ""} ] }, { ".leaflet-shadow-pane": [ {"display": ""} ] } ] }  };


    /* google Maps enabled ? */
    if ( Util.getParameterByName('google').length )
    {
        if ( ( (Util.getParameterByName('google')).toString().toLowerCase() == "false" || (Util.getParameterByName('google')).toString() == "0" ) )
        {
            me.googleStreets = false;
        }
        else if ( ( (Util.getParameterByName('google')).toString().toLowerCase() == "true" || (Util.getParameterByName('google')).toString() == "1" ) )
        {
            me.googleStreets = true;
        }
    }

    /* display advanced Option in searchbox ? */
    if ( Util.getParameterByName('advanced').length || Util.getParameterByName('adv').length )
    {
        var advM = Util.getParameterByName('advanced') || Util.getParameterByName('adv');

        if ( ( ( advM ).toString().toLowerCase() == "true" || ( advM ).toString() == "1" ) )
        {
            me.advancedMode = true;
        }
        else
        {
            me.advancedMode = false;
        }
    }
    else
    {
        me.advancedMode = false;
    }

    /* cluster markers enabled/disabled ? */
    if ( Util.getParameterByName('cluster').length )
    {
        if ( ( (Util.getParameterByName('cluster')).toString().toLowerCase() == "false" || (Util.getParameterByName('cluster')).toString() == "0" || (Util.getParameterByName('cluster')).toString() == "no" ) )
        {
            me.useClusterGroups = false;
        }
        else if ( ( (Util.getParameterByName('cluster')).toString().toLowerCase() == "true" || (Util.getParameterByName('cluster')).toString() == "1" || (Util.getParameterByName('cluster')).toString() == "yes" ) )
        {
            me.useClusterGroups = true;
        }
    }

    /* use custom count value for number of markers ? */
    if ( Util.getParameterByName('top').length && ! isNaN( Util.getParameterByName('top') ) )
    {
        me.distanceThreshold.limitSearchCount = Util.getParameterByName('top');
    }

    /* apply a service filter ? */
    if ( Util.getParameterByName('service').length || Util.getParameterByName('serv').length )
    {
        me.serviceFilter = Util.getParameterByName('service') || Util.getParameterByName('serv');
    }


}

me.initialiseEvents = function()
{

    if ( Util.isMobi() )
    {
        //NB: DO NOT REMOVE > temporarily disabled for demo only
        /*$( 'div.listview-toggle' ).on('click', function(e) { 
            me.toggleDisplayMode();
            e.stopPropagation();
        });*/
    } 

    /*$( 'a.panelBottom-close' ).on('click', function(e) { 
        me.toggleShowPanelBottom();
    });*/

    $("#searchboxinput").click( function () {

        if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);
        if ( me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);
        if ( me.panelFloat.is( ':visible' ) ) me.panelFloat.toggle("slide", { direction: "up" }, 200);

        if ( $(".search-options-container").is( ':visible') )
        {
            me.cycleIcons( '#searchbox-searchoptions', 'fa-caret-down', 'fa-caret-up' );

            $(".search-options-container").toggle("slide", { direction: "up" }, 250);
        }
    });

    $("#searchbox-searchoptions").click( function () {

        me.cycleIcons( '#searchbox-searchoptions', 'fa-caret-down', 'fa-caret-up' );

        if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);
        if ( me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);
        if ( me.panelFloat.is( ':visible' ) ) me.panelFloat.toggle("slide", { direction: "up" }, 200);

        $(".search-options-container").toggle("slide", { direction: "up" }, 250);

        setTimeout(function(){ 
            me.resizeSearchBox();
        }, 275 );
    });

    $( '.searchResults-close' ).click( function () {

        if ( me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);
        if ( me.panelFloat.is( ':visible' ) ) me.panelFloat.toggle("slide", { direction: "up" }, 200);

        setTimeout(function(){ 

            me.showHideSearchResultsPanel();
            me.resizeSearchBox();

        }, 225 );

    });

}

me.initialiseMapEvents = function()
{
   
    me.mapLibObj.doubleClickZoom.disable();

    // dblclick = dblTab for mobile
    me.mapLibObj.on( 'dblclick', function(e) 
    {
        me.defaultCoordinatePoint = [ e.latlng.lat,e.latlng.lng ];

        //me.updateOtherMarkers();
        me.clearMarkerSearchResultLayer( 'myPin' );

        me.createMyCoordinateMarker( true );

        if ( me.searchType.name == 'distanceRadius' )
        {
            me.addRadiusMarker();
        }

        if ( me.searchWords.length == 0 )
        {
            me.clearMarkerSearchResultLayer( 'searchPin' );
            me.runSearch( true, true )
        }
        else
        {
            me.lastMarker.setZIndexOffset( 1000 );
        }

    } );

    me.mapLibObj.on( 'locationfound', me.onLocationFound );

    me.mapLibObj.on('resize', function () 
    {
        me.mapLibObj.invalidateSize();
        me.resizeSearchBox();
        me.resizePanelBottom();
        me.updateViewModeSettings();

    });

    me.mapLibObj.on( 'zoomend', function (e) 
    {
        //console.log( 'map zoomLevel: ' + me.mapLibObj.getZoom() );
    });

    me.mapLibObj.on( 'click', function(e) 
    { 
        if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);
        if ( me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);
        if ( me.panelFloat.is( ':visible' ) ) me.panelFloat.toggle("slide", { direction: "up" }, 200);

        if ( $( 'div.search-options-container' ).is( ':visible') )
        {
            me.cycleIcons( '#searchbox-searchoptions', 'fa-caret-down', 'fa-caret-up' );

            $(".search-options-container").toggle("slide", { direction: "up" }, 200);

            setTimeout( function() { 
                me.resizeSearchBox();
            }, 210 );

        }

        if ( $( "div.search-words-container" ).is( ':visible' ) )
        {
            $( '.searchResults-close' ).click();
        }

        /*if ( $( 'div.info-floating-container' ).is( ':visible') )
        {
            $( "div.info-floating-container" ).toggle("slide", { direction: "up" }, 200)
        }*/

        me.lastPositionClicked = [ e.latlng.lat,e.latlng.lng ];
        console.log( me.lastPositionClicked );

    });

}

me.initialiseMapControls = function()
{
    me.markerGroup = L.FeatureGroup;

    if ( me.useClusterGroups ) me.clusterGroup = L.markerClusterGroup();

    if ( ! Util.isMobi() || screen.width > 540 )
    {
        me.controlZoom = L.control.zoom( { position: 'bottomright' } ).addTo( me.mapLibObj );
    }
    else
    {
        if ( me.displayControlListViewRound )
        {
            // round 'List' floating icon
            me.controlListViewRound = me.createListviewControl();
        }
    }

    // show miles/kilometers
    me.controlScale = L.control.scale( { metric: true } ).addTo( me.mapLibObj );


    // load base layers
    me.baseLayers = me.getBaseLayers();
    me.baseLayers[ me.defaultBaseLayer ].addTo( me.mapLibObj ); // load default base layer

    // custom text search floating control 
    var searchboxControl = createSearchboxControl ();
    me.controlSearchbox = new searchboxControl({
        sidebarTitleIcon: 'images/Connect.svg',
        sidebarTitleText: 'Outlet Locator',
        sidebarMenuItems: {
            Items: [
                { type: "button", name: "Application version", href: '#', icon: "fas fa-info-circle", onclick: "MapUtil.showAbout();", group: 0, value: $( '#appVersion').html() },
                { type: "button", name: "Map layer", href: '#', icon: "fas fa-info-circle", onclick: "", group: 0, value: ( me.googleStreets ) ? 'Google maps' : 'Open streets' },
                { type: "button", name: "Geolocation", href: '#', icon: "fas fa-crosshairs", onclick: "", group: 0, value: FormUtil.geoLocationState }
            ]
        }
    });
    /*  DO NOT REMOVE > reuse  
                { type: "button", name: "My Location", onclick: "document.getElementsByClassName('leaflet-control-locate')[0].children[0].click();", icon: "fas fa-map-marker-alt", group: 0 },
                { type: "link", name: "My Appointments", href: "#", icon: "icon-cloudy", group: 1 },
                { type: "button", name: "My Ratings", onclick: "alert('button 1 clicked !')", icon: "icon-potrait", group: 0 },
                { type: "button", name: "Find Beer", onclick: "button2_click();", icon: "icon-local-dining", group: 1 },
                { type: "link", name: "Refer Someone", href: '#', icon: "icon-bike", group: 0 },    */

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

            $( ".search-results-inner" ).html( me.loadingIcon() );
            $( '.search-results-container').css( 'minHeight', '20px' ); //$( '.search-words-container').css( 'height' ) );
            $( '.search-results-container').css( 'maxHeight', ( $(window).height() - $( '.search-results-container').position().top - ( me.panelBottom.is( ':visible' ) ? me.panelBottom.height() : 0 ) - ( me.viewMode.listView.active == "true" ? 20 : ( 16 * 2.5) ) ) );

            if ( ! $( ".search-words-container" ).is( ':visible' ) ) $( ".search-words-container" ).toggle("slide", { direction: "up" }, 200);
            if ( ! $( ".search-results-container" ).is( ':visible' ) ) $( ".search-results-container" ).toggle("slide", { direction: "up" }, 200);
            if ( $( '.searchFooter-collapser' ).is( ':visible') ) $( '.searchFooter-collapser' ).hide();
            if ( me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);
            if ( me.panelFloat.is( ':visible' ) ) me.panelFloat.toggle("slide", { direction: "up" }, 200);

            FormUtil.showProgressBar('100%');

            me.clearMarkerSearchResultLayer( 'searchPin' );

            setTimeout(function(){

                me.runSearch();

                $( '.search-results-container').css( 'minHeight', '20px' ); //$( '.search-words-container').css( 'height' ) );
                $( '.search-results-container').css( 'maxHeight', ( $(window).height() - $( '.search-results-container').position().top - ( me.panelBottom.is( ':visible' ) ? me.panelBottom.height() : 0 ) - ( me.viewMode.listView.active == "true" ? 20 : ( 16 * 2.5) ) ) );

            }, ( me.mapFlyAnimationDelay * 1000) );

        }

    }
    me.mapLibObj.addControl( me.controlSearchbox );

    if ( me.advancedMode )
    {
        $( 'div.searchbox-searchoptions-container' ).show();
        $( 'div.searchbox-searchbutton-container' ).css( 'right', '35px' );
    }
    else
    {
        $( 'div.searchbox-searchoptions-container' ).hide();
        $( 'div.searchbox-searchbutton-container' ).css( 'right', '0px' );
    }

    $( 'div.searchbox-searchoptions-container' ).attr( 'adv-show', me.advancedMode );

    // add locate-button > custom control for auto finding user's geoLocation
    me.controlLocateUser = L.control.locate( { position: 'topright' } ).addTo( me.mapLibObj );
}

me.updateOtherMarkers = function()
{
    // can't get the newHTML value to appear correctly BECAUSE OF interval timer not being cleared...?
    me.mapLibObj.eachLayer(function (ml) {

        if ( ml.options && ml.options.icon && ml.options.icon.options && ml.options.icon.options.icon )
        {
            
            if  ( ml.options.icon.options.icon == 'myPin' ) 
            {
                if ( me.iconPositionCycler )
                {
                    clearInterval( me.iconPositionCycler );
                    me.iconPositionCycler = undefined;
                }
                ml.options.icon.options.icon = 'oldPin';
                var newHTML = ( ml.options.icon.options.html ).replace( 'myPin', 'oldPin' ).replace( 'fa-male', '' ).replace( 'fa-male', '' ).replace( 'fas', 'fas fa-universal-access' );
                ml.options.icon.options.html = newHTML;
                console.log( ml.options.icon.options );
            }
        }
    })

}

me.createMyCoordinateMarker = function( skipGetBounds )
{
    //if ( ! me.lastMarker )
    {
        var myMarkerIcon = L.AwesomeMarkers.icon({
            icon: 'myPin',
            markerColor: 'blue',
            prefix: 'fa',
            html: '<i class="fas fa-male myPin textShadow"></i>'
            });


        me.lastMarker = L.marker( me.defaultCoordinatePoint, {icon: myMarkerIcon, draggable: true } ).addTo( me.mapLibObj ); //.bindPopup( me.myLocationPopupPromptMessage( me.defaultCoordinatePoint ) ); //.openPopup();


        me.lastMarker.on('dragend', function( e ) {

            if ( ! me.countryOptionIsValid() )
            {
                return false;
            }

            var eCoord = me.lastMarker.getLatLng();

            me.lastPositionClicked = [ eCoord.lat,eCoord.lng ];
            me.defaultCoordinatePoint = me.lastPositionClicked;

            if ( me.searchWords.length == 0 )
            {
                me.clearMarkerSearchResultLayer( 'searchPin' );
                me.runSearch( true, true )
            }
            else
            {
                //me.runSearch();
            }

            if ( me.searchType.name == 'distanceRadius' )
            {
                me.addRadiusMarker();
            }

            me.lastMarker.setZIndexOffset( 1000 );

        });

        if ( me.iconPositionCycler )
        {
            clearInterval( me.iconPositionCycler );
            me.iconPositionCycler = undefined;
        }
    
        me.iconPositionCycler = setInterval( function() { 
            me.cycleIcons( '.myPin', 'fa-male', 'fa-child' ); // fa-universal-access = very cool 'badge'
        }, 1250);

    }

    if ( skipGetBounds != undefined && skipGetBounds == true )
    {
        //do something
    }
    else
    {
        if ( ! me.viewSet)
        {
            me.mapLibObj.setView( me.defaultCoordinatePoint, me.defaultZoomlevel, { animate: true, duration: me.mapFlyAnimationDelay } ); 
            me.viewSet = true;
        }

        setTimeout( function() {

            me.mapLibObj.flyTo( me.defaultCoordinatePoint, me.pointOverZoomlevel, { animate: true, duration: me.mapFlyAnimationDelay } ); 

        }, ( me.mapFlyAnimationDelay * 1000 ) );
    }

}

me.evalCountryCodeStartup = function()
{
    var countries = me.countryOptions();
    var found;

    for ( var i = 0; i < countries.length; i++ )
    {
        if ( countries[ i ].selected )
        {
            found = countries[ i ];
        }
    }

    if ( found )
    {

        me.defaultCoordinatePoint = [ found.lat, found.lng ];
        me.mapLibObj.flyTo( me.defaultCoordinatePoint, found.zoom, { animate: true, duration: me.mapFlyAnimationDelay } ); //, { animate: true, duration: me.mapFlyAnimationDelay }

        me.createMyCoordinateMarker();
        me.runSearch( true, false );

    }
    else
    {
        me.promptCountryOptions();
    }
}

me.promptCountryOptions = function()
{
    $( '.selection-country-inner').empty();
    $( '.selection-country-inner').append( me.getCountryPromptLayout() );
    $( ".selection-country-container" ).toggle("slide", { direction: "up" }, 200);
}

me.getCountryPromptLayout = function()
{
    var countries = me.countryOptions();
    var ret = document.createElement('div');
    var tbl = document.createElement('table');
    var tr  = document.createElement('tr');
    var td1  = document.createElement('td');
    var iFA  = document.createElement('i');
    var td2  = document.createElement('td');
    var txt = document.createTextNode( 'Select country' );

    tbl.setAttribute( 'class', 'countrySelect' );
    td1.setAttribute( 'style', 'text-align:center;padding:8px 2px 8px 2px;width:28px;font-size:16px;color:#136AEC' );
    iFA.setAttribute( 'class', 'fas fa-globe-africa');
    td2.setAttribute( 'style', 'text-align:left;padding:8px 2px 8px 2px;font-size:11pt;font-weight:800;opacity:1' );
    td2.setAttribute( 'term', '');

    tbl.appendChild( tr );
    tr.appendChild( td1 );
    td1.appendChild( iFA );
    tr.appendChild( td2 );
    td2.appendChild( txt );

    ret.appendChild( tbl );

    for ( var i = 0; i < countries.length; i++ )
    {
        if ( countries[ i ].enabled )
        {

            var tblStyle = 'width:100%;';

            //DO NOT REMOVE: reuse later
            if ( countries[ i ].selected )
            {
                tblStyle += 'opacity: 1;';
            }
            else
            {
                tblStyle += ''; //opacity: 0.25;';
            }
    
            var tbl = document.createElement('table');
            tbl.setAttribute( 'id', 'countryOpt_' + countries[ i ].iso );
            tbl.setAttribute( 'class', 'countryOptTable' );
            tbl.setAttribute( 'style', tblStyle );
    
            var tr  = document.createElement('tr');
            var td1  = document.createElement('td');
            var td2  = document.createElement('td');
            var txt = document.createTextNode( countries[ i ].name + ' ' );
    
            tr.setAttribute( 'id', 'countryOptIcon_' + countries[ i ].iso );
            tr.setAttribute( 'class', 'countryRow' );
            tr.setAttribute( 'datatargets', escape( JSON.stringify( countries[ i ] ) ) );
            td1.setAttribute( 'style', 'text-align:center;padding:8px 2px 8px 2px;width:38px;' );
            td2.setAttribute( 'style', 'text-align:left;padding:8px 2px 8px 2px;font-size:10pt;color:#000;' );
    
            tr.onmousedown = function () {
                $( this ).parent().css( 'opacity', 1 );
            }

            tr.onclick = function () {

                var thisData = JSON.parse( unescape( this.getAttribute( 'datatargets' ) ) );
                var succImg = "<img src='images/completed.svg' style='width:24px;height:24px;'>";

                me.defaultCoordinatePoint = [ thisData.lat, thisData.lng ];
                me.countryCode = thisData.iso;

                $( '.selection-country-inner').empty();
                $( ".selection-country-container" ).toggle("slide", { direction: "up" }, 200)

                me.clearMarkerSearchResultLayer( 'myPin' );
                me.createMyCoordinateMarker();

                me.mapLibObj.flyTo( me.defaultCoordinatePoint, thisData.zoom, { animate: true, duration: me.mapFlyAnimationDelay }  ); //, { animate: true, duration: me.mapFlyAnimationDelay } 

                setTimeout( function(){ 

                    me.runSearch( true, false ); //true

                }, ( me.mapFlyAnimationDelay * 1000 ) );

                MsgManager.notificationMessage( thisData.name + ' ' + succImg, 'notificationDark', undefined,'font-size:14pt;opacity:0.75;', 'right', 'bottom', 2500, true )

            }

            tbl.appendChild( tr );
            tr.appendChild( td1 );
            tr.appendChild( td2 );
            td2.appendChild( txt );
            ret.appendChild( tbl );

        }

    }

    return ret;
}

me.cycleIcons = function( target, initial, rotate )
{
    if ( $( target ) )
    {
        if ( $( target ).hasClass( initial ) )
        {
            $( target ).removeClass( initial );
            $( target ).addClass( rotate );
        }
        else
        {
            $( target ).removeClass( rotate );
            $( target ).addClass( initial );
        }
    }
}

me.updateViewModeSettings = function()
{
    me.viewMode.listView.controls.forEach(element => {
        me.recursiveControlSettingsInitialise ( element, 1 )
    });

    me.viewMode.mapView.controls.forEach(element => {
        me.recursiveControlSettingsInitialise ( element )
    });

}

me.recursiveControlSettingsInitialise = function( obj, bLimitToInitialise )
{
    for ( var key in obj ) 
    {
        obj[ key ] = me.recursiveGetObjProp ( $( key ), obj[ key ], bLimitToInitialise );
    }
}

me.recursiveGetObjProp = function( objElement, arr, bLimitToInitialise )
{
    for ( var i = 0; i < arr.length; i++ )
    {
        for ( var key in arr[ i ] ) 
        {
            if ( bLimitToInitialise && bLimitToInitialise > 0 )
            {
                if ( ( arr[ i ][ key ] ).indexOf( '{screen.width}' ) >= 0 )
                {
                    var calcW = arr[ i ][ key ];
                    calcW = calcW.replace( '{screen.width}', screen.width );
                    calcW = eval( calcW );
                    arr[ i ][ key ] = calcW + 'px';
                }
            }
            else
            {
                arr[ i ][ key ] = objElement.css( key );
            }
        }
    }
    return arr;
}

me.recursiveControlPropertiesSet = function( obj )
{
    for ( var key in obj ) 
    {
        me.recursiveSetObjProp ( $( key ), obj[ key ] );
    }
}

me.recursiveSetObjProp = function( objElement, arr )
{
    for ( var i = 0; i < arr.length; i++ )
    {
        for ( var key in arr[ i ] ) 
        {
            objElement.css( key, arr[ i ][ key ] );
        }
    }
    return arr;
}

me.toggleDisplayMode = function()
{

    if ( me.viewMode.listView.active == "true" )
    {
        $( '#float-control-ListOrMap' ).removeClass( 'fas' );
        $( '#float-control-ListOrMap' ).removeClass( 'fa-list' );
        $( '#float-control-ListOrMap' ).addClass( 'fas' );
        $( '#float-control-ListOrMap' ).addClass( 'fa-map' );

        me.viewMode.listView.active = "false";
        me.viewMode.mapView.active = "true";

    }
    else
    {
        $( '#float-control-ListOrMap' ).removeClass( 'fas' );
        $( '#float-control-ListOrMap' ).removeClass( 'fa-map' );
        $( '#float-control-ListOrMap' ).addClass( 'fas' );
        $( '#float-control-ListOrMap' ).addClass( 'fa-list' );

        me.viewMode.listView.active = "true";
        me.viewMode.mapView.active = "false";
    }

    me.switchViewMode();

}

me.switchViewMode = function()
{
    if ( me.viewMode.mapView.active == "true" )
    {
        me.viewMode.mapView.controls.forEach(element => {
            me.recursiveControlPropertiesSet ( element )
        });
    }
    else
    {
        me.viewMode.listView.controls.forEach(element => {
            me.recursiveControlPropertiesSet ( element )
        });
    }

    $( '.search-results-container').css( 'minHeight', '20px' ); //$( '.search-words-container').css( 'height' ) );
    //$( '.search-results-container').css( 'maxHeight', ( $(window).height() - $( '.search-results-container').position().top - ( me.viewMode.listView.active == "true" ? 20 : ( 16 * 2.5) ) ) );
    $( '.search-results-container').css( 'maxHeight', ( $(window).height() - $( '.search-results-container').position().top - ( me.panelBottom.is( ':visible' ) ? me.panelBottom.height() : 0 ) - ( me.viewMode.listView.active == "true" ? 20 : ( 16 * 2.5) ) ) );

}

me.toggleShowPanelBottom = function()
{
    me.resizePanelBottom();

    if ( ! me.panelBottom.is( ':visible' ) )
    {
        me.cwsRenderObj.focusRelegator.hide();
    }
    else
    {
        me.cwsRenderObj.focusRelegator.show();
    }   

    me.panelBottom.toggle("slide", { direction: "down" }, 200);

}

me.resizePanelSide = function()
{
    //
}

me.resizePanelBottom = function()
{
    var panelTop = ($( window ).height() / 1.5); //( $( window ).height() < 600 ) ? 200 : ($( window ).height() / 1.5);
    //var panelTop = ( $( window ).height() < 600 ) ? ($( window ).height() / 1.5) : ($( window ).height() / 1.25) ;

    if ( me.panelBottom.css( 'height') != ( $( window ).height() - panelTop ) + 'px' ) 
    { 
        me.panelBottom.css( 'height', ( $( window ).height() - panelTop ) + 'px' );
    }
    if ( me.panelBottom.css( 'top') != panelTop + 'px' ) 
    { 
        me.panelBottom.css( 'top', panelTop + 'px' );
    }
    if ( me.panelBottom.css( 'z-index') != '101' ) 
    { 
        me.panelBottom.css( 'z-index', '101' );
    }
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

me.onLocationFound = function(e) 
{

    me.defaultCoordinatePoint = [ e.latlng.lat, e.latlng.lng ];

    me.clearMarkerSearchResultLayer( 'myPin' );
    me.createMyCoordinateMarker( true );

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
    if ( me.displayControlScaleDistance )
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
 
    me.updateViewModeSettings();

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

me.initialiseMapsDefaults = function()
{
    me.mapDiv.css( 'height', '100%' ); //$( window ).height() + 'px'
    me.mapDiv.css( 'zIndex', '100' );

    me.panelBottom.hide();

    if ( me.defaultCoordinatePoint )
    {
        me.mapLibObj.setView( me.defaultCoordinatePoint );
        me.mapLibObj.invalidateSize();
        me.viewSet = true;
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

me.initialisePageControls = function()
{
    me.panelBottom.empty();
    me.panelBottom.append( me.createPanelBottomDefaults() );

    var dvPanelCloser = $( '<div class="searchFooter-collapser" style="width:100%;right:0;height:1px;display:none;" ><a class="fas fa-angle-up searchResults-close"></a></div>' );

    $( 'div.search-results-container' ).append( dvPanelCloser );
}

me.createPanelBottomDefaults = function()
{
    var dvPanelFrame = $( '<div id="panelBottomFrame" style=""></div>' );
    var dvPanelCloser = $( '<div style="width:100%;right:0;height:1px" ></div>' ); //<a class="panelBottom-close">X</a> //fas fa-angle-down 
    var dvPanelContents = $( '<div id="panelBottomContents" class="panelBottom-contents"></div>' );
    
    dvPanelFrame.append( dvPanelCloser );
    dvPanelFrame.append( dvPanelContents );

    return dvPanelFrame;

}

me.initialiseSearchControlOptions = function()
{
    /*me.searchControlOpts.push( { label: 'Show All on Map', name: 'ShowAllOnMap', class: 'fas fa-crop-alt', textStyle: 'color:#709302;', iconStyle: 'color:#709302;', eventHandler: 'Util.checkDataExists', parm: 0, selected: 0, type: 'action', enabled: false, group: 1 } );
    me.searchControlOpts.push( { label: 'CwS Outlets', name: 'cwsOutlet', class: 'fas fa-clinic-medical', textStyle: 'color:#50555a;', iconStyle: 'color:#919191;text-shadow: 1px 1px #DEDEDE;', eventHandler: 'Util.checkDataExists', parm: 1, selected: 1, type: 'filter', enabled: false, group: 0 } );
    me.searchControlOpts.push( { label: 'CwS Provider', name: 'cwsProvider', class: 'fas fa-user-nurse', textStyle: 'color:#50555a;', iconStyle: 'color:#919191;text-shadow: 1px 1px #DEDEDE;', eventHandler: 'Util.checkDataExists', parm: 1, selected: 0, type: 'filter', enabled: false, group: 0 } );
    me.searchControlOpts.push( { label: 'CwS Service', name: 'cwsService', class: 'fas fas fa-notes-medical', textStyle: 'color:#50555a;', iconStyle: 'color:#919191;text-shadow: 1px 1px #DEDEDE;', eventHandler: 'Util.checkDataExists', parm: 1, selected: 0, type: 'filter', enabled: false, group: 1 } );
    me.searchControlOpts.push( { label: 'Google Places', name: 'googlePlaces', class: 'fas fa-globe', textStyle: 'color:#2C98F0;', iconStyle: 'color:#2C98F0;', eventHandler: 'Util.checkDataExists', parm: 2, selected: 0, type: 'filter', enabled: false, group: 0 } );*/
    //me.searchControlOpts.push( { label: 'search Distance', name: 'distanceRadius', class: 'fas fa-route sliderControl', textStyle: 'color:#50555a;font-size:12px;', iconStyle: '', updateEvent: me.updateSearchDistanceLimit, control: me.getSlider, defaultValue: me.distanceThreshold.limitSearchDistance, parm: { min: 1, max: 1000, step: 1 }, scale: { unit: 100, label: 'm' }, enabled: true, group: 0 } );

    me.searchControlOpts.push( { label: 'nearest', name: 'distanceCount', class: 'fas fa-map-marker-alt', textStyle: 'color:#50555a;font-size:12px;', iconStyle: '', updateEvent: me.updateSearchCountLimit, control: me.getSelector, defaultValue: me.distanceThreshold.limitSearchCount, parm: { 3: ' 3 outlets', 5: ' 5 outlets', 10: '10 outlets', 50: '50 outlets' }, enabled: true, selected: true, group: 0, alwaysOn: false } );
    me.searchControlOpts.push( { label: 'distance', name: 'distanceRadius', class: 'fas fa-route sliderControl', textStyle: 'color:#50555a;font-size:12px;', iconStyle: '', updateEvent: me.updateSearchDistanceLimit, control: me.getSelector, defaultValue: me.distanceThreshold.limitSearchDistance, parm: { 1000: '1km', 5000: '5km', 10000: '10km', 50000: '50km', 100000: '100km', 250000: '250km' }, enabled: true, selected: false, group: 0, alwaysOn: false } );
    me.searchControlOpts.push( { label: 'services', name: 'filter.services', class: 'fas fa-heartbeat', textStyle: 'color:#50555a;font-size:12px;', iconStyle: '', updateEvent: me.updateServiceCriteria, control: me.getSliderSwitches, defaultValue: '', parm: me.getServiceParms(), enabled: true, selected: false, group: 0, alwaysOn: true } );

    //me.searchType = me.searchControlOpts[ 0 ];
    me.setSearchType( me.searchControlOpts[ 0 ] );

    $( '#searchbox-searchoptions').attr( 'class', 'searchbox-searchoptions' );
    $( '#searchbox-searchoptions').addClass( 'fas fa-caret-down' ); //me.searchType.class );

    me.panelFloat = $( 'div.info-floating-container' );

    //$( '#searchbox-searchoptions').attr( 'style', me.searchType.iconStyle );

}

me.returnSearchOptionsContent = function()
{
    var ret = document.createElement('div');

    for ( var i = 0; i < me.searchControlOpts.length; i++ )
    {

        if ( me.searchControlOpts[ i ].enabled )
        {
            var tblStyle = me.searchControlOpts[ i ].textStyle;
            var tdIconStyle = me.searchControlOpts[ i ].iconStyle;

            //DO NOT REMOVE: reuse later
            if ( me.searchControlOpts[ i ].selected || me.searchControlOpts[ i ].alwaysOn )
            {
                tblStyle += 'opacity:1;border-radius:6px;';

                if ( me.searchControlOpts[ i ].selected )
                {
                    tblStyle += 'background-Color:#F5F5F5;';
                }
            }
            else
            {
                tblStyle += 'opacity:0.25;background-Color:#F5F5F5;border-radius:6px;';
            }

            var tbl = document.createElement('table');
            tbl.setAttribute( 'id', 'searchOpt_' + me.searchControlOpts[ i ].name );
            tbl.setAttribute( 'class', 'searchOptTable' );
            tbl.setAttribute( 'style', tblStyle );

            var tr  = document.createElement('tr');
            var td1  = document.createElement('td');
            td1.setAttribute( 'id', 'searchOptIcon_' + me.searchControlOpts[ i ].name );
            td1.setAttribute( 'style', 'text-align:center;padding:12px 2px 8px 2px;width:38px;vertical-align:top;' + tdIconStyle );

            var spanStyle = 'font-size:12pt;';
            var faSpan  = document.createElement('span');

            tr.setAttribute( 'dataTargets', escape( JSON.stringify( me.searchControlOpts[ i ] ) ) );

            //DO NOT REMOVE: reuse later
            /*tr.onclick = function () {

                var attrDataTargets = this.getAttribute( 'datatargets' );

                //DO NOT REMOVE: reuse later
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
                        me.resizeSearchBox();
                        //me.refreshBaseLayer();

                    }

                }, 150);

            };*/

            tr.onclick = function () {

                if ( ! JSON.parse( unescape( $( this ).attr( 'datatargets' ) ) ).alwaysOn )
                {
                    me.unhighlightSearchOptions();
                    me.setSearchType( JSON.parse( unescape( $( this ).attr( 'datatargets' ) ) ) );
                }


                //me.setSearchOptionActive();
                $( this.parentElement ).css( 'opacity', '1' );
                
                if ( ! JSON.parse( unescape( $( this ).attr( 'datatargets' ) ) ).alwaysOn )
                {
                    $( this.parentElement ).css( 'background-color', '#F5F5F5' );
                }

                $( this.parentElement ).css( 'border-radius', '6px' );

                if ( me.searchType.name == 'distanceRadius' )
                {
                    me.addRadiusMarker();
                }
                if ( me.searchType.name == 'distanceCount' )
                {
                    me.clearRadiusMarker();
                }

                if ( ! JSON.parse( unescape( $( this ).attr( 'datatargets' ) ) ).alwaysOn )
                {
                    me.clearMarkerSearchResultLayer( 'searchPin' ); // not efficient --> there should be a smarter way to remove a single marker instead of clearing ALL and re-adding
                    me.runSearch( ( me.searchWords.length == 0 ), ( me.searchWords.length == 0 ) );                        
                }

            }

            faSpan.setAttribute( 'class', me.searchControlOpts[ i ].class + '');
            faSpan.setAttribute( 'style', spanStyle );

            var td2  = document.createElement('td');
            td2.setAttribute( 'style', 'padding:8px;width:110px;vertical-align:top;' + spanStyle); //font-size:12pt;

            var txt = document.createTextNode( me.searchControlOpts[ i ].label );


            var td3  = document.createElement('td');
            td3.setAttribute( 'style', 'padding:1px;'); //font-size:12pt;

            if ( me.searchControlOpts[ i ].control )
            {
                var ctlOpt = me.searchControlOpts[ i ].control( me.searchControlOpts[ i ].defaultValue, me.searchControlOpts[ i ].parm, me.searchControlOpts[ i ].updateEvent );
                td3.appendChild( ctlOpt );
            }

            tbl.appendChild( tr );
            tr.appendChild( td1 );
            td1.appendChild( faSpan );

            tr.appendChild( td2 );
            td2.appendChild( txt );

            tr.appendChild( td3 );

            ret.appendChild( tbl );

            if ( me.searchControlOpts[ i ].group > 0 )
            {
                var grpSeparator = document.createElement('div')
                grpSeparator.setAttribute( 'style', 'border-bottom:1px solid #F5F5F5;margin:1px 0 0 0;height:2px;' );
                ret.appendChild( grpSeparator );
            }
        }

    }

    return ret;

}

me.unhighlightSearchOptions = function()
{
    //var panelObj = me.searchControlOpts;

    for ( var i = 0; i < me.searchControlOpts.length; i++ )
    {
        $( '#searchOpt_' + me.searchControlOpts[ i ].name ).css( 'opacity', '0.25'); //0.25
        $( '#searchOpt_' + me.searchControlOpts[ i ].name ).css( 'background-color', '#fff'); 

    }
}

me.getServiceParms = function()
{
    // fetch from JSON / API
   return [ { id: 'contraception', name: 'contraception', filter: false },
            { id: 'pacmiso', name: 'pacmiso', filter: false },
            { id: 'macmva', name: 'macmva', filter: false },
            { id: 'ma', name: 'ma', filter: false },
            { id: 'hrc', name: 'hrc', filter: false },
            { id: 'safea', name: 'safea', filter: false }
         ];
}


me.addRadiusMarker = function()
{
    me.clearRadiusMarker();
    me.circleRadiusMarker = L.circle( me.defaultCoordinatePoint, parseFloat( me.distanceThreshold.limitSearchDistance ), { stroke: false, weight: 0, color: '#fff', fillColor: '#136AEC', fillOpacity: 0.2 }  ).addTo( me.mapLibObj );
}

me.clearRadiusMarker = function()
{
    if ( me.circleRadiusMarker )
    {
        me.mapLibObj.removeLayer( me.circleRadiusMarker );
    }
}

me.showHideSearchResultsPanel = function()
{
    if ( $( '.search-results-inner' ).is( ':visible') ) 
        {
            // run shrink/hide logic
            $( '.searchResults-close' ).removeClass( 'fa-angle-up' );
            $( '.searchResults-close' ).addClass( 'fa-angle-down' );
            $( '.searchResults-close' ).css( 'bottom', '9px' );
            $( '.search-results-container' ).css( 'top', '-19px' );
            $( '.search-words-container' ).hide( 'fast' );
        } 
        else 
        {
            // run expand/show logic
            $( '.searchResults-close' ).removeClass( 'fa-angle-down' );
            $( '.searchResults-close' ).addClass( 'fa-angle-up' );
            $( '.searchResults-close' ).css( 'bottom', '-10px' );
            $( '.search-results-container' ).css( 'top', '-1px' );
            $( '.search-words-container' ).show( 'fast' );
        }
        $( '.search-results-inner' ).toggle("slide", { direction: "up" }, 100);
}

me.createListviewControl = function()
{

    L.Control.Listview = L.Control.extend({
        onAdd: function(map) {
            var dv = L.DomUtil.create('div');
            dv.classList.add( 'searchbox-shadow' );
            dv.classList.add( 'listview-toggle' );
            dv.innerHTML = ( ( '<a id="float-control-ListOrMap" class="fas fa-map offset-listview-toggle"></a>' ) );
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
        $( '.searchbox' ).css( 'width', (screen.width < 500 ? ( screen.width - ( 16 * 2.5 ) - 40 ) : 450 ) ); //16 = margin (x3 left+middle+right), 40 = list icon width
    }
    else
    {
        $( '.searchbox' ).css( 'width', (screen.width < 500 ? ( screen.width - ( 16 * 2 ) ) : 450 ) ); //16 = margin (x3 left+middle+right), 40 = list icon width
    }

    $( '.search-results-container').css( 'minHeight', '20px' );
    $( '.search-results-container').css( 'maxHeight', ( $(window).height() - $( '.search-results-container').position().top - ( me.panelBottom.is( ':visible' ) ? me.panelBottom.height() : 0 ) - ( me.viewMode.listView.active == "true" ? 20 : ( 16 * 2.5) ) ) );

    // also resize 'country selector' box
    $( '.selection-country-container' ).css( 'width', parseFloat( $( '.searchbox' ).css( 'width' ).replace('px','') ) + 14 + 'px' );

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
    var td2  = document.createElement('td');
    td2.setAttribute( 'id', 'searchWordsDisplayUI' );
    td2.setAttribute( 'style', 'padding:2px;display:flex;flex-wrap:wrap;' );

    var td3  = document.createElement('td');
    td3.setAttribute( 'id', 'searchWordsProgressContainer' );
    td3.setAttribute( 'style', 'text-align:center;padding: 8px 12px 8px 8px;width: 45px;' );


    tbl.appendChild( tr );
    //tr.appendChild( td1 );
    //td1.appendChild( faSpan );

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
        me.clearMarkerSearchResultLayer( 'searchPin' ); // not efficient --> there should be a smarter way to remove a single marker instead of clearing ALL and readding
        if ( me.circleRadiusMarker )
        {
            me.mapLibObj.removeLayer( me.circleRadiusMarker );
        }
        if ( me.searchWords.length )
        {
            me.addAllSearchWords();
            me.runSearch();
        }
        else
        {
            if ( $( ".search-results-container" ).is( ':visible' ) ) $( ".search-results-container" ).toggle("slide", { direction: "up" }, 200);
            me.runSearch( true, true );
        }
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

me.runSearch = function( mapOnly, skipGetBounds, poi )
{
    RESTUtil.retrieveJson( 'countryData/' + me.countryCode + '.json', function( response, data ){

        var iCounter = 0;
        var foundKeysIdx = [];
        var dropKeysIdx = [];
        var newData = [];
        var iconArr = [];

        $( '.search-results-inner').empty();

        if ( poi && poi == true )
        {
            for ( var i = 0; i < data.length; i++ )
            {
                var found = false;
                if ( data[ i ].location.lat + ',' + data[ i ].location.long == me.defaultCoordinatePoint )
                {
                    found = true;
                    foundKeysIdx.push( i );
                    break;
                }
            }
        }
        else
        {
            for ( var i = 0; i < data.length; i++ )
            {
                var found = false;
                var searchString = me.newSearchString( data[i] ).toLowerCase();
                var servFound = false;
    
                if ( me.searchWords.length > 0 )
                {
                    for ( var w = 0; w < me.searchWords.length; w++ )
                    {
                        if ( searchString.indexOf( me.searchWords[ w ].toLowerCase() ) >= 0 )
                        {
                            found = true;
                            break;
                        }
                    }
                }
                else
                {
                    if ( mapOnly )
                    {
                        found = true;
                    }
                }

                if ( me.serviceFilter.length )
                {
                    if ( data[i].serviceMatches != undefined ) delete data[i].serviceMatches;
                }

                if ( found && me.serviceFilter.length )
                {
                    var serviceMatches = me.searchServiceAtProvider( me.serviceFilter, data[i] );
                    data[i].serviceMatches = parseFloat( serviceMatches );
                    found = ( parseFloat( serviceMatches ) > 0 );
                }

                // get array index of found matches
                if ( found )
                {
                    if ( ! foundKeysIdx.includes( i ) )    
                    foundKeysIdx.push( i );
                }

            }
        }

        if ( foundKeysIdx.length )
        {
            if ( poi && poi == true )
            {
                data[ foundKeysIdx[i] ].location.distance = 0;
                newData.push( data[ foundKeysIdx[i] ] );
            }
            else
            {
                // populate new array with found matches + create/calculate distance attribute
                for ( var i = 0; i < foundKeysIdx.length; i++ )
                {
                    newData.push( me.createDistanceAttr( data[ foundKeysIdx[i] ] ) );
                }

                // sort new array (by distance)
                newData.sort(function(a, b) {
                    if (a.location.distance < b.location.distance) { return -1; }
                    if (b.location.distance < a.location.distance) return 1;
                    else return 0;
                });
            }

            if ( mapOnly ) // autoPlot-nearby-outlets {mode}: do not display searchResults in left-panel
            {
                if ( poi && poi.toString() == '1' )
                {
                    // do nothing
                }
                else
                {
                    if ( me.searchType.name == 'distanceRadius' )
                    {
    
                        for ( var i = 0; i < newData.length; i++ )
                        {   // for remove all outlet locations > search-distance-limit
    
                            if ( parseFloat( newData[ i ].location.distance ) > parseFloat( me.distanceThreshold.limitSearchDistance ) )
                            {
                                dropKeysIdx.push( i );
                            }
    
                        }
                    }
                    else if ( me.searchType.name == 'distanceCount' )
                    {
    
                        if ( newData.length > me.distanceThreshold.limitSearchCount )
                        {
                            // for remove all outlet locations exceeding 'show-closest-count' limit
                            for (var i = newData.length - 1; i >= parseInt( me.distanceThreshold.limitSearchCount ); i--)
                            {
                                dropKeysIdx.push( parseFloat( i ).toFixed( 0 ) );
                            }
                        }    
                    }
                }
                
            }

            if ( dropKeysIdx.length > 0 )
            {
                dropKeysIdx.sort( Util.sortNumberReverse );

                for ( var i = 0; i < dropKeysIdx.length; i++ )
                {
                    newData.splice( dropKeysIdx [ i ], 1);
                }
            }


            var arrMarkers = [];
            me.mapMarkerIdx = [];

            if ( me.useClusterGroups )
            {
                me.mapLibObj.removeLayer( me.clusterGroup );
                me.clusterGroup = L.markerClusterGroup();
            }

            // write out search results
            for ( var i = 0; i < newData.length; i++ )
            {
                // create 'SUMMARY CARD' for Outlet
                me.createPreviewCard( newData[ i ], $( '.search-results-inner'), ( iCounter + 10 ).toString( 36 ).toUpperCase(), i, function( rndID, cardTag, dataJson ){

                    $( '#flyTo_' + rndID ).click( function()
                    { 
                        var coord = ( $( this ).attr( 'location' ) ).split( ',' );

                        me.mapLibObj.flyTo ( [ coord[0], coord[1] ], me.pointOverZoomlevel ); //, { animate: true, duration: me.mapFlyAnimationDelay }

                        if ( $( '.search-results-inner' ).is( ':visible') ) 
                        {
                            me.showHideSearchResultsPanel();
                        }

                        me.getMapDataPreviewFromID( $( this ) );

                    } );

                    if ( Util.isMobi() )
                    {
                        me.createShareIconClick( rndID );
                    }

                    // move to it's own function (e.g. me.createSearchPin() )
                    var rndID = 'pin' + Util.generateRandomString( i+1 );

                    // create 'MAP MARKER' for Outlet
                    var myMarkerIcon = L.AwesomeMarkers.icon({
                        icon: 'searchPin',
                        markerColor: 'red',
                        prefix: 'fa',
                        html: '<i id="pin_' + rndID + '" mapped-data="' + escape( JSON.stringify( newData[i] ) ) + '" mapped-data-text="' + ( iCounter + 10 ).toString( 36 ).toUpperCase() + '" mapped-data-idx="' + i + '" class="cwsPin textShadow">' +( iCounter + 10 ).toString( 36 ).toUpperCase() + '</i>'
                    });

                    if ( me.useClusterGroups )
                    {
                        var newMarker = L.marker( [ newData[i].location.lat, newData[i].location.long ], {icon: myMarkerIcon } ); //.addTo( me.mapLibObj ); //not added to map, that is handled by cluster plugin
                    }
                    else
                    {
                        var newMarker = L.marker( [ newData[i].location.lat, newData[i].location.long ], {icon: myMarkerIcon } ).addTo( me.mapLibObj );
                    }

                    if ( dataJson.serviceMatches )
                    {
                        $( newMarker._icon ).css( 'opacity', parseFloat( dataJson.serviceMatches ).toFixed( 1 ) );
                    } 

                    newMarker.setZIndexOffset( 500 - i );
                    arrMarkers.push( newMarker );
                    me.mapMarkerIdx.push( { idx: i, id: rndID } );

                    if ( me.useClusterGroups ) me.clusterGroup.addLayer( newMarker );

                } );

                iCounter += 1;

            }

            me.mappedData = newData;

            if ( me.lastMarker )
            {
                arrMarkers.push( me.lastMarker );
            }

            if ( ! mapOnly )
            {
                if ( ! $( '.searchFooter-collapser' ).is( ':visible') )
                {
                    $( '.searchFooter-collapser' ).show();
                } 
            }


            if ( me.useClusterGroups )
            {
                me.mapLibObj.addLayer( me.clusterGroup );

                me.clusterGroup.on('click', function (a) {
                    me.pinClickEvent( $( a.layer._icon ).find( '.cwsPin' ) );
                });
            }


            if ( skipGetBounds != undefined && skipGetBounds == false )
            {
                me.markerGroup = L.featureGroup( arrMarkers );
                me.mapLibObj.flyToBounds( me.markerGroup.getBounds() );
            }

        }
        else
        {
            $( ".search-results-inner" ).html( '<div style="padding:10px;" term="">No matches found</div>' );
        }

        //if ( me.lastMarker)
        //{
        //    me.lastMarker.setZIndexOffset( 1000 );
        //}

        FormUtil.hideProgressBar();

    } );

}

me.pinClickEvent = function( pin )
{
    if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);
    
    if ( $( '.search-results-inner' ).is( ':visible') ) 
    {
        me.showHideSearchResultsPanel();
    }


    if ( $( 'div.search-options-container' ).is( ':visible') )
    {
        me.cycleIcons( '#searchbox-searchoptions', 'fa-caret-down', 'fa-caret-up' );

        $(".search-options-container").toggle("slide", { direction: "up" }, 200);

    }

    setTimeout( function() { 
        me.getMapDataPreviewFromID( $( pin ) );
    }, 210 );

}

me.getSearchDistanceIcons = function( arrList )
{
    var tbl = $( '<table style="width:100%;background-Color:#2C98F0;border:0;padding:0;margin:0;border-radius:10px">' );
    var tr = $( '<tr>' );
    var td = $( '<td style="0 0 0 10px">' );

    tbl.append( tr );
    tr.append( td );

    for ( var i = 0; i < arrList.length; i++ )
    {
        var icon = $( '<div class="searchIconFilter textShadow ' + arrList[ i ] + '"></div>' );
        td.append( icon );
    
    }
    return tbl;
}

me.clearMarkerSearchResultLayer = function( iconClass )
{
    me.mapLibObj.eachLayer(function (ml) {

        if ( ml.options && ml.options.icon && ml.options.icon.options && ml.options.icon.options.icon )
        {
            if  ( ml.options.icon.options.icon == iconClass ) 
            {
                me.mapLibObj.removeLayer( ml );
            }
        }
    })
}

me.clearMarkerAgainstSearchResultTest = function( iconClass )
{
    // only clear items not 'qualifying' under current search criteria to avoid repeating clear + create L.marker
    me.mapLibObj.eachLayer(function (ml) {

        if ( ml.options && ml.options.icon && ml.options.icon.options && ml.options.icon.options.icon )
        {
            if  ( ml.options.icon.options.icon == iconClass ) 
            {
                me.mapLibObj.removeLayer(ml);
            }
        }
    })
}

me.createDistanceAttr = function( dataJson )
{
    var mapCoord = me.defaultCoordinatePoint; //me.mapLibObj.getCenter();

    dataJson.location.distance = parseFloat( MapUtil.crowDistance( parseFloat( mapCoord[0] ), parseFloat( mapCoord[1] ), dataJson.location.lat, dataJson.location.long ) ) * 1000;

    return dataJson;
}


me.searchServiceAtProvider = function( services, dataJson )
{
    var arrSvc = services.split(',');
    var svcMatches = 0;

    for ( var key in dataJson.service )
    {
        if ( ( dataJson.service[ key ] ).toString().toUpperCase() == "TRUE" )
        {
            for ( var i = 0; i < arrSvc.length; i++ )
            {
                if ( key.toString().toLowerCase() == ( arrSvc[ i ] ).toLowerCase() )
                {
                    svcMatches += 1;
                }
            }
            
        }
    }

    return parseFloat( svcMatches / arrSvc.length );

}

me.newSearchString = function( dataJson )
{
    var ret = '';

    //DO NOT REMOVE: for now default to always search everything
    //if ( me.searchType.name == 'cwsOutlet' )
    {
        ret = dataJson.outlet.name + ' ' + dataJson.provider.name + ' ' + dataJson.provider.address1 + ' ' + dataJson.provider.address2; //address1, address2

        for ( var key in dataJson.service )
        {
            if ( ( dataJson.service[ key ] ).toString().toUpperCase() == "TRUE" )
            {
                ret += ' ' + key;
            }
        }

    }

    return ret;

}

me.createPreviewCard = function( dataJson, tagItm, iconText, dataIdx, returnFunc )
{
    var allPhoneNums = me.getDisplayPhoneNums( dataJson );
    var ArrRating    = me.getOutletRatingRow( dataJson );
    var ArrOpenTimes = me.getOpenTimesArray( dataJson );
    var allServices  = me.getDisplayServices( dataJson );
    var allProviders = me.getDisplayProviders( dataJson );
    var distance     = dataJson.location.distance; // me.getDistance( dataJson );
    var rndID        = Util.generateTimedUid();
    var svgCircle    = FormUtil.circleMarker( iconText );

    //'      <td style="padding:2px;vertical-align:top;" ><div mapped-data="' + escape( JSON.stringify( dataJson ) ) + '" location="' + (dataJson.location.lat+','+dataJson.location.long) +'" mapped-data-idx="' + dataIdx + '" mapped-data-text="' + iconText + '" id="flyTo_' + rndID + '" class=""><div class="textShadow">' + iconText + '</div></div></td>' +

    var prvCard = $( '  <table class="previewCard" id="tblData_' + rndID + '" data.outlet="' + escape( JSON.stringify(dataJson.outlet) ) + '" data.location="' + escape( JSON.stringify(dataJson.location) ) + '" >' +
                   '    <tr>' +
                   '      <td rowspan=3 style="padding:2px;vertical-align:top;text-align:center;width:50px;" ><div mapped-data="' + escape( JSON.stringify( dataJson ) ) + '" location="' + (dataJson.location.lat+','+dataJson.location.long) +'" mapped-data-idx="' + dataIdx + '" mapped-data-text="' + iconText + '" id="flyTo_' + rndID + '" class="">' + svgCircle + '</div></td>' +
                   '      <td colspan=2 class="searchResultMainName"><div>' + Util.capitalizeAllFirstLetters( dataJson.outlet.name ) + '</div></td>' +
                   '      <td rowspan=3 style="font-size:8pt;font-weight:400;border-left:1px solid #BDBDBD;color:#215E8C;font-size:14pt;padding:2px 4px 2px 4px;text-align:center;width:80px;overflow:hidden;" rowspan=4>' + me.formatDisplayedDistanceOptions( distance ) + 
                   '         <div style="padding:2px;margin-top:4px;" ><i id="share_' + rndID + '" dataIdx="' + rndID + '" class="fas fa-share-alt shareThisOutlet" style="color:#2C98F0;font-size:14pt;' + ( Util.isMobi() ? '' : 'display:none;' ) + '" ></i>&nbsp;<img src="images/gmaps.svg" id="googleMaplink_' + rndID + '" class="googleMapIcon" style="position:relative;top:-2px;margin-left:' + ( Util.isMobi() ? '3px' : '0' ) + ';"></div>' +
                   '      </td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=2 class="previewCardAddress"><span>' + Util.capitalizeAllFirstLetters( dataJson.location.address1 ) + '&nbsp;</span></td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=2 class="previewCardAddress"><span>' + Util.capitalizeAllFirstLetters( dataJson.location.address2 ) + '&nbsp;</span></td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=2 class="previewCardOperatingHours"><table style="">' + me.writeArray(ArrRating) + me.writeArray( ArrOpenTimes ) + '</table></td>' +
                   '      <td colspan=2 class="previewCardPhoneNumberBlock" style=""><div style="padding:2px 0 2px 2px;">Phone:<span> ' + allPhoneNums + '</span></div></td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=4 class="previewCardProviderBlock"><table><tr><td style="width:20px;"><li class="fas fa-user-md" style="color:rgb(80,85,90,0.75);font-size:12pt;"></li></td><td>' + allProviders + '</td></tr></table> </td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=4 class="servicesRow" style="padding:8px 0 4px 6px !important;"><strong>Services</strong>: <span>' + allServices + '</span></td>' +
                   '    </tr>' +
                   '  </table>' );

    tagItm.append( prvCard );

    if ( returnFunc ) returnFunc( rndID, prvCard, dataJson, tagItm );

}

me.getDistanceFAicon = function( dist )
{
    for ( var i = 0; i < me.distanceScale.length; i++ )
   {
        if ( parseFloat( dist ) < ( parseFloat( me.distanceScale[ i ].distance ) / 1000 ) )
        {
            return me.distanceScale[ i ].faIcon
        }

    }
}
me.formatDisplayedDistanceOptions = function( dist )
{
    var unit;
    var newDist;

   for ( var i = 0; i < me.distanceScale.length; i++ )
   {
        if ( parseFloat( dist ) < ( parseFloat( me.distanceScale[ i ].distance ) ) )
        {
            if ( parseFloat( dist ) < 1 )
            {
                unit = 'm';
                newDist = parseFloat( dist ).toFixed( 0 );
            }
            else
            {
                unit = 'km';
                newDist = Math.floor( dist / 1000 ).toFixed( 0 );
            }
            return newDist + ' ' + unit;
        }

    }


}

me.writeArray = function(arr)
{
    var ret = '';
    for ( var i = 0; i < arr.length; i++ )
    {
        ret += arr[i];
    }
    return ret;
}
me.getDisplayPhoneNums = function( dataJson )
{
    var ret = '';
    if ( dataJson && dataJson.provider && dataJson.provider.phone1 ) ret += ( ( dataJson.provider.phone1 ) ? '<div class="previewCardPhoneNumber"><a class="previewCardTelNo" href="tel:' + dataJson.provider.phone1 + '">' + dataJson.provider.phone1 + '</a></div>' : '' );
    if ( dataJson && dataJson.provider && dataJson.provider.phone2 ) ret += ( ( dataJson.provider.phone2 ) ? '<div class="previewCardPhoneNumber"><a class="previewCardTelNo" href="tel:' + dataJson.provider.phone2 + '">' + dataJson.provider.phone2 + '</a></div>' : '' );
    return ret;
}
me.getOutletRatingRow = function( dataJson )
{    
    var arrRet = [];

    //arrRet.push ( '<tr><td colspan=2> ' + me.getRandomRatings( 'small' ) + ' </td></tr>' ) 

    return arrRet;
}
me.getOpenTimesArray = function( dataJson )
{
    var arrRet = [];
    var jsonTemp = { dayFrom: '', dayTo: '', times: '' };
    var lastPushed = '';
    var expectedKeys = ["mon","tue","wed","thu","fri","sat","sun"]

    arrRet.push ( '<tr><td colspan=2 class="openHoursLabelRow"> Opening Hours </td></tr>' ) 

    for ( var i = 0; i < expectedKeys.length; i++ )
    {
        if ( dataJson.opening [ expectedKeys[i] ] ) 
        {
            if ( jsonTemp.times != dataJson.opening [ expectedKeys[i] ] )
            {
                if ( jsonTemp.times.length )
                {
                    arrRet.push( me.getCalendarTimes( jsonTemp ) );
                    lastPushed = jsonTemp.dayTo;
                }
                //else
                {
                    jsonTemp.dayFrom = expectedKeys[i];
                    jsonTemp.dayTo = expectedKeys[i];
                    jsonTemp.times = dataJson.opening [ expectedKeys[i] ];
                }
            }
            else
            {
                jsonTemp.dayTo = expectedKeys[i];
            }
            lastOpenHrs = dataJson.opening [ expectedKeys[i] ];
            lastDay = expectedKeys[i];
        }
    }

    if ( lastPushed != jsonTemp.dayTo )
    {
        arrRet.push( me.getCalendarTimes( jsonTemp ) );
    }

    return arrRet;
}

me.getCalendarTimes = function( jsonData )
{
    //return '<b>'+jsonData.dayFrom + ( jsonData.dayFrom == jsonData.dayTo ? '' : '-' + jsonData.dayTo ) +'</b> ' + jsonData.times.toString().replace( ',', '-' );
    return '<tr><td class="openDay">'+ Util.capitalizeFirstLetter( jsonData.dayFrom ) + ( jsonData.dayFrom == jsonData.dayTo ? '' : '-' + Util.capitalizeFirstLetter( jsonData.dayTo ) ) +'</td><td class="openHours"> ' + me.timeToAbbr( jsonData.times ) + '</td></tr>';
}

me.timeToAbbr = function( timeAllText )
{
    var ret = '';
    if ( timeAllText )
    {
        var arrTimes = timeAllText.toString().split( ';');

        for ( var t = 0; t < arrTimes.length; t++ )
        {
            if ( arrTimes[t] == '0:00,24:00' )
            {
                ret = '24 hrs' + ', ';
            }
            else
            {
                var arrTimeBlock = arrTimes[t].split(',');

                for ( var i = 0; i < arrTimeBlock.length; i++ )
                {
                    ret += me.timePartToAbbr( arrTimeBlock[i]) + ' to ';
                }
                ret = ret.substring(0, ret.length - 4) + ', ';
            }
        }
    }
    ret = ret.substring(0, ret.length - 2);
    return ret;
}

me.timePartToAbbr = function(timeBlock)
{
    var arrT = timeBlock.split(':');
    var suff = parseInt( arrT[0] ) < 12 ? 'am' : 'pm';
    var sec = parseInt( arrT[1] ) == 0 ? '' : ':' + arrT[1];

    return ( parseInt( arrT[0] ) < 12 ? ( parseInt( arrT[0] ) == 0 ? 12 : arrT[0] ) : ( parseInt( arrT[0] ) - 12) ) + '' + sec + '' + suff;
}

me.getDisplayServices = function( dataJson )
{
    var ret = '';

    for ( var key in dataJson.service )
    {
        if ( ( dataJson.service[ key ] ).toString().toUpperCase() == "TRUE" )
        {
            if ( me.serviceFilter && me.serviceFilter.length )
            {
                var arrFilter = me.serviceFilter.split(',');
                var bFound = false;
                for ( var o = 0; o < arrFilter.length; o++ )
                {
                    if ( arrFilter[o] == key )
                    {
                        bFound = true;
                        break;
                    }
                    /*else
                    {
                        ret += '<span class="rounded" style="margin-left:2px;padding:2px;background-Color:#fff;border:1px solid #fff;">' + key + '</span>' ;
                    }*/
                }
                if ( bFound )
                {
                    ret += '<span class="rounded" style="margin-left:2px;padding:2px;background-Color: rgb( 0, 181, 225, 0.15 ); border:1px solid #00b5e1;">' + key + '</span>';
                }
                else
                {
                    ret += '<span class="rounded" style="margin-left:2px;background-Color:#fff;border:1px solid #fff;">' + key + '</span>' ;    
                }
            }
            else
            {
                ret += '<span class="rounded" style="margin-left:2px;background-Color:#fff;border:1px solid #fff;">' + key + '</span>' ;
            }
            
        }
    }

    if ( ret.length > 0 )  return ret.substring(0, ret.length - 2);
    else return ret;
}
me.getDisplayProviders = function( dataJson )
{
    var ret = '';

    var templateWithRatings = '<table class="providerRow">'+
                              '  <tr>'+
                              '    <td>{PROVIDER}</td>'+
                              '  </tr>'+
                              '</table>';

    //DO NOT REMOVE: will be reused
    /*                          '  <tr>'+
                              '    <td style="line-height: 0px;">'+
                                     me.getRandomRatings( 'tiny' ) +
                              '    </td>'+
                              '  </tr>'+        */
    if ( dataJson && dataJson.provider && dataJson.provider.name )
    {
        if ( 1 == 1 ) //boolean : include option to display Y/N provider ratings
        {
            return templateWithRatings.replace( '{PROVIDER}',Util.capitalizeAllFirstLetters( dataJson.provider.name ) );
        }
        else
        {

        }
        return dataJson.provider.name;
    }
    else
    {
        return '';
    }

}
me.getRandomRatings = function( classSize )
{
    var rndScore = Math.round( Util.generateRandomNumberRange( 0, 5 ) );
    var ret = '';

    for ( var t = 0; t < rndScore; t++ )
    {
        ret += '<i class="rating '+classSize+' gold fas fa-star"></i>';
    }
    for ( var t = rndScore; t < 5; t++ )
    {
        ret += '<i class="rating '+classSize+' gray fas fa-star"></i>';
    }
    return ret;
}
me.getDistance = function( dataJson )
{
    if ( dataJson.location && dataJson.location.lat && dataJson.location.long )
    {
        var mapCoord = me.mapLibObj.getCenter();
        return parseFloat( MapUtil.crowDistance( mapCoord.lat, mapCoord.lng, dataJson.location.lat, dataJson.location.long ) ).toFixed(1);
    }

}

me.updateSearchDistanceLimit = function( e )
{
    me.distanceThreshold.limitSearchDistance = e.value;

    me.addRadiusMarker();
    me.clearMarkerSearchResultLayer( 'searchPin' ); // not efficient --> there should be a smarter way to remove a single marker instead of clearing ALL and re-adding
    me.runSearch( ( me.searchWords.length == 0 ), ( me.searchWords.length == 0 ) );

}

me.updateSearchCountLimit = function( e )
{
    me.distanceThreshold.limitSearchCount = e.value;
    me.clearMarkerSearchResultLayer( 'searchPin' );
    me.runSearch( true, true );
}

me.updateServiceCriteria = function( e )
{
    var myFilter = me.serviceFilter;
    var arrFilter = me.serviceFilter.split(',');

    if ( e.checked )
    {
        //add to filter
        arrFilter.push( e.value );
    }
    else
    {
        //remove from filter
        for ( var o = 0; o < arrFilter.length; o++ )
        {
            if ( arrFilter[o] == e.value )
            {
                arrFilter.splice( o, 1 );
            }
        }
    }

    me.serviceFilter = Util.commaDelimitArray( arrFilter );
    me.clearMarkerSearchResultLayer( 'searchPin' );
    me.runSearch( true, true );
}

me.getSlider = function( defaultValue, optionsJson, updateEvent )
{
    var newSl = document.createElement('input');

    newSl.type = 'range', newSl.min = optionsJson.min, newSl.max = optionsJson.max, newSl.step = optionsJson.stepIncr, newSl.value = defaultValue; //,newSl.className='leaflet-control-layers-sliderControl';

    if ( updateEvent )
    {
        newSl.addEventListener('change', updateEvent() );
    }

    return newSl;
}

me.getSliderSwitches = function( defaultValue, optionsJson, updateEvent )
{
    var dv = document.createElement('div');

    for ( var o = 0; o < optionsJson.length; o++ )
    {
        var dvSlider = document.createElement('div');
        var tbl = document.createElement('table');

        tbl.setAttribute('class', 'rounded');
        tbl.setAttribute('style', 'background-Color:#fff;width:100%;padding:8px 0;vertical-align:top;font-size:14px;');

        dv.appendChild(dvSlider);
        dvSlider.appendChild(tbl);

        var tr = document.createElement('tr');
        var td1 = document.createElement('td');
        var txt = document.createTextNode( ( optionsJson[ o ].name ) );
        var td2 = document.createElement('td');
        var lbl = document.createElement('label');

        td2.setAttribute('style', 'width:45px;');
        lbl.setAttribute('class', 'switch');

        var inp = document.createElement('input');
        inp.setAttribute('type', 'checkbox');
        inp.setAttribute('value', optionsJson[ o ].id);
        inp.setAttribute('id', 'service_' + optionsJson[ o ].id );

        var sp = document.createElement('span');
        sp.setAttribute('class', 'slider round');

        if ( updateEvent )
        {
            inp.addEventListener("change", function(){
                updateEvent( this );
            });
        }

        tbl.appendChild(tr);
        tr.appendChild(td1);
        td1.appendChild(txt);
        tr.appendChild(td2);
        td2.appendChild(lbl);

        lbl.appendChild(inp);
        lbl.appendChild(sp);

    }

    dv.setAttribute('style', 'width:99% !important');

    return dv;
}

me.getSelector = function( defaultValue, optionsJson, updateEvent )
{
    var dv = document.createElement('div');
    var sel = document.createElement('select');

    for ( var key in optionsJson )
    {
        //console.log ( key + ' = ' + optionsJson[ key ] + '( ' + defaultValue + ': ' + ( optionsJson[ key ] == defaultValue ) + ' )' );

        var opt = document.createElement('option');
        opt.setAttribute('value', key);
        opt.setAttribute('style', 'background-Color:#F5F5F;color:#50555a;line-height: 22px;');

        if ( ( [ key ] ).toString() == ( defaultValue ).toString() )
        {
            opt.setAttribute('selected', true);
        }

        var txt = document.createTextNode( optionsJson[ key ] );
        opt.appendChild(txt);
        sel.appendChild(opt);

    }

    if ( updateEvent )
    {
        sel.addEventListener("change", function(){
            updateEvent( this );
        });
    }

    dv.setAttribute('class', 'select');
    dv.setAttribute('style', 'width:99% !important');
    sel.setAttribute('class', 'selector form-type-text search-Opt-Select');
    dv.appendChild(sel);

    return dv;
}

me.getMapDataPreviewFromID = function( thisObj, dataJson ) //id
{
    var virtObj;
    var virtTag;

    if ( dataJson )
    {
        virtObj = dataJson;
        virtTag = $( '<div mapped-data="' + escape( JSON.stringify( dataJson ) ) + '" mapped-data-text="A" mapped-data-idx="0"></div>');
    }
    else
    {
        virtObj = JSON.parse( unescape( thisObj.attr( 'mapped-data' ) ) );
        virtTag = thisObj;
    }

    if ( Util.isMobi() && screen.width < 540 )
    {
        var targ = $( '#panelBottomContents' );
    }
    else
    {
        var targ = $( 'div.info-contents-container' );
    }

    targ.empty();

    me.createPreviewCard( virtObj, targ, unescape( virtTag.attr( 'mapped-data-text' ) ), unescape( virtTag.attr( 'mapped-data-idx' ) ), function( rndID, prvCard, dataJson, tagObj ){

        if ( Util.isMobi() && screen.width < 540 )
        {
            me.createShareIconClick( rndID );
            me.resizePanelBottom();

            if ( ! $( '#panelBottom' ).is( ':visible' ) ) $( '#panelBottom' ).toggle("slide", { direction: "down" }, 200);

        }
        else
        {
            me.resizePanelSide();
            if ( ! $( 'div.info-floating-container' ).is( ':visible' ) ) $( 'div.info-floating-container' ).toggle("slide", { direction: "up" }, 200);
        }

        me.createGoogleMapsIconClick( rndID );
        //if ( ! me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);

    });

}

me.createShareIconClick = function( rndID )
{
    $( '#share_' + rndID ).click( function() {

        var myLocation = JSON.parse( unescape( $( '#tblData_' + $( this ).attr( 'dataIdx' ) ).attr( 'data.location' ) ) );
        var myOutlet = JSON.parse( unescape( $( '#tblData_' + $( this ).attr( 'dataIdx' ) ).attr( 'data.outlet' ) ) );

        FormUtil.shareApp( myOutlet.name, myLocation.lat + ',' + myLocation.long, true );

    } );
}

me.createGoogleMapsIconClick = function( rndID )
{
    $( '#googleMaplink_' + rndID ).click( function() {

        var myLocation = JSON.parse( unescape( $( '#tblData_' + $( '#share_' + rndID ).attr( 'dataIdx' ) ).attr( 'data.location' ) ) );
        var myOutlet = JSON.parse( unescape( $( '#tblData_' + $( '#share_' + rndID ).attr( 'dataIdx' ) ).attr( 'data.outlet' ) ) );
        var url = 'https://www.google.com/maps?ie=UTF8&q=' + myOutlet.name + '@' + myLocation.lat + ',' + myLocation.long;

        window.open(url, '_blank');

    } );
}

me.showPanelWithContents = function( success ) //innerTag
{
    /*var panelBottomContents = $( '#panelBottomContents' );

    panelBottomContents.empty();
    panelBottomContents.append( innerTag );

    me.resizePanelBottom();

    if ( ! me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);*/
    
}

me.countryOptions = function()
{
    var countryOpts = [];

    //countryOpts.push( { iso: '', name: 'none', lat: 28.3949, lng: 84.1240, zoom: 5, selected: ( me.countryCode == '' ? 1 : 0 ) } );
    countryOpts.push( { iso: 'cm', name: 'Cameroon', lat: 5.0252, lng: 12.5134, zoom: 7, selected: ( me.countryCode == 'cm' ? 1 : 0 ), enabled: 1 } );
    countryOpts.push( { iso: 'ken', name: 'Kenya', lat: 0.0236, lng: 37.9062, zoom: 7, selected: ( me.countryCode == 'ken' ? 1 : 0 ), enabled: 0 } );
    countryOpts.push( { iso: 'np', name: 'Nepal', lat: 28.21486, lng: 83.98086, zoom: 7, selected: ( me.countryCode == 'np' ? 1 : 0 ), enabled: 1 } );

    return countryOpts;
}

me.nearestCountryAttr = function( attr )
{
    var countries = me.countryOptions();

    for ( var i = 0; i < countries.length; i++ )
    {
        var mapCoord = me.defaultCoordinatePoint; //me.mapLibObj.getCenter();

        countries[ i ].distance = parseFloat( MapUtil.crowDistance( parseFloat( mapCoord[0] ), parseFloat( mapCoord[1] ), countries[ i ].lat, countries[ i ].lng ) ) * 1000;

        countries.sort(function(a, b) {
            if (a.distance < b.distance) { return -1; }
            if (b.distance < a.distance) return 1;
            else return 0;

        });

    }

    console.log( 'finding nearest country [' + attr + ']: ' + countries[ 0 ] [ attr ] );

    return countries[ 0 ] [ attr ];

}

me.countryOptionIsValid = function()
{
    var countries = me.countryOptions();

    for ( var i = 0; i < countries.length; i++ )
    {
        if ( countries[ i ].iso == me.countryCode )
        {
            return true;
        }
    }

    return false;

}

me.setCountryCode = function( isoc )
{   
    var countries = me.countryOptions();

    for ( var i = 0; i < countries.length; i++ )
    {
        if ( countries[ i ].iso == isoc )
        {
            me.countryCode = isoc;
            return [ countries[ i ].lat, countries[ i ].lng ];
        }
    }

}


}
