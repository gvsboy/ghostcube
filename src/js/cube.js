function Cube(el) {
  this.el                     = el;
  this.style                  = this.el.style;

  // Should go somewhere else.
  this._lineMap = this._buildLineMap();
  this._highlightMap = this._buildHighlightMap(this._lineMap);
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

    var tile = evt.target,
        tiles = tile.parentNode.children,
        index = [].indexOf.call(tiles, tile);

    console.log(index);
    tile.classList.add('selected');

    // Find all the tiles that should be highlighted.
    var highlightedIndicies = this._highlightMap[index];

    // Loop through the indicies and do stuff.
    _.forEach(highlightedIndicies, function(i) {

      // Highlight the tiles that are not 'selected'.
      var hTile = tiles[i];
      if (tile !== hTile) {
        hTile.classList.add('highlighted');
      }
    });

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

  _getSideClass: function(face) {
    return face.className.match(/\bside\-[a-z]*\b/g)[0];
  },

  _placeTile: function(side, index, delay) {

    var DOC = document,
        DIV = 'div',
        CLASS_TILE = 'tile',
        tile = DOC.createElement(DIV);

    tile.id = this._getSideClass(side) + '-' + index;
    tile.className = CLASS_TILE;
    side.appendChild(tile);

    window.setTimeout(function() {
      tile.classList.add('init');
    }, delay);
  },

  _buildLineMap: function() {

    // Loop through each tile index and calculate the two rows (x, y) each one generates.
    // Base it on the size (3 tiles, 4 tiles, etc.)
    var size = 3; // Our faces are 3x3.

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
