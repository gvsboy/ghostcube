import _ from 'lodash';
import Game from '../../src/js/game';
import {getAllTilesForSides} from '../helpers/CubeHelpers';

describe('Game', function() {

  fixture.load('/test/fixtures/app.fixture.html');

  beforeEach(function() {
    this.game = new Game('container');
    this.game.cube.build();
    this.game.initializeGame();
  });

  it('exists', function() {
    expect(Game).to.exist;
  });

  describe('_resetGameState()', function() {

    it('selects the user for the first turn', function() {
      this.game._resetGameState();
      expect(this.game.currentPlayer).to.equal(_.first(this.game.players));
    });

  });

  describe('setCurrentPlayer()', function() {

    it('invokes _stalemate if there are no valid moves', function() {

      var player = this.game.players[0],
          tiles = getAllTilesForSides(this.game.cube, 'top', 'bottom', 'left', 'right', 'front'),
          spy = sinon.spy(this.game, '_stalemate');

       _.forEach(tiles, function(tile) {
          player.claim(tile);
        });

      this.game.setCurrentPlayer(this.game.players[1]);

      expect(spy.called).to.be.ok;
    });

  });

});
