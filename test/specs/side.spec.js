import _ from 'lodash';
import Side from '../../src/js/cube/side';
import {createSide} from '../helpers/CubeHelpers';

describe('Side', function() {

  before(function() {
    this.side = createSide();
  });

  it('exists', function() {
    expect(Side).to.exist;
  });

  describe('getTiles()', function() {

    it('returns all the tiles if no argument is passed', function() {
      var tiles = this.side.getTiles();
      expect(_.isArray(tiles)).to.be.ok;
      expect(tiles.length).to.equal(9);
    });

    it('returns one tile by index if a number is passed', function() {
      var tiles = this.side.getTiles(4);
      expect(tiles.length).to.equal(1);
      expect(tiles[0].index).to.equal(4);
    });

    it('returns the first tile if 0 is passed', function() {
      var tiles = this.side.getTiles(0);
      expect(tiles.length).to.equal(1);
      expect(tiles[0].index).to.equal(0);
    });

  });

});
