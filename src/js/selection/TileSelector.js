import _ from 'lodash';
import TileSelectorResult from './TileSelectorResult';

/**
 * Instances of this class are used for making valid tile selections
 * and returning results containing data describing the selections.
 * The validate method is the core of TileSelector and is mostly used
 * inside the Player.selectTile wrapper.
 */
class TileSelector {

  /**
   * Constructor method. This sets an internal _player property which is
   * only currently used once (in the attack portion of validate). It also
   * sets the _selected property as an empty array via reset().
   * @param  {Player} player The player bound to this TileSelector instance.
   * @constructor
   */
  constructor(player) {
    this._player = player;
    this.reset();
  }

  /**
   * Resets the _selected array to it's initial empty state.
   */
  reset() {
    this._selected = [];
  }

  /**
   * Removes the last n selections and returns the updated _selected array.
   * @param  {Number} n The number of selections to revert.
   * @return {Array} The updated _selected array.
   */
  revert(n = 1) {
    var slice = _.dropRight(this._selected, n);
    this._selected = slice;
    return slice;
  }

  /**
   * Retrieves the contents of the _selected array.
   * @return {Array} The _selected array.
   */
  getSelected() {
    return this._selected;
  }

  /**
   * Retrieves the first item in the _selected array.
   * @return {Tile} The initial selected tile.
   */
  getInitial() {
    return _.first(this._selected);
  }

  /**
   * Computes whether or not the passed tile or tiles are valid selections.
   * Different test cases include:
   * - Was a tile passed?
   * - Is the tile already claimed?
   * - Is there an initial tile? Should it be deselected? Is it a neighbor?
   * - Was an attack tile passed? Is it a valid target?
   * @param {Tile} tile A tile to validate.
   * @param {Tile} attackTile Another tile to validate.
   * @return {TileSelectorResult} A result object containing data describing the action.
   */
  validate(tile, attackTile) {

    // Get a reference to the first tile selected.
    var initial = this.getInitial(),

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

  /**
   * Adds tiles to the _selected array and returns a command object containing
   * the complete _selected array contents.
   * @param {Tile...} Any number of Tile objects that were selected.
   * @return {Object} A command object describing the action.
   */
  _select() {
    var tiles = _.toArray(arguments);
    Array.prototype.push.apply(this._selected, tiles);
    return {
      selected: this._selected
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

export default TileSelector;
