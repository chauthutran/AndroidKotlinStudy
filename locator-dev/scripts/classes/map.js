// -------------------------------------------
// -- Map Class/Methods

function CwSMap() {

    var me = this;

    me.googleStreets = false;

    me.cwsRenderObj;
    me.mapLibObj;
    me.mappedData;

    me.mapTargetDiv = 'mapApp'; //$( '#mapApp' );
    me.mapDiv = $( '#mapApp' );
    me.panelBottom = $( '#panelBottom' );

    me.mapPadding = 100;
    me.mapFlyAnimationDelay = .4;
    me.defaultCoordinatePoint;
    me.defaultZoomlevel = 3;

    me.mapDownIntvCounter;

    me.controlSearchbox
    me.controlTileLayerOptions;
    me.controlScale;
    me.controlZoom;
    me.controlLocateUser;
    me.controlListViewRound;
    me.controlPOCsearch;

    me.displayControlLocateUser = false;
    me.displayControlScale = true;
    me.displayControlListViewRound = false;

    me.defaultBaseLayer; // loaded in baseLayer fetch call "me.getBaseLayers()" // 'Open.StreetMap'; //'Roadmap'; //'Open.StreetMap';
    me.baseLayers;

    me.searchControlOpts = [];
    me.searchType = {};
    me.searchWords = [];
    me.mapOptions = { zoomControl: false, tap: true, renderer: L.svg({ padding: me.mapPadding }) };
    me.countryCode = '';

    me.viewMode = {};
    //me.distanceScale = { '< 500m': 500, '< 1km': 1000, 'walk/car': 2000, 'car/walk': 3000, '< 5km': 5000, '< 10km': 10000, '< 20km': 20000, '< 50km': 50000, '> 50km': 10000000 }; //examples of predefined distance options for later use
    me.distanceScale2 = [ { name: ' < 1km', distance: 1000, faIcon: 'fas fa-walking'}, { name: ' < 5km', distance: 5000, faIcon: 'fas fa-taxi' }, { name: '< 10km', distance: 10000, faIcon: 'fas fa-taxi' }, { name: '< 50km', distance: 50000, faIcon: 'fas fa-taxi' }, { name: '< 100km', distance: 100000, faIcon: 'fas fa-taxi' }, { name: '>  100km', distance: 10000000, faIcon: 'fas fa-plane' } ]; //examples of predefined distance options for later use
    me.distanceThreshold = { 'limitSearchCount': 3,'countIncrements': 3, 'limitSearchDistance': 5000 };

    me.markerGroup;
    me.mapMarkerIdx;
    me.lastMarker;

    me.circleRadiusMarker;
    me.circleFeatGroup; //GREG remove?

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
    me.restoreMapDefaults();

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

        if ( me.countryCode.length )
        {
            me.evalCountryCodeStartup();
        }
        else
        {
            me.createPositionPrompt();
        }

    }
    else
    {
        if ( me.countryCode.length == 0 )
        {
            me.countryCode = me.nearestCountryAttr( 'iso' );
        }

        if ( poi && poi.toString() == '1' )
        {
            console.log( 'finding POI' );
            me.runSearch( true, true, true );
            me.mapLibObj.setView( me.defaultCoordinatePoint, 8, { animate: true, duration: me.mapFlyAnimationDelay } ); 

            setTimeout( function() {

                me.mapLibObj.flyTo( [ me.defaultCoordinatePoint[0], me.defaultCoordinatePoint[1] ], 12 );

                me.showPanelWithContents( me.getMapDataPreviewFromID( undefined, me.mappedData[ 0 ] ) );

            }, 5000 );
        }
        else
        {
            me.createMyCoordinateMarker();
            me.runSearch( true );
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

    if ( Util.getParameterByName('google').length )
    {
        if ( ( (Util.getParameterByName('google')).toString().toLowerCase() == "false" || (Util.getParameterByName('google')).toString().toLowerCase() == "0" ) )
        {
            me.googleStreets = false;
        }
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

        if ( $(".search-options-container").is( ':visible') )
        {
            me.cycleIcons( '#searchbox-searchoptions', 'fa-caret-down', 'fa-caret-up' );

            $(".search-options-container").toggle("slide", { direction: "up" }, 250);
        }
    });

    $("#searchbox-searchoptions").click( function () {

        me.cycleIcons( '#searchbox-searchoptions', 'fa-caret-down', 'fa-caret-up' );

        if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);

        $(".search-options-container").toggle("slide", { direction: "up" }, 250);

        setTimeout(function(){ 
            me.resizeSearchBox();
        }, 275 );
    });

    $( '.searchResults-close' ).click( function () {

        if ( me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);

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

    me.mapLibObj.on('zoomend', function (e) 
    {
        console.log( me.mapLibObj.getZoom() );
    });

    me.mapLibObj.on( 'click', function(e) 
    { 
        if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);
        if ( me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);

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

        me.lastPositionClicked = [ e.latlng.lat,e.latlng.lng ];
        //console.log( me.lastPositionClicked );

    });

}

