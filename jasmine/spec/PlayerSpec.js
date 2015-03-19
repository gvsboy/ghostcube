describe('Player', function() {

  beforeEach(function() {
    this.app = new App('container');
    this.app.cube.build();
    this.app.initializeGame();
    this.player = this.app.players[0];
  });

  it('exists', function() {
    expect(Player).toBeDefined();
  });

  describe('isStalemate()', function() {

    it('returns false if there are available tiles to select', function() {
      expect(this.player.isStalemate()).not.toBeTruthy();
    });

    it('returns true if there are no valid matches', function() {

      var player = this.player,
          tiles = getAllTilesForSides(this.app.cube, 'top', 'bottom', 'left', 'right', 'front');

      _.forEach(tiles, function(tile) {
        player.claim(tile);
      });

      expect(player.isStalemate()).toBeTruthy();
    });

    it('returns false if there is only one valid match', function() {

      var player = this.player,
          cube = this.app.cube,
          tiles = getAllTilesForSides(cube, 'top', 'bottom', 'left', 'right', 'front', 'back');

      _.forEach(tiles, function(tile) {
        player.claim(tile);
      });

      player.release(getTile(cube, 'front 4'));
      player.release(getTile(cube, 'top 4'));
      player.release(getTile(cube, 'right 4'));

      expect(player.isStalemate()).not.toBeTruthy();
    });
  });

});
