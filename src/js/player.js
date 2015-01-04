function Player(name, tileClass, cube) {
  this.name = name;
  this.tileClass = tileClass;
  this._cubeCache = new CubeCache(cube);
}

Player.prototype = {

  isBot: function() {
    return this instanceof Bot;
  },

  claim: function(tile) {
    tile.claim(this);
    this._cubeCache.add(tile);
  },

  release: function(tile) {
    tile.release();
    this._cubeCache.remove(tile);
  },

  getLines: function() {
    return this._cubeCache.getLines();
  },

  getWinLines: function() {
    var size = this._cubeCache._cubeSize;
    return _.filter(this.getLines(), function(line) {
      return line.length() === size;
    });
  }

};

// Assign Bot inheritence here because Bot is getting included first.
// Need to switch to modules next go-round. For reals.
_.assign(Bot.prototype, Player.prototype);