me.initialiseMapControls = function()
{

    me.markerGroup = L.FeatureGroup;

    if ( ! Util.isMobi() )
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
            
            $( ".search-results-inner" ).html( me.loadingIcon() );

            $( '.search-results-container').css( 'minHeight', '20px' ); //$( '.search-words-container').css( 'height' ) );
            $( '.search-results-container').css( 'maxHeight', ( $(window).height() - $( '.search-results-container').position().top - ( me.panelBottom.is( ':visible' ) ? me.panelBottom.height() : 0 ) - ( me.viewMode.listView.active == "true" ? 20 : ( 16 * 2.5) ) ) );

            if ( ! $( ".search-words-container" ).is( ':visible' ) ) $( ".search-words-container" ).toggle("slide", { direction: "up" }, 200);
            if ( ! $( ".search-results-container" ).is( ':visible' ) ) $( ".search-results-container" ).toggle("slide", { direction: "up" }, 200);
            if ( $( '.searchFooter-collapser' ).is( ':visible') ) $( '.searchFooter-collapser' ).hide();
            if ( me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);

            FormUtil.showProgressBar('100%');

            me.clearMarkerSearchResultLayer( 'searchPin' );

            setTimeout(function(){

                me.runSearch();

                $( '.search-results-container').css( 'minHeight', '20px' ); //$( '.search-words-container').css( 'height' ) );
                $( '.search-results-container').css( 'maxHeight', ( $(window).height() - $( '.search-results-container').position().top - ( me.panelBottom.is( ':visible' ) ? me.panelBottom.height() : 0 ) - ( me.viewMode.listView.active == "true" ? 20 : ( 16 * 2.5) ) ) );

            }, 2000);

        }

    }
    me.mapLibObj.addControl( me.controlSearchbox );


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

            console.log( me.countryCode );

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
        me.mapLibObj.setView( me.defaultCoordinatePoint, me.defaultZoomlevel, { animate: true, duration: me.mapFlyAnimationDelay } ); 
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

        //$( '.search-results-inner').empty();
        //$( ".search-results-container" ).toggle("slide", { direction: "up" }, 200)

        me.mapLibObj.setView( me.defaultCoordinatePoint, found.zoom, { animate: true, duration: me.mapFlyAnimationDelay } ); 

        me.createMyCoordinateMarker();
        me.runSearch( true );
    }
    else
    {
        me.createPositionPrompt();
    }
}

me.createPositionPrompt = function()
{
    $( '.search-results-inner').empty();
    $( '.search-results-inner').append( me.promptCountryOptions() );
    $( ".search-results-container" ).toggle("slide", { direction: "up" }, 200)

    //$( '.search-results-inner' ).toggle("slide", { direction: "up" }, 100);

}

