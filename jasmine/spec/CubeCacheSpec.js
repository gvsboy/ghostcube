describe('CubeCache', function() {

  beforeEach(function() {
    this.cubeCache = new CubeCache(createCube());
    this.cube = this.cubeCache._cube;
    this.player = new Player('Test', 'player1', this.cube);
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
      var tiles = getTiles(this.cube, 'top 3', 'top 5');
      _.forEach(tiles, function(tile) {
        tile.claim(this.player);
        this.cubeCache.add(tile);
      }, this);
      expect(this.cubeCache.getLines().length).toEqual(1);
    });

  });

});
