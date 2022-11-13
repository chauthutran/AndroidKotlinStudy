// -------------------------------------------
// -- BlockMsg Class/Methods
function BanmiPage(cwsRender) {
	var me = this;

	me.cwsRenderObj = cwsRender;

	me.bammiFormDivTag = $('#bammiFormDiv');


	// === TEMPLATE METHODS ========================

	me.initialize = function () {

		// // Set HTML & values related
		me.bammiFormDivTag.append(BanmiPage.contentHtml);

		me.setEvents_OnInit();
	};

	// ------------------

	me.render = function () {
		me.populateBanmiPageData(function(){
            console.log("ERROR : " );
        });

		TranslationManager.translatePage();

		me.showBamniPage();
	};

	// ------------------

	me.setEvents_OnInit = function () {
		// --------------
		// BUTTON CLICKS

		me.bammiFormDivTag.find('img.btnBack').click(() => {
			if ($('img.rotateImg').length) {
				$('img.rotateImg').click();
			}
			else {
				me.hideBamniPage();
			}
		});

		me.evalHideSections = function (excludeID) {
			$('li.aboutGroupDiv').each(function (i, obj) {

				if ($(obj).attr('id') != excludeID && !$(obj).hasClass('byPassAboutMore')) {
					if ($(obj).is(':visible')) $(obj).hide();
					else $(obj).show();
				}

			});
		}
	};

	// ------------------

	me.showBamniPage = function () {
		if ($('#loginFormDiv').is(":visible")) {
			$('#loginFormDiv').hide();
		}

		me.bammiFormDivTag.show();
	};

	me.hideBamniPage = function () {
		me.bammiFormDivTag.hide();
	};



	me.populateBanmiPageData = function ( callBack ) {
        
        var localIP = ( INFO.localIP ) ? INFO.localIP : "172.30.1.26:8080";
        const requestUrl = `http://${localIP}/banmi/data.json`;

		$.ajax({
			url: requestUrl,
			type: "GET",
			dataType: "json",
			success: function (response) 
			{
                var data = JSON.stringify( response );
				me.bammiFormDivTag.find(".subContent").html( data);
                console.log( response );
			},
			error: function ( error ) {
				console.log( 'error: ' );
				console.log( error );
				MsgManager.msgAreaShowErrOpt( 'FAILED on populateBamniPageData' );

				if ( callBack ) callBack( [], 'error' );
			},
			complete: function () { }			
		});
        
	};

	// ------------------------------------

	me.initialize();
};


BanmiPage.contentHtml = `
<div class="wapper_card">
	<div class="sheet-title c_900" style="width:100%">
		<img src="images/arrow_back.svg" class="btnBack mouseDown">
        <span term="">Banmi</span>
	</div>

	<div class="card" style="padding: 8px; background-color: #FFF; overflow-y: auto !important; height: calc(100vh - 60px); width: calc(100vw - 16px);">
		<div class="subContent" style="margin-bottom: 30px;"></div>
	</div>

</div>
`;