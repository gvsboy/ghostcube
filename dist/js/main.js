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

  // The three selected tiles to place pieces on.
  this.selectedTiles = [];

  // Cross-selected tile for helping attacks.
  this._helperTile = null;

  // Step-by-step instruction component.
  this.tutorial = new Tutorial();

  // Listen for user interactions.
  this.listen();
}

App.prototype = {

  // I hate everything in here...
  listen: function() {

    var self = this,
        cube = this.cube,
        cubeEl = cube.el,
        container = this.container;

    function beginGame(evt) {
      // Every animated cube face will bubble up their animation events
      // so let's react to only one of them.
      if (evt.target === container) {
        container.removeEventListener(Vendor.EVENT.animationEnd, beginGame);
        cube.build();
      }
    }

    function cubeClicked() {
      cubeEl.classList.remove('splash');
      cubeEl.removeEventListener('click', cubeClicked);
      container.classList.add('game');
      container.addEventListener(Vendor.EVENT.animationEnd, beginGame);
    }

    cubeEl.addEventListener('click', cubeClicked);

    // When the cube has initialized, start the rendering object.
    cube.on('init', _.bind(this._realListen, this));

    // The message box listens for messages to display.
    this.messages.listenTo(this.tutorial);
  },

  // This is where the cube's listeners are created. For reals.
  _realListen: function() {

    var cube = this.cube;

    // Create the players and set the first one as current.
    var human = new Player('Kevin', 'player1', cube);
    var bot = new Bot('CPU', 'player2', cube, human);
    this.players = [
      human,
      //new Player('Jon', 'player2', cube)
      bot
    ];
    this.setCurrentPlayer(_.first(this.players));

    // Begin the rendering.
    this.renderer.initialize();

    cube
      .listenTo('click', this._handleClick, this)
      .listenTo('mouseover', this._handleMouseOver, this)
      .listenTo('mouseout', this._handleMouseOut, this);

    cube.on('renderstart', _.bind(this.clearHelperTile, this));

    this.tutorial.next().next();
  },

  setCurrentPlayer: function(player) {
    var cubeEl = this.cube.el;
    cubeEl.classList.add(player.tileClass + '-turn');
    if (this.currentPlayer) {
      cubeEl.classList.remove(this.currentPlayer.tileClass + '-turn');
    }
    this.currentPlayer = player;
    this.messages.add(player.name + '\'s turn!', 'alert');

    if (player.isBot()) {
      player.play();
    }
  },

  selectTile: function(tile) {
    tile.addClass('selected');
    this.selectedTiles.push(tile);
    this.cube.updateAdjacentTiles(tile, function(tile) {
      tile.addClass('highlighted');
    });
  },

  deselectTile: function(tile) {
    tile.removeClass('selected');
    _.pull(this.selectedTiles, tile);
    this.cube.updateAdjacentTiles(tile, function(tile) {
      tile.removeClass('highlighted');
    });
  },

  clearHelperTile: function() {
    if (this._helperTile) {
      this._helperTile.removeClass('helper');
    }
    this._helperTile = null;
  },

  claim: function() {

    // Set the selected tiles to the player's color.
    _.forEach(this.selectedTiles, function(tile) {
      this.currentPlayer.claim(tile);
    }, this);

    // Remove all helpers.
    this.clearHelperTile();
    this.deselectTile(_.first(this.selectedTiles));

    this.selectedTiles = [];

    this._endTurn();
  },

  _endTurn: function() {

    var player = this.currentPlayer,
        winBy = player.getWinLines().length,
        modifier;

    // If a player wins, display a message and exit.
    if (winBy) {
      modifier = winBy > 1 ? ' x' + winBy + '!' : '!';
      this.messages.add(player.name + ' wins' + modifier, 'alert');
      //return;// just return for now. should set a win state.
    }

    // Else, switch players and continue.
    this.setCurrentPlayer(this.players[this.players.indexOf(player) === 1 ? 0 : 1]);
  },

  // Potentially dangerous as this is hackable...
  // Perhaps do a straigh-up element match too?
  _getTileFromElement: function(el) {
    var data;
    if (el.classList.contains('tile')) {
      data = el.id.split('-');
      return this.cube.getSide(data[0]).getTiles(data[1])[0];
    }
    return null;
  },

  _determineHelperHighlight: function(evt, callback) {

    // The tile the user is interacting with.
    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = _.first(this.selectedTiles);

    // If the user is hovering on a neighboring side of the initial tile,
    // highlight some targeting help on a visible side.
    if (tile && initialTile && initialTile.side.isNeighbor(tile.side)) {
      this.cube.updateHelperHighlight(tile, initialTile, callback);
    }
  },

  _handleClick: function(evt) {

    // Get the target element from the event.
    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = _.first(this.selectedTiles),

        // The union of the first and potential second tile.
        helperTile = this._helperTile;

    // If the target is a tile, let's figure out what to do with it.
    if (tile) {

      // If the tile is already claimed, get outta dodge.
      if (tile.claimedBy) {
        this.messages.add('claimed');
        return;
      }

      // If nothing has been selected yet, select the tile normally.
      if (!initialTile) {
        this.selectTile(tile);
        this.tutorial.next();
      }

      // Otherwise, there must be a selected tile already.
      else {

        // Deselect the tile if it is the target.
        if (tile === initialTile) {
          this.deselectTile(tile);
        }

        // Otherwise, try and make a match.
        else {

          // If the same side was selected, deselect the initial and select the new.
          if (tile.side === initialTile.side) {
            this.deselectTile(initialTile);
            this.selectTile(tile);
          }

          // Else if the side selected is not a neighbor, display an error.
          else if (!initialTile.side.isNeighbor(tile.side)) {
            this.messages.add('notNeighbor');
          }

          // Otherwise, we're on a good side. Let's drill down further.
          else {

            // If the attack target is claimed by the current player, don't claim it again!
            if (helperTile.claimedBy) {
              if (helperTile.claimedBy === this.currentPlayer) {
                this.messages.add('targetClaimed');
              }
              // Otherwise, cancel the two tiles out.
              else {
                helperTile.claimedBy.release(helperTile);
                this.selectedTiles.push(tile);
                this.claim();
              }
            }

            // Otherwise, a valid selection has been made! Claim both.
            else {
              this.selectedTiles.push(tile, helperTile);
              this.claim();
              this.tutorial.next().next();
            }
          }
        }
      }
    };
  },

  _handleMouseOver: function(evt) {
    this._determineHelperHighlight(evt, _.bind(function(tile) {
      tile.addClass('helper');
      this._helperTile = tile;
    }, this));
  },

  _handleMouseOut: function(evt) {
    this._determineHelperHighlight(evt, function(tile) {
      tile.removeClass('helper');
    });
  }

};

