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
   * Outputs useful identifying information for troubleshooting.
   * @return {String} String information.
   */
  toString: function() {
    var info = _.reduce(this.getTiles(), function(tiles, tile) {
      tiles.push(tile.toString());
      return tiles;
    }, []);
    return '(' + info.join(' ') + ')';
  },

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
   * Updates the UI to display a winning state involving the line.
   */
  pulsate: function() {
    _.forEach(this.getTiles(), tile => tile.addClass('win'));
  },

  /**
   * Reports whether or not the line is horizontal by checking the
   * index difference between two adjacent tiles.
   * @return {Boolean} Is this line horizontal?
   */
  isHorizontal: function() {
    var tiles = this.getTiles();
    return _.includes(tiles[0].xLine.getTiles(), tiles[1]);
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
   * @return {Array} The indicies of all the tiles.
   */
  indicies: function() {
    return _.map(this.getTiles(), 'index');
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

    // Where the line begins, starting from top-left.
    var originIndex = _.first(this.getTiles()).index;

    if (this.isHorizontal()) {
      return this.side.getTiles(originIndex + (originIndex / this.length()))[0].yLine;
    }

    return this.side.getTiles(originIndex * this.length())[0].xLine;
  },

  // Flip across a median. For instance:
  //    xoo      oox
  //    xoo  ->  oox
  //    xoo      oox
  flip: function() {

    // Where the line begins, starting from top-left.
    var originIndex = _.first(this.getTiles()).index,

        // The middle line.
        middle;

    if (this.isHorizontal()) {

      // The middle row, which is the size squared cut in half and floored.
      // NOTE: This could be buggy with other sizes!
      middle = Math.floor((Math.pow(this.length(), 2) / 2) - 1);

      // Determine the difference and get the calculated x line.
      return this.side.getTiles(middle * 2 - originIndex)[0].xLine;
    }

    // The middle column.
    middle = (this.length() - 1) / 2;

    // Determine the difference and get the calculated y line.
    return this.side.getTiles(middle * 2 - originIndex)[0].yLine;
  }

};
