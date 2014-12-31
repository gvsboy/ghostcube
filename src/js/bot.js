function Bot(name, tileClass, cube, opponent) {
  Player.call(this, name, tileClass, cube);
  this.opponent = opponent;
}

Bot.prototype = {

  play: function() {

    /*
      First, gather all the Bot's tiles to see if a win is possible this turn
      (there are lines that are missing one tile).
      If so, attempt to claim those tiles.

      If no win is possible, gather the opponent's tiles to see if a win is possible.
      If so, see which method can block:

        - Neutralizing a tile?
        - Claiming the missing tile?
     */
    var cube = this._cubeCache._cube;

    console.log('============== BOT MOVE ==============');

    var lines = this.getLines(),
        playerLines = this.opponent.getLines();

    console.log('= bot lines:', lines);
    console.log('= player lines:', playerLines);

    // Check if the bot is about to win:
    var size = this._cubeCache._cubeSize;
    var botWinningMoves = _.filter(lines, function(line) {
      return line.length() === size - 1;
    });
    console.log('= bot winning moves:', botWinningMoves);

    // If the bot has some winning moves, try some scenarios out.
    _.forEach(botWinningMoves, function(line) {

      // Find out which tiles are missing from the line.
      var missing = line.missing(cube);
    });
  }

};
