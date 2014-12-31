/**
 * Lines represent tiles in either a horizontal or vertical row
 * which serve as points or win states.
 * @param {Array} tiles  A collection of tiles that compose the line.
 */
function Line(tiles) {
  this.sideId = _.first(tiles).side.id;
  this.update(tiles);
}

Line.prototype = {

  /**
   * Checks to see if the line contains all of the passed tiles.
   * @param  {Array} tiles The tiles to check.
   * @return {Boolean}     Does the line contain the passed tiles?
   */
  all: function(tiles) {
    return _.intersection(tiles, this._tiles).length >= this.length();
  },

  some: function(tiles) {
    return !!_.intersection(tiles, this._tiles).length;
  },

  update: function(tiles) {
    this._tiles = tiles;
  },

  /**
   * @return {Number} The number of tiles in the line.
   */
  length: function() {
    return this._tiles.length;
  },

  /**
   * @return {Array} A collection of the tile indicies composing the line.
   */
  getIndicies: function() {
    return _.map(this._tiles, function(tile) {
      return tile.index;
    });
  },

  /**
   * Given a reference cube, returns the tiles missing from the line.
   * @param  {Number} length The number of tiles to match against.
   * @return {Array}         A collection of the misisng tiles.
   */
  missing: function(cube) {

    var indicies = this.getIndicies(),
        diff = _.last(indicies) - _.first(indicies);

    // If the line is horizontal, mod will be zero.
    if (diff % cube.size) {

    }

    // Otherwise, it's a vertical line.
    else {
      
    }

  }

};
