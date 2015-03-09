function CubeCache(cube) {

  // A reference to the cube.
  this._cube = cube;

  // The size to check completed lines against.
  this._cubeSize = cube.size;

  // Create cache objects to hold claimed tiles.
  this.initialize();
}

CubeCache.prototype = {

  /**
   * Called on instantiation and reset, this initialize a fresh cache
   * in two collecitons: An object keyed by cube side id to contain lines
   * and an array to contain single tiles.
   */
  initialize: function() {

    // A collection of lines created by side.
    this._lineMap = _.reduce(this._cube.getSides(), (sides, side, id) => {
      sides[id] = [];
      return sides;
    }, {});

    // A collection of claimed tiles that are not part of lines.
    this._singles = [];
  },

  add: function(tile) {

    var claimedBy = tile.claimedBy,
        xPartial = this._getPartialLineTiles(tile.xLine, claimedBy),
        yPartial = this._getPartialLineTiles(tile.yLine, claimedBy),
        xGrow = this._growLine(xPartial),
        yGrow = this._growLine(yPartial);

    // If a line was grown or created from this tile, ensure it's removed from
    // the singles collection.
    if (xGrow || yGrow) {
      this._singles = _.difference(this._singles, tile.getAllLineTiles());
    }

    // Else, add the tile to the singles collection.
    else {
      this._singles.push(tile);
    }
  },

  remove: function(tile) {

    var claimedBy = tile.claimedBy,
        xPartial = this._getPartialLineTiles(tile.xLine, claimedBy),
        yPartial = this._getPartialLineTiles(tile.yLine, claimedBy),
        xShrink,
        yShrink;

    _.pull(xPartial, tile);
    _.pull(yPartial, tile);

    xShrink = this._shrinkLine(xPartial);
    yShrink = this._shrinkLine(yPartial);

    // If there's some shrinkage, update the singles collection accordingly.
    if (xShrink || yShrink) {

      // We need to make sure that the tiles gathered in the partial are
      // not part of another line. If they are, don't add them as singles.
      if (xShrink && !this._composesLines(xPartial)) {
        this._singles = _.union(this._singles, xPartial);
      }
      if (yShrink && !this._composesLines(yPartial)) {
        this._singles = _.union(this._singles, yPartial);
      }
    }

    // Otherwise, safely remove the tile from the singles collection
    // if it exists in there.
    else {
      _.pull(this._singles, tile);
    }
  },

  /**
   * Retrieves all the lines, sorted by the number of tiles contained
   * in each line.
   * @return {Array} A collection of lines.
   */
  getLines: function() {
    return this._getLinesAsChain()
      .sortBy(line => line._tiles.length)
      .value();
  },

  /**
   * Retrieves all cached tiles.
   * @return {Array} A colleciton of all the cached tiles.
   */
  getAllTiles: function() {
    return this._getLinesAsChain()
      .map(line => line.getTiles())
      .flatten()
      .uniq()
      .concat(this._singles)
      .value();
  },

  /**
   * Fetches a chain-wrapped collection of cached lines, flattened and
   * compacted into one array.
   * @return {lodash} A lodash chain-wrapped collection.
   */
  _getLinesAsChain: function() {
    return _.chain(this._lineMap)
      .values()
      .flatten()
      .compact()
  },

  _getPartialLineTiles: function(line, claimedBy) {
    return _.filter(line.getTiles(), function(tile) {
      return tile.claimedBy === claimedBy;
    });
  },

  _growLine: function(tiles) {

    var side, line;

    if (tiles.length > 1) {

      side = this._lineMap[_.first(tiles).side.id];
      line = _.find(side, function(ln) {
        return ln && ln.all(tiles);
      });

      // If a line exists already, update it with the new tiles.
      if (line) {
        line.update(tiles);
      }

      // Otherwise, create a new line with the given tiles.
      else {
        side.push(new Line(tiles));
      }

      // A line was created or updated.
      return true;
    }

    // A line was not created.
    return false;
  },

  /**
   * Shrinks a line.
   * @param  {Array} tiles The tiles used in the shrinkage
   * @return {Boolean} Was a line disassebled?
   */
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

          // A line was disassembled. Return true.
          return true;
        }

        // Otherwise, update the line with the remaining tiles.
        else {
          line.update(tiles);
        }
      }
    }

    // A line was not disassembled.
    return false;
  },

  _composesLines: function(tiles) {
    var side = this._lineMap[_.first(tiles).side.id];
    return _.find(side, function(line) {
      return line && line.some(tiles);
    });
  }

};
