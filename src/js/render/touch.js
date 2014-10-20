function Touch() {
  this.queue = [];
}

Touch.prototype = {

  listen: function(context, callback) {

    var iface = new Hammer(context || document.body),
        queue = this.queue;

    iface.on('swipe', function(evt) {
      queue.push(evt.offsetDirection);
      if (callback) {
        callback();
      }
    });
  }

};

Touch.UP = Hammer.DIRECTION_UP;
Touch.DOWN = Hammer.DIRECTION_DOWN;
Touch.LEFT = Hammer.DIRECTION_LEFT;
Touch.RIGHT = Hammer.DIRECTION_RIGHT;
