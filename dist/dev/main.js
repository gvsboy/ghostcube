(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

require('babel/polyfill');

var _Game = require('./game');

var _Game2 = _interopRequireWildcard(_Game);

// Create a new game!
var game = new _Game2['default']('container');

},{"./game":7,"babel/polyfill":"babel/polyfill"}],2:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _Player = require('./player');

var _Player2 = _interopRequireWildcard(_Player);

function Bot(name, tileClass, cube, opponent) {
  _Player2['default'].call(this, name, tileClass, cube);
  this.opponent = opponent;
}

Bot.THINKING_SPEED = 600;

Bot.prototype = {

  /**
   * Run through a list of tile selection commands in order of urgency.
   * For instance, winning moves are more urgent than blocking single tiles.
   * @return {Array} A collection of tiles selected.
   */
  play: function play() {

    // Init log.
    this._logText = '';
    this._log('================== BOT MOVE ==================');

    // Is a bot win possible?
    this._selectLines() ||

    // Is a player (opponent) win possible?
    this._selectOpponentLines() ||

    // Are there available bot singles to extend into lines?
    this._selectSingles() ||

    // Are there available player (opponent) singles to block lines?
    this._selectOpponentSingles() ||

    // Is there any possible move at all?!
    this.selectRandom();

    // Return what we have, which is hopefully a trio of selected tiles.
    return this._selector.getSelected();
  },

  /**
   * Find lines to complete, either to win the game or to block
   * the opponent.
   * @param  {Boolean} useOpponent Should we use the opponent's lines?
   * @return {Boolean} Was a match successful?
   */
  _selectLines: function _selectLines(useOpponent) {
    var _this = this;

    var lines = useOpponent ? this.opponent.getLines() : this.getLines();
    this._log('++++++ LINES' + (useOpponent ? ' OPPONENT:' : ':'), lines);

    return _import2['default'].some(lines, function (line) {

      var initial = _this.getInitialTile(),
          tile = line.missingTiles()[0],
          attack;

      _this._log('+++ lines loop [initial, tile] :', initial, tile);

      // If there's a tile selected already, try to seal the deal with two more.
      if (initial && tile) {
        attack = _this.getAttackTile(initial, tile);
        return attack && _this.selectTile(tile, attack).success();
      } else {
        _this.selectTile(tile);
      }
    });
  },

  /**
   * Block the opponent's lines to prevent a win.
   * Relies on _selectLines.
   * @return {Boolean} Was a match successful?
   */
  _selectOpponentLines: function _selectOpponentLines() {
    return this._selectLines(true);
  },

  /**
   * Find singles to surround, either to build bot lines or to block the
   * opponent from building lines.
   * @param  {Boolean} useOpponent Should we use the opponent's singles?
   * @return {Boolean} Was a match successful?
   */
  _selectSingles: function _selectSingles(useOpponent) {
    var _this2 = this;

    var singles = _import2['default'].shuffle(useOpponent ? this.opponent.getSingles() : this.getSingles());
    this._log('------ SINGLES' + (useOpponent ? ' OPPONENT:' : ':'), singles);

    return _import2['default'].some(singles, function (single) {

      var initial = _this2.getInitialTile(),
          tile,
          attack;

      // If there is no initial tile or this singles selection is on a neighboring
      // side, make a selection attempt.
      if (!initial || single.isNeighboringSide(initial)) {
        tile = _this2._selectByTileLine(single);
      }

      _this2._log('--- singles loop [initial, tile] :', initial, tile);

      if (initial && tile) {
        attack = _this2.getAttackTile(initial, tile);
        _this2._selector.revert();
        return attack && _this2.selectTile(tile, attack).success();
      }
    });
  },

  /**
   * Surround opponent's singles to block further line creation.
   * Relies on _selectSingles.
   * @return {Boolean} Was a match successful?
   */
  _selectOpponentSingles: function _selectOpponentSingles() {
    return this._selectSingles(true);
  },

  /**
   * Attempts to select a tile on the same line as the given tile.
   * Scans both x and y lines, shuffling the collection.
   * @param  {Tile} tile The target tile.
   * @return {Tile} The selected tile.
   */
  _selectByTileLine: function _selectByTileLine(tile) {
    var _this3 = this;

    // Grab all the tiles on the same line as the passed tile.
    var lineTiles = _import2['default'].shuffle(tile.getAllLineTiles());

    // Return the first tile that is a valid selection.
    return _import2['default'].find(lineTiles, function (lineTile) {
      return _this3.selectTile(lineTile).success();
    });
  },

  /**
   * A simple logging mechanism to record the bot's thoughts.
   * Used in the Recorder object which looks for the _logText property.
   */
  _log: function _log() {

    var text = _import2['default'].reduce(arguments, function (lines, data) {
      lines.push(!_import2['default'].isEmpty(data) ? data.toString() : 'NONE');
      return lines;
    }, []).join(' ');

    // Immediately output the message in the console.
    //console.log(text);

    // Append the text to the master log.
    this._logText += text + '\n';
  }

};

exports['default'] = Bot;
module.exports = exports['default'];

},{"./player":9,"lodash":"lodash"}],3:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _Side = require('./side');

var _Side2 = _interopRequireWildcard(_Side);

var _import3 = require('../util/vendor');

var vendor = _interopRequireWildcard(_import3);

function Cube(el, size) {

  // The HTML element representing the cube.
  this.el = el;

  // The cube's size regarding tiles across a side. Default to 3.
  this.size = size || 3;

  // Cached reference to the style object.
  this.style = this.el.style;

  // This will be set in beginGame.
  this._sides = null;

  this._eventMap = {};
}

Cube.ROTATE_X_PREFIX = 'rotateX(';
Cube.ROTATE_Y_PREFIX = 'rotateY(';
Cube.ROTATE_UNIT_SUFFIX = 'deg)';
Cube.REVOLUTION = 360;
Cube.ROTATION_UNIT = 90;
Cube.ORIGIN = 0;

Cube.prototype = {

  /**
   * Builds the game-mode version of the cube, slowing down the idle state
   * to a stop and transitioning to the center of the screen. The initial
   * rotation coordinate values are set and the sides are generated with their
   * child tiles.
   * @return {Promise} A promise that resolves when the transition ends.
   */
  build: function build() {
    var _this = this;

    // Create the game sides. The tiles will animate into existence from a
    // trigger function during each side's creation.
    this._sides = this._buildSides(this.size);

    // Set the initial rotated state. Cut at 45 degrees to always display three sides.
    this.x = this.y = Cube.REVOLUTION - Cube.ROTATION_UNIT / 2;

    return new Promise(function (resolve) {

      // A reference to the cube's element.
      var el = _this.el;

      // After the cube's rotation animation has made one loop, begin to slow it down.
      el.addEventListener(vendor.events.animationIteration, function () {
        el.classList.add('transition');
        el.addEventListener(vendor.events.animationEnd, function animEnd(evt) {
          if (evt.target === el) {

            // Remove the transition class and append the init class. Done!
            el.classList.remove('transition');
            el.classList.add('init');

            // Let's go!
            resolve();
          }
        });
      });
    });
  },

  /**
   * Sets a renderer so the cube can render itself. This is a bit hacky; please find
   * another way to accomplish self-rendering.
   * @param {Renderer} renderer The renderer to set on the cube.
   */
  setRenderer: function setRenderer(renderer) {
    this._renderer = renderer;
  },

  rotate: function rotate(x, y) {
    this.x = this._calculateCoordinate(this.x, x);
    this.y = this._calculateCoordinate(this.y, y);

    this.style[vendor.js.transform] = Cube.ROTATE_X_PREFIX + this.x + Cube.ROTATE_UNIT_SUFFIX + ' ' + Cube.ROTATE_Y_PREFIX + this.y + Cube.ROTATE_UNIT_SUFFIX;
  },

  /**
   * Calculate the rotation needed to display all the given tiles which
   * must be neighbors to each other (for obvious reasons).
   * @param  {Array} tiles A collection of tiles (three maximum).
   * @return {Promise} A promise that resolves when the rotation is complete.
   */
  rotateToTiles: function rotateToTiles(tiles) {
    var _this2 = this;

    // First, collect all the common coordinates each tile shares when visible.
    var pairs = this._getCommonVisibleCoordinates(tiles),

    // Next, get calculate the shortest rotation distance from the pairs.
    coors = this._getShortestRotationDistance(pairs);

    // Return a promise that will resolve when the cube's rotation render completes.
    return new Promise(function (resolve) {
      _this2._renderer.setMovement(coors[0], coors[1]).then(resolve);
    });
  },

  listenTo: function listenTo(eventName, callback, context) {

    var events = this._eventMap,
        handler = _import2['default'].bind(callback, context || this);

    if (!events[eventName]) {
      events[eventName] = [];
    }

    this._eventMap[eventName].push(handler);
    this.el.addEventListener(eventName, handler);

    return this;
  },

  stopListeningTo: function stopListeningTo(eventName) {

    _import2['default'].forEach(this._eventMap[eventName], function (handler) {
      this.el.removeEventListener(eventName, handler);
    }, this);

    return this;
  },

  /**
   * Fetches a cube side by name (e.g. 'top')
   * @param  {String} name The name of the side you want.
   * @return {Side}      The Side object by name.
   */
  getSides: function getSides(name) {
    return name ? this._sides[name] : this._sides;
  },

  /**
   * @return {Array} The three visible sides.
   */
  getVisibleSides: function getVisibleSides() {},

  /**
   * Retrieves all the unclaimed tiles and sorts them by the amount per
   * side in ascending order. If an exception tile is passed, do not include
   * unclaimed tiles from that tile's side.
   * @param  {Tile} except The tile whose side to exclude.
   * @return {Array} A list of all the available tiles.
   */
  getAvailableTiles: function getAvailableTiles(except) {

    // Get all the tiles by side and push each array to the main array list.
    var tilesBySide = _import2['default'].reduce(this.getSides(), function (list, side) {
      if (!except || side !== except.side) {
        list.push(_import2['default'].shuffle(side.getAvailableTiles()));
      }
      return list;
    }, []);

    // Sort each side's array by length and then flatten the whole thing.
    return _import2['default'].flatten(_import2['default'].sortBy(tilesBySide, 'length'));
  },

  /**
   * Updates the passed tile and all related adjacent tiles with the
   * passed callback. This method is mostly used for highlighting tiles
   * to help the user make strategy decisions easier.
   * @param  {DOMElement}   tile The selected tile as a raw DOM element.
   * @param  {Function}     callback   The method to invoke passing each tile as an argument.
   */
  updateCrosshairs: function updateCrosshairs(tile, callback) {

    // Run the callback on all tiles in the lines associated with the given tile.
    _import2['default'].forEach(tile.getAllLineTiles(), callback);

    // For each neighbor, pass in the side and the orientation id (e.g. 'left').
    _import2['default'].forEach(tile.side.getNeighbors(), function (neighbor) {

      // Find the translated tiles and run the callback on each.
      _import2['default'].forEach(tile.translate(neighbor), callback);
    });
  },

  /**
   * Gets the tile where the two passed tile's coordinates intersect.
   * @param {Tile} [tile1] The first tile selected.
   * @param {Tile} [tile2] The second tile selected.
   * @return {Tile}       The tile being attacked.
   */
  getAttackTile: function getAttackTile(tile1, tile2) {
    var _this3 = this;

    var neighbors, side;

    if (tile1 && tile2 && tile1.isNeighboringSide(tile2)) {

      // Get the neighbor sides and exclude the selected side.
      neighbors = _import2['default'].without(tile2.side.getNeighbors(), tile1.side),

      // Get the neighbor that is visible.
      side = _import2['default'].find(neighbors, function (neighbor) {
        return neighbor.isVisible(_this3.x, _this3.y);
      });

      // Return the tile that intersects the two passed tiles.
      return _import2['default'].intersection(tile1.translate(side), tile2.translate(side))[0];
    }

    return null;
  },

  /**
   * Given a current coordinate, update it with the difference.
   * If the result is out of the revolution bounds (between 0 and 360),
   * adjust it to a valid value.
   * @param  {Number} current    The current coordinate value.
   * @param  {Number} difference The value to update the current coordinate by.
   * @return {Number}            The normalized result.
   */
  _calculateCoordinate: function _calculateCoordinate(current, difference) {

    var REVOLUTION = Cube.REVOLUTION,
        result = current + difference;

    if (result > REVOLUTION) {
      result = result - REVOLUTION;
    } else if (result <= Cube.ORIGIN) {
      result = REVOLUTION - result;
    }

    return result;
  },

  /**
   * Calculates all the possible x/y coordinate combinations that exist
   * where all the given tiles will be visible.
   * @param  {Array} tiles The tiles to test.
   * @return {Array}       A collection of valid coordinate collections.
   *                       e.g. [[225, 225], [315, 45]]
   */
  _getCommonVisibleCoordinates: function _getCommonVisibleCoordinates(tiles) {

    // Collect the visibility map of each passed tile into an array.
    var visibilityMap = _import2['default'].map(tiles, function (tile) {
      return tile.side._visibilityMap;
    }),

    // Find all the x coordinates shared by all the tiles.
    xCoors = _import2['default'].intersection.apply(_import2['default'], _import2['default'].map(visibilityMap, function (map) {
      return _import2['default'].map(_import2['default'].keys(map), _import2['default'].parseInt);
    })),

    // Given the available x coordinates, find the shared y coordinates.
    yCoors = _import2['default'].flatten(_import2['default'].map(xCoors, function (coor) {
      return _import2['default'].intersection.apply(_import2['default'], _import2['default'].pluck(visibilityMap, coor));
    }));

    // Return a collection of x/y collections shared among all the passed tiles.
    return _import2['default'].zip(xCoors, yCoors);
  },

  /**
   * Calculates the shortest rotation distance between an origin coordinate
   * and a target coordinate. Accounts for the circular continuation loop from 360
   * to 0 and the reverse.
   * @param  {Number} originCoor The coordinate you're currently at.
   * @param  {Number} targetCoor The coordinate you wish to be at.
   * @return {Number}            The shortest rotation movement to reach the target.
   */
  _getShortestCoordinateDiff: function _getShortestCoordinateDiff(originCoor, targetCoor) {

    var revolution = Cube.REVOLUTION,
        diff = targetCoor - originCoor;

    // If the absolute difference is more than half of a revolution, we need to
    // take the circular continuation into account to get the shortest distance.
    if (Math.abs(diff) > revolution / 2) {

      // If the target is higher than the origin, we need to go into reverse.
      if (targetCoor > originCoor) {
        diff = targetCoor - revolution - originCoor;
      }

      // Otherwise, let's move ahead.
      else {
        diff = revolution - originCoor + targetCoor;
      }
    }

    return diff;
  },

  /**
   * Calculates the shortest rotation distance given a collection of
   * coordinate pairs. This method is meant to be used with data provided
   * by _getCommonVisibleCoordinates.
   * @param  {Array} pairs A collection of coordinate pairs.
   * @return {Array}       A single coordinate pair. e.g. [45, 135]
   */
  _getShortestRotationDistance: function _getShortestRotationDistance(pairs) {

    return _import2['default'].reduce(pairs, function (lowest, current) {

      // First, determine shortest differences for each coordinate so we can
      // compare them to a previous lowest pair.
      var diff = [this._getShortestCoordinateDiff(this.x, current[0]), this._getShortestCoordinateDiff(this.y, current[1])];

      // If a lowest pair hasn't been set yet or the sum of the current coor
      // differences is less than the previously set lowest pair's, then return
      // the current pair as the lowest.
      if (!lowest || Math.abs(diff[0]) + Math.abs(diff[1]) < Math.abs(lowest[0]) + Math.abs(lowest[1])) {
        return diff;
      }

      // Otherwise, return the lowest.
      return lowest;
    }, null, this);
  },

  _buildSides: function _buildSides(size) {

    // Create sides.
    var sides = _import2['default'].reduce(this.el.children, function (list, el) {
      list[el.id] = new _Side2['default'](el, size);
      return list;
    }, {});

    var TOP = sides.top,
        BOTTOM = sides.bottom,
        FRONT = sides.front,
        BACK = sides.back,
        LEFT = sides.left,
        RIGHT = sides.right;

    // Pretty crappy ... FOR TESTING ONLY!
    var neighborMap = {
      top: [BACK, FRONT, LEFT, RIGHT],
      bottom: [FRONT, BACK, LEFT, RIGHT],
      front: [TOP, BOTTOM, LEFT, RIGHT],
      back: [BOTTOM, TOP, LEFT, RIGHT],
      left: [TOP, BOTTOM, BACK, FRONT],
      right: [TOP, BOTTOM, FRONT, BACK]
    };

    var visibilityMap = {
      // x: [y]
      front: {
        '315': [45, 315],
        '45': [45, 315],
        '135': [135, 225],
        '225': [135, 225]
      },

      back: {
        '315': [135, 225],
        '45': [135, 225],
        '135': [45, 315],
        '225': [45, 315]
      },

      top: {
        '315': [45, 135, 225, 315],
        '225': [45, 135, 225, 315]
      },

      bottom: {
        '135': [45, 135, 225, 315],
        '45': [45, 135, 225, 315]
      },

      left: {
        '315': [45, 135],
        '45': [45, 135],
        '135': [225, 315],
        '225': [225, 315]
      },

      right: {
        '315': [225, 315],
        '45': [225, 315],
        '135': [45, 135],
        '225': [45, 135]
      }
    };

    // Now set the neighbors for each side.
    return _import2['default'].forIn(sides, function (side) {
      side.setNeighbors(neighborMap[side.id]);
      side.setVisibilityMap(visibilityMap[side.id]);
    });
  }

};

exports['default'] = Cube;
module.exports = exports['default'];

},{"../util/vendor":19,"./side":5,"lodash":"lodash"}],4:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

/**
 * Lines represent tiles in either a horizontal or vertical row
 * which serve as points or win states.
 * @param {Array} tiles  A collection of tiles that compose the line.
 */
function Line(tiles) {
  this.side = _import2['default'].first(tiles).side;
  this.update(tiles);
}

Line.prototype = {

  /**
   * Outputs useful identifying information for troubleshooting.
   * @return {String} String information.
   */
  toString: function toString() {
    var info = _import2['default'].reduce(this.getTiles(), function (tiles, tile) {
      tiles.push(tile.toString());
      return tiles;
    }, []);
    return '(' + info.join(' ') + ')';
  },

  /**
   * Checks to see if the line contains all of the passed tiles.
   * @param  {Array} tiles The tiles to check.
   * @return {Boolean} Does the line contain the passed tiles?
   */
  all: function all(tiles) {
    var lineTiles = this.getTiles();
    return _import2['default'].every(tiles, function (tile) {
      return _import2['default'].includes(lineTiles, tile);
    });
  },

  /**
   * Checks to see if all the tiles in the line are included in
   * the passed tiles array.
   * @param  {[type]} tiles [description]
   * @return {[type]}       [description]
   */
  some: function some(tiles) {
    return _import2['default'].every(this.getTiles(), function (tile) {
      return _import2['default'].includes(tiles, tile);
    });
  },

  update: function update(tiles) {
    this._tiles = tiles;
  },

  /**
   * Updates the UI to display a winning state involving the line.
   */
  pulsate: function pulsate() {
    _import2['default'].forEach(this.getTiles(), function (tile) {
      return tile.addClass('win');
    });
  },

  /**
   * Reports whether or not the line is horizontal by checking the
   * index difference between two adjacent tiles.
   * @return {Boolean} Is this line horizontal?
   */
  isHorizontal: function isHorizontal() {
    var tiles = this.getTiles();
    return _import2['default'].includes(tiles[0].xLine.getTiles(), tiles[1]);
  },

  /**
   * @return {Array} A collection of tiles that compose the line.
   */
  getTiles: function getTiles() {
    return this._tiles;
  },

  /**
   * @return {Number} The number of tiles in the line.
   */
  length: function length() {
    return this._tiles.length;
  },

  /**
   * @return {Array} The indicies of all the tiles.
   */
  indicies: function indicies() {
    return _import2['default'].map(this.getTiles(), 'index');
  },

  /**
   * @return {Array} A collection of the missing tiles.
   */
  missingTiles: function missingTiles() {

    var tiles = this.getTiles(),

    // Are we matching against a horizontal or vertical line?
    matchedLine = this.isHorizontal() ? _import2['default'].first(tiles).xLine : _import2['default'].first(tiles).yLine;

    // Now we can figure out which tiles are missing by diffing the two lines.
    return _import2['default'].xor(tiles, matchedLine.getTiles());
  },

  // Rotate in place, like a Tetrad. For instance:
  // xoo      xxx
  // xoo  ->  ooo
  // xoo      ooo
  rotate: function rotate() {

    // Where the line begins, starting from top-left.
    var originIndex = _import2['default'].first(this.getTiles()).index;

    if (this.isHorizontal()) {
      return this.side.getTiles(originIndex + originIndex / this.length())[0].yLine;
    }

    return this.side.getTiles(originIndex * this.length())[0].xLine;
  },

  // Flip across a median. For instance:
  //    xoo      oox
  //    xoo  ->  oox
  //    xoo      oox
  flip: function flip() {

    // Where the line begins, starting from top-left.
    var originIndex = _import2['default'].first(this.getTiles()).index,

    // The middle line.
    middle;

    if (this.isHorizontal()) {

      // The middle row, which is the size squared cut in half and floored.
      // NOTE: This could be buggy with other sizes!
      middle = Math.floor(Math.pow(this.length(), 2) / 2 - 1);

      // Determine the difference and get the calculated x line.
      return this.side.getTiles(middle * 2 - originIndex)[0].xLine;
    }

    // The middle column.
    middle = (this.length() - 1) / 2;

    // Determine the difference and get the calculated y line.
    return this.side.getTiles(middle * 2 - originIndex)[0].yLine;
  }

};

exports['default'] = Line;
module.exports = exports['default'];

},{"lodash":"lodash"}],5:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _Tile = require('./tile');

var _Tile2 = _interopRequireWildcard(_Tile);

var _Line = require('./line');

var _Line2 = _interopRequireWildcard(_Line);

function Side(el, size) {

  // HTML element representing the side.
  this.el = el;

  // The face id (top, bottom, front, back, left, right).
  this.id = el.id;

  // This will be set using setNeighbors().
  this._neighbors = {};

  // An array of all the tiles by index.
  this._tiles = this._buildTiles(size);
}

Side.prototype = {

  getNeighbors: function getNeighbors() {
    return this._neighbors;
  },

  setNeighbors: function setNeighbors(sides) {
    this._neighbors = sides;
  },

  /**
   * A check to determine if the passed side is one of this side's neighbors.
   * @param  {Side}  side The side object to check.
   * @return {Boolean}      Is the passed side a neighbor?
   */
  isNeighbor: function isNeighbor(side) {
    return _import2['default'].contains(this._neighbors, side);
  },

  setVisibilityMap: function setVisibilityMap(map) {
    this._visibilityMap = map;
  },

  isVisible: function isVisible(cubeX, cubeY) {
    return _import2['default'].contains(this._visibilityMap[cubeX], cubeY);
  },

  /**
   * Fetches specific tiles referenced by the passed indicies,
   * or all tiles if indicies are not passed.
   * @param  {[String|Number|Number[]]} indicies An array of indicies.
   * @return {Tile[]}          An array of selected tiles.
   */
  getTiles: function getTiles(indicies) {
    if (_import2['default'].isUndefined(indicies)) {
      return this._tiles;
    }
    return _import2['default'].at(this._tiles, _import2['default'].isArray(indicies) ? _import2['default'].uniq(_import2['default'].flatten(indicies)) : +indicies);
  },

  /**
   * Returns all the tiles that are still unclaimed.
   * @return {Array} A collection of unclaimed tiles.
   */
  getAvailableTiles: function getAvailableTiles() {
    return _import2['default'].reject(this._tiles, 'claimedBy');
  },

  _buildTiles: function _buildTiles(size) {
    var _this = this;

    // First let's create an array of tiles based on the cube size.
    var tiles = _import2['default'].times(Math.pow(size, 2), function (index) {
      return new _Tile2['default'](_this, index);
    }),

    // Now we'll create lines from the tiles.
    lines = {

      // Creating x coordinate lines.
      x: _import2['default'].times(size, function (n) {
        return new _Line2['default'](tiles.slice(n * size, (n + 1) * size));
      }),

      // Creating y coordinate lines.
      y: _import2['default'].times(size, function (n) {
        var arr = _import2['default'].times(size, function (i) {
          return n + i * size;
        });
        return new _Line2['default'](_import2['default'].at(tiles, arr));
      })
    };

    // For each tile, assign the correct lines.
    _import2['default'].forEach(tiles, function (tile, index) {

      var mod = index % size,
          xLine = lines.x[(index - mod) / size],
          yLine = lines.y[mod];

      tile.updateLines(xLine, yLine);
    });

    // Return the tiles.
    return tiles;
  }

};

exports['default'] = Side;
module.exports = exports['default'];

},{"./line":4,"./tile":6,"lodash":"lodash"}],6:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _events = require('../util/vendor');

var _listenOnce = require('../util/util');

function Tile(side, index) {

  // Set properties.
  this.el = this.build(side.id + '-' + index);
  this.side = side;
  this.index = index;

  this.claimedBy = null;
  this.xLine = null;
  this.yLine = null;

  // Append the tile's element to the side.
  side.el.appendChild(this.el);
}

Tile.prototype = {

  /**
   * Outputs useful identifying information for troubleshooting.
   * @return {String} Tile information.
   */
  toString: function toString() {
    return this.el.id;
  },

  build: function build(id) {
    var _this = this;

    // Create the tile element.
    var el = document.createElement('div');
    el.id = id;
    el.className = 'tile';

    // Initialize after a random time. This begins the tile drop animation.
    window.setTimeout(function () {
      return _this.addClass('init');
    }, Math.random() * 2000);

    // debug
    //var idData = id.split('-');
    //el.appendChild(document.createTextNode(idData[0].slice(0, 2) + idData[1]));

    return el;
  },

  claim: function claim(player) {
    var _this2 = this;

    this.claimedBy = player;
    this.removeClass('unclaimed').addClass('preclaimed').addClass(player.tileClass);

    _listenOnce.listenOnce(this.el, _events.events.animationEnd, function () {
      _this2.removeClass('preclaimed').addClass('claimed');
    });
  },

  release: function release() {
    if (this.claimedBy) {
      this.addClass('unclaimed').removeClass('claimed').removeClass(this.claimedBy.tileClass).removeClass('win');
      this.claimedBy = null;
    }
  },

  isNeighboringSide: function isNeighboringSide(tile) {
    return this.side.isNeighbor(tile.side);
  },

  addClass: function addClass(name) {
    this.el.classList.add(name);
    return this;
  },

  removeClass: function removeClass(name) {
    this.el.classList.remove(name);
    return this;
  },

  updateLines: function updateLines(x, y) {
    this.xLine = x;
    this.yLine = y;
  },

  /**
   * @return {Array} All the tiles composing both lines.
   */
  getAllLineTiles: function getAllLineTiles() {
    return _import2['default'].union(this.xLine.getTiles(), this.yLine.getTiles());
  },

  translate: function translate(toSide) {

    // A translation is a recipe for morphing one line into another.
    // It looks like this: [1, flip]
    // Where: The first index is the coordinate to use in a line pair
    //        The remaining indicies are methods to invoke on the line
    var translation = Tile.translationMap[this.side.id][toSide ? toSide.id : null],

    // The line from the line pair to use.
    line = _import2['default'].first(translation) === 'x' ? this.xLine : this.yLine;

    if (translation) {

      // Run through each translation method (flip, rotate) and return the result.
      var newLine = _import2['default'].reduce(_import2['default'].rest(translation), function (transformedLine, method) {
        return transformedLine[method]();
      }, line);

      return toSide.getTiles(newLine.indicies());
    }

    return null;
  }

};

Tile.translationMap = (function () {

  var X = 'x',
      Y = 'y',
      FLIP = 'flip',
      ROTATE = 'rotate';

  // Line coordinate mapping to side id.
  // [coordinate, methods...]
  return {

    front: {
      top: [Y], // top
      bottom: [Y], // bottom
      left: [X], // left
      right: [X] // right
    },

    back: {
      bottom: [Y, FLIP], // top
      top: [Y, FLIP], // bottom
      left: [X], // left
      right: [X] // right
    },

    top: {
      back: [Y, FLIP], // top
      front: [Y], // bottom
      left: [X, ROTATE], // left
      right: [X, FLIP, ROTATE] },

    bottom: {
      front: [Y], // top
      back: [Y, FLIP], // bottom
      left: [X, FLIP, ROTATE], // left
      right: [X, ROTATE] // right
    },

    left: {
      top: [Y, ROTATE], // top
      bottom: [Y, FLIP, ROTATE], // bottom
      back: [X], // left
      front: [X] // right
    },

    right: {
      top: [Y, FLIP, ROTATE], // top
      bottom: [Y, ROTATE], // bottom
      front: [X], // left
      back: [X] // right
    }
  };
})();

exports['default'] = Tile;
module.exports = exports['default'];
// right

},{"../util/util":18,"../util/vendor":19,"lodash":"lodash"}],7:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _Cube = require('./cube/cube');

var _Cube2 = _interopRequireWildcard(_Cube);

var _Player = require('./player');

var _Player2 = _interopRequireWildcard(_Player);

var _Bot = require('./bot');

var _Bot2 = _interopRequireWildcard(_Bot);

var _Renderer = require('./render/renderer');

var _Renderer2 = _interopRequireWildcard(_Renderer);

var _Recorder = require('./recorder');

var _Recorder2 = _interopRequireWildcard(_Recorder);

var _Messages = require('./messages');

var _Messages2 = _interopRequireWildcard(_Messages);

var _Tutorial = require('./tutorial');

var _Tutorial2 = _interopRequireWildcard(_Tutorial);

var _listenOnce = require('./util/util');

var _events = require('./util/vendor');

function Game(containerId) {

  // The site container which houses the cube and intro text.
  this.container = document.getElementById(containerId);

  // Check if the client is on a mobile device.
  this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

  // The fun part!
  this.cube = new _Cube2['default'](this.container.querySelector('.cube'));

  // UI for displaying various messages.
  this.messages = new _Messages2['default']();

  // An object that detects user interaction to manipulate the cube.
  this.renderer = new _Renderer2['default'](this.cube, this.isMobile);

  // In-game players.
  this.players = null;
  this.currentPlayer = null;

  // Cross-selected tile for helping attacks.
  this._helperTile = null;

  // Records moves as they're made. Can be used to step through time.
  this.recorder = new _Recorder2['default'](this);

  // Listen for user interactions.
  this.idle();
}

