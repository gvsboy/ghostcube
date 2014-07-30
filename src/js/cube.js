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

  initialize: function() {
    this.el.classList.add('start');
  },

  beginGame: function(size) {

    var DELAY_MAX = 1000,
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
    window.setTimeout(this.initialize.bind(this), DELAY_MAX);
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
