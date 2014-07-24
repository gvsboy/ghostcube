function App(containerId) {
  this.container = document.getElementById(containerId);
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);
  this.listen();
  this._startRendering();
}

App.prototype = {

  // I hate everything in here but it's ok for now.
  listen: function() {

    var cube = this.cube,
        cubeEl = cube.el,
        container = this.container;

    function beginGame(evt) {
      // Every animated cube face will bubble up their animation events
      // so let's react to only one of them.
      if (evt.target === container) {
        container.removeEventListener('animationend', beginGame);
        cube.beginGame();
      }
    }

    function cubeClicked() {
      cubeEl.classList.remove('init');
      cubeEl.removeEventListener('click', cubeClicked);
      container.classList.add('game');
      container.addEventListener('animationend', beginGame);
    }

    cubeEl.addEventListener('click', cubeClicked);
  },

  render: function() {
    var tick = this.tick++;
    if (tick === Const.REVOLUTION) {
      this.tick = 0;
    }
    this.cube.rotate(tick, tick);
  },

  _startRendering: function() {
    this.tick = 0;
    this.timer = window.setInterval(this.render.bind(this), 10);
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
  this.stylePrefix            = Util.getVendorPrefix();
  this.transformProperty      = this.stylePrefix + Const.TRANSFORM;
}

Cube.prototype = {

  rotate: function(x, y) {
    var C = Const;
    this.style[this.transformProperty] =
      C.ROTATE_X_PREFIX + x + C.ROTATE_UNIT_SUFFIX + ' ' + C.ROTATE_Y_PREFIX + y + C.ROTATE_UNIT_SUFFIX;
  },

  beginGame: function(size) {

    var DELAY_MAX = 1000,
        tiles = Math.pow(size || 3, 2),
        sides = this.el.children,
        len = sides.length,
        s = 0,
        t;

    for (s; s < len; s++) {
      for (t = 0; t < tiles; t++) {
        this._placeTile(sides[s], Math.random() * DELAY_MAX);
      }
    }
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

var Util = {

  getVendorPrefix: function() {

    var style = document.body.style,
        prefixes = ['ms', 'O', 'Moz', 'Webkit', ''],
        prefix;

    while (prefixes.length) {
      prefix = prefixes.pop();
      if ((prefix + Const.TRANSFORM) in style) {
        return prefix;
      }
    }

    return '';
  },

  requestAnimationFrame: (function(win) {
    return win.requestAnimationFrame || win.mozRequestAnimationFrame || win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;
  }(window))

};
