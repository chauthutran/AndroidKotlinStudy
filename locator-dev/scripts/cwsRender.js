// -------------------------------------------
// -- CwS Render Class/Methods
function cwsRender()
{
	var me = this;

	me.navDrawerDivTag = $( '#navDrawerDiv' );
	me.focusRelegator = $( '#focusRelegator' );

	me.mapObj = new CwSMap();


	me.initialize = function()
	{

		//FormUtil.geolocationAllowed();

		FormUtil.geolocationAllowed( function() {

			me.mapObj.initialise( me );
			me.setEvents_OnInit();

		});

	}

	me.setEvents_OnInit = function()
	{
		me.focusRelegator.hide();

		me.focusRelegator.off( 'click' ); //clear existing click events

		me.focusRelegator.on( 'click' , function( event )
		{
			event.preventDefault();

			me.focusRelegator.hide();
			me.mapObj.restoreMapDefaults();
			

		});

	}

	me.render = function()
	{
		var arrLocation;
		var POI = 0;
		var isoCountry = '';

		if ( Util.getURLParameterByName( window.location.href,'c' ).length )
		{
			arrLocation = Util.getURLParameterByName( window.location.href,'c' ).split( ',' );
		}
		if ( Util.getURLParameterByName( window.location.href,'poi' ).length )
		{
			POI = Util.getURLParameterByName( window.location.href, 'poi' );
		}
		if ( Util.getURLParameterByName( window.location.href,'isoc' ).length )
		{
			isoCountry = Util.getURLParameterByName( window.location.href, 'isoc' );
			me.mapObj.countryCode = isoCountry;
		}

		me.mapObj.render( arrLocation, POI );

	}


	me.renderArea = function( areaId )
	{

	}

	// ======================================

	me.initialize();
}