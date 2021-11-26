// =========================================
//     JobAidHelper
//          - Methods to help 
// =========================================

function JobAidHelper() {};

JobAidHelper.jobAid_startPage = 'index5.html';

JobAidHelper.jobAid_startPagePath = 'jobs/' + JobAidHelper.jobAid_startPage;

// =========================

JobAidHelper.runTimeCache_JobAid = function( returnFunc )
{
    if ( ConnManagerNew.isAppMode_Online() )
    {

        var localCase = WsCallManager.checkLocalDevCase( window.location.origin );

        var requestUrl = ( localCase ) ? 'http://localhost:8383/list' : WsCallManager.composeDwsWsFullUrl( '/TTS.jobsFiling' );

        $.ajax({
            type: "GET",
            dataType: "json",
            url: requestUrl,
            success: function( response )
            {
                SwManager.swRegObj.active.postMessage( { 'type': 'CACHE_URLS2', 'payload': response.list } );
                //for( var i in fileNameList ) SwManager.swRegObj.active.postMessage( { 'type': 'CACHE_URLS2', 'payload': [ fileNameList[i] ] } );
                
                if ( returnFunc ) returnFunc();
            },
            error: function( error )
            {
                console.customLog( error );
            }
        });    
    }
    else
    {        
        MsgManager.msgAreaShowErr( 'JobAid Filing is only available in online mode' );
    }
};

// =========================

JobAidHelper.msgHandle = function( data )
{
    if ( data.action === 'hideIFrame') 
    {
      $( '#divJobAid' ).hide();
    }
    else if ( data.action === 'sendMsg')
    {
      MsgManager.msgAreaShow( data.msg );        
    }
    
    if ( data.dataJson )
    {
      // open area & block with data populate..
      // SessionManager.cwsRenderObj.renderNewAreaBlock( 'blk_c-on_pth-FPL-S_PRO_tabsContainer' );

      SessionManager.cwsRenderObj.renderFavItemBlock( Constants.jobAides_AreaBlockId );

      // Click on 1st/Last-Recorded tab.
        setTimeout( function() 
        {
            // $( 'div.mainTab' ).find( 'li[rel="btn_c-on_pth-FPL-S_PRO_tabSearchByUser"]' ).click();

            $( 'div.mainTab' ).find( 'li[rel="' + Constants.jobAides_tabTargetBlockId + '"]' ).click();

            setTimeout( function() 
            {
                //{house: "12", animals: "1", reg_firstName: "James", reg_lastName: "Chang"}

                $( 'input[name="firstName"]' ).val( data.dataJson.reg_firstName );
                $( 'input[name="lastName"]' ).val( data.dataJson.reg_lastName );
                $( 'input[name="house"]' ).val( data.dataJson.house );
                $( 'input[name="animals"]' ).val( data.dataJson.animals );

            }, 100 );

        }, 200 );
    }    
};
