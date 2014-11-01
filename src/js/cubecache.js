function CubeCache(cube) {

  // The size to check completed lines against.
  this._cubeSize = cube.size;

  // Create an object keyed by side id with array values containing
  // Tile objects by index.
  this._sideMap = _.reduce(cube._sides, function(sides, side, id) {
    sides[id] = [];
    return sides;
  }, {});
}

CubeCache.prototype = {

  add: function(tile) {
    this._setTile(tile, tile);
  },

  remove: function(tile) {
    this._setTile(tile, null);
  },

  _setTile: function(tile, value) {
    this._sideMap[tile.side.id][tile.index] = value;
  }

}
