function App(containerId) {
  this.container = document.getElementById(containerId);
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);
  this.rendering = false;
  this.listen();
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

    var KB = Keyboard,
        keys = this.keyboard.keys,
        moveX = 0,
        moveY = 0;

    // Detect either up or down movement.
    if (keys[KB.UP] || keys[KB.W]) {
      moveX = Const.CUBE_SPEED;
    }
    else if (keys[KB.DOWN] || keys[KB.S]) {
      moveX = -Const.CUBE_SPEED;
    }

    // Detect either left or right movement.
    if (keys[KB.LEFT] || keys[KB.A]) {
      moveY = -Const.CUBE_SPEED;
    }
    else if (keys[KB.RIGHT] || keys[KB.D]) {
      moveY = Const.CUBE_SPEED;
    }

    this.cube.rotate(moveX, moveY);

    if (this.rendering) {
      window.requestAnimationFrame(this.render.bind(this));
    }
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
    if (this.keyboard.isAnyKeyDown()) {
      if (!this.rendering) {
        this.rendering = true;
        window.requestAnimationFrame(this.render.bind(this));
      }
    }
    else {
      this.rendering = false;
    }
  }

};

var Const = {

  // Game Logic
  CUBE_SPEED: 5,

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
  // A friendly map containing all the highlighted tiles per index click.
  // (Flattened, uniq version of lineMap.)
  this._highlightMap = this._buildHighlightMap(this._lineMap);

  // This will be set in beginGame.
  this.sides = null;

  console.log(this._lineMap);
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
    this.sides = this._buildSides(this.size);

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
          self.x = 123;//TODO: make dynamic http://css-tricks.com/get-value-of-css-rotation-through-javascript/
          self.y = 123;//TODO: make dynamic

          // Begin listening for tile clicks.
          el.addEventListener('click', self.selectTile.bind(self));

          el.dispatchEvent(new Event('init'));
        }
      });
    });

  },

  selectTile: function(evt) {

    var tile = evt.target,
        data = tile.id.split('-'),
        side = this.sides[data[0]];
        tiles = side.tiles,
        index = data[1];

    console.log(tile);
    console.log(index);

    // ALL THIS TOGGLING IS NOT PERFECT.
    // Should not toggle, just reset with every click?
    tile.classList.toggle('selected');

    // Find all the tiles that should be highlighted.
    var highlightedIndicies = this._highlightMap[index];

    // Loop through the indicies highlight each tile.
    _.forEach(highlightedIndicies, function(i) {
      tiles[i].toggleClass('highlighted');
    });


    

    // Get the line map for highlighting in neighbors.
    var lines = this._lineMap[index];

    // Now let's do something with the neighboring sides.
    console.log('side id: -----', side.id, side.neighbors);
    console.log('line map:', lines);

    _.forIn(side.neighbors, function(neighbor, id) {
      var tiles = neighbor.tiles,
          indicies = this._translate(side.id, lines, id);

      _.forEach(indicies, function(i) {
        tiles[i].toggleClass('highlighted');
      });
    }, this);

  },

  // Rotate in place, like a Tetrad. For instance:
  // xoo      ooo
  // xoo  ->  xxx
  // xoo      ooo
  _rotateLine: function(line) {

  },

  // Flip across a median. For instance:
  //    xoo      oox
  //    xoo  ->  oox
  //    xoo      oox
  _flipLine: function(line) {

    var size = this.size,
        middle = (size - 1) / 2,
        isHorizontal = line[1] === line[0] + 1,
        flippedLine;

    console.log('line:', line);

    if (!isHorizontal) {
      var indexAt = line[0] % size;
      var diff = middle - indexAt;
      /*
      console.log('middle:', middle);
      console.log('diff:', diff);
      console.log('indexAt:', indexAt);
      */
      flippedLine = this._lineMap[middle + diff][1];
    }
    console.log('isHorizontal:', isHorizontal, flippedLine);

    return flippedLine;
  },

  _translate: function(sideId, lines, id) {

    // Line coordinate mapping to side id (1 = x, 0 = y)
    var coorMap = {

          // Side id and nested neighbor positions

          // FRONT testing: PERFECT!!!
          front: {
            top: 1,
            bottom: 1,
            left: 0,
            right: 0
          },

          // BACK testing: PERFECT!!!
          back: {
            top: [1],
            bottom: [1],
            left: 0,
            right: 0
          },

          // TOP testing:
          top: {
            top: 1,
            bottom: 1,
            left: 1,
            right: 1
          },

          // BOTTOM testing:
          bottom: {
            top: 1,
            bottom: [1],
            left: [1],
            right: [1]
          },

          // LEFT testing:
          left: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          },

          // RIGHT testing:
          right: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }
        };

    var index = coorMap[sideId][id],
        line;

    if (_.isArray(index)) {
      line = this._flipLine(lines[index[0]]);
    }
    else {

      line = lines[index];
    }

    return line;
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
    else if (result < Const.ORIGIN) {
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

  _buildHighlightMap: function(lineMap) {

    // Boil down a simple highlight map for each tile based on the line map.
    // We'll flatten and uniq the line map for each tile.
    return this._highlightMap = _.reduce(lineMap, function(map, lines) {
      map.push(_.uniq(_.flatten(lines)));
      return map;
    }, []);
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

  // An array of all the tiles by index.
  this.tiles = this._buildTiles(size);

  // This will be set using setNeighbors().
  this.neighbors = {};
}

Side.prototype = {

  setNeighbors: function(sides) {
    this.neighbors = sides;
  },

  _buildTiles: function(size) {

    var DELAY_MAX = 2000,
        numberOfTiles = Math.pow(size, 2);

    return _.times(numberOfTiles, function(index) {
      return this._placeTile(index, Math.random() * DELAY_MAX);
    }, this);
  },

  _placeTile: function(index, delay) {

    var tile = new Tile(this.id + '-' + index);
    this.el.appendChild(tile.el);

    window.setTimeout(function() {
      tile.addClass('init');
    }, delay);

    return tile;
  }

};

function Tile(id) {
  this.el = this.build(id);
  this._classList = this.el.classList;
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

  addClass: function(name) {
    this._classList.add(name);
  },

  removeClass: function(name) {
    this._classList.remove(name);
  },

  toggleClass: function(name) {
    this._classList.toggle(name);
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
