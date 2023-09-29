$(document).ready(function () {
// alert("3456789");
  // $('.menu_icon_click').click(function(){
  //   alert("hello");
  //   var css=$('.LftMain').css('display');
  //   var setCss = css == 'none'? 'block !important':'none !important'; 
  //   $('.LftMain').css('display', setCss);
  //   alert(setCss);

  // })
  // function leftsetting(){
  //   console.log("123465798798798");
  //   alert("hello");
  //   $('.PayOffVisualOne').toggleClass('showleft');
  // }
  // $('.leftsetting').click(function(){
  //   console.log("123465798798798");
  //   alert("hello");
  //   $('.PayOffVisualOne').toggleClass('showleft');
  // });
  // $('.rightsetting').click(function(){
  //   $('.PayOffVisualThree').toggleClass('showright');
  // });
  // $('.nav_bar').click(function () {
  //   $('.LftMain').toggleClass('display_custom');
  //   $('.RgtMain').toggleClass('display_width');
  //   // $('main').addClass('opacity');
  // });
  $('.mobile-menu').click(function () {
    $('.navigation').removeClass('visible');
    $('main').removeClass('opacity');
  });

  $(".menu-header ul li").click(function () {
    $(this).toggleClass("active");
    $(this).siblings('.sub-menu').slideToggle('slow')
  });

  $(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll >= 1) {
      $("#menu").addClass("sticky");
      $("main").removeClass("content-wrapper");
    } else {
      $("#menu").removeClass("sticky");
      $("main").addClass("content-wrapper");
    }
  });

  // prevent insufficient scroll
  $('a[href="#"]').click(function (event) {
    event.preventDefault();
  });


  // Search Click
  if (jQuery(window).width() >= 400 && jQuery(window).width() <= 1024) {
    $(".fa-magnifying-glass").click(function () {
      $(".togglesearch").toggle();
      $("input[type='text']").focus();
    });
  }

  // table data select
  $(function () {
    $('#myTable tbody tr .NonClick').click(function (event) {
      event.stopPropagation();
    });

    $('#myTable tbody tr').click(function () {
      // $(this).addClass('bg-success').siblings().removeClass('bg-success');
      $(this).toggleClass('selected');
    });
  });

  // Analytic Sidebar
  $('.configBtn').click(function () {
    $('.SideBarMain').addClass('active');
    $('.SideBarLft').addClass('Addwidth');
  });
  $('.close').click(function () {
    $('.SideBarMain').removeClass('active');
    $('.SideBarLft').removeClass('Addwidth');
  });

  // tooltip
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  // Equal height

    $(".dash-select").select2({
      matcher: matchCustom,
      templateResult: formatCustom
    });

  function stringMatch(term, candidate) {
    return candidate && candidate.toLowerCase().indexOf(term.toLowerCase()) >= 0;
  }

  function matchCustom(params, data) {
    if ($.trim(params.term) === '') {
      return data;
    }
    if (typeof data.text === 'undefined') {
      return null;
    }
    if (stringMatch(params.term, data.text)) {
      return data;
    }
    // Match attribute "data-foo" of option
    if (stringMatch(params.term, $(data.element).attr('data-foo'))) {
      return data;
    }
    return null;
  }

  function formatCustom(state) {
    return $(' < div >< div > ' + state.text + ' < /div>< div class = "foo" > ' + $(state.element).attr('data-foo') + ' < /div>< /div > ');
  }

//   function fixedTable(el) {
//     // Scroll listener
//     myTableDiv1 = $(el).find('.table1');
//     myTableDiv2 = $(el).find('.table2');
//     myTableDiv3 = $(el).find('.table3');

//     myTable1 = $(el).find('.table1 .myTable1');
//     myTable2 = $(el).find('.table2 .myTable2');
//     myTable3 = $(el).find('.table3 .myTable3');

//     $(myTableDiv1).scroll(function () {
//       //$(myTable1).css('margin-top', -$(myTableDiv1).scrollTop());
//       $(myTable2).css('margin-top', -$(myTableDiv1).scrollTop());
//       $(myTable3).css('margin-top', -$(myTableDiv1).scrollTop());
//     });
//     $(myTableDiv2).scroll(function () {
//       $(myTable1).css('margin-top', -$(myTableDiv2).scrollTop());
//       //$(myTable2).css('margin-top', -$(myTableDiv2).scrollTop());
//       $(myTable3).css('margin-top', -$(myTableDiv2).scrollTop());
//     });
//     $(myTableDiv3).scroll(function () {
//       $(myTable1).css('margin-top', -$(myTableDiv3).scrollTop());
//       $(myTable2).css('margin-top', -$(myTableDiv3).scrollTop());
//       //$(myTable3).css('margin-top', -$(myTableDiv2).scrollTop());
//     });
//   };

  //fixedTable($('#demo'));

//   $('.OptionTable1').removeClass('width1');
//   $('.OptionTable1').removeClass('width2');
//   $('.OptionTable3').removeClass('width1');
//   $('.OptionTable3').removeClass('width2');
//   $('.OptionTable1').addClass('width2');
//   $('.OptionTable3').addClass('width2');
//   $('.OptionTable4').addClass('d-none');

//   $('#SelectType').change(function () {
//       alert("1");
//     var val = $(this).val();
//     if (val == 'All') {
//       $('.OptionTable4').addClass('d-none');
//       $('.OptionTable2').removeClass('d-none');
//       $('.OptionTable1').removeClass('d-none');
//       $('.OptionTable3').removeClass('d-none');
//       $('.OptionTable1').removeClass('width1');
//       $('.OptionTable1').removeClass('width2');
//       $('.OptionTable3').removeClass('width1');
//       $('.OptionTable3').removeClass('width2');
//       $('.OptionTable1').addClass('width2');
//       $('.OptionTable3').addClass('width2');
//     }
//     if (val == 'Call') {
//       $('.OptionTable1').removeClass('d-none');
//       $('.OptionTable3').addClass('d-none');
//       $('.OptionTable1').removeClass('width2');
//       $('.OptionTable1').addClass('width1');
//       $('.OptionTable2').addClass('d-none');
//       $('.OptionTable4').removeClass('d-none');
//     }
//     if (val == 'Put') {
//       $('.OptionTable4').addClass('d-none');
//       $('.OptionTable2').removeClass('d-none');
//       $('.OptionTable3').removeClass('d-none');
//       $('.OptionTable1').addClass('d-none');
//       $('.OptionTable3').removeClass('width2');
//       $('.OptionTable3').addClass('width1');
//     }

//   })

});
