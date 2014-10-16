function Renderer(cube, isMobile) {

  // A reference to the game cube.
  this.cube = cube;

  // The keyboard interface for desktop interactions.
  this.keyboard = null;

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
}

Renderer.prototype = {

  initialize: function() {

    // Only account for desktop experiences for now.
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
    this.keyboard.listen(window, this._keyboardListener.bind(this));
  },

  draw: function() {

    // Reduce the ticks and rotate the cube
    this.tick -= this.speed;
    this.cube.rotate(this.moveX, this.moveY);

    // If there are ticks left or a key is down, keep looping.
    if (this.tick > 0 || this._setMovement()) {
      this._loop();
    }
  },

  _loop: function() {
    window.requestAnimationFrame(this.draw.bind(this));
  },

  _keyboardListener: function() {
    if (this.tick === 0 && this._setMovement()) {
      this._loop();
      this.cube.emit('renderstart');
    }
  },

  _setMovement: function() {

    var KB = Keyboard,
        keys = this.keyboard.keys;

    // reset movex and movey
    this.moveX = this.moveY = 0;

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

    // If there is movement, set tick and return true.
    if (this.moveX !== 0 || this.moveY !== 0) {
      this.tick = this.tickMax;
      return true;
    }

    // Movement was not set.
    return false;
  }

};
