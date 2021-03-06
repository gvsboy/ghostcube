import _ from 'lodash';
import Tile from './tile';
import Line from './line';

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
    if (_.isUndefined(indicies)) {
      return this._tiles;
    }
    return _.at(this._tiles, _.isArray(indicies) ? _.uniq(_.flatten(indicies)) : +indicies);
  },

  /**
   * Returns all the tiles that are still unclaimed.
   * @return {Array} A collection of unclaimed tiles.
   */
  getAvailableTiles: function() {
    return _.reject(this._tiles, 'claimedBy');
  },

  _buildTiles: function(size) {

    // First let's create an array of tiles based on the cube size.
    var tiles = _.times(Math.pow(size, 2), index => new Tile(this, index)),

    // Now we'll create lines from the tiles.
    lines = {

      // Creating x coordinate lines.
      x: _.times(size, function(n) {
          return new Line(tiles.slice(n * size, (n + 1) * size));
        }),

      // Creating y coordinate lines.
      y: _.times(size, function(n) {
          var arr = _.times(size, function(i) {
            return n + i * size;
          });
          return new Line(_.at(tiles, arr));
        })
    };

    // For each tile, assign the correct lines.
    _.forEach(tiles, function(tile, index) {

      var mod = index % size,
          xLine = lines.x[(index - mod) / size],
          yLine = lines.y[mod];

      tile.updateLines(xLine, yLine);
    });

    // Return the tiles.
    return tiles;
  }

};

export default Side;
