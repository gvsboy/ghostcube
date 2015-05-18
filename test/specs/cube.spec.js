import Cube from '../../src/js/cube/cube';
import {createCube, getTiles} from '../helpers/CubeHelpers';

describe('Cube', function() {

  fixture.load('/test/fixtures/app.fixture.html');

  before(function() {
    var cube = this.cube = createCube();
    this.sides = cube.getSides();
    this.tilesLeftFrontTop = getTiles(cube, 'left 3', 'front 1', 'top 1');
    this.tilesRightFrontBottom = getTiles(cube, 'right 3', 'front 1', 'bottom 1');
    this.tilesLeftBackTop = getTiles(cube, 'left 3', 'back 1', 'top 1');
  });

  it('exists', function() {
    expect(Cube).to.exist;
  });

  describe('_getCommonVisibleCoordinates()', function() {

    it('determines shared visible sides for left, front, and top', function() {
      expect(
        this.cube._getCommonVisibleCoordinates(this.tilesLeftFrontTop)
      ).to.deep.include.members([[315, 45], [225, 225]]);
    });

    it('determines shared visible sides for right, front, and bottom', function() {
      expect(
        this.cube._getCommonVisibleCoordinates(this.tilesRightFrontBottom)
      ).to.eql([[45, 315], [135, 135]]);
    });

    it('determines shared visible sides for left, back, and top', function() {
      expect(
        this.cube._getCommonVisibleCoordinates(this.tilesLeftBackTop)
      ).to.deep.include.members([[315, 135], [225, 315]]);
    });
  });

  describe('_getShortestCoordinateDiff()', function() {

    it('calculates the shortest diff between 315 and 225', function() {
      expect(
        this.cube._getShortestCoordinateDiff(315, 225)
      ).to.eql(-90);
    });

    it('calculates the shortest diff between 225 and 315', function() {
      expect(
        this.cube._getShortestCoordinateDiff(225, 315)
      ).to.eql(90);
    });

    it('calculates the shortest diff between 315 and 45', function() {
      expect(
        this.cube._getShortestCoordinateDiff(315, 45)
      ).to.eql(90);
    });

    it('calculates the shortest diff between 45 and 315', function() {
      expect(
        this.cube._getShortestCoordinateDiff(45, 315)
      ).to.eql(-90);
    });

  });

  describe('_getShortestRotationDistance()', function() {

    it('calculates the shortest rotation distance to [left, front, top] from [right, front, top]', function() {
      this.cube.x = 315;
      this.cube.y = 315;
      expect(this.cube._getShortestRotationDistance(
        this.cube._getCommonVisibleCoordinates(this.tilesLeftFrontTop)
      )).to.eql([0, 90]);
    });

    it('calculates the shortest rotation distance to [left, front, top] from [right, front, bottom]', function() {
      this.cube.x = 45;
      this.cube.y = 315;
      expect(this.cube._getShortestRotationDistance(
        this.cube._getCommonVisibleCoordinates(this.tilesLeftFrontTop)
      )).to.eql([-90, 90]);
    });

  });

  describe('rotateToTiles()', function() {

    it('returns a promise', function() {
      this.cube.x = 315;
      this.cube.y = 315;
      expect(this.cube.rotateToTiles(this.tilesLeftFrontTop)).is.an.instanceof(Promise);
    });

  });

});
