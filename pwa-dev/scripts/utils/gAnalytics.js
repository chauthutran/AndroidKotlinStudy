function GAnalytics() {}

GAnalytics.GTAG;
GAnalytics.BrowserInfo;

GAnalytics.declareGTAG = function()
{
    window.dataLayer = window.dataLayer || [];  // ?? <-- ( window.dataLayer ) ? window.dataLayer: [];?

    GAnalytics.GTAG = function() {
        window.dataLayer.push( arguments );
    };

    GAnalytics.GTAG('js', new Date());
    GAnalytics.GTAG('config', 'UA-188996456-4');
};

// -------------------------------------------


GAnalytics.setBrowserInfo = function() 
{
    var ua = navigator.userAgent,
        tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

    if (/trident/i.test(M[1])) 
    {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        GAnalytics.BrowserInfo = { name: 'IE', version: (tem[1] || '') };
    }

    if ( !GAnalytics.BrowserInfo )
    {
        if ( M[1] === 'Chrome' ) 
        {
            tem = ua.match(/\bOPR|Edge\/(\d+)/)
            if (tem != null) {
                GAnalytics.BrowserInfo = { name: 'Opera', version: tem[1] };
            }
        }    
    }

    if ( !GAnalytics.BrowserInfo )
    {
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];

        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    
        GAnalytics.BrowserInfo = { name: M[0], version: M[1] };
    }
};


GAnalytics.setEvent = function(category, action, label, value = null) 
{
    GAnalytics.GTAG('event', action, 
    {
        'event_category': category,
        'event_label': label,
        'value': value
    });
};

GAnalytics.setCustomDimensions = function(dimensionIndex, dimensionValue) 
{
    if (typeof dimensionValue !== 'undefined' && dimensionValue !== null) 
    {
        GAnalytics.GTAG('set', { dimensionIndex: dimensionValue });
    }
};