function Bot(name, tileClass, cube, opponent) {
  Player.call(this, name, tileClass, cube);
  this.opponent = opponent;
}

Bot.prototype = {

  play: function() {

    console.log('============== BOT MOVE ==============');

    /*
      First, gather all the Bot's tiles to see if a win is possible this turn
      (there are lines that are missing one tile).
      If so, attempt to claim those tiles.

      If no win is possible, gather the opponent's tiles to see if a win is possible.
      If so, see which method can block:

        - Neutralizing a tile?
        - Claiming the missing tile?
     */

    var cube = this._cubeCache._cube,
        botLines = this.getLines(),
        playerLines = this.opponent.getLines(),
        selectedTiles = [];


    // Check if the bot is about to win:
    var size = this._cubeCache._cubeSize;
    var botWinningMoves = _.filter(botLines, function(line) {
      return line.length() === size - 1;
    });
    console.log('= bot winning moves:', botWinningMoves);


    // If the bot has some winning moves, try some scenarios out.
    _.forEach(botWinningMoves, function(line) {

      // Find out which tiles are missing from the line and
      // loop through them to determine which ones can be captured.
      _.forEach(line.missingTiles(), function(tile) {

        console.log('# missing tile:', tile);

        
      });

    });
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

  // EventEmitter constructor call.
  EventEmitter2.call(this);
}

Cube.ROTATE_X_PREFIX = 'rotateX(';
Cube.ROTATE_Y_PREFIX = 'rotateY(';
Cube.ROTATE_UNIT_SUFFIX = 'deg)';
Cube.REVOLUTION = 360;
Cube.ORIGIN = 0;

Cube.prototype = {

  build: function() {

    // Create the game sides.
    this._sides = this._buildSides(this.size);

    // Initialize the game.
    // Slow down the cube to a stop, display instructions.
    var el = this.el,
        self = this;

    el.addEventListener(Vendor.EVENT.animationIteration, function() {
      el.classList.add('transition');
      el.addEventListener(Vendor.EVENT.animationEnd, function animEnd(evt) {
        if (evt.target === el) {

          // Remove the transition class and append the init class. Done!
          el.classList.remove('transition');
          el.classList.add('init');

          // Set the initial rotated state. Would be cool to make these dynamic
          // but probably not worth the trouble.
          // http://css-tricks.com/get-value-of-css-rotation-through-javascript/
          // http://stackoverflow.com/questions/8270612/get-element-moz-transformrotate-value-in-jquery
          self.x = 315;
          self.y = 315;

          // Let's go!
          self.emit('init');
        }
      });
    });

  },

  rotate: function(x, y) {
    this.x = this._calculateCoordinate(this.x, x);
    this.y = this._calculateCoordinate(this.y, y);

    this.style[Vendor.JS.transform] =
      Cube.ROTATE_X_PREFIX + this.x + Cube.ROTATE_UNIT_SUFFIX + ' ' + Cube.ROTATE_Y_PREFIX + this.y + Cube.ROTATE_UNIT_SUFFIX;
  },

  listenTo: function(eventName, callback, context) {
    this.el.addEventListener(eventName, _.bind(callback, context || this));
    return this;
  },

  /**
   * Fetches a cube side by name (e.g. 'top')
   * @param  {String} name The name of the side you want.
   * @return {Side}      The Side object by name.
   */
  getSide: function(name) {
    return this._sides[name];
  },

  /**
   * Updates the passed tile and all related adjacent tiles with the
   * passed callback. This method is mostly used for highlighting tiles
   * to help the user make strategy decisions easier.
   * @param  {DOMElement}   tile The selected tile as a raw DOM element.
   * @param  {Function}     callback   The method to invoke passing each tile as an argument.
   */
  updateAdjacentTiles: function(tile, callback) {

    tile.xLine.updateTiles(callback);
    tile.yLine.updateTiles(callback);

    // For each neighbor, pass in the side and the orientation id (e.g. 'left').
    _.forEach(tile.side.getNeighbors(), function(neighbor) {

      // Find the translated indicies.
      var tiles = tile.translate(neighbor);

      // Run the callback on each tile.
      _.forEach(tiles, callback);

    }, this);
  },

  updateHelperHighlight: function(tile, initialTile, callback) {

    // Get the raw neighbor sides (without their placement keys)
    // and exclude the selected side.
    var neighbors = _.without(initialTile.side.getNeighbors(), tile.side);

    _.forEach(neighbors, function(neighbor) {

      if (neighbor.isVisible(this.x, this.y)) {

        var highlightTiles = tile.translate(neighbor);

        var helperTile = _.find(highlightTiles, function(ti) {
          return ti.hasClass('highlighted');
        });

        callback(helperTile);
      }
    }, this);
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

  _buildSides: function(size) {

    // Create sides.
    var sides = _.reduce(this.el.children, function(list, el) {
      list[el.id] = new Side(el, size);
      return list;
    }, {});

    var TOP = sides['top'],
        BOTTOM = sides['bottom'],
        FRONT = sides['front'],
        BACK = sides['back'],
        LEFT = sides['left'],
        RIGHT = sides['right'];

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

// Mixin the EventEmitter methods for great justice.
// Ditch when we migrate to Browserify.
_.assign(Cube.prototype, EventEmitter2.prototype);

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
   * Reports whether or not the line is horizontal by checking the
   * index difference between two adjacent tiles.
   * @return {Boolean} Is this line horizontal?
   */
  isHorizontal: function() {
    var tiles = this.getTiles();
    return tiles[1].index === tiles[0].index + 1;
  },

  /**
   * @return {Array} A collection of tiles that compose the line.
   */
  getTiles: function() {
    return this._tiles;
  },

  updateTiles: function(callback) {
    _.each(this.getTiles(), function(tile) {
      callback(tile);
    });
  },

  /**
   * @return {Number} The number of tiles in the line.
   */
  length: function() {
    return this._tiles.length;
  },

  /**
   * @return {Array} The indicies of all the tiles.
   * NOTE: Useful? Not sure. Check usage.
   */
  indicies: function() {
    return _.map(this.getTiles(), function(tile) {
      return tile.index;
    });
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
    if (indicies) {
      return _.at(this._tiles, _.isArray(indicies) ? _.uniq(_.flatten(indicies)) : +indicies);
    }
    return this._tiles;
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
    _.each(tiles, function(tile, index) {

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

  addClass: function(name) {
    this.el.classList.add(name);
    return this;
  },

  removeClass: function(name) {
    this.el.classList.remove(name);
    return this;
  },

  hasClass: function(name) {
    return this.el.classList.contains(name);
  },

  updateLines: function(x, y) {
    this.xLine = x;
    this.yLine = y;
  },

  translate: function(toSide) {

    // A translation is a recipe for morphing one line into another.
    // It looks like this: [1, flip]
    // Where: The first index is the coordinate to use in a line pair
    //        The remaining indicies are methods to invoke on the line
    var translation = Tile.translationMap[this.side.id][toSide.id],

        // The line from the line pair to use.
        line = _.first(translation) === 'x' ? this.xLine : this.yLine;

    // Run through each translation method (flip, rotate) and return the result.
    var newLine = _.reduce(_.rest(translation), function(transformedLine, method) {
      return transformedLine[method]();
    }, line);

    return toSide.getTiles(newLine.indicies());
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

  // A collection of the tiles claimed by side.
  this._sideMap = this._buildCollection(cube);
}

CubeCache.prototype = {

  add: function(tile) {

    var side = this._getSideByTile(tile),
        index = tile.index;

    side[index] = tile;
    this._growLine(this._getXTiles(side, index));
    this._growLine(this._getYTiles(side, index));
  },

  remove: function(tile) {

    var side = this._getSideByTile(tile),
        index = tile.index;

    side[index] = null;
    this._shrinkLine(this._getXTiles(side, index));
    this._shrinkLine(this._getYTiles(side, index));
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

  _getSideByTile: function(tile) {
    return this._sideMap[tile.side.id];
  },

  _getXTiles: function(side, index) {
    var start = index - (index % this._cubeSize);
    return _.compact(_.at(side, _.range(start, start + this._cubeSize)));
  },

  _getYTiles: function(side, index) {
    var size = this._cubeSize,
        start = index % size;
    return _.compact(_.at(side, _.range(start, Math.pow(size, 2), size)));
  },

  _growLine: function(tiles) {

    var side, line;

    if (tiles.length > 1) {

      side = this._lineMap[_.first(tiles).side.id];
      line = _.find(side, function(ln) {
        return ln && ln.all(tiles);
      });

      if (line) {
        line.update(tiles);
      }
      else {
        side.push(new Line(tiles));
      }
    }
  },

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
        }

        // Otherwise, update the line with the remaining tiles.
        else {
          line.update(tiles);
        }
      }
    }
  }

};

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

  add: function(message, type) {
    var item = document.createElement('li');
    if (type) {
      item.className = type;
    }
    if (message.split(' ').length === 1) {
      message = Messages.LIST[message];
    }
    item.appendChild(document.createTextNode(message));
    this._enqueue(item);
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

  _remove: function(evt) {
    this.container.removeChild(evt.target);
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
  notNeighbor: 'Not a neighboring side! Choose a tile different side.'
};

function Player(name, tileClass, cube) {
  this.name = name;
  this.tileClass = tileClass;
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
    tile.release();
    this._cubeCache.remove(tile);
  },

  getLines: function() {
    return this._cubeCache.getLines();
  },

  getWinLines: function() {
    var size = this._cubeCache._cubeSize;
    return _.filter(this.getLines(), function(line) {
      return line.length() === size;
    });
  }

};

// Assign Bot inheritence here because Bot is getting included first.
// Need to switch to modules next go-round. For reals.
_.assign(Bot.prototype, Player.prototype);

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
}

Renderer.prototype = {

  initialize: function() {
    if (this.isMobile) {
      this._listenForTouch();
    }
    else {
      this._listenForKeyboard();
    }
  },

  draw: function() {

    // Reduce the ticks and rotate the cube
    this.tick -= this.speed;
    this.cube.rotate(this.moveX, this.moveY);

    // If there are ticks left or a key is down, keep looping.
    if (this.tick > 0 || this._setMovement()) {
      this._loop();
    }
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
    if (this.tick === 0 && this._setMovement()) {
      this._loop();
      this.cube.emit('renderstart');
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
