describe('Bot', function() {

  var cube = createCube(),
      players = createPlayers(cube),
      bot = players[1];

  it('exists', function() {
    expect(Bot).toBeDefined();
  });

  describe('play()', function() {

    var tiles;
    bot.play();
    tiles = bot._triedTiles;

    it('selects three tiles', function() {
      expect(tiles.length).toBe(3);
    });

    it('selects tiles on neighboring sides', function() {
      expect(tiles[0].isNeighboringSide(tiles[1])).toBeTruthy();
      expect(tiles[0].isNeighboringSide(tiles[2])).toBeTruthy();
      expect(tiles[1].isNeighboringSide(tiles[2])).toBeTruthy();
    });

  });

});
