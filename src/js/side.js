function Side(el, size) {

  // HTML element representing the side.
  this.el = el;

  // The face id (top, bottom, front, back, left, right).
  this.id = el.id;

  // This will be set using setNeighbors().
  this._neighbors = {};

  // An array of all the tiles by index.
  this._tiles = this._buildTiles(size);

  this._lines = this._buildLines(size, this._tiles);
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

  /**
   * Gets an x/y line pair that intersect at the given tile.
   * @param  {Tile} tile The reference tile.
   * @return {Array}     The x and y lines that intersect at the tile.
   */
  getLinePair: function(tile) {
    return this._lines[tile.index];
  },

  /**
   * Selects the x and y lines at the index intersection and
   * performs the callback function on each tile.
   * @param  {Tile}     tile    The tile that dictates which lines to select.
   * @param  {Function} callback A method to invoke on each tile.
   */
  updateLines: function(tile, callback, translate) {
    _.chain(this.getLinePair(tile))
      .map(function(line) {
        return line.getTiles();
      })
      .flatten()
      .uniq()
      .forEach(callback);
  },

  rotateLine: function(line) {

  },

  flipLine: function(line) {

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
  },

  _buildLines: function(size, tiles) {

    // Let's build some lines. OK!
    var xLines = _.times(size, function(n) {
      return new Line(tiles.slice(n * size, (n + 1) * size));
    });

    var yLines = _.times(size, function(n) {
      var arr = _.times(size, function(i) {
        return n + i * size;
      });
      return new Line(_.at(tiles, arr));
    });

    var lines = {
      x: xLines,
      y: yLines
    };

    return _.map(tiles, function(tile, index) {

      // Holds two lines: x and y.
      var mod = index % size;

      // temp place for my lines!!
      var xLine = lines.x[(index - mod) / size],
          yLine = lines.y[mod];

      tile.updateLines(xLine, yLine);

      return [xLine, yLine];
    });
  }

};
