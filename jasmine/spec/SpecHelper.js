function createCube(size) {
  var cube = new Cube(document.getElementById('cube'));
  cube.build();
  return cube;
}

function createSide(size, id) {
  var el = document.createElement('div');
  el.id = id || 'front';
  return new Side(el, size || 3);
}

function createPlayers(cube) {
  var human = new Player('Kevin', 'player1', cube),
      bot = new Bot('CPU', 'player2', cube, human);
  return [human, bot];
}
