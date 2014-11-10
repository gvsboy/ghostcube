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
    return _.intersection(tiles, this._tiles).length >= this._tiles.length;
  },

  some: function(tiles) {
    return !!_.intersection(tiles, this._tiles).length;
  },

  update: function(tiles) {
    this._tiles = tiles;
  }

};
