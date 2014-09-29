function Side(el, size) {

  // HTML element representing the side.
  this.el = el;

  // The face id (top, bottom, front, back, left, right).
  this.id = el.id;

  // This will be set using setNeighbors().
  this._neighbors = {};

  // An array of all the tiles by index.
  this._tiles = this._buildTiles(size);
}

Side.prototype = {

  getNeighbors: function() {
    return this._neighbors;
  },

  setNeighbors: function(sides) {
    this._neighbors = sides;
  },

  /**
   * A check to determine if the passed side is one of this side's neighbors.
   * @param  {Side}  side The side object to check.
   * @return {Boolean}      Is the passed side a neighbor?
   */
  isNeighbor: function(side) {
    return _.contains(this._neighbors, side);
  },

  setVisibilityMap: function(map) {
    this._visibilityMap = map;
  },

  isVisible: function(cubeX, cubeY) {
    return _.contains(this._visibilityMap[cubeX], cubeY);
  },

  /**
   * Fetches specific tiles referenced by the passed indicies,
   * or all tiles if indicies are not passed.
   * @param  {[String|Number|Number[]]} indicies An array of indicies.
   * @return {Tile[]}          An array of selected tiles.
   */
  getTiles: function(indicies) {
    if (indicies) {
      return _.at(this._tiles, _.isArray(indicies) ? _.uniq(_.flatten(indicies)) : +indicies);
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

    var tile = new Tile(this, index);

    window.setTimeout(function() {
      tile.addClass('init');
    }, delay);

    return tile;
  }

};
