// -------------------------------------------
// -- BlockMsg Class/Methods
function myDetails(cwsRender) {
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.langTermObj = me.cwsRenderObj.langTermObj;

    me.myDetailsDivTag = $('#detailsFormDiv');
    me.detailsContentDivTag = $( '#detailsContentDiv' );

    // TODO: NEED TO IMPLEMENT
    // =============================================
    // === TEMPLATE METHODS ========================

    me.initialize = function () {

    }

    $( 'img.btnMyDetailsBack' ).click( () =>
        {
            me.hidemyDetailsPage();
        } );

    me.loadFormData = function () 
    {

        me.showmyDetailsPage();

        var myJson = FormUtil.fetchMyDetails().result.msg.response;

        var myDhisName = myJson.outlet[0].dhisName;
        var myAddress = myJson.outlet[0].location.address;
        var myArea = myJson.outlet[0].location.area;
        var myAreaSub = myJson.outlet[0].location.areaSub;
        var myPhoneNumber = myJson.outlet[0].phoneNumber;
        var myHours = (myJson.outlet[0].openingHours);
        var mayProvider = myJson.outlet[0].providers[0].providerName;
        var myServices = myJson.outlet[0].servicesStandard;
        var areaString ='';

        //Name
        if (typeof myDhisName === 'undefined') {
            $('td.searchResultMainName').html('Outlet name undefined');
        } else {
            $('td.searchResultMainName').html(myDhisName);
        }

        //Address
        if (typeof myAddress === 'undefined') {
            $('td.previewCardAddress').html('<b>Address undefined');
        } else {
            var arrayAddress = myAddress.split('|');
            $('td.previewCardAddress').html(arrayAddress[0]+'<br/>'+arrayAddress[1]);
        }

        //Area & AreaSub
        if (typeof myArea === 'undefined') {
            areaString = 'Area undefined';
        } else {
            areaString = myArea;
        }

        if (typeof myAreaSub === 'undefined') {
            $('td.searchResultLocationArea').html(areaString+', SubArea undefined');
        } else {
            $('td.searchResultLocationArea').html(areaString+', '+myAreaSub);
        }

        //Phone
        if (typeof myPhoneNumber === 'undefined') {
            $('td.searchResultSubLocationArea').html('<b>Phone number undefined');
        } else {
            $('td.searchResultPhoneNumber').html('+'+myPhoneNumber);
        }

        //OpeningHours
        if (typeof myHours === 'undefined') {
            $('td.previewCardOperatingHours').html('Opening hours undefined');
        } else {
            var arrayHours = myHours.split(/,|;/);
            var myString = '';
            var endLine = true;
            for (var i = 0; i < arrayHours.length; i++) {
                if (arrayHours[i] == 'Mo-Fr' || arrayHours[i] == 'Mo-Sa' || arrayHours[i] == 'Sa') {
                    myString = myString + '<label><b>' + arrayHours[i] + '</b></label><br/>';
                } else {
                    if (endLine == true) {
                        myString = myString + '<label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + arrayHours[i] + ' - ';
                        endLine = false;
                    } else {
                        myString = myString + arrayHours[i] + '</label><br/>';
                        endLine = true;
                    }
                }
            };
            $('td.previewCardOperatingHours').html(myString);
        }

        //Provider name
        if (typeof mayProvider === 'undefined') {
            $('td.previewCardProviderName').html('<b>Provider: </b> undefined');
        } else {
            $('td.previewCardProviderName').html('<b>Provider: </b>' +mayProvider);
        }

        //Services
        if (typeof myServices === 'undefined') {
            $('td.servicesRow').html('<b>Services: </b>undefined');
        } else {
            $('td.servicesRow').html('<b>Services: </b>' +myServices);
        }

    }
    

    // ------------------------------------
    me.showmyDetailsPage = function()
    {
        if ( $( 'div.mainDiv' ).is( ":visible" ) )
        {
            $( 'div.mainDiv' ).hide();
        }
        if ( $( '#loginFormDiv' ).is( ":visible" ) )
        {
            $( '#loginFormDiv' ).hide();
        }

        me.myDetailsDivTag.show( 'fast' );    
    }

    me.hidemyDetailsPage = function()
    {
        me.myDetailsDivTag.fadeOut( 500 );

        setTimeout( function() {

            if ( FormUtil.checkLogin() > 0 )
            {
                $( 'div.mainDiv' ).show( 'fast' );
            }
            else
            {
                $( '#loginFormDiv' ).show( 'fast' );
            }

            me.myDetailsDivTag.hide();

        }, 250 );

    }
    
    me.initialize();

    
}