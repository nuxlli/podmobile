/* jFeed : jQuery feed parser plugin
 * Copyright (C) 2007 Jean-François Hovinne - http://www.hovinne.com/
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */

jQuery.getFeed = function(options) {

    options = jQuery.extend({

        url: null,
        data: null,
        success: null

    }, options);

    if(options.url) {

        $.ajax({
            type: 'GET',
            url: options.url,
            data: options.data,
            dataType: 'xml',
            success: function(xml) {
                var feed = new JFeed(xml);
                if(jQuery.isFunction(options.success)) options.success(feed);
            }
        });
    }
};

function JFeed(xml) {
    if(xml) this.parse(xml);
};

JFeed.prototype = {

    type: '',
    version: '',
    title: '',
    link: '',
    description: '',
    parse: function(xml) {

        if(jQuery('channel', xml).length == 1) {

            this.type = 'rss';
            var feedClass = new JRss(xml);

        } else if(jQuery('feed', xml).length == 1) {

            this.type = 'atom';
            var feedClass = new JAtom(xml);
        }

        if(feedClass) jQuery.extend(this, feedClass);
    }
};

function JFeedItem() {};

JFeedItem.prototype = {

    title: '',
    link: '',
    description: '',
    updated: '',
    id: ''
};

function JAtom(xml) {
    this._parse(xml);
};

JAtom.prototype = {

    _parse: function(xml) {

        var channel = jQuery('feed', xml).eq(0);

        this.version = '1.0';
        this.title = jQuery(channel).find('title:first').text();
        this.link = jQuery(channel).find('link:first').attr('href');
        this.description = jQuery(channel).find('subtitle:first').text();
        this.updated = jQuery(channel).find('updated:first').text();

        this.items = new Array();

        var feed = this;

        jQuery('entry', xml).each( function() {

            var item = new JFeedItem();

            item.title = jQuery(this).find('title').eq(0).text();
            item.link = jQuery(this).find('link').eq(0).attr('href');
            item.description = jQuery(this).find('content').eq(0).text();
            item.updated = jQuery(this).find('updated').eq(0).text();
            item.id = jQuery(this).find('id').eq(0).text();

            feed.items.push(item);
        });
    }
};

function JRss(xml) {
    this._parse(xml);
};

JRss.prototype  = {

    _parse: function(xml) {

        var rss = jQuery('rss', xml);

        if(rss.length == 0) this.version = '1.0';
        else this.version = rss.eq(0).attr('version');

        // Check podcast
        this.podcast = rss.attr('xmlns:itunes') == 'http://www.itunes.com/dtds/podcast-1.0.dtd' ? true : false;

        var channel = jQuery('channel', xml).eq(0);

        this.title = channel.find('title:first').text();
        this.link  = channel.find('link:first').text();
        this.description = channel.find('description:first').text();
        this.language    = channel.find('language:first').text();
        this.updated     = channel.find('lastBuildDate:first').text();

        this.items = new Array();

        var feed = this;

        // Podcast information
        if (this.podcast) {
          feed.itunes = { };
          channel.find(' > *[prefix=itunes]').each(function() {
            var tag = jQuery(this);
            switch(this.localName) {
              case('owner'):
                feed.itunes.owner = {
                  name: tag.find('[localName=name]').text(),
                  email: tag.find('[localName=email]').text()
                };
                break;
              case('category'):
                feed.itunes.category = tag.attr('text');
                break;
              case('image'):
                feed.itunes.image = tag.attr('href');
                break;
              default:
                feed.itunes[this.localName] = tag.text();
            }
          });
        }

        jQuery('item', xml).each( function() {

            var item = new JFeedItem();
            var tag  = jQuery(this);

            item.title = tag.find('title').eq(0).text();
            item.link = tag.find('link').eq(0).text();
            item.description = tag.find('description').eq(0).text();
            item.updated = tag.find('pubDate').eq(0).text();
            item.id = tag.find('guid').eq(0).text();

            // Podcast information
            if (feed.podcast) {
              var enclosure = tag.find('enclosure').eq(0);
              item.enclosure = {
                url: enclosure.attr('url'),
                'length': enclosure.attr('length'),
                type: enclosure.attr('type')
              }

              item.itunes = { };
              tag.find('[prefix=itunes]').each(function() {
                item.itunes[this.localName] = jQuery(this).text();
              });
            }

            feed.items.push(item);
        });
    }
};