Game.prototype = {

  /**
   * Configures the cube object's default pre-game state.
   */
  idle: function idle() {
    var _this = this;

    var container = this.container,
        hitbox = container.querySelector('#hit');

    // Click the cube to begin the game.
    _listenOnce.listenOnce(hitbox, 'click', function () {

      hitbox.style.display = 'none';
      container.classList.add('game');
      _this._initializeTutorial();

      _listenOnce.listenOnce(container, _events.events.animationEnd, function () {
        _this.cube.build().then(_import2['default'].bind(_this.initializeGame, _this));
      });
    });
  },

  /**
   * Configures the cube for game mode by creating players, setting listeners,
   * and initializing the renderer.
   */
  initializeGame: function initializeGame() {

    // Create the players: A human and a bot.
    var human = new _Player2['default']('Player', 'player1', this.cube),
        bot = new _Bot2['default']('CPU', 'player2', this.cube, human);

    this.players = [human, bot];

    // Begin the rendering.
    this.renderer.initialize();

    // Let's clear the helper tile when the cube is rotating.
    this.renderer.on('start', _import2['default'].bind(this.clearHelperTile, this));

    // Set the current player as the first player. This "officially" begins the game.
    this.setCurrentPlayer(_import2['default'].first(this.players));
  },

  enableCubeInteraction: function enableCubeInteraction() {
    this.renderer.listenForInput();
    this.cube.listenTo('click', this._handleClick, this).listenTo('mouseover', this._handleMouseOver, this).listenTo('mouseout', this._handleMouseOut, this);
  },

  disableCubeInteraction: function disableCubeInteraction() {
    this.renderer.stopListeningForInput();
    this.cube.stopListeningTo('click').stopListeningTo('mouseover').stopListeningTo('mouseout');
  },

  /**
   * Sets the current player to the passed player, displaying the correct
   * messaging and updating the UI state.
   * @param {Player} player    The player to set as the current player.
   * @param {Boolean} botManual Should the bot play it's turn automatically?
   *                            Used in recorder mode to pause auto playback.
   */
  setCurrentPlayer: function setCurrentPlayer(player, botManual) {

    // Broadcast that it's the passed player's turn.
    this.messages.add(player.name + '\'s turn!', 'alert');

    // Don't set the same player twice.
    if (this.currentPlayer !== player) {

      this.cube.el.classList.add(player.tileClass + '-turn');
      if (this.currentPlayer) {
        this.cube.el.classList.remove(this.currentPlayer.tileClass + '-turn');
      }

      this.currentPlayer = player;

      // If the player has valid moves, start the turn as usual.
      if (player.hasValidMoves()) {
        if (player.isBot()) {
          this.disableCubeInteraction();
          if (!botManual) {
            this._botTileSelection(player.play());
          }
        } else {
          this.enableCubeInteraction();
        }
      }

      // Otherwise, declare a stalemate. Nobody wins.
      else {
        this._stalemate();
      }
    }
  },

  getOpponent: function getOpponent(player) {
    return this.players[this.players.indexOf(player) === 1 ? 0 : 1];
  },

  showCrosshairs: function showCrosshairs(tile) {
    tile.addClass('selected');
    this.cube.updateCrosshairs(tile, function (tile) {
      return tile.addClass('highlighted');
    });
  },

  hideCrosshairs: function hideCrosshairs(tile) {
    tile.removeClass('selected');
    this.cube.updateCrosshairs(tile, function (tile) {
      return tile.removeClass('highlighted');
    });
  },

  clearHelperTile: function clearHelperTile() {
    if (this._helperTile) {
      this._helperTile.removeClass('helper');
    }
    this._helperTile = null;
  },

  /**
   * Instantiates a tutorial instance and hooks into methods that should
   * emit lesson messages.
   */
  _initializeTutorial: function _initializeTutorial() {
    this.tutorial = new _Tutorial2['default']();
    this.tutorial.hook(this, 'initializeGame', 'start').hook(this, 'showCrosshairs', 'click').hook(this, '_endTurn', 'turn');
    this.messages.listenTo(this.tutorial);
  },

  /**
   * Ends the current player's turn and determines if the game is
   * in a win state.
   * @param  {Array} tiles The tiles selected to end the turn.
   */
  _endTurn: function _endTurn(tiles) {

    var player = this.currentPlayer,
        lines = player.getWinLines();

    this.recorder.record(player, tiles);
    this.clearHelperTile();
    this.hideCrosshairs(_import2['default'].first(tiles));

    // If the player has made at least one line, end the game.
    if (!this._endGame(lines)) {
      this.setCurrentPlayer(this.getOpponent(player));
    }
  },

  /**
   * Attempts to end the game.
   * @param  {Array} lines The lines used to win.
   * @return {Boolean} Is the game in a win state?
   */
  _endGame: function _endGame(lines) {

    var winBy = lines.length,
        modifier;

    if (winBy) {

      // Display message with modifier.
      modifier = winBy > 1 ? ' x' + winBy + '!' : '!';
      this.messages.add('' + this.currentPlayer.name + ' wins' + modifier, 'alert persist');

      // Show the winning lines.
      _import2['default'].invoke(lines, 'pulsate');

      // Alert the user on how to start a new game.
      this._waitAndListenForReset();

      // Yes, the game has ended.
      return true;
    }

    // Nobody has won yet. Continue!
    return false;
  },

  /**
   * Reveal messages regarding the stalemate and begin listening to
   * start a new game.
   */
  _stalemate: function _stalemate() {
    this.messages.add('stalemate', 'alert persist').add('' + this.currentPlayer.name + ' has no valid moves.', 'persist');
    this._waitAndListenForReset();
  },

  /**
   * After a brief pause, alerts the user about how to start a new game
   * and sets a listener.
   */
  _waitAndListenForReset: function _waitAndListenForReset() {
    var _this2 = this;

    // Remove the current player and disable cube interactions.
    this.currentPlayer = null;
    this.disableCubeInteraction();

    // After two seconds, display a message to begin a new game and
    // listen for document clicks to reset.
    setTimeout(function () {
      _this2.messages.add('newGame', 'persist');
      _listenOnce.listenOnce(document, 'click', _import2['default'].bind(_this2._resetGameState, _this2));
    }, 2000);
  },

  /**
   * Removes all claimed tiles from each player and destroys all messages.
   * Sets the current player to the first player in the array.
   */
  _resetGameState: function _resetGameState() {
    var _this3 = this;

    this.messages.removeAll();
    this.cube.el.classList.add('reset');

    this.renderer.setSyncMovement(450, 450).then(function () {
      _import2['default'].forEach(_this3.players, function (player) {
        return player.releaseAll();
      });
      _this3.cube.el.classList.remove('reset');
      _this3.setCurrentPlayer(_import2['default'].first(_this3.players));
    });
  },

  // Potentially dangerous as this is hackable...
  // Perhaps do a straigh-up element match too?
  _getTileFromElement: function _getTileFromElement(el) {
    var data;
    if (el.classList.contains('tile')) {
      data = el.id.split('-');
      return this.cube.getSides(data[0]).getTiles(data[1])[0];
    }
    return null;
  },

  /**
   * Claimes all the tiles the bot has selected and updates the UI using a
   * flow the user is familiar with.
   * @param  {Array} tiles The tiles the bot has selected.
   */
  _botTileSelection: function _botTileSelection(tiles) {
    var _this4 = this;

    /**
     * A simple function that returns a promise after after the bot is
     * finished 'thinking'.
     * @return {Promise} A promise resolved after a set period of time.
     */
    var wait = function wait() {
      return new Promise(function (resolve) {
        setTimeout(resolve, _Bot2['default'].THINKING_SPEED);
      });
    };

    // Wait a moment before running through the selection UI updates, which
    // include rotating the cube to display all the tiles, showing crosshairs
    // for the first tile, and then claiming all before ending the turn.
    wait().then(function () {
      return _this4.cube.rotateToTiles(tiles);
    }).then(wait).then(function () {
      return _this4.showCrosshairs(tiles[0]);
    }).then(wait).then(function () {
      _this4.currentPlayer.claimAll();
      _this4._endTurn(tiles);
    });
  },

  _handleClick: function _handleClick(evt) {
    var _this5 = this;

    // Get the target element from the event.
    var tile = this._getTileFromElement(evt.target);

    // If the tile exists, try to select it.
    if (tile) {
      this.currentPlayer.selectTile(tile, this._helperTile)

      // On success, react based on the number of tiles currently selected.
      .success(function (data) {

        // Cache the selected tiles.
        var selected = data.selected,
            length = selected && selected.length;

        if (data.deselect) {
          _this5.hideCrosshairs(data.deselect[0]);
        }

        if (length === 1) {
          _this5.showCrosshairs(selected[0]);
        } else if (length === 3) {
          _this5.currentPlayer.claimAll();
          _this5._endTurn(selected);
        }
      })

      // On failure, display a message based on the failure code.
      .failure(function (code) {
        return _this5.messages.add(code, 'error');
      });
    }
  },

  _handleMouseOver: function _handleMouseOver(evt) {

    // The tile the user is interacting with.
    var tile = this._getTileFromElement(evt.target),

    // The first tile that has been selected.
    initialTile = this.currentPlayer.getInitialTile();

    // If the user is hovering on a neighboring side of the initial tile,
    // highlight some targeting help on a visible side.
    this._helperTile = this.cube.getAttackTile(tile, initialTile);

    if (this._helperTile) {
      this._helperTile.addClass('helper');
    }
  },

  _handleMouseOut: function _handleMouseOut(evt) {
    this.clearHelperTile();
  }

};

exports['default'] = Game;
module.exports = exports['default'];

},{"./bot":2,"./cube/cube":3,"./messages":8,"./player":9,"./recorder":10,"./render/renderer":12,"./tutorial":17,"./util/util":18,"./util/vendor":19,"lodash":"lodash"}],8:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _events = require('./util/vendor');

function Messages() {
  this.delay = 100;
  this.queue = [];
  this.container = this._buildContainer();
  this.container.addEventListener(_events.events.animationEnd, _import2['default'].bind(this._remove, this));
}

Messages.prototype = {

  listenTo: function listenTo(source) {
    source.on('message', _import2['default'].bind(this.add, this));
  },

  /**
   * Creates a new message to add to the queue.
   * @param {String|Array[String]} message The message text or an array of messages.
   * @param {[String]} classes A space-separated list of classes to append to the message.
   * @return {Messages} Returns itself for chaining.
   */
  add: function add(message, classes) {
    var _this = this;

    // Format the message as an array if not already.
    message = _import2['default'].isArray(message) ? message : [message];

    // Generate a message item for each message.
    // If the text matches a LIST key, use the key's value.
    _import2['default'].forEach(message, function (text) {
      _this._generateItem(Messages.LIST[text] || text, classes);
    });

    return this;
  },

  /**
   * Removes all persisted messages from the queue by adding the 'hide'
   * class to each one.
   */
  removeAll: function removeAll() {
    _import2['default'].forEach(this.container.children, function (item) {
      return item.classList.add('hide');
    });
  },

  /**
   * Generates a message element and queues it up for display.
   * @param  {String} message The message to display.
   * @param  {[String]} classes A space-separated list of classes to append to the message.
   */
  _generateItem: function _generateItem(message, classes) {

    // Generate a new element to contain the message.
    var item = document.createElement('li');

    // Add special classes to decorate the message if passed. We want to use apply here
    // because add takes multiple arguments, not an array of names.
    if (classes) {
      DOMTokenList.prototype.add.apply(item.classList, classes.split(' '));
    }

    // Append the message to the new element and queue it up.
    item.appendChild(document.createTextNode(message));
    this._enqueue(item);
  },

  _enqueue: function _enqueue(item) {

    var container = this.container,
        queue = this.queue,
        delay = queue.length * this.delay;

    queue.push(item);

    _import2['default'].delay(function (i) {
      container.appendChild(item);
      if (_import2['default'].last(queue) === i) {
        queue.length = 0;
      }
    }, delay, item);
  },

  /**
   * Removes a message item referenced by the passed animationend event.
   * The message will be removed if it's not persistent or it contains
   * the 'hide' class.
   * @param  {animationend} evt An animationend event.
   */
  _remove: function _remove(evt) {
    var classList = evt.target.classList;
    if (!classList.contains('persist') || classList.contains('hide')) {
      this.container.removeChild(evt.target);
    }
  },

  _buildContainer: function _buildContainer() {
    var container = document.createElement('ul');
    container.id = 'messages';
    document.body.appendChild(container);
    return container;
  }

};

Messages.LIST = {
  claimed: 'This tile is already claimed!',
  targetClaimed: 'The attack target is already claimed by you!',
  cannotAttack: 'You cannot attack your own tile!',
  sameSide: 'Same side! Choose a tile on a different side.',
  notNeighbor: 'Not a neighboring side! Choose a tile different side.',
  stalemate: 'Stalemate!',
  newGame: 'Click anywhere to begin a new game.'
};

exports['default'] = Messages;
module.exports = exports['default'];

},{"./util/vendor":19,"lodash":"lodash"}],9:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _Bot = require('./bot');

var _Bot2 = _interopRequireWildcard(_Bot);

var _TileSelector = require('./selection/TileSelector');

var _TileSelector2 = _interopRequireWildcard(_TileSelector);

var _CubeCache = require('./selection/CubeCache');

var _CubeCache2 = _interopRequireWildcard(_CubeCache);

function Player(name, tileClass, cube) {
  this.name = name;
  this.tileClass = tileClass;
  this._selector = new _TileSelector2['default'](this);
  this._cubeCache = new _CubeCache2['default'](cube);
}

Player.prototype = {

  isBot: function isBot() {
    return this instanceof _Bot2['default'];
  },

  claim: function claim(tile) {
    tile.claim(this);
    this._cubeCache.add(tile);
  },

  release: function release(tile) {
    this._cubeCache.remove(tile);
    tile.release();
  },

  releaseAll: function releaseAll() {
    _import2['default'].forEach(this._cubeCache.getAllTiles(), function (tile) {
      return tile.release();
    });
    this._cubeCache.initialize();
  },

  getLines: function getLines() {
    return this._cubeCache.getLines();
  },

  /**
   * @return {Array[Tile]} All the tiles claimed that do not compose lines.
   */
  getSingles: function getSingles() {
    return this._cubeCache._singles;
  },

  /**
   * @return {Tile} The first tile selected to be claimed.
   */
  getInitialTile: function getInitialTile() {
    return this._selector.getInitial();
  },

  getAttackTile: function getAttackTile(tile1, tile2) {
    return this._cubeCache._cube.getAttackTile(tile1, tile2);
  },

  /**
   * Win lines are completed lines. This method returns all the win
   * lines claimed by the player.
   * @return {Array} A collection of this player's win lines.
   */
  getWinLines: function getWinLines() {
    var size = this._cubeCache._cube.size;
    return _import2['default'].filter(this.getLines(), function (line) {
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
  canAttack: function canAttack(tile) {
    return tile.claimedBy !== this;
  },

  selectTile: function selectTile(tile, attackTile) {
    return this._selector.validate(tile, attackTile);
  },

  claimAll: function claimAll() {

    _import2['default'].forEach(this._selector._selected, function (tile, index, array) {

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
  hasValidMoves: function hasValidMoves() {
    var hasMove = this.selectRandom();
    this._selector.reset();
    return hasMove;
  },

  /**
   * Makes a random valid selection.
   * @return {Boolean} Was a valid selection made?
   */
  selectRandom: function selectRandom() {
    var _this = this;

    /**
     * Given a starting tile, attempt to match two more: a secondary tile
     * and the attack tile.
     * @param  {Tile} initial The starting tile to test.
     * @return {Boolean} Was a successful match made?
     */
    var attempt = function attempt(initial) {

      // Loop through the tiles until two more selections are valid.
      // If no matches are found, the attempt fails and returns false.
      return _import2['default'].some(tiles, function (tile) {

        // Get the attack tile from the initial and tile intersection.
        var attackTile = _this.getAttackTile(initial, tile);

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
    return _import2['default'].some(tiles, function (tile) {

      // Reset the selector for a new starting point.
      selector.reset();

      // If the new tile is valid and the attempt to find two more succeeds,
      // there is at least one valid move and true will be returned.
      return selector.validate(tile).success() && attempt(tile);
    });
  },

  _createAttackData: function _createAttackData(tile) {
    return {
      player: tile.claimedBy,
      tile: tile,
      toString: function toString() {
        return '(attack -> ' + tile.toString() + ')';
      }
    };
  }

};

_import2['default'].assign(_Bot2['default'].prototype, Player.prototype);

exports['default'] = Player;
module.exports = exports['default'];

},{"./bot":2,"./selection/CubeCache":14,"./selection/TileSelector":15,"lodash":"lodash"}],10:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _Tile = require('./cube/tile');

var _Tile2 = _interopRequireWildcard(_Tile);

function Recorder(app) {
  this._timeline = [];
  this._cursor = 0;
  this._app = app;
}

Recorder.MESSAGES = {
  NOT_FOUND: 'Could not locate a turn at ',
  REWRITE: 'Turns are now being rewritten as the timeline was behind by ',
  NO_LOG: '[No log for this turn]'
};

Recorder.prototype = {

  record: function record(player, tiles) {

    var behind = this._timeline.length - this._cursor;

    if (behind) {
      console.warn(Recorder.MESSAGES.REWRITE + behind);
      this._timeline = _import2['default'].dropRight(this._timeline, behind);
    }

    this._package(player, tiles);
    this._cursor++;
  },

  forward: function forward() {

    var turnData = this._timeline[this._cursor];

    if (turnData) {
      _import2['default'].forEach(turnData.tiles, function (tile) {
        if (tile instanceof _Tile2['default']) {
          turnData.player.claim(tile);
        } else {
          tile.player.release(tile.tile);
        }
      });
      console.log(turnData.log);
      this._cursor++;
      this._app.setCurrentPlayer(this._app.getOpponent(turnData.player), true);
    } else {
      throw Recorder.MESSAGES.NOT_FOUND + this._cursor;
    }
  },

  reverse: function reverse() {

    var turnData = this._timeline[this._cursor - 1];

    if (turnData) {
      _import2['default'].forEach(turnData.tiles, function (tile) {
        if (tile instanceof _Tile2['default']) {
          turnData.player.release(tile);
        } else {
          tile.player.claim(tile.tile);
        }
      });
      this._cursor--;
      this._app.setCurrentPlayer(turnData.player, true);
    } else {
      throw Recorder.MESSAGES.NOT_FOUND + this._cursor;
    }
  },

  _package: function _package(player, tiles) {
    this._timeline.push({
      player: player,
      tiles: tiles,
      log: player._logText || Recorder.MESSAGES.NO_LOG
    });
  }

};

exports['default'] = Recorder;
module.exports = exports['default'];

},{"./cube/tile":6,"lodash":"lodash"}],11:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

/**
 * A software interface for determining which keyboard keys are pressed.
 *
 * @param {Array || String} keyCodes A collection of all the (string) keyCodes used.
 */
function Keyboard(keyCodes, speed) {

  this.speed = speed;

  // If the keyCodes are a string, split them into an array.
  if (typeof keyCodes === 'string') {
    keyCodes = keyCodes.split(' ');
  }

  // Loop through the codes and set them as keys.
  this.keys = _import2['default'].reduce(keyCodes, function (collection, code) {
    collection[code] = false;
    return collection;
  }, {});
}

Keyboard.prototype = {

  /**
   * Creates and binds keyboard listener handlers for interactions.
   * @param  {Function} callback A method to call from within the handlers.
   * @param  {Object} context The object that will listen for keyboard events.
   */
  listen: function listen(callback) {
    var _this = this;

    var context = arguments[1] === undefined ? window : arguments[1];

    /**
     * Creates a function bound to this Keyboard instance that
     * partially includes the callback argument.
     * @param  {Function} handler The core function that will be invoked.
     * @return {Function} A new bound and filled function.
     */
    var generateHandler = function generateHandler(handler) {
      return _import2['default'].bind(_import2['default'].partialRight(handler, callback), _this);
    };

    // Configure bound listener handlers to ease removing later.
    this._boundHandleKeydown = generateHandler(this._handleKeydown);
    this._boundHandleKeyup = generateHandler(this._handleKeyup);

    // Listen for keyup and keydown to trigger interactions.
    context.addEventListener('keydown', this._boundHandleKeydown);
    context.addEventListener('keyup', this._boundHandleKeyup);
  },

  /**
   * Remove keyboard event listeners.
   * @param  {Object} context The object to remove the listeners from.
   */
  stopListening: function stopListening() {
    var context = arguments[0] === undefined ? window : arguments[0];

    context.removeEventListener('keydown', this._boundHandleKeydown);
    context.removeEventListener('keyup', this._boundHandleKeyup);
  },

  getMovement: function getMovement() {

    var KB = Keyboard,
        keys = this.keys,
        x = 0,
        y = 0;

    // Detect either up or down movement.
    if (keys[KB.UP] || keys[KB.W]) {
      x = this.speed;
    } else if (keys[KB.DOWN] || keys[KB.S]) {
      x = -this.speed;
    }

    // Detect either left or right movement.
    if (keys[KB.LEFT] || keys[KB.A]) {
      y = this.speed;
    } else if (keys[KB.RIGHT] || keys[KB.D]) {
      y = -this.speed;
    }

    return { x: x, y: y };
  },

  _handleKeydown: function _handleKeydown(evt, callback) {

    var keyCode = evt.keyCode,
        keys = this.keys;

    if (!_import2['default'].isUndefined(keys[keyCode]) && !keys[keyCode]) {
      keys[keyCode] = true;
      if (callback) {
        callback();
      }
    }
  },

  _handleKeyup: function _handleKeyup(evt, callback) {

    var keyCode = evt.keyCode;

    if (this.keys[keyCode]) {
      this.keys[keyCode] = false;
      if (callback) {
        callback();
      }
    }
  }

};

// Keyboard constants referencing keyCodes.
Keyboard.UP = '38';
Keyboard.DOWN = '40';
Keyboard.LEFT = '37';
Keyboard.RIGHT = '39';
Keyboard.W = '87';
Keyboard.A = '65';
Keyboard.S = '83';
Keyboard.D = '68';
Keyboard.SPACE = '32';
Keyboard.ESCAPE = '27';

exports['default'] = Keyboard;
module.exports = exports['default'];

},{"lodash":"lodash"}],12:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _EventEmitter = require('events');

var _Keyboard = require('./keyboard');

var _Keyboard2 = _interopRequireWildcard(_Keyboard);

var _Touch = require('./touch');

var _Touch2 = _interopRequireWildcard(_Touch);

function Renderer(cube, isMobile) {

  // A reference to the game cube.
  this.cube = cube;

  // The keyboard interface for desktop interactions.
  this.keyboard = null;

  // And this is for touch interactions.
  this.touch = null;

  // The speed to animate the X axis.
  this.moveX = 0;

  // The speed to animate the Y axis.
  this.moveY = 0;

  // The total number of steps to animate a rotation.
  this.tickMax = 90;

  // The number of rendering steps left to animate.
  this.tick = 0;

  // How fast each tick animates.
  this.speed = 5;

  // Is the client a mobile device?
  this.isMobile = isMobile;
}

Renderer.prototype = {

  initialize: function initialize() {

    if (this.isMobile) {
      this._input = new _Touch2['default'](this.speed);
    } else {
      this._input = new _Keyboard2['default']([_Keyboard2['default'].UP, _Keyboard2['default'].DOWN, _Keyboard2['default'].LEFT, _Keyboard2['default'].RIGHT, _Keyboard2['default'].W, _Keyboard2['default'].A, _Keyboard2['default'].S, _Keyboard2['default'].D], this.speed);
    }

    this.cube.setRenderer(this);
  },

  /**
   * Stops the input listening function from calculating a render.
   */
  listenForInput: function listenForInput() {
    this._input.listen(this._movementListener.bind(this));
  },

  /**
   * Allows the input listening function to calculate renders.
   */
  stopListeningForInput: function stopListeningForInput() {
    this._input.stopListening();
  },

  draw: function draw() {

    // Reduce the ticks and rotate the cube
    this.tick -= this.speed;
    this.cube.rotate(this.moveX, this.moveY);

    // If there are ticks left or a key is down, keep looping.
    if (this.tick > 0 || this._setMovementFromInput()) {
      this._loop();
    }

    // Otherwise, broadcast an event signifying that the rendering has completed.
    else {
      this.emit('end');
    }
  },

  /**
   * A public interface for manually setting the movement.
   * @param {Number} x The target x coordinate.
   * @param {Number} y The target y coordinate.
   * @return {Promise} A promise that resolves when the movement animation ends.
   */
  setMovement: function setMovement(x, y) {
    var _this = this;

    /**
     * Configure a move in one direction and start the render loop.
     * @param {Number} tick The distance to rotate.
     * @param {String} coorProp Which coordinate to rotate on (moveX or moveY).
     */
    var move = function move(tick, coorProp) {
      _this.tick = Math.abs(tick);
      _this[coorProp] = !tick ? 0 : tick < 0 ? -_this.speed : _this.speed;
      _this._loop();
    };

    // Return a promise that will resolve when both x and y movements are complete.
    return new Promise(function (resolve) {
      move(x, 'moveX');
      _this.once('end', function () {
        move(y, 'moveY');
        _this.once('end', resolve);
      });
    });
  },

  setSyncMovement: function setSyncMovement() {
    var _this2 = this;

    var x = arguments[0] === undefined ? 0 : arguments[0];
    var y = arguments[1] === undefined ? 0 : arguments[1];

    var speed = this.speed;

    return new Promise(function (resolve) {
      _this2.tick = Math.max(x, y);
      _this2.moveX = x === 0 ? 0 : x < 0 ? -speed : speed;
      _this2.moveY = y === 0 ? 0 : y < 0 ? -speed : speed;
      _this2._loop();
      _this2.once('end', resolve);
    });
  },

  _loop: function _loop() {
    window.requestAnimationFrame(this.draw.bind(this));
  },

  _movementListener: function _movementListener() {
    if (this.tick <= 0 && this._setMovementFromInput()) {
      this._loop();
      this.emit('start');
    }
  },

  _setMovementFromInput: function _setMovementFromInput() {

    var movement = this._input.getMovement();
    this.moveX = movement.x;
    this.moveY = movement.y;

    // If there is movement, set tick and return true.
    if (this.moveX !== 0 || this.moveY !== 0) {
      this.tick = this.tickMax;
      return true;
    }

    // Movement was not set.
    return false;
  }

};

// Mixin the EventEmitter methods for great justice.
// Ditch when we migrate to Browserify.
_import2['default'].assign(Renderer.prototype, _EventEmitter.EventEmitter.prototype);

exports['default'] = Renderer;
module.exports = exports['default'];

},{"./keyboard":11,"./touch":13,"events":"events","lodash":"lodash"}],13:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _Hammer = require('hammerjs');

var _Hammer2 = _interopRequireWildcard(_Hammer);

function Touch(speed) {
  this.speed = speed;
  this.queue = [];
  this.iface = new _Hammer2['default'](document.body);

  // Configure the swipe gesture.
  this.iface.get('swipe').set({
    direction: _Hammer2['default'].DIRECTION_ALL,
    threshold: 0.1,
    velocity: 0.1
  });
}

Touch.prototype = {

  listen: function listen(callback) {
    this._boundHandleSwipe = _import2['default'].bind(_import2['default'].partialRight(this._handleSwipe, callback), this);
    this.iface.on('swipe', this._boundHandleSwipe);
  },

  stopListening: function stopListening() {
    this.iface.off('swipe', this._boundHandleSwipe);
  },

  getMovement: function getMovement() {

    var movement = this.queue.shift(),
        x = 0,
        y = 0;

    switch (movement) {
      case Touch.UP:
        x = -this.speed;
        break;
      case Touch.DOWN:
        x = this.speed;
        break;
      case Touch.LEFT:
        y = this.speed;
        break;
      case Touch.RIGHT:
        y = -this.speed;
        break;
    }

    return { x: x, y: y };
  },

  _handleSwipe: function _handleSwipe(evt, callback) {
    this.queue.push(evt.offsetDirection);
    if (callback) {
      callback();
    }
  }

};

Touch.UP = _Hammer2['default'].DIRECTION_UP;
Touch.DOWN = _Hammer2['default'].DIRECTION_DOWN;
Touch.LEFT = _Hammer2['default'].DIRECTION_LEFT;
Touch.RIGHT = _Hammer2['default'].DIRECTION_RIGHT;

exports['default'] = Touch;
module.exports = exports['default'];

},{"hammerjs":"hammerjs","lodash":"lodash"}],14:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _Line = require('../cube/line');

var _Line2 = _interopRequireWildcard(_Line);

function CubeCache(cube) {

  // A reference to the cube.
  this._cube = cube;

  // Create cache objects to hold claimed tiles.
  this.initialize();
}

CubeCache.prototype = {

  /**
   * Called on instantiation and reset, this initialize a fresh cache
   * in two collecitons: An object keyed by cube side id to contain lines
   * and an array to contain single tiles.
   */
  initialize: function initialize() {

    // A collection of lines created by side.
    this._lineMap = _import2['default'].reduce(this._cube.getSides(), function (sides, side, id) {
      sides[id] = [];
      return sides;
    }, {});

    // A collection of claimed tiles that are not part of lines.
    this._singles = [];
  },

  add: function add(tile) {

    var claimedBy = tile.claimedBy,
        xPartial = this._getPartialLineTiles(tile.xLine, claimedBy),
        yPartial = this._getPartialLineTiles(tile.yLine, claimedBy),
        xGrow = this._growLine(xPartial),
        yGrow = this._growLine(yPartial);

    // If a line was grown or created from this tile, ensure it's removed from
    // the singles collection.
    if (xGrow || yGrow) {
      this._singles = _import2['default'].difference(this._singles, tile.getAllLineTiles());
    }

    // Else, add the tile to the singles collection.
    else {
      this._singles.push(tile);
    }
  },

  remove: function remove(tile) {

    var claimedBy = tile.claimedBy,
        xPartial = this._getPartialLineTiles(tile.xLine, claimedBy),
        yPartial = this._getPartialLineTiles(tile.yLine, claimedBy),
        xShrink,
        yShrink;

    _import2['default'].pull(xPartial, tile);
    _import2['default'].pull(yPartial, tile);

    xShrink = this._shrinkLine(xPartial, true);
    yShrink = this._shrinkLine(yPartial, false);

    // If there's some shrinkage, update the singles collection accordingly.
    if (xShrink || yShrink) {

      // We need to make sure that the tiles gathered in the partial are
      // not part of another line. If they are, don't add them as singles.
      if (xShrink && !this._composesLines(xPartial)) {
        this._singles = _import2['default'].union(this._singles, xPartial);
      }
      if (yShrink && !this._composesLines(yPartial)) {
        this._singles = _import2['default'].union(this._singles, yPartial);
      }
    }

    // Otherwise, safely remove the tile from the singles collection
    // if it exists in there.
    else {
      _import2['default'].pull(this._singles, tile);
    }
  },

  /**
   * Retrieves all the lines, sorted by the number of tiles contained
   * in each line.
   * @return {Array} A collection of lines.
   */
  getLines: function getLines() {
    return this._getLinesAsChain().sortBy(function (line) {
      return line._tiles.length;
    }).value();
  },

  /**
   * Retrieves all cached tiles.
   * @return {Array} A colleciton of all the cached tiles.
   */
  getAllTiles: function getAllTiles() {
    return this._getLinesAsChain().map(function (line) {
      return line.getTiles();
    }).flatten().uniq().concat(this._singles).value();
  },

  /**
   * Fetches a chain-wrapped collection of cached lines, flattened and
   * compacted into one array.
   * @return {lodash} A lodash chain-wrapped collection.
   */
  _getLinesAsChain: function _getLinesAsChain() {
    return _import2['default'].chain(this._lineMap).values().flatten().compact();
  },

  _getPartialLineTiles: function _getPartialLineTiles(line, claimedBy) {
    return _import2['default'].filter(line.getTiles(), function (tile) {
      return tile.claimedBy === claimedBy;
    });
  },

  _growLine: function _growLine(tiles) {

    var side, line;

    if (tiles.length > 1) {

      side = this._lineMap[_import2['default'].first(tiles).side.id];
      line = _import2['default'].find(side, function (ln) {
        return ln.some(tiles);
      });

      // If a line exists already, update it with the new tiles.
      if (line) {
        line.update(tiles);
      }

      // Otherwise, create a new line with the given tiles.
      else {
        side.push(new _Line2['default'](tiles));
      }

      // A line was created or updated.
      return true;
    }

    // A line was not created.
    return false;
  },

  /**
   * Shrinks a line.
   * @param  {Array} tiles The tiles used in the shrinkage
   * @return {Boolean} Was a line disassebled?
   */
  _shrinkLine: function _shrinkLine(tiles, isHorizontal) {

    var side, line;

    if (tiles.length) {

      side = this._lineMap[_import2['default'].first(tiles).side.id];
      line = _import2['default'].find(side, function (ln) {
        return ln.isHorizontal() === isHorizontal && ln.all(tiles);
      });

      // Line should exist but just in case...
      if (line) {

        // If there's only one tile, it's not a line. Pull it.
        if (tiles.length === 1) {
          _import2['default'].pull(side, line);

          // A line was disassembled. Return true.
          return true;
        }

        // Otherwise, update the line with the remaining tiles.
        else {
          line.update(tiles);
        }
      }
    }

    // A line was not disassembled.
    return false;
  },

  _composesLines: function _composesLines(tiles) {
    var side = this._lineMap[_import2['default'].first(tiles).side.id];
    return _import2['default'].find(side, function (line) {
      return line.all(tiles);
    });
  }

};

exports['default'] = CubeCache;
module.exports = exports['default'];

},{"../cube/line":4,"lodash":"lodash"}],15:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _TileSelectorResult = require('./TileSelectorResult');

var _TileSelectorResult2 = _interopRequireWildcard(_TileSelectorResult);

/**
 * Instances of this class are used for making valid tile selections
 * and returning results containing data describing the selections.
 * The validate method is the core of TileSelector and is mostly used
 * inside the Player.selectTile wrapper.
 */

var TileSelector = (function () {

  /**
   * Constructor method. This sets an internal _player property which is
   * only currently used once (in the attack portion of validate). It also
   * sets the _selected property as an empty array via reset().
   * @param  {Player} player The player bound to this TileSelector instance.
   * @constructor
   */

  function TileSelector(player) {
    _classCallCheck(this, TileSelector);

    this._player = player;
    this.reset();
  }

  _createClass(TileSelector, [{
    key: 'reset',

    /**
     * Resets the _selected array to it's initial empty state.
     */
    value: function reset() {
      this._selected = [];
    }
  }, {
    key: 'revert',

    /**
     * Removes the last n selections and returns the updated _selected array.
     * @param  {Number} n The number of selections to revert.
     * @return {Array} The updated _selected array.
     */
    value: function revert() {
      var n = arguments[0] === undefined ? 1 : arguments[0];

      var slice = _import2['default'].dropRight(this._selected, n);
      this._selected = slice;
      return slice;
    }
  }, {
    key: 'getSelected',

    /**
     * Retrieves the contents of the _selected array.
     * @return {Array} The _selected array.
     */
    value: function getSelected() {
      return this._selected;
    }
  }, {
    key: 'getInitial',

    /**
     * Retrieves the first item in the _selected array.
     * @return {Tile} The initial selected tile.
     */
    value: function getInitial() {
      return _import2['default'].first(this._selected);
    }
  }, {
    key: 'validate',

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
    value: function validate(tile, attackTile) {

      // Get a reference to the first tile selected.
      var initial = this.getInitial(),

      // A package of data sent in resolved promises.
      resolveData = {};

      // If a tile wasn't passed, exit immediately.
      if (!tile) {
        return _TileSelectorResult2['default'].failure();
      }

      // If the tile is already claimed, get outta dodge.
      if (tile.claimedBy) {
        return _TileSelectorResult2['default'].failure(_TileSelectorResult2['default'].FAILURE_CLAIMED);
      }

      // If an initial tile exists, run some tests.
      if (initial) {

        // If the initial tile is selected, deselected it and bail out.
        if (tile === initial) {
          return _TileSelectorResult2['default'].success(this._deselect(tile));
        }

        // If the new selected tile is on the same side as the
        // initial tile, deselect the initial tile.
        if (tile.side === initial.side) {
          resolveData = this._deselect(initial);
        }

        // Else, if the side selected is not a neighbor, bail out.
        else if (!initial.isNeighboringSide(tile)) {
          return _TileSelectorResult2['default'].failure(_TileSelectorResult2['default'].FAILURE_NOT_NEIGHBOR);
        }
      }

      // If the attack tile exists, run even more tests.
      if (attackTile) {

        // If the attack tile is valid, that means both tiles can be selected
        // and everything can be claimed. Exit true as we're done selecting tiles.
        if (this._player.canAttack(attackTile)) {
          return _TileSelectorResult2['default'].success(_import2['default'].merge(resolveData, this._select(tile, attackTile)));
        } else {
          return _TileSelectorResult2['default'].failure(_TileSelectorResult2['default'].FAILURE_CANNOT_ATTACK);
        }
      }

      // Otherwise, the initial tile must have been selected. Pass the resolve data
      // along in case a tile was deselected first (as in the side === side case).
      else {
        return _TileSelectorResult2['default'].success(_import2['default'].merge(resolveData, this._select(tile)));
      }

      // We'll probably never make it this far but let's return a promise just in case.
      return _TileSelectorResult2['default'].failure();
    }
  }, {
    key: '_select',

    /**
     * Adds tiles to the _selected array and returns a command object containing
     * the complete _selected array contents.
     * @param {Tile...} Any number of Tile objects that were selected.
     * @return {Object} A command object describing the action.
     */
    value: function _select() {
      var tiles = _import2['default'].toArray(arguments);
      Array.prototype.push.apply(this._selected, tiles);
      return {
        selected: this._selected
      };
    }
  }, {
    key: '_deselect',

    /**
     * Removes a tile from the _selected array and returns a command object
     * describing the action. This object will eventually be passed to a
     * Promise returned from validate().
     * @param  {Tile} tile The tile to remove.
     * @return {Object} A command object describing the action.
     */
    value: function _deselect(tile) {
      _import2['default'].pull(this._selected, tile);
      return {
        deselect: [tile]
      };
    }
  }]);

  return TileSelector;
})();

