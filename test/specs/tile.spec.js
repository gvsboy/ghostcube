import Tile from '../../src/js/cube/tile';
import Cube from '../../src/js/cube/cube';
import {createCube, getTile} from '../helpers/CubeHelpers';

describe('Tile', function() {

  before(function() {
    fixture.load('/test/fixtures/app.fixture.html');
    this.cube = createCube();
  });

  it('exists', function() {
    expect(Tile).to.exist;
  });

  describe('isNeighboringSide()', function() {

    it('returns true if the tile is on a neighboring side of the given tile', function() {
      var tile1 = getTile(this.cube, 'front 3'),
          tile2 = getTile(this.cube, 'top 5');
      expect(tile1.isNeighboringSide(tile2)).to.be.ok;
    });

    it('returns false if the tile is not on a neighboring side of the given tile', function() {
      var tile1 = getTile(this.cube, 'front 3'),
          tile2 = getTile(this.cube, 'back 5');
      expect(tile1.isNeighboringSide(tile2)).to.not.be.ok; 
    });

  });

});
