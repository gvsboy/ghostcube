describe('CubeCache', function() {

  /**
   * Add tiles using CubeCache's add method and the global getTiles method.
   * Claim them first to make add work properly.
   * @param {...String} Any number of strings representing tiles.
   */
  function add() {

    // Arguments to pass to getTiles.
    var args = [this.cube].concat(_.toArray(arguments)),
        tiles = getTiles.apply(this, args);

    // For each tile, claim it and then add it to the cache.
    _.forEach(tiles, function(tile) {
      tile.claim(this.player);
      this.cubeCache.add(tile);
    }, this);
  };

  /**
   * Helper function for return the current number of singles.
   * @return {Number} The number of singles.
   */
  function singlesLength() {
    return this.cubeCache._singles.length;
  }

  /**
   * Helper function for returning the current number of lines.
   * @return {Number} The number of lines.
   */
  function linesLength() {
    return this.cubeCache.getLines().length;
  }

  beforeEach(function() {

    // Create a new CubeCache instance.
    this.cubeCache = new CubeCache(createCube());

    // Reference the cube and player as some tests need it.
    this.cube = this.cubeCache._cube;
    this.player = new Player('Test', 'player1', this.cube);

    // Wish there was a better way to handle this...
    this.add = _.bind(add, this);
    this.singlesLength = _.bind(singlesLength, this);
    this.linesLength = _.bind(linesLength, this);
  });

  it('exists', function() {
    expect(CubeCache).toBeDefined();
  });

  describe('initialize()', function() {

    it('creates a lineMap object of cube sides to cache lines', function() {
      var lineMap = this.cubeCache._lineMap;
      expect(_.isObject(lineMap)).toBeTruthy();
      expect(_.keys(lineMap).length).toBe(6);
      expect(_.isArray(lineMap.top)).toBeTruthy();
    });

    it('creates a singles array to cache single tiles', function() {
      expect(this.cubeCache._singles).toBeDefined();
      expect(_.isArray(this.cubeCache._singles)).toBeTruthy();
    });

  });

  describe('add and remove scenarios', function() {

    /* Scenario 1:
          ooo
          xox
          ooo
     */
    it('passes scenario 1', function() {
      this.add('top 3', 'top 5');
      expect(this.singlesLength())).toEqual(0);
      expect(this.linesLength()).toEqual(1);
    });

    /* Scenario 2:
          ooo
          xoo
          oxo
     */
    it('passes scenario 2', function() {
      this.add('top 3', 'top 7');
      expect(this.singlesLength()).toEqual(2);
      expect(this.linesLength()).toEqual(0);
    });

  });

});
