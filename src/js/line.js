/**
 * Lines represent tiles in either a horizontal or vertical row
 * which serve as points or win states.
 * @param {Array} tiles  A collection of tiles that compose the line.
 */
function Line(tiles) {
  this.side = _.first(tiles).side;
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
   * Reports whether or not the line is horizontal by checking the
   * index difference between two adjacent tiles.
   * @return {Boolean} Is this line horizontal?
   */
  isHorizontal: function() {
    var tiles = this.getTiles();
    return tiles[1].index === tiles[0].index + 1;
  },

  /**
   * @return {Array} A collection of tiles that compose the line.
   */
  getTiles: function() {
    return this._tiles;
  },

  updateTiles: function(callback) {
    _.each(this.getTiles(), function(tile) {
      callback(tile);
    });
  },

  /**
   * @return {Number} The number of tiles in the line.
   */
  length: function() {
    return this._tiles.length;
  },

  /**
   * @return {Array} The indicies of all the tiles.
   */
  indicies: function() {
    return _.map(this.getTiles(), function(tile) {
      return tile.index;
    });
  },

  /**
   * @return {Array} A collection of the missing tiles.
   */
  missingTiles: function() {

    var tiles = this.getTiles(),

        // Are we matching against a horizontal or vertical line?
        matchedLine = this.isHorizontal() ? _.first(tiles).xLine : _.first(tiles).yLine;

    // Now we can figure out which tiles are missing by diffing the two lines.
    return _.xor(tiles, matchedLine.getTiles());
  },

  // Rotate in place, like a Tetrad. For instance:
  // xoo      xxx
  // xoo  ->  ooo
  // xoo      ooo
  rotate: function() {

    // Cache the line length.
    var length = this.length(),

        // Where the line begins, starting from top-left.
        origin = this.indicies()[0],

        // The transformed line.
        newLine,

        indexAt;

    if (this.isHorizontal()) {
      // The row (starting at top-right and down).
      indexAt = origin - (origin % length);
      newLine = this.side.getTiles(indexAt + (indexAt / length))[0].yLine;
    }
    else {
      // The column (starting top-right and across).
      indexAt = origin % length;
      newLine = this.side.getTiles(indexAt * length)[0].xLine;
    }

    return newLine;
  },

  // Flip across a median. For instance:
  //    xoo      oox
  //    xoo  ->  oox
  //    xoo      oox
  flip: function() {

    // Cache the line length.
    var length = this.length(),

        // Where the line begins, starting from top-left.
        origin = this.indicies()[0],

        // The transformed line.
        newLine,

        // The row or column the line is in.
        indexAt,

        // The middle line.
        middle,

        // Distance difference between the index and middle.
        diff;

    // If the line is vertical:
    if (!this.isHorizontal()) {

      // The column (starting at top-left and across).
      indexAt = origin % length;

      // The middle column.
      middle = (length - 1) / 2;

      // Determine the difference and get the calculated y line.
      diff = middle - indexAt;
      newLine = this.side.getTiles(middle + diff)[0].yLine;
    }

    // Else, the line must be horizontal:
    else {

      // The row (starting at top-right and down).
      indexAt = origin - (origin % length);

      // The middle row, which is the size squared cut in half and floored.
      // NOTE: This could be buggy with other sizes!
      middle = Math.floor((Math.pow(length, 2) / 2) - 1);

      // Determine the difference and get the calculated x line.
      diff = middle - indexAt;
      newLine = this.side.getTiles(middle + diff)[0].xLine;
    }

    return newLine;
  }

};
