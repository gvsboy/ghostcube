function Cube(id) {
  this.container              = document.getElementById(id);
  this.el                     = this.container.getElementsByClassName('cube')[0];
  this.style                  = this.el.style;
  this.stylePrefix            = Util.getVendorPrefix();
  this.transformProperty      = this.stylePrefix + Const.TRANSFORM;

  this.init();
}

Cube.prototype = {

  init: function() {

    var container = this.container,
        el = this.el,
        self = this;

    this.tick = 0;
    this.timer = window.setInterval(this._rotateContinuously.bind(this), 10);

    el.addEventListener('click', function() {
      container.classList.add('game');
      el.classList.remove('init');
      container.addEventListener('animationend', function(evt) {

        // Every animated cube face will bubble up their animation events
        // so let's react to only one of them.
        if (evt.target === container) {
          console.log('done');
          self._buildGameTiles();
        }
      });
    });
  },

  rotate: function(x, y) {
    var C = Const;
    this.style[this.transformProperty] =
      C.ROTATE_X_PREFIX + x + C.ROTATE_UNIT_SUFFIX + ' ' + C.ROTATE_Y_PREFIX + y + C.ROTATE_UNIT_SUFFIX;
  },

  _rotateContinuously: function() {
    var tick = this.tick++;
    if (tick === Const.REVOLUTION) {
      this.tick = 0;
    }
    this.rotate(tick, tick);
  },

  _buildGameTiles: function(size) {

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
