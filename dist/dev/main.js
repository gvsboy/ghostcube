(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

require('babel/polyfill');

var _Game = require('./game');

var _Game2 = _interopRequireWildcard(_Game);

// Create a new game on load!
window.addEventListener('load', function () {
  document.body.classList.add('loaded');
  var game = new _Game2['default']('container');
});

},{"./game":7,"babel/polyfill":"babel/polyfill"}],2:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _TileSelector = require('./selection/TileSelector');

var _TileSelector2 = _interopRequireWildcard(_TileSelector);

var _Player2 = require('./player');

var _Player3 = _interopRequireWildcard(_Player2);

var Bot = (function (_Player) {
  function Bot(name, tileClass, cube, opponent) {
    _classCallCheck(this, Bot);

    _get(Object.getPrototypeOf(Bot.prototype), 'constructor', this).call(this, name, tileClass, cube);
    this.opponent = opponent;
  }

  _inherits(Bot, _Player);

  _createClass(Bot, [{
    key: 'isBot',
    value: function isBot() {
      return true;
    }
  }, {
    key: 'play',

    /**
     * Run through a list of tile selection commands in order of urgency.
     * For instance, winning moves are more urgent than blocking single tiles.
     * @return {Array} A collection of tiles selected.
     */
    value: function play() {

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
    }
  }, {
    key: 'getAttackTile',

    /**
     * Gets a tile where the two passed tile's coordinates intersect. This method
     * differs from the Player's method in that the Bot's selection isn't contingent
     * on a side being visible, however efforts are made to attack a visible side
     * if possible.
     * @param  {Tile} tile1 The first tile selected.
     * @param  {Tile} tile2 The second tile selected.
     * @return {Tile} The tile being attacked.
     */
    value: function getAttackTile(tile1, tile2) {

      var selector = new _TileSelector2['default'](this),
          cube = this._cubeCache._cube,
          neighbors,
          attackedTiles;

      if (tile1 && tile2 && tile1.isNeighboringSide(tile2)) {

        // Get the shared neighboring sides and sort by neighbor visibility. It's preferred that
        // the bot makes a move on a known active side.
        neighbors = _import2['default'].sortBy(_import2['default'].intersection(tile1.side.getNeighbors(), tile2.side.getNeighbors()), function (neighbor) {
          return !neighbor.isVisible(cube.x, cube.y);
        }),

        // Get all the attacked tiles to validate.
        attackedTiles = _import2['default'].map(neighbors, function (side) {
          return _import2['default'].intersection(tile1.translate(side), tile2.translate(side))[0];
        });

        // Return the first tile that is valid, or falsy.
        return _import2['default'].find(attackedTiles, function (tile) {
          return selector.validate(tile).success();
        });
      }

      return null;
    }
  }, {
    key: '_selectLines',

    /**
     * Find lines to complete, either to win the game or to block
     * the opponent.
     * @param  {Boolean} useOpponent Should we use the opponent's lines?
     * @return {Boolean} Was a match successful?
     */
    value: function _selectLines(useOpponent) {
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
    }
  }, {
    key: '_selectOpponentLines',

    /**
     * Block the opponent's lines to prevent a win.
     * Relies on _selectLines.
     * @return {Boolean} Was a match successful?
     */
    value: function _selectOpponentLines() {
      return this._selectLines(true);
    }
  }, {
    key: '_selectSingles',

    /**
     * Find singles to surround, either to build bot lines or to block the
     * opponent from building lines.
     * @param  {Boolean} useOpponent Should we use the opponent's singles?
     * @return {Boolean} Was a match successful?
     */
    value: function _selectSingles(useOpponent) {
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
    }
  }, {
    key: '_selectOpponentSingles',

    /**
     * Surround opponent's singles to block further line creation.
     * Relies on _selectSingles.
     * @return {Boolean} Was a match successful?
     */
    value: function _selectOpponentSingles() {
      return this._selectSingles(true);
    }
  }, {
    key: '_selectByTileLine',

    /**
     * Attempts to select a tile on the same line as the given tile.
     * Scans both x and y lines, shuffling the collection.
     * @param  {Tile} tile The target tile.
     * @return {Tile} The selected tile.
     */
    value: function _selectByTileLine(tile) {
      var _this3 = this;

      // Grab all the tiles on the same line as the passed tile.
      var lineTiles = _import2['default'].shuffle(tile.getAllLineTiles());

      // Return the first tile that is a valid selection.
      return _import2['default'].find(lineTiles, function (lineTile) {
        return _this3.selectTile(lineTile).success();
      });
    }
  }, {
    key: '_log',

    /**
     * A simple logging mechanism to record the bot's thoughts.
     * Used in the Recorder object which looks for the _logText property.
     */
    value: function _log() {

      var text = _import2['default'].reduce(arguments, function (lines, data) {
        lines.push(!_import2['default'].isEmpty(data) ? data.toString() : 'NONE');
        return lines;
      }, []).join(' ');

      // Immediately output the message in the console.
      //console.log(text);

      // Append the text to the master log.
      this._logText += text + '\n';
    }
  }]);

  return Bot;
})(_Player3['default']);

