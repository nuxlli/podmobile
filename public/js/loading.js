
// Jquery
load('jquery/jquery-1.3.min.js');
load('jquery-ui-themeroller/jquery.ui.all.js');
load('jquery/jquery.hotkeys-0.7.8.js');
load('jquery/jquery.blockUI.js');
load('jquery/jquery.json-1.3.js');
load('jquery/jquery.jfeed.js');
load('jquery/jquery.preload.js');

// Load plugin database
logging.debug('Carregando plugin');
plugin('Database', 'database');

// Jazz Record
/*
load('jazzrecord/javascripts/dependencies/html5/database.js');
load('jazzrecord/javascripts/jazz_record.js');
load('jazzrecord/javascripts/adapters.js');
load('jazzrecord/javascripts/record/record.js');
load('jazzrecord/javascripts/record/save.js');
load('jazzrecord/javascripts/record/is_changed.js');
load('jazzrecord/javascripts/model/model.js');
load('jazzrecord/javascripts/association_loader.js');
load('jazzrecord/javascripts/model/util.js');
load('jazzrecord/javascripts/record/validate.js');
load('jazzrecord/javascripts/model/query.js');
load('jazzrecord/javascripts/model/save.js');
load('jazzrecord/javascripts/model/destroy.js');
load('jazzrecord/javascripts/model/find.js');
load('jazzrecord/javascripts/migrations/schema_operations.js');
load('jazzrecord/javascripts/migrations/migrate.js');
*/
// Application
//load('models.js');
//load('sprintf.js');
//load('downloads.js');
load('main.js');