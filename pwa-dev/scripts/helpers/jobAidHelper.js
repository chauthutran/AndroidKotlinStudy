// =========================================
//     JobAidHelper
//          - Methods to help 
// =========================================

function JobAidHelper() {};

JobAidHelper.jobAid_startPage = 'index1.html';

JobAidHelper.jobAid_startPagePath = 'jobs/' + JobAidHelper.jobAid_startPage;

JobAidHelper.jobAid_CACHE_URLS2 = 'CACHE_URLS2';
JobAidHelper.jobAid_jobTest2 = 'jobTest2';

// =========================

JobAidHelper.runTimeCache_JobAid = function( btnParentTag ) // returnFunc )
{
    if ( ConnManagerNew.isAppMode_Online() )
    {
        var localCase = WsCallManager.checkLocalDevCase( window.location.origin );

        var requestUrl = ( localCase ) ? 'http://localhost:8383/list' : WsCallManager.composeDwsWsFullUrl( '/TTS.jobsFiling' );

        $( '.divJobFileLoading' ).remove();

        $.ajax({
            type: "GET",
            dataType: "json",
            url: requestUrl,
            success: function( response )
            {
                if ( btnParentTag ) btnParentTag.append( '<div class="divJobFileLoading" style="display: contents;"><img src="images/loading_big_blue.gif" style="height: 17px;">'
                + '<span class="spanJobFilingMsg" style="color: gray; font-size: 14px;">Retrieving Files...</span>'
                + '</div>' );
                                
                SwManager.swRegObj.active.postMessage( { 'type': JobAidHelper.jobAid_CACHE_URLS2
                    , 'cacheName': JobAidHelper.jobAid_jobTest2
                    , 'payload': response.list } );
            },
            error: function( error )
            {
                MsgManager.msgAreaShowErr( 'Failed to perform the jobFiling..' );
            }
        });    
    }
    else
    {        
        MsgManager.msgAreaShowErr( 'JobAid Filing is only available in online mode' );
    }
};

JobAidHelper.JobFilingProgress = function( msgData )
{
    // var returnMsgStr = JSON.stringify( { type: 'jobFiling', process: { total: totalCount, curr: currCount } } );
    if ( msgData && msgData.process )
    {
        var total = msgData.process.total;
        var curr = msgData.process.curr;

        var divJobFileLoadingTag = $( '.divJobFileLoading' );
        var spanJobFilingMsgTag = $( '.spanJobFilingMsg' );

        if ( total && total > 0 && curr && curr < total )
        {
            // update the processing msg..
            var prgMsg = 'Processing ' + curr + ' of ' + total;
            spanJobFilingMsgTag.text( prgMsg );
        }
        else
        {
            divJobFileLoadingTag.find( 'img' ).remove();
            spanJobFilingMsgTag.text( 'Processing all done.' );

            MsgManager.msgAreaShow( 'Job Aid Filing Finished.' );
        }
    }
};

//JobAidHelper.JobFilingFinish = function( msgText )
//{
//    $( '.divJobFileLoading' ).remove();
//    if ( msgText ) MsgManager.msgAreaShow( msgText );
//};

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
