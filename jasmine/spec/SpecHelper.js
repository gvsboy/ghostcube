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

/**
 * Fetches tiles from strings. E.g. 'right 2'
 * @param {Cube} cube The cube to fetch tiles from.
 * @param {...String} Any number of strings representing tiles.
 * @return {Array} A collection of fetched tiles.
 */
function getTiles(cube) {
  var sides = cube.getSides();
  return _.map(_.rest(arguments), function(string) {
    var idPair = string.split(' ');
    return sides[idPair[0]].getTiles(idPair[1])[0];
  });
}

/**
 * Fetches all tiles from the provided sides. E.g. 'right'
 * @param  {Cube} cube The cube to fetch tiles from.
 * @return {...String} Any number of strings representing sides.
 * @return {Array} A collection of fetched tiles.
 */
function getAllTilesForSides(cube) {
  var sides = cube.getSides();
  return _.flatten(_.map(_.rest(arguments), function(string) {
    return sides[string].getTiles();
  }));
}

/**
 * Like getTiles() but only fetches a single tile.
 * @param  {Cube} cube The cube to fetch tiles from.
 * @param  {String} string A string representing a tile.
 * @return {Tile} The fetched tile.
 */
function getTile(cube, string) {
  return getTiles(cube, string)[0];
}
