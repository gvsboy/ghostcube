function Cube(el) {
  this.el                     = el;
  this.style                  = this.el.style;
}

Cube.prototype = {

  rotate: function(x, y) {
    var C = Const;
    this.x = this._calculateCoordinate(this.x, x);
    this.y = this._calculateCoordinate(this.y, y);
    this.style[Vendor.JS.transform] =
      C.ROTATE_X_PREFIX + this.x + C.ROTATE_UNIT_SUFFIX + ' ' + C.ROTATE_Y_PREFIX + this.y + C.ROTATE_UNIT_SUFFIX;
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
        console.log(t);
        this._placeTile(sides[s], t, Math.random() * DELAY_MAX);
      }
    }

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
    var tile = evt.target;

    var tiles = tile.parentNode.children;


    tile.classList.add('selected');
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

  _placeTile: function(side, index, delay) {

    var DOC = document,
        DIV = 'div',
        CLASS_TILE = 'tile init',
        tile = DOC.createElement(DIV);

    tile.id = side.className + '-' + index;
    tile.className = CLASS_TILE;

    window.setTimeout(function() {
      side.appendChild(tile);
    }, delay);
  }

};
