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

  describe('_stalemate()', function() {

    it('should be invoked if the bot has no valid moves', function() {

      var bot = app.players[1],
          tiles = getAllTilesForSides(app.cube, 'top', 'bottom', 'left', 'right', 'front');

      _.forEach(tiles, function(tile) {
        bot.claim(tile);
      });

      bot.play();

      expect(app._stalemate).toHaveBeenCalled();
    });

    xit('should be invoked if the player has no valid moves', function() {

      var player = app.players[0],
          tiles = getAllTilesForSides(app.cube, 'top', 'bottom', 'left', 'right', 'front');

       _.forEach(tiles, function(tile) {
          player.claim(tile);
        });

       expect(app._stalemate).toHaveBeenCalled();
    });

  });

  describe('_handleClick()', function() {

    it('is invoked when it\'s the user\'s turn', function() {
      app.cube.el.click();
      expect(app._handleClick).toHaveBeenCalled();
    });

    it('is not invoked when it\'s the bot\'s turn', function() {
      app.setCurrentPlayer(app.players[1], true);
      app.cube.el.click();
      expect(app._handleClick.calls.count()).toEqual(0);
    });

  });

});