Bot.THINKING_SPEED = 600;

exports['default'] = Bot;
module.exports = exports['default'];

},{"./player":9,"./selection/TileSelector":15,"lodash":"lodash"}],3:[function(require,module,exports){
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

},{"../util/vendor":20,"./side":5,"lodash":"lodash"}],4:[function(require,module,exports){
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

},{"../util/util":19,"../util/vendor":20,"lodash":"lodash"}],7:[function(require,module,exports){
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

var _Tracker = require('./util/Tracker');

var _Tracker2 = _interopRequireWildcard(_Tracker);

// Instantiate a new Tracker instance which will send the pageview event.
var tracker = new _Tracker2['default']();

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
        _this.cube.build().then(_import2['default'].bind(_this.initialize, _this));
      });
    });
  },

  /**
   * Configures the cube for game mode by creating players, setting listeners,
   * and initializing the renderer.
   */
  initialize: function initialize() {

    // Create the players: A human and a bot.
    var human = new _Player2['default']('Player', 'player1', this.cube),
        bot = new _Bot2['default']('CPU', 'player2', this.cube, human);

    this.players = [human, bot];

    // Sets the game turns to 0.
    this.turns = 0;

    // Begin the rendering.
    this.renderer.initialize();

    // Let's clear the helper tile when the cube is rotating.
    this.renderer.on('start', _import2['default'].bind(this.clearHelperTile, this));

    // Set the current player as the first player. This "officially" begins the game.
    this.setCurrentPlayer(_import2['default'].first(this.players));

    // Fire an event that signals the first game has begun.
    tracker.sendGameEvent(_Tracker2['default'].GAME_START);
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
   * Removes all claimed tiles from each player and destroys all messages.
   * Sets the current player to the first player in the array.
   */
  reset: function reset() {
    var _this2 = this;

    this.messages.removeAll();
    this.cube.el.classList.add('reset');
    tracker.sendGameEvent(_Tracker2['default'].GAME_RESET);

    this.renderer.setSyncMovement(450, 450).then(function () {
      _import2['default'].forEach(_this2.players, function (player) {
        return player.releaseAll();
      });
      _this2.cube.el.classList.remove('reset');
      _this2.setCurrentPlayer(_import2['default'].first(_this2.players));
      _this2.turns = 0;
    });
  },

  /**
   * Instantiates a tutorial instance and hooks into methods that should
   * emit lesson messages.
   */
  _initializeTutorial: function _initializeTutorial() {
    this.tutorial = new _Tutorial2['default']();
    this.tutorial.hook(this, 'initialize', 'start').hook(this, 'showCrosshairs', 'click').hook(this, '_endTurn', 'turn');
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

    this.turns++;
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

      // Send an event describing the win state.
      tracker.sendGameEvent(this.currentPlayer.isBot() ? _Tracker2['default'].GAME_BOT_WIN : _Tracker2['default'].GAME_PLAYER_WIN, this.turns);

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
    tracker.sendGameEvent(_Tracker2['default'].GAME_STALEMATE);
  },

  /**
   * After a brief pause, alerts the user about how to start a new game
   * and sets a listener.
   */
  _waitAndListenForReset: function _waitAndListenForReset() {
    var _this3 = this;

    // Remove the current player and disable cube interactions.
    this.currentPlayer = null;
    this.disableCubeInteraction();

    // After two seconds, display a message to begin a new game and
    // listen for document clicks to reset.
    setTimeout(function () {
      _this3.messages.add('newGame', 'persist');
      _listenOnce.listenOnce(document, 'click', _import2['default'].bind(_this3.reset, _this3));
    }, 2000);
  },

  // Potentially dangerous as this is hackable...
  // Perhaps do a straight-up element match too?
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
    })['catch'](function (err) {
      console.error(err);
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
    this._helperTile = this.currentPlayer.getAttackTile(tile, initialTile);

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

},{"./bot":2,"./cube/cube":3,"./messages":8,"./player":9,"./recorder":10,"./render/renderer":12,"./tutorial":17,"./util/Tracker":18,"./util/util":19,"./util/vendor":20,"lodash":"lodash"}],8:[function(require,module,exports){
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

},{"./util/vendor":20,"lodash":"lodash"}],9:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _TileSelector = require('./selection/TileSelector');

