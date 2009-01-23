jQuery(document).ready(function() {
  //firebug.init();
  //jQuery('#mycarousel').jcarousel();
  $('#tabs li').corner();
  //$('.painel').corner();
  //alert(window.innerHeight + "x" + window.innerWidth);

  $('#tabs a').each(function(key, item) {
    $(item).click(function() {
      $('#tabs .select').removeClass("select");
      //console.log($(this).parent());
      $(this).parent().addClass("select");//.corner();
      return false;
    });
  });
});
