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
        container.removeEventListener(Vendor.animationEndEvent, beginGame);
        cube.beginGame();
      }
    }

    function cubeClicked() {
      cubeEl.classList.remove('init');
      cubeEl.removeEventListener('click', cubeClicked);
      container.classList.add('game');
      container.addEventListener(Vendor.animationEndEvent, beginGame);
    }

    function gameStarted() {
      self.keyboard = new Keyboard([
        Keyboard.UP,
        Keyboard.DOWN,
        Keyboard.LEFT,
        Keyboard.RIGHT,
        Keyboard.W,
        Keyboard.A,
        Keyboard.S,
        Keyboard.D
      ]);
      self.keyboard.listen(window, self._keyboardListener.bind(self));
    }

    cubeEl.addEventListener('click', cubeClicked);
    cubeEl.addEventListener('start', gameStarted);
  },

  render: function() {
    console.log('rendering');
    if (this.rendering) {
      window.requestAnimationFrame(this.render.bind(this));
    }
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
  TRANSFORM: 'Transform',
  ROTATE_X_PREFIX: 'rotateX(',
  ROTATE_Y_PREFIX: 'rotateY(',
  ROTATE_UNIT_SUFFIX: 'deg)',
  REVOLUTION: 360
};

function Cube(el) {
  this.el                     = el;
  this.style                  = this.el.style;
  this.transformProperty      = Vendor.stylePrefix + Const.TRANSFORM;
}

Cube.prototype = {

  rotate: function(x, y) {
    var C = Const;
    this.style[this.transformProperty] =
      C.ROTATE_X_PREFIX + x + C.ROTATE_UNIT_SUFFIX + ' ' + C.ROTATE_Y_PREFIX + y + C.ROTATE_UNIT_SUFFIX;
  },

  beginGame: function(size) {

    var DELAY_MAX = 2000,
        tiles = Math.pow(size || 3, 2),
        sides = this.el.children,
        len = sides.length,
        s = 0,
        t;

    // Loop through each side to place tiles.
    for (s; s < len; s++) {
      for (t = 0; t < tiles; t++) {
        this._placeTile(sides[s], Math.random() * DELAY_MAX);
      }
    }

    // Initialize the game.
    // Slow down the cube to a stop, display instructions.
    var el = this.el;
    this.el.addEventListener('animationiteration', function() {
      el.classList.add('start');
      el.dispatchEvent(new Event('start'));
    });
  },

  _placeTile: function(side, delay) {

    var DOC = document,
        DIV = 'div',
        CLASS_TILE = 'tile',
        tile = DOC.createElement(DIV);

    tile.className = CLASS_TILE;
    window.setTimeout(function() {
      side.appendChild(tile);
    }, delay);
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

(function(win) {

  var style = document.body.style,

      // Prefixes used for things like Transform.
      stylePrefixes = ['ms', 'O', 'Moz', 'Webkit', ''],

      // Animation end events. Not quite perfect as IE10+
      // actually uses 'animation' -> 'MSAnimationEnd'
      // I'll fix this later.
      // So ridiculous. Can't these be consistent?!
      eventEndMap = {
        'animation': 'animationend',
        '-o-animation': 'oAnimationEnd',
        '-moz-animation': 'animationend',
        '-webkit-animation': 'webkitAnimationEnd'
      },

      msAnimationEnd = 'MSAnimationEnd',
      
      len = stylePrefixes.length,

      animationProperty,

      vendor = {};

  // First, let's determine the style prefix.
  while (len--) {
    if ((stylePrefixes[len] + Const.TRANSFORM) in style) {
      vendor.stylePrefix = stylePrefixes[len];
      break;
    }
  }

  // Now, let's determine the event end name. So messed up.
  for (animationProperty in eventEndMap) {
    if (typeof style[animationProperty] !== 'undefined') {
      vendor.animationEndEvent = eventEndMap[animationProperty];
      break;
    }
  }

  // Normalize requestAnimationFrame for cross-browser compatibility.
  win.requestAnimationFrame = win.requestAnimationFrame || win.mozRequestAnimationFrame || win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;    

  // Set the global Vendor variable.
  win.Vendor = vendor;

}(window));
