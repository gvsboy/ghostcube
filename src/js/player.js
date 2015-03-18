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

  claim: function(tile) {
    tile.claim(this);
    this._cubeCache.add(tile);
  },

  release: function(tile) {
    this._cubeCache.remove(tile);
    tile.release();
  },

  releaseAll: function() {
    _.forEach(this._cubeCache.getAllTiles(), tile => tile.release());
    this._cubeCache.initialize();
  },

  getLines: function() {
    return this._cubeCache.getLines();
  },

  /**
   * @return {Array[Tile]} All the tiles claimed that do not compose lines.
   */
  getSingles: function() {
    return this._cubeCache._singles;
  },

  /**
   * @return {Tile} The first tile selected to be claimed.
   */
  getInitialTile: function() {
    return _.first(this._selectedTiles);
  },

  getAttackTile: function(tile1, tile2) {
    return this._cubeCache._cube.getAttackTile(tile1, tile2);
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

  claimAll: function() {

    _.forEach(this._selectedTiles, function(tile, index, array) {

      // If the tile is already claimed, this is an attack! Release it.
      // Also, replace it with attack data so the recorder will work.
      if (tile.claimedBy) {
        array[index] = this._createAttackData(tile);
        tile.claimedBy.release(tile);
      }

      // Otherwise, claim that sucker.
      else {
        this.claim(tile);
      }
    }, this);

    this.emit('player:claim', this._selectedTiles);
    this._selectedTiles = [];
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

    // If a tile wasn't passed, exit immediately.
    if (!tile) {
      return;
    }

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
      else if (!initialTile.isNeighboringSide(tile)) {
        throw new SelectTileError(SelectTileError.NOT_NEIGHBOR);
      }
    }

    // If the attack tile exists, run even more tests.
    if (attackTile) {

      // If the attack tile is valid, that means both tiles can be selected
      // and everything can be claimed. Exit true as we're done selecting tiles.
      if (this.canAttack(attackTile)) {
        this._selectTiles(tile, attackTile);
        return true;
      }
      else {
        throw new SelectTileError(SelectTileError.TARGET_CLAIMED);
      }
    }

    // Otherwise, the initial tile must have been selected.
    // Emit an event to celebrate this special occasion!
    else {
      this._selectTiles(tile);
    }

    // We still need to select more tiles this turn.
    return false;
  },

  deselectTile: function(tile) {
    _.pull(this._selectedTiles, tile);
    this.emit('player:initialDeselected', tile);
  },

  _createAttackData: function(tile) {
    return {
      player: tile.claimedBy,
      tile: tile,
      toString: function() {
        return '(attack -> ' + tile.toString() + ')'
      }
    };
  },

  _selectTiles: function() {
    if (!this.getInitialTile()) {
      this.emit('player:initialSelected', arguments[0]);
    }
    Array.prototype.push.apply(this._selectedTiles, arguments);
    if (this._selectedTiles.length >= 3) {
      this.claimAll();
    }
  }

};

// Mixin EventEmitter methods.
_.assign(Player.prototype, EventEmitter2.prototype);

// Assign Bot inheritence here because Bot is getting included first.
// Need to switch to modules next go-round. For reals.
// This is cheesey.
(function() {
  var botSelect = Bot.prototype._selectTiles;
  _.assign(Bot.prototype, Player.prototype);
  Bot.prototype._selectTiles = botSelect;
}());
