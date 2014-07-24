function App(containerId) {
  this.container = document.getElementById(containerId);
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);
  this.listen();
  this._startRendering();
}

App.prototype = {

  // I hate everything in here but it's ok for now.
  listen: function() {

    var cube = this.cube,
        cubeEl = cube.el,
        container = this.container;

    function beginGame(evt) {
      // Every animated cube face will bubble up their animation events
      // so let's react to only one of them.
      if (evt.target === container) {
        container.removeEventListener('animationend', beginGame);
        cube.beginGame();
      }
    }

    function cubeClicked() {
      cubeEl.classList.remove('init');
      cubeEl.removeEventListener('click', cubeClicked);
      container.classList.add('game');
      container.addEventListener('animationend', beginGame);
    }

    cubeEl.addEventListener('click', cubeClicked);
  },

  render: function() {
    var tick = this.tick++;
    if (tick === Const.REVOLUTION) {
      this.tick = 0;
    }
    this.cube.rotate(tick, tick);
  },

  _startRendering: function() {
    this.tick = 0;
    this.timer = window.setInterval(this.render.bind(this), 10);
  }

};
