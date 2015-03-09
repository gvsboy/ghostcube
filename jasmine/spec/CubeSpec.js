describe('Cube', function() {

  var cube = createCube(),
      sides = cube.getSides(),
      tilesLeftFrontTop = getTiles(cube, 'left 3', 'front 1', 'top 1'),
      tilesRightFrontBottom = getTiles(cube, 'right 3', 'front 1', 'bottom 1'),
      tilesLeftBackTop = getTiles(cube, 'left 3', 'back 1', 'top 1');

  function rotateCubeTo(x, y) {
    cube.x = x;
    cube.y = y;
  }

  it('exists', function() {
    expect(Cube).toBeDefined();
  });

  describe('_getCommonVisibleCoordinates()', function() {

    it('determines shared visible sides for left, front, and top', function() {
      expect(
        cube._getCommonVisibleCoordinates(tilesLeftFrontTop)
      ).toEqual([[225, 225], [315, 45]]);
    });

    it('determines shared visible sides for right, front, and bottom', function() {
      expect(
        cube._getCommonVisibleCoordinates(tilesRightFrontBottom)
      ).toEqual([[45, 315], [135, 135]]);
    });

    it('determines shared visible sides for left, back, and top', function() {
      expect(
        cube._getCommonVisibleCoordinates(tilesLeftBackTop)
      ).toEqual([[225, 315], [315, 135]]);
    });
  });

  describe('_getShortestCoordinateDiff()', function() {

    it('calculates the shortest diff between 315 and 225', function() {
      expect(
        cube._getShortestCoordinateDiff(315, 225)
      ).toEqual(-90);
    });

    it('calculates the shortest diff between 225 and 315', function() {
      expect(
        cube._getShortestCoordinateDiff(225, 315)
      ).toEqual(90);
    });

    it('calculates the shortest diff between 315 and 45', function() {
      expect(
        cube._getShortestCoordinateDiff(315, 45)
      ).toEqual(90);
    });

    it('calculates the shortest diff between 45 and 315', function() {
      expect(
        cube._getShortestCoordinateDiff(45, 315)
      ).toEqual(-90);
    });

  });

  describe('_getShortestRotationDistance()', function() {

    it('calculates the shortest rotation distance to [left, front, top] from [right, front, top]', function() {
      rotateCubeTo(315, 315);
      expect(cube._getShortestRotationDistance(
        cube._getCommonVisibleCoordinates(tilesLeftFrontTop)
      )).toEqual([0, 90]);
    });

    it('calculates the shortest rotation distance to [left, front, top] from [right, front, bottom]', function() {
      rotateCubeTo(45, 315);
      expect(cube._getShortestRotationDistance(
        cube._getCommonVisibleCoordinates(tilesLeftFrontTop)
      )).toEqual([-90, 90]);
    });

  });

  describe('rotateToTiles()', function() {

    it('returns a promise', function() {
      rotateCubeTo(315, 315);
      expect(cube.rotateToTiles(tilesLeftFrontTop) instanceof Promise).toBeTruthy();
    });

  });

});
