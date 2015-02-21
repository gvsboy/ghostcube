function Cube(el, size) {

  // The HTML element representing the cube.
  this.el                     = el;

  // The cube's size regarding tiles across a side. Default to 3.
  this.size                   = size || 3;

  // Cached reference to the style object.
  this.style                  = this.el.style;

  // This will be set in beginGame.
  this._sides = null;

  this._eventMap = {};

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

    // Set the initial rotated state. Would be cool to make these dynamic
    // but probably not worth the trouble.
    // http://css-tricks.com/get-value-of-css-rotation-through-javascript/
    // http://stackoverflow.com/questions/8270612/get-element-moz-transformrotate-value-in-jquery
    this.x = 315;
    this.y = 315;

    el.addEventListener(Vendor.EVENT.animationIteration, function() {
      el.classList.add('transition');
      el.addEventListener(Vendor.EVENT.animationEnd, function animEnd(evt) {
        if (evt.target === el) {

          // Remove the transition class and append the init class. Done!
          el.classList.remove('transition');
          el.classList.add('init');

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

  /**
   * Calculate the rotation needed to display all the given tiles which
   * must be neighbors to each other (for obvious reasons).
   * @param  {Array} tiles A collection of tiles (three maximum).
   * @return {[type]}       [description]
   */
  rotateToTiles: function(tiles) {

    var coors = this._getCommonVisibleCoordinates(tiles);
  },

  listenTo: function(eventName, callback, context) {

    var events = this._eventMap,
        handler = _.bind(callback, context || this);

    if (!events[eventName]) {
      events[eventName] = [];
    }

    this._eventMap[eventName].push(handler);
    this.el.addEventListener(eventName, handler);

    return this;
  },

  stopListeningTo: function(eventName) {

    _.each(this._eventMap[eventName], function(handler) {
      this.el.removeEventListener(eventName, handler);
    }, this);

    return this;
  },

  /**
   * Fetches a cube side by name (e.g. 'top')
   * @param  {String} name The name of the side you want.
   * @return {Side}      The Side object by name.
   */
  getSides: function(name) {
    return name ? this._sides[name] : this._sides;
  },

  /**
   * @return {Array} The three visible sides.
   */
  getVisibleSides: function() {

  },

  /**
   * Retrieves all the unclaimed tiles and sorts them by the amount per
   * side in ascending order. If an exception tile is passed, do not include
   * unclaimed tiles from that tile's side.
   * @param  {Tile} except The tile whose side to exclude.
   * @return {Array} A list of all the available tiles.
   */
  getAvailableTiles: function(except) {

    // Get all the tiles by side and push each array to the main array list.
    var tilesBySide = _.reduce(this.getSides(), function(list, side) {
      if (!except || side !== except.side) {
        list.push(_.shuffle(side.getAvailableTiles()));
      }
      return list;
    }, []);

    // Sort each side's array by length and then flatten the whole thing.
    return _.flatten(_.sortBy(tilesBySide, 'length'));
  },

  /**
   * Updates the passed tile and all related adjacent tiles with the
   * passed callback. This method is mostly used for highlighting tiles
   * to help the user make strategy decisions easier.
   * @param  {DOMElement}   tile The selected tile as a raw DOM element.
   * @param  {Function}     callback   The method to invoke passing each tile as an argument.
   */
  updateCrosshairs: function(tile, callback) {

    tile.xLine.updateTiles(callback);
    tile.yLine.updateTiles(callback);

    // For each neighbor, pass in the side and the orientation id (e.g. 'left').
    _.forEach(tile.side.getNeighbors(), function(neighbor) {

      // Find the translated indicies.
      var tiles = tile.translate(neighbor);

      // Run the callback on each tile.
      _.forEach(tiles, callback);

    }, this);
  },

  /**
   * Gets the tile where the two passed tile's coordinates intersect.
   * @param {Tile} [tile1] The first tile selected.
   * @param {Tile} [tile2] The second tile selected.
   * @return {Tile}       The tile being attacked.
   */
  getAttackTile: function(tile1, tile2) {

    var neighbors, side;

    if (tile1 && tile2 && tile1.isNeighboringSide(tile2)) {

      // Get the neighbor sides and exclude the selected side.
      neighbors = _.without(tile2.side.getNeighbors(), tile1.side),

      // Get the neighbor that is visible.
      side = _.find(neighbors, function(neighbor) {
        return neighbor.isVisible(this.x, this.y);
      }, this);

      // Return the tile that intersects the two passed tiles.
      return _.intersection(tile1.translate(side), tile2.translate(side))[0];
    }

    return null;
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

  /**
   * Calculates all the possible x/y coordinate combinations that exist
   * where all the given tiles will be visible.
   * @param  {Array} tiles The tiles to test.
   * @return {Array}       A collection of valid coordinate collections.
   *                       e.g. [[225, 225], [315, 45]]
   */
  _getCommonVisibleCoordinates: function(tiles) {

    // Collect the visibility map of each passed tile into an array.
    var visibilityMap = _.map(tiles, function(tile) {
          return tile.side._visibilityMap;
        }),

        // Find all the x coordinates shared by all the tiles.
        xCoors = _.intersection.apply(_, _.map(visibilityMap, function(map) {
          return _.map(_.keys(map), _.parseInt);
        })),

        // Given the available x coordinates, find the shared y coordinates.
        yCoors = _.flatten(_.map(xCoors, function(coor) {
          return _.intersection.apply(_, _.pluck(visibilityMap, coor));
        }));

    // Return a collection of x/y collections shared among all the passed tiles.
    return _.zip(xCoors, yCoors);
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
  }

};

// Mixin the EventEmitter methods for great justice.
// Ditch when we migrate to Browserify.
_.assign(Cube.prototype, EventEmitter2.prototype);
