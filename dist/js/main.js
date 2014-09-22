function App(containerId) {
  this.container = document.getElementById(containerId);
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);
  this.rendering = false;
  this.listen();

  // crap
  this.moveX;
  this.moveY;
  this.moveCount = 0;
}

App.prototype = {

  // I hate everything in here but it's ok for now.
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
        cube.beginGame();
      }
    }

    function cubeClicked() {
      cubeEl.classList.remove('splash');
      cubeEl.removeEventListener('click', cubeClicked);
      container.classList.add('game');
      container.addEventListener(Vendor.EVENT.animationEnd, beginGame);
    }

    function gameInitialized() {
      self._attachKeyboard();
    }

    cubeEl.addEventListener('click', cubeClicked);
    cubeEl.addEventListener('init', gameInitialized);
  },

  render: function() {

    this.moveCount -= Const.CUBE_SPEED;
    this.cube.rotate(this.moveX, this.moveY);

    if (this.moveCount > 0 || this._setMovement()) {
      this._loop();
    }
  },

  _loop: function() {
    window.requestAnimationFrame(this.render.bind(this));
  },

  _attachKeyboard: function() {
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
    this.keyboard.listen(window, this._keyboardListener.bind(this));
  },

  _keyboardListener: function() {
    if (this.moveCount === 0 && this._setMovement()) {
      this._loop();
    }
  },

  _setMovement: function() {

    var KB = Keyboard,
        keys = this.keyboard.keys;

    // reset movex and movey
    this.moveX = this.moveY = 0;

    // Detect either up or down movement.
    if (keys[KB.UP] || keys[KB.W]) {
      this.moveX = Const.CUBE_SPEED;
    }
    else if (keys[KB.DOWN] || keys[KB.S]) {
      this.moveX = -Const.CUBE_SPEED;
    }

    // Detect either left or right movement.
    if (keys[KB.LEFT] || keys[KB.A]) {
      this.moveY = Const.CUBE_SPEED;
    }
    else if (keys[KB.RIGHT] || keys[KB.D]) {
      this.moveY = -Const.CUBE_SPEED;
    }

    // If there is movement, set moveCount and return true.
    if (this.moveX !== 0 || this.moveY !== 0) {
      this.moveCount = Const.CUBE_MOVE_UNIT;
      return true;
    }

    // Movement was not set.
    return false;
  }

};

var Const = {

  // Game Logic
  CUBE_SPEED: 5,
  CUBE_MOVE_UNIT: 90,

  // Display
  TRANSFORM: 'Transform',
  ROTATE_X_PREFIX: 'rotateX(',
  ROTATE_Y_PREFIX: 'rotateY(',
  ROTATE_UNIT_SUFFIX: 'deg)',
  REVOLUTION: 360,
  ORIGIN: 0
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

  // The three selected tiles to place pieces on.
  this.selectedTiles = [];

  console.log('linemap:', this._lineMap);
}

