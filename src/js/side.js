function Side(el, size) {

  // HTML element representing the side.
  this.el = el;

  // The face id (top, bottom, front, back, left, right).
  this.id = el.id;

  // This will be set using setNeighbors().
  this.neighbors = {};

  // An array of all the tiles by index.
  this._tiles = this._buildTiles(size);
}

Side.prototype = {

  setNeighbors: function(sides) {
    this.neighbors = sides;
  },

  /**
   * Fetches specific tiles referenced by the passed indicies,
   * or all tiles if indicies are not passed.
   * @param  {[Number[]]} indicies An array of indicies.
   * @return {Tile[]}          An array of selected tiles.
   */
  getTiles: function(indicies) {
    if (indicies) {
      return _.at(this._tiles, _.uniq(_.flatten(indicies)));
    }
    return this._tiles;
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
