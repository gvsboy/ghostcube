describe('Cube', function() {

  var cube = createCube();

  it('exists', function() {
    expect(Cube).toBeDefined();
  });

  describe('rotateToTiles()', function() {

    it('determines the end points it needs to rotate to', function() {
      var sides = cube.getSides(),
          tiles = [
            sides.left.getTiles(3)[0],
            sides.front.getTiles(1)[0],
            sides.top.getTiles(1)[0]
          ];
      expect(cube.rotateToTiles(tiles)).toBe([315, 45]);
    });

  });

});