var _TileSelector2 = _interopRequireWildcard(_TileSelector);

var _CubeCache = require('./selection/CubeCache');

var _CubeCache2 = _interopRequireWildcard(_CubeCache);

var Player = (function () {
  function Player(name, tileClass, cube) {
    _classCallCheck(this, Player);

    this.name = name;
    this.tileClass = tileClass;
    this._selector = new _TileSelector2['default'](this);
    this._cubeCache = new _CubeCache2['default'](cube);
  }

  _createClass(Player, [{
    key: 'isBot',
    value: function isBot() {
      return false;
    }
  }, {
    key: 'claim',
    value: function claim(tile) {
      tile.claim(this);
      this._cubeCache.add(tile);
    }
  }, {
    key: 'release',
    value: function release(tile) {
      this._cubeCache.remove(tile);
      tile.release();
    }
  }, {
    key: 'releaseAll',
    value: function releaseAll() {
      _import2['default'].forEach(this._cubeCache.getAllTiles(), function (tile) {
        return tile.release();
      });
      this._cubeCache.initialize();
    }
  }, {
    key: 'getLines',
    value: function getLines() {
      return this._cubeCache.getLines();
    }
  }, {
    key: 'getSingles',

    /**
     * @return {Array[Tile]} All the tiles claimed that do not compose lines.
     */
    value: function getSingles() {
      return this._cubeCache._singles;
    }
  }, {
    key: 'getInitialTile',

    /**
     * @return {Tile} The first tile selected to be claimed.
     */
    value: function getInitialTile() {
      return this._selector.getInitial();
    }
  }, {
    key: 'getAttackTile',

    /**
     * Gets the tile where the two passed tile's coordinates intersect.
     * @param {Tile} [tile1] The first tile selected.
     * @param {Tile} [tile2] The second tile selected.
     * @return {Tile}       The tile being attacked.
     */
    value: function getAttackTile(tile1, tile2) {

      var cube = this._cubeCache._cube,
          neighbors,
          side;

      if (tile1 && tile2 && tile1.isNeighboringSide(tile2)) {

        // Get the shared neighboring sides.
        neighbors = _import2['default'].intersection(tile1.side.getNeighbors(), tile2.side.getNeighbors()),

        // Get the neighbor that is visible.
        side = _import2['default'].find(neighbors, function (neighbor) {
          return neighbor.isVisible(cube.x, cube.y);
        });

        // Return the tile that intersects the two passed tiles.
        return _import2['default'].intersection(tile1.translate(side), tile2.translate(side))[0];
      }

      return null;
    }
  }, {
    key: 'getWinLines',

    /**
     * Win lines are completed lines. This method returns all the win
     * lines claimed by the player.
     * @return {Array} A collection of this player's win lines.
     */
    value: function getWinLines() {
      var size = this._cubeCache._cube.size;
      return _import2['default'].filter(this.getLines(), function (line) {
        return line.length() === size;
      });
    }
  }, {
    key: 'canAttack',

    /**
     * Dictates whether or not the player can attack the given tile.
     * Basically, as long as the tile is not claimed by the player and
     * is not some barrier, the tile can be attacked.
     * @param  {Tile} tile The tile to check.
     * @return {Boolean} Can the given tile be attacked by this player?
     */
    value: function canAttack(tile) {
      return tile.claimedBy !== this;
    }
  }, {
    key: 'selectTile',
    value: function selectTile(tile, attackTile) {
      return this._selector.validate(tile, attackTile);
    }
  }, {
    key: 'claimAll',
    value: function claimAll() {

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
    }
  }, {
    key: 'hasValidMoves',

    /**
     * Checks to see if the player has at least one valid move.
     * Resets the selector after performing the check.
     * @return {Boolean} Does a valid move exist?
     */
    value: function hasValidMoves() {
      var hasMove = this.selectRandom();
      this._selector.reset();
      return hasMove;
    }
  }, {
    key: 'selectRandom',

    /**
     * Makes a random valid selection.
     * @return {Boolean} Was a valid selection made?
     */
    value: function selectRandom() {
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
    }
  }, {
    key: '_createAttackData',
    value: function _createAttackData(tile) {
      return {
        player: tile.claimedBy,
        tile: tile,
        toString: function toString() {
          return '(attack -> ' + tile.toString() + ')';
        }
      };
    }
  }]);

  return Player;
})();

