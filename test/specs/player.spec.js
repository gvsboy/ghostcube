import _ from 'lodash';
import Game from '../../src/js/game';
import Player from '../../src/js/player';
import {getTile, getAllTilesForSides} from '../helpers/CubeHelpers';

describe('Player', function() {

  fixture.load('/test/fixtures/app.fixture.html');

  beforeEach(function() {
    this.game = new Game('container');
    this.game.cube.build();
    this.game.initialize();
    this.player = this.game.players[0];
  });

  it('exists', function() {
    expect(Player).to.exist;
  });

  describe('hasValidMoves()', function() {

    it('returns true if there are available tiles to select', function() {
      expect(this.player.hasValidMoves()).to.be.ok;
    });

    it('returns false if there are no valid matches', function() {

      var player = this.player,
          tiles = getAllTilesForSides(this.game.cube, 'top', 'bottom', 'left', 'right', 'front');

      _.forEach(tiles, function(tile) {
        player.claim(tile);
      });

      expect(player.hasValidMoves()).to.not.be.ok;
    });

    it('returns true if there is only one valid match', function() {

      var player = this.player,
          cube = this.game.cube,
          tiles = getAllTilesForSides(cube, 'top', 'bottom', 'left', 'right', 'front', 'back');

      _.forEach(tiles, function(tile) {
        player.claim(tile);
      });

      player.release(getTile(cube, 'front 4'));
      player.release(getTile(cube, 'top 4'));
      player.release(getTile(cube, 'right 4'));

      expect(player.hasValidMoves()).to.be.ok;
    });
  });

});
