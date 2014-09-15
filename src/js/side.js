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

    var tile = new Tile(this.id + '-' + index);
    this.el.appendChild(tile.el);

    window.setTimeout(function() {
      tile.addClass('init');
    }, delay);

    return tile;
  }

};
