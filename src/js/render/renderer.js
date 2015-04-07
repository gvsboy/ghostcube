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
      this._input = new Touch(this.speed);
    }
    else {
      this._input = new Keyboard([
        Keyboard.UP,
        Keyboard.DOWN,
        Keyboard.LEFT,
        Keyboard.RIGHT,
        Keyboard.W,
        Keyboard.A,
        Keyboard.S,
        Keyboard.D
      ], this.speed);
    }

    this.cube.setRenderer(this);
  },

  /**
   * Stops the input listening function from calculating a render.
   */
  listenForInput: function() {
    this._input.listen(this._movementListener.bind(this));
  },

  /**
   * Allows the input listening function to calculate renders.
   */
  stopListeningForInput: function() {
    this._input.stopListening();
  },

  draw: function() {

    // Reduce the ticks and rotate the cube
    this.tick -= this.speed;
    this.cube.rotate(this.moveX, this.moveY);

    // If there are ticks left or a key is down, keep looping.
    if (this.tick > 0 || this._setMovementFromInput()) {
      this._loop();
    }

    // Otherwise, broadcast an event signifying that the rendering has completed.
    else {
      this.emit('end');
    }
  },

  /**
   * A public interface for manually setting the movement.
   * @param {Number} x The target x coordinate.
   * @param {Number} y The target y coordinate.
   * @return {Promise} A promise that resolves when the movement animation ends.
   */
  setMovement: function(x, y) {

    /**
     * Configure a move in one direction and start the render loop.
     * @param {Number} tick The distance to rotate.
     * @param {String} coorProp Which coordinate to rotate on (moveX or moveY).
     */
    var move = (tick, coorProp) => {
      this.tick = Math.abs(tick);
      this[coorProp] = !tick ? 0 : tick < 0 ? -this.speed : this.speed;
      this._loop();
    };

    // Return a promise that will resolve when both x and y movements are complete.
    return new Promise(resolve => {
      move(x, 'moveX');
      this.once('end', () => {
        move(y, 'moveY');
        this.once('end', resolve);
      });
    });
  },

  setSyncMovement: function(x = 0, y = 0) {

    var speed = this.speed;

    return new Promise(resolve => {
      this.tick = Math.max(x, y);
      this.moveX = x === 0 ? 0 : x < 0 ? -speed : speed;
      this.moveY = y === 0 ? 0 : y < 0 ? -speed : speed;
      this._loop();
      this.once('end', resolve);
    });
  },

  _loop: function() {
    window.requestAnimationFrame(this.draw.bind(this));
  },

  _movementListener: function() {
    if (this.tick <= 0 && this._setMovementFromInput()) {
      this._loop();
      this.emit('start');
    }
  },

  _setMovementFromInput: function() {

    var movement = this._input.getMovement();
    this.moveX = movement.x;
    this.moveY = movement.y;

    // If there is movement, set tick and return true.
    if (this.moveX !== 0 || this.moveY !== 0) {
      this.tick = this.tickMax;
      return true;
    }

    // Movement was not set.
    return false;
  }

};

// Mixin the EventEmitter methods for great justice.
// Ditch when we migrate to Browserify.
_.assign(Renderer.prototype, EventEmitter2.prototype);
