import Player from '../../src/js/player';
import Bot from '../../src/js/bot';
import {createCube, createPlayers} from '../helpers/CubeHelpers';

describe('Bot', function() {

  fixture.load('/test/fixtures/app.fixture.html');

  beforeEach(function() {
    this.cube = createCube();
    this.bot = createPlayers(this.cube)[1];
  });

  it('exists', function() {
    expect(Bot).to.exist;
  });

  describe('play()', function() {

    beforeEach(function() {
      this.tiles = this.bot.play();
    });

    it('selects three tiles', function() {
      expect(this.tiles.length).to.equal(3);
    });

    it('selects tiles on neighboring sides', function() {
      var tiles = this.tiles;
      expect(tiles[0].isNeighboringSide(tiles[1])).to.be.ok;
      expect(tiles[0].isNeighboringSide(tiles[2])).to.be.ok;
      expect(tiles[1].isNeighboringSide(tiles[2])).to.be.ok;
    });

  });

});
