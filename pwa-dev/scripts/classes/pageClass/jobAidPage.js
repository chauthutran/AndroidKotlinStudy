function JobAidPage() {};

JobAidPage.options = {
   'title': 'Job Aid',
   'term': 'form_title_jobAid',
   'cssClasses': ['divJobAidPage'],
   'zIndex': 1600
};

JobAidPage.rootPath = '/jobs/jobAid/';

JobAidPage.sheetFullTag;
JobAidPage.contentBodyTag;
JobAidPage.divAvailablePacksTag;
JobAidPage.divDownloadedPacksTag;

JobAidPage.serverManifestsData = [];
/*
JobAidPage.availableVersions = [
   {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false },
   {code:"EN_LOW" , language:"English", projDir:"EN_LOW", size:"74MB", noMedia:true },
   {code:"AM" , language:"Amharic", projDir:"AM", size:"455MB", noMedia:false },
   {code:"AM_LOW" , language:"Amharic", projDir:"AM_LOW", size:"74MB", noMedia:true },
   {code:"OM" , language:"Oromo", projDir:"OM", size:"396MB", noMedia:false },
   {code:"OM_LOW" , language:"Oromo", projDir:"OM_LOW", size:"74MB", noMedia:true },
   {code:"SID" , language:"Sidama", projDir:"SID", size:"581MB", noMedia:false },
   {code:"SID_LOW" , language:"Sidama", projDir:"SID_LOW", size:"74MB", noMedia:true }
];  
   
JobAidPage.downloadedVersions = [
   {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false }
];  
*/

// ------------------

JobAidPage.render = function () 
{
   JobAidPage.sheetFullTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, JobAidPage.options);  // .options.preCall

   JobAidPage.contentBodyTag = JobAidPage.sheetFullTag.find( '.contentBody' );
   
   JobAidPage.setUpPageContentLayout( JobAidPage.contentBodyTag );

   JobAidPage.populateSectionLists( JobAidPage.contentBodyTag, function() 
   {
      TranslationManager.translatePage();
   });   

};

// ------------------

JobAidPage.getManifestJobAidInfo = function( results )
{
   var manifestsData = [];

   try
   {
      if ( Util.isTypeArray( results ) )
      {
         results.forEach( item => 
         {
            if ( Util.isTypeObject( item.jobAidInfo ) ) manifestsData.push( item.jobAidInfo );
         });
      }
   }
   catch( errMsg )
   {
      console.log( 'ERROR in JobAidPage.getManifestJobAidInfo, ' + errMsg );
   }

   return manifestsData;
};


JobAidPage.setUpPageContentLayout = function( contentBodyTag )
{
   contentBodyTag.append( JobAidPage.templateSections );
};


JobAidPage.populateSectionLists = function( contentBodyTag, callBack )
{
   var divAvailablePacksTag = contentBodyTag.find( 'div.divAvailablePacks' ); //.html( '' );
   var divDownloadedPacksTag = contentBodyTag.find( 'div.divDownloadedPacks' ); //.html( '' );

   JobAidPage.divAvailablePacksTag = divAvailablePacksTag;
   JobAidPage.divDownloadedPacksTag = divDownloadedPacksTag;


   // populate with data
   var loadingImageStr = '<img class="pin_pw_loading" src="images/loading_big_blue.gif" style="margin: 10px;"/>';

   // STEP 1. Get Server Manifests
   divAvailablePacksTag.append( loadingImageStr );

   JobAidHelper.getServerManifestsRun( function( results ) 
   {
      divAvailablePacksTag.html( '' ); // Clear loading Img

      JobAidPage.serverManifestsData = JobAidPage.getManifestJobAidInfo( results );

      // List All server manifest list - Available Packs
      JobAidPage.serverManifestsData.forEach( function( item ) 
      {
         var itemTag = $( JobAidPage.templateItem );
         JobAidPage.populateItem( item, itemTag, 'available' );
         divAvailablePacksTag.append( itemTag );
      });


      // STEP 2. Get Cached Manifests & display/list them
      divDownloadedPacksTag.append( loadingImageStr );
   
      JobAidPage.getCachedFileUrlList( function( urlList ) 
      {
         var result = { arr: [], obj: {} };
   
         JobAidPage.getManifestJsons( urlList, 0, result, function( result ) 
         {
            divDownloadedPacksTag.html( '' );

            var manifests = JobAidPage.getManifestJobAidInfo( result.arr );
   
            // Cached Item display
            manifests.forEach( function( item ) 
            {
               var itemTag = $( JobAidPage.templateItem );
               JobAidPage.populateItem( item, itemTag, 'downloaded' );
               divDownloadedPacksTag.append( itemTag );

               // var matchData = { matchProj: false, newerDate: false };
               var matchData = JobAidPage.matchInServerList( item, JobAidPage.serverManifestsData );

               if ( matchData.matchProj )
               {
                  divAvailablePacksTag.find( 'div.jobAidItem[projDir="' + item.projDir + '"]' ).remove();

                  if ( matchData.newerDate ) {
                     var updateSpanTag = $( '<span class="" style="margin-left: 14px; color: blue;">[update available]</span>' );
                     itemTag.find( 'span.downloadStatus' ).append( updateSpanTag );
                  }
               }
            });

            if ( callBack ) callBack();
         });      
      });
   });
};


