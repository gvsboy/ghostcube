/**
 * A lightweight guided tutorial helper that is attached to a specific
 * event-emitting object, such as the cube. Displays helpful messages
 * to teach the player how to play.
 * @param {Object} target An event-emitting object to provide guidance for.
 * @class
 */
function Tutorial() {

  // What step is the tutorial on?
  this.step = 0;

  // How many steps are there?
  this.maxStep = 5;

  // EventEmitter constructor call.
  EventEmitter2.call(this);
}

Tutorial.prototype = {

  next: function() {
    if (!this.isDone()) {
      this.emit('message', Tutorial.stepMessages[this.step], 'info');
      this.step++;
    }
    return this;
  },

  isDone: function() {
    return this.step >= this.maxStep;
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
