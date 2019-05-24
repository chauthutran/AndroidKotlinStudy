
function getControlHtmlContent()
{
    var controlHtmlContent = "<div id=\"controlbox\" >" +
                            " <div id=\"boxcontainer\" class=\"searchbox searchbox-shadow\" >" +
                            "   <div class=\"searchbox-menu-container\">" + 
                            "     <button aria-label=\"Menu\" id=\"searchbox-menubutton\" class=\"searchbox-menubutton\"><\/button>" +
                            "      <span aria-hidden=\"true\" style=\"display:none\">Menu<\/span>" +
                            "    <\/div>" +
                            "    <div class=\"searchbox-input-container\">" + 
                            "      <input id=\"searchboxinput\" type=\"text\" style=\"position: relative;\"\/>" +
                            "    <\/div>" +
                            "    <div class=\"searchbox-searchoptions-container\">" +
                            "      <button aria-label=\"searchOptions\" id=\"searchbox-searchoptions\" class=\"searchbox-searchoptions\"><\/button>" +
                            "    </div>" +
                            "    <div class=\"searchbox-searchbutton-container\">" + 
                            "      <button aria-label=\"search\" id=\"searchbox-searchbutton\" class=\"searchbox-searchbutton\"><\/button>" + 
                            "      <span aria-hidden=\"true\" style=\"display:none;\">search<\/span>" + 
                            "     <!-- <a class=\"searchbox-hide-toggle fas fa-angle-left\"><\/a> --> " + 
                            "    <\/div>" + 
                            "    <div class=\"searchbox-hidebutton-container\">" + 
                            "      <a aria-label=\"search\" id=\"searchbox-hidebutton\" class=\"searchbox-hidebutton searchbox-hide-toggle fas fa-chevron-circle-left\"><\/a>" + 
                            "    <\/div>" + 
                            "  <\/div>" + 
                            "  <div class='search-words-container'>" + 
                            "    <div class='search-words-inner'></div>" + 
                            "  </div>" + 
                            "  <div class='search-options-container'>" + 
                            "    <div class='search-options-inner'></div>" + 
                            "  </div>" + 
                            "  <div class='search-results-container'>" + 
                            "    <div class='search-results-inner'></div>" + 
                            "  </div>" + 
                            "<\/div>" + 
                            "<div class=\"panel\">" + 
                            "  <div class=\"panel-header\">" + 
                            "    <div class=\"panel-header-container\">" + 
                            "      <div class=\"panel-header-title\"><\/div>" + 
                            "    <\/div>" + 
                            "  <\/div>" + 
                            "  <div class=\"panel-content\"> <\/div>" + 
                            "<\/div>";
    return controlHtmlContent;
}

function generateHtmlContent(menuItems)
{
    var content = $( '<ul class="panel-list">' );

    for (var i = 0; i < menuItems.Items.length;i++)
    {
        var item = menuItems.Items[i];

        if ( item.group )
        {
            var li = $( '<li class="panel-list-item panel-list-item-group">' );
            var dv = $( '<div>' );
        }
        else
        {
            var li = $( '<li class="panel-list-item">' );
            var dv = $( '<div>' );
        }

        var sp = $( '<span class=\"panel-list-item-icon '  + item.icon+ '\" ></span>' );

        if (item.type == 'link') {

            var clickTarget = $( '<a>' );
            clickTarget.attr( 'href', item.href );
            clickTarget.html( item.name );
        }
        else if (item.type == 'button') {

            var clickTarget = $( '<button>' );
            clickTarget.attr( 'clickAction', escape( item.onclick ) );
            clickTarget.click( function() { 
                    eval ( unescape( this.getAttribute( 'clickAction' ) ) ); 
                    if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);
                    $( 'div.leaflet-control-locate' ).show();
            } );
            clickTarget.html( item.name );

        }

        content.append( li );
        li.append( dv );
        dv.append( sp );
        dv.append( clickTarget );
    }


    return content;
}

function generateHtmlContentOld(menuItems)
{
    var content = '<ul class="panel-list">'

    for (var i = 0; i < menuItems.Items.length;i++)
    {
        var item = menuItems.Items[i];

        if ( item.group )
        {
            content += '<li class="panel-list-item panel-list-item-group"><div>';
        }
        else
        {
            content += '<li class="panel-list-item"><div>';
        }

        if (item.type == 'link') {
            content += '<span class=\"panel-list-item-icon '  + item.icon+ '\" ></span>';
            content += '<a href=\"' + item.href + '\">' + item.name + '</a>';
        }
        else if (item.type == 'button') {
            content += '<span class=\"panel-list-item-icon ' + item.icon + '\" ></span>';
            content += '<button onclick=\"' + item.onclick + '\">' + item.name + '</button>';

        }
        content += '</li></div>'
    }

    content += '</ul>'

    return content;
}

