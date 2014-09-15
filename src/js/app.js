function App(containerId) {
  this.container = document.getElementById(containerId);
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);
  this.rendering = false;
  this.listen();
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
        cube.beginGame();
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

    var KB = Keyboard,
        keys = this.keyboard.keys,
        moveX = 0,
        moveY = 0;

    // Detect either up or down movement.
    if (keys[KB.UP] || keys[KB.W]) {
      moveX = Const.CUBE_SPEED;
    }
    else if (keys[KB.DOWN] || keys[KB.S]) {
      moveX = -Const.CUBE_SPEED;
    }

    // Detect either left or right movement.
    if (keys[KB.LEFT] || keys[KB.A]) {
      moveY = -Const.CUBE_SPEED;
    }
    else if (keys[KB.RIGHT] || keys[KB.D]) {
      moveY = Const.CUBE_SPEED;
    }

    this.cube.rotate(moveX, moveY);

    if (this.rendering) {
      window.requestAnimationFrame(this.render.bind(this));
    }
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
    if (this.keyboard.isAnyKeyDown()) {
      if (!this.rendering) {
        this.rendering = true;
        window.requestAnimationFrame(this.render.bind(this));
      }
    }
    else {
      this.rendering = false;
    }
  }

};
