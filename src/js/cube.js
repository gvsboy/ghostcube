function Cube(el, size) {

  // The HTML element representing the cube.
  this.el                     = el;

  // The cube's size regarding tiles across a side. Default to 3.
  this.size                   = size || 3;

  // Cached reference to the style object.
  this.style                  = this.el.style;

  // Maps out the lines (x, y) that should be highlighted per index click.
  this._lineMap = this._buildLineMap();

  // This will be set in beginGame.
  this.sides = null;

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
          el.addEventListener('click', self._handleCubeClick.bind(self));

          el.dispatchEvent(new Event('init'));
        }
      });
    });

  },

  selectTile: function(tile) {
    tile.classList.add('selected');
    this.selectedTiles.push(tile);
    this._updateAdjacentTiles(tile, function(tile) {
      tile.addClass('highlighted');
    });
  },

  deselectTile: function(tile) {
    tile.classList.remove('selected');
    _.pull(this.selectedTiles, tile);
    this._updateAdjacentTiles(tile, function(tile) {
      tile.removeClass('highlighted');
    });
  },

  /**
   * Detemines whether or not the passed element is a tile.
   * @param  {DOMElement}  el The element to validate.
   * @return {Boolean}    Is the element a tile?
   */
  isTile: function(el) {
    return el.classList.contains('tile');
  },

  /**
   * Fetches specific tiles for a side by the passed indicies.
   * @param  {Side} side     The side to fetch the tiles from.
   * @param  {Number[]} indicies An array of indicies.
   * @return {Tile[]}          An array of selected tiles.
   */
  getTiles: function(side, indicies) {
    return _.at(side.tiles, _.uniq(_.flatten(indicies)));
  },

  /**
   * Updates the passed tile and all related adjacent tiles with the
   * passed callback. This method is mostly used for highlighting tiles
   * to help the user make strategy decisions easier.
   * @param  {DOMElement}   originTile The selected tile as a raw DOM element.
   * @param  {Function}     callback   The method to invoke passing each tile as an argument.
   */
  _updateAdjacentTiles: function(originTile, callback) {

    // An array containing the origin tile's side's orientation id and index.
    // (e.g. ['bottom', 4])
    var data = originTile.id.split('-'),

        // The side's orientation id.
        originId = data[0],

        // The tile's index.
        index = data[1],

        // The side object containing the origin tile.
        side = this.sides[originId],

        // The highlightable lines related to the origin tile's index.
        lines = this._lineMap[index];

    // Update all the appropriate tiles on the origin tile's side.
    _.forEach(this.getTiles(side, lines), callback);

    // For each neighbor, pass in the side and the orientation id (e.g. 'left').
    _.forIn(side.neighbors, function(neighbor, id) {

      // Get all the translated tiles based on the origin tile and update.
      _.forEach(this.getTiles(neighbor, this._translate(lines, id, originId)), callback);

    }, this);
  },

  _handleCubeClick: function(evt) {

    // Get the target element from the event.
    var target = evt.target,
        selectedTiles = this.selectedTiles;

    // If the target is a tile, let's figure out what to do with it.
    if (this.isTile(target)) {

      // If nothing has been selected yet, select the tile normally.
      if (_.isEmpty(selectedTiles)) {
        this.selectTile(target);
      }

      // Else, if there's one selected tile already, either unselect it
      // if it's the target or try to make a match.
      else if (selectedTiles.length === 1) {
        if (target === _.first(selectedTiles)) {
          this.deselectTile(target);
        }
      }
    };
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
      console.log('HORIZONTAL rotateLine index:', indexAt);
    }

    else {
      indexAt = origin % size;
      console.log('VERTICAL rotateLine index:', indexAt);
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

    // Line coordinate mapping to side id (1 = x, 0 = y)
    var coorMap = {

          // Side id and nested neighbor positions
          // [id, flip, rotate]
          // [1, true, false]

          // FRONT testing:     PERFECT!!!
          front: {
            top: 1,
            bottom: 1,
            left: 0,
            right: 0
          },

          // BACK testing:      PERFECT!!!
          back: {
            top: [1, true],
            bottom: [1, true],
            left: 0,
            right: 0
          },

          // TOP testing:       PERFECT!!!
          top: {
            top: [1, true],
            bottom: 1,
            left: [0, false, true],
            right: [0, true, true],
          },

          // BOTTOM testing:    PERFECT!!!
          bottom: {
            top: 1,
            bottom: [1, true],
            left: [0, true, true],
            right: [0, false, true]
          },

          // LEFT testing:      PERFECT!!!
          left: {
            top: [1, false, true],
            bottom: [1, true, true],
            left: 0,
            right: 0
          },

          // RIGHT testing:     TOP and BOTTOM need rotation
          right: {
            top: [1, true, true],
            bottom: [1, false, true],
            left: 0,
            right: 0
          }
        };

    var index = coorMap[originId][id],
        line;

    if (_.isArray(index)) {
      if (index[1] === true) {
        line = this._flipLine(lines[index[0]]);
      }
      if (index[2] === true) {
        line = this._rotateLine(line ? line : lines[index[0]]);
      }
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


  /**
   * THIS IS DEPRECIATED!
   * I'll keep it in case I need it later.
   * I'm famous for premature trashing.
   */
  _buildHighlightMap: function(lineMap) {
    // Boil down a simple highlight map for each tile based on the line map.
    // We'll flatten and uniq the line map for each tile.
    return _.reduce(lineMap, function(map, lines) {
      map.push(_.uniq(_.flatten(lines)));
      return map;
    }, []);
  }

};
