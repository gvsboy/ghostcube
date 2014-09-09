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
        side = this.sides[tile.parentNode.id];
        tiles = side.tiles,
        index = tiles.indexOf(tile);

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


    

    // Get the line map for highlighting in neighbors.
    var lines = this._lineMap[index];

    // Now let's do something with the neighboring sides.
    console.log('side id: -----', side.id, side.neighbors);
    console.log('line map:', lines);

    _.forIn(side.neighbors, function(neighbor, id) {
      var tiles = neighbor.tiles,
          indicies = this._translate(side.id, lines, id);

      _.forEach(indicies, function(i) {
        tiles[i].classList.add('highlighted');
      });
    }, this);


  },

  _flipLine: function(line) {

    var size = this.size,
        middle = (size - 1) / 2,
        isHorizontal = line[1] === line[0] + 1,
        flippedLine;

    if (!isHorizontal) {
      var indexAt = line[0] % size;
      var diff = middle - indexAt;
      console.log('middle:', middle);
      console.log('diff:', diff);
      console.log('indexAt:', indexAt);
      flippedLine = this._lineMap[middle + diff][1];
    }
    console.log(isHorizontal, flippedLine);

    return flippedLine;
  },

  _translate: function(sideId, lines, id) {

    // Line coordinate mapping to side id (1 = x, 0 = y)
    var coorMap = {
          // Side id and nested neighbor positions
          front: {
            top: 1,
            bottom: 1,
            left: 0,
            right: 0
          },
          back: {
            top: 1,
            bottom: 1,
            left: 0,
            right: 0
          },
          top: {
            top: 1,
            bottom: 1,
            left: 1,
            right: 1
          },
          bottom: {
            top: 1,
            bottom: [1],
            left: [1],
            right: 1
          },
          left: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          },
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
