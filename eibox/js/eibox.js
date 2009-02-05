
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
 * Warape for python logging
 */
var logging = {
  _eval: function(type, msg) {
     application.pyEval("logging." + type + "('"+ msg +"')")
  },

  debug   : function(msg) { this._eval("debug"  , msg) },
  warning : function(msg) { this._eval("warning", msg) },
  error   : function(msg) { this._eval("error"  , msg) }
}

window.database = plugin("Database");

//window.download = plugin("Download");
//var player = plugin('Player');
//logging.debug("Teste de application");
//alert(player.state)
//plugin('Application', 'application');
//plugin('Player', 'player');
//window.application = document.application
//plugin('Database', 'database');