exports['default'] = TileSelector;
module.exports = exports['default'];

},{"./TileSelectorResult":16,"lodash":"lodash"}],16:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
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

var TileSelectorResult = (function () {

  /**
   * Constructor method. Sets properties intended to be private.
   * @param  {Boolean} success Is the result successful?
   * @param  {String|Object} data A payload describing the result.
   *                              Strings for failure codes and objects for result metadata.
   * @constructor
   */

  function TileSelectorResult(success, data) {
    _classCallCheck(this, TileSelectorResult);

    this._success = success;
    this._data = data;
  }

  _createClass(TileSelectorResult, [{
    key: 'success',

    /**
     * One of the chainable callbacks, success will either return a boolean
     * describing the success state or itself if a callback is provided.
     * The callback will be invoked if the success state is true.
     * @param  {Function} callback A method to invoke if the success state is true,
     *                             passing the _data value.
     * @return {TileSelectorResult} Returns itself for chaining.
     */
    value: function success(callback) {
      if (!callback) {
        return this._success;
      }
      if (this._success) {
        callback(this._data);
      }
      return this;
    }
  }, {
    key: 'failure',

    /**
     * The other chainable callback, failure will either return a boolean
     * describing the success state or itself if a callback is provided.
     * The callback will be invoked if the success state is false.
     * @param  {Function} callback A method to invoke if the success state is false,
     *                             passing the _data value.
     * @return {TileSelectorResult} Returns itself for chaining.
     */
    value: function failure(callback) {
      if (!callback) {
        return !this._success;
      }
      if (!this._success) {
        callback(this._data);
      }
      return this;
    }
  }], [{
    key: 'success',

    /**
     * The recommended method for creating a new successful TileSelectorResult.
     * @param  {Object} data A map describing the success state.
     * @return {TileSelectorResult} A new successful TileSelectorResult.
     * @static
     */
    value: function success(data) {
      return new TileSelectorResult(true, data);
    }
  }, {
    key: 'failure',

    /**
     * The recommended method for creating a new failed TileSelectorResult.
     * @param  {String} code The failure code.
     * @return {TileSelectorResult} A new failed TileSelectorResult.
     * @static
     */
    value: function failure(code) {
      return new TileSelectorResult(false, code);
    }
  }]);

  return TileSelectorResult;
})();

// Failure codes.
TileSelectorResult.FAILURE_CLAIMED = 'claimed';
TileSelectorResult.FAILURE_NOT_NEIGHBOR = 'notNeighbor';
TileSelectorResult.FAILURE_CANNOT_ATTACK = 'cannotAttack';

exports['default'] = TileSelectorResult;
module.exports = exports['default'];

},{}],17:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _EventEmitter = require('events');

/**
 * A lightweight guided tutorial helper that is attached to a specific
 * event-emitting object, such as the cube. Displays helpful messages
 * to teach the player how to play.
 * @param {Object} target An event-emitting object to provide guidance for.
 * @class
 */
function Tutorial() {}

Tutorial.prototype = {

  /**
   * Wraps an object's method with another method that invokes the
   * tutorial's emission of a message event. This emission happens
   * only once, and restores the previous method's state afterwards.
   * @param  {Object} obj The host object.
   * @param  {String} methodName The method name to wrap.
   * @param  {String} key The lesson key.
   * @return {Tutorial} This tutorial instance for chaining.
   */
  hook: function hook(obj, methodName, key) {
    var oldMethod = obj[methodName];
    obj[methodName] = _import2['default'].bind(function () {
      var result = oldMethod.apply(obj, arguments);
      this.emit('message', Tutorial.lessons[key]);
      obj[methodName] = oldMethod;
      return result;
    }, this);
    return this;
  }

};

// Mixin EventEmitter methods.
_import2['default'].assign(Tutorial.prototype, _EventEmitter.EventEmitter.prototype);

// List of step messages.
Tutorial.stepMessages = ['Let\'s play! Click any tile to begin.', 'Rotate the cube using the arrow keys or WASD.', 'Great! Now, click a tile on an adjacent side.', 'Nice! A third tile was selected automatically for you.', 'Try to make a line on one side.'];

Tutorial.lessons = {
  start: ['Let\'s play! Click any tile to begin.', 'Rotate the cube using the arrow keys or WASD.'],
  click: 'Great! Now, click a tile on an adjacent side.',
  turn: ['Nice! A third tile was selected automatically for you.', 'Try to make a line on one side!']
};

exports['default'] = Tutorial;
module.exports = exports['default'];

},{"events":"events","lodash":"lodash"}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listenOnce = listenOnce;

function listenOnce(target, type, callback) {
  var handler = (function (_handler) {
    function handler(_x) {
      return _handler.apply(this, arguments);
    }

    handler.toString = function () {
      return _handler.toString();
    };

    return handler;
  })(function (evt) {
    target.removeEventListener(type, handler);
    callback(evt);
  });
  target.addEventListener(type, handler);
}

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var STYLE = document.body.style,
    TRANSFORM = 'Transform',

// Prefixes used for things like Transform.
STYLE_PREFIXES = ['ms', 'O', 'Moz', 'Webkit'],

// Animation end events. Not quite perfect as IE10+
// actually uses 'animation' -> 'MSAnimationEnd'
// I'll fix this later.
// So ridiculous. Can't these be consistent?!
// ...
// Map format:
// 'css-attribute':       [start, iteration, end]
ANIMATION_EVENT_MAP = {
  animation: ['animationstart', 'animationiteration', 'animationend'],
  '-o-animation': ['oAnimationStart', 'oAnimationIteration', 'oAnimationEnd'],
  '-moz-animation': ['animationstart', 'animationiteration', 'animationend'],
  '-webkit-animation': ['webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd']
},
    msAnimationEnd = 'MSAnimationEnd',
    //TODO

len = STYLE_PREFIXES.length,
    stylePrefix,
    animationProperty,
    eventTypes,

// Objects to hold browser-specific settings.
js = {},
    css = {},
    events = {};

// First, let's determine the style prefix.
while (len--) {
  if (STYLE_PREFIXES[len] + TRANSFORM in STYLE) {
    stylePrefix = STYLE_PREFIXES[len];
    break;
  }
}

// If there isn't a proper prefix, use the standard transform.
if (!stylePrefix) {
  stylePrefix = TRANSFORM.toLowerCase();
}

// Next, let's set some properties using the prefix.
js.transform = stylePrefix + TRANSFORM;
css.transform = stylePrefix ? '-' + stylePrefix.toLowerCase() + '-transform' : 'transform';

// Now, let's determine the event end name. So messed up.
for (animationProperty in ANIMATION_EVENT_MAP) {
  if (typeof STYLE[animationProperty] !== 'undefined') {
    eventTypes = ANIMATION_EVENT_MAP[animationProperty];
    events.animationStart = eventTypes[0];
    events.animationIteration = eventTypes[1];
    events.animationEnd = eventTypes[2];
    break;
  }
}

// Normalize requestAnimationFrame for cross-browser compatibility.
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

