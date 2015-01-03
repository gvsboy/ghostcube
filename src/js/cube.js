function Cube(el, size) {

  // The HTML element representing the cube.
  this.el                     = el;

  // The cube's size regarding tiles across a side. Default to 3.
  this.size                   = size || 3;

  // Cached reference to the style object.
  this.style                  = this.el.style;

  // Translates highlighted lines to different sides, normalizing the coordinate system.
  this._translationMap = this._buildTranslationMap();

  // This will be set in beginGame.
  this._sides = null;

  // EventEmitter constructor call.
  EventEmitter2.call(this);
}

Cube.ROTATE_X_PREFIX = 'rotateX(';
Cube.ROTATE_Y_PREFIX = 'rotateY(';
Cube.ROTATE_UNIT_SUFFIX = 'deg)';
Cube.REVOLUTION = 360;
Cube.ORIGIN = 0;

Cube.prototype = {

  build: function() {

    // Create the game sides.
    this._sides = this._buildSides(this.size);

    // Initialize the game.
    // Slow down the cube to a stop, display instructions.
    var el = this.el,
        self = this;

    el.addEventListener(Vendor.EVENT.animationIteration, function() {
      el.classList.add('transition');
      el.addEventListener(Vendor.EVENT.animationEnd, function animEnd(evt) {
        if (evt.target === el) {

          // Remove the transition class and append the init class. Done!
          el.classList.remove('transition');
          el.classList.add('init');

          // Set the initial rotated state. Would be cool to make these dynamic
          // but probably not worth the trouble.
          // http://css-tricks.com/get-value-of-css-rotation-through-javascript/
          // http://stackoverflow.com/questions/8270612/get-element-moz-transformrotate-value-in-jquery
          self.x = 315;
          self.y = 315;

          // Let's go!
          self.emit('init');
        }
      });
    });

  },

  rotate: function(x, y) {
    this.x = this._calculateCoordinate(this.x, x);
    this.y = this._calculateCoordinate(this.y, y);

    this.style[Vendor.JS.transform] =
      Cube.ROTATE_X_PREFIX + this.x + Cube.ROTATE_UNIT_SUFFIX + ' ' + Cube.ROTATE_Y_PREFIX + this.y + Cube.ROTATE_UNIT_SUFFIX;
  },

  listenTo: function(eventName, callback, context) {
    this.el.addEventListener(eventName, _.bind(callback, context || this));
    return this;
  },

  /**
   * Fetches a cube side by name (e.g. 'top')
   * @param  {String} name The name of the side you want.
   * @return {Side}      The Side object by name.
   */
  getSide: function(name) {
    return this._sides[name];
  },

  /**
   * Updates the passed tile and all related adjacent tiles with the
   * passed callback. This method is mostly used for highlighting tiles
   * to help the user make strategy decisions easier.
   * @param  {DOMElement}   tile The selected tile as a raw DOM element.
   * @param  {Function}     callback   The method to invoke passing each tile as an argument.
   */
  updateAdjacentTiles: function(tile, callback) {

    tile.side.updateLines(tile, callback);

    // For each neighbor, pass in the side and the orientation id (e.g. 'left').
    _.forEach(tile.side.getNeighbors(), function(neighbor) {

      // Find the translated indicies.
      var tiles = this._translate(tile, neighbor);

      // Run the callback on each tile.
      _.forEach(tiles, callback);

    }, this);
  },

  updateHelperHighlight: function(tile, initialTile, callback) {

    // Get the raw neighbor sides (without their placement keys)
    // and exclude the selected side.
    var neighbors = _.without(initialTile.side.getNeighbors(), tile.side);

    _.forEach(neighbors, function(neighbor) {

      if (neighbor.isVisible(this.x, this.y)) {

        var highlightTiles = this._translate(tile, neighbor);

        var helperTile = _.find(highlightTiles, function(ti) {
          return ti.hasClass('highlighted');
        });

        callback(helperTile);
      }
    }, this);
  },

  _translate: function(tile, toSide) {

    // A translation is a recipe for morphing one line into another.
    // It looks like this: [1, flip]
    // Where: The first index is the coordinate to use in a line pair
    //        The remaining indicies are methods to invoke on the line
    var translation = this._translationMap[tile.side.id][toSide.id],

        // The line from the line pair to use.
        line = _.first(translation) === 'x' ? tile.xLine : tile.yLine;

    // Run through each translation method (flip, rotate) and return the result.
    var newLine = _.reduce(_.rest(translation), function(transformedLine, method) {
      return method(transformedLine);
    }, line);

    return toSide.getTiles(newLine.indicies());
  },

  // Rotate in place, like a Tetrad. For instance:
  // xoo      xxx
  // xoo  ->  ooo
  // xoo      ooo
  _rotateLine: function(line) {

    // Cache the line length.
    var size = line.length(),

        // Where the line begins, starting from top-left.
        origin = line.indicies()[0],

        // The transformed line.
        rotatedLine,

        indexAt;

    if (line.isHorizontal()) {
      // The row (starting at top-right and down).
      indexAt = origin - (origin % size);
      rotatedLine = line.side.getTiles(indexAt + (indexAt / size))[0].yLine;
    }
    else {
      // The column (starting top-right and across).
      indexAt = origin % size;
      rotatedLine = line.side.getTiles(indexAt * size)[0].xLine;
    }

    return rotatedLine;
  },

  // Flip across a median. For instance:
  //    xoo      oox
  //    xoo  ->  oox
  //    xoo      oox
  _flipLine: function(line) {

    // Cache the line length.
    var size = line.length(),

        // Where the line begins, starting from top-left.
        origin = line.indicies()[0],

        // The transformed line.
        flippedLine,

        // The row or column the line is in.
        indexAt,

        // The middle line.
        middle,

        // Distance difference between the index and middle.
        diff;

    // If the line is vertical:
    if (!line.isHorizontal()) {

      // The column (starting at top-left and across).
      indexAt = origin % size;

      // The middle column.
      middle = (size - 1) / 2;

      // Determine the difference and get the calculated y line.
      diff = middle - indexAt;
      flippedLine = line.side.getTiles(middle + diff)[0].yLine;
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
      flippedLine = line.side.getTiles(middle + diff)[0].xLine;
    }

    return flippedLine;
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

    var REVOLUTION = Cube.REVOLUTION,
        result = current + difference;

    if (result > REVOLUTION) {
      result = result - REVOLUTION;
    }
    else if (result <= Cube.ORIGIN) {
      result = REVOLUTION - result;
    }

    return result;
  },





// ------------------------------------------------------------------------------------------------------
// ---------------------------------------------- MAPPINGS ----------------------------------------------
// ------------------------------------------------------------------------------------------------------





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
      top: [BACK, FRONT, LEFT, RIGHT],
      bottom: [FRONT, BACK, LEFT, RIGHT],
      front: [TOP, BOTTOM, LEFT, RIGHT],
      back: [BOTTOM, TOP, LEFT, RIGHT],
      left: [TOP, BOTTOM, BACK, FRONT],
      right: [TOP, BOTTOM, FRONT, BACK]
    };

    var visibilityMap = {
      // x: [y]
      front: {
        '315':    [45, 315],
        '45':     [45, 315],
        '135':    [135, 225],
        '225':    [135, 225]
      },

      back: {
        '315':    [135, 225],
        '45':     [135, 225],
        '135':    [45, 315],
        '225':    [45, 315]
      },

      top: {
        '315':    [45, 135, 225, 315],
        '225':    [45, 135, 225, 315]
      },

      bottom: {
        '135':    [45, 135, 225, 315],
        '45':     [45, 135, 225, 315]
      },

      left: {
        '315':    [45, 135],
        '45':     [45, 135],
        '135':    [225, 315],
        '225':    [225, 315]
      },

      right: {
        '315':    [225, 315],
        '45':     [225, 315],
        '135':    [45, 135],
        '225':    [45, 135]
      }
    };

    // Now set the neighbors for each side.
    return _.forIn(sides, function(side) {
      side.setNeighbors(neighborMap[side.id]);
      side.setVisibilityMap(visibilityMap[side.id]);
    });
  },

  _buildTranslationMap: function() {

    var flip = _.bind(this._flipLine, this),
        rotate = _.bind(this._rotateLine, this);

    var X = 'x', Y = 'y';

    // Line coordinate mapping to side id.
    // [coordinate, methods...]
    return {

      front: {
        top:      [Y],                // top
        bottom:   [Y],                // bottom
        left:     [X],                // left
        right:    [X]                 // right
      },

      back: {
        bottom:   [Y, flip],          // top
        top:      [Y, flip],          // bottom
        left:     [X],                // left
        right:    [X]                 // right
      },

      top: {
        back:     [Y, flip],          // top
        front:    [Y],                // bottom
        left:     [X, rotate],        // left
        right:    [X, flip, rotate],  // right
      },

      bottom: {
        front:    [Y],                // top
        back:     [Y, flip],          // bottom
        left:     [X, flip, rotate],  // left
        right:    [X, rotate]         // right
      },

      left: {
        top:      [Y, rotate],        // top
        bottom:   [Y, flip, rotate],  // bottom
        back:     [X],                // left
        front:    [X]                 // right
      },

      right: {
        top:      [Y, flip, rotate],  // top
        bottom:   [Y, rotate],        // bottom
        front:    [X],                // left
        back:     [X]                 // right
      }
    };
  }

};

// Mixin the EventEmitter methods for great justice.
// Ditch when we migrate to Browserify.
_.assign(Cube.prototype, EventEmitter2.prototype);
