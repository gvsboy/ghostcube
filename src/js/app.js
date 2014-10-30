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

  // The three selected tiles to place pieces on.
  this.selectedTiles = [];

  // Cross-selected tile for helping attacks.
  this._helperTile = null;

  // Step-by-step instruction component.
  this.tutorial = new Tutorial();

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
    this.players = [
      new Player('Kevin', 'player1'),
      //new Player('Jon', 'player2')
      new Bot('CPU', 'player2')
    ];
    this.setCurrentPlayer(_.first(this.players));

    console.log('player1 bot?', this.players[0].isBot());
    console.log('player2 bot?', this.players[1].isBot());

    // Begin the rendering.
    this.renderer.initialize();

    cube
      .listenTo('click', this._handleClick, this)
      .listenTo('mouseover', this._handleMouseOver, this)
      .listenTo('mouseout', this._handleMouseOut, this);

    cube.on('renderstart', _.bind(this.clearHelperTile, this));

    this.tutorial.next().next();
  },

  setCurrentPlayer: function(player) {
    var cubeEl = this.cube.el;
    cubeEl.classList.add(player.tileClass + '-turn');
    if (this.currentPlayer) {
      cubeEl.classList.remove(this.currentPlayer.tileClass + '-turn');
    }
    this.currentPlayer = player;
    this.messages.add(player.name + '\'s turn!', 'alert');
  },

  selectTile: function(tile) {
    tile.addClass('selected');
    this.selectedTiles.push(tile);
    this.cube.updateAdjacentTiles(tile, function(tile) {
      tile.addClass('highlighted');
    });
  },

  deselectTile: function(tile) {
    tile.removeClass('selected');
    _.pull(this.selectedTiles, tile);
    this.cube.updateAdjacentTiles(tile, function(tile) {
      tile.removeClass('highlighted');
    });
  },

  clearHelperTile: function() {
    if (this._helperTile) {
      this._helperTile.removeClass('helper');
    }
    this._helperTile = null;
  },

  claim: function() {

    // Set the selected tiles to the player's color.
    _.forEach(this.selectedTiles, function(tile) {
      tile.claim(this.currentPlayer);
    }, this);

    // Remove all helpers.
    this.clearHelperTile();
    this.deselectTile(_.first(this.selectedTiles));

    this.selectedTiles = [];

    this._endTurn();
  },

  checkWin: function() {

    var winLines = [],
        size = this.cube.size,
        player = this.currentPlayer;

    // Loop through each cube side.
    _.forEach(this.cube._sides, function(side) {

      // Find all the tiles claimed by this player.
      var claimedTiles = _.filter(side.getTiles(), {claimedBy: player}),
          map;

      // If there are not enough tiles available for a line, exit immediately.
      if (claimedTiles.length < size) {
        return;
      }

      // Build an index map of the claimed tiles for faster lookup.
      map = _.times(Math.pow(size, 2), function(i) {
        return _.find(claimedTiles, {index: i});
      });

      // Check for vertical matches.
      // Inspect each starting index from 0 and leftwards.
      _.forEach(_.at(map, _.times(size)), function(tile) {
        var line;

        // If a tile exists at an index, begin searching rightwards.
        if (tile) {
          line = _.at(map, _.times(size - 1, function(i) {
            return tile.index + ((i + 1) * size);
          }));

          // Push the original tile on the line stack.
          line.push(tile);

          // If the limit is reached, the line is complete. It's a win!
          if (_.compact(line).length === size) {
            winLines.push(line);
          }
        }
      });
      
      // Check for horizontal matches.
      // Inspect each starting index from 0 and downwards.
      _.forEach(_.at(map, _.times(size, function(i) { return i * size })), function(tile) {
        var line;

        // If a tile exists at an index, begin searching rightwards.
        if (tile) {
          line = _.at(map, _.times(size - 1, function(i) {
            return tile.index + (i + 1);
          }));

          // Push the original tile on the line stack.
          line.push(tile);

          // If the limit is reached, the line is complete. It's a win!
          if (_.compact(line).length === size) {
            winLines.push(line);
          }
        }
      });

    });

    // Return the number of winning lines (or 0 if no win).
    return winLines.length;
  },

  _endTurn: function() {

    var winBy = this.checkWin(),
        player = this.currentPlayer,
        modifier;

    // If a player wins, display a message and exit.
    if (winBy) {
      modifier = winBy > 1 ? ' x' + winBy + '!' : '!';
      this.messages.add(player.name + ' wins' + modifier, 'alert');
      return;// just return for now. should set a win state.
    }

    // Else, switch players and continue.
    this.setCurrentPlayer(this.players[this.players.indexOf(player) === 1 ? 0 : 1]);
  },

  // Potentially dangerous as this is hackable...
  // Perhaps do a straigh-up element match too?
  _getTileFromElement: function(el) {
    var data;
    if (el.classList.contains('tile')) {
      data = el.id.split('-');
      return this.cube.getSide(data[0]).getTiles(data[1])[0];
    }
    return null;
  },

  _determineHelperHighlight: function(evt, callback) {

    // The tile the user is interacting with.
    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = _.first(this.selectedTiles);

    // If the user is hovering on a neighboring side of the initial tile,
    // highlight some targeting help on a visible side.
    if (tile && initialTile && initialTile.side.isNeighbor(tile.side)) {
      this.cube.updateHelperHighlight(tile, initialTile, callback);
    }
  },

  _handleClick: function(evt) {

    // Get the target element from the event.
    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = _.first(this.selectedTiles);

    // If the target is a tile, let's figure out what to do with it.
    if (tile) {

      // If the tile is already claimed, get outta dodge.
      if (tile.claimedBy) {
        this.messages.add('claimed');
        return;
      }

      // If nothing has been selected yet, select the tile normally.
      if (!initialTile) {
        this.selectTile(tile);
        this.tutorial.next();
      }

      // Otherwise, there must be a selected tile already.
      else {

        // Deselect the tile if it is the target.
        if (tile === initialTile) {
          this.deselectTile(tile);
        }

        // Otherwise, try and make a match.
        else {

          // If the same side was selected, deselect the initial and select the new.
          if (tile.side === initialTile.side) {
            this.deselectTile(initialTile);
            this.selectTile(tile);
          }

          // Else if the side selected is not a neighbor, display an error.
          else if (!initialTile.side.isNeighbor(tile.side)) {
            this.messages.add('notNeighbor');
          }

          // Otherwise, we're on a good side. Let's drill down further.
          else {

            // If the attack target is claimed by the current player, don't claim it again!
            if (this._helperTile.claimedBy) {
              if (this._helperTile.claimedBy === this.currentPlayer) {
                this.messages.add('targetClaimed');
              }
              // Otherwise, cancel the two tiles out.
              else {
                this._helperTile.release();
                this.selectedTiles.push(tile);
                this.claim();
              }
            }

            // Otherwise, a valid selection has been made! Claim both.
            else {
              this.selectedTiles.push(tile, this._helperTile);
              this.claim();
              this.tutorial.next().next();
            }
          }
        }
      }
    };
  },

  _handleMouseOver: function(evt) {
    this._determineHelperHighlight(evt, _.bind(function(tile) {
      tile.addClass('helper');
      this._helperTile = tile;
    }, this));
  },

  _handleMouseOut: function(evt) {
    this._determineHelperHighlight(evt, function(tile) {
      tile.removeClass('helper');
    });
  }

};
