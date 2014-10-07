function Cube(el, size) {

  // The HTML element representing the cube.
  this.el                     = el;

  // The cube's size regarding tiles across a side. Default to 3.
  this.size                   = size || 3;

  // Cached reference to the style object.
  this.style                  = this.el.style;

  // Maps out the lines (x, y) that should be highlighted per index click.
  this._lineMap = this._buildLineMap();

  // Translates highlighted lines to different sides, normalizing the coordinate system.
  this._translationMap = this._buildTranslationMap();

  // This will be set in beginGame.
  this._sides = null;

  // The three selected tiles to place pieces on.
  this.selectedTiles = [];

  // Cross-selected tile for helping attacks.
  this._helperTile = null;

  // EventEmitter constructor call.
  EventEmitter2.call(this);
}

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
          el.classList.remove('transition');
          el.classList.add('init');
          self.x = 315;//TODO: make dynamic http://css-tricks.com/get-value-of-css-rotation-through-javascript/
          self.y = 315;//TODO: make dynamic

          // Listen for tile clicks.
          el.addEventListener('click', _.bind(self._handleClick, self));

          // Listen for mouseovers.
          el.addEventListener('mouseover', _.bind(self._handleMouseOver, self));

          // ...and mouseouts.
          el.addEventListener('mouseout', _.bind(self._handleMouseOut, self));

          // ...and render start.
          el.addEventListener('renderstart', _.bind(self._handleRenderStart, self))

          // Let's go!
          el.dispatchEvent(new Event('init'));
        }
      });
    });

  },

  rotate: function(x, y) {
    var C = Const;
    this.x = this._calculateCoordinate(this.x, x);
    this.y = this._calculateCoordinate(this.y, y);

    this.style[Vendor.JS.transform] =
      C.ROTATE_X_PREFIX + this.x + C.ROTATE_UNIT_SUFFIX + ' ' + C.ROTATE_Y_PREFIX + this.y + C.ROTATE_UNIT_SUFFIX;
  },

  /**
   * Fetches a cube side by name (e.g. 'top')
   * @param  {String} name The name of the side you want.
   * @return {Side}      The Side object by name.
   */
  getSide: function(name) {
    return this._sides[name];
  },

  getLines: function(index, coordinate) {
    if (_.isNumber(coordinate)) {
      return this._lineMap[index][coordinate];
    }
    return this._lineMap[index];
  },

  selectTile: function(tile) {
    tile.addClass('selected');
    this.selectedTiles.push(tile);
    this._updateAdjacentTiles(tile, function(tile) {
      tile.addClass('highlighted');
    });
  },

  deselectTile: function(tile) {
    tile.removeClass('selected');
    _.pull(this.selectedTiles, tile);
    this._updateAdjacentTiles(tile, function(tile) {
      tile.removeClass('highlighted');
    });
  },

  clearHelperTile: function() {
    if (this._helperTile) {
      this._helperTile.removeClass('helper');
    }
    this._helperTile = null;
  },

  claim: function() {

    // Set the selected tiles to the player's color.
    _.forEach(this.selectedTiles, function(tile) {
      tile.claim();//pass in the player
    });

    // Remove all helpers.
    this.clearHelperTile();
    this.deselectTile(_.first(this.selectedTiles));

    // Move this out to App and implement eventing.
    this.selectedTiles = [];

    this.checkWin();
  },

  checkWin: function() {

    var winLines = [];

    // Loop through each cube side.
    _.forEach(this._sides, function(side) {

      // Find all the tiles claimed by this player.
      var claimedTiles = _.filter(side.getTiles(), {claimedBy: true}),//truth check for now...
          size = this.size,
          map;

      // If there are not enough tiles available for a line, exit immediately.
      if (claimedTiles.length < size) {
        return;
      }

      // Build an index map of the claimed tiles for faster lookup.
      map = _.times(Math.pow(size, 2), function(i) {
        return _.find(claimedTiles, {index: i});
      });

      // Check for vertical matches.
      // Inspect each starting index from 0 and leftwards.
      _.forEach(_.at(map, _.times(size)), function(tile) {
        var line;

        // If a tile exists at an index, begin searching rightwards.
        if (tile) {
          line = _.at(map, _.times(size - 1, function(i) {
            return tile.index + ((i + 1) * size);
          }));

          // Push the original tile on the line stack.
          line.push(tile);

          // If the limit is reached, the line is complete. It's a win!
          if (_.compact(line).length === size) {
            winLines.push(line);
          }
        }
      });
      
      // Check for horizontal matches.
      // Inspect each starting index from 0 and downwards.
      _.forEach(_.at(map, _.times(size, function(i) { return i * size })), function(tile) {
        var line;

        // If a tile exists at an index, begin searching rightwards.
        if (tile) {
          line = _.at(map, _.times(size - 1, function(i) {
            return tile.index + (i + 1);
          }));

          // Push the original tile on the line stack.
          line.push(tile);

          // If the limit is reached, the line is complete. It's a win!
          if (_.compact(line).length === size) {
            winLines.push(line);
          }
        }
      });

    }, this);

  },

  /**
   * Updates the passed tile and all related adjacent tiles with the
   * passed callback. This method is mostly used for highlighting tiles
   * to help the user make strategy decisions easier.
   * @param  {DOMElement}   tile The selected tile as a raw DOM element.
   * @param  {Function}     callback   The method to invoke passing each tile as an argument.
   */
  _updateAdjacentTiles: function(tile, callback) {

    // The tile's side.
    var side = tile.side,

        // The highlightable lines related to the origin tile's index.
        lines = this.getLines(tile.index);

    // Update all the appropriate tiles on the origin tile's side.
    _.forEach(side.getTiles(lines), callback);

    // For each neighbor, pass in the side and the orientation id (e.g. 'left').
    _.forEach(side.getNeighbors(), function(neighbor) {

      // Get all the translated tiles based on the origin tile and update.
      _.forEach(neighbor.getTiles(this._translate(lines, neighbor.id, side.id)), callback);

    }, this);
  },

  // Potentially dangerous as this is hackable...
  // Perhaps do a straigh-up element match too?
  _getTileFromElement: function(el) {
    var data;
    if (el.classList.contains('tile')) {
      data = el.id.split('-');
      return this.getSide(data[0]).getTiles(data[1])[0];
    }
    return null;
  },

  _handleRenderStart: function() {
    this.clearHelperTile();
  },

  _handleClick: function(evt) {

    // Get the target element from the event.
    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = _.first(this.selectedTiles);

    // If the target is a tile, let's figure out what to do with it.
    if (tile) {

      // If the tile is already claimed, get outta dodge.
      if (tile.claimedBy) {
        this._sendMessage('claimed');
        return;
      }

      // If nothing has been selected yet, select the tile normally.
      if (!initialTile) {
        this.selectTile(tile);
      }

      // Otherwise, there must be a selected tile already.
      else {

        // Deselect the tile if it is the target.
        if (tile === initialTile) {
          this.deselectTile(tile);
        }

        // Otherwise, try and make a match.
        else {

          // If the same side was selected, display an error.
          if (tile.side === initialTile.side) {
            this._sendMessage('sameSide');
          }

          // Else if the side selected is not a neighbor, display an error.
          else if (!initialTile.side.isNeighbor(tile.side)) {
            this._sendMessage('notNeighbor');
          }

          // Otherwise, we're on a good side. Let's drill down further.
          else {

            // If the attack target is claimed, try another tile.
            if (this._helperTile.claimedBy) {
              this._sendMessage('targetClaimed');
            }

            // Otherwise, a valid selection has been made!
            else {
              this.selectedTiles.push(tile, this._helperTile);
              this.claim();
            }
          }
        }
      }
    };
  },

  _handleMouseOver: function(evt) {
    this._determineHelperHighlight(evt, _.bind(function(tile) {
      tile.addClass('helper');
      this._helperTile = tile;
    }, this));
  },

  _handleMouseOut: function(evt) {
    this._determineHelperHighlight(evt, function(tile) {
      tile.removeClass('helper');
    });
  },

  _sendMessage: function(type) {
    this.emit('message', Const.MESSAGES[type]);
  },

  _determineHelperHighlight: function(evt, callback) {

    // The tile the user is interacting with.
    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = _.first(this.selectedTiles);

    // If the user is hovering on a neighboring side of the initial tile,
    // highlight some targeting help on a visible side.
    if (tile && initialTile && initialTile.side.isNeighbor(tile.side)) {
      this._updateHelperHighlight(tile, initialTile, callback);
    }
  },

  _updateHelperHighlight: function(tile, initialTile, callback) {

    // Get the raw neighbor sides (without their placement keys)
    // and exclude the selected side.
    var neighbors = _.without(initialTile.side.getNeighbors(), tile.side);

    _.forEach(neighbors, function(neighbor) {

      if (neighbor.isVisible(this.x, this.y)) {
        var highlightTiles = neighbor.getTiles(this._translate(this.getLines(tile.index), neighbor.id, tile.side.id));
        var helperTile = _.find(highlightTiles, function(ti) {
          return ti.hasClass('highlighted');
        });
        callback(helperTile);
      }
    }, this);
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
      rotatedLine = this.getLines(indexAt + (indexAt / size), Const.Y_COOR);
    }
    else {
      // The column (starting top-right and across).
      indexAt = origin % size;
      rotatedLine = this.getLines(indexAt * size, Const.X_COOR);
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
      flippedLine = this.getLines(middle + diff, Const.Y_COOR);
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
      flippedLine = this.getLines(middle + diff, Const.X_COOR);
    }

    return flippedLine;
  },

  _translate: function(lines, id, originId) {

    var translation = this._translationMap[originId][id];

    return _.reduce(_.rest(translation), function(line, method) {
      return method(line);
    }, lines[_.first(translation)]);
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
    else if (result <= Const.ORIGIN) {
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

    // Line coordinate mapping to side id (1 = x, 0 = y)
    // follows format:
    // top
    // bottom
    // left
    // right
    return {

      front: {
        top:      [1],
        bottom:   [1],
        left:     [0],
        right:    [0]
      },

      back: {
        bottom:   [1, flip],
        top:      [1, flip],
        left:     [0],
        right:    [0]
      },

      top: {
        back:     [1, flip],
        front:    [1],
        left:     [0, rotate],
        right:    [0, flip, rotate],
      },

      bottom: {
        front:    [1],
        back:     [1, flip],
        left:     [0, flip, rotate],
        right:    [0, rotate]
      },

      left: {
        top:      [1, rotate],
        bottom:   [1, flip, rotate],
        back:     [0],
        front:    [0]
      },

      right: {
        top:      [1, flip, rotate],
        bottom:   [1, rotate],
        front:    [0],
        back:     [0]
      }
    };
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
  }

};

// Mixin the EventEmitter methods for great justice.
// Ditch when we migrate to Browserify.
_.assign(Cube.prototype, EventEmitter2.prototype);
