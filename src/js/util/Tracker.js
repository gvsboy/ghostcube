
// The analytics script to load.
var SCRIPT_ENDPOINT = '//www.google-analytics.com/analytics.js',

    // The analytics account id.
    ACCOUNT = 'UA-2196067-3',

    // The analytics global namespace.
    TRACKER_NAMESPACE = 'ga';

/**
 * A lightweight wrapper around whatever tracking interface is being used.
 * Currently, this interface is Google Analytics.
 */
class Tracker {

  /**
   * Creates a new Tracker instance and sets up the GA environment if it
   * hasn't been initialized already.
   * @constructor
   */
  constructor() {
    if (!window.ga) {
      this._initGateway();
    }
  }

  /**
   * Dispatches a game category event, such as 'start' or 'bot-win'.
   * @param {String} action The action to track.
   * @param {Number} [turns] How many turns have elapsed.
   */
  sendGameEvent(action, turns) {

    var fields = {
      hitType: 'event',
      eventCategory: 'game',
      eventAction: action
    };

    if (turns) {
      fields.eventValue = turns;
    }

    ga('send', fields);
  }

  /**
   * Creates a temporary global ga object, loads analytics.js, and fires off
   * a pageview event.
   */
  _initGateway() {

    var win = window,
        doc = win.document,
        script = doc.createElement('script'),
        placeholder = doc.getElementsByTagName('script')[0];

    // Acts as a pointer to support renaming.
    win.GoogleAnalyticsObject = TRACKER_NAMESPACE;

    // Creates an initial ga() function.  The queued commands will be executed once analytics.js loads.
    win[TRACKER_NAMESPACE] = win[TRACKER_NAMESPACE] || function() {
      (win[TRACKER_NAMESPACE].q = win[TRACKER_NAMESPACE].q || []).push(arguments);
    };

    // Sets the time (as an integer) this tag was executed.  Used for timing hits.
    win[TRACKER_NAMESPACE].l = 1 * new Date();

    // Insert the script tag asynchronously.
    script.async = 1;
    script.src = SCRIPT_ENDPOINT;
    placeholder.parentNode.insertBefore(script, placeholder);

    // Create the tracker and send a pageview hit.
    ga('create', ACCOUNT, 'auto');
    ga('send', 'pageview');
  }

}

Tracker.GAME_START = 'start';
Tracker.GAME_RESET = 'reset';
Tracker.GAME_BOT_WIN = 'bot-win';
Tracker.GAME_PLAYER_WIN = 'player-win';
Tracker.GAME_STALEMATE = 'stalemate'

export default Tracker;
