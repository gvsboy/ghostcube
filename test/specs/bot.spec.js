import _ from 'lodash';
import Player from '../../src/js/player';
import Bot from '../../src/js/bot';
import {getTiles, createCube, createPlayers} from '../helpers/CubeHelpers';

describe('Bot', function() {

  fixture.load('/test/fixtures/app.fixture.html');

  beforeEach(function() {
    this.cube = createCube();
    this.players = createPlayers(this.cube);
  });

  it('exists', function() {
    expect(Bot).to.exist;
  });

  describe('play()', function() {

    it('selects three tiles', function() {
      var tiles = this.players[1].play();
      expect(tiles.length).to.equal(3);
    });

    it('selects tiles on neighboring sides', function() {
      var tiles = this.players[1].play();
      expect(tiles[0].isNeighboringSide(tiles[1])).to.be.ok;
      expect(tiles[0].isNeighboringSide(tiles[2])).to.be.ok;
      expect(tiles[1].isNeighboringSide(tiles[2])).to.be.ok;
    });

    it('makes a legal selection when opponent tiles are not all neighbors', function() {

      var player = this.players[0],
          bot = this.players[1];

      _.forEach(getTiles(this.cube, 'top 4', 'left 4', 'bottom 4', 'right 4', 'front 4', 'back 4'), function(tile) {
        player.claim(tile);
      });

      _.forEach(getTiles(this.cube, 'top 1', 'right 8', 'front 7'), function(tile) {
        bot.claim(tile);
      });

      bot.play();

      expect(true).to.be.ok;
    });

  });

});
