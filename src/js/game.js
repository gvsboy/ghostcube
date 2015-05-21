import _ from 'lodash';
import Cube from './cube/cube';
import Player from './player';
import Bot from './bot';
import Renderer from './render/renderer';
import Recorder from './recorder';
import Messages from './messages';
import Tutorial from './tutorial';
import {listenOnce} from './util/util';
import {events} from './util/vendor';
import Tracker from './util/Tracker';

// Instantiate a new Tracker instance which will send the pageview event.
var tracker = new Tracker();

function Game(containerId) {

  // The site container which houses the cube and intro text.
  this.container = document.getElementById(containerId);

  // Check if the client is on a mobile device.
  this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

  // The fun part!
  this.cube = new Cube(this.container.querySelector('.cube'));

  // UI for displaying various messages.
  this.messages = new Messages();

  // An object that detects user interaction to manipulate the cube.
  this.renderer = new Renderer(this.cube, this.isMobile);

  // In-game players.
  this.players = null;
  this.currentPlayer = null;

  // Cross-selected tile for helping attacks.
  this._helperTile = null;

  // Records moves as they're made. Can be used to step through time.
  this.recorder = new Recorder(this);

  // Listen for user interactions.
  this.idle();
}

Game.prototype = {

  /**
   * Configures the cube object's default pre-game state.
   */
  idle: function() {

    var container = this.container,
        hitbox = container.querySelector('#hit');

    // Click the cube to begin the game.
    listenOnce(hitbox, 'click', () => {

      hitbox.style.display = 'none';
      container.classList.add('game');
      this._initializeTutorial();

      listenOnce(container, events.animationEnd, () => {
        this.cube
          .build()
          .then(_.bind(this.initialize, this));
      });
    });
  },

  /**
   * Configures the cube for game mode by creating players, setting listeners,
   * and initializing the renderer.
   */
  initialize: function() {

    // Create the players: A human and a bot.
    var human = new Player('Player', 'player1', this.cube),
        bot = new Bot('CPU', 'player2', this.cube, human);

    this.players = [human, bot];

    // Sets the game turns to 0.
    this.turns = 0;

    // Begin the rendering.
    this.renderer.initialize();

    // Let's clear the helper tile when the cube is rotating.
    this.renderer.on('start', _.bind(this.clearHelperTile, this));

    // Set the current player as the first player. This "officially" begins the game.
    this.setCurrentPlayer(_.first(this.players));

    // Fire an event that signals the first game has begun.
    tracker.sendGameEvent(Tracker.GAME_START);
  },

  enableCubeInteraction: function() {
    this.renderer.listenForInput();
    this.cube
      .listenTo('click', this._handleClick, this)
      .listenTo('mouseover', this._handleMouseOver, this)
      .listenTo('mouseout', this._handleMouseOut, this);
  },

  disableCubeInteraction: function() {
    this.renderer.stopListeningForInput();
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

    // Broadcast that it's the passed player's turn.
    this.messages.add(player.name + '\'s turn!', 'alert');

    // Don't set the same player twice.
    if (this.currentPlayer !== player) {

      this.cube.el.classList.add(player.tileClass + '-turn');
      if (this.currentPlayer) {
        this.cube.el.classList.remove(this.currentPlayer.tileClass + '-turn');
      }

      this.currentPlayer = player;

      // If the player has valid moves, start the turn as usual.
      if (player.hasValidMoves()) {
        if (player.isBot()) {
          this.disableCubeInteraction();
          if (!botManual) {
            this._botTileSelection(player.play());
          }
        }
        else {
          this.enableCubeInteraction();
        }
      }

      // Otherwise, declare a stalemate. Nobody wins.
      else {
        this._stalemate()
      }
    }
  },

  getOpponent: function(player) {
    return this.players[this.players.indexOf(player) === 1 ? 0 : 1];
  },

  showCrosshairs: function(tile) {
    tile.addClass('selected');
    this.cube.updateCrosshairs(tile, tile => tile.addClass('highlighted'));
  },

  hideCrosshairs: function(tile) {
    tile.removeClass('selected');
    this.cube.updateCrosshairs(tile, tile => tile.removeClass('highlighted'));
  },

  clearHelperTile: function() {
    if (this._helperTile) {
      this._helperTile.removeClass('helper');
    }
    this._helperTile = null;
  },

  /**
   * Removes all claimed tiles from each player and destroys all messages.
   * Sets the current player to the first player in the array.
   */
  reset: function() {

    this.messages.removeAll();
    this.cube.el.classList.add('reset');
    tracker.sendGameEvent(Tracker.GAME_RESET);

    this.renderer.setSyncMovement(450, 450).then(() => {
      _.forEach(this.players, player => player.releaseAll());
      this.cube.el.classList.remove('reset');
      this.setCurrentPlayer(_.first(this.players));
      this.turns = 0;
    });
  },

  /**
   * Instantiates a tutorial instance and hooks into methods that should
   * emit lesson messages.
   */
  _initializeTutorial: function() {
    this.tutorial = new Tutorial();
    this.tutorial
      .hook(this, 'initialize', 'start')
      .hook(this, 'showCrosshairs', 'click')
      .hook(this, '_endTurn', 'turn');
    this.messages.listenTo(this.tutorial);
  },

  /**
   * Ends the current player's turn and determines if the game is
   * in a win state.
   * @param  {Array} tiles The tiles selected to end the turn.
   */
  _endTurn: function(tiles) {

    var player = this.currentPlayer,
        lines = player.getWinLines();

    this.turns++;
    this.recorder.record(player, tiles);
    this.clearHelperTile();
    this.hideCrosshairs(_.first(tiles));

    // If the player has made at least one line, end the game.
    if (!this._endGame(lines)) {
      this.setCurrentPlayer(this.getOpponent(player));
    }
  },

  /**
   * Attempts to end the game.
   * @param  {Array} lines The lines used to win.
   * @return {Boolean} Is the game in a win state?
   */
  _endGame: function(lines) {

    var winBy = lines.length,
        modifier;

    if (winBy) {

      // Display message with modifier.
      modifier = winBy > 1 ? ' x' + winBy + '!' : '!';
      this.messages.add(`${this.currentPlayer.name} wins${modifier}`, 'alert persist');

      // Send an event describing the win state.
      tracker.sendGameEvent(this.currentPlayer.isBot() ? Tracker.GAME_BOT_WIN : Tracker.GAME_PLAYER_WIN, this.turns);

      // Show the winning lines.
      _.invoke(lines, 'pulsate');

      // Alert the user on how to start a new game.
      this._waitAndListenForReset();

      // Yes, the game has ended.
      return true;
    }

    // Nobody has won yet. Continue!
    return false;
  },

  /**
   * Reveal messages regarding the stalemate and begin listening to
   * start a new game.
   */
  _stalemate: function() {
    this.messages
      .add('stalemate', 'alert persist')
      .add(`${this.currentPlayer.name} has no valid moves.`, 'persist');
    this._waitAndListenForReset();
    tracker.sendGameEvent(Tracker.GAME_STALEMATE);
  },

  /**
   * After a brief pause, alerts the user about how to start a new game
   * and sets a listener.
   */
  _waitAndListenForReset: function() {

    // Remove the current player and disable cube interactions.
    this.currentPlayer = null;
    this.disableCubeInteraction();

    // After two seconds, display a message to begin a new game and
    // listen for document clicks to reset.
    setTimeout(() => {
      this.messages.add('newGame', 'persist');
      listenOnce(document, 'click', _.bind(this.reset, this));
    }, 2000);
  },

  // Potentially dangerous as this is hackable...
  // Perhaps do a straight-up element match too?
  _getTileFromElement: function(el) {
    var data;
    if (el.classList.contains('tile')) {
      data = el.id.split('-');
      return this.cube.getSides(data[0]).getTiles(data[1])[0];
    }
    return null;
  },

  /**
   * Claimes all the tiles the bot has selected and updates the UI using a
   * flow the user is familiar with.
   * @param  {Array} tiles The tiles the bot has selected.
   */
  _botTileSelection: function(tiles) {

    /**
     * A simple function that returns a promise after after the bot is
     * finished 'thinking'.
     * @return {Promise} A promise resolved after a set period of time.
     */
    var wait = () => {
      return new Promise(resolve => {
        setTimeout(resolve, Bot.THINKING_SPEED);
      });
    };

    // Wait a moment before running through the selection UI updates, which
    // include rotating the cube to display all the tiles, showing crosshairs
    // for the first tile, and then claiming all before ending the turn.
    wait()
      .then(() => this.cube.rotateToTiles(tiles))
      .then(wait)
      .then(() => this.showCrosshairs(tiles[0]))
      .then(wait)
      .then(() => {
        this.currentPlayer.claimAll();
        this._endTurn(tiles);
      })
      .catch(err => {
        console.error(err);
      });
  },

  _handleClick: function(evt) {

    // Get the target element from the event.
    var tile = this._getTileFromElement(evt.target);

    // If the tile exists, try to select it.
    if (tile) {
      this.currentPlayer
        .selectTile(tile, this._helperTile)

        // On success, react based on the number of tiles currently selected.
        .success(data => {

          // Cache the selected tiles.
          var selected = data.selected,
              length = selected && selected.length;

          if (data.deselect) {
            this.hideCrosshairs(data.deselect[0]);
          }

          if (length === 1) {
            this.showCrosshairs(selected[0]);
          }
          else if (length === 3) {
            this.currentPlayer.claimAll();
            this._endTurn(selected);
          }
        })

        // On failure, display a message based on the failure code.
        .failure(code => this.messages.add(code, 'error'));
    }
  },

  _handleMouseOver: function(evt) {

    // The tile the user is interacting with.
    var tile = this._getTileFromElement(evt.target),

        // The first tile that has been selected.
        initialTile = this.currentPlayer.getInitialTile();

    // If the user is hovering on a neighboring side of the initial tile,
    // highlight some targeting help on a visible side.
    this._helperTile = this.currentPlayer.getAttackTile(tile, initialTile);

    if (this._helperTile) {
      this._helperTile.addClass('helper');
    }
  },

  _handleMouseOut: function(evt) {
    this.clearHelperTile();
  }

};

export default Game;
