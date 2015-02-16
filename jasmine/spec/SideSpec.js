describe('Side', function() {

  var side = createSide();

  it('exists', function() {
    expect(Side).toBeDefined();
  });

  describe('getTiles()', function() {

    it('returns all the tiles if no argument is passed', function() {
      var tiles = side.getTiles();
      expect(_.isArray(tiles)).toBeTruthy();
      expect(tiles.length).toEqual(9);
    });

    it('returns one tile by index if a number is passed', function() {
      var tiles = side.getTiles(4);
      expect(tiles.length).toEqual(1);
      expect(tiles[0].index).toEqual(4);
    });

    it('returns the first tile if 0 is passed', function() {
      var tiles = side.getTiles(0);
      expect(tiles.length).toBe(1);
      expect(tiles[0].index).toEqual(0);
    });

  });

});
