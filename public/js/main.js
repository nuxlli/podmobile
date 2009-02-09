/**
 * Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://code.google.com/p/podmobile
 */

function podMobile() {
    var $this = this;

    // Connect database
    window.database = Eibox.plugin("Database");
    database.bases_folder = this.info.home_dir;
    JazzRecord.adapter = new JazzRecord.Html5Adapter({dbFile: "podmobile.sqlite"});
    JazzRecord.migrate();

    // Shortcuts
    $(document).bind('keydown', {combi: 'r', disableInInput: true}, function() { document.location.reload(); });
    $(document).bind('keydown', {combi: 'n', disableInInput: true}, function() { dialog_new(); return false; });
    $(document).bind('keydown', 'Ctrl+r', function() { document.location.reload(); });

    // Buttons tabs
    this.divs.tabs.find('li[id!=newpodcast]').click(function() {
        $this.divs.tabs.find('li.select').removeClass('select');
        $(this).addClass('select');
        $this.loadList();
    });

    // List
    this.divs.list.find('li').live('click', function (event) {
        var list = event.toElement.nodeName == "LI" ? $(event.toElement) : $(event.toElement).parents('li.items');
        var data = list.data('list');

        $this.list_restart_itens();
        list.addClass('select');

        switch(data.type) {
            case 'podcast':
                data.content.img = list.find('img').attr('src');
                //data.content.find('img').attr('src', $(list).find('img').attr('src'))
                $this.setContent(data.content);
                break;
            case 'cast':
                // Actions
                if (event.toElement.nodeName == "IMG") {
                    var id = $(event.toElement).parent().attr('id');

                    if (Eibox.empty(data.down) && (id == 'download' || id == 'download_pause')) {
                        if (data.cast.local == null) {
                            data.cast.local = $this.info.home_dir + data.podcast.sanitize + '/' +
                                              data.cast.id + '_' + Eibox.os.path.basename(data.cast.url)
                            data.cast.save()
                        }

                        data.down = Eibox.plugin("Download", data.cast.url, data.cast.local, true);
                        data.down.downloadProgress.connect(function(bytesReceived, bytesTotal) {
                            var percent = (bytesReceived*100/bytesTotal).toFixed(0);
                            //data.cast.update_percent(percent, list);
                            list.find('h3').html("%s".sprintf(percent) + "%")
                            //data.cast.percent = percent;
                            //data.cast.save();
                        });
                        data.down.statusChanged.connect(function() {
                            data.cast.download = data.down.status;
                            data.cast.save();
                        });
                    }

                    switch(id) {
                        case('favorite_add'):
                            data.cast.favorite = true;
                            data.cast.save();
                            $this.contents.favorites.items.push(list);
                            $this.loadList();
                            break;
                        case('favorite_del'):
                            data.cast.favorite = false;
                            data.cast.save();
                            $this.contents.favorites.items = jQuery.grep($this.contents.favorites.items, function(n) {
                               return $(n).attr('id') != list.attr('id');
                            });
                            $this.loadList();
                            break;
                        case('play'):
                            if (data.cast.download == "download" && data.cast.local != null) {
                                $this.current_player = {
                                    podcast : data.padcast,
                                    cast    : data.cast,
                                    podcast_line : data.podcast_line,
                                    cast_line    : list
                                };

                                $this.divs.player.find('h1').html(data.podcast.title);
                                $this.divs.player.find('h2').html(data.cast.title);
                                $this.divs.thumb.attr('src', data.podcast.img);
                                $this.player.setCurrentSource(data.cast.local);
                            }
                            $this.player.play();
                            $this.loadList();
                            return;
                        case('download'):
                            data.down.start();
                            $this.contents.downloads.items.push(list);
                            $this.loadList();
                            return;
                        case('download_pause'):
                            data.down.pause();
                            $this.contents.downloads.items.push(list);
                            $this.loadList();
                            return;
                        case('download_exclude'):
                            if (!Eibox.empty(data.down)) {
                                data.down.stop();
                                data.down = null;
                            }
                            data.cast.exclude_download();
                            $this.contents.downloads.items = jQuery.grep($this.contents.downloads.items, function(n) {
                               return $(n).attr('id') != list.attr('id');
                            });
                            $this.loadList();
                            return;
                    }
                }

                $this.item_opened.item = list;
                $this.item_opened.content = list.html();

                list.addClass('options');
                var button  = '<a href="#%1$s" class="itembutton" id="%1$s"><img src="img/tn_%1$s.png"/></a>';
                var buttons = "";

                // TODO: suporte a erro de download
                switch(data.cast.download) {
                    case('downloading'):
                        buttons += sprintf(button, 'download_pause');
                        buttons += sprintf(button, 'download_exclude');
                        break;
                    case('paused'):
                    case('error'):
                        buttons += sprintf(button, 'download');
                        buttons += sprintf(button, 'download_exclude');
                        break;
                    case('download'):
                        buttons += sprintf(button, 'download_exclude');
                        buttons += sprintf(button, 'play');
                        break;
                    default:
                        buttons += sprintf(button, 'download');
                        break;
                }

                if (data.cast.favorite)
                    buttons += sprintf(button, 'favorite_del');
                else
                    buttons += sprintf(button, 'favorite_add');

                list.html(buttons);
        }
    })

    $('#list > .scrollable').touchscroll({
        up   : $('#list > .up'),
        down : $("#list > .down")
    });

    this.loadList();
    //this.init_player();

    // Hidde splash
    $('.init_hide').css('visibility', 'visible');
    //$('#loading').fadeOut(1000);
}

