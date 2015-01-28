function Bot(name, tileClass, cube, opponent) {
  Player.call(this, name, tileClass, cube);
  this.opponent = opponent;
}

Bot.prototype = {

  getInitialTriedTile: function() {
    return _.first(this._triedTiles);
  },

  play: function() {

    this._triedTiles = [];

    /*
      First, gather all the Bot's tiles to see if a win is possible this turn
      (there are lines that are missing one tile).
      If so, attempt to claim those tiles.

      If no win is possible, gather the opponent's tiles to see if a win is possible.
      If so, see which method can block:

        - Neutralizing a tile?
        - Claiming the missing tile?
     */

    this._selectWin() ||
    this._selectOpponentBlocker() || 
    this._selectSingles();
  },

  _selectWin: function() {

    var botLines = this.getLines();

    // More tiles must be selected to complete the turn.
    return false;
  },

  _selectOpponentBlocker: function() {

    var cube = this._cubeCache._cube,
        playerLines = this.opponent.getLines();

    if (playerLines.length) {
      for (var i = 0, len = playerLines.length; i < len; i++) {

        var initialTile = this.getInitialTriedTile();
        var missingTile = playerLines[i].missingTiles()[0];

        console.log('@@@ win loop: initial | tile: ', initialTile, missingTile);

        // If there's a tile selected already, try to seal the deal with two more.
        if (initialTile) {
          var attackTile = cube.getAttackTile(initialTile, missingTile);
          if (this._tryTiles(missingTile, attackTile)) {
            return true; // Done! The tiles will be claimed.
          }
        }
        else {
          this._tryTiles(missingTile);
        }
      }
    }

    // More tiles must be selected to complete the turn.
    return false;
  },

  _selectSingles: function() {

    var cube = this._cubeCache._cube,
        singles = _.shuffle(this.opponent.getSingles()),
        initialTile,
        tile;

    for (var t = 0, len = singles.length; t < len; t++) {

      initialTile = this.getInitialTriedTile();
      tile = this._selectByTileLine(singles[t]);

      console.log('### singles loop: initial | tile: ', initialTile, tile);

      if (initialTile && tile) {
        var attackTile = cube.getAttackTile(initialTile, tile);
        if (this._tryTiles(tile, attackTile)) {
          return true; // Done! The tiles will be claimed.
        }
      }
    }

    // More tiles must be selected to complete the turn.
    return false;
  },

  /**
   * Attempts to select a tile on the same line as the given tile.
   * Scans both x and y lines, shuffling the collection.
   * @param  {Tile} tile The target tile.
   * @return {Tile}      The selected tile.
   */
  _selectByTileLine: function(tile) {

    // Grab all the tiles on the same line as the passed tile.
    var lineTiles = _.shuffle(tile.getAllLineTiles());

    // Return the first tile that is a valid selection.
    return _.find(lineTiles, function(ti) {
      return this._tryTiles(ti);
    }, this);
  },

  _selectTiles: function() {
    this._triedTiles = _.union(this._triedTiles, arguments);
    if (this._triedTiles.length === 3) {
      this._report();
      this._animateClaim();
    }
  },

  _animateClaim: function() {
    setTimeout(_.bind(function() {
      var tile = this._triedTiles.shift();
      Player.prototype._selectTiles.call(this, tile);
      if (!_.isEmpty(this._triedTiles)) {
        this._animateClaim();
      }
    }, this), 600);
  },

  _tryTiles: function(tile1, tile2) {
    try {
      this.selectTile(tile1, tile2);
      return true;
    }
    catch (e) {
      if (!(e instanceof SelectTileError)) {
        throw e;
      }
    }
    return false;
  },

  _report: function() {
    var info = _.reduce(this._triedTiles, function(all, tile) {
      all.push(tile.toString ? tile.toString() : tile);
      return all;
    }, []);
    console.log("### Bot will try: ", info.join(' | '));
  }

};
