function Player(name, tileClass, cube) {
  this.name = name;
  this.tileClass = tileClass;
  this._selectedTiles = [];
  this._cubeCache = new CubeCache(cube);
  EventEmitter2.call(this);
}

Player.prototype = {

  isBot: function() {
    return this instanceof Bot;
  },

  release: function(tile) {
    tile.release();
    this._cubeCache.remove(tile);
  },

  getLines: function() {
    return this._cubeCache.getLines();
  },

  /**
   * Win lines are completed lines. This method returns all the win
   * lines claimed by the player.
   * @return {Array} A collection of this player's win lines.
   */
  getWinLines: function() {
    var size = this._cubeCache._cubeSize;
    return _.filter(this.getLines(), function(line) {
      return line.length() === size;
    });
  },

  /**
   * Dictates whether or not the player can attack the given tile.
   * Basically, as long as the tile is not claimed by the player and
   * is not some barrier, the tile can be attacked.
   * @param  {Tile} tile The tile to check.
   * @return {Boolean} Can the given tile be attacked by this player?
   */
  canAttack: function(tile) {
    return tile.claimedBy !== this;
  },

  /**
   * [selectTile description]
   * @param  {Tile} tile The tile this player is trying to select.
   * @param {Tile} [attackTile] The tile being attacked (if this is not the initial selection).
   * @return {Boolean} Was this the last tile that needed to be selected?
   */
  selectTile: function(tile, attackTile) {

    // Get a reference to all the selected tiles.
    var selectedTiles = this._selectedTiles,

        // Get a reference to the first tile selected.
        initialTile = _.first(selectedTiles);

    // If the tile is already claimed, get outta dodge.
    if (tile.claimedBy) {
      throw new SelectTileError(SelectTileError.CLAIMED);
    }

    // If an initial tile exists, run some tests.
    if (initialTile) {

      // If the initial tile is selected, deselected it and bail out.
      if (tile === initialTile) {
        this.deselectTile(tile);
        return;
      }

      // If the new selected tile is on the same side as the
      // initial tile, deselect the initial tile.
      if (tile.side === initialTile.side) {
        this.deselectTile(initialTile);
      }

      // Else, if the side selected is not a neighbor, bail out.
      else if (!initialTile.side.isNeighbor(tile.side)) {
        throw new SelectTileError(SelectTileError.NOT_NEIGHBOR);
      }
    }

    // If the attack tile exists, run even more tests.
    if (attackTile) {

      // If the attack tile is valid, that means both tiles can be selected
      // and everything can be claimed.
      if (this.canAttack(attackTile)) {
        if (attackTile.claimedBy) {
          attackTile.claimedBy.release(attackTile);
        }
        selectedTiles.push(tile, attackTile);
        this.claim();
      }
      else {
        throw new SelectTileError(SelectTileError.TARGET_CLAIMED)
      }
    }

    // Otherwise, the initial tile must have been selected.
    // Emit an event to celebrate this special occasion!
    else {
      selectedTiles.push(tile);
      this.emit('player:initialSelected', tile);
    }

    // Are we done selecting tiles this turn?
    return selectedTiles.length === 3;
  },

  deselectTile: function(tile) {
    _.pull(this._selectedTiles, tile);
    this.emit('player:initialDeselected', tile);
  },

  claim: function() {
    _.forEach(this._selectedTiles, function(tile) {
      tile.claim(this);
      this._cubeCache.add(tile);
    }, this);
    this.emit('player:claim', this._selectedTiles);
    this._selectedTiles = [];
  }

};

// Mixin EventEmitter methods.
_.assign(Player.prototype, EventEmitter2.prototype);

// Assign Bot inheritence here because Bot is getting included first.
// Need to switch to modules next go-round. For reals.
_.assign(Bot.prototype, Player.prototype);
