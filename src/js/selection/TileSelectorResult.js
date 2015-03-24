/**
 * Used in TileSelector, the TileSelectorResult object provides an
 * easy to use API for interacting with validate calls.
 * In general, these objects should be created with the static methods.
 *
 * Common use cases with TileSelector:
 *
 * var selector = new TileSelector(player);
 *
 * 1.
 * selector.validate(tile).success() -> Returns a boolean
 *
 * 2.
 * selector
 *   .validate(tile)
 *   .success(function(data) {
 *     // Do something with success data.
 *   })
 *   .failure(function(code) {
 *     // React to error code.
 *   });
 */
class TileSelectorResult {

  /**
   * Constructor method. Sets properties intended to be private.
   * @param  {Boolean} success Is the result successful?
   * @param  {String|Object} data A payload describing the result.
   *                              Strings for failure codes and objects for result metadata.
   * @constructor
   */
  constructor(success, data) {
    this._success = success;
    this._data = data;
  }

  success(callback) {
    if (!callback) {
      return this._success;
    }
    if (this._success) {
      callback(this._data);
    }
    return this;
  }

  failure(callback) {
    if (!callback) {
      return !this._success;
    }
    if (!this._success) {
      callback(this._data);
    }
    return this;
  }

  static success(data) {
    return new TileSelectorResult(true, data);
  }

  static failure(code) {
    return new TileSelectorResult(false, code);
  }

}

TileSelector.FAILURE_CLAIMED = 'claimed';
TileSelector.FAILURE_NOT_NEIGHBOR = 'notNeighbor';
TileSelector.FAILURE_CANNOT_ATTACK = 'cannotAttack';
