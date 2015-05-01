import Game from '../../src/js/game';
import TileSelector from '../../src/js/selection/TileSelector';
import TileSelectorResult from '../../src/js/selection/TileSelectorResult';
import {getTile} from '../helpers/CubeHelpers';

describe('TileSelector', function() {

  fixture.load('/test/fixtures/app.fixture.html');

  beforeEach(function() {
    this.game = new Game('container');
    this.game.cube.build();
    this.game.initializeGame();
    this.selector = new TileSelector(this.game.players[0]);
  });

  it('exists', function() {
    expect(TileSelector).to.exist;
  });

  describe('reset()', function() {

    it('empties the _selected array', function() {
      this.selector.reset();
      expect(this.selector.getSelected().length).to.equal(0);
    });

  });

  describe('validate()', function() {

    it('returns a TileSelectorResult', function() {
      var tile = getTile(this.game.cube, 'right 4'),
          result = this.selector.validate(tile);
      expect(result).to.be.an.instanceof(TileSelectorResult);
    });

  });

});
