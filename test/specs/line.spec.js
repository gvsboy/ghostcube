import Line from '../../src/js/cube/line';
import {createSide} from '../helpers/CubeHelpers';

describe('Line', function() {

  var side = createSide();

  it('exists', function() {
    expect(Line).to.exist;
  });

  describe('all()', function() {

    it('returns true if the line contains all the passed tiles', function() {
      var line = new Line(side.getTiles([0, 1, 2])),
          tiles = side.getTiles([1, 2]);
      expect(line.all(tiles)).to.be.ok;
    });

  });

  describe('isHorizontal()', function() {

    it('returns true if a complete line is horizontal', function() {
      var line = side.getTiles(4)[0].xLine;
      expect(line.isHorizontal()).to.be.ok;
    });

    it('returns false if a complete line is vertical', function() {
      var line = side.getTiles(4)[0].yLine;
      expect(line.isHorizontal()).to.not.be.ok;
    });

    it('returns true if a partial line of end tiles is horizontal', function() {
      var tiles = side.getTiles(0).concat(side.getTiles(2)),
          line = new Line(tiles);
      expect(line.isHorizontal()).to.be.ok;
    });

    it('returns false if a partial line of end tiles is vertical', function() {
      var tiles = side.getTiles(1).concat(side.getTiles(7)),
          line = new Line(tiles);
      expect(line.isHorizontal()).to.not.be.ok;
    });

  });

});
