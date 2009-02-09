;(function($) {
  
    $.fn.touchscroll = function(options) {
        if (typeof(options) == "string" && options == "toTop") {
          options = { toTop: true }
        }

        options = $.extend($.fn.touchscroll.defaults, options);
     
        return $(this).each(function( ) {
            var self = $(this);
            var theScroller = self.data('__scroll__');

            if (typeof(theScroller) == 'undefined') {
                self.data('options', options);
                theScroller = new Scroll(self);
                self.data('__scroll__', theScroller);
                self.bind('dragstart', theScroller.start )
                       .bind('drag', theScroller.drag )
                       .bind('dragend', theScroller.end );
            } else {
              options = $.extend(options, self.data('options'));
              self.data('options', options);
            }

            if (options.toTop)
                theScroller.toTop();
        });  
    };

    $.fn.touchscroll.defaults = {
          topTop: true,
          img_up: null,
          img_down: null
    }

    Scroll = function( to ) {
        var self = this;

        self.to = to;
        self.options = self.to.data('options');
        self.position = 0;
        self.cursorOffsetY = false;
        self.max = 0;
        self.cont = 0;

        self.inter_to = $('<div></div>');
        self.inter_to.css({ position: 'relative' });
        self.inter_to.append(self.to.children());
        self.to.append(self.inter_to);

        this.animate = function(top, options) {
            self.inter_to.animate({ 'top': top + "px" }, options);
            var data = self.to.data('options');

            // TODO : Remover as setas quando o contéudo for menor

            if (data.up != null && self.position >= 0) {
                data.up.css({ opacity: '0.2'});
            } else {
                data.up.css({ opacity: '1.0'});
            }

            if (data.down != null && self.position <= self.max) {
                data.down.css({ opacity: '0.2'});
            } else {
                data.down.css({ opacity: '1.0'});
            }
        }

        this.toTop = function() {
            self.position = 0;
            self.getMax();
            self.animate(0, { duration: 'fast' });
        }

        this.getMax = function() {
            return self.max = self.to.css('height').replace(/[^0-9]/g, '') - self.inter_to.css('height').replace(/[^0-9]/g, '');
            //return self.max;
        }

        this.toTop();

        this.start = function(event) {
            self.cursorOffsetY = event.clientY;
            self.getMax();
            self.cont = 0;
        }

        this.end   = function(event) {
            var distance = (event.clientY - self.cursorOffsetY);
            distance = ((-self.cont/100)+1)*distance
            self.scroll(distance);
            self.cursorOffsetY = 0;
        }

        this.drag = function(event) {
            self.cont++;
        }

        this.scroll = function(distance) {
            self.position += distance; 
            self.inter_to.stop();

            if (self.position > 0) {
                self.position = 0;
                self.animate(40, function() {
                    self.animate(0);
                });
            } else if(self.position < self.max) {
                self.position = self.max;
                self.animate(self.max + -40, function() {
                    self.animate(self.max);
                });
            } else {
              self.animate(self.position , { duration: "slow" });
            }
        }      
    }
  
})(jQuery);

