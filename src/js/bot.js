function Bot(name, tileClass, cube, opponent) {
  Player.call(this, name, tileClass, cube);
  this.opponent = opponent;
}

Bot.prototype = {

  play: function() {

    console.log('============== BOT MOVE ==============');

    /*
      First, gather all the Bot's tiles to see if a win is possible this turn
      (there are lines that are missing one tile).
      If so, attempt to claim those tiles.

      If no win is possible, gather the opponent's tiles to see if a win is possible.
      If so, see which method can block:

        - Neutralizing a tile?
        - Claiming the missing tile?
     */

    var cube = this._cubeCache._cube,
        botLines = this.getLines(),
        playerLines = this.opponent.getLines();


    // Check if the bot is about to win:
    var size = this._cubeCache._cubeSize;
    var botWinningMoves = _.filter(botLines, function(line) {
      return line.length() === size - 1;
    });
    //console.log('= bot winning moves:', botWinningMoves);


    /* If the bot has some winning moves, try some scenarios out.
    for (var i = 0, len = botWinningMoves.length; i < len; i++) {

      var missingTile = botWinningMoves[i].missingTiles()[0];

      console.log('missing tile:', missingTile);

      if (this._selectedTiles.length < 1) {
        this.selectTile(missingTile);
      }
      else {
        var attackTile = cube.getAttackTile(this._selectedTiles[0], missingTile);
        this.selectTile(missingTile, attackTile);
      }
    }
    */
   
    // Dummy
    //console.log('opponent cube cache singles:', this.opponent._cubeCache._singles);

    // If there are player lines, try to stop them.
    if (playerLines.length) {
      for (var i = 0, len = playerLines.length; i < len; i++) {
        var missingTile = playerLines[i].missingTiles()[0];
        var initialTile = this.getInitialTile();

        // If there's a tile selected already, try to seal the deal with two more.
        if (initialTile) {
          var attackTile = cube.getAttackTile(initialTile, missingTile);
          if (this._tryTiles(missingTile, attackTile)) {
            this.claim();
            return;
          }
        }
        else {
          this._tryTiles(missingTile);
        }
      }
    }

    // If there are no lines, try attacking a tile.
    // Is there a tile selected?

    // Get a random single.
    this._selectSingles();

  },

  _selectSingles: function() {

    var cube = this._cubeCache._cube,
        singles = this.opponent.getSingles(),
        initialTile,
        tile;

    for (var t = 0, len = singles.length; t < len; t++) {

      tile = singles[t];
      initialTile = this.getInitialTile();

      if (initialTile) {
        var attackTile = cube.getAttackTile(initialTile, tile);
        if (this._tryTiles(tile, attackTile)) {
          this.claim();
          return;
        }
      }
      else {

        // Loop through all the line tiles until one of the is selectable.
        var lineTiles = tile.getAllLineTiles();
        for (var e = 0, elen = lineTiles.length; e < elen; e++) {
          if (this._tryTiles(lineTiles[e])) {
            break;
          }
        }
      }
    }

  },

  _tryTiles: function(tile1, tile2) {
    try {
      this.selectTile(tile1, tile2);
      return true;
    }
    catch (e) {}
    return false;
  }

};
