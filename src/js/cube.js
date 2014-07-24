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
