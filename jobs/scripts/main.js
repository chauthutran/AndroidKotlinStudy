$(document).ready(function () {
  var vw = $(window).width();
  var vh = $(window).height();
  var letsGo_slider = 0;

  var myurl = "beckolsystem.com";
  var currenturl = window.location.hostname;

  var button_cls = "";

  var count = 0; // needed for safari
  window.onload = function () {
    if (typeof history.pushState === "function") {
      history.pushState("back", null, null);
      window.onpopstate = function () {
        history.pushState('back', null, null);
        if (count == 1) { window.location = 'http://127.0.0.1:5500index.html'; }
      };
    }
  }
  setTimeout(function () { count = 1; }, 200);

  function goBack() {
    window.history.go(-1);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /*------------------------------------*\
        #AppBarTop 
    \*------------------------------------*/
  $('.Nav__icon').click(function () {
    // media NavDrawer
    if (vw <= 360) {
      $('.navigation').css('width', '100%');
    } else {
      $('.navigation').css('width', '300px');
    }
    $('.scrim').show();
  });


  /*------------------------------------*\
      #NavDrawer 
  \*------------------------------------*/
  $('.navigation').height(vh - 5);
  $('.navigation__items').height(vh - 120);

  $(".navigation__close").click(function () {
    $('.navigation').width(0);
    $('.scrim').css('display', 'none');
  });

  $(".scrim").click(function () {
    $('.navigation').width(0);
    $('.scrim').css('display', 'none');
    $('dialog').css('display', 'none');
  });

  $("a").click(function () {
    $('.navigation').width(0);
    $('.scrim').css('display', 'none');
  });

  var buttons = document.querySelectorAll('.mdc-button, .mdc-fab');
  for (var i = 0, button; button = buttons[i]; i++) {
    mdc.ripple.MDCRipple.attachTo(button);
  }

  var nodes = document.querySelectorAll('.mdc-icon-toggle');
  for (var i = 0, node; node = nodes[i]; i++) {
    mdc.iconToggle.MDCIconToggle.attachTo(node);
  }

  var checkboxes = document.querySelectorAll('.mdc-checkbox');
  for (var i = 0, checkbox; checkbox = checkboxes[i]; i++) {
    new mdc.checkbox.MDCCheckbox(checkbox);
  }

  var radios = document.querySelectorAll('.mdc-radio');
  for (var i = 0, radio; radio = radios[i]; i++) {
    new mdc.radio.MDCRadio(radio);
  }

  var interactiveListItems = document.querySelectorAll('.mdc-list-item');
  for (var i = 0, li; li = interactiveListItems[i]; i++) {
    mdc.ripple.MDCRipple.attachTo(li);
    // Prevent link clicks from jumping demo to the top of the page
    li.addEventListener('click', function (evt) {
      evt.preventDefault();
    });
  }

  /*------------------------------------*\
      #Menu display 
  \*------------------------------------*/

  $(".Nav2__icon").click(function () {
    if ($('.Menus_display').is(':visible')) {
      $('.Menus_display').css('display', 'none');
      $('.fab-wrapper').show();
      $('.Nav2__icon').css('transform', 'rotate(0deg)');
    } else {
      $('.Menus_display').css('display', 'table-row');
      $('.fab-wrapper').css('display', 'none');
      $('.Nav2__icon').css('transform', 'rotate(180deg)');
    }
  });

  $(".menu_item_comtainer").click(function () {
    $('.Menus_display').css('display', 'none');
    $('.Nav2__icon').css('transform', 'rotate(0deg)');
    $('.fab-wrapper').show();
  });



  $(function () {
    $(".draggable").draggable({
      containment: 'body'
    });
  });

  /* navigation prototype */

  $('#select_onlyPrototype').on('change', function () {
    var url = $(this).val();
    var origin = window.location.origin;
    if (url) {
      window.location = `${origin}/your_folder/${url}`;
    }
    return false;
  });

  //////////////////////////////////////////////////////////////////////////////////////////////

  $("#smartStart").click(function () {
    $(".Nav1").animate({ height: 'toggle' });
    $(".list").hide();
    $("Body").css({
      "background-image": "none"
    });

    $(".nav_bottom").delay(500).fadeIn();
    $(".letsGo").delay(500).fadeIn();

    $(".fab_info").delay(1500).fadeIn().css({
      "left": "25%"
    });

    $(".fab_close").delay(2000).fadeIn().css({
      "left": "45%"
    });

    $(".fab_next").delay(600).fadeIn();
    $("#box0").show("slide", { direction: "down" }, 500);
  });

  $(window).on("orientationchange", function (event) {
    console.log(window.orientation);
    orientation_device();
  });

  orientation_device();

  function orientation_device() {

    if (window.orientation == 0) {

      if (letsGo_slider == 1) {
        //$("#letsGo_1").delay(500).show();
      }

      if (letsGo_slider == 2) {

      }

    } else if (window.orientation == 90) {
      if (window.orientation == 90) {
        if (letsGo_slider == 1) {
          //$("#letsGo_1").delay(500).show();
        }

        if (letsGo_slider == 2) {

        }

      }
    }

  }

  function slider_position(elm, sld_number) {
    var cta_slider = elm + '-' + sld_number;
    console.log('elem: ' + cta_slider);
    switch (cta_slider) {
      // - 0
      case "fab_next-0":

        break;

      case "fab_back-0":
        console.log('slider_1: ' + sld_number);

        $(".arrow_box_e").hide("slide", { direction: "left" }, 100);
        $(".arrow_box_h").hide("slide", { direction: "left" }, 100);

        $(".arrow_box_h").css({
          "left": "90px"
        });

        $("#letsGo_0").show("slide", { direction: "down" }, 1000);
        $(".letsGo").css({
          "background-image": "url('/images/letsGo_landscape.svg')",
          "background-color": "#FDC99D"
        }, 1000);
        $("#letsGo_1").hide("slide", { direction: "right" }, 1200);
        $(".fab_back").hide("slide", { direction: "down" }, 500);
        $("#box0").show("slide", { direction: "down" }, 3000);
        $("#box1").hide("slide", { direction: "down" }, 500);

        break;

      // - 1
      case "fab_next-1":
        console.log('slider_1: ' + sld_number);
        $("#box0").hide("slide", { direction: "down" }, 500);
        $("#box1").show("slide", { direction: "down" }, 3000);

        $(".arrow_box_e").hide("slide", { direction: "left" }, 100);
        $(".arrow_box_h").hide("slide", { direction: "left" }, 100);

        $(".arrow_box_h").css({
          "left": "90px"
        });

        $(".arrow_box_h").css({
          "left": "120px"
        });

        $("#letsGo_0").delay(1).fadeOut();
        $(".letsGo").css({
          "background-image": "none",
          "background-color": "#FDC99D"
        });
        $(".fab_back").delay(500).fadeIn().css({
          "left": "16px"
        }, 500);
        $("#letsGo_1").css({
          "display": "grid"
        })
        $("#letsGo_1").delay(1000).show();

        break;

      case "fab_back-1":
        console.log('slider_1xxxx: ' + sld_number);

        $("#letsGo_2").hide("slide", { direction: "right" }, 500);

        $("#letsGo_1").show("slide", { direction: "left" }, 500);

        $(".letsGo").css({
          "background-image": "none",
          "background-color": "#FDC99D"
        }), 500;
        $("#box1").show("slide", { direction: "down" }, 3000);


        break;

      // - 2
      case "fab_next-2":
        console.log('slider_2: ' + sld_number);
        $("#box1").hide("slide", { direction: "down" }, 500);

        $("#letsGo_1").hide("slide", { direction: "left" }, 500);

        $(".letsGo").css({
          "background-image": "none",
          "background-color": "#F7B01A"
        });

        $("#letsGo_2").show("slide", { direction: "left" }, 500);

        break;

      case "fab_back-2":
        console.log('fab_back_2: ' + sld_number);
        $("#box1").hide("slide", { direction: "down" }, 500);

        $("#letsGo_3").hide("slide", { direction: "down" }, 1000);
        $(".letsGo").css({
          "background-image": "none",
          "background-color": "#F7B01A"
        }, 1000);
        $("#letsGo_2").show("slide", { direction: "left" }, 1200);
        $(".fab_next").show("slide", { direction: "down" }, 500);
        $("#box_thanks").hide();

        break;


      // - 3
      case "fab_next-3":
        console.log('slider_1: ' + sld_number);
        $("#box2").show("slide", { direction: "up" }, 1500);
        $(".fab_next").hide("slide", { direction: "down" }, 500);
        $("._family").delay(1000).show();


        $("#letsGo_3").show("slide", { direction: "down" }, 1000);
        $(".letsGo").css({
          "background-image": "none",
          "background-color": "#ECB343"
        }, 1000);
        $("#letsGo_2").hide("slide", { direction: "left" }, 2000);

        break;

      case "fab_next-3":
        console.log('slider_1: ' + sld_number);
        $("#box2").show("slide", { direction: "down" }, 500);


        $("#letsGo_3").show("slide", { direction: "down" }, 1000);
        $(".letsGo").css({
          "background-image": "none",
          "background-color": "#ECB343"
        }, 1000);
        $("#letsGo_2").hide("slide", { direction: "left" }, 1200);

        break;
      /*fab_back-1
    case 2:
      //code block
      break;
      */
    }
  }

  $(".fab_back").click(function () {
    letsGo_slider = letsGo_slider - 1;
    button_cls = $(this).attr('class');

    slider_position(button_cls, letsGo_slider);
  });


  $(".fab_next").click(function () {
    letsGo_slider = letsGo_slider + 1;
    button_cls = $(this).attr('class');

    slider_position(button_cls, letsGo_slider);
  });

  // dialogs

  $(".fab_close").click(function () {
    $(".arrow_box_e").show("slide", { direction: "left" }, 500);
  });

  $(".fab_info").click(function () {
    $(".arrow_box_h").show("slide", { direction: "left" }, 500);
  });

  $(".arrow_head-cta").click(function () {
    $(".arrow_box_e").hide("slide", { direction: "left" }, 500);
    $(".arrow_box_h").hide("slide", { direction: "left" }, 500);
  });

  $(".btn_c").click(function () {
    $("#box2").hide();
    $("#box_thanks").show();
  });

  $(".btn_o").click(function () {

    $(".arrow_box_e").hide("slide", { direction: "left" }, 200);
    $(".Nav1").animate({ height: 'toggle' });
    $(".list").show();
    $("Body").css({
      "background-image": "url('/images/logo_bk.svg')"
    });
  });



  //calc inputs
  $("#_houses").change(function () {
    //console.log($("#_houses").val());
    calc1($("#_houses").val(), $("#_animals").val());
  });

  $("#_animals").change(function () {
    //console.log($("#_animals").val());
    calc1($("#_houses").val(), $("#_animals").val());
  });

  function calc1(h, a) {
    var result = h / a;
    if (result != "Infinity") {
      $("#_result").html(result);
    }

  };

});