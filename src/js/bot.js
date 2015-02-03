function Bot(name, tileClass, cube, opponent) {
  Player.call(this, name, tileClass, cube);
  this.opponent = opponent;
}

Bot.prototype = {

  getInitialTriedTile: function() {
    return _.first(this._triedTiles);
  },

  play: function() {

    this._initLog();

    this._log('================== BOT MOVE ==================');

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
    this._selectSingles() ||
    this._selectLastResort();
  },

  _selectWin: function() {

    var lines = this.getLines(),
        initialTile,
        tile;

    this._log('++++++ WIN lines:', lines);

    for (var i = 0, len = lines.length; i < len; i++) {

      initialTile = this.getInitialTriedTile();
      tile = lines[i].missingTiles()[0];

      this._log('+++ WIN loop [initial, tile] :', initialTile, tile);

      // If there's a tile selected already, try to seal the deal with two more.
      if (initialTile) {

        // First try to claim another win situation.
        // If that doesn't work out, try to claim by any means necessary.
        var attackTile = this.getAttackTile(initialTile, tile);
        if (this._tryTiles(tile, attackTile) || this._selectFirstByTile(initialTile)) {
          return true; // Done! The tiles will be claimed.
        }
      }
      else {
        this._tryTiles(tile);
      }
    }

    // More tiles must be selected to complete the turn.
    return false;
  },

  _selectOpponentBlocker: function() {

    var lines = this.opponent.getLines(),
        initialTile,
        tile;

    this._log('@@@@@@ BLOCK lines:', lines);

    for (var i = 0, len = lines.length; i < len; i++) {

      initialTile = this.getInitialTriedTile();
      tile = lines[i].missingTiles()[0];

      this._log('@@@ BLOCK loop [initial, tile] :', initialTile, tile);

      // If there's a tile selected already, try to seal the deal with two more.
      if (initialTile) {
        var attackTile = this.getAttackTile(initialTile, tile);
        if (this._tryTiles(tile, attackTile)) {
          return true; // Done! The tiles will be claimed.
        }
      }
      else {
        this._tryTiles(tile);
      }
    }

    // If the block has been unsuccessful thus far, try again by any means necessary.
    if (initialTile) {
      if (this._selectFirstByTile(initialTile)) {
        return true; // Blocked!
      }
    }

    // More tiles must be selected to complete the turn.
    return false;
  },

  _selectSingles: function() {

    var singles = _.shuffle(this.opponent.getSingles()),
        initialTile,
        tile;

    this._log('------ SINGLES:', singles);

    for (var t = 0, len = singles.length; t < len; t++) {

      initialTile = this.getInitialTriedTile();
      tile = this._selectByTileLine(singles[t]);

      this._log('--- singles loop [initial, tile] :', initialTile, tile);

      if (initialTile && tile) {
        var attackTile = this.getAttackTile(initialTile, tile);
        if (this._tryTiles(tile, attackTile)) {
          return true; // Done! The tiles will be claimed.
        }
      }
    }

    // More tiles must be selected to complete the turn.
    return false;
  },

  _selectLastResort: function() {



  },

  /**
   * Locates the first two matches for a selected tile.
   * @param  {Tile} tile The tile to find matches for.
   * @return {Boolean} Was a successful match made?
   */
  _selectFirstByTile: function(tile) {
    //debugger;

    // Perhaps loop through the sides in decending order based on population.
    // Might as well have a better chance to make or block lines.
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
    this._log('### Bot will try:', info.join(' | '));
  },

  _initLog: function() {
    this._logText = '';
  },

  _log: function() {
    var text = _.reduce(arguments, function(lines, data) {
      lines.push(!_.isEmpty(data) ? data.toString() : 'NONE');
      return lines;
    }, []).join(' ');
    console.log(text);
    this._logText += text + '\n';
  }

};
