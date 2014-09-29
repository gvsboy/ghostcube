function App(containerId) {
  this.container = document.getElementById(containerId);
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);
  this.rendering = false;
  this.listen();

  // Set when the game begins.
  this.players = null;
  this.turn = null;

  // crap
  this.moveX;
  this.moveY;
  this.moveCount = 0;
}

App.prototype = {

  // I hate everything in here but it's ok for now.
  listen: function() {

    var self = this,
        cube = this.cube,
        cubeEl = cube.el,
        container = this.container;

    function beginGame(evt) {
      // Every animated cube face will bubble up their animation events
      // so let's react to only one of them.
      if (evt.target === container) {
        container.removeEventListener(Vendor.EVENT.animationEnd, beginGame);

        self.players = [
          new Player(),
          new Player()
        ];
        self.turn = _.first(self.players);

        cube.build();
      }
    }

    function cubeClicked() {
      cubeEl.classList.remove('splash');
      cubeEl.removeEventListener('click', cubeClicked);
      container.classList.add('game');
      container.addEventListener(Vendor.EVENT.animationEnd, beginGame);
    }

    function gameInitialized() {
      self._attachKeyboard();
    }

    cubeEl.addEventListener('click', cubeClicked);
    cubeEl.addEventListener('init', gameInitialized);
  },

  render: function() {

    this.moveCount -= Const.CUBE_SPEED;
    this.cube.rotate(this.moveX, this.moveY);

    if (this.moveCount > 0 || this._setMovement()) {
      this._loop();
    }

    // debug
    else {
      console.log('cube x y', this.cube.x, this.cube.y);
    }
  },

  _loop: function() {
    window.requestAnimationFrame(this.render.bind(this));
  },

  _attachKeyboard: function() {
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
    this.keyboard.listen(window, this._keyboardListener.bind(this));
  },

  _keyboardListener: function() {
    if (this.moveCount === 0 && this._setMovement()) {
      this._loop();
      this.cube.el.dispatchEvent(new Event('renderstart'));
    }
  },

  _setMovement: function() {

    var KB = Keyboard,
        keys = this.keyboard.keys;

    // reset movex and movey
    this.moveX = this.moveY = 0;

    // Detect either up or down movement.
    if (keys[KB.UP] || keys[KB.W]) {
      this.moveX = Const.CUBE_SPEED;
    }
    else if (keys[KB.DOWN] || keys[KB.S]) {
      this.moveX = -Const.CUBE_SPEED;
    }

    // Detect either left or right movement.
    if (keys[KB.LEFT] || keys[KB.A]) {
      this.moveY = Const.CUBE_SPEED;
    }
    else if (keys[KB.RIGHT] || keys[KB.D]) {
      this.moveY = -Const.CUBE_SPEED;
    }

    // If there is movement, set moveCount and return true.
    if (this.moveX !== 0 || this.moveY !== 0) {
      this.moveCount = Const.CUBE_MOVE_UNIT;
      return true;
    }

    // Movement was not set.
    return false;
  }

};