function createSearchboxControl()
{


var searchboxControl = L.Control.extend({
    
    _sideBarHeaderTitle: 'Sample Title',
    _sideBarMenuItems: {
        Items: [
                    { type: "link", name: "My Location", onclick: "", icon: "fas fa-map-marker-alt" },
                    { type: "link", name: "My Appointments", href: "http://google.com", icon: "icon-cloudy" },
                    { type: "button", name: "My Ratings", onclick: "alert('button 1 clicked !')", icon: "icon-potrait" },
                    { type: "button", name: "Co", onclick: "alert('button 2 clicked !')", icon: "icon-local-dining" },
                    { type: "link", name: "Link 3 (stackoverflow.com)", href: 'http://stackoverflow.com', icon: "icon-bike" },
        ],
    _searchfunctionCallBack: function(x)
        {
        alert('calling the default search call back');
        }
    },   
    options: {
        position: 'topleft'
    },
    initialize: function(options) {
        L.Util.setOptions(this, options);
        if(options.sidebarTitleText)
        {
            this._sideBarHeaderTitle = options.sidebarTitleText;
        }

        if (options.sidebarMenuItems)
        {
            this._sideBarMenuItems = options.sidebarMenuItems;

        }
    },
    onAdd: function (map) {


        var container = L.DomUtil.create('div');
        container.id = "controlcontainer";
        var headerTitle = this._sideBarHeaderTitle;
        var menuItems = this._sideBarMenuItems;
        var searchCallBack = this._searchfunctionCallBack;

        $(container).html(getControlHtmlContent());

        setTimeout(function () {

            $("#searchboxinput").click(function () {
                if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);
                if ( $(".search-options-container").is( ':visible') )  $(".search-options-container").toggle("slide", { direction: "up" }, 250);
            });

            $("#searchbox-searchoptions").click(function () {
                if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 500);
                $(".search-options-container").toggle("slide", { direction: "up" }, 250);
            });

            $("#searchbox-searchbutton").click(function () {
                if ( $(".search-options-container").is( ':visible') )  $(".search-options-container").toggle("slide", { direction: "up" }, 250);
                else
                {
                    var searchkeywords = $("#searchboxinput").val();
                    searchCallBack(searchkeywords);
                }
            });

            $("#searchbox-hidebutton").click(function () {

                if ( ! $( "#boxcontainer" ).attr( 'expand-width' ) )
                {
                    $( "#boxcontainer" ).attr( 'expand-width' , $( "#boxcontainer" ).css( "width" ) );
                    $( "#boxcontainer" ).attr( 'initial-padding' , $( "#boxcontainer" ).css( "padding" ) );
                }

                if ( $( "#boxcontainer" ).css( "width" ) ==  $( "#boxcontainer" ).attr( 'expand-width' ) )
                {
                    $( '#boxcontainer' ).css( 'padding', '0' );
                    $( 'div.searchbox-input-container' ).css( 'display', 'none' );
                    $( 'div.searchbox-searchoptions-container' ).css( 'display', 'none' );
                    $( 'div.searchbox-searchbutton-container' ).css( 'display', 'none' );
                    $( "#boxcontainer" ).css( "width", $( 'div.searchbox-menu-container' ).css( 'width' ) );
                    $( "#searchbox-hidebutton" ).removeClass( 'fa-chevron-circle-left' );
                    $( "#searchbox-hidebutton" ).addClass( 'fa-chevron-circle-right' );
                    $( "#searchbox-hidebutton" ).css( 'z-index', 1010 );
                } 
                else
                {
                    $( '#boxcontainer' ).css( 'padding', $( "#boxcontainer" ).attr( 'initial-padding' ) );
                    $( 'div.searchbox-input-container' ).css( 'display', 'block' );
                    $( 'div.searchbox-searchoptions-container' ).css( 'display', 'block' );
                    $( 'div.searchbox-searchbutton-container' ).css( 'display', 'block' );
                    $( "#boxcontainer" ).css( "width", $( "#boxcontainer" ).attr( 'expand-width' ) );
                    $( "#searchbox-hidebutton" ).removeClass( 'fa-chevron-circle-right' );
                    $( "#searchbox-hidebutton" ).addClass( 'fa-chevron-circle-left' );
                    $( "#searchbox-hidebutton" ).css( 'z-index', 'auto' );
                }

                /* code belongs in map.js */
                if ( $( 'div.panel' ).is( ':visible') ) $("div.panel").toggle("slide", { direction: "left" }, 100);
                if ( $( 'div.search-options-container' ).is( ':visible') ) $(".search-options-container").toggle("slide", { direction: "up" }, 100);
                if ( $( 'div.search-words-container' ).is( ':visible') ) $("div.search-words-container").toggle("slide", { direction: "up" }, 200);

            });


            $("#searchbox-menubutton").click(function () {
                $(".panel").css( "height", ( screen.height + 1) + 'px' );
                $(".panel").toggle("slide", { direction: "left" }, 500);
            });

            $(".panel-close-button").click(function () {

                $(".panel").toggle("slide", { direction: "left" }, 500);
            });

            $(".panel-header-title").text(headerTitle);


            var htmlContent = generateHtmlContent(menuItems);
            //$(".panel-content").html(htmlContent);
            $(".panel-content").append( htmlContent );
        }, 1);


         L.DomEvent.disableClickPropagation(container);
        return container;
    }

});

return searchboxControl;
}