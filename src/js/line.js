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
   * @return {Array} A collection of tiles that compose the line.
   */
  getTiles: function() {
    return this._tiles;
  },

  /**
   * @return {Number} The number of tiles in the line.
   */
  length: function() {
    return this._tiles.length;
  },

  /**
   * Given a reference cube, returns the tiles missing from the line.
   * @param  {Number} length The number of tiles to match against.
   * @return {Array}         A collection of the misisng tiles.
   */
  missing: function(cube) {

    // First, get the side this line resides on.
    var side = cube.getSide(this.sideId),

        // Next, get the line pair for the first tile in this line.
        pair = side.getLinePair(_.first(this.getTiles())),

        // Find the line in the pair that corresponds to this line.
        matchedLine = _.find(pair, function(line) {
          return this.all(line.getTiles());
        }, this);

    // Now we can figure out which tiles are missing by diffing the two lines.
    return _.xor(this.getTiles(), matchedLine.getTiles());
  }

};
