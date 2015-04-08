import _ from 'lodash';
import Bot from './bot';
import TileSelector from './selection/TileSelector';
import CubeCache from './selection/CubeCache';

function Player(name, tileClass, cube) {
  this.name = name;
  this.tileClass = tileClass;
  this._selector = new TileSelector(this);
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
    return this._selector.getInitial();
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
    var size = this._cubeCache._cube.size;
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

  selectTile: function(tile, attackTile) {
    return this._selector.validate(tile, attackTile);
  },

  claimAll: function() {

    _.forEach(this._selector._selected, function(tile, index, array) {

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

    this._selector.reset();
  },

  /**
   * Checks to see if the player has at least one valid move.
   * Resets the selector after performing the check.
   * @return {Boolean} Does a valid move exist?
   */
  hasValidMoves: function() {
    var hasMove = this.selectRandom();
    this._selector.reset();
    return hasMove;
  },

  /**
   * Makes a random valid selection.
   * @return {Boolean} Was a valid selection made?
   */
  selectRandom: function() {

    /**
     * Given a starting tile, attempt to match two more: a secondary tile
     * and the attack tile.
     * @param  {Tile} initial The starting tile to test.
     * @return {Boolean} Was a successful match made?
     */
    var attempt = initial => {

        // Loop through the tiles until two more selections are valid.
        // If no matches are found, the attempt fails and returns false.
        return _.some(tiles, tile => {

          // Get the attack tile from the initial and tile intersection.
          var attackTile = this.getAttackTile(initial, tile);

          // If the attack tile and loop tile are valid, we're good!
          return attackTile && selector.validate(tile, attackTile).success();
        });
      },

      // Cached reference to the player's selector.
      selector = this._selector,

      // The initial tile, if available. Otherwise undefined.
      initial = selector.getInitial(),

      // An array of all the available tiles for this player.
      tiles = this._cubeCache._cube.getAvailableTiles(initial);

    // If an initial tile is available and a match can be found, return true.
    // This functionality is used by the bot in the last resort selection.
    if (initial && attempt(initial)) {
      return true;
    }

    // Run through all the tiles and try to find a match.
    // If no match is found, false is returned.
    return _.some(tiles, tile => {

      // Reset the selector for a new starting point.
      selector.reset();

      // If the new tile is valid and the attempt to find two more succeeds,
      // there is at least one valid move and true will be returned.
      return selector.validate(tile).success() && attempt(tile);
    });
  },

  _createAttackData: function(tile) {
    return {
      player: tile.claimedBy,
      tile: tile,
      toString: function() {
        return '(attack -> ' + tile.toString() + ')'
      }
    };
  }

};

_.assign(Bot.prototype, Player.prototype);

export default Player;
