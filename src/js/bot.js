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
    console.log('opponent cube cache:', this.opponent._cubeCache);

    /* If there are player lines, try to stop them.
    if (playerLines.length) {
      for (var i = 0, len = playerLines.length; i < len; i++) {
        var missingTile = botWinningMoves[i].missingTiles()[0];
        var initialTile = _.first(this.selectTiles);

        // If there's a tile selected already, try to seal the deal with two more.
        if (initialTile) {
          var attackTile = cube.getAttackTile(initialTile, missingTile);
          if (this.tryTiles(missingTile, attackTile)) {
            this.claim();
            return;
          }
        }
        else {
          this.tryTiles(missingTile);
        }
      }
    }
    */

    // If there are no lines, try attacking a tile.
    //console.log('player tile', this.opponent._cubeCache._sideMap);

  },

  tryTiles: function(tile1, tile2) {
    try {
      this.selectTile(tile1, tile2);
      return true;
    }
    catch (e) {}
    return false;
  }

};
