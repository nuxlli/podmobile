/**
 * Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://code.google.com/p/podmobile
 */

function d(object) {
  console.log($.toJSON(object));
}

function pyEval(code) {
  return $.evalJSON(application.pyEval(code));
}

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

jQuery.extend(String.prototype, {
  truncate: function(length, truncation) {
    length = length || 30;
    truncation = (typeof(truncation) == 'undefined') ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }
});

jQuery(document).ready(function() {
  try {
    $ = jQuery;

    // Information
    var info = {
      home_dir: pyEval("self.home_dir") + "/",
      default_img: "img/default.png",
      default_tn_img: "img/tn_default.png"
    };

    // Get elements
    var divs = {
      lcomments  : $('#lcomments'),
      thumb      : $('#thumb'),
      dialogs    : $('#dialogs'),
      dialog_new : $('#dialog_new'),
      list       : $('#list'),
      content    : $('#content'),
      tabs       : $('#tabs'),
      player     : $('#player')
    };

    // Tabs
    var tabs = {
      newpodcast : $('#newpodcast'),
      podcasts   : $('#podcasts'),
      downloads  : $('#downloads'),
      comments   : $('#comments'),
      favorites  : $('#favorites'),
      settings   : $('#settings')
    };

    // Connect database
    JazzRecord.adapter = new JazzRecord.Html5Adapter({dbFile: "podmobile.sqlite"});
    JazzRecord.migrate();

    // Shortcuts
    $(document).bind('keydown', {combi: 'r', disableInInput: true}, function() { document.location.reload(); });
    $(document).bind('keydown', {combi: 'n', disableInInput: true}, function() { dialog_new(); return false; });
    $(document).bind('keydown', 'Ctrl+r', function() { document.location.reload(); });

    // Import models
    //var Podcast = window.Podcast;
    //var Cast = window.Cast;

    // Visual Efects
    $('.list .up').animate({opacity: 0}, "slow")

    $('#controller a').mousedown(function() {
      $(this).animate({opacity: 0.3});
    }).mouseup(function() {
      $(this).animate({opacity: 1});
    });

    /**
     * Add podcast
     */
    var input_url = divs.dialog_new.find('input[id=url]');

    // Button new click
    function dialog_new() {
      divs.dialog_new.show();
      $.blockUI({
        message: divs.dialogs
      });
      $('.blockOverlay').click($.unblockUI);
      var size = input_url.val().length;
      input_url.focus().attr('disabled', false);
      input_url[0].setSelectionRange(size, size);
      input_url.bind('keydown', 'Esc', $.unblockUI);
      return false;
    };

    tabs.newpodcast.click(dialog_new);

    $('#form_new').submit(function() { newPodcast(); return false; } );
    function newPodcast() {
      try {
        var msg = function(message) {
          $('.blockMsg').animate({height: '60px'}).addClass('error').find('h2').show().html(message);
        }

        var url = input_url.val();
        if (window.regexp_link.test(url)) {
          msg("Connecting...");
          input_url.attr('disabled', true);

          var down = new Download({
            'url': url,
            finished: function() {
              msg('Processing...');
              var feed = this.url;
              var file = "file://" + this.filename;
              jQuery.getFeed({ url: file , success: function(feed) {
                if (feed.podcast) {
                  var p = Podcast.findByOrCreate("feed", input_url.val(), 0)
                  p.updateAttributes({
                    title       : feed.title,
                    link        : feed.link,
                    updated     : feed.updated,
                    description : feed.description,
                    img         : feed.itunes.image,
                    tn_img      : feed.itunes.image
                  });

                  /*
                  var destination = info.home_dir + p.id + "/img_default";
                  d(destination);
                  (new Download({
                    'url': feed.itunes.image,
                    filename : destination,
                    finished : function () {
                      p.img    = "file://" + destination;
                      p.tn_img = "file://" + destination;
                      p.save();
                    }
                  })).start();*/

                  /*
                  $('<img>').attr('src', p.img).preload({
                    notFound: info.default_img,
                    onFinish: function(result) {
                      alert(result.failed);
                      if (result.failed) {

                      }
                      else {

                      }
                    }
                  });*/

                  // TODO: Implementar o download da imagem
                  //p.img    = info.img_dir + p.id + ".png";
                  //p.tn_img = info.img_dir + "tn_" + p.id + ".png";
                  //divs.thumb.attr('src', p.img);
                  //p.save();

                  $(feed.items).each(function() {
                    var c = Cast.findByPodcastAndGuidOrCreate(p.id, this.id);

                    c.updateAttributes({
                      title  : this.title,
                      link   : this.link,
                      updated     : this.updated,
                      description : this.description,
                      url    : this.enclosure.url,
                      length : this.enclosure.length,
                      type   : this.enclosure.type
                    });
                  });

                  $.unblockUI();
                  loadList({ refresh: true });
                } else {
                  //input_url.attr('disabled', false);
                  msg('Não é um feed de podcast');
                }
              }});
            },

            started: function() {
              msg("Downloading...");
            },

            update: function(data) {
              d(this.filename + ":" + data);
            },

            error: function(e) {
              msg(e.message);
              input_url.attr('disabled', false);
            }
          });

          down.start();
        } else {
          msg("Invalid url, try again!");
        }
      } catch (e) {
        d(e);
      }
    }

    /**
     * Load list
     * TODO : Adicionar cache as listas
    */
    var contents = {
      podcasts: {
        title: 'Podcasts',
        img: 'img/icons/podcasts.png',
        numerable: 0,
        body: null
      },
      casts: []
    };

    function setContent(content) {
      divs.content.find('.numerable').html(content.numerable);
      divs.content.find('.title').html(content.title);
      divs.content.find('.img > img').attr('src', content.img);
      divs.content.find('ul').hide();
      content.body.show();
    }

    divs.list.click(function (event) {
      var list = event.toElement.nodeName == "LI" ? $(event.toElement) : $(event.toElement).parents('li.items');
      var data = list.data('list');
      switch(data.type) {
        case 'podcast':
          data.content.img = $(list).find('img').attr('src');
          //data.content.find('img').attr('src', $(list).find('img').attr('src'))
          setContent(data.content);
          break;
        case 'cast':
          divs.player.find('h1').html(data.podcast.title);
          divs.player.find('h2').html(data.cast.title);
          divs.thumb.attr('src', data.podcast.img);
      }
    });

    function loadList(options) {
      options = jQuery.extend({
        tab: $('#tabs .select'),
        refresh : false
      }, options);

      switch(options.tab.attr('id')) {
        case('podcasts'):
          if (options.refresh || contents.podcasts.body == null) {
            var podcasts = Podcast.all({order: 'title'});
            contents.podcasts.numerable =  podcasts.length;
            contents.podcasts.body = $('<ul></ul>');
            divs.list.find('.up').after(contents.podcasts.body)

            $(podcasts).each(function() {
              var $this     = this
              var last_cast = (this.casts.length > 0) ?
                (this.casts[0].updated + " - " + this.casts[0].title) : "No posts" ;

              var item = $(sprintf(
                                   '<li class="items"><img src="%s" /><h1>%s</h1><h2>%s</h2><h3>%s</h3></li>',
                                   this.tn_img,
                                   this.title.truncate(30),
                                   last_cast.truncate(50),
                                   this.casts.length
                                   ));

              contents.podcasts.body.append(item);
              //checkImg(divs.list.find('img:last'));

              contents.podcasts.body.find('img:last').preload({
                placeholder: "img/tn_default.png",
                notFound: "img/tn_default.png"
              });

              item.data('list', {
                type: 'podcast',
                content: loadCasts({
                  title : $this.title,
                  img   : this.img,
                  items : $this.casts,
                  podcast: this
                })
              })

              // TODO: Uma forma de fazer break
            });
          }
          setContent(contents.podcasts);
          break;
      }
    }

    // TODO: Obter o tamanho em minutos dos audios
    function loadCasts(data) {
      var content = {
        title: data.title,
        numerable: data.items.length,
        img: data.img,
        body: $('<ul></ul>')
      }

      divs.list.find('.up').after(content.body)

      $(data.items).each(function() {
        var item = $(sprintf(
                             '<li class="items"><img src="%s" /><h1>%s</h1><h2>%s</h2><h3>%s</h3></li>',
                             "img/tn_download.png",
                             this.title.truncate(30),
                             this.updated,
                             this.length == null ? "" : (this.length/1024/1024).toFixed(0)
                             ));

        item.data('list', {
          type: 'cast',
          cast: this,
          podcast: data.podcast
        })

        content.body.append(item);
      });

      return content;
    }

    divs.tabs.find('li[id!=newpodcast]').click(function() {
      divs.tabs.find('li.select').removeClass('select');
      $(this).addClass('select');
      loadList();
    });

    loadList();

    /**
     * Player
     */
    // Slider
    var slider = $('.slider').slider({ range: "min", min: 0, max: 100, value: 0 });
    var total  = 0;

    //player.setCurrentSource(info.sound_dir + '1/08_The Caretaker.mp3');

    function two(x) { return ((x>9)?"":"0")+x }

    function convertTime(ms) {
      var sec = Math.floor(ms/1000);
      var min = Math.floor(sec/60);
      var hr = Math.floor(min/60);
      sec = two(sec%60);
      min = two(min%60);
      hr  = two(hr%60);

      return (hr == 0 ? '' : hr + ":" ) + min + ":" + sec;
    }

    player.totalTimeChanged.connect(function(time) {
      total = time;
      $('#duration').html("00:00/" + convertTime(total));
    });

    player.tick.connect(function(time) {
    slider.slider("value", Math.floor(time*100/total));
      $('#duration').html(convertTime(time) + "/" + convertTime(total));
    });

    var bt_player = $('#bt_player').click(function() {
      (player.state() == 2) ? player.pause() : player.play();
    });

    player.stateChanged.connect(function(newstate, oldstate) {
      switch(player.state()) {
        //case("recording"):
        //  bt_comment.css("background-image", "url(img/bt_stop.png)")
        case(2): //paused
          bt_player.css("background-image", "url(img/bt_pause.png)");
          break;
        default:
          bt_player.css("background-image", "url(img/bt_player.png)");
          //bt_comment.css("background-image", "url(img/bt_comment.png)");
          break;
        // TODO: Zerar o slider quando o stopped for acionado
        //case("stopped"):
        //  slider.
      }
    });

    $('#loading').fadeOut(1000);

  } catch (e) {
    alert("Main: " + e);
  }
});
