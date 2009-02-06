/**
 * Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://code.google.com/p/podmobile
 */

var download = plugin("Download")
var _downloads = [];

download.update.connect(function(id, amount_read, data) {
  if (_downloads[id])
    var obj = _downloads[id];
    obj.setData(data);
    obj.update(amount_read);
});

download.error.connect(function(id, error, data) {
  if (_downloads[id]) {
    error = jQuery.evalJSON(error);
    var obj = _downloads[id];
    obj.setData(data);
    obj.error(error);
  }
});

download.finished.connect(function(id, data) {
  if (_downloads[id])
    var obj = _downloads[id];
    obj.setData(data);
    obj.finished();
});

download.started.connect(function(id, data) {
  if (_downloads[id])
    var obj = _downloads[id];
    obj.setData(data);
    obj.started();
});

function Download(options) {
  jQuery.extend(this, {
    d        : true,
    url      : '',
    filename : null,
    finished : function() { this.debug('Internal Finished') },
    error    : function() { this.debug('Internal error')    },
    update   : function() { this.debug('Internal update')   },
    started  : function() { this.debug('Internal Started')  }
  }, options);

  this.id = download.create(this.url);
  _downloads[this.id] = this;
}

Download.prototype = {
  start: function() {
    this.filename = (this.filename == null) ? "" : this.filename;
    this.debug([this.id, this.filename]);
    download.start(this.id, this.filename);
  },

  setData: function(data) {
    this.debug(data);
    jQuery.extend(this, jQuery.evalJSON(data));
  },

  debug: function(msg) {
    if(this.d)
      console.log("Download: " + msg);
  }
}