// On 'available' download finish --> remove it from 'available' &
// we will need to refresh the cache list?  Or just add to the cached list??...
JobAidPage.updateSectionLists = function( projDir, statusType )
{
   var item = Util.getFromList( JobAidPage.serverManifestsData, projDir, 'projDir' );

   if ( !item ) alert( 'Not found the item, ' + projDir );
   else
   {
      if ( statusType === 'available' )
      {      
         JobAidPage.divAvailablePacksTag.find( 'div.jobAidItem[projDir=' + projDir + ']' ).remove();
   
         // Add to the cached..
         var itemTag = $( JobAidPage.templateItem );
         JobAidPage.populateItem( item, itemTag, 'downloaded' );
         JobAidPage.divDownloadedPacksTag.append( itemTag );
      }
      else if ( statusType === 'downloaded' )
      {
         var itemTag = JobAidPage.divDownloadedPacksTag.find( 'div.jobAidItem[projDir=' + projDir + ']' ).html('').append( JobAidPage.templateItem_body );
         
         // Add to the cached..
         JobAidPage.populateItem( item, itemTag, 'downloaded' );
         JobAidPage.divDownloadedPacksTag.append( itemTag );
      }
      else if ( statusType === 'downloaded_delete' )
      {
         JobAidPage.divDownloadedPacksTag.find( 'div.jobAidItem[projDir=' + projDir + ']' ).remove();

         // Also, Just In CASE, if there is available one, remove it as well
         JobAidPage.divAvailablePacksTag.find( 'div.jobAidItem[projDir=' + projDir + ']' ).remove();

         // Add to the cached..
         var itemTag = $( JobAidPage.templateItem );
         JobAidPage.populateItem( item, itemTag, 'available' );
         JobAidPage.divAvailablePacksTag.append( itemTag );
      }
      else
      {
         alert( 'itemCard statusType not known, ' + statusType );
      }   
   }

   TranslationManager.translatePage();
};


// -------------------------------------

JobAidPage.populateItem = function( itemData, itemTag, statusType )
{
   // type = 'available' vs 'downloaded'
   // pack = {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false };
   // status, buildDate,       
   itemTag.off( 'click'); // reset previous click if exists.


   itemTag.attr( 'data-language', itemData.code );
   itemTag.attr( 'projDir', itemData.projDir );
   itemTag.attr( 'statusType', statusType );

   var titleStrongTag = $( '<strong></strong>' ).append( itemData.title + ' [' + Util.getStr( itemData.language ) + ']' );
   if ( itemData.noMedia ) titleStrongTag.append( ' [WITHOUT MEDIA]' );

   itemTag.find( '.divTitle' ).append( titleStrongTag );
   itemTag.find( '.divBuildDate' ).append( '<strong>Release date: </strong>' + Util.getStr( itemData.buildDate ) );
   itemTag.find( '.divDownloadSize' ).append( '<strong>Download size: </strong>' + Util.getStr( itemData.size ) );
   itemTag.find( '.divDownloadStatus' ).append( '<span class="downloadStatus">downloaded. 197/197</span>' );

   itemTag.find( 'div.download' ).off( 'click' ).click( function( e ) 
   {
      var divDownloadTag = $( this );
      e.stopPropagation();

      var projDirTag = divDownloadTag.closest( 'div.jobAidItem[projDir]' );
      var projDir = projDirTag.attr( 'projDir' );

      if ( projDir )
      {
         JobAidHelper.runTimeCache_JobAid( { projDir: projDir, target: 'jobAidPage' } );
      }
   });


   // Downloaded Case - 'open' in iFrame case, 'delete' case.
   if ( statusType === "downloaded" ) 
   {
      // Open Up in iFrame Click Setup..
      itemTag.click( function( e ) 
      {
         var srcStr = JobAidPage.rootPath + itemData.projDir + '/index.html';
         var styleStr = 'width:100%; height: 100%; overflow:auto; border:none;';

         $( '#divJobAid' ).html( '' ).show().append( `<iframe class="jobAidIFrame" src="${srcStr}" style="${styleStr}">iframe not compatible..</iframe>` );
      });


      // Delete Tag Create & Click Handler
      var spanDeleteTag = $( '<span title="delete" style="margin-left: 11px; color: tomato; cursor: pointer;">[delete]</span>' );
      titleStrongTag.append( spanDeleteTag );

      spanDeleteTag.click( function( e ) 
      {
         e.stopPropagation();

         var result = confirm( 'Are you sure you want to delete this, "' + itemData.projDir + '"?' );
         if ( result ) 
         {
            JobAidHelper.deleteCacheKeys( JobAidPage.rootPath + itemData.projDir + '/' ).then( function( deletedArr ) 
            {            
               JobAidPage.updateSectionLists( itemData.projDir, 'downloaded_delete' );            
            });
         }
      });
   }   
};

