describe('TileSelector', function() {

  beforeEach(function() {
    this.app = new App('container');
    this.app.cube.build();
    this.app.initializeGame();
    this.selector = new TileSelector(this.app.players[0]);
  });

  it('exists', function() {
    expect(TileSelector).toBeDefined();
  });

  describe('validate()', function() {

    it('returns a TileSelectorResult', function() {
      var tile = getTile(this.app.cube, 'right 4'),
          result = this.selector.validate(tile);
      expect(result instanceof TileSelectorResult).toBeTruthy();
    });

  });

});