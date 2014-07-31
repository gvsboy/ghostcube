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
        container.removeEventListener(Vendor.animationEndEvent, beginGame);
        cube.beginGame();
      }
    }

    function cubeClicked() {
      cubeEl.classList.remove('init');
      cubeEl.removeEventListener('click', cubeClicked);
      container.classList.add('game');
      container.addEventListener(Vendor.animationEndEvent, beginGame);
    }

    function gameStarted() {
      self.keyboard = new Keyboard([
        Keyboard.UP,
        Keyboard.DOWN,
        Keyboard.LEFT,
        Keyboard.RIGHT,
        Keyboard.W,
        Keyboard.A,
        Keyboard.S,
        Keyboard.D
      ]);
      self.keyboard.listen(window, self._keyboardListener.bind(self));
    }

    cubeEl.addEventListener('click', cubeClicked);
    cubeEl.addEventListener('start', gameStarted);
  },

  render: function() {
    console.log('rendering');
    if (this.rendering) {
      window.requestAnimationFrame(this.render.bind(this));
    }
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