me.promptCountryOptions = function()
{
    var countries = me.countryOptions();
    console.log( countries );
    var ret = document.createElement('div');
    var tbl = document.createElement('table');
    var tr  = document.createElement('tr');
    var td1  = document.createElement('td');
    var iFA  = document.createElement('i');
    var td2  = document.createElement('td');
    var txt = document.createTextNode( 'Country' );

    tbl.setAttribute( 'class', 'countrySelect' );
    td1.setAttribute( 'style', 'text-align:center;padding:8px 2px 8px 2px;width:38px;font-size:20px;color:#136AEC' );
    iFA.setAttribute( 'class', 'fas fa-globe-africa');
    td2.setAttribute( 'style', 'text-align:left;padding:8px 2px 8px 2px;font-size:12pt;font-weight:800;' );
    td2.setAttribute( 'term', '');

    tbl.appendChild( tr );
    tr.appendChild( td1 );
    td1.appendChild( iFA );
    tr.appendChild( td2 );
    td2.appendChild( txt );

    ret.appendChild( tbl );

    for ( var i = 0; i < countries.length; i++ )
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
        var txt = document.createTextNode( countries[ i ].name );

        tr.setAttribute( 'id', 'countryOptIcon_' + countries[ i ].iso );
        tr.setAttribute( 'class', 'countryRow' );
        tr.setAttribute( 'datatargets', escape( JSON.stringify( countries[ i ] ) ) );
        td1.setAttribute( 'style', 'text-align:center;padding:8px 2px 8px 2px;width:38px;' );
        td2.setAttribute( 'style', 'text-align:left;padding:8px 2px 8px 2px;font-size:11pt;' );

        tr.onmousedown = function () {
            $( this ).parent().css( 'opacity', 1 );
        }

        tr.onclick = function () {

            var thisData = JSON.parse( unescape( this.getAttribute( 'datatargets' ) ) );

            me.defaultCoordinatePoint = [ thisData.lat, thisData.lng ];
            me.countryCode = thisData.iso;

            $( '.search-results-inner').empty();
            $( ".search-results-container" ).toggle("slide", { direction: "up" }, 200)

            me.mapLibObj.setView( me.defaultCoordinatePoint, thisData.zoom, { animate: true, duration: me.mapFlyAnimationDelay } ); 

            me.clearMarkerSearchResultLayer( 'myPin' );
            me.createMyCoordinateMarker();
            me.runSearch( true );

        }

        tbl.appendChild( tr );
        tr.appendChild( td1 );
        tr.appendChild( td2 );
        td2.appendChild( txt );


        ret.appendChild( tbl );

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

me.restoreMapDefaults = function()
{
    me.mapDiv.css( 'height', '100%' ); //$( window ).height() + 'px'
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
    var dvPanelFrame = $( '<div id="panelBottomFrame" style="width:100%;height:100%;border:2px solid #F5F5F5;background-Color:#fff;"></div>' );
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

    me.searchControlOpts.push( { label: 'nearest', name: 'distanceCount', class: 'fas fa-map-marker-alt', textStyle: 'color:#50555a;font-size:12px;', iconStyle: '', updateEvent: me.updateSearchCountLimit, control: me.getSelector, defaultValue: me.distanceThreshold.limitSearchCount, parm: { 3: ' 3 outlets', 5: ' 5 outlets', 10: '10 outlets', 50: '50 outlets' }, enabled: true, selected: true, group: 0 } );
    me.searchControlOpts.push( { label: 'distance', name: 'distanceRadius', class: 'fas fa-route sliderControl', textStyle: 'color:#50555a;font-size:12px;', iconStyle: '', updateEvent: me.updateSearchDistanceLimit, control: me.getSelector, defaultValue: me.distanceThreshold.limitSearchDistance, parm: { 1000: '1km', 5000: '5km', 10000: '10km', 50000: '50km', 100000: '100km', 250000: '250km' }, enabled: true, selected: false, group: 0 } );

    //me.searchType = me.searchControlOpts[ 0 ];
    me.setSearchType( me.searchControlOpts[ 0 ] );

    $( '#searchbox-searchoptions').attr( 'class', 'searchbox-searchoptions' );
    $( '#searchbox-searchoptions').addClass( 'fas fa-caret-down' ); //me.searchType.class );

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
            if ( me.searchControlOpts[ i ].selected )
            {
                tblStyle += 'opacity:1;background-Color:#F5F5F5;border-radius:6px;';
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
            td1.setAttribute( 'style', 'text-align:center;padding:8px 2px 8px 2px;width:38px;' + tdIconStyle );

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

                me.unhighlightSearchOptions();
                me.setSearchType( JSON.parse( unescape( $( this ).attr( 'datatargets' ) ) ) );

                //me.setSearchOptionActive();
                $( this.parentElement ).css( 'opacity', '1' );
                $( this.parentElement ).css( 'background-color', '#F5F5F5' );
                $( this.parentElement ).css( 'border-radius', '6px' );

                console.log( me.searchType.name );

                if ( me.searchType.name == 'distanceRadius' )
                {
                    me.addRadiusMarker();
                }
                if ( me.searchType.name == 'distanceCount' )
                {
                    me.clearRadiusMarker();
                }

                me.clearMarkerSearchResultLayer( 'searchPin' ); // not efficient --> there should be a smarter way to remove a single marker instead of clearing ALL and re-adding

                me.runSearch( ( me.searchWords.length == 0 ), ( me.searchWords.length == 0 ) );

            }

            /*tr.onmouseover = function () {
                $( this.parentElement ).css( 'opacity', '0.75' );
            }

            tr.onmouseout = function () {
                me.unhighlightSearchOptions();
            };*/

            faSpan.setAttribute( 'class', me.searchControlOpts[ i ].class + '');
            faSpan.setAttribute( 'style', spanStyle );

            var td2  = document.createElement('td');
            td2.setAttribute( 'style', 'padding:8px;width:110px;' + spanStyle); //font-size:12pt;

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

/*me.setSearchOptionActive = function()
{

    for ( var i = 0; i < me.searchControlOpts.length; i++ )
    {
        if ( me.searchType.name == me.searchControlOpts[ i ].name )
        {
            $( '#searchOpt_' + me.searchControlOpts[ i ].name ).css( 'opacity', '1'); //0.25
        }
    }
}*/


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
            $( '.search-results-container' ).css( 'top', '-9px' );
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
            //dv.classList.add( 'leaflet-control' );
            dv.classList.add( 'searchbox-shadow' );
            dv.classList.add( 'listview-toggle' );
            //dv.classList.add( 'listview-toggle-Map-List-view' );
            //dv.setAttribute( 'style', 'margin: 20px 14px 0 0 !important;' );
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

    //if ( $( '.search-results-container' ).is( ':visible' ) )
    {
        $( '.search-results-container').css( 'minHeight', '20px' ); //$( '.search-words-container').css( 'height' ) );
        //$( '.search-results-container').css( 'maxHeight', ( $(window).height() - $( '.search-results-container').position().top - ( 16 * 2.5) ) );
        $( '.search-results-container').css( 'maxHeight', ( $(window).height() - $( '.search-results-container').position().top - ( me.panelBottom.is( ':visible' ) ? me.panelBottom.height() : 0 ) - ( me.viewMode.listView.active == "true" ? 20 : ( 16 * 2.5) ) ) );
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

    //$( '#searchbox-searchoptions').attr( 'class', 'searchbox-searchoptions iconShadow' );
    //$( '#searchbox-searchoptions').addClass( me.searchType.class );
    //$( '#searchbox-searchoptions').attr( 'style', me.searchType.iconStyle );

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
    RESTUtil.retrieveJson( '20190523_provlist_fake_br_v2.json', function( response, data ){

        var iCounter = 0;
        var foundKeysIdx = [];
        var dropKeysIdx = [];
        var newData = [];
        var iconArr = [];

        console.log( data );

        $( '.search-results-inner').empty();

        if ( poi && poi.toString() == '1' )
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
            if ( poi && poi.toString() == '1' )
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

                if ( me.searchType.name == 'distanceCount' )
                {

                    if ( newData.length > me.distanceThreshold.limitSearchCount )
                    {
                        // for remove all outlet locations exceeding 'show-closest-count' limit
                        for (var i = newData.length - 1; i >= parseInt( me.distanceThreshold.limitSearchCount ); i--)
                        {
                            dropKeysIdx.push( i );
                        }
                    }    
                }

            }

            dropKeysIdx.sort();        // First sort all elements before reverse  
            dropKeysIdx.reverse();

            for ( var i = 0; i < dropKeysIdx.length; i++ )
            {
                newData.splice( dropKeysIdx [ i ], 1);
            }

            // DO NOT REMOVE > icons for distance filtering
            /*for ( var i = 0; i < newData.length; i++ )
            {
                var faIcon = me.getDistanceFAicon ( newData[ i ].location.distance ) ;
                if ( ! iconArr.includes( faIcon ) )
                {
                    iconArr.push( faIcon );
                }
            }*/

            // DO NOT REMOVE > icons for distance filtering
            //$( '.search-results-inner').append( me.getSearchDistanceIcons( iconArr ) );

            var arrMarkers = [];
            me.mapMarkerIdx = [];

            // write out search results
            for ( var i = 0; i < newData.length; i++ )
            {

                // create 'SUMMARY CARD' for Outlet
                me.createPreviewCard( newData[ i ], $( '.search-results-inner'), ( iCounter + 10 ).toString( 36 ).toUpperCase(), i, function( rndID ){

                    $( '#flyTo_' + rndID ).click( function()
                    { 

                        var coord = ( $( this ).attr( 'location' ) ).split( ',' );

                        me.mapLibObj.setView ( [ coord[0], coord[1] ], 12, { animate: true, duration: me.mapFlyAnimationDelay } )

                        if ( $( '.search-results-inner' ).is( ':visible') ) 
                        {
                            me.showHideSearchResultsPanel();
                        }

                        me.showPanelWithContents( me.getMapDataPreviewFromID( $( this ) ) );

                    } );

                    if ( Util.isMobi() )
                    {
                        console.log( 'creating share icon+clickEvent: #share_' + rndID);
                        $( '#share_' + rndID ).click( function(){ 

                            var myLocation = JSON.parse( unescape( $( '#tblData_' + $( this ).attr( 'dataIdx' ) ).attr( 'data.location' ) ) );
                            var myOutlet = JSON.parse( unescape( $( '#tblData_' + $( this ).attr( 'dataIdx' ) ).attr( 'data.outlet' ) ) );

                            console.log(' ~ sharing ' + myOutlet.name, myLocation.lat + ',' + myLocation.long );

                            FormUtil.shareApp( myOutlet.name, myLocation.lat + ',' + myLocation.long, true );

                        } );
                    }


                } );


                var rndID = 'pin' + Util.generateRandomString( i+1 );

                // create 'MAP MARKER' for Outlet
                var myMarkerIcon = L.AwesomeMarkers.icon({
                    icon: 'searchPin',
                    markerColor: 'red',
                    prefix: 'fa',
                    html: '<i id="pin_' + rndID + '" mapped-data="' + escape( JSON.stringify( newData[i] ) ) + '" mapped-data-text="' + ( iCounter + 10 ).toString( 36 ).toUpperCase() + '" mapped-data-idx="' + i + '" class="cwsPin textShadow">' +( iCounter + 10 ).toString( 36 ).toUpperCase() + '</i>'
                });

                var newMarker = L.marker( [ newData[i].location.lat, newData[i].location.long ], {icon: myMarkerIcon } ).addTo( me.mapLibObj );
                    //.bindPopup( '<b>' + newData[i].outlet.name + '</b><br>text goes here' ); //.openPopup();

                newMarker.setZIndexOffset( 500 - i );

                arrMarkers.push( newMarker );
                me.mapMarkerIdx.push( { idx: i, id: rndID } );

                $( '#pin_' + rndID ).click( function( e )
                {
        
                    if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);

                    if ( $( '.search-results-inner' ).is( ':visible') ) 
                    {
                        me.showHideSearchResultsPanel();
                    }

                    me.showPanelWithContents( me.getMapDataPreviewFromID( $( this ) ) );
                    e.stopPropagation();
        
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

            if ( ! skipGetBounds )
            {
                me.markerGroup = L.featureGroup( arrMarkers );
                me.mapLibObj.fitBounds( me.markerGroup.getBounds() );
            }

        }
        else
        {

            $( ".search-results-inner" ).html( '<div style="padding:10px;" term="">No matches found</div>' );
            //if ( $( '.searchFooter-collapser' ).is( ':visible') ) $( '.searchFooter-collapser' ).hide();
        }

        if ( me.lastMarker)
        {
            me.lastMarker.setZIndexOffset( 1000 );
        }

        FormUtil.hideProgressBar();

    } );

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
            console.log( ml.options.icon.options.icon );
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

me.createDistanceAttr = function( dataObj )
{
    var mapCoord = me.defaultCoordinatePoint; //me.mapLibObj.getCenter();

    dataObj.location.distance = parseFloat( MapUtil.crowDistance( parseFloat( mapCoord[0] ), parseFloat( mapCoord[1] ), dataObj.location.lat, dataObj.location.long ) ) * 1000;

    return dataObj;
}

me.newSearchString = function( dataObj )
{
    var ret = '';

    //DO NOT REMOVE: for now default to always search everything
    //if ( me.searchType.name == 'cwsOutlet' )
    {
        ret = dataObj.outlet.name + ' ' + dataObj.provider.name + ' ' + dataObj.provider.address1 + ' ' + dataObj.provider.address2; //address1, address2

        for ( var key in dataObj.service )
        {
            if ( ( dataObj.service[ key ] ).toString().toUpperCase() == "TRUE" )
            {
                ret += ' ' + key;
            }
        }

    }

    return ret;

}

me.createPreviewCard = function( dataObj, tagItm, iconText, dataIdx, returnFunc )
{
    var allPhoneNums = me.getDisplayPhoneNums( dataObj );
    var ArrRating    = me.getOutletRatingRow( dataObj );
    var ArrOpenTimes = me.getOpenTimesArray( dataObj );
    var allServices  = me.getDisplayServices( dataObj );
    var allProviders = me.getDisplayProviders( dataObj );
    var distance     = dataObj.location.distance; // me.getDistance( dataObj );
    var rndID        = Util.generateTimedUid();


    var prvCard = $( '  <table class="previewCard" id="tblData_' + rndID + '" data.outlet="' + escape( JSON.stringify(dataObj.outlet) ) + '" data.location="' + escape( JSON.stringify(dataObj.location) ) + '" >' +
                   '    <tr>' +
                   '      <td style="padding:2px;vertical-align:top;" ><div mapped-data="' + escape( JSON.stringify( dataObj ) ) + '" location="' + (dataObj.location.lat+','+dataObj.location.long) +'" mapped-data-idx="' + dataIdx + '" mapped-data-text="' + iconText + '" id="flyTo_' + rndID + '" class="circleSearchResult"><div class="textShadow">' + iconText + '</div></div></td>' +
                   '      <td class="searchResultMainName"><div>' + dataObj.outlet.name + '</div></td>' +
                   '      <td rowspan=4 class="operatingHours"><table style="">' + me.writeArray(ArrRating) + me.writeArray( ArrOpenTimes ) + '</table></td>' +
                   '      <td style="font-size:8pt;font-weight:400;border-left:1px solid #BDBDBD;color:#215E8C;font-size:14pt;padding:2px 4px 2px 4px;text-align:center;width:80px;overflow:hidden;" rowspan=4>' + me.formatDisplayedDistanceOptions( distance ) + 
                   '      ' + ( Util.isMobi() ? '<div><i style="color:#2C98F0;font-size:12pt" id="share_' + rndID + '" dataIdx="' + rndID + '" class="fas fa-share-alt shareThisOutlet"></i></div>' : '' ) + 
                   '      </td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=2 style="font-size:8pt;font-weight:400;padding:0 0 0 6px"><span>' + dataObj.location.address1 + '</span></td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=2 style="font-size:8pt;font-weight:400;padding:0 0 0 6px"><span>' + dataObj.location.address2 + '</span></td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=2 class="phoneRow">Phone:<span> ' + allPhoneNums + '</span></td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=4 class="servicesRow"><strong>Services</strong>: <span>' + allServices + '</span></td>' +
                   '    </tr>' +
                   '    <tr>' +
                   '      <td colspan=4 style="font-size:8pt;font-weight:400;padding:0 0 0 4px;border-top:1px solid #fff;"><span>' + allProviders + '</span></td>' +
                   '    </tr>' +
                   '  </table>' );

    tagItm.append( prvCard );

    if ( returnFunc ) returnFunc( rndID, prvCard );

}

me.getDistanceFAicon = function( dist )
{
    for ( var i = 0; i < me.distanceScale2.length; i++ )
   {
        if ( parseFloat( dist ) < ( parseFloat( me.distanceScale2[ i ].distance ) / 1000 ) )
        {
            return me.distanceScale2[ i ].faIcon
        }

    }
}
me.formatDisplayedDistanceOptions = function( dist )
{
    var unit;
    var newDist;

   for ( var i = 0; i < me.distanceScale2.length; i++ )
   {
        if ( parseFloat( dist ) < ( parseFloat( me.distanceScale2[ i ].distance ) ) )
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
me.getDisplayPhoneNums = function( dataObj )
{
    var ret = '';
    if ( dataObj && dataObj.provider && dataObj.provider.phone1 ) ret += '<a class="telNo" href="tel:' + dataObj.provider.phone1 + '">' + dataObj.provider.phone1 + '</a>';
    if ( dataObj && dataObj.provider && dataObj.provider.phone2 ) ret += ( ( ret.length ) ? ',' : '') + dataObj.provider.phone2;
    return ret;
}
me.getOutletRatingRow = function( dataObj )
{    
    var arrRet = [];

    //arrRet.push ( '<tr><td colspan=2> ' + me.getRandomRatings( 'small' ) + ' </td></tr>' ) 

    return arrRet;
}
me.getOpenTimesArray = function( dataObj )
{
    var arrRet = [];
    var jsonTemp = { dayFrom: '', dayTo: '', times: '' };
    var lastPushed = '';
    var expectedKeys = ["mon","tue","wed","thu","fri","sat","sun"]

    arrRet.push ( '<tr><td colspan=2 class="openHoursLabelRow"> Opening Hours </td></tr>' ) 

    for ( var i = 0; i < expectedKeys.length; i++ )
    {
        if ( dataObj.opening [ expectedKeys[i] ] ) 
        {
            if ( jsonTemp.times != dataObj.opening [ expectedKeys[i] ] )
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
                    jsonTemp.times = dataObj.opening [ expectedKeys[i] ];
                }
            }
            else
            {
                jsonTemp.dayTo = expectedKeys[i];
            }
            lastOpenHrs = dataObj.opening [ expectedKeys[i] ];
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
    return '<tr><td class="openDay">'+ Util.capitalizeFirstLetter( jsonData.dayFrom ) + ( jsonData.dayFrom == jsonData.dayTo ? '' : '-' + Util.capitalizeFirstLetter( jsonData.dayTo ) ) +'</td><td> ' + me.timeToAbbr( jsonData.times ) + '</td></tr>';
}

me.timeToAbbr = function( timeAllText )
{
    var ret = '';
    if ( timeAllText )
    {
        var arrTimes = timeAllText.toString().split( ';');

        for ( var t = 0; t < arrTimes.length; t++ )
        {
            var arrTimeBlock = arrTimes[t].split(',');

            for ( var i = 0; i < arrTimeBlock.length; i++ )
            {
                ret += me.timePartToAbbr( arrTimeBlock[i]) + ' to ';
            }
            
            ret = ret.substring(0, ret.length - 4) + ', ';
        }
    }
    ret = ret.substring(0, ret.length - 2);
    return ret;
}
me.timePartToAbbr = function(timeBlock)
{
    var arrT = timeBlock.split(':');
    var suff = parseInt( arrT[0] ) < 12 ? 'am' : 'pm';
    var sec = parseInt( arrT[1] ) == 0 ? '' : ':' + arrT[0];

    return ( parseInt( arrT[0] ) < 12 ? arrT[0] : (arrT[0] - 12) ) + '' + sec + '' + suff;
}
me.getDisplayServices = function( dataObj )
{
    var ret = '';

    for ( var key in dataObj.service )
    {
        if ( ( dataObj.service[ key ] ).toString().toUpperCase() == "TRUE" )
        {
            ret += key + ', ';
        }
    }

    if ( ret.length > 0 )  return ret.substring(0, ret.length - 2);
    else return ret;
}
me.getDisplayProviders = function( dataObj )
{
    var ret = '';

    /*for ( var key in dataObj.providers )
    {
        if ( ( dataObj.providers[ key ] ).toString().toUpperCase() == "TRUE" )
        {
            ret += key + ', ';
        }
    }

    if ( ret.length > 0 )  return ret.substring(0, ret.length - 2);
    else return ret;*/

    var templateWithRatings = '<table style="providerRow">'+
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
    if ( dataObj && dataObj.provider && dataObj.provider.name )
    {
        if ( 1 == 1 ) //boolean : include option to display Y/N provider ratings
        {
            return templateWithRatings.replace( '{PROVIDER}',dataObj.provider.name );
        }
        else
        {

        }
        return dataObj.provider.name;
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
me.getDistance = function( dataObj )
{
    if ( dataObj.location && dataObj.location.lat && dataObj.location.long )
    {
        var mapCoord = me.mapLibObj.getCenter();
        return parseFloat( MapUtil.crowDistance( mapCoord.lat, mapCoord.lng, dataObj.location.lat, dataObj.location.long ) ).toFixed(1);
    }

}

me.updateSearchDistanceLimit = function( e )
{
    //console.log( e );
    me.distanceThreshold.limitSearchDistance = e.value;

    me.addRadiusMarker();
    me.clearMarkerSearchResultLayer( 'searchPin' ); // not efficient --> there should be a smarter way to remove a single marker instead of clearing ALL and re-adding
    me.runSearch( ( me.searchWords.length == 0 ), ( me.searchWords.length == 0 ) );

}

me.updateSearchCountLimit = function( e )
{
    //console.log( e );
    me.distanceThreshold.limitSearchCount = e.value;
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

me.getMapDataPreviewFromID = function( thisObj, dataObj ) //id
{
    //console.log( me.mapMarkerIdx );
    //console.log( id );
    //console.log( me.mapMarkerIdx[ id ] );

    var virtObj;
    var virtTag;

    console.log( thisObj );
    console.log( dataObj );

    if ( dataObj )
    {
        virtObj = dataObj;
        virtTag = $( '<div mapped-data="' + escape( JSON.stringify( dataObj ) ) + '" mapped-data-text="A" mapped-data-idx="0"></div>');
    }
    else
    {
        virtObj = JSON.parse( unescape( thisObj.attr( 'mapped-data' ) ) );
        virtTag = thisObj;
    }

    console.log( virtObj );
    console.log( virtTag );

    $( '#panelBottomContents' ).empty();

    me.createPreviewCard( virtObj, $( '#panelBottomContents' ), unescape( virtTag.attr( 'mapped-data-text' ) ), unescape( virtTag.attr( 'mapped-data-idx' ) ), function( rndID ){

        if ( Util.isMobi() )
        {
            $( '#share_' + rndID ).click( function()
            {

                var myLocation = JSON.parse( unescape( $( '#tblData_' + $( this ).attr( 'dataIdx' ) ).attr( 'data.location' ) ) );
                var myOutlet = JSON.parse( unescape( $( '#tblData_' + $( this ).attr( 'dataIdx' ) ).attr( 'data.outlet' ) ) );

                console.log(' ~ sharing ' + myOutlet.name, myLocation.lat + ',' + myLocation.long );

                FormUtil.shareApp( myOutlet.name, myLocation.lat + ',' + myLocation.long, true );

            } );
        }
    
        me.resizePanelBottom();

        if ( ! me.panelBottom.is( ':visible' ) ) me.panelBottom.toggle("slide", { direction: "down" }, 200);

    });

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
    countryOpts.push( { iso: 'cm', name: 'Cameroon', lat: 5.0252, lng: 12.5134, zoom: 7, selected: ( me.countryCode == 'cm' ? 1 : 0 ) } );
    countryOpts.push( { iso: 'ken', name: 'Kenya', lat: 0.0236, lng: 37.9062, zoom: 7, selected: ( me.countryCode == 'ken' ? 1 : 0 ) } );
    countryOpts.push( { iso: 'np', name: 'Nepal', lat: 28.3949, lng: 84.1240, zoom: 7, selected: ( me.countryCode == 'np' ? 1 : 0 ) } );

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

}
