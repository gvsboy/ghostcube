function Recorder() {
  this._timeline = [];
  this._cursor = 0;
}

Recorder.MESSAGES = {
  NOT_FOUND: 'Could not locate a turn at ',
  REWRITE: 'Turns are now being rewritten as the timeline was behind by '
};

Recorder.prototype = {

  record: function(player, tiles) {

    var behind = this._timeline.length - this._cursor;

    if (behind) {
      console.warn(Recorder.MESSAGES.REWRITE + this._cursor);
      // Upgrade lodash and then use:
      // this._timeline = _.dropRight(this._timeline, behind);
    }

    this._package(player, tiles);
    this._cursor++;
  },

  forward: function() {

    var turnData = this._timeline[this._cursor];

    if (turnData) {
      _.each(turnData.tiles, function(tile) {
        turnData.player.claim(tile);
      });
      this._cursor++;
    }
    else {
      throw Recorder.MESSAGES.NOT_FOUND + this._cursor;
    }
  },

  reverse: function() {

    var turnData = this._timeline[this._cursor - 1];

    if (turnData) {
      _.each(turnData.tiles, function(tile) {
        turnData.player.release(tile);
      });
      this._cursor--;
    }
    else {
      throw Recorder.MESSAGES.NOT_FOUND + this._cursor;
    }
  },

  _package: function(player, tiles) {
    this._timeline.push({
      player: player,
      tiles: tiles
    });
  }

};
