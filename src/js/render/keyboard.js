import _ from 'lodash';

/**
 * A software interface for determining which keyboard keys are pressed.
 *
 * @param {Array || String} keyCodes A collection of all the (string) keyCodes used.
 */
function Keyboard(keyCodes, speed) {

  this.speed = speed;

  // If the keyCodes are a string, split them into an array.
  if (typeof keyCodes === 'string') {
    keyCodes = keyCodes.split(' ');
  }

  // Loop through the codes and set them as keys.
  this.keys = _.reduce(keyCodes, (collection, code) => {
    collection[code] = false;
    return collection;
  }, {});
}

Keyboard.prototype = { 

  /**
   * Creates and binds keyboard listener handlers for interactions.
   * @param  {Function} callback A method to call from within the handlers.
   * @param  {Object} context The object that will listen for keyboard events.
   */
  listen: function(callback, context = window) {

    /**
     * Creates a function bound to this Keyboard instance that
     * partially includes the callback argument.
     * @param  {Function} handler The core function that will be invoked.
     * @return {Function} A new bound and filled function.
     */
    var generateHandler = handler => _.bind(_.partialRight(handler, callback), this);

    // Configure bound listener handlers to ease removing later.
    this._boundHandleKeydown = generateHandler(this._handleKeydown);
    this._boundHandleKeyup = generateHandler(this._handleKeyup);

    // Listen for keyup and keydown to trigger interactions.
    context.addEventListener('keydown', this._boundHandleKeydown);
    context.addEventListener('keyup', this._boundHandleKeyup);
  },

  /**
   * Remove keyboard event listeners.
   * @param  {Object} context The object to remove the listeners from.
   */
  stopListening: function(context = window) {
    context.removeEventListener('keydown', this._boundHandleKeydown);
    context.removeEventListener('keyup', this._boundHandleKeyup);
  },

  getMovement: function() {

    var KB = Keyboard,
        keys = this.keys,
        x = 0,
        y = 0;

    // Detect either up or down movement.
    if (keys[KB.UP] || keys[KB.W]) {
      x = this.speed;
    }
    else if (keys[KB.DOWN] || keys[KB.S]) {
      x = -this.speed;
    }

    // Detect either left or right movement.
    if (keys[KB.LEFT] || keys[KB.A]) {
      y = this.speed;
    }
    else if (keys[KB.RIGHT] || keys[KB.D]) {
      y = -this.speed;
    }

    return {x, y};
  },

  _handleKeydown: function(evt, callback) {

    var keyCode = evt.keyCode,
        keys = this.keys;

    if (!_.isUndefined(keys[keyCode]) && !keys[keyCode]) {
      keys[keyCode] = true;
      if (callback) {
        callback();
      }
    }
  },

  _handleKeyup: function(evt, callback) {

    var keyCode = evt.keyCode;

    if (this.keys[keyCode]) {
      this.keys[keyCode] = false;
      if (callback) {
        callback();
      }
    }
  }

};

// Keyboard constants referencing keyCodes.
Keyboard.UP = '38';
Keyboard.DOWN = '40';
Keyboard.LEFT = '37';
Keyboard.RIGHT = '39';
Keyboard.W = '87';
Keyboard.A = '65';
Keyboard.S = '83';
Keyboard.D = '68';
Keyboard.SPACE = '32';
Keyboard.ESCAPE = '27';

export default Keyboard;
