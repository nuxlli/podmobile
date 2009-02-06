
/**
 * Load plugin and create a instance
 */
function plugin(classid) {
  var obj_name = application.plugin(classid)
  logging.debug("Objeto id " + obj_name)
  if (obj_name != "")
    return eval("window." + obj_name);
  else
    return null;
}

/**
 * Execute python code in window box
 **/
function pyEval(code) {
  return eval(application.pyEval(code));
}

/**
 * Warape for python logging
 */
var logging = {
  _eval: function(type, msg) {
    application.logging(type, msg)
  },

  debug   : function(msg) { this._eval("debug"  , msg) },
  warning : function(msg) { this._eval("warning", msg) },
  error   : function(msg) { this._eval("error"  , msg) }
}