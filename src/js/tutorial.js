/**
 * A lightweight guided tutorial helper that is attached to a specific
 * event-emitting object, such as the cube. Displays helpful messages
 * to teach the player how to play.
 * @param {Object} target An event-emitting object to provide guidance for.
 * @class
 */
function Tutorial() {
  EventEmitter2.call(this);
}

Tutorial.prototype = {

  /**
   * Wraps an object's method with another method that invokes the
   * tutorial's emission of a message event. This emission happens
   * only once, and restores the previous method's state afterwards.
   * @param  {Object} obj The host object.
   * @param  {String} methodName The method name to wrap.
   * @param  {String} key The lesson key.
   * @return {Tutorial} This tutorial instance for chaining.
   */
  hook: function(obj, methodName, key) {
    var oldMethod = obj[methodName];
    obj[methodName] = _.bind(function() {
      var result = oldMethod.apply(obj, arguments);
      this.emit('message', Tutorial.lessons[key], 'info');
      obj[methodName] = oldMethod;
      return result;
    }, this);
    return this;
  }

};

// Mixin EventEmitter methods.
_.assign(Tutorial.prototype, EventEmitter2.prototype);

// List of step messages.
Tutorial.stepMessages = [
  'Let\'s play! Click any tile to begin.',
  'Rotate the cube using the arrow keys or WASD.',
  'Great! Now, click a tile on an adjacent side.',
  'Nice! A third tile was selected automatically for you.',
  'Try to make a line on one side.'
];

Tutorial.lessons = {
  start: [
    'Let\'s play! Click any tile to begin.',
    'Rotate the cube using the arrow keys or WASD.'
  ],
  click: 'Great! Now, click a tile on an adjacent side.',
  turn: [
    'Nice! A third tile was selected automatically for you.',
    'Try to make a line on one side!'
  ]
};
