import _ from 'lodash';
import Player from './player';

class Bot extends Player {

  constructor(name, tileClass, cube, opponent) {
    super(name, tileClass, cube);
    this.opponent = opponent;
  }

  isBot() {
    return true;
  }

  /**
   * Run through a list of tile selection commands in order of urgency.
   * For instance, winning moves are more urgent than blocking single tiles.
   * @return {Array} A collection of tiles selected.
   */
  play() {

    // Init log.
    this._logText = '';
    this._log('================== BOT MOVE ==================');

    // Is a bot win possible?
    this._selectLines() ||

    // Is a player (opponent) win possible?
    this._selectOpponentLines() ||

    // Are there available bot singles to extend into lines?
    this._selectSingles() ||

    // Are there available player (opponent) singles to block lines?
    this._selectOpponentSingles() ||

    // Is there any possible move at all?!
    this.selectRandom();

    // Return what we have, which is hopefully a trio of selected tiles.
    return this._selector.getSelected();
  }

  getAttackTile(tile1, tile2) {
    console.log('BOT attack tile!');
    return this._cubeCache._cube.getAttackTile(tile1, tile2);
  }

  /**
   * Find lines to complete, either to win the game or to block
   * the opponent.
   * @param  {Boolean} useOpponent Should we use the opponent's lines?
   * @return {Boolean} Was a match successful?
   */
  _selectLines(useOpponent) {

    var lines = useOpponent ? this.opponent.getLines() : this.getLines();
    this._log('++++++ LINES' + (useOpponent ? ' OPPONENT:' : ':'), lines);

    return _.some(lines, line => {

      var initial = this.getInitialTile(),
          tile = line.missingTiles()[0],
          attack;

      this._log('+++ lines loop [initial, tile] :', initial, tile);

      // If there's a tile selected already, try to seal the deal with two more.
      if (initial && tile) {
        attack = this.getAttackTile(initial, tile);
        return attack && this.selectTile(tile, attack).success();
      }
      else {
        this.selectTile(tile);
      }
    });
  }

  /**
   * Block the opponent's lines to prevent a win.
   * Relies on _selectLines.
   * @return {Boolean} Was a match successful?
   */
  _selectOpponentLines() {
    return this._selectLines(true);
  }

  /**
   * Find singles to surround, either to build bot lines or to block the
   * opponent from building lines.
   * @param  {Boolean} useOpponent Should we use the opponent's singles?
   * @return {Boolean} Was a match successful?
   */
  _selectSingles(useOpponent) {

    var singles = _.shuffle(useOpponent ? this.opponent.getSingles() : this.getSingles());
    this._log('------ SINGLES' + (useOpponent ? ' OPPONENT:' : ':'), singles);

    return _.some(singles, single => {

      var initial = this.getInitialTile(),
          tile,
          attack;

      // If there is no initial tile or this singles selection is on a neighboring
      // side, make a selection attempt.
      if (!initial || single.isNeighboringSide(initial)) {
        tile = this._selectByTileLine(single);
      }

      this._log('--- singles loop [initial, tile] :', initial, tile);

      if (initial && tile) {
        attack = this.getAttackTile(initial, tile);
        console.log('attack tile:', attack);
        this._selector.revert();
        return attack && this.selectTile(tile, attack).success();
      }
    });
  }

  /**
   * Surround opponent's singles to block further line creation.
   * Relies on _selectSingles.
   * @return {Boolean} Was a match successful?
   */
  _selectOpponentSingles() {
    return this._selectSingles(true);
  }

  /**
   * Attempts to select a tile on the same line as the given tile.
   * Scans both x and y lines, shuffling the collection.
   * @param  {Tile} tile The target tile.
   * @return {Tile} The selected tile.
   */
  _selectByTileLine(tile) {

    // Grab all the tiles on the same line as the passed tile.
    var lineTiles = _.shuffle(tile.getAllLineTiles());

    // Return the first tile that is a valid selection.
    return _.find(lineTiles, lineTile => this.selectTile(lineTile).success());
  }

  /**
   * A simple logging mechanism to record the bot's thoughts.
   * Used in the Recorder object which looks for the _logText property.
   */
  _log() {

    var text = _.reduce(arguments, function(lines, data) {
      lines.push(!_.isEmpty(data) ? data.toString() : 'NONE');
      return lines;
    }, []).join(' ');

    // Immediately output the message in the console.
    console.log(text);

    // Append the text to the master log.
    this._logText += text + '\n';
  }

}

Bot.THINKING_SPEED = 600;

export default Bot;
