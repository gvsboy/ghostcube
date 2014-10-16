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
    this.players = [
      new Player('Kevin', 'player1'),
      new Player('Jon', 'player2')
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
    this.currentPlayer = player;
    this.messages.add(player.name + '\'s turn!', 'alert');
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
      tile.claim(this.currentPlayer);
    }, this);

    // Remove all helpers.
    this.clearHelperTile();
    this.deselectTile(_.first(this.selectedTiles));

    // Move this out to App and implement eventing.
    this.selectedTiles = [];

    this._endTurn();
  },

  checkWin: function() {

    var winLines = [],
        size = this.cube.size,
        player = this.currentPlayer;

    // Loop through each cube side.
    _.forEach(this.cube._sides, function(side) {

      // Find all the tiles claimed by this player.
      var claimedTiles = _.filter(side.getTiles(), {claimedBy: player}),
          map;

      // If there are not enough tiles available for a line, exit immediately.
      if (claimedTiles.length < size) {
        return;
      }

      // Build an index map of the claimed tiles for faster lookup.
      map = _.times(Math.pow(size, 2), function(i) {
        return _.find(claimedTiles, {index: i});
      });

      // Check for vertical matches.
      // Inspect each starting index from 0 and leftwards.
      _.forEach(_.at(map, _.times(size)), function(tile) {
        var line;

        // If a tile exists at an index, begin searching rightwards.
        if (tile) {
          line = _.at(map, _.times(size - 1, function(i) {
            return tile.index + ((i + 1) * size);
          }));

          // Push the original tile on the line stack.
          line.push(tile);

          // If the limit is reached, the line is complete. It's a win!
          if (_.compact(line).length === size) {
            winLines.push(line);
          }
        }
      });
      
      // Check for horizontal matches.
      // Inspect each starting index from 0 and downwards.
      _.forEach(_.at(map, _.times(size, function(i) { return i * size })), function(tile) {
        var line;

        // If a tile exists at an index, begin searching rightwards.
        if (tile) {
          line = _.at(map, _.times(size - 1, function(i) {
            return tile.index + (i + 1);
          }));

          // Push the original tile on the line stack.
          line.push(tile);

          // If the limit is reached, the line is complete. It's a win!
          if (_.compact(line).length === size) {
            winLines.push(line);
          }
        }
      });

    });

    // Return the number of winning lines (or 0 if no win).
    return winLines.length;
  },

  _endTurn: function() {

    var winBy = this.checkWin(),
        player = this.currentPlayer,
        modifier;

    // If a player wins, display a message and exit.
    if (winBy) {
      modifier = winBy > 1 ? ' x' + winBy + '!' : '!';
      this.messages.add(player.name + ' wins' + modifier, 'alert');
      return;// just return for now. should set a win state.
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
        initialTile = _.first(this.selectedTiles);

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

          // If the same side was selected, display an error.
          if (tile.side === initialTile.side) {
            this.messages.add('sameSide');
          }

          // Else if the side selected is not a neighbor, display an error.
          else if (!initialTile.side.isNeighbor(tile.side)) {
            this.messages.add('notNeighbor');
          }

          // Otherwise, we're on a good side. Let's drill down further.
          else {

            // If the attack target is claimed, try another tile.
            if (this._helperTile.claimedBy) {
              this.messages.add('targetClaimed');
            }

            // Otherwise, a valid selection has been made!
            else {
              this.selectedTiles.push(tile, this._helperTile);
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

function Cube(el, size) {

  // The HTML element representing the cube.
  this.el                     = el;

  // The cube's size regarding tiles across a side. Default to 3.
  this.size                   = size || 3;

  // Cached reference to the style object.
  this.style                  = this.el.style;

  // Maps out the lines (x, y) that should be highlighted per index click.
  this._lineMap = this._buildLineMap();

  // Translates highlighted lines to different sides, normalizing the coordinate system.
  this._translationMap = this._buildTranslationMap();

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

  getLines: function(index, coordinate) {
    if (_.isNumber(coordinate)) {
      return this._lineMap[index][coordinate];
    }
    return this._lineMap[index];
  },

  /**
   * Updates the passed tile and all related adjacent tiles with the
   * passed callback. This method is mostly used for highlighting tiles
   * to help the user make strategy decisions easier.
   * @param  {DOMElement}   tile The selected tile as a raw DOM element.
   * @param  {Function}     callback   The method to invoke passing each tile as an argument.
   */
  updateAdjacentTiles: function(tile, callback) {

    // The tile's side.
    var side = tile.side,

        // The highlightable lines related to the origin tile's index.
        lines = this.getLines(tile.index);

    // Update all the appropriate tiles on the origin tile's side.
    _.forEach(side.getTiles(lines), callback);

    // For each neighbor, pass in the side and the orientation id (e.g. 'left').
    _.forEach(side.getNeighbors(), function(neighbor) {

      // Get all the translated tiles based on the origin tile and update.
      _.forEach(neighbor.getTiles(this._translate(lines, neighbor.id, side.id)), callback);

    }, this);
  },

  updateHelperHighlight: function(tile, initialTile, callback) {

    // Get the raw neighbor sides (without their placement keys)
    // and exclude the selected side.
    var neighbors = _.without(initialTile.side.getNeighbors(), tile.side);

    _.forEach(neighbors, function(neighbor) {

      if (neighbor.isVisible(this.x, this.y)) {
        var highlightTiles = neighbor.getTiles(this._translate(this.getLines(tile.index), neighbor.id, tile.side.id));
        var helperTile = _.find(highlightTiles, function(ti) {
          return ti.hasClass('highlighted');
        });
        callback(helperTile);
      }
    }, this);
  },

  // Rotate in place, like a Tetrad. For instance:
  // xoo      xxx
  // xoo  ->  ooo
  // xoo      ooo
  _rotateLine: function(line) {

    // Cache the cube size.
    var size = this.size,

        // Where the line begins, starting from top-left.
        origin = line[0],

        // Horizontal lines contain points that increment by one.
        isHorizontal = line[1] === origin + 1,

        // The transformed line.
        rotatedLine,

        indexAt;

    if (isHorizontal) {
      // The row (starting at top-right and down).
      indexAt = origin - (origin % size);
      rotatedLine = this.getLines(indexAt + (indexAt / size), 1);
    }
    else {
      // The column (starting top-right and across).
      indexAt = origin % size;
      rotatedLine = this.getLines(indexAt * size, 0);
    }

    return rotatedLine;
  },

  // Flip across a median. For instance:
  //    xoo      oox
  //    xoo  ->  oox
  //    xoo      oox
  _flipLine: function(line) {

    // Cache the cube size.
    var size = this.size,

        // Where the line begins, starting from top-left.
        origin = line[0],

        // Horizontal lines contain points that increment by one.
        isHorizontal = line[1] === origin + 1,

        // The transformed line.
        flippedLine,

        // The row or column the line is in.
        indexAt,

        // The middle line.
        middle,

        // Distance difference between the index and middle.
        diff;

    // If the line is vertical:
    if (!isHorizontal) {

      // The column (starting at top-left and across).
      indexAt = origin % size;

      // The middle column.
      middle = (size - 1) / 2;

      // Determine the difference and get the calculated y line.
      diff = middle - indexAt;
      flippedLine = this.getLines(middle + diff, 1);
    }

    // Else, the line must be horizontal:
    else {

      // The row (starting at top-right and down).
      indexAt = origin - (origin % size);

      // The middle row, which is the size squared cut in half and floored.
      // NOTE: This could be buggy with other sizes!
      middle = Math.floor((Math.pow(size, 2) / 2) - 1);

      // Determine the difference and get the calculated x line.
      diff = middle - indexAt;
      flippedLine = this.getLines(middle + diff, 0);
    }

    return flippedLine;
  },

  _translate: function(lines, id, originId) {

    var translation = this._translationMap[originId][id];

    return _.reduce(_.rest(translation), function(line, method) {
      return method(line);
    }, lines[_.first(translation)]);
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





// ------------------------------------------------------------------------------------------------------
// ---------------------------------------------- MAPPINGS ----------------------------------------------
// ------------------------------------------------------------------------------------------------------





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
  },

  _buildTranslationMap: function() {

    var flip = _.bind(this._flipLine, this),
        rotate = _.bind(this._rotateLine, this);

    // Line coordinate mapping to side id (1 = x, 0 = y)
    // follows format:
    // top
    // bottom
    // left
    // right
    return {

      front: {
        top:      [1],
        bottom:   [1],
        left:     [0],
        right:    [0]
      },

      back: {
        bottom:   [1, flip],
        top:      [1, flip],
        left:     [0],
        right:    [0]
      },

      top: {
        back:     [1, flip],
        front:    [1],
        left:     [0, rotate],
        right:    [0, flip, rotate],
      },

      bottom: {
        front:    [1],
        back:     [1, flip],
        left:     [0, flip, rotate],
        right:    [0, rotate]
      },

      left: {
        top:      [1, rotate],
        bottom:   [1, flip, rotate],
        back:     [0],
        front:    [0]
      },

      right: {
        top:      [1, flip, rotate],
        bottom:   [1, rotate],
        front:    [0],
        back:     [0]
      }
    };
  },

  _buildLineMap: function() {

    // Loop through each tile index and calculate the two rows (x, y) each one generates.
    // Base it on the size (3 tiles, 4 tiles, etc.)
    var size = this.size;

    // For each index, generate the x and y lines that should be highlighted.
    return _.times(Math.pow(size, 2), function(i) {

      // Holds two arrays: x tiles and y tiles
      var lines = [],

          // Starting at the left, how far are we down x-wise?
          mod = i % size,

          // We want to start at top left.
          xStart = i - mod,
          yStart = mod;

      // Collect the x line, left to right.
      lines.push(_.times(size, function(x) {
        return xStart + x;
      })),

      // Collect the y line, top to bottom.
      lines.push(_.times(size, function(y) {
        return yStart + (y * size);
      }));

      // Return this tile config.
      return lines;
    });
  }

};

// Mixin the EventEmitter methods for great justice.
// Ditch when we migrate to Browserify.
_.assign(Cube.prototype, EventEmitter2.prototype);

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
  targetClaimed: 'The attack target is already claimed!',
  sameSide: 'Same side! Choose a tile on a different side.',
  notNeighbor: 'Not a neighboring side! Choose a tile different side.'
};

function Player(name, tileClass) {
  this.name = name;
  this.tileClass = tileClass;
}

Player.prototype = {

};

function Renderer(cube, isMobile) {

  // A reference to the game cube.
  this.cube = cube;

  // The keyboard interface for desktop interactions.
  this.keyboard = null;

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

    // Only account for desktop experiences for now.
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
    this.keyboard.listen(window, this._keyboardListener.bind(this));
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

  _loop: function() {
    window.requestAnimationFrame(this.draw.bind(this));
  },

  _keyboardListener: function() {
    if (this.tick === 0 && this._setMovement()) {
      this._loop();
      this.cube.emit('renderstart');
    }
  },

  _setMovement: function() {

    var KB = Keyboard,
        keys = this.keyboard.keys;

    // reset movex and movey
    this.moveX = this.moveY = 0;

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

    // If there is movement, set tick and return true.
    if (this.moveX !== 0 || this.moveY !== 0) {
      this.tick = this.tickMax;
      return true;
    }

    // Movement was not set.
    return false;
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

    var DELAY_MAX = 2000,
        numberOfTiles = Math.pow(size, 2);

    return _.times(numberOfTiles, function(index) {
      return this._placeTile(index, Math.random() * DELAY_MAX);
    }, this);
  },

  _placeTile: function(index, delay) {

    var tile = new Tile(this, index);

    window.setTimeout(function() {
      tile.addClass('init');
    }, delay);

    return tile;
  }

};

function Tile(side, index) {

  // Set properties.
  this.el = this.build(side.id + '-' + index);
  this.side = side;
  this.index = index;

  this.claimedBy = null;

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
    //el.appendChild(document.createTextNode(idData[0].slice(0, 2) + idData[1]));

    return el;
  },

  claim: function(player) {
    this.claimedBy = player;
    this.addClass('claimed');
    this.addClass(player.tileClass);
  },

  addClass: function(name) {
    this.el.classList.add(name);
  },

  removeClass: function(name) {
    this.el.classList.remove(name);
  },

  hasClass: function(name) {
    return this.el.classList.contains(name);
  }

};

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

      TRANSFORM = 'transform',

      // Prefixes used for things like Transform.
      STYLE_PREFIXES = ['ms', 'O', 'Moz', 'Webkit', ''],

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
