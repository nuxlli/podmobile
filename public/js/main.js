/**
 * Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://code.google.com/p/podmobile
 */

function podMobile($) {
    var self = this;

    // Information
    self.info = {
        home_dir: Eibox.pyEval("self.home_dir") + "/",
        default_img: "img/default.png",
        default_tn_img: "img/tn_default.png"
    }

    // Get elements
    self.divs = {
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
    }

    // Tabs
    self.tabs = {
        newpodcast : $('#newpodcast'),
        podcasts   : $('#podcasts'),
        downloads  : $('#downloads'),
        commenteds : $('#commenteds'),
        favorites  : $('#favorites'),
        settings   : $('#settings')
    }

    self.current_player = null;
    
    self.contents = {
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
    }

    self.item_opened = {
        item: null,
        content: null
    }

    self.input_url = $('#url');

    self.__init__ = function() {
        // Connect database
        window.database = Eibox.plugin("Database");
        database.bases_folder = self.info.home_dir;
        JazzRecord.adapter = new JazzRecord.Html5Adapter({dbFile: "podmobile.sqlite"});
        JazzRecord.migrate();

        // Shortcuts
        $(document).bind('keydown', {combi: 'r', disableInInput: true}, function() { document.location.reload(); });
        $(document).bind('keydown', {combi: 'n', disableInInput: true}, function() { self.dialog_new(); return false; });
        $(document).bind('keydown', 'Ctrl+r', function() { document.location.reload(); });

        // Buttons tabs
        self.divs.tabs.find('li[id!=newpodcast]').click(function() {
            self.divs.tabs.find('li.select').removeClass('select');
            $(this).addClass('select');
            self.loadList();
        });

        // New Feed
        self.tabs.newpodcast.click(self.dialog_new);
        $('#form_new').submit(function() { self.newPodcast(); return false; } )

        // List
        self.divs.list.find('li').live('click', self.item_click);

        $('#list > .scrollable').touchscroll({
            up   : $('#list > .up'),
            down : $("#list > .down")
        });

        self.loadList();
        self.init_player();

        // Hidde splash
        $('.init_hide').css('visibility', 'visible');
        //$('#loading').fadeOut(1000);
    }

    //-------------------------------------------------------------
    // Metodos
    self.item_click = function (event) {
        var list = event.toElement.nodeName == "LI" ? $(event.toElement) : $(event.toElement).parents('li.items');
        var data = list.data('list');

        self.list_restart_itens();
        list.addClass('select');

        switch(data.type) {
            case 'podcast':
                data.content.img = list.find('img').attr('src');
                //data.content.find('img').attr('src', $(list).find('img').attr('src'))
                self.setContent(data.content);
                break;
            case 'cast':
                // Actions
                if (event.toElement.nodeName == "IMG") {
                    var id = $(event.toElement).parent().attr('id');

                    if (Eibox.empty(data.down) && (id == 'download' || id == 'download_pause')) {
                        if (data.cast.local == null) {
                            data.cast.local = self.info.home_dir + data.podcast.sanitize + '/' +
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
                            self.contents.favorites.items.push(list);
                            self.loadList();
                            break;
                        case('favorite_del'):
                            data.cast.favorite = false;
                            data.cast.save();
                            self.contents.favorites.items = jQuery.grep(self.contents.favorites.items, function(n) {
                               return $(n).attr('id') != list.attr('id');
                            });
                            self.loadList();
                            break;
                        case('play'):
                            if (data.cast.download == "download" && data.cast.local != null) {
                                self.current_player = {
                                    podcast : data.padcast,
                                    cast    : data.cast,
                                    podcast_line : data.podcast_line,
                                    cast_line    : list
                                };

                                self.divs.player.find('h1').html(data.podcast.title);
                                self.divs.player.find('h2').html(data.cast.title);
                                self.divs.thumb.attr('src', data.podcast.img);
                                self.player.setCurrentSource(data.cast.local);
                            }
                            self.player.play();
                            self.loadList();
                            return;
                        case('download'):
                            data.down.start();
                            self.contents.downloads.items.push(list);
                            self.loadList();
                            return;
                        case('download_pause'):
                            data.down.pause();
                            self.contents.downloads.items.push(list);
                            self.loadList();
                            return;
                        case('download_exclude'):
                            if (!Eibox.empty(data.down)) {
                                data.down.stop();
                                data.down = null;
                            }
                            data.cast.exclude_download();
                            self.contents.downloads.items = jQuery.grep(self.contents.downloads.items, function(n) {
                               return $(n).attr('id') != list.attr('id');
                            });
                            self.loadList();
                            return;
                    }
                }

                self.item_opened.item = list;
                self.item_opened.content = list.html();

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
    }

    /**
     * Load list
     */
    self.list_restart_itens = function() {
        self.divs.list.find('li').removeClass('select options');
        
        if (self.item_opened.item != null) {
           self.item_opened.item.html(self.item_opened.content);
           self.item_opened.item = null;
        }
    }
    

    self.set_item_select_by_played = function() {
        if (!Eibox.empty(self.current_player)) {
            self.current_player.podcast_line.addClass('select');
            self.current_player.cast_line.addClass('select');
        }
    }

    self.setContent = function(content) {
        self.divs.content.find('.numerable').html(content.items.length);
        self.divs.content.find('.title').html(content.title);
        self.divs.content.find('.img > img').attr('src', content.img);

        self.list_restart_itens();

        self.divs.showitems.find('li').each(function() {
            self.divs.hidenitems.append(this);
        });

        $(content.items).each(function() {
            self.divs.showitems.append(this);
        });

        self.set_item_select_by_played();
        $('#list > .scrollable').touchscroll("toTop");
    }

    self.loadList = function(options) {
        options = jQuery.extend({
            tab: $('#tabs .select'),
            refresh : false
        }, options);

        switch(options.tab.attr('id')) {
            case('podcasts'):
                if (options.refresh || self.contents.podcasts.items.length == 0) {
                    var podcasts = Podcast.all({order: 'title'});

                    $(podcasts).each(function() {
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
                            content: self.loadCasts({
                                title   : this.title,
                                img     : this.img,
                                items   : this.casts,
                                podcast : this,
                                podcast_line : item
                            })
                        })

                        self.contents.podcasts.items.push(item);

                        // TODO: Uma forma de fazer break
                    });
                }
                self.setContent(self.contents.podcasts);
                break;
            default:
                self.setContent($top.contents[options.tab.attr('id')]);
        }
    }

    // TODO: Obter o tamanho em minutos dos audios
    self.loadCasts = function(data) {
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
                self.contents.downloads.items.push(item);
            }

            if (this.favorite) {
                self.contents.favorites.items.push(item);
            }

            //$top.contents.favorites.body.append(item);
            content.items.push(item);
        });

        return content;
    }

    // TODO : Implementar a opção de novo feed
    self.dialog_new = function() {
        self.divs.dialog_new.show();
        $.blockUI({
            message: self.divs.dialogs
        });
        $('.blockOverlay').click($.unblockUI);
        var size = self.input_url.val().length;
        self.input_url.focus().attr('disabled', false);
        self.input_url[0].setSelectionRange(size, size);
        self.input_url.bind('keydown', 'Esc', $.unblockUI);
        return false;
    }

    self.newPodcast = function() {
        var msg = function(message) {
          $('.blockMsg').animate({height: '60px'}).addClass('error').find('h2').show().html(message);
        };

        var url = self.input_url.val();
        if (window.regexp_link.test(url)) {
            msg("Connecting...");
            self.input_url.attr('disabled', true);
        } else {
            msg("Invalid url, try again!");
        }
    }

    /**
     * Initialize player
     */
    self.init_player = function() {
        self.player = Eibox.plugin("Player");

        // Slider
        var slider = document.slider;
        var total  = 0;
        slider.valueChanged.connect(function(value) {
            self.player.seek(total*value/100);
        });

        //this.player.setCurrentSource('/home/nuxlli/Downloads/nerdcast_032_jogosdetabuleiro.mp3');

        self.player.totalTimeChanged.connect(function(time) {
            total = time;
            slider.value = 0;
            $('#duration').html("00:00/" + convertTime(total));
        });

        self.player.tick.connect(function(time) {
            slider.value = Math.floor(time*100/total);
            $('#duration').html(convertTime(time) + "/" + convertTime(total));
        });

        var bt_player = $('#bt_player').click(function() {
            (self.player.state() == 2) ? self.player.pause() : self.player.play();
        });

        self.player.stateChanged.connect(function(newstate, oldstate) {
            switch(self.player.state()) {
                case(2): //paused
                    bt_player.css("background-image", "url(img/bt_pause.png)");
                    break;
                default:
                    bt_player.css("background-image", "url(img/bt_player.png)");
                    break;
            }
        });
    }
    
    // Get Initialize
    self.__init__();
}

var main = new podMobile(jQuery);
