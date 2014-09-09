function Side(el, size) {

  // HTML element representing the side.
  this.el = el;

  // The face id (top, bottom, front, back, left, right).
  this.id = el.id;

  // An array of all the tiles by index.
  this.tiles = this._buildTiles(size);

  // This will be set using setNeighbors().
  this.neighbors = {};
}

Side.prototype = {

  setNeighbors: function(sides) {
    this.neighbors = sides;
  },

  _buildTiles: function(size) {

    var DELAY_MAX = 2000,
        numberOfTiles = Math.pow(size, 2);

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
