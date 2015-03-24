class TileSelector {

  constructor(player) {
    this._player = player;
    this.reset();
  }

  reset() {
    this._selected = [];
  }

  validate(tile, attackTile) {

    // Get a reference to the first tile selected.
    var initial = _.first(this._selected),

        // A package of data sent in resolved promises.
        resolveData = {};

    // If a tile wasn't passed, exit immediately.
    if (!tile) {
      return TileSelectorResult.failure();
    }

    // If the tile is already claimed, get outta dodge.
    if (tile.claimedBy) {
      return TileSelectorResult.failure(TileSelectorResult.FAILURE_CLAIMED);
    }

    // If an initial tile exists, run some tests.
    if (initial) {

      // If the initial tile is selected, deselected it and bail out.
      if (tile === initial) {
        return TileSelectorResult.success(
          this._deselect(tile)
        );
      }

      // If the new selected tile is on the same side as the
      // initial tile, deselect the initial tile.
      if (tile.side === initial.side) {
        resolveData = this._deselect(initial);
      }

      // Else, if the side selected is not a neighbor, bail out.
      else if (!initial.isNeighboringSide(tile)) {
        return TileSelectorResult.failure(TileSelectorResult.FAILURE_NOT_NEIGHBOR);
      }
    }

    // If the attack tile exists, run even more tests.
    if (attackTile) {

      // If the attack tile is valid, that means both tiles can be selected
      // and everything can be claimed. Exit true as we're done selecting tiles.
      if (this._player.canAttack(attackTile)) {
        return TileSelectorResult.success(
          _.merge(resolveData, this._select(tile, attackTile))
        );
      }
      else {
        return TileSelectorResult.failure(TileSelectorResult.FAILURE_CANNOT_ATTACK);
      }
    }

    // Otherwise, the initial tile must have been selected. Pass the resolve data
    // along in case a tile was deselected first (as in the side === side case).
    else {
      return TileSelectorResult.success(
        _.merge(resolveData, this._select(tile))
      );
    }

    // We'll probably never make it this far but let's return a promise just in case.
    return TileSelectorResult.failure();
  }

  _select() {
    var tiles = _.toArray(arguments);
    Array.prototype.push.apply(this._selected, tiles);
    return {
      select: tiles,
      length: this._selected.length
    };
  }

  /**
   * Removes a tile from the _selected array and returns a command object
   * describing the action. This object will eventually be passed to a
   * Promise returned from validate().
   * @param  {Tile} tile The tile to remove.
   * @return {Object} A command object describing the action.
   */
  _deselect(tile) {
    _.pull(this._selected, tile);
    return {
      deselect: [tile]
    };
  }

}
