function CubeCache(cube) {

  // A reference to the cube.
  this._cube = cube;

  // The size to check completed lines against.
  this._cubeSize = cube.size;

  // A collection of lines created by side.
  this._lineMap = this._buildCollection(cube);

  // A collection of the tiles claimed by side.
  this._sideMap = this._buildCollection(cube);
}

CubeCache.prototype = {

  add: function(tile) {

    var side = this._getSideByTile(tile),
        index = tile.index;

    side[index] = tile;
    this._growLine(this._getXTiles(side, index));
    this._growLine(this._getYTiles(side, index));
  },

  remove: function(tile) {

    var side = this._getSideByTile(tile),
        index = tile.index;

    side[index] = null;
    this._shrinkLine(this._getXTiles(side, index));
    this._shrinkLine(this._getYTiles(side, index));
  },

  /**
   * Retrieves all the lines, sorted by the number of tiles contained
   * in each line.
   * @return {Array} A collection of lines.
   */
  getLines: function() {
    return _.chain(this._lineMap)
      .values()
      .flatten()
      .compact()
      .sortBy(function(line) {
        return line._tiles.length;
      })
      .value();
  },

  /**
   * Create an object keyed by cube side id with array values for containing
   * various Tile data objects.
   * @param  {Cube} cube The Cube object to base the collection on.
   * @return {Object}    An object representation of the cube, keyed by side id.
   */
  _buildCollection: function(cube) {
    return _.reduce(cube._sides, function(sides, side, id) {
      sides[id] = [];
      return sides;
    }, {});
  },

  _getSideByTile: function(tile) {
    return this._sideMap[tile.side.id];
  },

  _getXTiles: function(side, index) {
    var start = index - (index % this._cubeSize);
    return _.compact(_.at(side, _.range(start, start + this._cubeSize)));
  },

  _getYTiles: function(side, index) {
    var size = this._cubeSize,
        start = index % size;
    return _.compact(_.at(side, _.range(start, Math.pow(size, 2), size)));
  },

  _growLine: function(tiles) {

    var side, line;

    if (tiles.length > 1) {

      side = this._lineMap[_.first(tiles).side.id];
      line = _.find(side, function(ln) {
        return ln && ln.all(tiles);
      });

      if (line) {
        line.update(tiles);
      }
      else {
        side.push(new Line(tiles));
      }
    }
  },

  _shrinkLine: function(tiles) {

    var side, line;

    if (tiles.length) {

      side = this._lineMap[_.first(tiles).side.id];
      line = _.find(side, function(ln) {
        return ln && ln.some(tiles);
      });

      // Line should exist but just in case...
      if (line) {

        // If there's only one tile, it's not a line. Clear it.
        if (tiles.length === 1) {
          side[side.indexOf(line)] = null;
        }

        // Otherwise, update the line with the remaining tiles.
        else {
          line.update(tiles);
        }
      }
    }
  }

};