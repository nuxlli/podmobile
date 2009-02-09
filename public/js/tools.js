// Configure default options for blockUI
jQuery.extend($.blockUI.defaults, $.blockUI.defaults, {
  fadeIn: 0,
  fadeOut: 0,
  focusInput: false,
  onUnblock: function() {
    $('#dialogs div').hide();
    $('#dialogs h2').hide();
  }
})

jQuery.extend($.blockUI.defaults.css, $.blockUI.defaults.css, {
  width: '350px',
  height: '35px',
  border: 'none',
  cursor: 'default',
  'margin-left': '-60px',
  'padding': '5px 5px',
  '-webkit-border-radius': '5px'
})

jQuery.extend($.blockUI.defaults.overlayCSS, $.blockUI.defaults.overlayCSS, {
  cursor: 'default'
})

/*
jQuery.extend(String.prototype, {
  truncate: function(length, truncation) {
    length = length || 30;
    truncation = (typeof(truncation) == 'undefined') ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }
});*/

function two(x) {
  return ((x>9)?"":"0")+x
}

function convertTime(ms) {
  var sec = Math.floor(ms/1000);
  var min = Math.floor(sec/60);
  var hr = Math.floor(min/60);
  sec = two(sec%60);
  min = two(min%60);
  hr  = two(hr%60);

  return (hr == 0 ? '' : hr + ":" ) + min + ":" + sec;
}