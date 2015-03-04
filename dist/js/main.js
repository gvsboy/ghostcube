function App(containerId) {

  // The site container which houses the cube and intro text.
  this.container = document.getElementById(containerId);

  // Check if the client is on a mobile device.
  this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

  // The fun part!
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);

  // UI for displaying various messages.
  this.messages = new Messages();

  // An object that detects user interaction to manipulate the cube.
  this.renderer = new Renderer(this.cube, this.isMobile);

  // In-game players.
  this.players = null;
  this.currentPlayer = null;

  // Cross-selected tile for helping attacks.
  this._helperTile = null;

  // Step-by-step instruction component.
  this.tutorial = new Tutorial();

  // Records moves as they're made. Can be used to step through time.
  this.recorder = new Recorder(this);

  // Listen for user interactions.
  this.idle();
}

App.prototype = {

  /**
   * Configures the cube object's default pre-game state.
   */
  idle: function() {

    var self = this,
        cube = this.cube,
        cubeEl = cube.el,
        container = this.container;

    function cubeClicked() {
      cubeEl.classList.remove('splash');
      cubeEl.removeEventListener('click', cubeClicked);
      container.classList.add('game');
      container.addEventListener(Vendor.EVENT.animationEnd, beginGame);
    }

    function beginGame(evt) {
      // Every animated cube face will bubble up their animation events
      // so let's react to only one of them.
      if (evt.target === container) {
        container.removeEventListener(Vendor.EVENT.animationEnd, beginGame);
        cube
          .build()
          .then(_.bind(self.initializeGame, self));
      }
    }

    // Click the cube to begin the game.
    cubeEl.addEventListener('click', cubeClicked);
  },

  /**
   * Configures the cube for game mode by creating players, setting listeners,
   * and initializing the renderer.
   */
  initializeGame: function() {

    var cube = this.cube;

    // Create the players and set the first one as current.
    var human = new Player('Kevin', 'player1', cube);
    var bot = new Bot('CPU', 'player2', cube, human);
    this.players = [human, bot];

    // The message box listens for messages to display.
    this.messages.listenTo(this.tutorial);

    this.setCurrentPlayer(_.first(this.players));

    // Begin the rendering.
    this.renderer.initialize();

    this.renderer.on('start', _.bind(this.clearHelperTile, this));

    // Not really into this but sure for now.
    _.forEach(this.players, function(player) {
      player
        .on('player:initialSelected', _.bind(this.showCrosshairs, this))
        .on('player:initialDeselected', _.bind(this.hideCrosshairs, this))
        .on('player:claim', _.bind(this._endTurn, this))
    }, this);

    this.tutorial.next().next();
  },

  enableCubeInteraction: function() {
    this.cube
      .listenTo('click', this._handleClick, this)
      .listenTo('mouseover', this._handleMouseOver, this)
      .listenTo('mouseout', this._handleMouseOut, this);
  },

  disableCubeInteraction: function() {
    this.cube
      .stopListeningTo('click')
      .stopListeningTo('mouseover')
      .stopListeningTo('mouseout');
  },

  /**
   * Sets the current player to the passed player, displaying the correct
   * messaging and updating the UI state.
   * @param {Player} player    The player to set as the current player.
   * @param {Boolean} botManual Should the bot play it's turn automatically?
   *                            Used in recorder mode to pause auto playback.
   */
  setCurrentPlayer: function(player, botManual) {
    var cubeEl = this.cube.el;
    cubeEl.classList.add(player.tileClass + '-turn');
    if (this.currentPlayer) {
      cubeEl.classList.remove(this.currentPlayer.tileClass + '-turn');
    }
    this.currentPlayer = player;
    this.messages.add(player.name + '\'s turn!', 'alert');

    if (player.isBot()) {
      this.disableCubeInteraction();
      if (!botManual) {
        player.play();
      }
    }
    else {
      this.enableCubeInteraction();
    }
  },

  getOpponent: function(player) {
    return this.players[this.players.indexOf(player) === 1 ? 0 : 1];
  },

  showCrosshairs: function(tile) {
    tile.addClass('selected');
    this.cube.updateCrosshairs(tile, tile => {
      tile.addClass('highlighted');
    });
    this.tutorial.next();
  },

  hideCrosshairs: function(tile) {
    tile.removeClass('selected');
    this.cube.updateCrosshairs(tile, tile => {
      tile.removeClass('highlighted');
    });
  },

  clearHelperTile: function() {
    if (this._helperTile) {
      this._helperTile.removeClass('helper');
    }
    this._helperTile = null;
  },

  /**
   * Ends the current player's turn and determines if the game is
   * in a win state.
   * @param  {Array} tiles The tiles selected to end the turn.
   */
  _endTurn: function(tiles) {

    var player = this.currentPlayer,
        lines = player.getWinLines();

    this.recorder.record(player, tiles);
    this.clearHelperTile();
    this.hideCrosshairs(_.first(tiles));

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
  _endGame: function(lines) {

    var winBy = lines.length,
        modifier;

    if (winBy) {
      modifier = winBy > 1 ? ' x' + winBy + '!' : '!';
      this.messages.add(this.currentPlayer.name + ' wins' + modifier, 'alert persist');
      _.invoke(lines, 'pulsate');
      setTimeout(() => {
        this.messages.add('newGame', 'persist');
      }, 2000);
      return true;
    }

    return false;
  },

  // Potentially dangerous as this is hackable...
  // Perhaps do a straigh-up element match too?
  _getTileFromElement: function(el) {
    var data;
    if (el.classList.contains('tile')) {
      data = el.id.split('-');
      return this.cube.getSides(data[0]).getTiles(data[1])[0];
    }
    return null;
  },

  _handleClick: function(evt) {

    // Get the target element from the event.
    var tile = this._getTileFromElement(evt.target);

    // If the tile exists, try to select it.
    if (tile) {
      try {
        this.currentPlayer.selectTile(tile, this._helperTile);
        this.tutorial.next().next();
      }

      // An error was thrown in the tile selection process. Handle it.
      catch(e) {
        if (e instanceof SelectTileError) {
          this.messages.add(e.message);
        }
        else {
          throw e;
        }
      }
    }
  },

  _handleMouseOver: function(evt) {

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

  _handleMouseOut: function(evt) {
    this.clearHelperTile();
  }

};

function Bot(name, tileClass, cube, opponent) {
  Player.call(this, name, tileClass, cube);
  this.opponent = opponent;
}

Bot.THINKING_SPEED = 600;

Bot.prototype = {

  getInitialTriedTile: function() {
    return _.first(this._triedTiles);
  },

  play: function() {

    this._initLog();

    this._log('================== BOT MOVE ==================');

    this._triedTiles = [];

    /*
      First, gather all the Bot's tiles to see if a win is possible this turn
      (there are lines that are missing one tile).
      If so, attempt to claim those tiles.

      If no win is possible, gather the opponent's tiles to see if a win is possible.
      If so, see which method can block:

        - Neutralizing a tile?
        - Claiming the missing tile?
     */

    this._selectWin() ||
    this._selectOpponentBlocker() ||
    this._selectSingles() ||
    this._selectOpponentSingles() ||
    this._selectLastResort();
  },

  _selectWin: function() {

    var lines = this.getLines(),
        initialTile,
        tile;

    this._log('++++++ WIN lines:', lines);

    for (var i = 0, len = lines.length; i < len; i++) {

      initialTile = this.getInitialTriedTile();
      tile = lines[i].missingTiles()[0];

      this._log('+++ WIN loop [initial, tile] :', initialTile, tile);

      // If there's a tile selected already, try to seal the deal with two more.
      if (initialTile && tile) {

        // First try to claim another win situation.
        // If that doesn't work out, try to claim by any means necessary.
        var attackTile = this.getAttackTile(initialTile, tile);
        if (attackTile && this._tryTiles(tile, attackTile)) {
          return true; // Done! The tiles will be claimed.
        }
      }
      else {
        this._tryTiles(tile);
      }
    }

    // More tiles must be selected to complete the turn.
    return false;
  },

  _selectOpponentBlocker: function() {

    var lines = this.opponent.getLines(),
        initialTile,
        tile;

    this._log('@@@@@@ BLOCK lines:', lines);

    for (var i = 0, len = lines.length; i < len; i++) {

      initialTile = this.getInitialTriedTile();
      tile = lines[i].missingTiles()[0];

      this._log('@@@ BLOCK loop [initial, tile] :', initialTile, tile);

      // If there's a tile selected already, try to seal the deal with two more.
      if (initialTile && tile) {
        var attackTile = this.getAttackTile(initialTile, tile);
        if (attackTile && this._tryTiles(tile, attackTile)) {
          return true; // Done! The tiles will be claimed.
        }
      }
      else {
        this._tryTiles(tile);
      }
    }

    // More tiles must be selected to complete the turn.
    return false;
  },

  _selectOpponentSingles: function() {
    return this._selectSingles(true);
  },

  _selectSingles: function(useOpponent) {

    var singles = _.shuffle(useOpponent ? this.opponent.getSingles() : this.getSingles()),
        initialTile,
        tile;

    this._log('------ SINGLES' + (useOpponent ? ' OPPONENT:' : ':'), singles);

    for (var t = 0, len = singles.length; t < len; t++) {

      initialTile = this.getInitialTriedTile();

      // If there is no initial tile or this singles selection is on a neighboring
      // side, make a selection attempt.
      if (!initialTile || singles[t].isNeighboringSide(initialTile)) {
        tile = this._selectByTileLine(singles[t]);
      }

      this._log('--- singles loop [initial, tile] :', initialTile, tile);

      if (initialTile && tile) {
        var attackTile = this.getAttackTile(initialTile, tile);
        if (attackTile && this._tryTiles(tile, attackTile)) {
          return true; // Done! The tiles will be claimed.
        }

        // Otherwise, remove the last tried tile. The attack combo won't work.
        else {
          this._triedTiles = _.dropRight(this._triedTiles);
        }
      }
    }

    // More tiles must be selected to complete the turn.
    return false;
  },

  _selectLastResort: function() {

    var self = this;

    function attempt(tile) {

      var testTile;

      for (var t = 0, len = tiles.length; t < len; t++) {
        testTile = tiles[t];
        var attackTile = self.getAttackTile(tile, testTile);
        if (attackTile && self._tryTiles(testTile, attackTile)) {
          return true;
        }
      }
      return false;
    }

    var initialTile = this.getInitialTriedTile(),
        tiles = this._cubeCache._cube.getAvailableTiles(initialTile);

    this._log('$$$$$ LAST RESORT');

    // If there is an initial tile, try to match it first.
    if (initialTile) {
      if (attempt(this.getInitialTriedTile())) {
        return true;
      }
    }

    // Otherwise, go through all the tiles and try to find a match.
    for (var e = 0, len = tiles.length; e < len; e++) {
      this._triedTiles = [];
      this._tryTiles(tiles[e]);
      if (attempt(tiles[e])) {
        return true;
      }
    }

  },

  /**
   * Attempts to select a tile on the same line as the given tile.
   * Scans both x and y lines, shuffling the collection.
   * @param  {Tile} tile The target tile.
   * @return {Tile}      The selected tile.
   */
  _selectByTileLine: function(tile) {

    // Grab all the tiles on the same line as the passed tile.
    var lineTiles = _.shuffle(tile.getAllLineTiles());

    // Return the first tile that is a valid selection.
    return _.find(lineTiles, function(ti) {
      return this._tryTiles(ti);
    }, this);
  },

  _selectTiles: function() {

    var tiles = _.union(this._triedTiles, arguments);

    this._triedTiles = tiles;

    this._log('^^^^^^^^^^^^^^^^^^^^ _triedTiles is now:', this._triedTiles);

    if (this._triedTiles.length === 3) {
      setTimeout(() => {
        this._report();
        this._cubeCache._cube.rotateToTiles(this._triedTiles).then(() => {
          this._animateClaim();
        });
      }, Bot.THINKING_SPEED);
    }
  },

  _animateClaim: function() {
    setTimeout(_.bind(function() {
      var tile = this._triedTiles.shift();
      Player.prototype._selectTiles.call(this, tile);
      if (!_.isEmpty(this._triedTiles)) {
        this._animateClaim();
      }
    }, this), Bot.THINKING_SPEED);
  },

  _tryTiles: function(tile1, tile2) {
    try {
      this.selectTile(tile1, tile2);
      return true;
    }
    catch (e) {
      if (!(e instanceof SelectTileError)) {
        throw e;
      }
    }
    return false;
  },

  _report: function() {
    var info = _.reduce(this._triedTiles, function(all, tile) {
      all.push(tile.toString ? tile.toString() : tile);
      return all;
    }, []);
    this._log('### Bot will try:', info.join(' | '));
  },

  _initLog: function() {
    this._logText = '';
  },

  _log: function() {
    var text = _.reduce(arguments, function(lines, data) {
      lines.push(!_.isEmpty(data) ? data.toString() : 'NONE');
      return lines;
    }, []).join(' ');
    console.log(text);
    this._logText += text + '\n';
  }

};

function Cube(el, size) {

  // The HTML element representing the cube.
  this.el                     = el;

  // The cube's size regarding tiles across a side. Default to 3.
  this.size                   = size || 3;

  // Cached reference to the style object.
  this.style                  = this.el.style;

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
  build: function() {

    // Create the game sides. The tiles will animate into existence from a
    // trigger function during each side's creation.
    this._sides = this._buildSides(this.size);

    // Set the initial rotated state. Cut at 45 degrees to always display three sides.
    this.x = this.y = Cube.REVOLUTION - (Cube.ROTATION_UNIT / 2);

    return new Promise(resolve => {

      // A reference to the cube's element.
      var el = this.el;

      // After the cube's rotation animation has made one loop, begin to slow it down.
      el.addEventListener(Vendor.EVENT.animationIteration, function() {
        el.classList.add('transition');
        el.addEventListener(Vendor.EVENT.animationEnd, function animEnd(evt) {
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
  setRenderer: function(renderer) {
    this._renderer = renderer;
  },

  rotate: function(x, y) {
    this.x = this._calculateCoordinate(this.x, x);
    this.y = this._calculateCoordinate(this.y, y);

    this.style[Vendor.JS.transform] =
      Cube.ROTATE_X_PREFIX + this.x + Cube.ROTATE_UNIT_SUFFIX + ' ' + Cube.ROTATE_Y_PREFIX + this.y + Cube.ROTATE_UNIT_SUFFIX;
  },

  /**
   * Calculate the rotation needed to display all the given tiles which
   * must be neighbors to each other (for obvious reasons).
   * @param  {Array} tiles A collection of tiles (three maximum).
   * @return {Promise} A promise that resolves when the rotation is complete.
   */
  rotateToTiles: function(tiles) {

    // First, collect all the common coordinates each tile shares when visible.
    var pairs = this._getCommonVisibleCoordinates(tiles),

        // Next, get calculate the shortest rotation distance from the pairs.
        coors = this._getShortestRotationDistance(pairs);

    // Return a promise that will resolve when the cube's rotation render completes.
    return new Promise(resolve => {
      this._renderer
        .setMovement(coors[0], coors[1])
        .then(resolve);
    });
  },

  listenTo: function(eventName, callback, context) {

    var events = this._eventMap,
        handler = _.bind(callback, context || this);

    if (!events[eventName]) {
      events[eventName] = [];
    }

    this._eventMap[eventName].push(handler);
    this.el.addEventListener(eventName, handler);

    return this;
  },

  stopListeningTo: function(eventName) {

    _.forEach(this._eventMap[eventName], function(handler) {
      this.el.removeEventListener(eventName, handler);
    }, this);

    return this;
  },

  /**
   * Fetches a cube side by name (e.g. 'top')
   * @param  {String} name The name of the side you want.
   * @return {Side}      The Side object by name.
   */
  getSides: function(name) {
    return name ? this._sides[name] : this._sides;
  },

  /**
   * @return {Array} The three visible sides.
   */
  getVisibleSides: function() {

  },

  /**
   * Retrieves all the unclaimed tiles and sorts them by the amount per
   * side in ascending order. If an exception tile is passed, do not include
   * unclaimed tiles from that tile's side.
   * @param  {Tile} except The tile whose side to exclude.
   * @return {Array} A list of all the available tiles.
   */
  getAvailableTiles: function(except) {

    // Get all the tiles by side and push each array to the main array list.
    var tilesBySide = _.reduce(this.getSides(), function(list, side) {
      if (!except || side !== except.side) {
        list.push(_.shuffle(side.getAvailableTiles()));
      }
      return list;
    }, []);

    // Sort each side's array by length and then flatten the whole thing.
    return _.flatten(_.sortBy(tilesBySide, 'length'));
  },

  /**
   * Updates the passed tile and all related adjacent tiles with the
   * passed callback. This method is mostly used for highlighting tiles
   * to help the user make strategy decisions easier.
   * @param  {DOMElement}   tile The selected tile as a raw DOM element.
   * @param  {Function}     callback   The method to invoke passing each tile as an argument.
   */
  updateCrosshairs: function(tile, callback) {

    // Run the callback on all tiles in the lines associated with the given tile.
    _.forEach(tile.getAllLineTiles(), callback);

    // For each neighbor, pass in the side and the orientation id (e.g. 'left').
    _.forEach(tile.side.getNeighbors(), neighbor => {

      // Find the translated tiles and run the callback on each.
      _.forEach(tile.translate(neighbor), callback);
    });
  },

  /**
   * Gets the tile where the two passed tile's coordinates intersect.
   * @param {Tile} [tile1] The first tile selected.
   * @param {Tile} [tile2] The second tile selected.
   * @return {Tile}       The tile being attacked.
   */
  getAttackTile: function(tile1, tile2) {

    var neighbors, side;

    if (tile1 && tile2 && tile1.isNeighboringSide(tile2)) {

      // Get the neighbor sides and exclude the selected side.
      neighbors = _.without(tile2.side.getNeighbors(), tile1.side),

      // Get the neighbor that is visible.
      side = _.find(neighbors, function(neighbor) {
        return neighbor.isVisible(this.x, this.y);
      }, this);

      // Return the tile that intersects the two passed tiles.
      return _.intersection(tile1.translate(side), tile2.translate(side))[0];
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
  _calculateCoordinate: function(current, difference) {

    var REVOLUTION = Cube.REVOLUTION,
        result = current + difference;

    if (result > REVOLUTION) {
      result = result - REVOLUTION;
    }
    else if (result <= Cube.ORIGIN) {
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
  _getCommonVisibleCoordinates: function(tiles) {

    // Collect the visibility map of each passed tile into an array.
    var visibilityMap = _.map(tiles, function(tile) {
          return tile.side._visibilityMap;
        }),

        // Find all the x coordinates shared by all the tiles.
        xCoors = _.intersection.apply(_, _.map(visibilityMap, function(map) {
          return _.map(_.keys(map), _.parseInt);
        })),

        // Given the available x coordinates, find the shared y coordinates.
        yCoors = _.flatten(_.map(xCoors, function(coor) {
          return _.intersection.apply(_, _.pluck(visibilityMap, coor));
        }));

    // Return a collection of x/y collections shared among all the passed tiles.
    return _.zip(xCoors, yCoors);
  },

  /**
   * Calculates the shortest rotation distance between an origin coordinate
   * and a target coordinate. Accounts for the circular continuation loop from 360
   * to 0 and the reverse.
   * @param  {Number} originCoor The coordinate you're currently at.
   * @param  {Number} targetCoor The coordinate you wish to be at.
   * @return {Number}            The shortest rotation movement to reach the target.
   */
  _getShortestCoordinateDiff: function(originCoor, targetCoor) {

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
  _getShortestRotationDistance: function(pairs) {

    return _.reduce(pairs, function(lowest, current) {

      // First, determine shortest differences for each coordinate so we can
      // compare them to a previous lowest pair.
      var diff = [
        this._getShortestCoordinateDiff(this.x, current[0]),
        this._getShortestCoordinateDiff(this.y, current[1])
      ];

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

  _buildSides: function(size) {

    // Create sides.
    var sides = _.reduce(this.el.children, function(list, el) {
      list[el.id] = new Side(el, size);
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
        '315':    [45, 315],
        '45':     [45, 315],
        '135':    [135, 225],
        '225':    [135, 225]
      },

      back: {
        '315':    [135, 225],
        '45':     [135, 225],
        '135':    [45, 315],
        '225':    [45, 315]
      },

      top: {
        '315':    [45, 135, 225, 315],
        '225':    [45, 135, 225, 315]
      },

      bottom: {
        '135':    [45, 135, 225, 315],
        '45':     [45, 135, 225, 315]
      },

      left: {
        '315':    [45, 135],
        '45':     [45, 135],
        '135':    [225, 315],
        '225':    [225, 315]
      },

      right: {
        '315':    [225, 315],
        '45':     [225, 315],
        '135':    [45, 135],
        '225':    [45, 135]
      }
    };

    // Now set the neighbors for each side.
    return _.forIn(sides, function(side) {
      side.setNeighbors(neighborMap[side.id]);
      side.setVisibilityMap(visibilityMap[side.id]);
    });
  }

};

/**
 * Lines represent tiles in either a horizontal or vertical row
 * which serve as points or win states.
 * @param {Array} tiles  A collection of tiles that compose the line.
 */
function Line(tiles) {
  this.side = _.first(tiles).side;
  this.update(tiles);
}

Line.prototype = {

  /**
   * Outputs useful identifying information for troubleshooting.
   * @return {String} String information.
   */
  toString: function() {
    var info = _.reduce(this.getTiles(), function(tiles, tile) {
      tiles.push(tile.toString());
      return tiles;
    }, []);
    return '(' + info.join(' ') + ')';
  },

  /**
   * Checks to see if the line contains all of the passed tiles.
   * @param  {Array} tiles The tiles to check.
   * @return {Boolean}     Does the line contain the passed tiles?
   */
  all: function(tiles) {
    return _.intersection(tiles, this._tiles).length >= this.length();
  },

  some: function(tiles) {
    return !!_.intersection(tiles, this._tiles).length;
  },

  update: function(tiles) {
    this._tiles = tiles;
  },

  /**
   * Updates the UI to display a winning state involving the line.
   */
  pulsate: function() {
    _.forEach(this.getTiles(), tile => {
      tile.addClass('win');
    });
  },

  /**
   * Reports whether or not the line is horizontal by checking the
   * index difference between two adjacent tiles.
   * @return {Boolean} Is this line horizontal?
   */
  isHorizontal: function() {
    var tiles = this.getTiles();
    return _.includes(tiles[0].xLine.getTiles(), tiles[1]);
  },

  /**
   * @return {Array} A collection of tiles that compose the line.
   */
  getTiles: function() {
    return this._tiles;
  },

  /**
   * @return {Number} The number of tiles in the line.
   */
  length: function() {
    return this._tiles.length;
  },

  /**
   * @return {Array} The indicies of all the tiles.
   */
  indicies: function() {
    return _.map(this.getTiles(), 'index');
  },

  /**
   * @return {Array} A collection of the missing tiles.
   */
  missingTiles: function() {

    var tiles = this.getTiles(),

        // Are we matching against a horizontal or vertical line?
        matchedLine = this.isHorizontal() ? _.first(tiles).xLine : _.first(tiles).yLine;

    // Now we can figure out which tiles are missing by diffing the two lines.
    return _.xor(tiles, matchedLine.getTiles());
  },

  // Rotate in place, like a Tetrad. For instance:
  // xoo      xxx
  // xoo  ->  ooo
  // xoo      ooo
  rotate: function() {

    // Where the line begins, starting from top-left.
    var originIndex = _.first(this.getTiles()).index;

    if (this.isHorizontal()) {
      return this.side.getTiles(originIndex + (originIndex / this.length()))[0].yLine;
    }

    return this.side.getTiles(originIndex * this.length())[0].xLine;
  },

  // Flip across a median. For instance:
  //    xoo      oox
  //    xoo  ->  oox
  //    xoo      oox
  flip: function() {

    // Where the line begins, starting from top-left.
    var originIndex = _.first(this.getTiles()).index,

        // The middle line.
        middle;

    if (this.isHorizontal()) {

      // The middle row, which is the size squared cut in half and floored.
      // NOTE: This could be buggy with other sizes!
      middle = Math.floor((Math.pow(this.length(), 2) / 2) - 1);

      // Determine the difference and get the calculated x line.
      return this.side.getTiles(middle * 2 - originIndex)[0].xLine;
    }

    // The middle column.
    middle = (this.length() - 1) / 2;

    // Determine the difference and get the calculated y line.
    return this.side.getTiles(middle * 2 - originIndex)[0].yLine;
  }

};

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

  getNeighbors: function() {
    return this._neighbors;
  },

  setNeighbors: function(sides) {
    this._neighbors = sides;
  },

  /**
   * A check to determine if the passed side is one of this side's neighbors.
   * @param  {Side}  side The side object to check.
   * @return {Boolean}      Is the passed side a neighbor?
   */
  isNeighbor: function(side) {
    return _.contains(this._neighbors, side);
  },

  setVisibilityMap: function(map) {
    this._visibilityMap = map;
  },

  isVisible: function(cubeX, cubeY) {
    return _.contains(this._visibilityMap[cubeX], cubeY);
  },

  /**
   * Fetches specific tiles referenced by the passed indicies,
   * or all tiles if indicies are not passed.
   * @param  {[String|Number|Number[]]} indicies An array of indicies.
   * @return {Tile[]}          An array of selected tiles.
   */
  getTiles: function(indicies) {
    if (_.isUndefined(indicies)) {
      return this._tiles;
    }
    return _.at(this._tiles, _.isArray(indicies) ? _.uniq(_.flatten(indicies)) : +indicies);
  },

  /**
   * Returns all the tiles that are still unclaimed.
   * @return {Array} A collection of unclaimed tiles.
   */
  getAvailableTiles: function() {
    return _.reject(this._tiles, 'claimedBy');
  },

  _buildTiles: function(size) {

    var tiles, lines;

    // First let's create an array of tiles based on the cube size.
    tiles = _.times(Math.pow(size, 2), function(index) {
      return this._placeTile(index);
    }, this);

    // Now we'll create lines from the tiles.
    lines = {

      // Creating x coordinate lines.
      x: _.times(size, function(n) {
          return new Line(tiles.slice(n * size, (n + 1) * size));
        }),

      // Creating y coordinate lines.
      y: _.times(size, function(n) {
          var arr = _.times(size, function(i) {
            return n + i * size;
          });
          return new Line(_.at(tiles, arr));
        })
    };

    // For each tile, assign the correct lines.
    _.forEach(tiles, function(tile, index) {

      var mod = index % size;
          xLine = lines.x[(index - mod) / size],
          yLine = lines.y[mod];

      tile.updateLines(xLine, yLine);
    });

    // Return the tiles.
    return tiles;
  },

  _placeTile: function(index) {

    var tile = new Tile(this, index);

    window.setTimeout(function() {
      tile.addClass('init');
    }, Math.random() * 2000);

    return tile;
  }

};

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
  toString: function() {
    return this.el.id;
  },

  build: function(id) {
    var el = document.createElement('div');
    el.id = id;
    el.className = 'tile';

    // debug
    var idData = id.split('-');
    el.appendChild(document.createTextNode(idData[0].slice(0, 2) + idData[1]));

    return el;
  },

  claim: function(player) {
    var self = this;
    if (self.claimedBy) {
      self.removeClass(self.claimedBy.tileClass);
    }
    self.claimedBy = player;
    self
      .removeClass('unclaimed')
      .addClass('preclaimed')
      .addClass(player.tileClass);

    self.el.addEventListener(Vendor.EVENT.animationEnd, function animEnd(evt) {
      self
        .removeClass('preclaimed')
        .addClass('claimed')
        .el.removeEventListener(Vendor.EVENT.animationEnd, animEnd);
    });
  },

  release: function() {
    var self = this;
    if (self.claimedBy) {
      self.removeClass(self.claimedBy.tileClass);
      self.claimedBy = null;
      self
        .addClass('unclaimed')
        .removeClass('claimed');
    }
  },

  isNeighboringSide: function(tile) {
    return this.side.isNeighbor(tile.side);
  },

  addClass: function(name) {
    this.el.classList.add(name);
    return this;
  },

  removeClass: function(name) {
    this.el.classList.remove(name);
    return this;
  },

  updateLines: function(x, y) {
    this.xLine = x;
    this.yLine = y;
  },

  /**
   * @return {Array} All the tiles composing both lines.
   */
  getAllLineTiles: function() {
    return _.union(this.xLine.getTiles(), this.yLine.getTiles());
  },

  translate: function(toSide) {

    // A translation is a recipe for morphing one line into another.
    // It looks like this: [1, flip]
    // Where: The first index is the coordinate to use in a line pair
    //        The remaining indicies are methods to invoke on the line
    var translation = Tile.translationMap[this.side.id][toSide ? toSide.id : null],

        // The line from the line pair to use.
        line = _.first(translation) === 'x' ? this.xLine : this.yLine;

    if (translation) {

      // Run through each translation method (flip, rotate) and return the result.
      var newLine = _.reduce(_.rest(translation), function(transformedLine, method) {
        return transformedLine[method]();
      }, line);

      return toSide.getTiles(newLine.indicies());
    }

    return null;
  }

};

Tile.translationMap = (function() {

  var X = 'x',
      Y = 'y',
      FLIP = 'flip',
      ROTATE = 'rotate';

  // Line coordinate mapping to side id.
  // [coordinate, methods...]
  return {

    front: {
      top:      [Y],                // top
      bottom:   [Y],                // bottom
      left:     [X],                // left
      right:    [X]                 // right
    },

    back: {
      bottom:   [Y, FLIP],          // top
      top:      [Y, FLIP],          // bottom
      left:     [X],                // left
      right:    [X]                 // right
    },

    top: {
      back:     [Y, FLIP],          // top
      front:    [Y],                // bottom
      left:     [X, ROTATE],        // left
      right:    [X, FLIP, ROTATE],  // right
    },

    bottom: {
      front:    [Y],                // top
      back:     [Y, FLIP],          // bottom
      left:     [X, FLIP, ROTATE],  // left
      right:    [X, ROTATE]         // right
    },

    left: {
      top:      [Y, ROTATE],        // top
      bottom:   [Y, FLIP, ROTATE],    // bottom
      back:     [X],                // left
      front:    [X]                 // right
    },

    right: {
      top:      [Y, FLIP, ROTATE],  // top
      bottom:   [Y, ROTATE],        // bottom
      front:    [X],                // left
      back:     [X]                 // right
    }
  };

}());

function CubeCache(cube) {

  // A reference to the cube.
  this._cube = cube;

  // The size to check completed lines against.
  this._cubeSize = cube.size;

  // A collection of lines created by side.
  this._lineMap = this._buildCollection(cube);

  // A collection of claimed tiles that are not part of lines.
  this._singles = [];
}

CubeCache.prototype = {

  add: function(tile) {

    var claimedBy = tile.claimedBy,
        xPartial = this._getPartialLineTiles(tile.xLine, claimedBy),
        yPartial = this._getPartialLineTiles(tile.yLine, claimedBy),
        xGrow = this._growLine(xPartial),
        yGrow = this._growLine(yPartial);

    // If a line was grown or created from this tile, ensure it's removed from
    // the singles collection.
    if (xGrow || yGrow) {
      this._singles = _.difference(this._singles, tile.getAllLineTiles());
    }

    // Else, add the tile to the singles collection.
    else {
      this._singles.push(tile);
    }
  },

  remove: function(tile) {

    var claimedBy = tile.claimedBy,
        xPartial = this._getPartialLineTiles(tile.xLine, claimedBy),
        yPartial = this._getPartialLineTiles(tile.yLine, claimedBy),
        xShrink,
        yShrink;

    _.pull(xPartial, tile);
    _.pull(yPartial, tile);

    xShrink = this._shrinkLine(xPartial);
    yShrink = this._shrinkLine(yPartial);

    // If there's some shrinkage, update the singles collection accordingly.
    if (xShrink || yShrink) {

      // We need to make sure that the tiles gathered in the partial are
      // not part of another line. If they are, don't add them as singles.
      if (xShrink && !this._composesLines(xPartial)) {
        this._singles = _.union(this._singles, xPartial);
      }
      if (yShrink && !this._composesLines(yPartial)) {
        this._singles = _.union(this._singles, yPartial);
      }
    }

    // Otherwise, safely remove the tile from the singles collection
    // if it exists in there.
    else {
      _.pull(this._singles, tile);
    }
  },

  /**
   * Retrieves all the lines, sorted by the number of tiles contained
   * in each line.
   * @return {Array} A collection of lines.
   */
  getLines: function() {
    return _.chain(this._lineMap)
      .values()
      .flatten()
      .compact()
      .sortBy(function(line) {
        return line._tiles.length;
      })
      .value();
  },

  /**
   * Create an object keyed by cube side id with array values for containing
   * various Tile data objects.
   * @param  {Cube} cube The Cube object to base the collection on.
   * @return {Object}    An object representation of the cube, keyed by side id.
   */
  _buildCollection: function(cube) {
    return _.reduce(cube._sides, function(sides, side, id) {
      sides[id] = [];
      return sides;
    }, {});
  },

  _getPartialLineTiles: function(line, claimedBy) {
    return _.filter(line.getTiles(), function(tile) {
      return tile.claimedBy === claimedBy;
    });
  },

  _growLine: function(tiles) {

    var side, line;

    if (tiles.length > 1) {

      side = this._lineMap[_.first(tiles).side.id];
      line = _.find(side, function(ln) {
        return ln && ln.all(tiles);
      });

      // If a line exists already, update it with the new tiles.
      if (line) {
        line.update(tiles);
      }

      // Otherwise, create a new line with the given tiles.
      else {
        side.push(new Line(tiles));
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
  _shrinkLine: function(tiles) {

    var side, line;

    if (tiles.length) {

      side = this._lineMap[_.first(tiles).side.id];
      line = _.find(side, function(ln) {
        return ln && ln.some(tiles);
      });

      // Line should exist but just in case...
      if (line) {

        // If there's only one tile, it's not a line. Clear it.
        if (tiles.length === 1) {
          side[side.indexOf(line)] = null;

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

  _composesLines: function(tiles) {
    var side = this._lineMap[_.first(tiles).side.id];
    return _.find(side, function(line) {
      return line && line.some(tiles);
    });
  }

};

function SelectTileError(message) {
  this.name = 'SelectTileError';
  this.message = message;
}

SelectTileError.CLAIMED = 'claimed';
SelectTileError.NOT_NEIGHBOR = 'notNeighbor';
SelectTileError.TARGET_CLAIMED = 'targetClaimed';

SelectTileError.prototype = new Error();

function Messages() {
  this.delay = 100;
  this.queue = [];
  this.container = this._buildContainer();
  this.container.addEventListener(Vendor.EVENT.animationEnd, _.bind(this._remove, this));
}

Messages.prototype = {

  listenTo: function(source) {
    source.on('message', _.bind(this.add, this));
  },

  /**
   * Creates a new message to add to the queue.
   * @param {String} message The message text.
   * @param {String} classes A space-separated list of classes to append to the message.
   * @return {Messages} Returns itself for chaining.
   */
  add: function(message, classes) {

    // Generate a new element to contain the message.
    var item = document.createElement('li');

    // Add special classes to decorate the message if passed.
    // We want to use apply here because add takes multiple arguments,
    // not an array of names.
    if (classes) {
      DOMTokenList.prototype.add.apply(item.classList, classes.split(' '));
    }

    // Get the correct message by passed key.
    if (message.split(' ').length === 1) {
      message = Messages.LIST[message];
    }

    // Append the message to the new element and queue it up.
    item.appendChild(document.createTextNode(message));
    this._enqueue(item);

    return this;
  },

  /**
   * Removes all persisted messages from the queue by adding the 'hide'
   * class to each one.
   */
  removeAll: function() {
    _.forEach(this.container.children, item => {
      item.classList.add('hide');
    });
  },

  _enqueue: function(item) {

    var container = this.container,
        queue = this.queue,
        delay = queue.length * this.delay;

    queue.push(item);

    _.delay(function(i) {
      container.appendChild(item);
      if (_.last(queue) === i) {
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
  _remove: function(evt) {
    var classList = evt.target.classList;
    if (!classList.contains('persist') || classList.contains('hide')) {
      this.container.removeChild(evt.target);
    }
  },

  _buildContainer: function() {
    var container = document.createElement('ul');
    container.id = 'messages';
    document.body.appendChild(container);
    return container;
  }

};

Messages.LIST = {
  claimed: 'This tile is already claimed!',
  targetClaimed: 'The attack target is already claimed by you!',
  sameSide: 'Same side! Choose a tile on a different side.',
  notNeighbor: 'Not a neighboring side! Choose a tile different side.',
  newGame: 'Click anywhere to begin a new game.'
};

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

  record: function(player, tiles) {

    var behind = this._timeline.length - this._cursor;

    if (behind) {
      console.warn(Recorder.MESSAGES.REWRITE + behind);
      this._timeline = _.dropRight(this._timeline, behind);
    }

    this._package(player, tiles);
    this._cursor++;
  },

  forward: function() {

    var turnData = this._timeline[this._cursor];

    if (turnData) {
      _.forEach(turnData.tiles, function(tile) {
        if (tile instanceof Tile) {
          turnData.player.claim(tile);
        }
        else {
          tile.player.release(tile.tile);
        }
      });
      console.log(turnData.log);
      this._cursor++;
      this._app.setCurrentPlayer(this._app.getOpponent(turnData.player), true);
    }
    else {
      throw Recorder.MESSAGES.NOT_FOUND + this._cursor;
    }
  },

  reverse: function() {

    var turnData = this._timeline[this._cursor - 1];

    if (turnData) {
      _.forEach(turnData.tiles, function(tile) {
        if (tile instanceof Tile) {
          turnData.player.release(tile);
        }
        else {
          tile.player.claim(tile.tile);
        }
      });
      this._cursor--;
      this._app.setCurrentPlayer(turnData.player, true);
    }
    else {
      throw Recorder.MESSAGES.NOT_FOUND + this._cursor;
    }
  },

  _package: function(player, tiles) {
    this._timeline.push({
      player: player,
      tiles: tiles,
      log: player._logText || Recorder.MESSAGES.NO_LOG
    });
  }

};

/**
 * A software interface for determining which keyboard keys are pressed.
 *
 * @param {Array || String} keyCodes A collection of all the (string) keyCodes used.
 */
function Keyboard(keyCodes) {

  this.keys = {};

  if (typeof keyCodes === 'string') {
    keyCodes = keyCodes.split(' ');
  }
  while (keyCodes.length) {
    this.keys[keyCodes.pop()] = false;
  }

}

Keyboard.prototype = { 

  listen: function(win, callback) {

    var UNDEFINED = 'undefined',
        keys = this.keys;
        
    if (!win) {
      win = window;
    }

    win.addEventListener('keydown', function(evt) {
      var keyCode = evt.keyCode;
      if (typeof keys[keyCode] !== UNDEFINED && !keys[keyCode]) {
        keys[keyCode] = true;
        if (callback) {
          callback();
        }
      }
    });

    win.addEventListener('keyup', function(evt) {
      var keyCode = evt.keyCode;
      if (keys[keyCode]) {
        keys[keyCode] = false;
        if (callback) {
          callback();
        }
      }
    });

  }

};

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

  // EventEmitter constructor call.
  EventEmitter2.call(this);
}

Renderer.prototype = {

  initialize: function() {
    if (this.isMobile) {
      this._listenForTouch();
    }
    else {
      this._listenForKeyboard();
    }
    this.cube.setRenderer(this);
  },

  draw: function() {

    // Reduce the ticks and rotate the cube
    this.tick -= this.speed;
    this.cube.rotate(this.moveX, this.moveY);

    // If there are ticks left or a key is down, keep looping.
    if (this.tick > 0 || this._setMovement()) {
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
  setMovement: function(x, y) {

    /**
     * Configure a move in one direction and start the render loop.
     * @param {Number} tick The distance to rotate.
     * @param {String} coorProp Which coordinate to rotate on (moveX or moveY).
     */
    var move = (tick, coorProp) => {
      this.tick = Math.abs(tick);
      this[coorProp] = !tick ? 0 : tick < 0 ? -this.speed : this.speed;
      this._loop();
    };

    // Return a promise that will resolve when both x and y movements are complete.
    return new Promise(resolve => {
      move(x, 'moveX');
      this.once('end', () => {
        move(y, 'moveY');
        this.once('end', resolve);
      });
    });
  },

  _listenForKeyboard: function() {

    this.keyboard = new Keyboard([
      Keyboard.UP,
      Keyboard.DOWN,
      Keyboard.LEFT,
      Keyboard.RIGHT,
      Keyboard.W,
      Keyboard.A,
      Keyboard.S,
      Keyboard.D
    ]);

    // Listen for keystrokes.
    this.keyboard.listen(window, this._movementListener.bind(this));
  },

  _listenForTouch: function() {
    this.touch = new Touch();
    this.touch.listen(document.body, this._movementListener.bind(this));
  },

  _loop: function() {
    window.requestAnimationFrame(this.draw.bind(this));
  },

  _movementListener: function() {
    if (this.tick <= 0 && this._setMovement()) {
      this._loop();
      this.emit('start');
    }
  },

  _setMovement: function() {

    // reset movex and movey
    this.moveX = this.moveY = 0;

    // Set the movement direction depending on the environment.
    if (this.isMobile) {
      this._setTouchMovement();
    }
    else {
      this._setKeyboardMovement();
    }

    // If there is movement, set tick and return true.
    if (this.moveX !== 0 || this.moveY !== 0) {
      this.tick = this.tickMax;
      return true;
    }

    // Movement was not set.
    return false;
  },

  _setKeyboardMovement: function() {

    var KB = Keyboard,
        keys = this.keyboard.keys;

    // Detect either up or down movement.
    if (keys[KB.UP] || keys[KB.W]) {
      this.moveX = this.speed;
    }
    else if (keys[KB.DOWN] || keys[KB.S]) {
      this.moveX = -this.speed;
    }

    // Detect either left or right movement.
    if (keys[KB.LEFT] || keys[KB.A]) {
      this.moveY = this.speed;
    }
    else if (keys[KB.RIGHT] || keys[KB.D]) {
      this.moveY = -this.speed;
    }
  },

  _setTouchMovement: function() {

    var movement = this.touch.queue.shift();

    switch (movement) {
      case Touch.UP:
        this.moveX = -this.speed;
        break;
      case Touch.DOWN:
        this.moveX = this.speed;
        break;
      case Touch.LEFT:
        this.moveY = this.speed;
        break;
      case Touch.RIGHT:
        this.moveY = -this.speed;
        break;
    }
  }

};

// Mixin the EventEmitter methods for great justice.
// Ditch when we migrate to Browserify.
_.assign(Renderer.prototype, EventEmitter2.prototype);

function Touch() {
  this.queue = [];
}

Touch.prototype = {

  listen: function(context, callback) {

    var iface = new Hammer(context || document.body),
        queue = this.queue;

    iface
      .get('swipe')
      .set({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0.1,
        velocity: 0.1
      });

    iface.on('swipe', function(evt) {
      queue.push(evt.offsetDirection);
      if (callback) {
        callback();
      }
    });
  }

};

Touch.UP = Hammer.DIRECTION_UP;
Touch.DOWN = Hammer.DIRECTION_DOWN;
Touch.LEFT = Hammer.DIRECTION_LEFT;
Touch.RIGHT = Hammer.DIRECTION_RIGHT;

/**
 * A lightweight guided tutorial helper that is attached to a specific
 * event-emitting object, such as the cube. Displays helpful messages
 * to teach the player how to play.
 * @param {Object} target An event-emitting object to provide guidance for.
 * @class
 */
function Tutorial() {

  // What step is the tutorial on?
  this.step = 0;

  // How many steps are there?
  this.maxStep = 5;

  // EventEmitter constructor call.
  EventEmitter2.call(this);
}

Tutorial.prototype = {

  next: function() {
    if (!this.isDone()) {
      this.emit('message', Tutorial.stepMessages[this.step], 'info');
      this.step++;
    }
    return this;
  },

  isDone: function() {
    return this.step >= this.maxStep;
  }

};

// Mixin EventEmitter methods.
_.assign(Tutorial.prototype, EventEmitter2.prototype);

// List of step messages.
Tutorial.stepMessages = [
  'Let\'s play! Click any tile to begin.',
  'Rotate the cube using the arrow keys or WASD.',
  'Great! Now, click a tile on an adjacent side.',
  'Nice! A third tile was selected automatically for you.',
  'Try to make a line on one side.'
];

(function(win) {

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
        'animation':            ['animationstart', 'animationiteration', 'animationend'],
        '-o-animation':         ['oAnimationStart', 'oAnimationIteration', 'oAnimationEnd'],
        '-moz-animation':       ['animationstart', 'animationiteration', 'animationend'],
        '-webkit-animation':    ['webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd']
      },

      msAnimationEnd = 'MSAnimationEnd',//TODO
      
      len = STYLE_PREFIXES.length,

      stylePrefix,

      animationProperty,

      eventTypes,

      vendor = {
        JS: {},
        CSS: {},
        EVENT: {}
      };

  // First, let's determine the style prefix.
  while (len--) {
    if ((STYLE_PREFIXES[len] + TRANSFORM) in STYLE) {
      stylePrefix = STYLE_PREFIXES[len];
      break;
    }
  }

  // If there isn't a proper prefix, use the standard transform.
  if (!stylePrefix) {
    stylePrefix = TRANSFORM.toLowerCase();
  }

  // Next, let's set some properties using the prefix.
  vendor.JS.transform = stylePrefix + TRANSFORM;
  vendor.CSS.transform = stylePrefix ? '-' + stylePrefix.toLowerCase() + '-transform' : 'transform';

  // Now, let's determine the event end name. So messed up.
  for (animationProperty in ANIMATION_EVENT_MAP) {
    if (typeof STYLE[animationProperty] !== 'undefined') {
      eventTypes = ANIMATION_EVENT_MAP[animationProperty];
      vendor.EVENT.animationStart = eventTypes[0];
      vendor.EVENT.animationIteration = eventTypes[1];
      vendor.EVENT.animationEnd = eventTypes[2];
      break;
    }
  }

  // Normalize requestAnimationFrame for cross-browser compatibility.
  win.requestAnimationFrame = win.requestAnimationFrame || win.mozRequestAnimationFrame || win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;    

  // Set the global Vendor variable.
  win.Vendor = vendor;

}(window));
