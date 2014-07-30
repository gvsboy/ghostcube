function App(containerId) {
  this.container = document.getElementById(containerId);
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);
  this.listen();

  //this.tick = 0;
  //window.requestAnimationFrame(this.render.bind(this));
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

    cubeEl.addEventListener('click', cubeClicked);
  },

  render: function() {
    var tick = this.tick += 1.5;
    if (tick === Const.REVOLUTION) {
      this.tick = 0;
    }
    this.cube.rotate(tick, tick);
    window.requestAnimationFrame(this.render.bind(this));
  }

};
