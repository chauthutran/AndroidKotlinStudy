// -------------------------------------------
// -- BlockMsg Class/Methods
function jobAidPage(cwsRender) 
{
   var me = this;

   me.cwsRenderObj = cwsRender;

   me.options = {
      'title': 'Job Aid',
      'term': 'form_title_jobAid',
      'cssClasses': ['divJobAidPage'],
      'zIndex': 1600
   };

   me.sheetFullTag;

   // --------------------------------

   me.jobAidsVersion = 'v0.7.4';
   me.buildDate = 'July 8, 2022';
   me.downloadSize = '0.05 GB';
   me.availableVersions = [
      {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false },
      {code:"EN_LOW" , language:"English", projDir:"EN_LOW", size:"74MB", noMedia:true },
      {code:"AM" , language:"Amharic", projDir:"AM", size:"455MB", noMedia:false },
      {code:"AM_LOW" , language:"Amharic", projDir:"AM_LOW", size:"74MB", noMedia:true },
      {code:"OM" , language:"Oromo", projDir:"OM", size:"396MB", noMedia:false },
      {code:"OM_LOW" , language:"Oromo", projDir:"OM_LOW", size:"74MB", noMedia:true },
      {code:"SID" , language:"Sidama", projDir:"SID", size:"581MB", noMedia:false },
      {code:"SID_LOW" , language:"Sidama", projDir:"SID_LOW", size:"74MB", noMedia:true }
   ];  
   
   me.downloadedVersions = [
      {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false }
   ];  


   // TODO:  <-- We need to get this from manifest service on SERVER

   // 1. Create a service to get these manifest json array...


   // =============================================
   // === TEMPLATE METHODS ========================

   me.initialize = function () {
      //me.setEvents_OnInit();
   };

   // ------------------

   me.render = function () {
      //me.options.preCall = function(sheetFullTag) {};

      me.sheetFullTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, me.options);

      me.populatePageContent( me.sheetFullTag.find( '.contentBody' ) );   

      TranslationManager.translatePage();
   };

   // ------------------

   me.populatePageContent = function( contentBodyTag )
   {
      // Section layout tags add
      contentBodyTag.append( jobAidPage.templateSections );
      
      var divAvailablePacksTag = contentBodyTag.find( 'div.divAvailablePacks' );
      var divDownloadedPacksTag = contentBodyTag.find( 'div.divDownloadedPacks' );

      // populate with data

      // Available Packs
      me.availableVersions.forEach( function( pack ) 
      {
         var itemTag = $( jobAidPage.templateItem );
         me.populateItem( pack, itemTag );
         divAvailablePacksTag.append( itemTag );
      });


      // Cached Packs
      me.downloadedVersions.forEach( function( pack ) 
      {
         var itemTag = $( jobAidPage.templateItem );
         me.populateItem( pack, itemTag );
         divDownloadedPacksTag.append( itemTag );
      });
      
   };


   me.populateItem = function( itemData, itemTag )
   {
      // pack = {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false };
      // status, buildDate, 

      itemTag.attr( 'data-language', itemData.code );
      itemTag.attr( 'projDir', itemData.projDir );

      var titleStrongTag = $( '<strong></strong>' ).append( 'Smart Start [' + Util.getStr( itemData.language ) + ']' );
      if ( itemData.noMedia ) titleStrongTag.append( ' [WITHOUT MEDIA]' );

      itemTag.find( '.divTitle' ).append( titleStrongTag );
      itemTag.find( '.divBuildDate' ).append( '<strong>Release date: </strong>' + Util.getStr( itemData.buildDate ) );
      itemTag.find( '.divDownloadSize' ).append( '<strong>Download size: </strong>' + Util.getStr( itemData.size ) );
      itemTag.find( '.divDownloadStatus' ).append( '<span class="downloadStatus">downloaded. 197/197</span>' );
   };

   // ------------------------------------

   me.initialize();
}

jobAidPage.templateSections = `
   <div style="background-color: gray;padding: 8px;">Downloaded packs</div>
   <div class="divDownloadedPacks">
   </div>

   <div style="background-color: gray;padding: 8px;">Packs available for download</div>
   <div class="divAvailablePacks">
   </div>
`;

jobAidPage.templateItem = `
   <div class="card jobAidItem smartStart" data-language="" projdir="" style="opacity: 1;display: inline-block; height: unset;" downloaded="Y">
      <div class="card__container">
         <card__support_visuals class="card__support_visuals"><img src="images/JobAidicons.png"></card__support_visuals>
         <card__content class="card__content">
            <div class="card__row divTitle"></div>
            <div class="card__row divBuildDate"></div>
            <div class="card__row divDownloadSize"></div>
            <div class="card__row divDownloadStatus"></div>
         </card__content>
         <card__cta class="card__cta"><div class="download" style="padding: 18px;"><img src="images/appIcons/downloadIcon.png"></div></card__cta>
      </div>
   </div>
`;

jobAidPage.templateItem_Back = `
   <div class="card jobAidItem smartStart" data-language="" projdir="" style="opacity: 1;display: inline-block; height: unset;" downloaded="Y">
      <div class="card__container">
         <card__support_visuals class="card__support_visuals">
            <img src="images/JobAidicons.png">
         </card__support_visuals>
         <card__content class="card__content">
            <div class="card__row divTitle"><strong>Smart Start v0.7.1 [English]</strong></div>
            <div class="card__row divBuildDate"><strong>Release date:</strong> June 8, 2022</div>
            <div class="card__row divDownloadSize"><strong>Download size:</strong> 0.05 GB</div>
            <div class="card__row divDownloadStatus"><span class="downloadStatus">downloaded. 197/197</span></div>
         </card__content>
         <card__cta class="card__cta">
            <div class="download" style="padding: 18px; cursor: pointer; "><img src="images/appIcons/downloadIcon.png"></div>
         </card__cta>
      </div>
   </div>
`;
   
   