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

  /**
   * One of the chainable callbacks, success will either return a boolean
   * describing the success state or itself if a callback is provided.
   * The callback will be invoked if the success state is true.
   * @param  {Function} callback A method to invoke if the success state is true,
   *                             passing the _data value.
   * @return {TileSelectorResult} Returns itself for chaining.
   */
  success(callback) {
    if (!callback) {
      return this._success;
    }
    if (this._success) {
      callback(this._data);
    }
    return this;
  }

  /**
   * The other chainable callback, failure will either return a boolean
   * describing the success state or itself if a callback is provided.
   * The callback will be invoked if the success state is false.
   * @param  {Function} callback A method to invoke if the success state is false,
   *                             passing the _data value.
   * @return {TileSelectorResult} Returns itself for chaining.
   */
  failure(callback) {
    if (!callback) {
      return !this._success;
    }
    if (!this._success) {
      callback(this._data);
    }
    return this;
  }

  /**
   * The recommended method for creating a new successful TileSelectorResult.
   * @param  {Object} data A map describing the success state.
   * @return {TileSelectorResult} A new successful TileSelectorResult.
   * @static
   */
  static success(data) {
    return new TileSelectorResult(true, data);
  }

  /**
   * The recommended method for creating a new failed TileSelectorResult.
   * @param  {String} code The failure code.
   * @return {TileSelectorResult} A new failed TileSelectorResult.
   * @static
   */
  static failure(code) {
    return new TileSelectorResult(false, code);
  }

}

// Failure codes.
TileSelectorResult.FAILURE_CLAIMED = 'claimed';
TileSelectorResult.FAILURE_NOT_NEIGHBOR = 'notNeighbor';
TileSelectorResult.FAILURE_CANNOT_ATTACK = 'cannotAttack';

export default TileSelectorResult;