Cube.prototype = {

  rotate: function(x, y) {
    var C = Const;
    this.x = this._calculateCoordinate(this.x, x);
    this.y = this._calculateCoordinate(this.y, y);

    this.style[Vendor.JS.transform] =
      C.ROTATE_X_PREFIX + this.x + C.ROTATE_UNIT_SUFFIX + ' ' + C.ROTATE_Y_PREFIX + this.y + C.ROTATE_UNIT_SUFFIX;
  },

  beginGame: function() {

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
          el.classList.remove('transition');
          el.classList.add('init');
          self.x = 315;//TODO: make dynamic http://css-tricks.com/get-value-of-css-rotation-through-javascript/
          self.y = 315;//TODO: make dynamic

          // Listen for tile clicks.
          el.addEventListener('click', _.bind(self._handleClick, self));

          // Listen for mouseovers.
          el.addEventListener('mouseover', _.bind(self._handleMouseOver, self));

          // ...and mouseouts.
          el.addEventListener('mouseout', _.bind(self._handleMouseOut, self));

          // Let's go!
          el.dispatchEvent(new Event('init'));
        }
      });
    });

  },

  /**
   * Fetches a cube side by name (e.g. 'top')
   * @param  {String} name The name of the side you want.
   * @return {Side}      The Side object by name.
   */
  getSide: function(name) {
    return this._sides[name];
  },

  selectTile: function(tile) {
    tile.addClass('selected');
    this.selectedTiles.push(tile);
    this._updateAdjacentTiles(tile, function(tile) {
      tile.addClass('highlighted');
    });
  },

  deselectTile: function(tile) {
    tile.removeClass('selected');
    _.pull(this.selectedTiles, tile);
    this._updateAdjacentTiles(tile, function(tile) {
      tile.removeClass('highlighted');
    });
  },

  /**
   * Updates the passed tile and all related adjacent tiles with the
   * passed callback. This method is mostly used for highlighting tiles
   * to help the user make strategy decisions easier.
   * @param  {DOMElement}   tile The selected tile as a raw DOM element.
   * @param  {Function}     callback   The method to invoke passing each tile as an argument.
   */
  _updateAdjacentTiles: function(tile, callback) {

    // The tile's side.
    var side = tile.side,

        // The highlightable lines related to the origin tile's index.
        lines = this._lineMap[tile.index];

    // Update all the appropriate tiles on the origin tile's side.
    _.forEach(side.getTiles(lines), callback);

    // For each neighbor, pass in the side and the orientation id (e.g. 'left').
    _.forIn(side.neighbors, function(neighbor, id) {

      // Get all the translated tiles based on the origin tile and update.
      _.forEach(neighbor.getTiles(this._translate(lines, id, side.id)), callback);

    }, this);
  },

  _getTileFromElement: function(el) {
    var data;
    if (el.classList.contains('tile')) {
      data = el.id.split('-');
      return this.getSide(data[0]).getTiles(data[1])[0];
    }
    return null;
  },

  _handleClick: function(evt) {

    // Get the target element from the event.
    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = _.first(this.selectedTiles);

    // If the target is a tile, let's figure out what to do with it.
    if (tile) {

      // If nothing has been selected yet, select the tile normally.
      if (!initialTile) {
        this.selectTile(tile);
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
            console.log('Same side! Choose a tile on a different side.');
          }

          // Else if the side selected is not a neighbor, display an error.
          else if (!initialTile.side.isNeighbor(tile.side)) {
            console.log('Not a neighboring side! Choose a tile different side.');
          }

          // Otherwise, we're on a good side. Let's drill down further.
          else {
            console.log('cool');
          }
        }
      }
    };
  },

  _handleMouseOver: function(evt) {

    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = _.first(this.selectedTiles);

    if (tile) {

      // If a tile has been selected already, let's try to highlight a tile
      // for targeting help.
      if (initialTile) {

        // If the user is hovering on a neighboring side of the initial tile,
        // highlight some targeting help on a visible side.
        if (initialTile.side.isNeighbor(tile.side)) {

        }


      }
    }
  },

  _handleMouseOut: function(evt) {
    //console.log('out  ~~~', evt.target);
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
      rotatedLine = this._lineMap[indexAt + (indexAt / size)][1];
    }
    else {
      // The column (starting top-right and across).
      indexAt = origin % size;
      rotatedLine = this._lineMap[indexAt * size][0];
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
      flippedLine = this._lineMap[middle + diff][1];
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
      flippedLine = this._lineMap[middle + diff][0];
    }

    //console.log('isHorizontal:', isHorizontal, flippedLine);
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

    var REVOLUTION = Const.REVOLUTION,
        result = current + difference;

    if (result > REVOLUTION) {
      result = result - REVOLUTION;
    }
    else if (result <= Const.ORIGIN) {
      result = REVOLUTION - result;
    }

    return result;
  },



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
      top: {
        top: BACK,
        bottom: FRONT,
        left: LEFT,
        right: RIGHT
      },
      bottom: {
        top: FRONT,
        bottom: BACK,
        left: LEFT,
        right: RIGHT
      },
      front: {
        top: TOP,
        bottom: BOTTOM,
        left: LEFT,
        right: RIGHT
      },
      back: {
        top: BOTTOM,
        bottom: TOP,
        left: LEFT,
        right: RIGHT
      },
      left: {
        top: TOP,
        bottom: BOTTOM,
        left: BACK,
        right: FRONT
      },
      right: {
        top: TOP,
        bottom: BOTTOM,
        left: FRONT,
        right: BACK
      }
    };

    // Now set the neighbors for each side.
    return _.forIn(sides, function(side) {
      side.setNeighbors(neighborMap[side.id]);
    });
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
  },

  _buildTranslationMap: function() {

    var flip = _.bind(this._flipLine, this),
        rotate = _.bind(this._rotateLine, this);

    // Line coordinate mapping to side id (1 = x, 0 = y)
    return {

      front: {
        top:      [1],
        bottom:   [1],
        left:     [0],
        right:    [0]
      },

      back: {
        top:      [1, flip],
        bottom:   [1, flip],
        left:     [0],
        right:    [0]
      },

      top: {
        top:      [1, flip],
        bottom:   [1],
        left:     [0, rotate],
        right:    [0, flip, rotate],
      },

      bottom: {
        top:      [1],
        bottom:   [1, flip],
        left:     [0, flip, rotate],
        right:    [0, rotate]
      },

      left: {
        top:      [1, rotate],
        bottom:   [1, flip, rotate],
        left:     [0],
        right:    [0]
      },

      right: {
        top:      [1, flip, rotate],
        bottom:   [1, rotate],
        left:     [0],
        right:    [0]
      }
    };
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

  },

  isAnyKeyDown: function() {
    var keys = this.keys,
        key;
    for (key in keys) {
      if (keys[key]) {
        return true;
      }
    }
    return false;
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

function Side(el, size) {

  // HTML element representing the side.
  this.el = el;

  // The face id (top, bottom, front, back, left, right).
  this.id = el.id;

  // This will be set using setNeighbors().
  this.neighbors = {};

  // An array of all the tiles by index.
  this._tiles = this._buildTiles(size);
}

Side.prototype = {

  setNeighbors: function(sides) {
    this.neighbors = sides;
  },

  /**
   * A check to determine if the passed side is one of this side's neighbors.
   * @param  {Side}  side The side object to check.
   * @return {Boolean}      Is the passed side a neighbor?
   */
  isNeighbor: function(side) {
    return _.contains(this.neighbors, side);
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

  addClass: function(name) {
    this.el.classList.add(name);
  },

  removeClass: function(name) {
    this.el.classList.remove(name);
  }

};

(function(win) {

  var STYLE = document.body.style,

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
    if ((STYLE_PREFIXES[len] + Const.TRANSFORM) in STYLE) {
      stylePrefix = STYLE_PREFIXES[len];
      break;
    }
  }

  // Next, let's set some properties using the prefix.
  vendor.JS.transform = stylePrefix + Const.TRANSFORM;
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