exports.js = js;
exports.css = css;
exports.events = events;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9hcHAuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9ib3QuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9jdWJlL2N1YmUuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9jdWJlL2xpbmUuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9jdWJlL3NpZGUuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9jdWJlL3RpbGUuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9nYW1lLmpzIiwiL1VzZXJzL2ttaWtsZXMvV29ya3NwYWNlL3JlcG9zL2dob3N0Y3ViZS9zcmMvanMvbWVzc2FnZXMuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9wbGF5ZXIuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9yZWNvcmRlci5qcyIsIi9Vc2Vycy9rbWlrbGVzL1dvcmtzcGFjZS9yZXBvcy9naG9zdGN1YmUvc3JjL2pzL3JlbmRlci9rZXlib2FyZC5qcyIsIi9Vc2Vycy9rbWlrbGVzL1dvcmtzcGFjZS9yZXBvcy9naG9zdGN1YmUvc3JjL2pzL3JlbmRlci9yZW5kZXJlci5qcyIsIi9Vc2Vycy9rbWlrbGVzL1dvcmtzcGFjZS9yZXBvcy9naG9zdGN1YmUvc3JjL2pzL3JlbmRlci90b3VjaC5qcyIsIi9Vc2Vycy9rbWlrbGVzL1dvcmtzcGFjZS9yZXBvcy9naG9zdGN1YmUvc3JjL2pzL3NlbGVjdGlvbi9DdWJlQ2FjaGUuanMiLCIvVXNlcnMva21pa2xlcy9Xb3Jrc3BhY2UvcmVwb3MvZ2hvc3RjdWJlL3NyYy9qcy9zZWxlY3Rpb24vVGlsZVNlbGVjdG9yLmpzIiwiL1VzZXJzL2ttaWtsZXMvV29ya3NwYWNlL3JlcG9zL2dob3N0Y3ViZS9zcmMvanMvc2VsZWN0aW9uL1RpbGVTZWxlY3RvclJlc3VsdC5qcyIsIi9Vc2Vycy9rbWlrbGVzL1dvcmtzcGFjZS9yZXBvcy9naG9zdGN1YmUvc3JjL2pzL3R1dG9yaWFsLmpzIiwiL1VzZXJzL2ttaWtsZXMvV29ya3NwYWNlL3JlcG9zL2dob3N0Y3ViZS9zcmMvanMvdXRpbC91dGlsLmpzIiwiL1VzZXJzL2ttaWtsZXMvV29ya3NwYWNlL3JlcG9zL2dob3N0Y3ViZS9zcmMvanMvdXRpbC92ZW5kb3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O1FDQU8sZ0JBQWdCOztvQkFDTixRQUFROzs7OztBQUd6QixJQUFJLElBQUksR0FBRyxzQkFBUyxXQUFXLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7c0JDSm5CLFFBQVE7Ozs7c0JBQ0gsVUFBVTs7OztBQUU3QixTQUFTLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDNUMsc0JBQU8sSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3pDLE1BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0NBQzFCOztBQUVELEdBQUcsQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDOztBQUV6QixHQUFHLENBQUMsU0FBUyxHQUFHOzs7Ozs7O0FBT2QsTUFBSSxFQUFFLGdCQUFXOzs7QUFHZixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNuQixRQUFJLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxDQUFDLENB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TSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEMsVUFBTSxDQUFDLGtCQUFrQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQyxVQUFNLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxVQUFNO0dBQ1A7Q0FDRjs7O0FBR0QsTUFBTSxDQUFDLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsSUFBSSxNQUFNLENBQUMsd0JBQXdCLElBQUksTUFBTSxDQUFDLDJCQUEyQixJQUFJLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQzs7UUFFL0osRUFBRSxHQUFGLEVBQUU7UUFBRSxHQUFHLEdBQUgsR0FBRztRQUFFLE1BQU0sR0FBTixNQUFNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAnYmFiZWwvcG9seWZpbGwnO1xuaW1wb3J0IEdhbWUgZnJvbSAnLi9nYW1lJztcblxuLy8gQ3JlYXRlIGEgbmV3IGdhbWUhXG52YXIgZ2FtZSA9IG5ldyBHYW1lKCdjb250YWluZXInKTsiLCJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IFBsYXllciBmcm9tICcuL3BsYXllcic7XG5cbmZ1bmN0aW9uIEJvdChuYW1lLCB0aWxlQ2xhc3MsIGN1YmUsIG9wcG9uZW50KSB7XG4gIFBsYXllci5jYWxsKHRoaXMsIG5hbWUsIHRpbGVDbGFzcywgY3ViZSk7XG4gIHRoaXMub3Bwb25lbnQgPSBvcHBvbmVudDtcbn1cblxuQm90LlRISU5LSU5HX1NQRUVEID0gNjAwO1xuXG5Cb3QucHJvdG90eXBlID0ge1xuXG4gIC8qKlxuICAgKiBSdW4gdGhyb3VnaCBhIGxpc3Qgb2YgdGlsZSBzZWxlY3Rpb24gY29tbWFuZHMgaW4gb3JkZXIgb2YgdXJnZW5jeS5cbiAgICogRm9yIGluc3RhbmNlLCB3aW5uaW5nIG1vdmVzIGFyZSBtb3JlIHVyZ2VudCB0aGFuIGJsb2NraW5nIHNpbmdsZSB0aWxlcy5cbiAgICogQHJldHVybiB7QXJyYXl9IEEgY29sbGVjdGlvbiBvZiB0aWxlcyBzZWxlY3RlZC5cbiAgICovXG4gIHBsYXk6IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gSW5pdCBsb2cuXG4gICAgdGhpcy5fbG9nVGV4dCA9ICcnO1xuICAgIHRoaXMuX2xvZygnPT09PT09PT09PT09PT09PT09IEJPVCBNT1ZFID09PT09PT09PT09PT09PT09PScpO1xuXG4gICAgLy8gSXMgYSBib3Qgd2luIHBvc3NpYmxlP1xuICAgIHRoaXMuX3NlbGVjdExpbmVzKCkgfHxcblxuICAgIC8vIElzIGEgcGxheWVyIChvcHBvbmVudCkgd2luIHBvc3NpYmxlP1xuICAgIHRoaXMuX3NlbGVjdE9wcG9uZW50TGluZXMoKSB8fFxuXG4gICAgLy8gQXJlIHRoZXJlIGF2YWlsYWJsZSBib3Qgc2luZ2xlcyB0byBleHRlbmQgaW50byBsaW5lcz9cbiAgICB0aGlzLl9zZWxlY3RTaW5nbGVzKCkgfHxcblxuICAgIC8vIEFyZSB0aGVyZSBhdmFpbGFibGUgcGxheWVyIChvcHBvbmVudCkgc2luZ2xlcyB0byBibG9jayBsaW5lcz9cbiAgICB0aGlzLl9zZWxlY3RPcHBvbmVudFNpbmdsZXMoKSB8fFxuXG4gICAgLy8gSXMgdGhlcmUgYW55IHBvc3NpYmxlIG1vdmUgYXQgYWxsPyFcbiAgICB0aGlzLnNlbGVjdFJhbmRvbSgpO1xuXG4gICAgLy8gUmV0dXJuIHdoYXQgd2UgaGF2ZSwgd2hpY2ggaXMgaG9wZWZ1bGx5IGEgdHJpbyBvZiBzZWxlY3RlZCB0aWxlcy5cbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0b3IuZ2V0U2VsZWN0ZWQoKTtcbiAgfSxcblxuICAvKipcbiAgICogRmluZCBsaW5lcyB0byBjb21wbGV0ZSwgZWl0aGVyIHRvIHdpbiB0aGUgZ2FtZSBvciB0byBibG9ja1xuICAgKiB0aGUgb3Bwb25lbnQuXG4gICAqIEBwYXJhbSAge0Jvb2xlYW59IHVzZU9wcG9uZW50IFNob3VsZCB3ZSB1c2UgdGhlIG9wcG9uZW50J3MgbGluZXM/XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IFdhcyBhIG1hdGNoIHN1Y2Nlc3NmdWw/XG4gICAqL1xuICBfc2VsZWN0TGluZXM6IGZ1bmN0aW9uKHVzZU9wcG9uZW50KSB7XG5cbiAgICB2YXIgbGluZXMgPSB1c2VPcHBvbmVudCA/IHRoaXMub3Bwb25lbnQuZ2V0TGluZXMoKSA6IHRoaXMuZ2V0TGluZXMoKTtcbiAgICB0aGlzLl9sb2coJysrKysrKyBMSU5FUycgKyAodXNlT3Bwb25lbnQgPyAnIE9QUE9ORU5UOicgOiAnOicpLCBsaW5lcyk7XG5cbiAgICByZXR1cm4gXy5zb21lKGxpbmVzLCBsaW5lID0+IHtcblxuICAgICAgdmFyIGluaXRpYWwgPSB0aGlzLmdldEluaXRpYWxUaWxlKCksXG4gICAgICAgICAgdGlsZSA9IGxpbmUubWlzc2luZ1RpbGVzKClbMF0sXG4gICAgICAgICAgYXR0YWNrO1xuXG4gICAgICB0aGlzLl9sb2coJysrKyBsaW5lcyBsb29wIFtpbml0aWFsLCB0aWxlXSA6JywgaW5pdGlhbCwgdGlsZSk7XG5cbiAgICAgIC8vIElmIHRoZXJlJ3MgYSB0aWxlIHNlbGVjdGVkIGFscmVhZHksIHRyeSB0byBzZWFsIHRoZSBkZWFsIHdpdGggdHdvIG1vcmUuXG4gICAgICBpZiAoaW5pdGlhbCAmJiB0aWxlKSB7XG4gICAgICAgIGF0dGFjayA9IHRoaXMuZ2V0QXR0YWNrVGlsZShpbml0aWFsLCB0aWxlKTtcbiAgICAgICAgcmV0dXJuIGF0dGFjayAmJiB0aGlzLnNlbGVjdFRpbGUodGlsZSwgYXR0YWNrKS5zdWNjZXNzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zZWxlY3RUaWxlKHRpbGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBCbG9jayB0aGUgb3Bwb25lbnQncyBsaW5lcyB0byBwcmV2ZW50IGEgd2luLlxuICAgKiBSZWxpZXMgb24gX3NlbGVjdExpbmVzLlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBXYXMgYSBtYXRjaCBzdWNjZXNzZnVsP1xuICAgKi9cbiAgX3NlbGVjdE9wcG9uZW50TGluZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RMaW5lcyh0cnVlKTtcbiAgfSxcblxuICAvKipcbiAgICogRmluZCBzaW5nbGVzIHRvIHN1cnJvdW5kLCBlaXRoZXIgdG8gYnVpbGQgYm90IGxpbmVzIG9yIHRvIGJsb2NrIHRoZVxuICAgKiBvcHBvbmVudCBmcm9tIGJ1aWxkaW5nIGxpbmVzLlxuICAgKiBAcGFyYW0gIHtCb29sZWFufSB1c2VPcHBvbmVudCBTaG91bGQgd2UgdXNlIHRoZSBvcHBvbmVudCdzIHNpbmdsZXM/XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IFdhcyBhIG1hdGNoIHN1Y2Nlc3NmdWw/XG4gICAqL1xuICBfc2VsZWN0U2luZ2xlczogZnVuY3Rpb24odXNlT3Bwb25lbnQpIHtcblxuICAgIHZhciBzaW5nbGVzID0gXy5zaHVmZmxlKHVzZU9wcG9uZW50ID8gdGhpcy5vcHBvbmVudC5nZXRTaW5nbGVzKCkgOiB0aGlzLmdldFNpbmdsZXMoKSk7XG4gICAgdGhpcy5fbG9nKCctLS0tLS0gU0lOR0xFUycgKyAodXNlT3Bwb25lbnQgPyAnIE9QUE9ORU5UOicgOiAnOicpLCBzaW5nbGVzKTtcblxuICAgIHJldHVybiBfLnNvbWUoc2luZ2xlcywgc2luZ2xlID0+IHtcblxuICAgICAgdmFyIGluaXRpYWwgPSB0aGlzLmdldEluaXRpYWxUaWxlKCksXG4gICAgICAgICAgdGlsZSxcbiAgICAgICAgICBhdHRhY2s7XG5cbiAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGluaXRpYWwgdGlsZSBvciB0aGlzIHNpbmdsZXMgc2VsZWN0aW9uIGlzIG9uIGEgbmVpZ2hib3JpbmdcbiAgICAgIC8vIHNpZGUsIG1ha2UgYSBzZWxlY3Rpb24gYXR0ZW1wdC5cbiAgICAgIGlmICghaW5pdGlhbCB8fCBzaW5nbGUuaXNOZWlnaGJvcmluZ1NpZGUoaW5pdGlhbCkpIHtcbiAgICAgICAgdGlsZSA9IHRoaXMuX3NlbGVjdEJ5VGlsZUxpbmUoc2luZ2xlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fbG9nKCctLS0gc2luZ2xlcyBsb29wIFtpbml0aWFsLCB0aWxlXSA6JywgaW5pdGlhbCwgdGlsZSk7XG5cbiAgICAgIGlmIChpbml0aWFsICYmIHRpbGUpIHtcbiAgICAgICAgYXR0YWNrID0gdGhpcy5nZXRBdHRhY2tUaWxlKGluaXRpYWwsIHRpbGUpO1xuICAgICAgICB0aGlzLl9zZWxlY3Rvci5yZXZlcnQoKTtcbiAgICAgICAgcmV0dXJuIGF0dGFjayAmJiB0aGlzLnNlbGVjdFRpbGUodGlsZSwgYXR0YWNrKS5zdWNjZXNzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFN1cnJvdW5kIG9wcG9uZW50J3Mgc2luZ2xlcyB0byBibG9jayBmdXJ0aGVyIGxpbmUgY3JlYXRpb24uXG4gICAqIFJlbGllcyBvbiBfc2VsZWN0U2luZ2xlcy5cbiAgICogQHJldHVybiB7Qm9vbGVhbn0gV2FzIGEgbWF0Y2ggc3VjY2Vzc2Z1bD9cbiAgICovXG4gIF9zZWxlY3RPcHBvbmVudFNpbmdsZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RTaW5nbGVzKHRydWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBzZWxlY3QgYSB0aWxlIG9uIHRoZSBzYW1lIGxpbmUgYXMgdGhlIGdpdmVuIHRpbGUuXG4gICAqIFNjYW5zIGJvdGggeCBhbmQgeSBsaW5lcywgc2h1ZmZsaW5nIHRoZSBjb2xsZWN0aW9uLlxuICAgKiBAcGFyYW0gIHtUaWxlfSB0aWxlIFRoZSB0YXJnZXQgdGlsZS5cbiAgICogQHJldHVybiB7VGlsZX0gVGhlIHNlbGVjdGVkIHRpbGUuXG4gICAqL1xuICBfc2VsZWN0QnlUaWxlTGluZTogZnVuY3Rpb24odGlsZSkge1xuXG4gICAgLy8gR3JhYiBhbGwgdGhlIHRpbGVzIG9uIHRoZSBzYW1lIGxpbmUgYXMgdGhlIHBhc3NlZCB0aWxlLlxuICAgIHZhciBsaW5lVGlsZXMgPSBfLnNodWZmbGUodGlsZS5nZXRBbGxMaW5lVGlsZXMoKSk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGZpcnN0IHRpbGUgdGhhdCBpcyBhIHZhbGlkIHNlbGVjdGlvbi5cbiAgICByZXR1cm4gXy5maW5kKGxpbmVUaWxlcywgbGluZVRpbGUgPT4gdGhpcy5zZWxlY3RUaWxlKGxpbmVUaWxlKS5zdWNjZXNzKCkpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBIHNpbXBsZSBsb2dnaW5nIG1lY2hhbmlzbSB0byByZWNvcmQgdGhlIGJvdCdzIHRob3VnaHRzLlxuICAgKiBVc2VkIGluIHRoZSBSZWNvcmRlciBvYmplY3Qgd2hpY2ggbG9va3MgZm9yIHRoZSBfbG9nVGV4dCBwcm9wZXJ0eS5cbiAgICovXG4gIF9sb2c6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHRleHQgPSBfLnJlZHVjZShhcmd1bWVudHMsIGZ1bmN0aW9uKGxpbmVzLCBkYXRhKSB7XG4gICAgICBsaW5lcy5wdXNoKCFfLmlzRW1wdHkoZGF0YSkgPyBkYXRhLnRvU3RyaW5nKCkgOiAnTk9ORScpO1xuICAgICAgcmV0dXJuIGxpbmVzO1xuICAgIH0sIFtdKS5qb2luKCcgJyk7XG5cbiAgICAvLyBJbW1lZGlhdGVseSBvdXRwdXQgdGhlIG1lc3NhZ2UgaW4gdGhlIGNvbnNvbGUuXG4gICAgLy9jb25zb2xlLmxvZyh0ZXh0KTtcblxuICAgIC8vIEFwcGVuZCB0aGUgdGV4dCB0byB0aGUgbWFzdGVyIGxvZy5cbiAgICB0aGlzLl9sb2dUZXh0ICs9IHRleHQgKyAnXFxuJztcbiAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBCb3Q7XG4iLCJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IFNpZGUgZnJvbSAnLi9zaWRlJztcbmltcG9ydCAqIGFzIHZlbmRvciBmcm9tICcuLi91dGlsL3ZlbmRvcic7XG5cbmZ1bmN0aW9uIEN1YmUoZWwsIHNpemUpIHtcblxuICAvLyBUaGUgSFRNTCBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgY3ViZS5cbiAgdGhpcy5lbCAgICAgICAgICAgICAgICAgICAgID0gZWw7XG5cbiAgLy8gVGhlIGN1YmUncyBzaXplIHJlZ2FyZGluZyB0aWxlcyBhY3Jvc3MgYSBzaWRlLiBEZWZhdWx0IHRvIDMuXG4gIHRoaXMuc2l6ZSAgICAgICAgICAgICAgICAgICA9IHNpemUgfHwgMztcblxuICAvLyBDYWNoZWQgcmVmZXJlbmNlIHRvIHRoZSBzdHlsZSBvYmplY3QuXG4gIHRoaXMuc3R5bGUgICAgICAgICAgICAgICAgICA9IHRoaXMuZWwuc3R5bGU7XG5cbiAgLy8gVGhpcyB3aWxsIGJlIHNldCBpbiBiZWdpbkdhbWUuXG4gIHRoaXMuX3NpZGVzID0gbnVsbDtcblxuICB0aGlzLl9ldmVudE1hcCA9IHt9O1xufVxuXG5DdWJlLlJPVEFURV9YX1BSRUZJWCA9ICdyb3RhdGVYKCc7XG5DdWJlLlJPVEFURV9ZX1BSRUZJWCA9ICdyb3RhdGVZKCc7XG5DdWJlLlJPVEFURV9VTklUX1NVRkZJWCA9ICdkZWcpJztcbkN1YmUuUkVWT0xVVElPTiA9IDM2MDtcbkN1YmUuUk9UQVRJT05fVU5JVCA9IDkwO1xuQ3ViZS5PUklHSU4gPSAwO1xuXG5DdWJlLnByb3RvdHlwZSA9IHtcblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBnYW1lLW1vZGUgdmVyc2lvbiBvZiB0aGUgY3ViZSwgc2xvd2luZyBkb3duIHRoZSBpZGxlIHN0YXRlXG4gICAqIHRvIGEgc3RvcCBhbmQgdHJhbnNpdGlvbmluZyB0byB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW4uIFRoZSBpbml0aWFsXG4gICAqIHJvdGF0aW9uIGNvb3JkaW5hdGUgdmFsdWVzIGFyZSBzZXQgYW5kIHRoZSBzaWRlcyBhcmUgZ2VuZXJhdGVkIHdpdGggdGhlaXJcbiAgICogY2hpbGQgdGlsZXMuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHRyYW5zaXRpb24gZW5kcy5cbiAgICovXG4gIGJ1aWxkOiBmdW5jdGlvbigpIHtcblxuICAgIC8vIENyZWF0ZSB0aGUgZ2FtZSBzaWRlcy4gVGhlIHRpbGVzIHdpbGwgYW5pbWF0ZSBpbnRvIGV4aXN0ZW5jZSBmcm9tIGFcbiAgICAvLyB0cmlnZ2VyIGZ1bmN0aW9uIGR1cmluZyBlYWNoIHNpZGUncyBjcmVhdGlvbi5cbiAgICB0aGlzLl9zaWRlcyA9IHRoaXMuX2J1aWxkU2lkZXModGhpcy5zaXplKTtcblxuICAgIC8vIFNldCB0aGUgaW5pdGlhbCByb3RhdGVkIHN0YXRlLiBDdXQgYXQgNDUgZGVncmVlcyB0byBhbHdheXMgZGlzcGxheSB0aHJlZSBzaWRlcy5cbiAgICB0aGlzLnggPSB0aGlzLnkgPSBDdWJlLlJFVk9MVVRJT04gLSAoQ3ViZS5ST1RBVElPTl9VTklUIC8gMik7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG5cbiAgICAgIC8vIEEgcmVmZXJlbmNlIHRvIHRoZSBjdWJlJ3MgZWxlbWVudC5cbiAgICAgIHZhciBlbCA9IHRoaXMuZWw7XG5cbiAgICAgIC8vIEFmdGVyIHRoZSBjdWJlJ3Mgcm90YXRpb24gYW5pbWF0aW9uIGhhcyBtYWRlIG9uZSBsb29wLCBiZWdpbiB0byBzbG93IGl0IGRvd24uXG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKHZlbmRvci5ldmVudHMuYW5pbWF0aW9uSXRlcmF0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgndHJhbnNpdGlvbicpO1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKHZlbmRvci5ldmVudHMuYW5pbWF0aW9uRW5kLCBmdW5jdGlvbiBhbmltRW5kKGV2dCkge1xuICAgICAgICAgIGlmIChldnQudGFyZ2V0ID09PSBlbCkge1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHRyYW5zaXRpb24gY2xhc3MgYW5kIGFwcGVuZCB0aGUgaW5pdCBjbGFzcy4gRG9uZSFcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ3RyYW5zaXRpb24nKTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2luaXQnKTtcblxuICAgICAgICAgICAgLy8gTGV0J3MgZ28hXG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBTZXRzIGEgcmVuZGVyZXIgc28gdGhlIGN1YmUgY2FuIHJlbmRlciBpdHNlbGYuIFRoaXMgaXMgYSBiaXQgaGFja3k7IHBsZWFzZSBmaW5kXG4gICAqIGFub3RoZXIgd2F5IHRvIGFjY29tcGxpc2ggc2VsZi1yZW5kZXJpbmcuXG4gICAqIEBwYXJhbSB7UmVuZGVyZXJ9IHJlbmRlcmVyIFRoZSByZW5kZXJlciB0byBzZXQgb24gdGhlIGN1YmUuXG4gICAqL1xuICBzZXRSZW5kZXJlcjogZnVuY3Rpb24ocmVuZGVyZXIpIHtcbiAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyO1xuICB9LFxuXG4gIHJvdGF0ZTogZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMueCA9IHRoaXMuX2NhbGN1bGF0ZUNvb3JkaW5hdGUodGhpcy54LCB4KTtcbiAgICB0aGlzLnkgPSB0aGlzLl9jYWxjdWxhdGVDb29yZGluYXRlKHRoaXMueSwgeSk7XG5cbiAgICB0aGlzLnN0eWxlW3ZlbmRvci5qcy50cmFuc2Zvcm1dID1cbiAgICAgIEN1YmUuUk9UQVRFX1hfUFJFRklYICsgdGhpcy54ICsgQ3ViZS5ST1RBVEVfVU5JVF9TVUZGSVggKyAnICcgKyBDdWJlLlJPVEFURV9ZX1BSRUZJWCArIHRoaXMueSArIEN1YmUuUk9UQVRFX1VOSVRfU1VGRklYO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHJvdGF0aW9uIG5lZWRlZCB0byBkaXNwbGF5IGFsbCB0aGUgZ2l2ZW4gdGlsZXMgd2hpY2hcbiAgICogbXVzdCBiZSBuZWlnaGJvcnMgdG8gZWFjaCBvdGhlciAoZm9yIG9idmlvdXMgcmVhc29ucykuXG4gICAqIEBwYXJhbSAge0FycmF5fSB0aWxlcyBBIGNvbGxlY3Rpb24gb2YgdGlsZXMgKHRocmVlIG1heGltdW0pLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSByb3RhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICovXG4gIHJvdGF0ZVRvVGlsZXM6IGZ1bmN0aW9uKHRpbGVzKSB7XG5cbiAgICAvLyBGaXJzdCwgY29sbGVjdCBhbGwgdGhlIGNvbW1vbiBjb29yZGluYXRlcyBlYWNoIHRpbGUgc2hhcmVzIHdoZW4gdmlzaWJsZS5cbiAgICB2YXIgcGFpcnMgPSB0aGlzLl9nZXRDb21tb25WaXNpYmxlQ29vcmRpbmF0ZXModGlsZXMpLFxuXG4gICAgICAgIC8vIE5leHQsIGdldCBjYWxjdWxhdGUgdGhlIHNob3J0ZXN0IHJvdGF0aW9uIGRpc3RhbmNlIGZyb20gdGhlIHBhaXJzLlxuICAgICAgICBjb29ycyA9IHRoaXMuX2dldFNob3J0ZXN0Um90YXRpb25EaXN0YW5jZShwYWlycyk7XG5cbiAgICAvLyBSZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdoZW4gdGhlIGN1YmUncyByb3RhdGlvbiByZW5kZXIgY29tcGxldGVzLlxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHRoaXMuX3JlbmRlcmVyXG4gICAgICAgIC5zZXRNb3ZlbWVudChjb29yc1swXSwgY29vcnNbMV0pXG4gICAgICAgIC50aGVuKHJlc29sdmUpO1xuICAgIH0pO1xuICB9LFxuXG4gIGxpc3RlblRvOiBmdW5jdGlvbihldmVudE5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG5cbiAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRNYXAsXG4gICAgICAgIGhhbmRsZXIgPSBfLmJpbmQoY2FsbGJhY2ssIGNvbnRleHQgfHwgdGhpcyk7XG5cbiAgICBpZiAoIWV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICBldmVudHNbZXZlbnROYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50TWFwW2V2ZW50TmFtZV0ucHVzaChoYW5kbGVyKTtcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHN0b3BMaXN0ZW5pbmdUbzogZnVuY3Rpb24oZXZlbnROYW1lKSB7XG5cbiAgICBfLmZvckVhY2godGhpcy5fZXZlbnRNYXBbZXZlbnROYW1lXSwgZnVuY3Rpb24oaGFuZGxlcikge1xuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gICAgfSwgdGhpcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKipcbiAgICogRmV0Y2hlcyBhIGN1YmUgc2lkZSBieSBuYW1lIChlLmcuICd0b3AnKVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIHNpZGUgeW91IHdhbnQuXG4gICAqIEByZXR1cm4ge1NpZGV9ICAgICAgVGhlIFNpZGUgb2JqZWN0IGJ5IG5hbWUuXG4gICAqL1xuICBnZXRTaWRlczogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiBuYW1lID8gdGhpcy5fc2lkZXNbbmFtZV0gOiB0aGlzLl9zaWRlcztcbiAgfSxcblxuICAvKipcbiAgICogQHJldHVybiB7QXJyYXl9IFRoZSB0aHJlZSB2aXNpYmxlIHNpZGVzLlxuICAgKi9cbiAgZ2V0VmlzaWJsZVNpZGVzOiBmdW5jdGlvbigpIHtcblxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYWxsIHRoZSB1bmNsYWltZWQgdGlsZXMgYW5kIHNvcnRzIHRoZW0gYnkgdGhlIGFtb3VudCBwZXJcbiAgICogc2lkZSBpbiBhc2NlbmRpbmcgb3JkZXIuIElmIGFuIGV4Y2VwdGlvbiB0aWxlIGlzIHBhc3NlZCwgZG8gbm90IGluY2x1ZGVcbiAgICogdW5jbGFpbWVkIHRpbGVzIGZyb20gdGhhdCB0aWxlJ3Mgc2lkZS5cbiAgICogQHBhcmFtICB7VGlsZX0gZXhjZXB0IFRoZSB0aWxlIHdob3NlIHNpZGUgdG8gZXhjbHVkZS5cbiAgICogQHJldHVybiB7QXJyYXl9IEEgbGlzdCBvZiBhbGwgdGhlIGF2YWlsYWJsZSB0aWxlcy5cbiAgICovXG4gIGdldEF2YWlsYWJsZVRpbGVzOiBmdW5jdGlvbihleGNlcHQpIHtcblxuICAgIC8vIEdldCBhbGwgdGhlIHRpbGVzIGJ5IHNpZGUgYW5kIHB1c2ggZWFjaCBhcnJheSB0byB0aGUgbWFpbiBhcnJheSBsaXN0LlxuICAgIHZhciB0aWxlc0J5U2lkZSA9IF8ucmVkdWNlKHRoaXMuZ2V0U2lkZXMoKSwgZnVuY3Rpb24obGlzdCwgc2lkZSkge1xuICAgICAgaWYgKCFleGNlcHQgfHwgc2lkZSAhPT0gZXhjZXB0LnNpZGUpIHtcbiAgICAgICAgbGlzdC5wdXNoKF8uc2h1ZmZsZShzaWRlLmdldEF2YWlsYWJsZVRpbGVzKCkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsaXN0O1xuICAgIH0sIFtdKTtcblxuICAgIC8vIFNvcnQgZWFjaCBzaWRlJ3MgYXJyYXkgYnkgbGVuZ3RoIGFuZCB0aGVuIGZsYXR0ZW4gdGhlIHdob2xlIHRoaW5nLlxuICAgIHJldHVybiBfLmZsYXR0ZW4oXy5zb3J0QnkodGlsZXNCeVNpZGUsICdsZW5ndGgnKSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHBhc3NlZCB0aWxlIGFuZCBhbGwgcmVsYXRlZCBhZGphY2VudCB0aWxlcyB3aXRoIHRoZVxuICAgKiBwYXNzZWQgY2FsbGJhY2suIFRoaXMgbWV0aG9kIGlzIG1vc3RseSB1c2VkIGZvciBoaWdobGlnaHRpbmcgdGlsZXNcbiAgICogdG8gaGVscCB0aGUgdXNlciBtYWtlIHN0cmF0ZWd5IGRlY2lzaW9ucyBlYXNpZXIuXG4gICAqIEBwYXJhbSAge0RPTUVsZW1lbnR9ICAgdGlsZSBUaGUgc2VsZWN0ZWQgdGlsZSBhcyBhIHJhdyBET00gZWxlbWVudC5cbiAgICogQHBhcmFtICB7RnVuY3Rpb259ICAgICBjYWxsYmFjayAgIFRoZSBtZXRob2QgdG8gaW52b2tlIHBhc3NpbmcgZWFjaCB0aWxlIGFzIGFuIGFyZ3VtZW50LlxuICAgKi9cbiAgdXBkYXRlQ3Jvc3NoYWlyczogZnVuY3Rpb24odGlsZSwgY2FsbGJhY2spIHtcblxuICAgIC8vIFJ1biB0aGUgY2FsbGJhY2sgb24gYWxsIHRpbGVzIGluIHRoZSBsaW5lcyBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHRpbGUuXG4gICAgXy5mb3JFYWNoKHRpbGUuZ2V0QWxsTGluZVRpbGVzKCksIGNhbGxiYWNrKTtcblxuICAgIC8vIEZvciBlYWNoIG5laWdoYm9yLCBwYXNzIGluIHRoZSBzaWRlIGFuZCB0aGUgb3JpZW50YXRpb24gaWQgKGUuZy4gJ2xlZnQnKS5cbiAgICBfLmZvckVhY2godGlsZS5zaWRlLmdldE5laWdoYm9ycygpLCBuZWlnaGJvciA9PiB7XG5cbiAgICAgIC8vIEZpbmQgdGhlIHRyYW5zbGF0ZWQgdGlsZXMgYW5kIHJ1biB0aGUgY2FsbGJhY2sgb24gZWFjaC5cbiAgICAgIF8uZm9yRWFjaCh0aWxlLnRyYW5zbGF0ZShuZWlnaGJvciksIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgdGlsZSB3aGVyZSB0aGUgdHdvIHBhc3NlZCB0aWxlJ3MgY29vcmRpbmF0ZXMgaW50ZXJzZWN0LlxuICAgKiBAcGFyYW0ge1RpbGV9IFt0aWxlMV0gVGhlIGZpcnN0IHRpbGUgc2VsZWN0ZWQuXG4gICAqIEBwYXJhbSB7VGlsZX0gW3RpbGUyXSBUaGUgc2Vjb25kIHRpbGUgc2VsZWN0ZWQuXG4gICAqIEByZXR1cm4ge1RpbGV9ICAgICAgIFRoZSB0aWxlIGJlaW5nIGF0dGFja2VkLlxuICAgKi9cbiAgZ2V0QXR0YWNrVGlsZTogZnVuY3Rpb24odGlsZTEsIHRpbGUyKSB7XG5cbiAgICB2YXIgbmVpZ2hib3JzLCBzaWRlO1xuXG4gICAgaWYgKHRpbGUxICYmIHRpbGUyICYmIHRpbGUxLmlzTmVpZ2hib3JpbmdTaWRlKHRpbGUyKSkge1xuXG4gICAgICAvLyBHZXQgdGhlIG5laWdoYm9yIHNpZGVzIGFuZCBleGNsdWRlIHRoZSBzZWxlY3RlZCBzaWRlLlxuICAgICAgbmVpZ2hib3JzID0gXy53aXRob3V0KHRpbGUyLnNpZGUuZ2V0TmVpZ2hib3JzKCksIHRpbGUxLnNpZGUpLFxuXG4gICAgICAvLyBHZXQgdGhlIG5laWdoYm9yIHRoYXQgaXMgdmlzaWJsZS5cbiAgICAgIHNpZGUgPSBfLmZpbmQobmVpZ2hib3JzLCBuZWlnaGJvciA9PiBuZWlnaGJvci5pc1Zpc2libGUodGhpcy54LCB0aGlzLnkpKTtcblxuICAgICAgLy8gUmV0dXJuIHRoZSB0aWxlIHRoYXQgaW50ZXJzZWN0cyB0aGUgdHdvIHBhc3NlZCB0aWxlcy5cbiAgICAgIHJldHVybiBfLmludGVyc2VjdGlvbih0aWxlMS50cmFuc2xhdGUoc2lkZSksIHRpbGUyLnRyYW5zbGF0ZShzaWRlKSlbMF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgY3VycmVudCBjb29yZGluYXRlLCB1cGRhdGUgaXQgd2l0aCB0aGUgZGlmZmVyZW5jZS5cbiAgICogSWYgdGhlIHJlc3VsdCBpcyBvdXQgb2YgdGhlIHJldm9sdXRpb24gYm91bmRzIChiZXR3ZWVuIDAgYW5kIDM2MCksXG4gICAqIGFkanVzdCBpdCB0byBhIHZhbGlkIHZhbHVlLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGN1cnJlbnQgICAgVGhlIGN1cnJlbnQgY29vcmRpbmF0ZSB2YWx1ZS5cbiAgICogQHBhcmFtICB7TnVtYmVyfSBkaWZmZXJlbmNlIFRoZSB2YWx1ZSB0byB1cGRhdGUgdGhlIGN1cnJlbnQgY29vcmRpbmF0ZSBieS5cbiAgICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgIFRoZSBub3JtYWxpemVkIHJlc3VsdC5cbiAgICovXG4gIF9jYWxjdWxhdGVDb29yZGluYXRlOiBmdW5jdGlvbihjdXJyZW50LCBkaWZmZXJlbmNlKSB7XG5cbiAgICB2YXIgUkVWT0xVVElPTiA9IEN1YmUuUkVWT0xVVElPTixcbiAgICAgICAgcmVzdWx0ID0gY3VycmVudCArIGRpZmZlcmVuY2U7XG5cbiAgICBpZiAocmVzdWx0ID4gUkVWT0xVVElPTikge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0IC0gUkVWT0xVVElPTjtcbiAgICB9XG4gICAgZWxzZSBpZiAocmVzdWx0IDw9IEN1YmUuT1JJR0lOKSB7XG4gICAgICByZXN1bHQgPSBSRVZPTFVUSU9OIC0gcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZXMgYWxsIHRoZSBwb3NzaWJsZSB4L3kgY29vcmRpbmF0ZSBjb21iaW5hdGlvbnMgdGhhdCBleGlzdFxuICAgKiB3aGVyZSBhbGwgdGhlIGdpdmVuIHRpbGVzIHdpbGwgYmUgdmlzaWJsZS5cbiAgICogQHBhcmFtICB7QXJyYXl9IHRpbGVzIFRoZSB0aWxlcyB0byB0ZXN0LlxuICAgKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQSBjb2xsZWN0aW9uIG9mIHZhbGlkIGNvb3JkaW5hdGUgY29sbGVjdGlvbnMuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBlLmcuIFtbMjI1LCAyMjVdLCBbMzE1LCA0NV1dXG4gICAqL1xuICBfZ2V0Q29tbW9uVmlzaWJsZUNvb3JkaW5hdGVzOiBmdW5jdGlvbih0aWxlcykge1xuXG4gICAgLy8gQ29sbGVjdCB0aGUgdmlzaWJpbGl0eSBtYXAgb2YgZWFjaCBwYXNzZWQgdGlsZSBpbnRvIGFuIGFycmF5LlxuICAgIHZhciB2aXNpYmlsaXR5TWFwID0gXy5tYXAodGlsZXMsIHRpbGUgPT4gdGlsZS5zaWRlLl92aXNpYmlsaXR5TWFwKSxcblxuICAgICAgICAvLyBGaW5kIGFsbCB0aGUgeCBjb29yZGluYXRlcyBzaGFyZWQgYnkgYWxsIHRoZSB0aWxlcy5cbiAgICAgICAgeENvb3JzID0gXy5pbnRlcnNlY3Rpb24uYXBwbHkoXywgXy5tYXAodmlzaWJpbGl0eU1hcCwgZnVuY3Rpb24obWFwKSB7XG4gICAgICAgICAgcmV0dXJuIF8ubWFwKF8ua2V5cyhtYXApLCBfLnBhcnNlSW50KTtcbiAgICAgICAgfSkpLFxuXG4gICAgICAgIC8vIEdpdmVuIHRoZSBhdmFpbGFibGUgeCBjb29yZGluYXRlcywgZmluZCB0aGUgc2hhcmVkIHkgY29vcmRpbmF0ZXMuXG4gICAgICAgIHlDb29ycyA9IF8uZmxhdHRlbihfLm1hcCh4Q29vcnMsIGZ1bmN0aW9uKGNvb3IpIHtcbiAgICAgICAgICByZXR1cm4gXy5pbnRlcnNlY3Rpb24uYXBwbHkoXywgXy5wbHVjayh2aXNpYmlsaXR5TWFwLCBjb29yKSk7XG4gICAgICAgIH0pKTtcblxuICAgIC8vIFJldHVybiBhIGNvbGxlY3Rpb24gb2YgeC95IGNvbGxlY3Rpb25zIHNoYXJlZCBhbW9uZyBhbGwgdGhlIHBhc3NlZCB0aWxlcy5cbiAgICByZXR1cm4gXy56aXAoeENvb3JzLCB5Q29vcnMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSBzaG9ydGVzdCByb3RhdGlvbiBkaXN0YW5jZSBiZXR3ZWVuIGFuIG9yaWdpbiBjb29yZGluYXRlXG4gICAqIGFuZCBhIHRhcmdldCBjb29yZGluYXRlLiBBY2NvdW50cyBmb3IgdGhlIGNpcmN1bGFyIGNvbnRpbnVhdGlvbiBsb29wIGZyb20gMzYwXG4gICAqIHRvIDAgYW5kIHRoZSByZXZlcnNlLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IG9yaWdpbkNvb3IgVGhlIGNvb3JkaW5hdGUgeW91J3JlIGN1cnJlbnRseSBhdC5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB0YXJnZXRDb29yIFRoZSBjb29yZGluYXRlIHlvdSB3aXNoIHRvIGJlIGF0LlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgVGhlIHNob3J0ZXN0IHJvdGF0aW9uIG1vdmVtZW50IHRvIHJlYWNoIHRoZSB0YXJnZXQuXG4gICAqL1xuICBfZ2V0U2hvcnRlc3RDb29yZGluYXRlRGlmZjogZnVuY3Rpb24ob3JpZ2luQ29vciwgdGFyZ2V0Q29vcikge1xuXG4gICAgdmFyIHJldm9sdXRpb24gPSBDdWJlLlJFVk9MVVRJT04sXG4gICAgICAgIGRpZmYgPSB0YXJnZXRDb29yIC0gb3JpZ2luQ29vcjtcblxuICAgIC8vIElmIHRoZSBhYnNvbHV0ZSBkaWZmZXJlbmNlIGlzIG1vcmUgdGhhbiBoYWxmIG9mIGEgcmV2b2x1dGlvbiwgd2UgbmVlZCB0b1xuICAgIC8vIHRha2UgdGhlIGNpcmN1bGFyIGNvbnRpbnVhdGlvbiBpbnRvIGFjY291bnQgdG8gZ2V0IHRoZSBzaG9ydGVzdCBkaXN0YW5jZS5cbiAgICBpZiAoTWF0aC5hYnMoZGlmZikgPiByZXZvbHV0aW9uIC8gMikge1xuXG4gICAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIGhpZ2hlciB0aGFuIHRoZSBvcmlnaW4sIHdlIG5lZWQgdG8gZ28gaW50byByZXZlcnNlLlxuICAgICAgaWYgKHRhcmdldENvb3IgPiBvcmlnaW5Db29yKSB7XG4gICAgICAgIGRpZmYgPSB0YXJnZXRDb29yIC0gcmV2b2x1dGlvbiAtIG9yaWdpbkNvb3I7XG4gICAgICB9XG5cbiAgICAgIC8vIE90aGVyd2lzZSwgbGV0J3MgbW92ZSBhaGVhZC5cbiAgICAgIGVsc2Uge1xuICAgICAgICBkaWZmID0gcmV2b2x1dGlvbiAtIG9yaWdpbkNvb3IgKyB0YXJnZXRDb29yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkaWZmO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSBzaG9ydGVzdCByb3RhdGlvbiBkaXN0YW5jZSBnaXZlbiBhIGNvbGxlY3Rpb24gb2ZcbiAgICogY29vcmRpbmF0ZSBwYWlycy4gVGhpcyBtZXRob2QgaXMgbWVhbnQgdG8gYmUgdXNlZCB3aXRoIGRhdGEgcHJvdmlkZWRcbiAgICogYnkgX2dldENvbW1vblZpc2libGVDb29yZGluYXRlcy5cbiAgICogQHBhcmFtICB7QXJyYXl9IHBhaXJzIEEgY29sbGVjdGlvbiBvZiBjb29yZGluYXRlIHBhaXJzLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQSBzaW5nbGUgY29vcmRpbmF0ZSBwYWlyLiBlLmcuIFs0NSwgMTM1XVxuICAgKi9cbiAgX2dldFNob3J0ZXN0Um90YXRpb25EaXN0YW5jZTogZnVuY3Rpb24ocGFpcnMpIHtcblxuICAgIHJldHVybiBfLnJlZHVjZShwYWlycywgZnVuY3Rpb24obG93ZXN0LCBjdXJyZW50KSB7XG5cbiAgICAgIC8vIEZpcnN0LCBkZXRlcm1pbmUgc2hvcnRlc3QgZGlmZmVyZW5jZXMgZm9yIGVhY2ggY29vcmRpbmF0ZSBzbyB3ZSBjYW5cbiAgICAgIC8vIGNvbXBhcmUgdGhlbSB0byBhIHByZXZpb3VzIGxvd2VzdCBwYWlyLlxuICAgICAgdmFyIGRpZmYgPSBbXG4gICAgICAgIHRoaXMuX2dldFNob3J0ZXN0Q29vcmRpbmF0ZURpZmYodGhpcy54LCBjdXJyZW50WzBdKSxcbiAgICAgICAgdGhpcy5fZ2V0U2hvcnRlc3RDb29yZGluYXRlRGlmZih0aGlzLnksIGN1cnJlbnRbMV0pXG4gICAgICBdO1xuXG4gICAgICAvLyBJZiBhIGxvd2VzdCBwYWlyIGhhc24ndCBiZWVuIHNldCB5ZXQgb3IgdGhlIHN1bSBvZiB0aGUgY3VycmVudCBjb29yXG4gICAgICAvLyBkaWZmZXJlbmNlcyBpcyBsZXNzIHRoYW4gdGhlIHByZXZpb3VzbHkgc2V0IGxvd2VzdCBwYWlyJ3MsIHRoZW4gcmV0dXJuXG4gICAgICAvLyB0aGUgY3VycmVudCBwYWlyIGFzIHRoZSBsb3dlc3QuXG4gICAgICBpZiAoIWxvd2VzdCB8fCBNYXRoLmFicyhkaWZmWzBdKSArIE1hdGguYWJzKGRpZmZbMV0pIDwgTWF0aC5hYnMobG93ZXN0WzBdKSArIE1hdGguYWJzKGxvd2VzdFsxXSkpIHtcbiAgICAgICAgcmV0dXJuIGRpZmY7XG4gICAgICB9XG5cbiAgICAgIC8vIE90aGVyd2lzZSwgcmV0dXJuIHRoZSBsb3dlc3QuXG4gICAgICByZXR1cm4gbG93ZXN0O1xuICAgIH0sIG51bGwsIHRoaXMpO1xuICB9LFxuXG4gIF9idWlsZFNpZGVzOiBmdW5jdGlvbihzaXplKSB7XG5cbiAgICAvLyBDcmVhdGUgc2lkZXMuXG4gICAgdmFyIHNpZGVzID0gXy5yZWR1Y2UodGhpcy5lbC5jaGlsZHJlbiwgZnVuY3Rpb24obGlzdCwgZWwpIHtcbiAgICAgIGxpc3RbZWwuaWRdID0gbmV3IFNpZGUoZWwsIHNpemUpO1xuICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfSwge30pO1xuXG4gICAgdmFyIFRPUCA9IHNpZGVzLnRvcCxcbiAgICAgICAgQk9UVE9NID0gc2lkZXMuYm90dG9tLFxuICAgICAgICBGUk9OVCA9IHNpZGVzLmZyb250LFxuICAgICAgICBCQUNLID0gc2lkZXMuYmFjayxcbiAgICAgICAgTEVGVCA9IHNpZGVzLmxlZnQsXG4gICAgICAgIFJJR0hUID0gc2lkZXMucmlnaHQ7XG5cbiAgICAvLyBQcmV0dHkgY3JhcHB5IC4uLiBGT1IgVEVTVElORyBPTkxZIVxuICAgIHZhciBuZWlnaGJvck1hcCA9IHtcbiAgICAgIHRvcDogW0JBQ0ssIEZST05ULCBMRUZULCBSSUdIVF0sXG4gICAgICBib3R0b206IFtGUk9OVCwgQkFDSywgTEVGVCwgUklHSFRdLFxuICAgICAgZnJvbnQ6IFtUT1AsIEJPVFRPTSwgTEVGVCwgUklHSFRdLFxuICAgICAgYmFjazogW0JPVFRPTSwgVE9QLCBMRUZULCBSSUdIVF0sXG4gICAgICBsZWZ0OiBbVE9QLCBCT1RUT00sIEJBQ0ssIEZST05UXSxcbiAgICAgIHJpZ2h0OiBbVE9QLCBCT1RUT00sIEZST05ULCBCQUNLXVxuICAgIH07XG5cbiAgICB2YXIgdmlzaWJpbGl0eU1hcCA9IHtcbiAgICAgIC8vIHg6IFt5XVxuICAgICAgZnJvbnQ6IHtcbiAgICAgICAgJzMxNSc6ICAgIFs0NSwgMzE1XSxcbiAgICAgICAgJzQ1JzogICAgIFs0NSwgMzE1XSxcbiAgICAgICAgJzEzNSc6ICAgIFsxMzUsIDIyNV0sXG4gICAgICAgICcyMjUnOiAgICBbMTM1LCAyMjVdXG4gICAgICB9LFxuXG4gICAgICBiYWNrOiB7XG4gICAgICAgICczMTUnOiAgICBbMTM1LCAyMjVdLFxuICAgICAgICAnNDUnOiAgICAgWzEzNSwgMjI1XSxcbiAgICAgICAgJzEzNSc6ICAgIFs0NSwgMzE1XSxcbiAgICAgICAgJzIyNSc6ICAgIFs0NSwgMzE1XVxuICAgICAgfSxcblxuICAgICAgdG9wOiB7XG4gICAgICAgICczMTUnOiAgICBbNDUsIDEzNSwgMjI1LCAzMTVdLFxuICAgICAgICAnMjI1JzogICAgWzQ1LCAxMzUsIDIyNSwgMzE1XVxuICAgICAgfSxcblxuICAgICAgYm90dG9tOiB7XG4gICAgICAgICcxMzUnOiAgICBbNDUsIDEzNSwgMjI1LCAzMTVdLFxuICAgICAgICAnNDUnOiAgICAgWzQ1LCAxMzUsIDIyNSwgMzE1XVxuICAgICAgfSxcblxuICAgICAgbGVmdDoge1xuICAgICAgICAnMzE1JzogICAgWzQ1LCAxMzVdLFxuICAgICAgICAnNDUnOiAgICAgWzQ1LCAxMzVdLFxuICAgICAgICAnMTM1JzogICAgWzIyNSwgMzE1XSxcbiAgICAgICAgJzIyNSc6ICAgIFsyMjUsIDMxNV1cbiAgICAgIH0sXG5cbiAgICAgIHJpZ2h0OiB7XG4gICAgICAgICczMTUnOiAgICBbMjI1LCAzMTVdLFxuICAgICAgICAnNDUnOiAgICAgWzIyNSwgMzE1XSxcbiAgICAgICAgJzEzNSc6ICAgIFs0NSwgMTM1XSxcbiAgICAgICAgJzIyNSc6ICAgIFs0NSwgMTM1XVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBOb3cgc2V0IHRoZSBuZWlnaGJvcnMgZm9yIGVhY2ggc2lkZS5cbiAgICByZXR1cm4gXy5mb3JJbihzaWRlcywgZnVuY3Rpb24oc2lkZSkge1xuICAgICAgc2lkZS5zZXROZWlnaGJvcnMobmVpZ2hib3JNYXBbc2lkZS5pZF0pO1xuICAgICAgc2lkZS5zZXRWaXNpYmlsaXR5TWFwKHZpc2liaWxpdHlNYXBbc2lkZS5pZF0pO1xuICAgIH0pO1xuICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEN1YmU7XG4iLCJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG4vKipcbiAqIExpbmVzIHJlcHJlc2VudCB0aWxlcyBpbiBlaXRoZXIgYSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIHJvd1xuICogd2hpY2ggc2VydmUgYXMgcG9pbnRzIG9yIHdpbiBzdGF0ZXMuXG4gKiBAcGFyYW0ge0FycmF5fSB0aWxlcyAgQSBjb2xsZWN0aW9uIG9mIHRpbGVzIHRoYXQgY29tcG9zZSB0aGUgbGluZS5cbiAqL1xuZnVuY3Rpb24gTGluZSh0aWxlcykge1xuICB0aGlzLnNpZGUgPSBfLmZpcnN0KHRpbGVzKS5zaWRlO1xuICB0aGlzLnVwZGF0ZSh0aWxlcyk7XG59XG5cbkxpbmUucHJvdG90eXBlID0ge1xuXG4gIC8qKlxuICAgKiBPdXRwdXRzIHVzZWZ1bCBpZGVudGlmeWluZyBpbmZvcm1hdGlvbiBmb3IgdHJvdWJsZXNob290aW5nLlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IFN0cmluZyBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5mbyA9IF8ucmVkdWNlKHRoaXMuZ2V0VGlsZXMoKSwgZnVuY3Rpb24odGlsZXMsIHRpbGUpIHtcbiAgICAgIHRpbGVzLnB1c2godGlsZS50b1N0cmluZygpKTtcbiAgICAgIHJldHVybiB0aWxlcztcbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuICcoJyArIGluZm8uam9pbignICcpICsgJyknO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgdG8gc2VlIGlmIHRoZSBsaW5lIGNvbnRhaW5zIGFsbCBvZiB0aGUgcGFzc2VkIHRpbGVzLlxuICAgKiBAcGFyYW0gIHtBcnJheX0gdGlsZXMgVGhlIHRpbGVzIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBEb2VzIHRoZSBsaW5lIGNvbnRhaW4gdGhlIHBhc3NlZCB0aWxlcz9cbiAgICovXG4gIGFsbDogZnVuY3Rpb24odGlsZXMpIHtcbiAgICB2YXIgbGluZVRpbGVzID0gdGhpcy5nZXRUaWxlcygpO1xuICAgIHJldHVybiBfLmV2ZXJ5KHRpbGVzLCB0aWxlID0+IHtcbiAgICAgIHJldHVybiBfLmluY2x1ZGVzKGxpbmVUaWxlcywgdGlsZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyB0byBzZWUgaWYgYWxsIHRoZSB0aWxlcyBpbiB0aGUgbGluZSBhcmUgaW5jbHVkZWQgaW5cbiAgICogdGhlIHBhc3NlZCB0aWxlcyBhcnJheS5cbiAgICogQHBhcmFtICB7W3R5cGVdfSB0aWxlcyBbZGVzY3JpcHRpb25dXG4gICAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgc29tZTogZnVuY3Rpb24odGlsZXMpIHtcbiAgICByZXR1cm4gXy5ldmVyeSh0aGlzLmdldFRpbGVzKCksIHRpbGUgPT4ge1xuICAgICAgcmV0dXJuIF8uaW5jbHVkZXModGlsZXMsIHRpbGUpO1xuICAgIH0pO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24odGlsZXMpIHtcbiAgICB0aGlzLl90aWxlcyA9IHRpbGVzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBVSSB0byBkaXNwbGF5IGEgd2lubmluZyBzdGF0ZSBpbnZvbHZpbmcgdGhlIGxpbmUuXG4gICAqL1xuICBwdWxzYXRlOiBmdW5jdGlvbigpIHtcbiAgICBfLmZvckVhY2godGhpcy5nZXRUaWxlcygpLCB0aWxlID0+IHRpbGUuYWRkQ2xhc3MoJ3dpbicpKTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwb3J0cyB3aGV0aGVyIG9yIG5vdCB0aGUgbGluZSBpcyBob3Jpem9udGFsIGJ5IGNoZWNraW5nIHRoZVxuICAgKiBpbmRleCBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIGFkamFjZW50IHRpbGVzLlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBJcyB0aGlzIGxpbmUgaG9yaXpvbnRhbD9cbiAgICovXG4gIGlzSG9yaXpvbnRhbDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRpbGVzID0gdGhpcy5nZXRUaWxlcygpO1xuICAgIHJldHVybiBfLmluY2x1ZGVzKHRpbGVzWzBdLnhMaW5lLmdldFRpbGVzKCksIHRpbGVzWzFdKTtcbiAgfSxcblxuICAvKipcbiAgICogQHJldHVybiB7QXJyYXl9IEEgY29sbGVjdGlvbiBvZiB0aWxlcyB0aGF0IGNvbXBvc2UgdGhlIGxpbmUuXG4gICAqL1xuICBnZXRUaWxlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RpbGVzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBudW1iZXIgb2YgdGlsZXMgaW4gdGhlIGxpbmUuXG4gICAqL1xuICBsZW5ndGg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl90aWxlcy5sZW5ndGg7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge0FycmF5fSBUaGUgaW5kaWNpZXMgb2YgYWxsIHRoZSB0aWxlcy5cbiAgICovXG4gIGluZGljaWVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy5tYXAodGhpcy5nZXRUaWxlcygpLCAnaW5kZXgnKTtcbiAgfSxcblxuICAvKipcbiAgICogQHJldHVybiB7QXJyYXl9IEEgY29sbGVjdGlvbiBvZiB0aGUgbWlzc2luZyB0aWxlcy5cbiAgICovXG4gIG1pc3NpbmdUaWxlczogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgdGlsZXMgPSB0aGlzLmdldFRpbGVzKCksXG5cbiAgICAgICAgLy8gQXJlIHdlIG1hdGNoaW5nIGFnYWluc3QgYSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIGxpbmU/XG4gICAgICAgIG1hdGNoZWRMaW5lID0gdGhpcy5pc0hvcml6b250YWwoKSA/IF8uZmlyc3QodGlsZXMpLnhMaW5lIDogXy5maXJzdCh0aWxlcykueUxpbmU7XG5cbiAgICAvLyBOb3cgd2UgY2FuIGZpZ3VyZSBvdXQgd2hpY2ggdGlsZXMgYXJlIG1pc3NpbmcgYnkgZGlmZmluZyB0aGUgdHdvIGxpbmVzLlxuICAgIHJldHVybiBfLnhvcih0aWxlcywgbWF0Y2hlZExpbmUuZ2V0VGlsZXMoKSk7XG4gIH0sXG5cbiAgLy8gUm90YXRlIGluIHBsYWNlLCBsaWtlIGEgVGV0cmFkLiBGb3IgaW5zdGFuY2U6XG4gIC8vIHhvbyAgICAgIHh4eFxuICAvLyB4b28gIC0+ICBvb29cbiAgLy8geG9vICAgICAgb29vXG4gIHJvdGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBXaGVyZSB0aGUgbGluZSBiZWdpbnMsIHN0YXJ0aW5nIGZyb20gdG9wLWxlZnQuXG4gICAgdmFyIG9yaWdpbkluZGV4ID0gXy5maXJzdCh0aGlzLmdldFRpbGVzKCkpLmluZGV4O1xuXG4gICAgaWYgKHRoaXMuaXNIb3Jpem9udGFsKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZGUuZ2V0VGlsZXMob3JpZ2luSW5kZXggKyAob3JpZ2luSW5kZXggLyB0aGlzLmxlbmd0aCgpKSlbMF0ueUxpbmU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc2lkZS5nZXRUaWxlcyhvcmlnaW5JbmRleCAqIHRoaXMubGVuZ3RoKCkpWzBdLnhMaW5lO1xuICB9LFxuXG4gIC8vIEZsaXAgYWNyb3NzIGEgbWVkaWFuLiBGb3IgaW5zdGFuY2U6XG4gIC8vICAgIHhvbyAgICAgIG9veFxuICAvLyAgICB4b28gIC0+ICBvb3hcbiAgLy8gICAgeG9vICAgICAgb294XG4gIGZsaXA6IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gV2hlcmUgdGhlIGxpbmUgYmVnaW5zLCBzdGFydGluZyBmcm9tIHRvcC1sZWZ0LlxuICAgIHZhciBvcmlnaW5JbmRleCA9IF8uZmlyc3QodGhpcy5nZXRUaWxlcygpKS5pbmRleCxcblxuICAgICAgICAvLyBUaGUgbWlkZGxlIGxpbmUuXG4gICAgICAgIG1pZGRsZTtcblxuICAgIGlmICh0aGlzLmlzSG9yaXpvbnRhbCgpKSB7XG5cbiAgICAgIC8vIFRoZSBtaWRkbGUgcm93LCB3aGljaCBpcyB0aGUgc2l6ZSBzcXVhcmVkIGN1dCBpbiBoYWxmIGFuZCBmbG9vcmVkLlxuICAgICAgLy8gTk9URTogVGhpcyBjb3VsZCBiZSBidWdneSB3aXRoIG90aGVyIHNpemVzIVxuICAgICAgbWlkZGxlID0gTWF0aC5mbG9vcigoTWF0aC5wb3codGhpcy5sZW5ndGgoKSwgMikgLyAyKSAtIDEpO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIGRpZmZlcmVuY2UgYW5kIGdldCB0aGUgY2FsY3VsYXRlZCB4IGxpbmUuXG4gICAgICByZXR1cm4gdGhpcy5zaWRlLmdldFRpbGVzKG1pZGRsZSAqIDIgLSBvcmlnaW5JbmRleClbMF0ueExpbmU7XG4gICAgfVxuXG4gICAgLy8gVGhlIG1pZGRsZSBjb2x1bW4uXG4gICAgbWlkZGxlID0gKHRoaXMubGVuZ3RoKCkgLSAxKSAvIDI7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIGRpZmZlcmVuY2UgYW5kIGdldCB0aGUgY2FsY3VsYXRlZCB5IGxpbmUuXG4gICAgcmV0dXJuIHRoaXMuc2lkZS5nZXRUaWxlcyhtaWRkbGUgKiAyIC0gb3JpZ2luSW5kZXgpWzBdLnlMaW5lO1xuICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IExpbmU7IiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBUaWxlIGZyb20gJy4vdGlsZSc7XG5pbXBvcnQgTGluZSBmcm9tICcuL2xpbmUnO1xuXG5mdW5jdGlvbiBTaWRlKGVsLCBzaXplKSB7XG5cbiAgLy8gSFRNTCBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgc2lkZS5cbiAgdGhpcy5lbCA9IGVsO1xuXG4gIC8vIFRoZSBmYWNlIGlkICh0b3AsIGJvdHRvbSwgZnJvbnQsIGJhY2ssIGxlZnQsIHJpZ2h0KS5cbiAgdGhpcy5pZCA9IGVsLmlkO1xuXG4gIC8vIFRoaXMgd2lsbCBiZSBzZXQgdXNpbmcgc2V0TmVpZ2hib3JzKCkuXG4gIHRoaXMuX25laWdoYm9ycyA9IHt9O1xuXG4gIC8vIEFuIGFycmF5IG9mIGFsbCB0aGUgdGlsZXMgYnkgaW5kZXguXG4gIHRoaXMuX3RpbGVzID0gdGhpcy5fYnVpbGRUaWxlcyhzaXplKTtcbn1cblxuU2lkZS5wcm90b3R5cGUgPSB7XG5cbiAgZ2V0TmVpZ2hib3JzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbmVpZ2hib3JzO1xuICB9LFxuXG4gIHNldE5laWdoYm9yczogZnVuY3Rpb24oc2lkZXMpIHtcbiAgICB0aGlzLl9uZWlnaGJvcnMgPSBzaWRlcztcbiAgfSxcblxuICAvKipcbiAgICogQSBjaGVjayB0byBkZXRlcm1pbmUgaWYgdGhlIHBhc3NlZCBzaWRlIGlzIG9uZSBvZiB0aGlzIHNpZGUncyBuZWlnaGJvcnMuXG4gICAqIEBwYXJhbSAge1NpZGV9ICBzaWRlIFRoZSBzaWRlIG9iamVjdCB0byBjaGVjay5cbiAgICogQHJldHVybiB7Qm9vbGVhbn0gICAgICBJcyB0aGUgcGFzc2VkIHNpZGUgYSBuZWlnaGJvcj9cbiAgICovXG4gIGlzTmVpZ2hib3I6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICByZXR1cm4gXy5jb250YWlucyh0aGlzLl9uZWlnaGJvcnMsIHNpZGUpO1xuICB9LFxuXG4gIHNldFZpc2liaWxpdHlNYXA6IGZ1bmN0aW9uKG1hcCkge1xuICAgIHRoaXMuX3Zpc2liaWxpdHlNYXAgPSBtYXA7XG4gIH0sXG5cbiAgaXNWaXNpYmxlOiBmdW5jdGlvbihjdWJlWCwgY3ViZVkpIHtcbiAgICByZXR1cm4gXy5jb250YWlucyh0aGlzLl92aXNpYmlsaXR5TWFwW2N1YmVYXSwgY3ViZVkpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHNwZWNpZmljIHRpbGVzIHJlZmVyZW5jZWQgYnkgdGhlIHBhc3NlZCBpbmRpY2llcyxcbiAgICogb3IgYWxsIHRpbGVzIGlmIGluZGljaWVzIGFyZSBub3QgcGFzc2VkLlxuICAgKiBAcGFyYW0gIHtbU3RyaW5nfE51bWJlcnxOdW1iZXJbXV19IGluZGljaWVzIEFuIGFycmF5IG9mIGluZGljaWVzLlxuICAgKiBAcmV0dXJuIHtUaWxlW119ICAgICAgICAgIEFuIGFycmF5IG9mIHNlbGVjdGVkIHRpbGVzLlxuICAgKi9cbiAgZ2V0VGlsZXM6IGZ1bmN0aW9uKGluZGljaWVzKSB7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoaW5kaWNpZXMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdGlsZXM7XG4gICAgfVxuICAgIHJldHVybiBfLmF0KHRoaXMuX3RpbGVzLCBfLmlzQXJyYXkoaW5kaWNpZXMpID8gXy51bmlxKF8uZmxhdHRlbihpbmRpY2llcykpIDogK2luZGljaWVzKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgdGhlIHRpbGVzIHRoYXQgYXJlIHN0aWxsIHVuY2xhaW1lZC5cbiAgICogQHJldHVybiB7QXJyYXl9IEEgY29sbGVjdGlvbiBvZiB1bmNsYWltZWQgdGlsZXMuXG4gICAqL1xuICBnZXRBdmFpbGFibGVUaWxlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8ucmVqZWN0KHRoaXMuX3RpbGVzLCAnY2xhaW1lZEJ5Jyk7XG4gIH0sXG5cbiAgX2J1aWxkVGlsZXM6IGZ1bmN0aW9uKHNpemUpIHtcblxuICAgIC8vIEZpcnN0IGxldCdzIGNyZWF0ZSBhbiBhcnJheSBvZiB0aWxlcyBiYXNlZCBvbiB0aGUgY3ViZSBzaXplLlxuICAgIHZhciB0aWxlcyA9IF8udGltZXMoTWF0aC5wb3coc2l6ZSwgMiksIGluZGV4ID0+IG5ldyBUaWxlKHRoaXMsIGluZGV4KSksXG5cbiAgICAvLyBOb3cgd2UnbGwgY3JlYXRlIGxpbmVzIGZyb20gdGhlIHRpbGVzLlxuICAgIGxpbmVzID0ge1xuXG4gICAgICAvLyBDcmVhdGluZyB4IGNvb3JkaW5hdGUgbGluZXMuXG4gICAgICB4OiBfLnRpbWVzKHNpemUsIGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICByZXR1cm4gbmV3IExpbmUodGlsZXMuc2xpY2UobiAqIHNpemUsIChuICsgMSkgKiBzaXplKSk7XG4gICAgICAgIH0pLFxuXG4gICAgICAvLyBDcmVhdGluZyB5IGNvb3JkaW5hdGUgbGluZXMuXG4gICAgICB5OiBfLnRpbWVzKHNpemUsIGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICB2YXIgYXJyID0gXy50aW1lcyhzaXplLCBmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICByZXR1cm4gbiArIGkgKiBzaXplO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBuZXcgTGluZShfLmF0KHRpbGVzLCBhcnIpKTtcbiAgICAgICAgfSlcbiAgICB9O1xuXG4gICAgLy8gRm9yIGVhY2ggdGlsZSwgYXNzaWduIHRoZSBjb3JyZWN0IGxpbmVzLlxuICAgIF8uZm9yRWFjaCh0aWxlcywgZnVuY3Rpb24odGlsZSwgaW5kZXgpIHtcblxuICAgICAgdmFyIG1vZCA9IGluZGV4ICUgc2l6ZSxcbiAgICAgICAgICB4TGluZSA9IGxpbmVzLnhbKGluZGV4IC0gbW9kKSAvIHNpemVdLFxuICAgICAgICAgIHlMaW5lID0gbGluZXMueVttb2RdO1xuXG4gICAgICB0aWxlLnVwZGF0ZUxpbmVzKHhMaW5lLCB5TGluZSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIHRpbGVzLlxuICAgIHJldHVybiB0aWxlcztcbiAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaWRlO1xuIiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7ZXZlbnRzfSBmcm9tICcuLi91dGlsL3ZlbmRvcic7XG5pbXBvcnQge2xpc3Rlbk9uY2V9IGZyb20gJy4uL3V0aWwvdXRpbCc7XG5cbmZ1bmN0aW9uIFRpbGUoc2lkZSwgaW5kZXgpIHtcblxuICAvLyBTZXQgcHJvcGVydGllcy5cbiAgdGhpcy5lbCA9IHRoaXMuYnVpbGQoc2lkZS5pZCArICctJyArIGluZGV4KTtcbiAgdGhpcy5zaWRlID0gc2lkZTtcbiAgdGhpcy5pbmRleCA9IGluZGV4O1xuXG4gIHRoaXMuY2xhaW1lZEJ5ID0gbnVsbDtcbiAgdGhpcy54TGluZSA9IG51bGw7XG4gIHRoaXMueUxpbmUgPSBudWxsO1xuXG4gIC8vIEFwcGVuZCB0aGUgdGlsZSdzIGVsZW1lbnQgdG8gdGhlIHNpZGUuXG4gIHNpZGUuZWwuYXBwZW5kQ2hpbGQodGhpcy5lbCk7XG59XG5cblRpbGUucHJvdG90eXBlID0ge1xuXG4gIC8qKlxuICAgKiBPdXRwdXRzIHVzZWZ1bCBpZGVudGlmeWluZyBpbmZvcm1hdGlvbiBmb3IgdHJvdWJsZXNob290aW5nLlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRpbGUgaW5mb3JtYXRpb24uXG4gICAqL1xuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZWwuaWQ7XG4gIH0sXG5cbiAgYnVpbGQ6IGZ1bmN0aW9uKGlkKSB7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHRpbGUgZWxlbWVudC5cbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbC5pZCA9IGlkO1xuICAgIGVsLmNsYXNzTmFtZSA9ICd0aWxlJztcblxuICAgIC8vIEluaXRpYWxpemUgYWZ0ZXIgYSByYW5kb20gdGltZS4gVGhpcyBiZWdpbnMgdGhlIHRpbGUgZHJvcCBhbmltYXRpb24uXG4gICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gdGhpcy5hZGRDbGFzcygnaW5pdCcpLCBNYXRoLnJhbmRvbSgpICogMjAwMCk7XG5cbiAgICAvLyBkZWJ1Z1xuICAgIC8vdmFyIGlkRGF0YSA9IGlkLnNwbGl0KCctJyk7XG4gICAgLy9lbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpZERhdGFbMF0uc2xpY2UoMCwgMikgKyBpZERhdGFbMV0pKTtcblxuICAgIHJldHVybiBlbDtcbiAgfSxcblxuICBjbGFpbTogZnVuY3Rpb24ocGxheWVyKSB7XG4gICAgdGhpcy5jbGFpbWVkQnkgPSBwbGF5ZXI7XG4gICAgdGhpc1xuICAgICAgLnJlbW92ZUNsYXNzKCd1bmNsYWltZWQnKVxuICAgICAgLmFkZENsYXNzKCdwcmVjbGFpbWVkJylcbiAgICAgIC5hZGRDbGFzcyhwbGF5ZXIudGlsZUNsYXNzKTtcblxuICAgIGxpc3Rlbk9uY2UodGhpcy5lbCwgZXZlbnRzLmFuaW1hdGlvbkVuZCwgKCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVDbGFzcygncHJlY2xhaW1lZCcpLmFkZENsYXNzKCdjbGFpbWVkJyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVsZWFzZTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY2xhaW1lZEJ5KSB7XG4gICAgICB0aGlzXG4gICAgICAgIC5hZGRDbGFzcygndW5jbGFpbWVkJylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdjbGFpbWVkJylcbiAgICAgICAgLnJlbW92ZUNsYXNzKHRoaXMuY2xhaW1lZEJ5LnRpbGVDbGFzcylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCd3aW4nKTtcbiAgICAgIHRoaXMuY2xhaW1lZEJ5ID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgaXNOZWlnaGJvcmluZ1NpZGU6IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5zaWRlLmlzTmVpZ2hib3IodGlsZS5zaWRlKTtcbiAgfSxcblxuICBhZGRDbGFzczogZnVuY3Rpb24obmFtZSkge1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZChuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICByZW1vdmVDbGFzczogZnVuY3Rpb24obmFtZSkge1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICB1cGRhdGVMaW5lczogZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMueExpbmUgPSB4O1xuICAgIHRoaXMueUxpbmUgPSB5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtBcnJheX0gQWxsIHRoZSB0aWxlcyBjb21wb3NpbmcgYm90aCBsaW5lcy5cbiAgICovXG4gIGdldEFsbExpbmVUaWxlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pb24odGhpcy54TGluZS5nZXRUaWxlcygpLCB0aGlzLnlMaW5lLmdldFRpbGVzKCkpO1xuICB9LFxuXG4gIHRyYW5zbGF0ZTogZnVuY3Rpb24odG9TaWRlKSB7XG5cbiAgICAvLyBBIHRyYW5zbGF0aW9uIGlzIGEgcmVjaXBlIGZvciBtb3JwaGluZyBvbmUgbGluZSBpbnRvIGFub3RoZXIuXG4gICAgLy8gSXQgbG9va3MgbGlrZSB0aGlzOiBbMSwgZmxpcF1cbiAgICAvLyBXaGVyZTogVGhlIGZpcnN0IGluZGV4IGlzIHRoZSBjb29yZGluYXRlIHRvIHVzZSBpbiBhIGxpbmUgcGFpclxuICAgIC8vICAgICAgICBUaGUgcmVtYWluaW5nIGluZGljaWVzIGFyZSBtZXRob2RzIHRvIGludm9rZSBvbiB0aGUgbGluZVxuICAgIHZhciB0cmFuc2xhdGlvbiA9IFRpbGUudHJhbnNsYXRpb25NYXBbdGhpcy5zaWRlLmlkXVt0b1NpZGUgPyB0b1NpZGUuaWQgOiBudWxsXSxcblxuICAgICAgICAvLyBUaGUgbGluZSBmcm9tIHRoZSBsaW5lIHBhaXIgdG8gdXNlLlxuICAgICAgICBsaW5lID0gXy5maXJzdCh0cmFuc2xhdGlvbikgPT09ICd4JyA/IHRoaXMueExpbmUgOiB0aGlzLnlMaW5lO1xuXG4gICAgaWYgKHRyYW5zbGF0aW9uKSB7XG5cbiAgICAgIC8vIFJ1biB0aHJvdWdoIGVhY2ggdHJhbnNsYXRpb24gbWV0aG9kIChmbGlwLCByb3RhdGUpIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgICAgIHZhciBuZXdMaW5lID0gXy5yZWR1Y2UoXy5yZXN0KHRyYW5zbGF0aW9uKSwgZnVuY3Rpb24odHJhbnNmb3JtZWRMaW5lLCBtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTGluZVttZXRob2RdKCk7XG4gICAgICB9LCBsaW5lKTtcblxuICAgICAgcmV0dXJuIHRvU2lkZS5nZXRUaWxlcyhuZXdMaW5lLmluZGljaWVzKCkpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbn07XG5cblRpbGUudHJhbnNsYXRpb25NYXAgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFggPSAneCcsXG4gICAgICBZID0gJ3knLFxuICAgICAgRkxJUCA9ICdmbGlwJyxcbiAgICAgIFJPVEFURSA9ICdyb3RhdGUnO1xuXG4gIC8vIExpbmUgY29vcmRpbmF0ZSBtYXBwaW5nIHRvIHNpZGUgaWQuXG4gIC8vIFtjb29yZGluYXRlLCBtZXRob2RzLi4uXVxuICByZXR1cm4ge1xuXG4gICAgZnJvbnQ6IHtcbiAgICAgIHRvcDogICAgICBbWV0sICAgICAgICAgICAgICAgIC8vIHRvcFxuICAgICAgYm90dG9tOiAgIFtZXSwgICAgICAgICAgICAgICAgLy8gYm90dG9tXG4gICAgICBsZWZ0OiAgICAgW1hdLCAgICAgICAgICAgICAgICAvLyBsZWZ0XG4gICAgICByaWdodDogICAgW1hdICAgICAgICAgICAgICAgICAvLyByaWdodFxuICAgIH0sXG5cbiAgICBiYWNrOiB7XG4gICAgICBib3R0b206ICAgW1ksIEZMSVBdLCAgICAgICAgICAvLyB0b3BcbiAgICAgIHRvcDogICAgICBbWSwgRkxJUF0sICAgICAgICAgIC8vIGJvdHRvbVxuICAgICAgbGVmdDogICAgIFtYXSwgICAgICAgICAgICAgICAgLy8gbGVmdFxuICAgICAgcmlnaHQ6ICAgIFtYXSAgICAgICAgICAgICAgICAgLy8gcmlnaHRcbiAgICB9LFxuXG4gICAgdG9wOiB7XG4gICAgICBiYWNrOiAgICAgW1ksIEZMSVBdLCAgICAgICAgICAvLyB0b3BcbiAgICAgIGZyb250OiAgICBbWV0sICAgICAgICAgICAgICAgIC8vIGJvdHRvbVxuICAgICAgbGVmdDogICAgIFtYLCBST1RBVEVdLCAgICAgICAgLy8gbGVmdFxuICAgICAgcmlnaHQ6ICAgIFtYLCBGTElQLCBST1RBVEVdLCAgLy8gcmlnaHRcbiAgICB9LFxuXG4gICAgYm90dG9tOiB7XG4gICAgICBmcm9udDogICAgW1ldLCAgICAgICAgICAgICAgICAvLyB0b3BcbiAgICAgIGJhY2s6ICAgICBbWSwgRkxJUF0sICAgICAgICAgIC8vIGJvdHRvbVxuICAgICAgbGVmdDogICAgIFtYLCBGTElQLCBST1RBVEVdLCAgLy8gbGVmdFxuICAgICAgcmlnaHQ6ICAgIFtYLCBST1RBVEVdICAgICAgICAgLy8gcmlnaHRcbiAgICB9LFxuXG4gICAgbGVmdDoge1xuICAgICAgdG9wOiAgICAgIFtZLCBST1RBVEVdLCAgICAgICAgLy8gdG9wXG4gICAgICBib3R0b206ICAgW1ksIEZMSVAsIFJPVEFURV0sICAvLyBib3R0b21cbiAgICAgIGJhY2s6ICAgICBbWF0sICAgICAgICAgICAgICAgIC8vIGxlZnRcbiAgICAgIGZyb250OiAgICBbWF0gICAgICAgICAgICAgICAgIC8vIHJpZ2h0XG4gICAgfSxcblxuICAgIHJpZ2h0OiB7XG4gICAgICB0b3A6ICAgICAgW1ksIEZMSVAsIFJPVEFURV0sICAvLyB0b3BcbiAgICAgIGJvdHRvbTogICBbWSwgUk9UQVRFXSwgICAgICAgIC8vIGJvdHRvbVxuICAgICAgZnJvbnQ6ICAgIFtYXSwgICAgICAgICAgICAgICAgLy8gbGVmdFxuICAgICAgYmFjazogICAgIFtYXSAgICAgICAgICAgICAgICAgLy8gcmlnaHRcbiAgICB9XG4gIH07XG5cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IFRpbGU7IiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBDdWJlIGZyb20gJy4vY3ViZS9jdWJlJztcbmltcG9ydCBQbGF5ZXIgZnJvbSAnLi9wbGF5ZXInO1xuaW1wb3J0IEJvdCBmcm9tICcuL2JvdCc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi9yZW5kZXIvcmVuZGVyZXInO1xuaW1wb3J0IFJlY29yZGVyIGZyb20gJy4vcmVjb3JkZXInO1xuaW1wb3J0IE1lc3NhZ2VzIGZyb20gJy4vbWVzc2FnZXMnO1xuaW1wb3J0IFR1dG9yaWFsIGZyb20gJy4vdHV0b3JpYWwnO1xuaW1wb3J0IHtsaXN0ZW5PbmNlfSBmcm9tICcuL3V0aWwvdXRpbCc7XG5pbXBvcnQge2V2ZW50c30gZnJvbSAnLi91dGlsL3ZlbmRvcic7XG5cbmZ1bmN0aW9uIEdhbWUoY29udGFpbmVySWQpIHtcblxuICAvLyBUaGUgc2l0ZSBjb250YWluZXIgd2hpY2ggaG91c2VzIHRoZSBjdWJlIGFuZCBpbnRybyB0ZXh0LlxuICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcklkKTtcblxuICAvLyBDaGVjayBpZiB0aGUgY2xpZW50IGlzIG9uIGEgbW9iaWxlIGRldmljZS5cbiAgdGhpcy5pc01vYmlsZSA9IC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbiAgLy8gVGhlIGZ1biBwYXJ0IVxuICB0aGlzLmN1YmUgPSBuZXcgQ3ViZSh0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY3ViZScpKTtcblxuICAvLyBVSSBmb3IgZGlzcGxheWluZyB2YXJpb3VzIG1lc3NhZ2VzLlxuICB0aGlzLm1lc3NhZ2VzID0gbmV3IE1lc3NhZ2VzKCk7XG5cbiAgLy8gQW4gb2JqZWN0IHRoYXQgZGV0ZWN0cyB1c2VyIGludGVyYWN0aW9uIHRvIG1hbmlwdWxhdGUgdGhlIGN1YmUuXG4gIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIodGhpcy5jdWJlLCB0aGlzLmlzTW9iaWxlKTtcblxuICAvLyBJbi1nYW1lIHBsYXllcnMuXG4gIHRoaXMucGxheWVycyA9IG51bGw7XG4gIHRoaXMuY3VycmVudFBsYXllciA9IG51bGw7XG5cbiAgLy8gQ3Jvc3Mtc2VsZWN0ZWQgdGlsZSBmb3IgaGVscGluZyBhdHRhY2tzLlxuICB0aGlzLl9oZWxwZXJUaWxlID0gbnVsbDtcblxuICAvLyBSZWNvcmRzIG1vdmVzIGFzIHRoZXkncmUgbWFkZS4gQ2FuIGJlIHVzZWQgdG8gc3RlcCB0aHJvdWdoIHRpbWUuXG4gIHRoaXMucmVjb3JkZXIgPSBuZXcgUmVjb3JkZXIodGhpcyk7XG5cbiAgLy8gTGlzdGVuIGZvciB1c2VyIGludGVyYWN0aW9ucy5cbiAgdGhpcy5pZGxlKCk7XG59XG5cbkdhbWUucHJvdG90eXBlID0ge1xuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBjdWJlIG9iamVjdCdzIGRlZmF1bHQgcHJlLWdhbWUgc3RhdGUuXG4gICAqL1xuICBpZGxlOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcixcbiAgICAgICAgaGl0Ym94ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJyNoaXQnKTtcblxuICAgIC8vIENsaWNrIHRoZSBjdWJlIHRvIGJlZ2luIHRoZSBnYW1lLlxuICAgIGxpc3Rlbk9uY2UoaGl0Ym94LCAnY2xpY2snLCAoKSA9PiB7XG5cbiAgICAgIGhpdGJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2dhbWUnKTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVUdXRvcmlhbCgpO1xuXG4gICAgICBsaXN0ZW5PbmNlKGNvbnRhaW5lciwgZXZlbnRzLmFuaW1hdGlvbkVuZCwgKCkgPT4ge1xuICAgICAgICB0aGlzLmN1YmVcbiAgICAgICAgICAuYnVpbGQoKVxuICAgICAgICAgIC50aGVuKF8uYmluZCh0aGlzLmluaXRpYWxpemVHYW1lLCB0aGlzKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgY3ViZSBmb3IgZ2FtZSBtb2RlIGJ5IGNyZWF0aW5nIHBsYXllcnMsIHNldHRpbmcgbGlzdGVuZXJzLFxuICAgKiBhbmQgaW5pdGlhbGl6aW5nIHRoZSByZW5kZXJlci5cbiAgICovXG4gIGluaXRpYWxpemVHYW1lOiBmdW5jdGlvbigpIHtcblxuICAgIC8vIENyZWF0ZSB0aGUgcGxheWVyczogQSBodW1hbiBhbmQgYSBib3QuXG4gICAgdmFyIGh1bWFuID0gbmV3IFBsYXllcignUGxheWVyJywgJ3BsYXllcjEnLCB0aGlzLmN1YmUpLFxuICAgICAgICBib3QgPSBuZXcgQm90KCdDUFUnLCAncGxheWVyMicsIHRoaXMuY3ViZSwgaHVtYW4pO1xuXG4gICAgdGhpcy5wbGF5ZXJzID0gW2h1bWFuLCBib3RdO1xuXG4gICAgLy8gQmVnaW4gdGhlIHJlbmRlcmluZy5cbiAgICB0aGlzLnJlbmRlcmVyLmluaXRpYWxpemUoKTtcblxuICAgIC8vIExldCdzIGNsZWFyIHRoZSBoZWxwZXIgdGlsZSB3aGVuIHRoZSBjdWJlIGlzIHJvdGF0aW5nLlxuICAgIHRoaXMucmVuZGVyZXIub24oJ3N0YXJ0JywgXy5iaW5kKHRoaXMuY2xlYXJIZWxwZXJUaWxlLCB0aGlzKSk7XG5cbiAgICAvLyBTZXQgdGhlIGN1cnJlbnQgcGxheWVyIGFzIHRoZSBmaXJzdCBwbGF5ZXIuIFRoaXMgXCJvZmZpY2lhbGx5XCIgYmVnaW5zIHRoZSBnYW1lLlxuICAgIHRoaXMuc2V0Q3VycmVudFBsYXllcihfLmZpcnN0KHRoaXMucGxheWVycykpO1xuICB9LFxuXG4gIGVuYWJsZUN1YmVJbnRlcmFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW5kZXJlci5saXN0ZW5Gb3JJbnB1dCgpO1xuICAgIHRoaXMuY3ViZVxuICAgICAgLmxpc3RlblRvKCdjbGljaycsIHRoaXMuX2hhbmRsZUNsaWNrLCB0aGlzKVxuICAgICAgLmxpc3RlblRvKCdtb3VzZW92ZXInLCB0aGlzLl9oYW5kbGVNb3VzZU92ZXIsIHRoaXMpXG4gICAgICAubGlzdGVuVG8oJ21vdXNlb3V0JywgdGhpcy5faGFuZGxlTW91c2VPdXQsIHRoaXMpO1xuICB9LFxuXG4gIGRpc2FibGVDdWJlSW50ZXJhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVuZGVyZXIuc3RvcExpc3RlbmluZ0ZvcklucHV0KCk7XG4gICAgdGhpcy5jdWJlXG4gICAgICAuc3RvcExpc3RlbmluZ1RvKCdjbGljaycpXG4gICAgICAuc3RvcExpc3RlbmluZ1RvKCdtb3VzZW92ZXInKVxuICAgICAgLnN0b3BMaXN0ZW5pbmdUbygnbW91c2VvdXQnKTtcbiAgfSxcblxuICAvKipcbiAgICogU2V0cyB0aGUgY3VycmVudCBwbGF5ZXIgdG8gdGhlIHBhc3NlZCBwbGF5ZXIsIGRpc3BsYXlpbmcgdGhlIGNvcnJlY3RcbiAgICogbWVzc2FnaW5nIGFuZCB1cGRhdGluZyB0aGUgVUkgc3RhdGUuXG4gICAqIEBwYXJhbSB7UGxheWVyfSBwbGF5ZXIgICAgVGhlIHBsYXllciB0byBzZXQgYXMgdGhlIGN1cnJlbnQgcGxheWVyLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGJvdE1hbnVhbCBTaG91bGQgdGhlIGJvdCBwbGF5IGl0J3MgdHVybiBhdXRvbWF0aWNhbGx5P1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVc2VkIGluIHJlY29yZGVyIG1vZGUgdG8gcGF1c2UgYXV0byBwbGF5YmFjay5cbiAgICovXG4gIHNldEN1cnJlbnRQbGF5ZXI6IGZ1bmN0aW9uKHBsYXllciwgYm90TWFudWFsKSB7XG5cbiAgICAvLyBCcm9hZGNhc3QgdGhhdCBpdCdzIHRoZSBwYXNzZWQgcGxheWVyJ3MgdHVybi5cbiAgICB0aGlzLm1lc3NhZ2VzLmFkZChwbGF5ZXIubmFtZSArICdcXCdzIHR1cm4hJywgJ2FsZXJ0Jyk7XG5cbiAgICAvLyBEb24ndCBzZXQgdGhlIHNhbWUgcGxheWVyIHR3aWNlLlxuICAgIGlmICh0aGlzLmN1cnJlbnRQbGF5ZXIgIT09IHBsYXllcikge1xuXG4gICAgICB0aGlzLmN1YmUuZWwuY2xhc3NMaXN0LmFkZChwbGF5ZXIudGlsZUNsYXNzICsgJy10dXJuJyk7XG4gICAgICBpZiAodGhpcy5jdXJyZW50UGxheWVyKSB7XG4gICAgICAgIHRoaXMuY3ViZS5lbC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuY3VycmVudFBsYXllci50aWxlQ2xhc3MgKyAnLXR1cm4nKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jdXJyZW50UGxheWVyID0gcGxheWVyO1xuXG4gICAgICAvLyBJZiB0aGUgcGxheWVyIGhhcyB2YWxpZCBtb3Zlcywgc3RhcnQgdGhlIHR1cm4gYXMgdXN1YWwuXG4gICAgICBpZiAocGxheWVyLmhhc1ZhbGlkTW92ZXMoKSkge1xuICAgICAgICBpZiAocGxheWVyLmlzQm90KCkpIHtcbiAgICAgICAgICB0aGlzLmRpc2FibGVDdWJlSW50ZXJhY3Rpb24oKTtcbiAgICAgICAgICBpZiAoIWJvdE1hbnVhbCkge1xuICAgICAgICAgICAgdGhpcy5fYm90VGlsZVNlbGVjdGlvbihwbGF5ZXIucGxheSgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbmFibGVDdWJlSW50ZXJhY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UsIGRlY2xhcmUgYSBzdGFsZW1hdGUuIE5vYm9keSB3aW5zLlxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX3N0YWxlbWF0ZSgpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGdldE9wcG9uZW50OiBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICByZXR1cm4gdGhpcy5wbGF5ZXJzW3RoaXMucGxheWVycy5pbmRleE9mKHBsYXllcikgPT09IDEgPyAwIDogMV07XG4gIH0sXG5cbiAgc2hvd0Nyb3NzaGFpcnM6IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICB0aWxlLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIHRoaXMuY3ViZS51cGRhdGVDcm9zc2hhaXJzKHRpbGUsIHRpbGUgPT4gdGlsZS5hZGRDbGFzcygnaGlnaGxpZ2h0ZWQnKSk7XG4gIH0sXG5cbiAgaGlkZUNyb3NzaGFpcnM6IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICB0aWxlLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgIHRoaXMuY3ViZS51cGRhdGVDcm9zc2hhaXJzKHRpbGUsIHRpbGUgPT4gdGlsZS5yZW1vdmVDbGFzcygnaGlnaGxpZ2h0ZWQnKSk7XG4gIH0sXG5cbiAgY2xlYXJIZWxwZXJUaWxlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5faGVscGVyVGlsZSkge1xuICAgICAgdGhpcy5faGVscGVyVGlsZS5yZW1vdmVDbGFzcygnaGVscGVyJyk7XG4gICAgfVxuICAgIHRoaXMuX2hlbHBlclRpbGUgPSBudWxsO1xuICB9LFxuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZXMgYSB0dXRvcmlhbCBpbnN0YW5jZSBhbmQgaG9va3MgaW50byBtZXRob2RzIHRoYXQgc2hvdWxkXG4gICAqIGVtaXQgbGVzc29uIG1lc3NhZ2VzLlxuICAgKi9cbiAgX2luaXRpYWxpemVUdXRvcmlhbDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50dXRvcmlhbCA9IG5ldyBUdXRvcmlhbCgpO1xuICAgIHRoaXMudHV0b3JpYWxcbiAgICAgIC5ob29rKHRoaXMsICdpbml0aWFsaXplR2FtZScsICdzdGFydCcpXG4gICAgICAuaG9vayh0aGlzLCAnc2hvd0Nyb3NzaGFpcnMnLCAnY2xpY2snKVxuICAgICAgLmhvb2sodGhpcywgJ19lbmRUdXJuJywgJ3R1cm4nKTtcbiAgICB0aGlzLm1lc3NhZ2VzLmxpc3RlblRvKHRoaXMudHV0b3JpYWwpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBFbmRzIHRoZSBjdXJyZW50IHBsYXllcidzIHR1cm4gYW5kIGRldGVybWluZXMgaWYgdGhlIGdhbWUgaXNcbiAgICogaW4gYSB3aW4gc3RhdGUuXG4gICAqIEBwYXJhbSAge0FycmF5fSB0aWxlcyBUaGUgdGlsZXMgc2VsZWN0ZWQgdG8gZW5kIHRoZSB0dXJuLlxuICAgKi9cbiAgX2VuZFR1cm46IGZ1bmN0aW9uKHRpbGVzKSB7XG5cbiAgICB2YXIgcGxheWVyID0gdGhpcy5jdXJyZW50UGxheWVyLFxuICAgICAgICBsaW5lcyA9IHBsYXllci5nZXRXaW5MaW5lcygpO1xuXG4gICAgdGhpcy5yZWNvcmRlci5yZWNvcmQocGxheWVyLCB0aWxlcyk7XG4gICAgdGhpcy5jbGVhckhlbHBlclRpbGUoKTtcbiAgICB0aGlzLmhpZGVDcm9zc2hhaXJzKF8uZmlyc3QodGlsZXMpKTtcblxuICAgIC8vIElmIHRoZSBwbGF5ZXIgaGFzIG1hZGUgYXQgbGVhc3Qgb25lIGxpbmUsIGVuZCB0aGUgZ2FtZS5cbiAgICBpZiAoIXRoaXMuX2VuZEdhbWUobGluZXMpKSB7XG4gICAgICB0aGlzLnNldEN1cnJlbnRQbGF5ZXIodGhpcy5nZXRPcHBvbmVudChwbGF5ZXIpKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIGVuZCB0aGUgZ2FtZS5cbiAgICogQHBhcmFtICB7QXJyYXl9IGxpbmVzIFRoZSBsaW5lcyB1c2VkIHRvIHdpbi5cbiAgICogQHJldHVybiB7Qm9vbGVhbn0gSXMgdGhlIGdhbWUgaW4gYSB3aW4gc3RhdGU/XG4gICAqL1xuICBfZW5kR2FtZTogZnVuY3Rpb24obGluZXMpIHtcblxuICAgIHZhciB3aW5CeSA9IGxpbmVzLmxlbmd0aCxcbiAgICAgICAgbW9kaWZpZXI7XG5cbiAgICBpZiAod2luQnkpIHtcblxuICAgICAgLy8gRGlzcGxheSBtZXNzYWdlIHdpdGggbW9kaWZpZXIuXG4gICAgICBtb2RpZmllciA9IHdpbkJ5ID4gMSA/ICcgeCcgKyB3aW5CeSArICchJyA6ICchJztcbiAgICAgIHRoaXMubWVzc2FnZXMuYWRkKGAke3RoaXMuY3VycmVudFBsYXllci5uYW1lfSB3aW5zJHttb2RpZmllcn1gLCAnYWxlcnQgcGVyc2lzdCcpO1xuXG4gICAgICAvLyBTaG93IHRoZSB3aW5uaW5nIGxpbmVzLlxuICAgICAgXy5pbnZva2UobGluZXMsICdwdWxzYXRlJyk7XG5cbiAgICAgIC8vIEFsZXJ0IHRoZSB1c2VyIG9uIGhvdyB0byBzdGFydCBhIG5ldyBnYW1lLlxuICAgICAgdGhpcy5fd2FpdEFuZExpc3RlbkZvclJlc2V0KCk7XG5cbiAgICAgIC8vIFllcywgdGhlIGdhbWUgaGFzIGVuZGVkLlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gTm9ib2R5IGhhcyB3b24geWV0LiBDb250aW51ZSFcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldmVhbCBtZXNzYWdlcyByZWdhcmRpbmcgdGhlIHN0YWxlbWF0ZSBhbmQgYmVnaW4gbGlzdGVuaW5nIHRvXG4gICAqIHN0YXJ0IGEgbmV3IGdhbWUuXG4gICAqL1xuICBfc3RhbGVtYXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1lc3NhZ2VzXG4gICAgICAuYWRkKCdzdGFsZW1hdGUnLCAnYWxlcnQgcGVyc2lzdCcpXG4gICAgICAuYWRkKGAke3RoaXMuY3VycmVudFBsYXllci5uYW1lfSBoYXMgbm8gdmFsaWQgbW92ZXMuYCwgJ3BlcnNpc3QnKTtcbiAgICB0aGlzLl93YWl0QW5kTGlzdGVuRm9yUmVzZXQoKTtcbiAgfSxcblxuICAvKipcbiAgICogQWZ0ZXIgYSBicmllZiBwYXVzZSwgYWxlcnRzIHRoZSB1c2VyIGFib3V0IGhvdyB0byBzdGFydCBhIG5ldyBnYW1lXG4gICAqIGFuZCBzZXRzIGEgbGlzdGVuZXIuXG4gICAqL1xuICBfd2FpdEFuZExpc3RlbkZvclJlc2V0OiBmdW5jdGlvbigpIHtcblxuICAgIC8vIFJlbW92ZSB0aGUgY3VycmVudCBwbGF5ZXIgYW5kIGRpc2FibGUgY3ViZSBpbnRlcmFjdGlvbnMuXG4gICAgdGhpcy5jdXJyZW50UGxheWVyID0gbnVsbDtcbiAgICB0aGlzLmRpc2FibGVDdWJlSW50ZXJhY3Rpb24oKTtcblxuICAgIC8vIEFmdGVyIHR3byBzZWNvbmRzLCBkaXNwbGF5IGEgbWVzc2FnZSB0byBiZWdpbiBhIG5ldyBnYW1lIGFuZFxuICAgIC8vIGxpc3RlbiBmb3IgZG9jdW1lbnQgY2xpY2tzIHRvIHJlc2V0LlxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5tZXNzYWdlcy5hZGQoJ25ld0dhbWUnLCAncGVyc2lzdCcpO1xuICAgICAgbGlzdGVuT25jZShkb2N1bWVudCwgJ2NsaWNrJywgXy5iaW5kKHRoaXMuX3Jlc2V0R2FtZVN0YXRlLCB0aGlzKSk7XG4gICAgfSwgMjAwMCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIGNsYWltZWQgdGlsZXMgZnJvbSBlYWNoIHBsYXllciBhbmQgZGVzdHJveXMgYWxsIG1lc3NhZ2VzLlxuICAgKiBTZXRzIHRoZSBjdXJyZW50IHBsYXllciB0byB0aGUgZmlyc3QgcGxheWVyIGluIHRoZSBhcnJheS5cbiAgICovXG4gIF9yZXNldEdhbWVTdGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLm1lc3NhZ2VzLnJlbW92ZUFsbCgpO1xuICAgIHRoaXMuY3ViZS5lbC5jbGFzc0xpc3QuYWRkKCdyZXNldCcpO1xuXG4gICAgdGhpcy5yZW5kZXJlci5zZXRTeW5jTW92ZW1lbnQoNDUwLCA0NTApLnRoZW4oKCkgPT4ge1xuICAgICAgXy5mb3JFYWNoKHRoaXMucGxheWVycywgcGxheWVyID0+IHBsYXllci5yZWxlYXNlQWxsKCkpO1xuICAgICAgdGhpcy5jdWJlLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3Jlc2V0Jyk7XG4gICAgICB0aGlzLnNldEN1cnJlbnRQbGF5ZXIoXy5maXJzdCh0aGlzLnBsYXllcnMpKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBQb3RlbnRpYWxseSBkYW5nZXJvdXMgYXMgdGhpcyBpcyBoYWNrYWJsZS4uLlxuICAvLyBQZXJoYXBzIGRvIGEgc3RyYWlnaC11cCBlbGVtZW50IG1hdGNoIHRvbz9cbiAgX2dldFRpbGVGcm9tRWxlbWVudDogZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgZGF0YTtcbiAgICBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aWxlJykpIHtcbiAgICAgIGRhdGEgPSBlbC5pZC5zcGxpdCgnLScpO1xuICAgICAgcmV0dXJuIHRoaXMuY3ViZS5nZXRTaWRlcyhkYXRhWzBdKS5nZXRUaWxlcyhkYXRhWzFdKVswXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENsYWltZXMgYWxsIHRoZSB0aWxlcyB0aGUgYm90IGhhcyBzZWxlY3RlZCBhbmQgdXBkYXRlcyB0aGUgVUkgdXNpbmcgYVxuICAgKiBmbG93IHRoZSB1c2VyIGlzIGZhbWlsaWFyIHdpdGguXG4gICAqIEBwYXJhbSAge0FycmF5fSB0aWxlcyBUaGUgdGlsZXMgdGhlIGJvdCBoYXMgc2VsZWN0ZWQuXG4gICAqL1xuICBfYm90VGlsZVNlbGVjdGlvbjogZnVuY3Rpb24odGlsZXMpIHtcblxuICAgIC8qKlxuICAgICAqIEEgc2ltcGxlIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2UgYWZ0ZXIgYWZ0ZXIgdGhlIGJvdCBpc1xuICAgICAqIGZpbmlzaGVkICd0aGlua2luZycuXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHJlc29sdmVkIGFmdGVyIGEgc2V0IHBlcmlvZCBvZiB0aW1lLlxuICAgICAqL1xuICAgIHZhciB3YWl0ID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIEJvdC5USElOS0lOR19TUEVFRCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gV2FpdCBhIG1vbWVudCBiZWZvcmUgcnVubmluZyB0aHJvdWdoIHRoZSBzZWxlY3Rpb24gVUkgdXBkYXRlcywgd2hpY2hcbiAgICAvLyBpbmNsdWRlIHJvdGF0aW5nIHRoZSBjdWJlIHRvIGRpc3BsYXkgYWxsIHRoZSB0aWxlcywgc2hvd2luZyBjcm9zc2hhaXJzXG4gICAgLy8gZm9yIHRoZSBmaXJzdCB0aWxlLCBhbmQgdGhlbiBjbGFpbWluZyBhbGwgYmVmb3JlIGVuZGluZyB0aGUgdHVybi5cbiAgICB3YWl0KClcbiAgICAgIC50aGVuKCgpID0+IHRoaXMuY3ViZS5yb3RhdGVUb1RpbGVzKHRpbGVzKSlcbiAgICAgIC50aGVuKHdhaXQpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLnNob3dDcm9zc2hhaXJzKHRpbGVzWzBdKSlcbiAgICAgIC50aGVuKHdhaXQpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuY3VycmVudFBsYXllci5jbGFpbUFsbCgpO1xuICAgICAgICB0aGlzLl9lbmRUdXJuKHRpbGVzKTtcbiAgICAgIH0pO1xuICB9LFxuXG4gIF9oYW5kbGVDbGljazogZnVuY3Rpb24oZXZ0KSB7XG5cbiAgICAvLyBHZXQgdGhlIHRhcmdldCBlbGVtZW50IGZyb20gdGhlIGV2ZW50LlxuICAgIHZhciB0aWxlID0gdGhpcy5fZ2V0VGlsZUZyb21FbGVtZW50KGV2dC50YXJnZXQpO1xuXG4gICAgLy8gSWYgdGhlIHRpbGUgZXhpc3RzLCB0cnkgdG8gc2VsZWN0IGl0LlxuICAgIGlmICh0aWxlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRQbGF5ZXJcbiAgICAgICAgLnNlbGVjdFRpbGUodGlsZSwgdGhpcy5faGVscGVyVGlsZSlcblxuICAgICAgICAvLyBPbiBzdWNjZXNzLCByZWFjdCBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIHRpbGVzIGN1cnJlbnRseSBzZWxlY3RlZC5cbiAgICAgICAgLnN1Y2Nlc3MoZGF0YSA9PiB7XG5cbiAgICAgICAgICAvLyBDYWNoZSB0aGUgc2VsZWN0ZWQgdGlsZXMuXG4gICAgICAgICAgdmFyIHNlbGVjdGVkID0gZGF0YS5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgbGVuZ3RoID0gc2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoO1xuXG4gICAgICAgICAgaWYgKGRhdGEuZGVzZWxlY3QpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZUNyb3NzaGFpcnMoZGF0YS5kZXNlbGVjdFswXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5zaG93Q3Jvc3NoYWlycyhzZWxlY3RlZFswXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKGxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGxheWVyLmNsYWltQWxsKCk7XG4gICAgICAgICAgICB0aGlzLl9lbmRUdXJuKHNlbGVjdGVkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gT24gZmFpbHVyZSwgZGlzcGxheSBhIG1lc3NhZ2UgYmFzZWQgb24gdGhlIGZhaWx1cmUgY29kZS5cbiAgICAgICAgLmZhaWx1cmUoY29kZSA9PiB0aGlzLm1lc3NhZ2VzLmFkZChjb2RlLCAnZXJyb3InKSk7XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVNb3VzZU92ZXI6IGZ1bmN0aW9uKGV2dCkge1xuXG4gICAgLy8gVGhlIHRpbGUgdGhlIHVzZXIgaXMgaW50ZXJhY3Rpbmcgd2l0aC5cbiAgICB2YXIgdGlsZSA9IHRoaXMuX2dldFRpbGVGcm9tRWxlbWVudChldnQudGFyZ2V0KSxcblxuICAgICAgICAvLyBUaGUgZmlyc3QgdGlsZSB0aGF0IGhhcyBiZWVuIHNlbGVjdGVkLlxuICAgICAgICBpbml0aWFsVGlsZSA9IHRoaXMuY3VycmVudFBsYXllci5nZXRJbml0aWFsVGlsZSgpO1xuXG4gICAgLy8gSWYgdGhlIHVzZXIgaXMgaG92ZXJpbmcgb24gYSBuZWlnaGJvcmluZyBzaWRlIG9mIHRoZSBpbml0aWFsIHRpbGUsXG4gICAgLy8gaGlnaGxpZ2h0IHNvbWUgdGFyZ2V0aW5nIGhlbHAgb24gYSB2aXNpYmxlIHNpZGUuXG4gICAgdGhpcy5faGVscGVyVGlsZSA9IHRoaXMuY3ViZS5nZXRBdHRhY2tUaWxlKHRpbGUsIGluaXRpYWxUaWxlKTtcblxuICAgIGlmICh0aGlzLl9oZWxwZXJUaWxlKSB7XG4gICAgICB0aGlzLl9oZWxwZXJUaWxlLmFkZENsYXNzKCdoZWxwZXInKTtcbiAgICB9XG4gIH0sXG5cbiAgX2hhbmRsZU1vdXNlT3V0OiBmdW5jdGlvbihldnQpIHtcbiAgICB0aGlzLmNsZWFySGVscGVyVGlsZSgpO1xuICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHtldmVudHN9IGZyb20gJy4vdXRpbC92ZW5kb3InO1xuXG5mdW5jdGlvbiBNZXNzYWdlcygpIHtcbiAgdGhpcy5kZWxheSA9IDEwMDtcbiAgdGhpcy5xdWV1ZSA9IFtdO1xuICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuX2J1aWxkQ29udGFpbmVyKCk7XG4gIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzLmFuaW1hdGlvbkVuZCwgXy5iaW5kKHRoaXMuX3JlbW92ZSwgdGhpcykpO1xufVxuXG5NZXNzYWdlcy5wcm90b3R5cGUgPSB7XG5cbiAgbGlzdGVuVG86IGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgIHNvdXJjZS5vbignbWVzc2FnZScsIF8uYmluZCh0aGlzLmFkZCwgdGhpcykpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IG1lc3NhZ2UgdG8gYWRkIHRvIHRoZSBxdWV1ZS5cbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXlbU3RyaW5nXX0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0ZXh0IG9yIGFuIGFycmF5IG9mIG1lc3NhZ2VzLlxuICAgKiBAcGFyYW0ge1tTdHJpbmddfSBjbGFzc2VzIEEgc3BhY2Utc2VwYXJhdGVkIGxpc3Qgb2YgY2xhc3NlcyB0byBhcHBlbmQgdG8gdGhlIG1lc3NhZ2UuXG4gICAqIEByZXR1cm4ge01lc3NhZ2VzfSBSZXR1cm5zIGl0c2VsZiBmb3IgY2hhaW5pbmcuXG4gICAqL1xuICBhZGQ6IGZ1bmN0aW9uKG1lc3NhZ2UsIGNsYXNzZXMpIHtcblxuICAgIC8vIEZvcm1hdCB0aGUgbWVzc2FnZSBhcyBhbiBhcnJheSBpZiBub3QgYWxyZWFkeS5cbiAgICBtZXNzYWdlID0gXy5pc0FycmF5KG1lc3NhZ2UpID8gbWVzc2FnZSA6IFttZXNzYWdlXTtcblxuICAgIC8vIEdlbmVyYXRlIGEgbWVzc2FnZSBpdGVtIGZvciBlYWNoIG1lc3NhZ2UuXG4gICAgLy8gSWYgdGhlIHRleHQgbWF0Y2hlcyBhIExJU1Qga2V5LCB1c2UgdGhlIGtleSdzIHZhbHVlLlxuICAgIF8uZm9yRWFjaChtZXNzYWdlLCB0ZXh0ID0+IHtcbiAgICAgIHRoaXMuX2dlbmVyYXRlSXRlbShNZXNzYWdlcy5MSVNUW3RleHRdIHx8IHRleHQsIGNsYXNzZXMpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIHBlcnNpc3RlZCBtZXNzYWdlcyBmcm9tIHRoZSBxdWV1ZSBieSBhZGRpbmcgdGhlICdoaWRlJ1xuICAgKiBjbGFzcyB0byBlYWNoIG9uZS5cbiAgICovXG4gIHJlbW92ZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgXy5mb3JFYWNoKHRoaXMuY29udGFpbmVyLmNoaWxkcmVuLCBpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZScpKTtcbiAgfSxcblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgbWVzc2FnZSBlbGVtZW50IGFuZCBxdWV1ZXMgaXQgdXAgZm9yIGRpc3BsYXkuXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0gIHtbU3RyaW5nXX0gY2xhc3NlcyBBIHNwYWNlLXNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzZXMgdG8gYXBwZW5kIHRvIHRoZSBtZXNzYWdlLlxuICAgKi9cbiAgX2dlbmVyYXRlSXRlbTogZnVuY3Rpb24obWVzc2FnZSwgY2xhc3Nlcykge1xuXG4gICAgLy8gR2VuZXJhdGUgYSBuZXcgZWxlbWVudCB0byBjb250YWluIHRoZSBtZXNzYWdlLlxuICAgIHZhciBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcblxuICAgIC8vIEFkZCBzcGVjaWFsIGNsYXNzZXMgdG8gZGVjb3JhdGUgdGhlIG1lc3NhZ2UgaWYgcGFzc2VkLiBXZSB3YW50IHRvIHVzZSBhcHBseSBoZXJlIFxuICAgIC8vIGJlY2F1c2UgYWRkIHRha2VzIG11bHRpcGxlIGFyZ3VtZW50cywgbm90IGFuIGFycmF5IG9mIG5hbWVzLlxuICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICBET01Ub2tlbkxpc3QucHJvdG90eXBlLmFkZC5hcHBseShpdGVtLmNsYXNzTGlzdCwgY2xhc3Nlcy5zcGxpdCgnICcpKTtcbiAgICB9XG5cbiAgICAvLyBBcHBlbmQgdGhlIG1lc3NhZ2UgdG8gdGhlIG5ldyBlbGVtZW50IGFuZCBxdWV1ZSBpdCB1cC5cbiAgICBpdGVtLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKTtcbiAgICB0aGlzLl9lbnF1ZXVlKGl0ZW0pO1xuICB9LFxuXG4gIF9lbnF1ZXVlOiBmdW5jdGlvbihpdGVtKSB7XG5cbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXIsXG4gICAgICAgIHF1ZXVlID0gdGhpcy5xdWV1ZSxcbiAgICAgICAgZGVsYXkgPSBxdWV1ZS5sZW5ndGggKiB0aGlzLmRlbGF5O1xuXG4gICAgcXVldWUucHVzaChpdGVtKTtcblxuICAgIF8uZGVsYXkoZnVuY3Rpb24oaSkge1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgICAgaWYgKF8ubGFzdChxdWV1ZSkgPT09IGkpIHtcbiAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcbiAgICAgIH1cbiAgICB9LCBkZWxheSwgaXRlbSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBtZXNzYWdlIGl0ZW0gcmVmZXJlbmNlZCBieSB0aGUgcGFzc2VkIGFuaW1hdGlvbmVuZCBldmVudC5cbiAgICogVGhlIG1lc3NhZ2Ugd2lsbCBiZSByZW1vdmVkIGlmIGl0J3Mgbm90IHBlcnNpc3RlbnQgb3IgaXQgY29udGFpbnNcbiAgICogdGhlICdoaWRlJyBjbGFzcy5cbiAgICogQHBhcmFtICB7YW5pbWF0aW9uZW5kfSBldnQgQW4gYW5pbWF0aW9uZW5kIGV2ZW50LlxuICAgKi9cbiAgX3JlbW92ZTogZnVuY3Rpb24oZXZ0KSB7XG4gICAgdmFyIGNsYXNzTGlzdCA9IGV2dC50YXJnZXQuY2xhc3NMaXN0O1xuICAgIGlmICghY2xhc3NMaXN0LmNvbnRhaW5zKCdwZXJzaXN0JykgfHwgY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRlJykpIHtcbiAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUNoaWxkKGV2dC50YXJnZXQpO1xuICAgIH1cbiAgfSxcblxuICBfYnVpbGRDb250YWluZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGNvbnRhaW5lci5pZCA9ICdtZXNzYWdlcyc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIHJldHVybiBjb250YWluZXI7XG4gIH1cblxufTtcblxuTWVzc2FnZXMuTElTVCA9IHtcbiAgY2xhaW1lZDogJ1RoaXMgdGlsZSBpcyBhbHJlYWR5IGNsYWltZWQhJyxcbiAgdGFyZ2V0Q2xhaW1lZDogJ1RoZSBhdHRhY2sgdGFyZ2V0IGlzIGFscmVhZHkgY2xhaW1lZCBieSB5b3UhJyxcbiAgY2Fubm90QXR0YWNrOiAnWW91IGNhbm5vdCBhdHRhY2sgeW91ciBvd24gdGlsZSEnLFxuICBzYW1lU2lkZTogJ1NhbWUgc2lkZSEgQ2hvb3NlIGEgdGlsZSBvbiBhIGRpZmZlcmVudCBzaWRlLicsXG4gIG5vdE5laWdoYm9yOiAnTm90IGEgbmVpZ2hib3Jpbmcgc2lkZSEgQ2hvb3NlIGEgdGlsZSBkaWZmZXJlbnQgc2lkZS4nLFxuICBzdGFsZW1hdGU6ICdTdGFsZW1hdGUhJyxcbiAgbmV3R2FtZTogJ0NsaWNrIGFueXdoZXJlIHRvIGJlZ2luIGEgbmV3IGdhbWUuJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZXM7XG4iLCJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IEJvdCBmcm9tICcuL2JvdCc7XG5pbXBvcnQgVGlsZVNlbGVjdG9yIGZyb20gJy4vc2VsZWN0aW9uL1RpbGVTZWxlY3Rvcic7XG5pbXBvcnQgQ3ViZUNhY2hlIGZyb20gJy4vc2VsZWN0aW9uL0N1YmVDYWNoZSc7XG5cbmZ1bmN0aW9uIFBsYXllcihuYW1lLCB0aWxlQ2xhc3MsIGN1YmUpIHtcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAgdGhpcy50aWxlQ2xhc3MgPSB0aWxlQ2xhc3M7XG4gIHRoaXMuX3NlbGVjdG9yID0gbmV3IFRpbGVTZWxlY3Rvcih0aGlzKTtcbiAgdGhpcy5fY3ViZUNhY2hlID0gbmV3IEN1YmVDYWNoZShjdWJlKTtcbn1cblxuUGxheWVyLnByb3RvdHlwZSA9IHtcblxuICBpc0JvdDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBCb3Q7XG4gIH0sXG5cbiAgY2xhaW06IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICB0aWxlLmNsYWltKHRoaXMpO1xuICAgIHRoaXMuX2N1YmVDYWNoZS5hZGQodGlsZSk7XG4gIH0sXG5cbiAgcmVsZWFzZTogZnVuY3Rpb24odGlsZSkge1xuICAgIHRoaXMuX2N1YmVDYWNoZS5yZW1vdmUodGlsZSk7XG4gICAgdGlsZS5yZWxlYXNlKCk7XG4gIH0sXG5cbiAgcmVsZWFzZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgXy5mb3JFYWNoKHRoaXMuX2N1YmVDYWNoZS5nZXRBbGxUaWxlcygpLCB0aWxlID0+IHRpbGUucmVsZWFzZSgpKTtcbiAgICB0aGlzLl9jdWJlQ2FjaGUuaW5pdGlhbGl6ZSgpO1xuICB9LFxuXG4gIGdldExpbmVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY3ViZUNhY2hlLmdldExpbmVzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge0FycmF5W1RpbGVdfSBBbGwgdGhlIHRpbGVzIGNsYWltZWQgdGhhdCBkbyBub3QgY29tcG9zZSBsaW5lcy5cbiAgICovXG4gIGdldFNpbmdsZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jdWJlQ2FjaGUuX3NpbmdsZXM7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge1RpbGV9IFRoZSBmaXJzdCB0aWxlIHNlbGVjdGVkIHRvIGJlIGNsYWltZWQuXG4gICAqL1xuICBnZXRJbml0aWFsVGlsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdG9yLmdldEluaXRpYWwoKTtcbiAgfSxcblxuICBnZXRBdHRhY2tUaWxlOiBmdW5jdGlvbih0aWxlMSwgdGlsZTIpIHtcbiAgICByZXR1cm4gdGhpcy5fY3ViZUNhY2hlLl9jdWJlLmdldEF0dGFja1RpbGUodGlsZTEsIHRpbGUyKTtcbiAgfSxcblxuICAvKipcbiAgICogV2luIGxpbmVzIGFyZSBjb21wbGV0ZWQgbGluZXMuIFRoaXMgbWV0aG9kIHJldHVybnMgYWxsIHRoZSB3aW5cbiAgICogbGluZXMgY2xhaW1lZCBieSB0aGUgcGxheWVyLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gQSBjb2xsZWN0aW9uIG9mIHRoaXMgcGxheWVyJ3Mgd2luIGxpbmVzLlxuICAgKi9cbiAgZ2V0V2luTGluZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaXplID0gdGhpcy5fY3ViZUNhY2hlLl9jdWJlLnNpemU7XG4gICAgcmV0dXJuIF8uZmlsdGVyKHRoaXMuZ2V0TGluZXMoKSwgZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUubGVuZ3RoKCkgPT09IHNpemU7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERpY3RhdGVzIHdoZXRoZXIgb3Igbm90IHRoZSBwbGF5ZXIgY2FuIGF0dGFjayB0aGUgZ2l2ZW4gdGlsZS5cbiAgICogQmFzaWNhbGx5LCBhcyBsb25nIGFzIHRoZSB0aWxlIGlzIG5vdCBjbGFpbWVkIGJ5IHRoZSBwbGF5ZXIgYW5kXG4gICAqIGlzIG5vdCBzb21lIGJhcnJpZXIsIHRoZSB0aWxlIGNhbiBiZSBhdHRhY2tlZC5cbiAgICogQHBhcmFtICB7VGlsZX0gdGlsZSBUaGUgdGlsZSB0byBjaGVjay5cbiAgICogQHJldHVybiB7Qm9vbGVhbn0gQ2FuIHRoZSBnaXZlbiB0aWxlIGJlIGF0dGFja2VkIGJ5IHRoaXMgcGxheWVyP1xuICAgKi9cbiAgY2FuQXR0YWNrOiBmdW5jdGlvbih0aWxlKSB7XG4gICAgcmV0dXJuIHRpbGUuY2xhaW1lZEJ5ICE9PSB0aGlzO1xuICB9LFxuXG4gIHNlbGVjdFRpbGU6IGZ1bmN0aW9uKHRpbGUsIGF0dGFja1RpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0b3IudmFsaWRhdGUodGlsZSwgYXR0YWNrVGlsZSk7XG4gIH0sXG5cbiAgY2xhaW1BbGw6IGZ1bmN0aW9uKCkge1xuXG4gICAgXy5mb3JFYWNoKHRoaXMuX3NlbGVjdG9yLl9zZWxlY3RlZCwgZnVuY3Rpb24odGlsZSwgaW5kZXgsIGFycmF5KSB7XG5cbiAgICAgIC8vIElmIHRoZSB0aWxlIGlzIGFscmVhZHkgY2xhaW1lZCwgdGhpcyBpcyBhbiBhdHRhY2shIFJlbGVhc2UgaXQuXG4gICAgICAvLyBBbHNvLCByZXBsYWNlIGl0IHdpdGggYXR0YWNrIGRhdGEgc28gdGhlIHJlY29yZGVyIHdpbGwgd29yay5cbiAgICAgIGlmICh0aWxlLmNsYWltZWRCeSkge1xuICAgICAgICBhcnJheVtpbmRleF0gPSB0aGlzLl9jcmVhdGVBdHRhY2tEYXRhKHRpbGUpO1xuICAgICAgICB0aWxlLmNsYWltZWRCeS5yZWxlYXNlKHRpbGUpO1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UsIGNsYWltIHRoYXQgc3Vja2VyLlxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuY2xhaW0odGlsZSk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG5cbiAgICB0aGlzLl9zZWxlY3Rvci5yZXNldCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgdG8gc2VlIGlmIHRoZSBwbGF5ZXIgaGFzIGF0IGxlYXN0IG9uZSB2YWxpZCBtb3ZlLlxuICAgKiBSZXNldHMgdGhlIHNlbGVjdG9yIGFmdGVyIHBlcmZvcm1pbmcgdGhlIGNoZWNrLlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBEb2VzIGEgdmFsaWQgbW92ZSBleGlzdD9cbiAgICovXG4gIGhhc1ZhbGlkTW92ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoYXNNb3ZlID0gdGhpcy5zZWxlY3RSYW5kb20oKTtcbiAgICB0aGlzLl9zZWxlY3Rvci5yZXNldCgpO1xuICAgIHJldHVybiBoYXNNb3ZlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBNYWtlcyBhIHJhbmRvbSB2YWxpZCBzZWxlY3Rpb24uXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IFdhcyBhIHZhbGlkIHNlbGVjdGlvbiBtYWRlP1xuICAgKi9cbiAgc2VsZWN0UmFuZG9tOiBmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgc3RhcnRpbmcgdGlsZSwgYXR0ZW1wdCB0byBtYXRjaCB0d28gbW9yZTogYSBzZWNvbmRhcnkgdGlsZVxuICAgICAqIGFuZCB0aGUgYXR0YWNrIHRpbGUuXG4gICAgICogQHBhcmFtICB7VGlsZX0gaW5pdGlhbCBUaGUgc3RhcnRpbmcgdGlsZSB0byB0ZXN0LlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IFdhcyBhIHN1Y2Nlc3NmdWwgbWF0Y2ggbWFkZT9cbiAgICAgKi9cbiAgICB2YXIgYXR0ZW1wdCA9IGluaXRpYWwgPT4ge1xuXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCB0aGUgdGlsZXMgdW50aWwgdHdvIG1vcmUgc2VsZWN0aW9ucyBhcmUgdmFsaWQuXG4gICAgICAgIC8vIElmIG5vIG1hdGNoZXMgYXJlIGZvdW5kLCB0aGUgYXR0ZW1wdCBmYWlscyBhbmQgcmV0dXJucyBmYWxzZS5cbiAgICAgICAgcmV0dXJuIF8uc29tZSh0aWxlcywgdGlsZSA9PiB7XG5cbiAgICAgICAgICAvLyBHZXQgdGhlIGF0dGFjayB0aWxlIGZyb20gdGhlIGluaXRpYWwgYW5kIHRpbGUgaW50ZXJzZWN0aW9uLlxuICAgICAgICAgIHZhciBhdHRhY2tUaWxlID0gdGhpcy5nZXRBdHRhY2tUaWxlKGluaXRpYWwsIHRpbGUpO1xuXG4gICAgICAgICAgLy8gSWYgdGhlIGF0dGFjayB0aWxlIGFuZCBsb29wIHRpbGUgYXJlIHZhbGlkLCB3ZSdyZSBnb29kIVxuICAgICAgICAgIHJldHVybiBhdHRhY2tUaWxlICYmIHNlbGVjdG9yLnZhbGlkYXRlKHRpbGUsIGF0dGFja1RpbGUpLnN1Y2Nlc3MoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBDYWNoZWQgcmVmZXJlbmNlIHRvIHRoZSBwbGF5ZXIncyBzZWxlY3Rvci5cbiAgICAgIHNlbGVjdG9yID0gdGhpcy5fc2VsZWN0b3IsXG5cbiAgICAgIC8vIFRoZSBpbml0aWFsIHRpbGUsIGlmIGF2YWlsYWJsZS4gT3RoZXJ3aXNlIHVuZGVmaW5lZC5cbiAgICAgIGluaXRpYWwgPSBzZWxlY3Rvci5nZXRJbml0aWFsKCksXG5cbiAgICAgIC8vIEFuIGFycmF5IG9mIGFsbCB0aGUgYXZhaWxhYmxlIHRpbGVzIGZvciB0aGlzIHBsYXllci5cbiAgICAgIHRpbGVzID0gdGhpcy5fY3ViZUNhY2hlLl9jdWJlLmdldEF2YWlsYWJsZVRpbGVzKGluaXRpYWwpO1xuXG4gICAgLy8gSWYgYW4gaW5pdGlhbCB0aWxlIGlzIGF2YWlsYWJsZSBhbmQgYSBtYXRjaCBjYW4gYmUgZm91bmQsIHJldHVybiB0cnVlLlxuICAgIC8vIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyB1c2VkIGJ5IHRoZSBib3QgaW4gdGhlIGxhc3QgcmVzb3J0IHNlbGVjdGlvbi5cbiAgICBpZiAoaW5pdGlhbCAmJiBhdHRlbXB0KGluaXRpYWwpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBSdW4gdGhyb3VnaCBhbGwgdGhlIHRpbGVzIGFuZCB0cnkgdG8gZmluZCBhIG1hdGNoLlxuICAgIC8vIElmIG5vIG1hdGNoIGlzIGZvdW5kLCBmYWxzZSBpcyByZXR1cm5lZC5cbiAgICByZXR1cm4gXy5zb21lKHRpbGVzLCB0aWxlID0+IHtcblxuICAgICAgLy8gUmVzZXQgdGhlIHNlbGVjdG9yIGZvciBhIG5ldyBzdGFydGluZyBwb2ludC5cbiAgICAgIHNlbGVjdG9yLnJlc2V0KCk7XG5cbiAgICAgIC8vIElmIHRoZSBuZXcgdGlsZSBpcyB2YWxpZCBhbmQgdGhlIGF0dGVtcHQgdG8gZmluZCB0d28gbW9yZSBzdWNjZWVkcyxcbiAgICAgIC8vIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSB2YWxpZCBtb3ZlIGFuZCB0cnVlIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAgICByZXR1cm4gc2VsZWN0b3IudmFsaWRhdGUodGlsZSkuc3VjY2VzcygpICYmIGF0dGVtcHQodGlsZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX2NyZWF0ZUF0dGFja0RhdGE6IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGxheWVyOiB0aWxlLmNsYWltZWRCeSxcbiAgICAgIHRpbGU6IHRpbGUsXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnKGF0dGFjayAtPiAnICsgdGlsZS50b1N0cmluZygpICsgJyknXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG59O1xuXG5fLmFzc2lnbihCb3QucHJvdG90eXBlLCBQbGF5ZXIucHJvdG90eXBlKTtcblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyO1xuIiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBUaWxlIGZyb20gJy4vY3ViZS90aWxlJztcblxuZnVuY3Rpb24gUmVjb3JkZXIoYXBwKSB7XG4gIHRoaXMuX3RpbWVsaW5lID0gW107XG4gIHRoaXMuX2N1cnNvciA9IDA7XG4gIHRoaXMuX2FwcCA9IGFwcDtcbn1cblxuUmVjb3JkZXIuTUVTU0FHRVMgPSB7XG4gIE5PVF9GT1VORDogJ0NvdWxkIG5vdCBsb2NhdGUgYSB0dXJuIGF0ICcsXG4gIFJFV1JJVEU6ICdUdXJucyBhcmUgbm93IGJlaW5nIHJld3JpdHRlbiBhcyB0aGUgdGltZWxpbmUgd2FzIGJlaGluZCBieSAnLFxuICBOT19MT0c6ICdbTm8gbG9nIGZvciB0aGlzIHR1cm5dJ1xufTtcblxuUmVjb3JkZXIucHJvdG90eXBlID0ge1xuXG4gIHJlY29yZDogZnVuY3Rpb24ocGxheWVyLCB0aWxlcykge1xuXG4gICAgdmFyIGJlaGluZCA9IHRoaXMuX3RpbWVsaW5lLmxlbmd0aCAtIHRoaXMuX2N1cnNvcjtcblxuICAgIGlmIChiZWhpbmQpIHtcbiAgICAgIGNvbnNvbGUud2FybihSZWNvcmRlci5NRVNTQUdFUy5SRVdSSVRFICsgYmVoaW5kKTtcbiAgICAgIHRoaXMuX3RpbWVsaW5lID0gXy5kcm9wUmlnaHQodGhpcy5fdGltZWxpbmUsIGJlaGluZCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcGFja2FnZShwbGF5ZXIsIHRpbGVzKTtcbiAgICB0aGlzLl9jdXJzb3IrKztcbiAgfSxcblxuICBmb3J3YXJkOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciB0dXJuRGF0YSA9IHRoaXMuX3RpbWVsaW5lW3RoaXMuX2N1cnNvcl07XG5cbiAgICBpZiAodHVybkRhdGEpIHtcbiAgICAgIF8uZm9yRWFjaCh0dXJuRGF0YS50aWxlcywgZnVuY3Rpb24odGlsZSkge1xuICAgICAgICBpZiAodGlsZSBpbnN0YW5jZW9mIFRpbGUpIHtcbiAgICAgICAgICB0dXJuRGF0YS5wbGF5ZXIuY2xhaW0odGlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGlsZS5wbGF5ZXIucmVsZWFzZSh0aWxlLnRpbGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKHR1cm5EYXRhLmxvZyk7XG4gICAgICB0aGlzLl9jdXJzb3IrKztcbiAgICAgIHRoaXMuX2FwcC5zZXRDdXJyZW50UGxheWVyKHRoaXMuX2FwcC5nZXRPcHBvbmVudCh0dXJuRGF0YS5wbGF5ZXIpLCB0cnVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBSZWNvcmRlci5NRVNTQUdFUy5OT1RfRk9VTkQgKyB0aGlzLl9jdXJzb3I7XG4gICAgfVxuICB9LFxuXG4gIHJldmVyc2U6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHR1cm5EYXRhID0gdGhpcy5fdGltZWxpbmVbdGhpcy5fY3Vyc29yIC0gMV07XG5cbiAgICBpZiAodHVybkRhdGEpIHtcbiAgICAgIF8uZm9yRWFjaCh0dXJuRGF0YS50aWxlcywgZnVuY3Rpb24odGlsZSkge1xuICAgICAgICBpZiAodGlsZSBpbnN0YW5jZW9mIFRpbGUpIHtcbiAgICAgICAgICB0dXJuRGF0YS5wbGF5ZXIucmVsZWFzZSh0aWxlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aWxlLnBsYXllci5jbGFpbSh0aWxlLnRpbGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2N1cnNvci0tO1xuICAgICAgdGhpcy5fYXBwLnNldEN1cnJlbnRQbGF5ZXIodHVybkRhdGEucGxheWVyLCB0cnVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBSZWNvcmRlci5NRVNTQUdFUy5OT1RfRk9VTkQgKyB0aGlzLl9jdXJzb3I7XG4gICAgfVxuICB9LFxuXG4gIF9wYWNrYWdlOiBmdW5jdGlvbihwbGF5ZXIsIHRpbGVzKSB7XG4gICAgdGhpcy5fdGltZWxpbmUucHVzaCh7XG4gICAgICBwbGF5ZXI6IHBsYXllcixcbiAgICAgIHRpbGVzOiB0aWxlcyxcbiAgICAgIGxvZzogcGxheWVyLl9sb2dUZXh0IHx8IFJlY29yZGVyLk1FU1NBR0VTLk5PX0xPR1xuICAgIH0pO1xuICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFJlY29yZGVyO1xuIiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuLyoqXG4gKiBBIHNvZnR3YXJlIGludGVyZmFjZSBmb3IgZGV0ZXJtaW5pbmcgd2hpY2gga2V5Ym9hcmQga2V5cyBhcmUgcHJlc3NlZC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5IHx8IFN0cmluZ30ga2V5Q29kZXMgQSBjb2xsZWN0aW9uIG9mIGFsbCB0aGUgKHN0cmluZykga2V5Q29kZXMgdXNlZC5cbiAqL1xuZnVuY3Rpb24gS2V5Ym9hcmQoa2V5Q29kZXMsIHNwZWVkKSB7XG5cbiAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuXG4gIC8vIElmIHRoZSBrZXlDb2RlcyBhcmUgYSBzdHJpbmcsIHNwbGl0IHRoZW0gaW50byBhbiBhcnJheS5cbiAgaWYgKHR5cGVvZiBrZXlDb2RlcyA9PT0gJ3N0cmluZycpIHtcbiAgICBrZXlDb2RlcyA9IGtleUNvZGVzLnNwbGl0KCcgJyk7XG4gIH1cblxuICAvLyBMb29wIHRocm91Z2ggdGhlIGNvZGVzIGFuZCBzZXQgdGhlbSBhcyBrZXlzLlxuICB0aGlzLmtleXMgPSBfLnJlZHVjZShrZXlDb2RlcywgKGNvbGxlY3Rpb24sIGNvZGUpID0+IHtcbiAgICBjb2xsZWN0aW9uW2NvZGVdID0gZmFsc2U7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH0sIHt9KTtcbn1cblxuS2V5Ym9hcmQucHJvdG90eXBlID0geyBcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgYmluZHMga2V5Ym9hcmQgbGlzdGVuZXIgaGFuZGxlcnMgZm9yIGludGVyYWN0aW9ucy5cbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIEEgbWV0aG9kIHRvIGNhbGwgZnJvbSB3aXRoaW4gdGhlIGhhbmRsZXJzLlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGNvbnRleHQgVGhlIG9iamVjdCB0aGF0IHdpbGwgbGlzdGVuIGZvciBrZXlib2FyZCBldmVudHMuXG4gICAqL1xuICBsaXN0ZW46IGZ1bmN0aW9uKGNhbGxiYWNrLCBjb250ZXh0ID0gd2luZG93KSB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gYm91bmQgdG8gdGhpcyBLZXlib2FyZCBpbnN0YW5jZSB0aGF0XG4gICAgICogcGFydGlhbGx5IGluY2x1ZGVzIHRoZSBjYWxsYmFjayBhcmd1bWVudC5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gaGFuZGxlciBUaGUgY29yZSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgaW52b2tlZC5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBuZXcgYm91bmQgYW5kIGZpbGxlZCBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICB2YXIgZ2VuZXJhdGVIYW5kbGVyID0gaGFuZGxlciA9PiBfLmJpbmQoXy5wYXJ0aWFsUmlnaHQoaGFuZGxlciwgY2FsbGJhY2spLCB0aGlzKTtcblxuICAgIC8vIENvbmZpZ3VyZSBib3VuZCBsaXN0ZW5lciBoYW5kbGVycyB0byBlYXNlIHJlbW92aW5nIGxhdGVyLlxuICAgIHRoaXMuX2JvdW5kSGFuZGxlS2V5ZG93biA9IGdlbmVyYXRlSGFuZGxlcih0aGlzLl9oYW5kbGVLZXlkb3duKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZUtleXVwID0gZ2VuZXJhdGVIYW5kbGVyKHRoaXMuX2hhbmRsZUtleXVwKTtcblxuICAgIC8vIExpc3RlbiBmb3Iga2V5dXAgYW5kIGtleWRvd24gdG8gdHJpZ2dlciBpbnRlcmFjdGlvbnMuXG4gICAgY29udGV4dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fYm91bmRIYW5kbGVLZXlkb3duKTtcbiAgICBjb250ZXh0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5fYm91bmRIYW5kbGVLZXl1cCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBrZXlib2FyZCBldmVudCBsaXN0ZW5lcnMuXG4gICAqIEBwYXJhbSAge09iamVjdH0gY29udGV4dCBUaGUgb2JqZWN0IHRvIHJlbW92ZSB0aGUgbGlzdGVuZXJzIGZyb20uXG4gICAqL1xuICBzdG9wTGlzdGVuaW5nOiBmdW5jdGlvbihjb250ZXh0ID0gd2luZG93KSB7XG4gICAgY29udGV4dC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fYm91bmRIYW5kbGVLZXlkb3duKTtcbiAgICBjb250ZXh0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5fYm91bmRIYW5kbGVLZXl1cCk7XG4gIH0sXG5cbiAgZ2V0TW92ZW1lbnQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIEtCID0gS2V5Ym9hcmQsXG4gICAgICAgIGtleXMgPSB0aGlzLmtleXMsXG4gICAgICAgIHggPSAwLFxuICAgICAgICB5ID0gMDtcblxuICAgIC8vIERldGVjdCBlaXRoZXIgdXAgb3IgZG93biBtb3ZlbWVudC5cbiAgICBpZiAoa2V5c1tLQi5VUF0gfHwga2V5c1tLQi5XXSkge1xuICAgICAgeCA9IHRoaXMuc3BlZWQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKGtleXNbS0IuRE9XTl0gfHwga2V5c1tLQi5TXSkge1xuICAgICAgeCA9IC10aGlzLnNwZWVkO1xuICAgIH1cblxuICAgIC8vIERldGVjdCBlaXRoZXIgbGVmdCBvciByaWdodCBtb3ZlbWVudC5cbiAgICBpZiAoa2V5c1tLQi5MRUZUXSB8fCBrZXlzW0tCLkFdKSB7XG4gICAgICB5ID0gdGhpcy5zcGVlZDtcbiAgICB9XG4gICAgZWxzZSBpZiAoa2V5c1tLQi5SSUdIVF0gfHwga2V5c1tLQi5EXSkge1xuICAgICAgeSA9IC10aGlzLnNwZWVkO1xuICAgIH1cblxuICAgIHJldHVybiB7eCwgeX07XG4gIH0sXG5cbiAgX2hhbmRsZUtleWRvd246IGZ1bmN0aW9uKGV2dCwgY2FsbGJhY2spIHtcblxuICAgIHZhciBrZXlDb2RlID0gZXZ0LmtleUNvZGUsXG4gICAgICAgIGtleXMgPSB0aGlzLmtleXM7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoa2V5c1trZXlDb2RlXSkgJiYgIWtleXNba2V5Q29kZV0pIHtcbiAgICAgIGtleXNba2V5Q29kZV0gPSB0cnVlO1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIF9oYW5kbGVLZXl1cDogZnVuY3Rpb24oZXZ0LCBjYWxsYmFjaykge1xuXG4gICAgdmFyIGtleUNvZGUgPSBldnQua2V5Q29kZTtcblxuICAgIGlmICh0aGlzLmtleXNba2V5Q29kZV0pIHtcbiAgICAgIHRoaXMua2V5c1trZXlDb2RlXSA9IGZhbHNlO1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIEtleWJvYXJkIGNvbnN0YW50cyByZWZlcmVuY2luZyBrZXlDb2Rlcy5cbktleWJvYXJkLlVQID0gJzM4JztcbktleWJvYXJkLkRPV04gPSAnNDAnO1xuS2V5Ym9hcmQuTEVGVCA9ICczNyc7XG5LZXlib2FyZC5SSUdIVCA9ICczOSc7XG5LZXlib2FyZC5XID0gJzg3JztcbktleWJvYXJkLkEgPSAnNjUnO1xuS2V5Ym9hcmQuUyA9ICc4Myc7XG5LZXlib2FyZC5EID0gJzY4JztcbktleWJvYXJkLlNQQUNFID0gJzMyJztcbktleWJvYXJkLkVTQ0FQRSA9ICcyNyc7XG5cbmV4cG9ydCBkZWZhdWx0IEtleWJvYXJkO1xuIiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IEtleWJvYXJkIGZyb20gJy4va2V5Ym9hcmQnO1xuaW1wb3J0IFRvdWNoIGZyb20gJy4vdG91Y2gnO1xuXG5mdW5jdGlvbiBSZW5kZXJlcihjdWJlLCBpc01vYmlsZSkge1xuXG4gIC8vIEEgcmVmZXJlbmNlIHRvIHRoZSBnYW1lIGN1YmUuXG4gIHRoaXMuY3ViZSA9IGN1YmU7XG5cbiAgLy8gVGhlIGtleWJvYXJkIGludGVyZmFjZSBmb3IgZGVza3RvcCBpbnRlcmFjdGlvbnMuXG4gIHRoaXMua2V5Ym9hcmQgPSBudWxsO1xuXG4gIC8vIEFuZCB0aGlzIGlzIGZvciB0b3VjaCBpbnRlcmFjdGlvbnMuXG4gIHRoaXMudG91Y2ggPSBudWxsO1xuXG4gIC8vIFRoZSBzcGVlZCB0byBhbmltYXRlIHRoZSBYIGF4aXMuXG4gIHRoaXMubW92ZVggPSAwO1xuXG4gIC8vIFRoZSBzcGVlZCB0byBhbmltYXRlIHRoZSBZIGF4aXMuXG4gIHRoaXMubW92ZVkgPSAwO1xuXG4gIC8vIFRoZSB0b3RhbCBudW1iZXIgb2Ygc3RlcHMgdG8gYW5pbWF0ZSBhIHJvdGF0aW9uLlxuICB0aGlzLnRpY2tNYXggPSA5MDtcblxuICAvLyBUaGUgbnVtYmVyIG9mIHJlbmRlcmluZyBzdGVwcyBsZWZ0IHRvIGFuaW1hdGUuXG4gIHRoaXMudGljayA9IDA7XG5cbiAgLy8gSG93IGZhc3QgZWFjaCB0aWNrIGFuaW1hdGVzLlxuICB0aGlzLnNwZWVkID0gNTtcblxuICAvLyBJcyB0aGUgY2xpZW50IGEgbW9iaWxlIGRldmljZT9cbiAgdGhpcy5pc01vYmlsZSA9IGlzTW9iaWxlO1xufVxuXG5SZW5kZXJlci5wcm90b3R5cGUgPSB7XG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAodGhpcy5pc01vYmlsZSkge1xuICAgICAgdGhpcy5faW5wdXQgPSBuZXcgVG91Y2godGhpcy5zcGVlZCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5faW5wdXQgPSBuZXcgS2V5Ym9hcmQoW1xuICAgICAgICBLZXlib2FyZC5VUCxcbiAgICAgICAgS2V5Ym9hcmQuRE9XTixcbiAgICAgICAgS2V5Ym9hcmQuTEVGVCxcbiAgICAgICAgS2V5Ym9hcmQuUklHSFQsXG4gICAgICAgIEtleWJvYXJkLlcsXG4gICAgICAgIEtleWJvYXJkLkEsXG4gICAgICAgIEtleWJvYXJkLlMsXG4gICAgICAgIEtleWJvYXJkLkRcbiAgICAgIF0sIHRoaXMuc3BlZWQpO1xuICAgIH1cblxuICAgIHRoaXMuY3ViZS5zZXRSZW5kZXJlcih0aGlzKTtcbiAgfSxcblxuICAvKipcbiAgICogU3RvcHMgdGhlIGlucHV0IGxpc3RlbmluZyBmdW5jdGlvbiBmcm9tIGNhbGN1bGF0aW5nIGEgcmVuZGVyLlxuICAgKi9cbiAgbGlzdGVuRm9ySW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2lucHV0Lmxpc3Rlbih0aGlzLl9tb3ZlbWVudExpc3RlbmVyLmJpbmQodGhpcykpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIGlucHV0IGxpc3RlbmluZyBmdW5jdGlvbiB0byBjYWxjdWxhdGUgcmVuZGVycy5cbiAgICovXG4gIHN0b3BMaXN0ZW5pbmdGb3JJbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5faW5wdXQuc3RvcExpc3RlbmluZygpO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gUmVkdWNlIHRoZSB0aWNrcyBhbmQgcm90YXRlIHRoZSBjdWJlXG4gICAgdGhpcy50aWNrIC09IHRoaXMuc3BlZWQ7XG4gICAgdGhpcy5jdWJlLnJvdGF0ZSh0aGlzLm1vdmVYLCB0aGlzLm1vdmVZKTtcblxuICAgIC8vIElmIHRoZXJlIGFyZSB0aWNrcyBsZWZ0IG9yIGEga2V5IGlzIGRvd24sIGtlZXAgbG9vcGluZy5cbiAgICBpZiAodGhpcy50aWNrID4gMCB8fCB0aGlzLl9zZXRNb3ZlbWVudEZyb21JbnB1dCgpKSB7XG4gICAgICB0aGlzLl9sb29wKCk7XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBicm9hZGNhc3QgYW4gZXZlbnQgc2lnbmlmeWluZyB0aGF0IHRoZSByZW5kZXJpbmcgaGFzIGNvbXBsZXRlZC5cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdCgnZW5kJyk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBIHB1YmxpYyBpbnRlcmZhY2UgZm9yIG1hbnVhbGx5IHNldHRpbmcgdGhlIG1vdmVtZW50LlxuICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgdGFyZ2V0IHggY29vcmRpbmF0ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIHRhcmdldCB5IGNvb3JkaW5hdGUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIG1vdmVtZW50IGFuaW1hdGlvbiBlbmRzLlxuICAgKi9cbiAgc2V0TW92ZW1lbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSBhIG1vdmUgaW4gb25lIGRpcmVjdGlvbiBhbmQgc3RhcnQgdGhlIHJlbmRlciBsb29wLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0aWNrIFRoZSBkaXN0YW5jZSB0byByb3RhdGUuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvb3JQcm9wIFdoaWNoIGNvb3JkaW5hdGUgdG8gcm90YXRlIG9uIChtb3ZlWCBvciBtb3ZlWSkuXG4gICAgICovXG4gICAgdmFyIG1vdmUgPSAodGljaywgY29vclByb3ApID0+IHtcbiAgICAgIHRoaXMudGljayA9IE1hdGguYWJzKHRpY2spO1xuICAgICAgdGhpc1tjb29yUHJvcF0gPSAhdGljayA/IDAgOiB0aWNrIDwgMCA/IC10aGlzLnNwZWVkIDogdGhpcy5zcGVlZDtcbiAgICAgIHRoaXMuX2xvb3AoKTtcbiAgICB9O1xuXG4gICAgLy8gUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB3aGVuIGJvdGggeCBhbmQgeSBtb3ZlbWVudHMgYXJlIGNvbXBsZXRlLlxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIG1vdmUoeCwgJ21vdmVYJyk7XG4gICAgICB0aGlzLm9uY2UoJ2VuZCcsICgpID0+IHtcbiAgICAgICAgbW92ZSh5LCAnbW92ZVknKTtcbiAgICAgICAgdGhpcy5vbmNlKCdlbmQnLCByZXNvbHZlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIHNldFN5bmNNb3ZlbWVudDogZnVuY3Rpb24oeCA9IDAsIHkgPSAwKSB7XG5cbiAgICB2YXIgc3BlZWQgPSB0aGlzLnNwZWVkO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy50aWNrID0gTWF0aC5tYXgoeCwgeSk7XG4gICAgICB0aGlzLm1vdmVYID0geCA9PT0gMCA/IDAgOiB4IDwgMCA/IC1zcGVlZCA6IHNwZWVkO1xuICAgICAgdGhpcy5tb3ZlWSA9IHkgPT09IDAgPyAwIDogeSA8IDAgPyAtc3BlZWQgOiBzcGVlZDtcbiAgICAgIHRoaXMuX2xvb3AoKTtcbiAgICAgIHRoaXMub25jZSgnZW5kJywgcmVzb2x2ZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX2xvb3A6IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5kcmF3LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIF9tb3ZlbWVudExpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy50aWNrIDw9IDAgJiYgdGhpcy5fc2V0TW92ZW1lbnRGcm9tSW5wdXQoKSkge1xuICAgICAgdGhpcy5fbG9vcCgpO1xuICAgICAgdGhpcy5lbWl0KCdzdGFydCcpO1xuICAgIH1cbiAgfSxcblxuICBfc2V0TW92ZW1lbnRGcm9tSW5wdXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIG1vdmVtZW50ID0gdGhpcy5faW5wdXQuZ2V0TW92ZW1lbnQoKTtcbiAgICB0aGlzLm1vdmVYID0gbW92ZW1lbnQueDtcbiAgICB0aGlzLm1vdmVZID0gbW92ZW1lbnQueTtcblxuICAgIC8vIElmIHRoZXJlIGlzIG1vdmVtZW50LCBzZXQgdGljayBhbmQgcmV0dXJuIHRydWUuXG4gICAgaWYgKHRoaXMubW92ZVggIT09IDAgfHwgdGhpcy5tb3ZlWSAhPT0gMCkge1xuICAgICAgdGhpcy50aWNrID0gdGhpcy50aWNrTWF4O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gTW92ZW1lbnQgd2FzIG5vdCBzZXQuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbn07XG5cbi8vIE1peGluIHRoZSBFdmVudEVtaXR0ZXIgbWV0aG9kcyBmb3IgZ3JlYXQganVzdGljZS5cbi8vIERpdGNoIHdoZW4gd2UgbWlncmF0ZSB0byBCcm93c2VyaWZ5LlxuXy5hc3NpZ24oUmVuZGVyZXIucHJvdG90eXBlLCBFdmVudEVtaXR0ZXIucHJvdG90eXBlKTtcblxuZXhwb3J0IGRlZmF1bHQgUmVuZGVyZXI7XG4iLCJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IEhhbW1lciBmcm9tICdoYW1tZXJqcyc7XG5cbmZ1bmN0aW9uIFRvdWNoKHNwZWVkKSB7XG4gIHRoaXMuc3BlZWQgPSBzcGVlZDtcbiAgdGhpcy5xdWV1ZSA9IFtdO1xuICB0aGlzLmlmYWNlID0gbmV3IEhhbW1lcihkb2N1bWVudC5ib2R5KTtcblxuICAvLyBDb25maWd1cmUgdGhlIHN3aXBlIGdlc3R1cmUuXG4gIHRoaXMuaWZhY2VcbiAgICAuZ2V0KCdzd2lwZScpXG4gICAgLnNldCh7XG4gICAgICBkaXJlY3Rpb246IEhhbW1lci5ESVJFQ1RJT05fQUxMLFxuICAgICAgdGhyZXNob2xkOiAwLjEsXG4gICAgICB2ZWxvY2l0eTogMC4xXG4gICAgfSk7XG59XG5cblRvdWNoLnByb3RvdHlwZSA9IHtcblxuICBsaXN0ZW46IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fYm91bmRIYW5kbGVTd2lwZSA9IF8uYmluZChfLnBhcnRpYWxSaWdodCh0aGlzLl9oYW5kbGVTd2lwZSwgY2FsbGJhY2spLCB0aGlzKTtcbiAgICB0aGlzLmlmYWNlLm9uKCdzd2lwZScsIHRoaXMuX2JvdW5kSGFuZGxlU3dpcGUpO1xuICB9LFxuXG4gIHN0b3BMaXN0ZW5pbmc6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaWZhY2Uub2ZmKCdzd2lwZScsIHRoaXMuX2JvdW5kSGFuZGxlU3dpcGUpO1xuICB9LFxuXG4gIGdldE1vdmVtZW50OiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBtb3ZlbWVudCA9IHRoaXMucXVldWUuc2hpZnQoKSxcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwO1xuXG4gICAgc3dpdGNoIChtb3ZlbWVudCkge1xuICAgICAgY2FzZSBUb3VjaC5VUDpcbiAgICAgICAgeCA9IC10aGlzLnNwZWVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG91Y2guRE9XTjpcbiAgICAgICAgeCA9IHRoaXMuc3BlZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb3VjaC5MRUZUOlxuICAgICAgICB5ID0gdGhpcy5zcGVlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRvdWNoLlJJR0hUOlxuICAgICAgICB5ID0gLXRoaXMuc3BlZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiB7eCwgeX07XG4gIH0sXG5cbiAgX2hhbmRsZVN3aXBlOiBmdW5jdGlvbihldnQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5xdWV1ZS5wdXNoKGV2dC5vZmZzZXREaXJlY3Rpb24pO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxufTtcblxuVG91Y2guVVAgPSBIYW1tZXIuRElSRUNUSU9OX1VQO1xuVG91Y2guRE9XTiA9IEhhbW1lci5ESVJFQ1RJT05fRE9XTjtcblRvdWNoLkxFRlQgPSBIYW1tZXIuRElSRUNUSU9OX0xFRlQ7XG5Ub3VjaC5SSUdIVCA9IEhhbW1lci5ESVJFQ1RJT05fUklHSFQ7XG5cbmV4cG9ydCBkZWZhdWx0IFRvdWNoO1xuIiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBMaW5lIGZyb20gJy4uL2N1YmUvbGluZSc7XG5cbmZ1bmN0aW9uIEN1YmVDYWNoZShjdWJlKSB7XG5cbiAgLy8gQSByZWZlcmVuY2UgdG8gdGhlIGN1YmUuXG4gIHRoaXMuX2N1YmUgPSBjdWJlO1xuXG4gIC8vIENyZWF0ZSBjYWNoZSBvYmplY3RzIHRvIGhvbGQgY2xhaW1lZCB0aWxlcy5cbiAgdGhpcy5pbml0aWFsaXplKCk7XG59XG5cbkN1YmVDYWNoZS5wcm90b3R5cGUgPSB7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiBpbnN0YW50aWF0aW9uIGFuZCByZXNldCwgdGhpcyBpbml0aWFsaXplIGEgZnJlc2ggY2FjaGVcbiAgICogaW4gdHdvIGNvbGxlY2l0b25zOiBBbiBvYmplY3Qga2V5ZWQgYnkgY3ViZSBzaWRlIGlkIHRvIGNvbnRhaW4gbGluZXNcbiAgICogYW5kIGFuIGFycmF5IHRvIGNvbnRhaW4gc2luZ2xlIHRpbGVzLlxuICAgKi9cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBBIGNvbGxlY3Rpb24gb2YgbGluZXMgY3JlYXRlZCBieSBzaWRlLlxuICAgIHRoaXMuX2xpbmVNYXAgPSBfLnJlZHVjZSh0aGlzLl9jdWJlLmdldFNpZGVzKCksIChzaWRlcywgc2lkZSwgaWQpID0+IHtcbiAgICAgIHNpZGVzW2lkXSA9IFtdO1xuICAgICAgcmV0dXJuIHNpZGVzO1xuICAgIH0sIHt9KTtcblxuICAgIC8vIEEgY29sbGVjdGlvbiBvZiBjbGFpbWVkIHRpbGVzIHRoYXQgYXJlIG5vdCBwYXJ0IG9mIGxpbmVzLlxuICAgIHRoaXMuX3NpbmdsZXMgPSBbXTtcbiAgfSxcblxuICBhZGQ6IGZ1bmN0aW9uKHRpbGUpIHtcblxuICAgIHZhciBjbGFpbWVkQnkgPSB0aWxlLmNsYWltZWRCeSxcbiAgICAgICAgeFBhcnRpYWwgPSB0aGlzLl9nZXRQYXJ0aWFsTGluZVRpbGVzKHRpbGUueExpbmUsIGNsYWltZWRCeSksXG4gICAgICAgIHlQYXJ0aWFsID0gdGhpcy5fZ2V0UGFydGlhbExpbmVUaWxlcyh0aWxlLnlMaW5lLCBjbGFpbWVkQnkpLFxuICAgICAgICB4R3JvdyA9IHRoaXMuX2dyb3dMaW5lKHhQYXJ0aWFsKSxcbiAgICAgICAgeUdyb3cgPSB0aGlzLl9ncm93TGluZSh5UGFydGlhbCk7XG5cbiAgICAvLyBJZiBhIGxpbmUgd2FzIGdyb3duIG9yIGNyZWF0ZWQgZnJvbSB0aGlzIHRpbGUsIGVuc3VyZSBpdCdzIHJlbW92ZWQgZnJvbVxuICAgIC8vIHRoZSBzaW5nbGVzIGNvbGxlY3Rpb24uXG4gICAgaWYgKHhHcm93IHx8IHlHcm93KSB7XG4gICAgICB0aGlzLl9zaW5nbGVzID0gXy5kaWZmZXJlbmNlKHRoaXMuX3NpbmdsZXMsIHRpbGUuZ2V0QWxsTGluZVRpbGVzKCkpO1xuICAgIH1cblxuICAgIC8vIEVsc2UsIGFkZCB0aGUgdGlsZSB0byB0aGUgc2luZ2xlcyBjb2xsZWN0aW9uLlxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fc2luZ2xlcy5wdXNoKHRpbGUpO1xuICAgIH1cbiAgfSxcblxuICByZW1vdmU6IGZ1bmN0aW9uKHRpbGUpIHtcblxuICAgIHZhciBjbGFpbWVkQnkgPSB0aWxlLmNsYWltZWRCeSxcbiAgICAgICAgeFBhcnRpYWwgPSB0aGlzLl9nZXRQYXJ0aWFsTGluZVRpbGVzKHRpbGUueExpbmUsIGNsYWltZWRCeSksXG4gICAgICAgIHlQYXJ0aWFsID0gdGhpcy5fZ2V0UGFydGlhbExpbmVUaWxlcyh0aWxlLnlMaW5lLCBjbGFpbWVkQnkpLFxuICAgICAgICB4U2hyaW5rLFxuICAgICAgICB5U2hyaW5rO1xuXG4gICAgXy5wdWxsKHhQYXJ0aWFsLCB0aWxlKTtcbiAgICBfLnB1bGwoeVBhcnRpYWwsIHRpbGUpO1xuXG4gICAgeFNocmluayA9IHRoaXMuX3Nocmlua0xpbmUoeFBhcnRpYWwsIHRydWUpO1xuICAgIHlTaHJpbmsgPSB0aGlzLl9zaHJpbmtMaW5lKHlQYXJ0aWFsLCBmYWxzZSk7XG5cbiAgICAvLyBJZiB0aGVyZSdzIHNvbWUgc2hyaW5rYWdlLCB1cGRhdGUgdGhlIHNpbmdsZXMgY29sbGVjdGlvbiBhY2NvcmRpbmdseS5cbiAgICBpZiAoeFNocmluayB8fCB5U2hyaW5rKSB7XG5cbiAgICAgIC8vIFdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHRpbGVzIGdhdGhlcmVkIGluIHRoZSBwYXJ0aWFsIGFyZVxuICAgICAgLy8gbm90IHBhcnQgb2YgYW5vdGhlciBsaW5lLiBJZiB0aGV5IGFyZSwgZG9uJ3QgYWRkIHRoZW0gYXMgc2luZ2xlcy5cbiAgICAgIGlmICh4U2hyaW5rICYmICF0aGlzLl9jb21wb3Nlc0xpbmVzKHhQYXJ0aWFsKSkge1xuICAgICAgICB0aGlzLl9zaW5nbGVzID0gXy51bmlvbih0aGlzLl9zaW5nbGVzLCB4UGFydGlhbCk7XG4gICAgICB9XG4gICAgICBpZiAoeVNocmluayAmJiAhdGhpcy5fY29tcG9zZXNMaW5lcyh5UGFydGlhbCkpIHtcbiAgICAgICAgdGhpcy5fc2luZ2xlcyA9IF8udW5pb24odGhpcy5fc2luZ2xlcywgeVBhcnRpYWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgc2FmZWx5IHJlbW92ZSB0aGUgdGlsZSBmcm9tIHRoZSBzaW5nbGVzIGNvbGxlY3Rpb25cbiAgICAvLyBpZiBpdCBleGlzdHMgaW4gdGhlcmUuXG4gICAgZWxzZSB7XG4gICAgICBfLnB1bGwodGhpcy5fc2luZ2xlcywgdGlsZSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYWxsIHRoZSBsaW5lcywgc29ydGVkIGJ5IHRoZSBudW1iZXIgb2YgdGlsZXMgY29udGFpbmVkXG4gICAqIGluIGVhY2ggbGluZS5cbiAgICogQHJldHVybiB7QXJyYXl9IEEgY29sbGVjdGlvbiBvZiBsaW5lcy5cbiAgICovXG4gIGdldExpbmVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0TGluZXNBc0NoYWluKClcbiAgICAgIC5zb3J0QnkobGluZSA9PiBsaW5lLl90aWxlcy5sZW5ndGgpXG4gICAgICAudmFsdWUoKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0cmlldmVzIGFsbCBjYWNoZWQgdGlsZXMuXG4gICAqIEByZXR1cm4ge0FycmF5fSBBIGNvbGxlY2l0b24gb2YgYWxsIHRoZSBjYWNoZWQgdGlsZXMuXG4gICAqL1xuICBnZXRBbGxUaWxlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldExpbmVzQXNDaGFpbigpXG4gICAgICAubWFwKGxpbmUgPT4gbGluZS5nZXRUaWxlcygpKVxuICAgICAgLmZsYXR0ZW4oKVxuICAgICAgLnVuaXEoKVxuICAgICAgLmNvbmNhdCh0aGlzLl9zaW5nbGVzKVxuICAgICAgLnZhbHVlKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZldGNoZXMgYSBjaGFpbi13cmFwcGVkIGNvbGxlY3Rpb24gb2YgY2FjaGVkIGxpbmVzLCBmbGF0dGVuZWQgYW5kXG4gICAqIGNvbXBhY3RlZCBpbnRvIG9uZSBhcnJheS5cbiAgICogQHJldHVybiB7bG9kYXNofSBBIGxvZGFzaCBjaGFpbi13cmFwcGVkIGNvbGxlY3Rpb24uXG4gICAqL1xuICBfZ2V0TGluZXNBc0NoYWluOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy5jaGFpbih0aGlzLl9saW5lTWFwKVxuICAgICAgLnZhbHVlcygpXG4gICAgICAuZmxhdHRlbigpXG4gICAgICAuY29tcGFjdCgpXG4gIH0sXG5cbiAgX2dldFBhcnRpYWxMaW5lVGlsZXM6IGZ1bmN0aW9uKGxpbmUsIGNsYWltZWRCeSkge1xuICAgIHJldHVybiBfLmZpbHRlcihsaW5lLmdldFRpbGVzKCksIHRpbGUgPT4gdGlsZS5jbGFpbWVkQnkgPT09IGNsYWltZWRCeSk7XG4gIH0sXG5cbiAgX2dyb3dMaW5lOiBmdW5jdGlvbih0aWxlcykge1xuXG4gICAgdmFyIHNpZGUsIGxpbmU7XG5cbiAgICBpZiAodGlsZXMubGVuZ3RoID4gMSkge1xuXG4gICAgICBzaWRlID0gdGhpcy5fbGluZU1hcFtfLmZpcnN0KHRpbGVzKS5zaWRlLmlkXTtcbiAgICAgIGxpbmUgPSBfLmZpbmQoc2lkZSwgZnVuY3Rpb24obG4pIHtcbiAgICAgICAgcmV0dXJuIGxuLnNvbWUodGlsZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIElmIGEgbGluZSBleGlzdHMgYWxyZWFkeSwgdXBkYXRlIGl0IHdpdGggdGhlIG5ldyB0aWxlcy5cbiAgICAgIGlmIChsaW5lKSB7XG4gICAgICAgIGxpbmUudXBkYXRlKHRpbGVzKTtcbiAgICAgIH1cblxuICAgICAgLy8gT3RoZXJ3aXNlLCBjcmVhdGUgYSBuZXcgbGluZSB3aXRoIHRoZSBnaXZlbiB0aWxlcy5cbiAgICAgIGVsc2Uge1xuICAgICAgICBzaWRlLnB1c2gobmV3IExpbmUodGlsZXMpKTtcbiAgICAgIH1cblxuICAgICAgLy8gQSBsaW5lIHdhcyBjcmVhdGVkIG9yIHVwZGF0ZWQuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBBIGxpbmUgd2FzIG5vdCBjcmVhdGVkLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogU2hyaW5rcyBhIGxpbmUuXG4gICAqIEBwYXJhbSAge0FycmF5fSB0aWxlcyBUaGUgdGlsZXMgdXNlZCBpbiB0aGUgc2hyaW5rYWdlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IFdhcyBhIGxpbmUgZGlzYXNzZWJsZWQ/XG4gICAqL1xuICBfc2hyaW5rTGluZTogZnVuY3Rpb24odGlsZXMsIGlzSG9yaXpvbnRhbCkge1xuXG4gICAgdmFyIHNpZGUsIGxpbmU7XG5cbiAgICBpZiAodGlsZXMubGVuZ3RoKSB7XG5cbiAgICAgIHNpZGUgPSB0aGlzLl9saW5lTWFwW18uZmlyc3QodGlsZXMpLnNpZGUuaWRdO1xuICAgICAgbGluZSA9IF8uZmluZChzaWRlLCBmdW5jdGlvbihsbikge1xuICAgICAgICByZXR1cm4gbG4uaXNIb3Jpem9udGFsKCkgPT09IGlzSG9yaXpvbnRhbCAmJiBsbi5hbGwodGlsZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIExpbmUgc2hvdWxkIGV4aXN0IGJ1dCBqdXN0IGluIGNhc2UuLi5cbiAgICAgIGlmIChsaW5lKSB7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUncyBvbmx5IG9uZSB0aWxlLCBpdCdzIG5vdCBhIGxpbmUuIFB1bGwgaXQuXG4gICAgICAgIGlmICh0aWxlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBfLnB1bGwoc2lkZSwgbGluZSk7XG5cbiAgICAgICAgICAvLyBBIGxpbmUgd2FzIGRpc2Fzc2VtYmxlZC4gUmV0dXJuIHRydWUuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIHVwZGF0ZSB0aGUgbGluZSB3aXRoIHRoZSByZW1haW5pbmcgdGlsZXMuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxpbmUudXBkYXRlKHRpbGVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEEgbGluZSB3YXMgbm90IGRpc2Fzc2VtYmxlZC5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgX2NvbXBvc2VzTGluZXM6IGZ1bmN0aW9uKHRpbGVzKSB7XG4gICAgdmFyIHNpZGUgPSB0aGlzLl9saW5lTWFwW18uZmlyc3QodGlsZXMpLnNpZGUuaWRdO1xuICAgIHJldHVybiBfLmZpbmQoc2lkZSwgZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUuYWxsKHRpbGVzKTtcbiAgICB9KTtcbiAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBDdWJlQ2FjaGU7IiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBUaWxlU2VsZWN0b3JSZXN1bHQgZnJvbSAnLi9UaWxlU2VsZWN0b3JSZXN1bHQnO1xuXG4vKipcbiAqIEluc3RhbmNlcyBvZiB0aGlzIGNsYXNzIGFyZSB1c2VkIGZvciBtYWtpbmcgdmFsaWQgdGlsZSBzZWxlY3Rpb25zXG4gKiBhbmQgcmV0dXJuaW5nIHJlc3VsdHMgY29udGFpbmluZyBkYXRhIGRlc2NyaWJpbmcgdGhlIHNlbGVjdGlvbnMuXG4gKiBUaGUgdmFsaWRhdGUgbWV0aG9kIGlzIHRoZSBjb3JlIG9mIFRpbGVTZWxlY3RvciBhbmQgaXMgbW9zdGx5IHVzZWRcbiAqIGluc2lkZSB0aGUgUGxheWVyLnNlbGVjdFRpbGUgd3JhcHBlci5cbiAqL1xuY2xhc3MgVGlsZVNlbGVjdG9yIHtcblxuICAvKipcbiAgICogQ29uc3RydWN0b3IgbWV0aG9kLiBUaGlzIHNldHMgYW4gaW50ZXJuYWwgX3BsYXllciBwcm9wZXJ0eSB3aGljaCBpc1xuICAgKiBvbmx5IGN1cnJlbnRseSB1c2VkIG9uY2UgKGluIHRoZSBhdHRhY2sgcG9ydGlvbiBvZiB2YWxpZGF0ZSkuIEl0IGFsc29cbiAgICogc2V0cyB0aGUgX3NlbGVjdGVkIHByb3BlcnR5IGFzIGFuIGVtcHR5IGFycmF5IHZpYSByZXNldCgpLlxuICAgKiBAcGFyYW0gIHtQbGF5ZXJ9IHBsYXllciBUaGUgcGxheWVyIGJvdW5kIHRvIHRoaXMgVGlsZVNlbGVjdG9yIGluc3RhbmNlLlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBsYXllcikge1xuICAgIHRoaXMuX3BsYXllciA9IHBsYXllcjtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBfc2VsZWN0ZWQgYXJyYXkgdG8gaXQncyBpbml0aWFsIGVtcHR5IHN0YXRlLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBsYXN0IG4gc2VsZWN0aW9ucyBhbmQgcmV0dXJucyB0aGUgdXBkYXRlZCBfc2VsZWN0ZWQgYXJyYXkuXG4gICAqIEBwYXJhbSAge051bWJlcn0gbiBUaGUgbnVtYmVyIG9mIHNlbGVjdGlvbnMgdG8gcmV2ZXJ0LlxuICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIHVwZGF0ZWQgX3NlbGVjdGVkIGFycmF5LlxuICAgKi9cbiAgcmV2ZXJ0KG4gPSAxKSB7XG4gICAgdmFyIHNsaWNlID0gXy5kcm9wUmlnaHQodGhpcy5fc2VsZWN0ZWQsIG4pO1xuICAgIHRoaXMuX3NlbGVjdGVkID0gc2xpY2U7XG4gICAgcmV0dXJuIHNsaWNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY29udGVudHMgb2YgdGhlIF9zZWxlY3RlZCBhcnJheS5cbiAgICogQHJldHVybiB7QXJyYXl9IFRoZSBfc2VsZWN0ZWQgYXJyYXkuXG4gICAqL1xuICBnZXRTZWxlY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBfc2VsZWN0ZWQgYXJyYXkuXG4gICAqIEByZXR1cm4ge1RpbGV9IFRoZSBpbml0aWFsIHNlbGVjdGVkIHRpbGUuXG4gICAqL1xuICBnZXRJbml0aWFsKCkge1xuICAgIHJldHVybiBfLmZpcnN0KHRoaXMuX3NlbGVjdGVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB3aGV0aGVyIG9yIG5vdCB0aGUgcGFzc2VkIHRpbGUgb3IgdGlsZXMgYXJlIHZhbGlkIHNlbGVjdGlvbnMuXG4gICAqIERpZmZlcmVudCB0ZXN0IGNhc2VzIGluY2x1ZGU6XG4gICAqIC0gV2FzIGEgdGlsZSBwYXNzZWQ/XG4gICAqIC0gSXMgdGhlIHRpbGUgYWxyZWFkeSBjbGFpbWVkP1xuICAgKiAtIElzIHRoZXJlIGFuIGluaXRpYWwgdGlsZT8gU2hvdWxkIGl0IGJlIGRlc2VsZWN0ZWQ/IElzIGl0IGEgbmVpZ2hib3I/XG4gICAqIC0gV2FzIGFuIGF0dGFjayB0aWxlIHBhc3NlZD8gSXMgaXQgYSB2YWxpZCB0YXJnZXQ/XG4gICAqIEBwYXJhbSB7VGlsZX0gdGlsZSBBIHRpbGUgdG8gdmFsaWRhdGUuXG4gICAqIEBwYXJhbSB7VGlsZX0gYXR0YWNrVGlsZSBBbm90aGVyIHRpbGUgdG8gdmFsaWRhdGUuXG4gICAqIEByZXR1cm4ge1RpbGVTZWxlY3RvclJlc3VsdH0gQSByZXN1bHQgb2JqZWN0IGNvbnRhaW5pbmcgZGF0YSBkZXNjcmliaW5nIHRoZSBhY3Rpb24uXG4gICAqL1xuICB2YWxpZGF0ZSh0aWxlLCBhdHRhY2tUaWxlKSB7XG5cbiAgICAvLyBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIGZpcnN0IHRpbGUgc2VsZWN0ZWQuXG4gICAgdmFyIGluaXRpYWwgPSB0aGlzLmdldEluaXRpYWwoKSxcblxuICAgICAgICAvLyBBIHBhY2thZ2Ugb2YgZGF0YSBzZW50IGluIHJlc29sdmVkIHByb21pc2VzLlxuICAgICAgICByZXNvbHZlRGF0YSA9IHt9O1xuXG4gICAgLy8gSWYgYSB0aWxlIHdhc24ndCBwYXNzZWQsIGV4aXQgaW1tZWRpYXRlbHkuXG4gICAgaWYgKCF0aWxlKSB7XG4gICAgICByZXR1cm4gVGlsZVNlbGVjdG9yUmVzdWx0LmZhaWx1cmUoKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgdGlsZSBpcyBhbHJlYWR5IGNsYWltZWQsIGdldCBvdXR0YSBkb2RnZS5cbiAgICBpZiAodGlsZS5jbGFpbWVkQnkpIHtcbiAgICAgIHJldHVybiBUaWxlU2VsZWN0b3JSZXN1bHQuZmFpbHVyZShUaWxlU2VsZWN0b3JSZXN1bHQuRkFJTFVSRV9DTEFJTUVEKTtcbiAgICB9XG5cbiAgICAvLyBJZiBhbiBpbml0aWFsIHRpbGUgZXhpc3RzLCBydW4gc29tZSB0ZXN0cy5cbiAgICBpZiAoaW5pdGlhbCkge1xuXG4gICAgICAvLyBJZiB0aGUgaW5pdGlhbCB0aWxlIGlzIHNlbGVjdGVkLCBkZXNlbGVjdGVkIGl0IGFuZCBiYWlsIG91dC5cbiAgICAgIGlmICh0aWxlID09PSBpbml0aWFsKSB7XG4gICAgICAgIHJldHVybiBUaWxlU2VsZWN0b3JSZXN1bHQuc3VjY2VzcyhcbiAgICAgICAgICB0aGlzLl9kZXNlbGVjdCh0aWxlKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgbmV3IHNlbGVjdGVkIHRpbGUgaXMgb24gdGhlIHNhbWUgc2lkZSBhcyB0aGVcbiAgICAgIC8vIGluaXRpYWwgdGlsZSwgZGVzZWxlY3QgdGhlIGluaXRpYWwgdGlsZS5cbiAgICAgIGlmICh0aWxlLnNpZGUgPT09IGluaXRpYWwuc2lkZSkge1xuICAgICAgICByZXNvbHZlRGF0YSA9IHRoaXMuX2Rlc2VsZWN0KGluaXRpYWwpO1xuICAgICAgfVxuXG4gICAgICAvLyBFbHNlLCBpZiB0aGUgc2lkZSBzZWxlY3RlZCBpcyBub3QgYSBuZWlnaGJvciwgYmFpbCBvdXQuXG4gICAgICBlbHNlIGlmICghaW5pdGlhbC5pc05laWdoYm9yaW5nU2lkZSh0aWxlKSkge1xuICAgICAgICByZXR1cm4gVGlsZVNlbGVjdG9yUmVzdWx0LmZhaWx1cmUoVGlsZVNlbGVjdG9yUmVzdWx0LkZBSUxVUkVfTk9UX05FSUdIQk9SKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgYXR0YWNrIHRpbGUgZXhpc3RzLCBydW4gZXZlbiBtb3JlIHRlc3RzLlxuICAgIGlmIChhdHRhY2tUaWxlKSB7XG5cbiAgICAgIC8vIElmIHRoZSBhdHRhY2sgdGlsZSBpcyB2YWxpZCwgdGhhdCBtZWFucyBib3RoIHRpbGVzIGNhbiBiZSBzZWxlY3RlZFxuICAgICAgLy8gYW5kIGV2ZXJ5dGhpbmcgY2FuIGJlIGNsYWltZWQuIEV4aXQgdHJ1ZSBhcyB3ZSdyZSBkb25lIHNlbGVjdGluZyB0aWxlcy5cbiAgICAgIGlmICh0aGlzLl9wbGF5ZXIuY2FuQXR0YWNrKGF0dGFja1RpbGUpKSB7XG4gICAgICAgIHJldHVybiBUaWxlU2VsZWN0b3JSZXN1bHQuc3VjY2VzcyhcbiAgICAgICAgICBfLm1lcmdlKHJlc29sdmVEYXRhLCB0aGlzLl9zZWxlY3QodGlsZSwgYXR0YWNrVGlsZSkpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFRpbGVTZWxlY3RvclJlc3VsdC5mYWlsdXJlKFRpbGVTZWxlY3RvclJlc3VsdC5GQUlMVVJFX0NBTk5PVF9BVFRBQ0spO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgdGhlIGluaXRpYWwgdGlsZSBtdXN0IGhhdmUgYmVlbiBzZWxlY3RlZC4gUGFzcyB0aGUgcmVzb2x2ZSBkYXRhXG4gICAgLy8gYWxvbmcgaW4gY2FzZSBhIHRpbGUgd2FzIGRlc2VsZWN0ZWQgZmlyc3QgKGFzIGluIHRoZSBzaWRlID09PSBzaWRlIGNhc2UpLlxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIFRpbGVTZWxlY3RvclJlc3VsdC5zdWNjZXNzKFxuICAgICAgICBfLm1lcmdlKHJlc29sdmVEYXRhLCB0aGlzLl9zZWxlY3QodGlsZSkpXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFdlJ2xsIHByb2JhYmx5IG5ldmVyIG1ha2UgaXQgdGhpcyBmYXIgYnV0IGxldCdzIHJldHVybiBhIHByb21pc2UganVzdCBpbiBjYXNlLlxuICAgIHJldHVybiBUaWxlU2VsZWN0b3JSZXN1bHQuZmFpbHVyZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGlsZXMgdG8gdGhlIF9zZWxlY3RlZCBhcnJheSBhbmQgcmV0dXJucyBhIGNvbW1hbmQgb2JqZWN0IGNvbnRhaW5pbmdcbiAgICogdGhlIGNvbXBsZXRlIF9zZWxlY3RlZCBhcnJheSBjb250ZW50cy5cbiAgICogQHBhcmFtIHtUaWxlLi4ufSBBbnkgbnVtYmVyIG9mIFRpbGUgb2JqZWN0cyB0aGF0IHdlcmUgc2VsZWN0ZWQuXG4gICAqIEByZXR1cm4ge09iamVjdH0gQSBjb21tYW5kIG9iamVjdCBkZXNjcmliaW5nIHRoZSBhY3Rpb24uXG4gICAqL1xuICBfc2VsZWN0KCkge1xuICAgIHZhciB0aWxlcyA9IF8udG9BcnJheShhcmd1bWVudHMpO1xuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMuX3NlbGVjdGVkLCB0aWxlcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlbGVjdGVkOiB0aGlzLl9zZWxlY3RlZFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIHRpbGUgZnJvbSB0aGUgX3NlbGVjdGVkIGFycmF5IGFuZCByZXR1cm5zIGEgY29tbWFuZCBvYmplY3RcbiAgICogZGVzY3JpYmluZyB0aGUgYWN0aW9uLiBUaGlzIG9iamVjdCB3aWxsIGV2ZW50dWFsbHkgYmUgcGFzc2VkIHRvIGFcbiAgICogUHJvbWlzZSByZXR1cm5lZCBmcm9tIHZhbGlkYXRlKCkuXG4gICAqIEBwYXJhbSAge1RpbGV9IHRpbGUgVGhlIHRpbGUgdG8gcmVtb3ZlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEEgY29tbWFuZCBvYmplY3QgZGVzY3JpYmluZyB0aGUgYWN0aW9uLlxuICAgKi9cbiAgX2Rlc2VsZWN0KHRpbGUpIHtcbiAgICBfLnB1bGwodGhpcy5fc2VsZWN0ZWQsIHRpbGUpO1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlbGVjdDogW3RpbGVdXG4gICAgfTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRpbGVTZWxlY3RvcjtcbiIsIi8qKlxuICogVXNlZCBpbiBUaWxlU2VsZWN0b3IsIHRoZSBUaWxlU2VsZWN0b3JSZXN1bHQgb2JqZWN0IHByb3ZpZGVzIGFuXG4gKiBlYXN5IHRvIHVzZSBBUEkgZm9yIGludGVyYWN0aW5nIHdpdGggdmFsaWRhdGUgY2FsbHMuXG4gKiBJbiBnZW5lcmFsLCB0aGVzZSBvYmplY3RzIHNob3VsZCBiZSBjcmVhdGVkIHdpdGggdGhlIHN0YXRpYyBtZXRob2RzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZXMgd2l0aCBUaWxlU2VsZWN0b3I6XG4gKlxuICogdmFyIHNlbGVjdG9yID0gbmV3IFRpbGVTZWxlY3RvcihwbGF5ZXIpO1xuICpcbiAqIDEuXG4gKiBzZWxlY3Rvci52YWxpZGF0ZSh0aWxlKS5zdWNjZXNzKCkgLT4gUmV0dXJucyBhIGJvb2xlYW5cbiAqXG4gKiAyLlxuICogc2VsZWN0b3JcbiAqICAgLnZhbGlkYXRlKHRpbGUpXG4gKiAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAqICAgICAvLyBEbyBzb21ldGhpbmcgd2l0aCBzdWNjZXNzIGRhdGEuXG4gKiAgIH0pXG4gKiAgIC5mYWlsdXJlKGZ1bmN0aW9uKGNvZGUpIHtcbiAqICAgICAvLyBSZWFjdCB0byBlcnJvciBjb2RlLlxuICogICB9KTtcbiAqL1xuY2xhc3MgVGlsZVNlbGVjdG9yUmVzdWx0IHtcblxuICAvKipcbiAgICogQ29uc3RydWN0b3IgbWV0aG9kLiBTZXRzIHByb3BlcnRpZXMgaW50ZW5kZWQgdG8gYmUgcHJpdmF0ZS5cbiAgICogQHBhcmFtICB7Qm9vbGVhbn0gc3VjY2VzcyBJcyB0aGUgcmVzdWx0IHN1Y2Nlc3NmdWw/XG4gICAqIEBwYXJhbSAge1N0cmluZ3xPYmplY3R9IGRhdGEgQSBwYXlsb2FkIGRlc2NyaWJpbmcgdGhlIHJlc3VsdC5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmdzIGZvciBmYWlsdXJlIGNvZGVzIGFuZCBvYmplY3RzIGZvciByZXN1bHQgbWV0YWRhdGEuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3Ioc3VjY2VzcywgZGF0YSkge1xuICAgIHRoaXMuX3N1Y2Nlc3MgPSBzdWNjZXNzO1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIE9uZSBvZiB0aGUgY2hhaW5hYmxlIGNhbGxiYWNrcywgc3VjY2VzcyB3aWxsIGVpdGhlciByZXR1cm4gYSBib29sZWFuXG4gICAqIGRlc2NyaWJpbmcgdGhlIHN1Y2Nlc3Mgc3RhdGUgb3IgaXRzZWxmIGlmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQuXG4gICAqIFRoZSBjYWxsYmFjayB3aWxsIGJlIGludm9rZWQgaWYgdGhlIHN1Y2Nlc3Mgc3RhdGUgaXMgdHJ1ZS5cbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIEEgbWV0aG9kIHRvIGludm9rZSBpZiB0aGUgc3VjY2VzcyBzdGF0ZSBpcyB0cnVlLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFzc2luZyB0aGUgX2RhdGEgdmFsdWUuXG4gICAqIEByZXR1cm4ge1RpbGVTZWxlY3RvclJlc3VsdH0gUmV0dXJucyBpdHNlbGYgZm9yIGNoYWluaW5nLlxuICAgKi9cbiAgc3VjY2VzcyhjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdWNjZXNzO1xuICAgIH1cbiAgICBpZiAodGhpcy5fc3VjY2Vzcykge1xuICAgICAgY2FsbGJhY2sodGhpcy5fZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBvdGhlciBjaGFpbmFibGUgY2FsbGJhY2ssIGZhaWx1cmUgd2lsbCBlaXRoZXIgcmV0dXJuIGEgYm9vbGVhblxuICAgKiBkZXNjcmliaW5nIHRoZSBzdWNjZXNzIHN0YXRlIG9yIGl0c2VsZiBpZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkLlxuICAgKiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBpbnZva2VkIGlmIHRoZSBzdWNjZXNzIHN0YXRlIGlzIGZhbHNlLlxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgQSBtZXRob2QgdG8gaW52b2tlIGlmIHRoZSBzdWNjZXNzIHN0YXRlIGlzIGZhbHNlLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFzc2luZyB0aGUgX2RhdGEgdmFsdWUuXG4gICAqIEByZXR1cm4ge1RpbGVTZWxlY3RvclJlc3VsdH0gUmV0dXJucyBpdHNlbGYgZm9yIGNoYWluaW5nLlxuICAgKi9cbiAgZmFpbHVyZShjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiAhdGhpcy5fc3VjY2VzcztcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9zdWNjZXNzKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLl9kYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHJlY29tbWVuZGVkIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBuZXcgc3VjY2Vzc2Z1bCBUaWxlU2VsZWN0b3JSZXN1bHQuXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBBIG1hcCBkZXNjcmliaW5nIHRoZSBzdWNjZXNzIHN0YXRlLlxuICAgKiBAcmV0dXJuIHtUaWxlU2VsZWN0b3JSZXN1bHR9IEEgbmV3IHN1Y2Nlc3NmdWwgVGlsZVNlbGVjdG9yUmVzdWx0LlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBzdGF0aWMgc3VjY2VzcyhkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBUaWxlU2VsZWN0b3JSZXN1bHQodHJ1ZSwgZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHJlY29tbWVuZGVkIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBuZXcgZmFpbGVkIFRpbGVTZWxlY3RvclJlc3VsdC5cbiAgICogQHBhcmFtICB7U3RyaW5nfSBjb2RlIFRoZSBmYWlsdXJlIGNvZGUuXG4gICAqIEByZXR1cm4ge1RpbGVTZWxlY3RvclJlc3VsdH0gQSBuZXcgZmFpbGVkIFRpbGVTZWxlY3RvclJlc3VsdC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgc3RhdGljIGZhaWx1cmUoY29kZSkge1xuICAgIHJldHVybiBuZXcgVGlsZVNlbGVjdG9yUmVzdWx0KGZhbHNlLCBjb2RlKTtcbiAgfVxuXG59XG5cbi8vIEZhaWx1cmUgY29kZXMuXG5UaWxlU2VsZWN0b3JSZXN1bHQuRkFJTFVSRV9DTEFJTUVEID0gJ2NsYWltZWQnO1xuVGlsZVNlbGVjdG9yUmVzdWx0LkZBSUxVUkVfTk9UX05FSUdIQk9SID0gJ25vdE5laWdoYm9yJztcblRpbGVTZWxlY3RvclJlc3VsdC5GQUlMVVJFX0NBTk5PVF9BVFRBQ0sgPSAnY2Fubm90QXR0YWNrJztcblxuZXhwb3J0IGRlZmF1bHQgVGlsZVNlbGVjdG9yUmVzdWx0O1xuIiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuXG4vKipcbiAqIEEgbGlnaHR3ZWlnaHQgZ3VpZGVkIHR1dG9yaWFsIGhlbHBlciB0aGF0IGlzIGF0dGFjaGVkIHRvIGEgc3BlY2lmaWNcbiAqIGV2ZW50LWVtaXR0aW5nIG9iamVjdCwgc3VjaCBhcyB0aGUgY3ViZS4gRGlzcGxheXMgaGVscGZ1bCBtZXNzYWdlc1xuICogdG8gdGVhY2ggdGhlIHBsYXllciBob3cgdG8gcGxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgQW4gZXZlbnQtZW1pdHRpbmcgb2JqZWN0IHRvIHByb3ZpZGUgZ3VpZGFuY2UgZm9yLlxuICogQGNsYXNzXG4gKi9cbmZ1bmN0aW9uIFR1dG9yaWFsKCkge31cblxuVHV0b3JpYWwucHJvdG90eXBlID0ge1xuXG4gIC8qKlxuICAgKiBXcmFwcyBhbiBvYmplY3QncyBtZXRob2Qgd2l0aCBhbm90aGVyIG1ldGhvZCB0aGF0IGludm9rZXMgdGhlXG4gICAqIHR1dG9yaWFsJ3MgZW1pc3Npb24gb2YgYSBtZXNzYWdlIGV2ZW50LiBUaGlzIGVtaXNzaW9uIGhhcHBlbnNcbiAgICogb25seSBvbmNlLCBhbmQgcmVzdG9yZXMgdGhlIHByZXZpb3VzIG1ldGhvZCdzIHN0YXRlIGFmdGVyd2FyZHMuXG4gICAqIEBwYXJhbSAge09iamVjdH0gb2JqIFRoZSBob3N0IG9iamVjdC5cbiAgICogQHBhcmFtICB7U3RyaW5nfSBtZXRob2ROYW1lIFRoZSBtZXRob2QgbmFtZSB0byB3cmFwLlxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGtleSBUaGUgbGVzc29uIGtleS5cbiAgICogQHJldHVybiB7VHV0b3JpYWx9IFRoaXMgdHV0b3JpYWwgaW5zdGFuY2UgZm9yIGNoYWluaW5nLlxuICAgKi9cbiAgaG9vazogZnVuY3Rpb24ob2JqLCBtZXRob2ROYW1lLCBrZXkpIHtcbiAgICB2YXIgb2xkTWV0aG9kID0gb2JqW21ldGhvZE5hbWVdO1xuICAgIG9ialttZXRob2ROYW1lXSA9IF8uYmluZChmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXN1bHQgPSBvbGRNZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgVHV0b3JpYWwubGVzc29uc1trZXldKTtcbiAgICAgIG9ialttZXRob2ROYW1lXSA9IG9sZE1ldGhvZDtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufTtcblxuLy8gTWl4aW4gRXZlbnRFbWl0dGVyIG1ldGhvZHMuXG5fLmFzc2lnbihUdXRvcmlhbC5wcm90b3R5cGUsIEV2ZW50RW1pdHRlci5wcm90b3R5cGUpO1xuXG4vLyBMaXN0IG9mIHN0ZXAgbWVzc2FnZXMuXG5UdXRvcmlhbC5zdGVwTWVzc2FnZXMgPSBbXG4gICdMZXRcXCdzIHBsYXkhIENsaWNrIGFueSB0aWxlIHRvIGJlZ2luLicsXG4gICdSb3RhdGUgdGhlIGN1YmUgdXNpbmcgdGhlIGFycm93IGtleXMgb3IgV0FTRC4nLFxuICAnR3JlYXQhIE5vdywgY2xpY2sgYSB0aWxlIG9uIGFuIGFkamFjZW50IHNpZGUuJyxcbiAgJ05pY2UhIEEgdGhpcmQgdGlsZSB3YXMgc2VsZWN0ZWQgYXV0b21hdGljYWxseSBmb3IgeW91LicsXG4gICdUcnkgdG8gbWFrZSBhIGxpbmUgb24gb25lIHNpZGUuJ1xuXTtcblxuVHV0b3JpYWwubGVzc29ucyA9IHtcbiAgc3RhcnQ6IFtcbiAgICAnTGV0XFwncyBwbGF5ISBDbGljayBhbnkgdGlsZSB0byBiZWdpbi4nLFxuICAgICdSb3RhdGUgdGhlIGN1YmUgdXNpbmcgdGhlIGFycm93IGtleXMgb3IgV0FTRC4nXG4gIF0sXG4gIGNsaWNrOiAnR3JlYXQhIE5vdywgY2xpY2sgYSB0aWxlIG9uIGFuIGFkamFjZW50IHNpZGUuJyxcbiAgdHVybjogW1xuICAgICdOaWNlISBBIHRoaXJkIHRpbGUgd2FzIHNlbGVjdGVkIGF1dG9tYXRpY2FsbHkgZm9yIHlvdS4nLFxuICAgICdUcnkgdG8gbWFrZSBhIGxpbmUgb24gb25lIHNpZGUhJ1xuICBdXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUdXRvcmlhbDtcbiIsImV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5PbmNlKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spIHtcbiAgdmFyIGhhbmRsZXIgPSBldnQgPT4ge1xuICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIpO1xuICAgIGNhbGxiYWNrKGV2dCk7XG4gIH07XG4gIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIpO1xufVxuIiwidmFyIFNUWUxFID0gZG9jdW1lbnQuYm9keS5zdHlsZSxcblxuICAgIFRSQU5TRk9STSA9ICdUcmFuc2Zvcm0nLFxuXG4gICAgLy8gUHJlZml4ZXMgdXNlZCBmb3IgdGhpbmdzIGxpa2UgVHJhbnNmb3JtLlxuICAgIFNUWUxFX1BSRUZJWEVTID0gWydtcycsICdPJywgJ01veicsICdXZWJraXQnXSxcblxuICAgIC8vIEFuaW1hdGlvbiBlbmQgZXZlbnRzLiBOb3QgcXVpdGUgcGVyZmVjdCBhcyBJRTEwK1xuICAgIC8vIGFjdHVhbGx5IHVzZXMgJ2FuaW1hdGlvbicgLT4gJ01TQW5pbWF0aW9uRW5kJ1xuICAgIC8vIEknbGwgZml4IHRoaXMgbGF0ZXIuXG4gICAgLy8gU28gcmlkaWN1bG91cy4gQ2FuJ3QgdGhlc2UgYmUgY29uc2lzdGVudD8hXG4gICAgLy8gLi4uXG4gICAgLy8gTWFwIGZvcm1hdDpcbiAgICAvLyAnY3NzLWF0dHJpYnV0ZSc6ICAgICAgIFtzdGFydCwgaXRlcmF0aW9uLCBlbmRdXG4gICAgQU5JTUFUSU9OX0VWRU5UX01BUCA9IHtcbiAgICAgICdhbmltYXRpb24nOiAgICAgICAgICAgIFsnYW5pbWF0aW9uc3RhcnQnLCAnYW5pbWF0aW9uaXRlcmF0aW9uJywgJ2FuaW1hdGlvbmVuZCddLFxuICAgICAgJy1vLWFuaW1hdGlvbic6ICAgICAgICAgWydvQW5pbWF0aW9uU3RhcnQnLCAnb0FuaW1hdGlvbkl0ZXJhdGlvbicsICdvQW5pbWF0aW9uRW5kJ10sXG4gICAgICAnLW1vei1hbmltYXRpb24nOiAgICAgICBbJ2FuaW1hdGlvbnN0YXJ0JywgJ2FuaW1hdGlvbml0ZXJhdGlvbicsICdhbmltYXRpb25lbmQnXSxcbiAgICAgICctd2Via2l0LWFuaW1hdGlvbic6ICAgIFsnd2Via2l0QW5pbWF0aW9uU3RhcnQnLCAnd2Via2l0QW5pbWF0aW9uSXRlcmF0aW9uJywgJ3dlYmtpdEFuaW1hdGlvbkVuZCddXG4gICAgfSxcblxuICAgIG1zQW5pbWF0aW9uRW5kID0gJ01TQW5pbWF0aW9uRW5kJywvL1RPRE9cbiAgICBcbiAgICBsZW4gPSBTVFlMRV9QUkVGSVhFUy5sZW5ndGgsXG5cbiAgICBzdHlsZVByZWZpeCxcblxuICAgIGFuaW1hdGlvblByb3BlcnR5LFxuXG4gICAgZXZlbnRUeXBlcyxcblxuICAgIC8vIE9iamVjdHMgdG8gaG9sZCBicm93c2VyLXNwZWNpZmljIHNldHRpbmdzLlxuICAgIGpzID0ge30sXG4gICAgY3NzID0ge30sXG4gICAgZXZlbnRzID0ge307XG5cbi8vIEZpcnN0LCBsZXQncyBkZXRlcm1pbmUgdGhlIHN0eWxlIHByZWZpeC5cbndoaWxlIChsZW4tLSkge1xuICBpZiAoKFNUWUxFX1BSRUZJWEVTW2xlbl0gKyBUUkFOU0ZPUk0pIGluIFNUWUxFKSB7XG4gICAgc3R5bGVQcmVmaXggPSBTVFlMRV9QUkVGSVhFU1tsZW5dO1xuICAgIGJyZWFrO1xuICB9XG59XG5cbi8vIElmIHRoZXJlIGlzbid0IGEgcHJvcGVyIHByZWZpeCwgdXNlIHRoZSBzdGFuZGFyZCB0cmFuc2Zvcm0uXG5pZiAoIXN0eWxlUHJlZml4KSB7XG4gIHN0eWxlUHJlZml4ID0gVFJBTlNGT1JNLnRvTG93ZXJDYXNlKCk7XG59XG5cbi8vIE5leHQsIGxldCdzIHNldCBzb21lIHByb3BlcnRpZXMgdXNpbmcgdGhlIHByZWZpeC5cbmpzLnRyYW5zZm9ybSA9IHN0eWxlUHJlZml4ICsgVFJBTlNGT1JNO1xuY3NzLnRyYW5zZm9ybSA9IHN0eWxlUHJlZml4ID8gJy0nICsgc3R5bGVQcmVmaXgudG9Mb3dlckNhc2UoKSArICctdHJhbnNmb3JtJyA6ICd0cmFuc2Zvcm0nO1xuXG4vLyBOb3csIGxldCdzIGRldGVybWluZSB0aGUgZXZlbnQgZW5kIG5hbWUuIFNvIG1lc3NlZCB1cC5cbmZvciAoYW5pbWF0aW9uUHJvcGVydHkgaW4gQU5JTUFUSU9OX0VWRU5UX01BUCkge1xuICBpZiAodHlwZW9mIFNUWUxFW2FuaW1hdGlvblByb3BlcnR5XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBldmVudFR5cGVzID0gQU5JTUFUSU9OX0VWRU5UX01BUFthbmltYXRpb25Qcm9wZXJ0eV07XG4gICAgZXZlbnRzLmFuaW1hdGlvblN0YXJ0ID0gZXZlbnRUeXBlc1swXTtcbiAgICBldmVudHMuYW5pbWF0aW9uSXRlcmF0aW9uID0gZXZlbnRUeXBlc1sxXTtcbiAgICBldmVudHMuYW5pbWF0aW9uRW5kID0gZXZlbnRUeXBlc1syXTtcbiAgICBicmVhaztcbiAgfVxufVxuXG4vLyBOb3JtYWxpemUgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGZvciBjcm9zcy1icm93c2VyIGNvbXBhdGliaWxpdHkuXG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG5leHBvcnQge2pzLCBjc3MsIGV2ZW50c307XG4iXX0=
