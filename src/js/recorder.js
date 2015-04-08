import _ from 'lodash';
import Tile from './cube/tile';

function Recorder(app) {
  this._timeline = [];
  this._cursor = 0;
  this._app = app;
}

Recorder.MESSAGES = {
  NOT_FOUND: 'Could not locate a turn at ',
  REWRITE: 'Turns are now being rewritten as the timeline was behind by ',
  NO_LOG: '[No log for this turn]'
};

Recorder.prototype = {

  record: function(player, tiles) {

    var behind = this._timeline.length - this._cursor;

    if (behind) {
      console.warn(Recorder.MESSAGES.REWRITE + behind);
      this._timeline = _.dropRight(this._timeline, behind);
    }

    this._package(player, tiles);
    this._cursor++;
  },

  forward: function() {

    var turnData = this._timeline[this._cursor];

    if (turnData) {
      _.forEach(turnData.tiles, function(tile) {
        if (tile instanceof Tile) {
          turnData.player.claim(tile);
        }
        else {
          tile.player.release(tile.tile);
        }
      });
      console.log(turnData.log);
      this._cursor++;
      this._app.setCurrentPlayer(this._app.getOpponent(turnData.player), true);
    }
    else {
      throw Recorder.MESSAGES.NOT_FOUND + this._cursor;
    }
  },

  reverse: function() {

    var turnData = this._timeline[this._cursor - 1];

    if (turnData) {
      _.forEach(turnData.tiles, function(tile) {
        if (tile instanceof Tile) {
          turnData.player.release(tile);
        }
        else {
          tile.player.claim(tile.tile);
        }
      });
      this._cursor--;
      this._app.setCurrentPlayer(turnData.player, true);
    }
    else {
      throw Recorder.MESSAGES.NOT_FOUND + this._cursor;
    }
  },

  _package: function(player, tiles) {
    this._timeline.push({
      player: player,
      tiles: tiles,
      log: player._logText || Recorder.MESSAGES.NO_LOG
    });
  }

};

export default Recorder;
