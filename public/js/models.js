/**
 * Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://code.google.com/p/podmobile
 */

var regexp_link = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

JazzRecord.Record.prototype.updateAttributes = function(attrs) {
  jQuery.extend(this, attrs);
  this.save();
}

JazzRecord.Model.prototype.findByOrCreate = function(field, value, depth) {
  var result = this.findBy(field, value, depth);
  var attr   = {};
  attr[field]= value;
  return (result == null) ? this.create(attr) : result;
};

var Podcast = new JazzRecord.Model({
  table: "podcasts",
  foreignKey: "podcast_id",
  hasMany: { casts: "casts" },
  columns: {
    title       : "text",
    sanitize    : "text",
    feed        : "text",
    link        : "text",
    img         : "text",
    tn_img      : "text",
    updated     : "text",
    description : "text"
  },

  events: {
    onSave: function() {
      this.sanitize = this.title.sanitize();
      return true;
    }
  },

  validate: {
    atCreate: function () {
      this.validatesFormatOf("feed", regexp_link, "Invalid url feed");
    }
  },

  modelMethods: {
    createByFeed: function(options) {
      options = JQuery.extend({
        data: {},
        sucess: {}
      }, options);
    }
  }
});

var Cast = new JazzRecord.Model({
  table: "casts",
  belongsTo: { podcast: "podcasts"},
  columns: {
    podcast_id  : "number",
    title       : "text",
    link        : "text",
    guid        : "text",
    updated     : "text",
    description : "text",
    url         : "text",
    length      : "number",
    type        : "text",
    download    : "text",
    local       : "text",
    favorite    : "bool",
    percent     : "number"
  },

  recordMethods: {
    /*
    update_percent() {

    },*/
    getPercent: function() {
        return (this.percent == null ? 0 : this.percent) + "%";
    },

    exclude_download: function() {
        if (this.local != null) {
            Eibox.os.remove(this.local);
            this.local = null;
            this.percent = null;
            this.download = null;
            this.save()
        }
    }
  },

  modelMethods: {
    findByPodcastAndGuidOrCreate: function(podcast_id, guid) {
      var result = this.find({
        conditions: "podcast_id = " + podcast_id + " AND guid = " + this.typeValue("guid", guid),
        limit: 1
      });

      if (result == null)
        result = this.create({
          'podcast_id' : podcast_id,
          'guid'       : guid
        });

      return result;
    }
  }
});