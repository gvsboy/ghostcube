function App(containerId) {

  // The site container which houses the cube and intro text.
  this.container = document.getElementById(containerId);

  // Check if the client is on a mobile device.
  this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

  // The fun part!
  this.cube = new Cube(this.container.getElementsByClassName('cube')[0]);

  // UI for displaying various messages.
  this.messages = new Messages();

  // An object that detects user interaction to manipulate the cube.
  this.renderer = new Renderer(this.cube, this.isMobile);

  // In-game players.
  this.players = null;
  this.currentPlayer = null;

  // Cross-selected tile for helping attacks.
  this._helperTile = null;

  // Step-by-step instruction component.
  this.tutorial = new Tutorial();

  // Records moves as they're made. Can be used to step through time.
  this.recorder = new Recorder(this);

  // Listen for user interactions.
  this.listen();
}

App.prototype = {

  // I hate everything in here...
  listen: function() {

    var self = this,
        cube = this.cube,
        cubeEl = cube.el,
        container = this.container;

    function beginGame(evt) {
      // Every animated cube face will bubble up their animation events
      // so let's react to only one of them.
      if (evt.target === container) {
        container.removeEventListener(Vendor.EVENT.animationEnd, beginGame);
        cube.build();
      }
    }

    function cubeClicked() {
      cubeEl.classList.remove('splash');
      cubeEl.removeEventListener('click', cubeClicked);
      container.classList.add('game');
      container.addEventListener(Vendor.EVENT.animationEnd, beginGame);
    }

    cubeEl.addEventListener('click', cubeClicked);

    // When the cube has initialized, start the rendering object.
    cube.on('init', _.bind(this._realListen, this));

    // The message box listens for messages to display.
    this.messages.listenTo(this.tutorial);
  },

  // This is where the cube's listeners are created. For reals.
  _realListen: function() {

    var cube = this.cube;

    // Create the players and set the first one as current.
    var human = new Player('Kevin', 'player1', cube);
    var bot = new Bot('CPU', 'player2', cube, human);
    this.players = [human, bot];
    this.setCurrentPlayer(_.first(this.players));

    // Begin the rendering.
    this.renderer.initialize();

    this.renderer.on('start', _.bind(this.clearHelperTile, this));

    // Not really into this but sure for now.
    _.forEach(this.players, function(player) {
      player
        .on('player:initialSelected', _.bind(this.showCrosshairs, this))
        .on('player:initialDeselected', _.bind(this.hideCrosshairs, this))
        .on('player:claim', _.bind(this.claim, this))
    }, this);

    this.tutorial.next().next();
  },

  enableCubeInteraction: function() {
    this.cube
      .listenTo('click', this._handleClick, this)
      .listenTo('mouseover', this._handleMouseOver, this)
      .listenTo('mouseout', this._handleMouseOut, this);
  },

  disableCubeInteraction: function() {
    this.cube
      .stopListeningTo('click')
      .stopListeningTo('mouseover')
      .stopListeningTo('mouseout');
  },

  /**
   * Sets the current player to the passed player, displaying the correct
   * messaging and updating the UI state.
   * @param {Player} player    The player to set as the current player.
   * @param {Boolean} botManual Should the bot play it's turn automatically?
   *                            Used in recorder mode to pause auto playback.
   */
  setCurrentPlayer: function(player, botManual) {
    var cubeEl = this.cube.el;
    cubeEl.classList.add(player.tileClass + '-turn');
    if (this.currentPlayer) {
      cubeEl.classList.remove(this.currentPlayer.tileClass + '-turn');
    }
    this.currentPlayer = player;
    this.messages.add(player.name + '\'s turn!', 'alert');

    if (player.isBot()) {
      this.disableCubeInteraction();
      if (!botManual) {
        player.play();
      }
    }
    else {
      this.enableCubeInteraction();
    }
  },

  getOpponent: function(player) {
    return this.players[this.players.indexOf(player) === 1 ? 0 : 1];
  },

  showCrosshairs: function(tile) {
    tile.addClass('selected');
    this.cube.updateCrosshairs(tile, function(tile) {
      tile.addClass('highlighted');
    });
    this.tutorial.next();
  },

  hideCrosshairs: function(tile) {
    tile.removeClass('selected');
    this.cube.updateCrosshairs(tile, function(tile) {
      tile.removeClass('highlighted');
    });
  },

  clearHelperTile: function() {
    if (this._helperTile) {
      this._helperTile.removeClass('helper');
    }
    this._helperTile = null;
  },

  claim: function(tiles) {
    this.recorder.record(this.currentPlayer, tiles);
    this.clearHelperTile();
    this.hideCrosshairs(_.first(tiles));
    this._endTurn();
  },

  _endTurn: function() {

    var player = this.currentPlayer,
        winBy = player.getWinLines().length,
        modifier;

    // If a player wins, display a message and exit.
    if (winBy) {
      modifier = winBy > 1 ? ' x' + winBy + '!' : '!';
      this.messages.add(player.name + ' wins' + modifier, 'alert');
      //return;// just return for now. should set a win state.
    }

    // Else, switch players and continue.
    this.setCurrentPlayer(this.getOpponent(player));
  },

  // Potentially dangerous as this is hackable...
  // Perhaps do a straigh-up element match too?
  _getTileFromElement: function(el) {
    var data;
    if (el.classList.contains('tile')) {
      data = el.id.split('-');
      return this.cube.getSides(data[0]).getTiles(data[1])[0];
    }
    return null;
  },

  _handleClick: function(evt) {

    // Get the target element from the event.
    var tile = this._getTileFromElement(evt.target);

    // If the tile exists, try to select it.
    if (tile) {
      try {
        this.currentPlayer.selectTile(tile, this._helperTile);
        this.tutorial.next().next();
      }

      // An error was thrown in the tile selection process. Handle it.
      catch(e) {
        if (e instanceof SelectTileError) {
          this.messages.add(e.message);
        }
        else {
          throw e;
        }
      }
    }
  },

  _handleMouseOver: function(evt) {

    // The tile the user is interacting with.
    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = this.currentPlayer.getInitialTile();

    // If the user is hovering on a neighboring side of the initial tile,
    // highlight some targeting help on a visible side.
    this._helperTile = this.cube.getAttackTile(tile, initialTile);

    if (this._helperTile) {
      this._helperTile.addClass('helper');
    }
  },

  _handleMouseOut: function(evt) {
    this.clearHelperTile();
  }

};