exports['default'] = Player;
module.exports = exports['default'];

},{"./selection/CubeCache":14,"./selection/TileSelector":15,"lodash":"lodash"}],10:[function(require,module,exports){
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
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

// The analytics script to load.
var SCRIPT_ENDPOINT = '//www.google-analytics.com/analytics.js',

// The analytics account id.
ACCOUNT = 'UA-2196067-3',

// The analytics global namespace.
TRACKER_NAMESPACE = 'ga';

/**
 * A lightweight wrapper around whatever tracking interface is being used.
 * Currently, this interface is Google Analytics.
 */

var Tracker = (function () {

  /**
   * Creates a new Tracker instance and sets up the GA environment if it
   * hasn't been initialized already.
   * @constructor
   */

  function Tracker() {
    _classCallCheck(this, Tracker);

    if (!window.ga) {
      this._initGateway();
    }
  }

  _createClass(Tracker, [{
    key: 'sendGameEvent',

    /**
     * Dispatches a game category event, such as 'start' or 'bot-win'.
     * @param {String} action The action to track.
     * @param {Number} [turns] How many turns have elapsed.
     */
    value: function sendGameEvent(action, turns) {

      var fields = {
        hitType: 'event',
        eventCategory: 'game',
        eventAction: action
      };

      if (turns) {
        fields.eventValue = turns;
      }

      ga('send', fields);
    }
  }, {
    key: '_initGateway',

    /**
     * Creates a temporary global ga object, loads analytics.js, and fires off
     * a pageview event.
     */
    value: function _initGateway() {

      var win = window,
          doc = win.document,
          script = doc.createElement('script'),
          placeholder = doc.getElementsByTagName('script')[0];

      // Acts as a pointer to support renaming.
      win.GoogleAnalyticsObject = TRACKER_NAMESPACE;

      // Creates an initial ga() function.  The queued commands will be executed once analytics.js loads.
      win[TRACKER_NAMESPACE] = win[TRACKER_NAMESPACE] || function () {
        (win[TRACKER_NAMESPACE].q = win[TRACKER_NAMESPACE].q || []).push(arguments);
      };

      // Sets the time (as an integer) this tag was executed.  Used for timing hits.
      win[TRACKER_NAMESPACE].l = 1 * new Date();

      // Insert the script tag asynchronously.
      script.async = 1;
      script.src = SCRIPT_ENDPOINT;
      placeholder.parentNode.insertBefore(script, placeholder);

      // Create the tracker and send a pageview hit.
      ga('create', ACCOUNT, 'auto');
      ga('send', 'pageview');
    }
  }]);

  return Tracker;
})();

Tracker.GAME_START = 'start';
Tracker.GAME_RESET = 'reset';
Tracker.GAME_BOT_WIN = 'bot-win';
Tracker.GAME_PLAYER_WIN = 'player-win';
Tracker.GAME_STALEMATE = 'stalemate';

exports['default'] = Tracker;
module.exports = exports['default'];

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * This is a messy file containing vendor compatibility support logic.
 * Mostly, we're normalizing the a few CSS and JS methods and checking 
 * whether or not the user's browser can handle the modern CSS we're throwing at it.
 * But yeah, not very pretty stuff below.
 */

var STYLE = document.body.style,
    TRANSFORM = 'Transform',

// Prefixes used for things like Transform.
STYLE_PREFIXES = ['ms', 'O', 'Moz', 'Webkit'],

// Animation end events. Not quite perfect as IE10+ actually uses:
// 'animation' -> 'MSAnimationEnd'
// So ridiculous. Can't these be consistent?!
// Whatever. IE doesn't support preserve-3d anyways so no big deal.
// Map format:
// 'css-attribute':       [start, iteration, end]
ANIMATION_EVENT_MAP = {
  animation: ['animationstart', 'animationiteration', 'animationend'],
  '-o-animation': ['oAnimationStart', 'oAnimationIteration', 'oAnimationEnd'],
  '-moz-animation': ['animationstart', 'animationiteration', 'animationend'],
  '-webkit-animation': ['webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd']
},
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

// Check to see if the browser supports preserve-3d. If not, place a
// special class on the body element.
(function () {

  var WEBKIT_TRANSFORM_STYLE = '-webkit-transform-style',
      MOZ_TRANSFORM_STYLE = '-moz-transform-style',
      MS_TRANSFORM_STYLE = '-ms-transform-style',
      TRANSFORM_STYLE = 'transform-style',
      element = document.createElement('p'),
      body = document.body,
      properties = {
    webkitTransformStyle: WEBKIT_TRANSFORM_STYLE,
    MozTransformStyle: MOZ_TRANSFORM_STYLE,
    msTransformStyle: MS_TRANSFORM_STYLE,
    transformStyle: TRANSFORM_STYLE
  };

  function has3D() {

    var PRESERVE_3D = 'preserve-3d',
        prop,
        computedStyle;

    for (prop in properties) {
      if (element.style[prop] !== undefined) {
        element.style[prop] = PRESERVE_3D;
      }
    }

    computedStyle = window.getComputedStyle(element);

    return (computedStyle.getPropertyValue(WEBKIT_TRANSFORM_STYLE) || computedStyle.getPropertyValue(MOZ_TRANSFORM_STYLE) || computedStyle.getPropertyValue(MS_TRANSFORM_STYLE) || computedStyle.getPropertyValue(TRANSFORM_STYLE)) === PRESERVE_3D;
  }

  body.appendChild(element);

  if (!has3D()) {
    body.classList.add('no-3d');
  }

  body.removeChild(element);
})();

exports.js = js;
exports.css = css;
exports.events = events;

},{}]},{},[1]);