jQuery.extend(podMobile.prototype, {
    // Information
    info : {
        home_dir: Eibox.pyEval("self.home_dir") + "/",
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
        player     : $('#player'),
        showitems  : $('#showitems'),
        hidenitems : $('#hidenitems')
    },

    // Tabs
    tabs : {
        newpodcast : $('#newpodcast'),
        podcasts   : $('#podcasts'),
        downloads  : $('#downloads'),
        commenteds : $('#commenteds'),
        favorites  : $('#favorites'),
        settings   : $('#settings')
    },


    /**
     * Load list
     */
    contents : {
        podcasts: {
            title: 'Podcasts',
            img: 'img/icons/podcasts.png',
            items: []
        },
        downloads: {
            title: 'Downloads',
            img: 'img/icons/downloads.png',
            items: []
        },
        commenteds: {
            title: 'Commenteds',
            img: 'img/icons/commenteds.png',
            items: []
        },
        favorites: {
            title: 'Favorites',
            img: 'img/icons/favorites.png',
            items: []
        },
        casts: []
    },

    item_opened : {
        item: null,
        content: null
    },

    list_restart_itens : function() {
        this.divs.list.find('li').removeClass('select options');
        
        if (this.item_opened.item != null) {
           this.item_opened.item.html(this.item_opened.content);
           this.item_opened.item = null;
        }
    },
    
    current_player : null,

    set_item_select_by_played: function() {
        if (!Eibox.empty(this.current_player)) {
            this.current_player.podcast_line.addClass('select');
            this.current_player.cast_line.addClass('select');
        }
    },

    setContent: function(content) {
        var $this = this;

        this.divs.content.find('.numerable').html(content.items.length);
        this.divs.content.find('.title').html(content.title);
        this.divs.content.find('.img > img').attr('src', content.img);

        $this.list_restart_itens();

        $this.divs.showitems.find('li').each(function() {
            $this.divs.hidenitems.append(this);
        });

        $(content.items).each(function() {
            $this.divs.showitems.append(this);
        });

        $this.set_item_select_by_played();
        $('#list > .scrollable').touchscroll("toTop");
    },

    loadList: function(options) {
        var $top = this

        options = jQuery.extend({
            tab: $('#tabs .select'),
            refresh : false
        }, options);

        switch(options.tab.attr('id')) {
            case('podcasts'):
                if (options.refresh || $top.contents.podcasts.items.length == 0) {
                    var podcasts = Podcast.all({order: 'title'});

                    $(podcasts).each(function() {
                        var $this     = this
                        var last_cast = (this.casts.length > 0) ?
                        (this.casts[0].updated + " - " + this.casts[0].title) : "No posts" ;

                        var item = $(sprintf(
                                   '<li id="%s" class="items"><img src="%s" /><h1>%s</h1><h2>%s</h2><h3>%s</h3></li>',
                                   this.id,
                                   this.tn_img,
                                   this.title.truncate(30),
                                   last_cast.truncate(50),
                                   this.casts.length
                                   ));

                        item.find('img:last').preload({
                            placeholder: "img/tn_default.png",
                            notFound: "img/tn_default.png"
                        });

                        item.data('list', {
                            type: 'podcast',
                            content: $top.loadCasts({
                                title   : $this.title,
                                img     : $this.img,
                                items   : $this.casts,
                                podcast : $this,
                                podcast_line : item
                            })
                        })

                        $top.contents.podcasts.items.push(item);

                        // TODO: Uma forma de fazer break
                    });
                }
                $top.setContent($top.contents.podcasts);
                break;
            default:
                $top.setContent($top.contents[options.tab.attr('id')]);
        }
    },

    // TODO: Obter o tamanho em minutos dos audios
    loadCasts : function(data) {
        var $top = this
        var content = {
            title: data.title,
            numerable: data.items.length,
            img: data.img,
            items: []
        }

        $(data.items).each(function() {
            var item = $(sprintf(
                             '<li id="%s" class="items"><img src="%s" /><h1>%s</h1><h2>%s</h2><h3>%s</h3></li>',
                             this.id,
                             "img/tn_download.png",
                             this.title.truncate(30),
                             this.updated,
                             //this.length == null ? "" : (this.length/1024/1024).toFixed(0)
                             this.getPercent()
                             ));

            item.data('list', {
                type: 'cast',
                cast: this,
                download: null,
                podcast_line : data.podcast_line,
                podcast: data.podcast
            })

            if (!Eibox.empty(this.download)) {
                $top.contents.downloads.items.push(item);
            }

            if (this.favorite) {
                $top.contents.favorites.items.push(item);
            }

            //$top.contents.favorites.body.append(item);
            content.items.push(item);
        });

        return content;
    },

    /**
     * Initialize player
     */
    init_player: function() {
        var $this = this
        this.player = Eibox.plugin("Player");

        // Slider
        var slider = document.slider;
        var total  = 0;
        slider.valueChanged.connect(function(value) {
            $this.player.seek(total*value/100);
        });

        //this.player.setCurrentSource('/home/nuxlli/Downloads/nerdcast_032_jogosdetabuleiro.mp3');

        this.player.totalTimeChanged.connect(function(time) {
            total = time;
            slider.value = 0;
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
