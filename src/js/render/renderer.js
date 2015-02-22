function Renderer(cube, isMobile) {

  // A reference to the game cube.
  this.cube = cube;

  // The keyboard interface for desktop interactions.
  this.keyboard = null;

  // And this is for touch interactions.
  this.touch = null;

  // The speed to animate the X axis.
  this.moveX = 0;

  // The speed to animate the Y axis.
  this.moveY = 0;

  // The total number of steps to animate a rotation.
  this.tickMax = 90;

  // The number of rendering steps left to animate.
  this.tick = 0;

  // How fast each tick animates.
  this.speed = 5;

  // Is the client a mobile device?
  this.isMobile = isMobile;

  // EventEmitter constructor call.
  EventEmitter2.call(this);
}

Renderer.prototype = {

  initialize: function() {
    if (this.isMobile) {
      this._listenForTouch();
    }
    else {
      this._listenForKeyboard();
    }
    this.cube.setRenderer(this);
  },

  draw: function() {

    // Reduce the ticks and rotate the cube
    this.tick -= this.speed;
    this.cube.rotate(this.moveX, this.moveY);

    // If there are ticks left or a key is down, keep looping.
    if (this.tick > 0 || this._setMovement()) {
      this._loop();
    }

    else {
      this.emit('end');

      //debug
      var x = this.cube.x, y = this.cube.y;
      console.log('CUBE x, y:', x, y);
      var sides = _.filter(this.cube.getSides(), function(side) {
        return side.isVisible(x, y);
      });
      console.log('visible:', _.pluck(sides, 'id'));
    }
  },

  /**
   * A public interface for manually setting the movement.
   * @param {Number} x The target x coordinate.
   * @param {Number} y The target y coordinate.
   * @return {Promise} A promise to be fulfilled when the movement animation ends.
   */
  setMovement: function(x, y) {

    /**
     * Configure a move in one direction and start the render loop.
     * @param {Number} tick The distance to rotate.
     * @param {String} coorProp Which coordinate to rotate on (moveX or moveY).
     */
    var move = _.bind((tick, coorProp) => {
      this.tick = tick;
      this[coorProp] = tick < 0 ? -this.speed : this.speed;
      this._loop();
    }, this);

    // Return a promise that will resolve when both x and y movements are complete.
    return new Promise((resolve) => {
      move(x, 'moveX');
      this.once('end', () => {
        move(y, 'moveY');
        this.once('end', resolve);
      });
    });
  },

  _listenForKeyboard: function() {

    this.keyboard = new Keyboard([
      Keyboard.UP,
      Keyboard.DOWN,
      Keyboard.LEFT,
      Keyboard.RIGHT,
      Keyboard.W,
      Keyboard.A,
      Keyboard.S,
      Keyboard.D
    ]);

    // Listen for keystrokes.
    this.keyboard.listen(window, this._movementListener.bind(this));
  },

  _listenForTouch: function() {
    this.touch = new Touch();
    this.touch.listen(document.body, this._movementListener.bind(this));
  },

  _loop: function() {
    window.requestAnimationFrame(this.draw.bind(this));
  },

  _movementListener: function() {
    if (this.tick === 0 && this._setMovement()) {
      this._loop();
      this.emit('start');
    }
  },

  _setMovement: function() {

    // reset movex and movey
    this.moveX = this.moveY = 0;

    // Set the movement direction depending on the environment.
    if (this.isMobile) {
      this._setTouchMovement();
    }
    else {
      this._setKeyboardMovement();
    }

    // If there is movement, set tick and return true.
    if (this.moveX !== 0 || this.moveY !== 0) {
      this.tick = this.tickMax;
      return true;
    }

    // Movement was not set.
    return false;
  },

  _setKeyboardMovement: function() {

    var KB = Keyboard,
        keys = this.keyboard.keys;

    // Detect either up or down movement.
    if (keys[KB.UP] || keys[KB.W]) {
      this.moveX = this.speed;
    }
    else if (keys[KB.DOWN] || keys[KB.S]) {
      this.moveX = -this.speed;
    }

    // Detect either left or right movement.
    if (keys[KB.LEFT] || keys[KB.A]) {
      this.moveY = this.speed;
    }
    else if (keys[KB.RIGHT] || keys[KB.D]) {
      this.moveY = -this.speed;
    }
  },

  _setTouchMovement: function() {

    var movement = this.touch.queue.shift();

    switch (movement) {
      case Touch.UP:
        this.moveX = -this.speed;
        break;
      case Touch.DOWN:
        this.moveX = this.speed;
        break;
      case Touch.LEFT:
        this.moveY = this.speed;
        break;
      case Touch.RIGHT:
        this.moveY = -this.speed;
        break;
    }
  }

};

// Mixin the EventEmitter methods for great justice.
// Ditch when we migrate to Browserify.
_.assign(Renderer.prototype, EventEmitter2.prototype);