// ------------------------------------

JobAidPage.jobFilingUpdate = function( msgData )
{
   // { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options }    
   var projCardTag = JobAidPage.getProjCardTag( msgData.options.projDir ); // $( 'div.card[projDir=' + msgData.options.projDir + ']' );

   if ( projCardTag.length > 0 ) 
   {
      var spanTag = projCardTag.find('span.downloadStatus');

      var prc = msgData.process;

      if ( prc.total && prc.total > 0 && prc.curr ) 
      {
         if ( prc.curr < prc.total ) 
         {
            spanTag.text( `Processing: ${prc.curr} of ${prc.total} [${prc.name.split('.').at(-1)}]` );
            if (prc.curr > 5) projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
            projCardTag.css( 'opacity', 1 );
         }
         else 
         {
            spanTag.text('Download completed!');
            projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
            projCardTag.css('opacity',1);

            // We need to refresh the list...
            JobAidPage.updateSectionLists( msgData.options.projDir, projCardTag.attr( 'statusType' ) );
         }
      }
   }
};


JobAidPage.getProjCardTag = function( projDir ) 
{
   return $( 'div.jobAidItem[projDir=' + projDir + ']' );
};


// ------------------------------------

JobAidPage.matchInServerList = function( item, serverManifestsData )
{
   var matchData = { matchProj: false, newerDate: false };

   serverManifestsData.forEach( srvItem => 
   {
      if ( srvItem.projDir === item.projDir )
      {
         matchData.matchProj = true;
         matchData.newerDate = ( srvItem.buildDate > item.buildDate );
      }
   });

   return matchData;
};


JobAidPage.getCachedFileUrlList = function( callBack )
{
   JobAidHelper.getCacheKeys( function( keys )
   {   
      var urlList = [];

      if ( Util.isTypeArray( keys ) )
      {
         keys.forEach( request => 
         { 
            var url = JobAidHelper.modifyUrlFunc( request.url );
            if ( url.indexOf( '/manifest.json' ) > 0 ) urlList.push( url );
         });
      }

      callBack( urlList );
   });
};


JobAidPage.getManifestJsons = function( urlList, i, result, finishCallBack )
{
   try
   {
      if ( i >= urlList.length ) finishCallBack( result );
      else
      {
         var url = urlList[i];      
   
         RESTCallManager.performGet( url, {}, function( success, returnJson ) 
         {  
            if ( success && returnJson )
            {
               result.arr.push( returnJson );
               result.obj[url] = returnJson;            
            }
   
            JobAidPage.getManifestJsons( urlList, i + 1, result, finishCallBack ); // regardless of success/fail, add to the count.
         });
      }
   }
   catch( errMsg )
   {
      console.log( 'ERROR in JobAidPage.getManifestJsons, ' + errMsg );
      finishCallBack( result );
   }
};


// ------------------------------------

JobAidPage.templateSections = `
   <div class="sectionTitle_jobAid">Downloaded packs</div>
   <div class="divDownloadedPacks">
   </div>

   <div class="sectionTitle_jobAid">Packs available for download</div>
   <div class="divAvailablePacks">
   </div>
`;

JobAidPage.templateItem_body = `
   <div class="card__container">
   <card__support_visuals class="card__support_visuals" style="padding-left: 4px;"><img src="images/JobAidicons.png"></card__support_visuals>
   <card__content class="card__content" style="padding-left: 4px;">
      <div class="card__row divTitle"></div>
      <div class="card__row divBuildDate"></div>
      <div class="card__row divDownloadSize"></div>
      <div class="card__row divDownloadStatus"></div>
   </card__content>
   <card__cta class="card__cta"><div class="download" style="padding: 18px; cursor: pointer;"><img src="images/appIcons/downloadIcon.png"></div></card__cta>
   </div>
`;

JobAidPage.templateItem = `
   <div class="card jobAidItem smartStart" data-language="" projdir="" style="opacity: 1;display: inline-block; height: unset;" downloaded="Y">
   ${JobAidPage.templateItem_body}
   </div>
`;
