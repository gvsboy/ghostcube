import _ from 'lodash';
import Hammer from 'hammerjs';

function Touch(speed) {
  this.speed = speed;
  this.queue = [];
  this.iface = new Hammer(context);

  // Configure the swipe gesture.
  this.iface
    .get('swipe')
    .set({
      direction: Hammer.DIRECTION_ALL,
      threshold: 0.1,
      velocity: 0.1
    });
}

Touch.prototype = {

  listen: function(callback) {
    this._boundHandleSwipe = _.bind(_.partialRight(this._handleSwipe, callback), this);
    this.iface.on('swipe', this._boundHandleSwipe);
  },

  stopListening: function() {
    this.iface.off('swipe', this._boundHandleSwipe);
  },

  getMovement: function() {

    var movement = this.queue.shift(),
        x = 0,
        y = 0;

    switch (movement) {
      case Touch.UP:
        x = -this.speed;
        break;
      case Touch.DOWN:
        x = this.speed;
        break;
      case Touch.LEFT:
        y = this.speed;
        break;
      case Touch.RIGHT:
        y = -this.speed;
        break;
    }

    return {x, y};
  },

  _handleSwipe: function(evt, callback) {
    this.queue.push(evt.offsetDirection);
    if (callback) {
      callback();
    }
  }

};

Touch.UP = Hammer.DIRECTION_UP;
Touch.DOWN = Hammer.DIRECTION_DOWN;
Touch.LEFT = Hammer.DIRECTION_LEFT;
Touch.RIGHT = Hammer.DIRECTION_RIGHT;

export default Touch;
