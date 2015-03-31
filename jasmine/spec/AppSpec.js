describe('App', function() {

  var app;

  beforeEach(function() {
    app = new App('container');
    spyOn(app, '_handleClick');
    spyOn(app, '_stalemate');
    app.cube.build();
    app.initializeGame();
  });

  it('exists', function() {
    expect(App).toBeDefined();
  });

  describe('_resetGameState()', function() {

    it('selects the user for the first turn', function() {
      app._resetGameState();
      expect(app.currentPlayer).toEqual(_.first(app.players));
    });

    it('enables the user event handlers', function() {
      app._resetGameState();
      app.cube.el.click();
      expect(app._handleClick).toHaveBeenCalled();
    });

  });

  describe('setCurrentPlayer()', function() {

    it('invokes _stalemate if there are no valid moves', function() {

      var player = app.players[0],
          tiles = getAllTilesForSides(app.cube, 'top', 'bottom', 'left', 'right', 'front');

       _.forEach(tiles, function(tile) {
          player.claim(tile);
        });

      app.setCurrentPlayer(app.players[1]);

      expect(app._stalemate).toHaveBeenCalled();
    });

    it('enables clicking when it\'s the user\'s turn', function() {
      app.cube.el.click();
      expect(app._handleClick).toHaveBeenCalled();
    });

    it('disables clicking when it\'s the bot\'s turn', function() {
      app.setCurrentPlayer(app.players[1], true);
      app.cube.el.click();
      expect(app._handleClick.calls.count()).toEqual(0);
    });

  });

});
