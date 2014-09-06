function Side(id, el, neighbors) {

  // The face id (top, bottom, front, back, left, right).
  this.id = id;

  // HTML element representing the side.
  this.el = el;

  // An array of all the tiles by index.
  this.tiles = this._buildTiles();

  // Configures the neighboring sides.
  this._buildNeighbors();
}

Side.prototype = {

  _buildNeighbors: function(sides) {
    _.forIn(sides, function(value, key) {
      this[key] = function() {
        return value;
      };
    }, this);
  },

  _buildTiles: function() {

    var DELAY_MAX = 2000,
        numberOfTiles = 9;

    return _.times(numberOfTiles, function(index) {
      return this._placeTile(index, Math.random() * DELAY_MAX);
    }, this);
  },

  _placeTile: function(index, delay) {

    var tile = document.createElement('div');
    tile.id = this.id + '-' + index;
    tile.className = 'tile';
    this.el.appendChild(tile);

    window.setTimeout(function() {
      tile.classList.add('init');
    }, delay);

    return tile;
  }

};
