
var Eibox = {
    /**
     * Load plugin and create a instance
     */
    plugin: function() {
        if (arguments.length == 0)
          return null;

        var obj_name = application.plugin(jQuery.toJSON(arguments));
        this.logging.debug("Objeto id " + obj_name);
        if (obj_name != "")
            return eval("window." + obj_name);
        else
            return null;
    },

    empty: function(obj) {
        return typeof(obj) == 'undefined' || obj == null || obj.length <= 0 ? true : false
    },

    /**
     * Execute python code in window box
     **/
    pyEval: function(code) {
        return eval(application.pyEval(code));
    },

    /**
     * Warape for python logging
     */
    logging: {
        _eval: function(type, msg) {
          application.logging(type, msg);
        },

        debug   : function(msg) { this._eval("debug"  , msg) },
        warning : function(msg) { this._eval("warning", msg) },
        error   : function(msg) { this._eval("error"  , msg) }
    },

    /**
     * import os python
     */
    os: {
        path : {
            basename: function(path) {
                return Eibox.pyEval('os.path.basename("%s")'.sprintf(path));
            }
        },

        remove : function(path) {
            return Eibox.pyEval('os.remove("%s")'.sprintf(path));
        }
    }
}

/**
 * Strings functions
 */
String.prototype.truncate = function(length, truncation) {
    length = length || 30;
    truncation = (typeof(truncation) == 'undefined') ? '...' : truncation;
    return this.length > length ?
    this.slice(0, length - truncation.length) + truncation : String(this);
};

String.prototype.renlacc = function() {
    var torem = this;
    torem = torem.split('');
    toremout = new Array();
    toremlen = torem.length;
    var sec = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    var rep = ['A','A','A','A','A','A','a','a','a','a','a','a','O','O','O','O','O','O','O','o','o','o','o','o','o','E','E','E','E','e','e','e','e','e','C','c','D','I','I','I','I','i','i','i','i','U','U','U','U','u','u','u','u','N','n','S','s','Y','y','y','Z','z'];
    for (var y = 0; y < toremlen; y++) {
        if (sec.indexOf(torem[y]) != -1) {
            toremout[y] = rep[sec.indexOf(torem[y])];
        } else
            toremout[y] = torem[y];
    }
    toascout = toremout.join('');
    return toascout;
}

String.prototype.strip = function() {
  return this.replace(/^\s+|\s+$/g,"");
}

String.prototype.sanitize = function() {
  return this.toLocaleLowerCase().strip().renlacc().replace(/[^a-zA-Z._0-9 -]/g, '').replace(/\.| /g, '-').replace(/-{2,}/g, '-')
}

/**
 * Remove element in array
 */
jQuery.remove = function(o, item) {
    if (!jQuery.isArray(o))
        throw new TypeError("Not is array");

    return jQuery.grep(o, function(n) { return n != item });
}
