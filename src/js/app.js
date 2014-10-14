function App(containerId) {
  this.container = document.getElementById(containerId);
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);
  this.messages = new Messages();
  this.renderer = new Renderer(this.cube);

  // Set when the game begins.
  this.players = null;
  this.turn = null;

  // Listen for user interactions.
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

        self.players = [
          new Player('Kevin', 'red'),
          new Player('Jon', 'blue')
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

    cubeEl.addEventListener('click', cubeClicked);

    // When the cube has initialized, start the rendering object.
    cube.on('init', _.bind(this.renderer.initialize, this.renderer));

    // The message box listens for messages to display.
    this.messages.listenTo(cube);
  }

};
