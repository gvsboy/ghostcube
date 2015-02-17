describe('Tile', function() {

  var cube = createCube(),
      sides = cube.getSides();

  it('exists', function() {
    expect(Tile).toBeDefined();
  });

  describe('isNeighboringSide()', function() {

    it('returns true if the tile is on a neighboring side of the given tile', function() {
      var tile1 = sides.front.getTiles(3)[0],
          tile2 = sides.top.getTiles(5)[0];
      expect(tile1.isNeighboringSide(tile2)).toBeTruthy();
    });

    it('returns false if the tile is not on a neighboring side of the given tile', function() {
      var tile1 = sides.front.getTiles(3)[0],
          tile2 = sides.back.getTiles(5)[0];
      expect(tile1.isNeighboringSide(tile2)).toBeFalsy(); 
    });

  });

});
