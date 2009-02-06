/**
 * Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://code.google.com/p/podmobile
 */

function podMobile() {
    // Connect database
    window.database = plugin("Database");
    database.bases_folder = this.info.home_dir;
    JazzRecord.adapter = new JazzRecord.Html5Adapter({dbFile: "podmobile.sqlite"});
    JazzRecord.migrate();

    this.init_player();
    //this.loadPlayer();
    //this.loadList();

    // Hidde splash
    $('.init_hide').css('visibility', 'visible');
    $('#loading').fadeOut(1000);
}

jQuery.extend(podMobile.prototype, {
    // Information
    info : {
      home_dir: pyEval("self.home_dir") + "/",
      default_img: "img/default.png",
      default_tn_img: "img/tn_default.png"
    },

    // Get elements
    divs : {
      lcomments  : $('#lcomments'),
      thumb      : $('#thumb'),
      dialogs    : $('#dialogs'),
      dialog_new : $('#dialog_new'),
      list       : $('#list'),
      content    : $('#content'),
      tabs       : $('#tabs'),
      player     : $('#player')
    },

    // Tabs
    tabs : {
      newpodcast : $('#newpodcast'),
      podcasts   : $('#podcasts'),
      downloads  : $('#downloads'),
      comments   : $('#comments'),
      favorites  : $('#favorites'),
      settings   : $('#settings')
    },

    /**
     * Initialize player
     */
    init_player: function() {
      var $this = this
      this.player = plugin("Player");

      // Slider
      var slider = document.slider;
      var total  = 0;
      slider.valueChanged.connect(function(value) {
        $this.player.seek(total*value/100);
      });

      this.player.setCurrentSource('/home/nuxlli/Downloads/nerdcast_032_jogosdetabuleiro.mp3');

      this.player.totalTimeChanged.connect(function(time) {
        total = time;
        $('#duration').html("00:00/" + convertTime(total));
      });

      this.player.tick.connect(function(time) {
        slider.value = Math.floor(time*100/total);
        $('#duration').html(convertTime(time) + "/" + convertTime(total));
      });

      var bt_player = $('#bt_player').click(function() {
        ($this.player.state() == 2) ? $this.player.pause() : $this.player.play();
      });

      this.player.stateChanged.connect(function(newstate, oldstate) {
        switch($this.player.state()) {
          case(2): //paused
            bt_player.css("background-image", "url(img/bt_pause.png)");
            break;
          default:
            bt_player.css("background-image", "url(img/bt_player.png)");
            break;
        }
      });
    }

});

var main = new podMobile();
