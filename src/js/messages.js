function Messages() {
  this.delay = 100;
  this.queue = [];
  this.container = this._buildContainer();
  this.container.addEventListener(Vendor.EVENT.animationEnd, _.bind(this._remove, this));
}

Messages.prototype = {

  listenTo: function(source) {
    source.on('message', _.bind(this.add, this));
  },

  /**
   * Creates a new message to add to the queue.
   * @param {String} message The message text.
   * @param {String} classes A space-separated list of classes to append to the message.
   * @return {Messages} Returns itself for chaining.
   */
  add: function(message, classes) {

    // Generate a new element to contain the message.
    var item = document.createElement('li');

    // Add special classes to decorate the message if passed.
    // We want to use apply here because add takes multiple arguments,
    // not an array of names.
    if (classes) {
      DOMTokenList.prototype.add.apply(item.classList, classes.split(' '));
    }

    // Get the correct message by passed key.
    if (message.split(' ').length === 1) {
      message = Messages.LIST[message];
    }

    // Append the message to the new element and queue it up.
    item.appendChild(document.createTextNode(message));
    this._enqueue(item);

    return this;
  },

  /**
   * Removes all persisted messages from the queue by adding the 'hide'
   * class to each one.
   */
  removeAll: function() {
    _.forEach(this.container.children, item => item.classList.add('hide'));
  },

  _enqueue: function(item) {

    var container = this.container,
        queue = this.queue,
        delay = queue.length * this.delay;

    queue.push(item);

    _.delay(function(i) {
      container.appendChild(item);
      if (_.last(queue) === i) {
        queue.length = 0;
      }
    }, delay, item);
  },

  /**
   * Removes a message item referenced by the passed animationend event.
   * The message will be removed if it's not persistent or it contains
   * the 'hide' class.
   * @param  {animationend} evt An animationend event.
   */
  _remove: function(evt) {
    var classList = evt.target.classList;
    if (!classList.contains('persist') || classList.contains('hide')) {
      this.container.removeChild(evt.target);
    }
  },

  _buildContainer: function() {
    var container = document.createElement('ul');
    container.id = 'messages';
    document.body.appendChild(container);
    return container;
  }

};

Messages.LIST = {
  claimed: 'This tile is already claimed!',
  targetClaimed: 'The attack target is already claimed by you!',
  sameSide: 'Same side! Choose a tile on a different side.',
  notNeighbor: 'Not a neighboring side! Choose a tile different side.',
  stalemate: 'Stalemate!',
  newGame: 'Click anywhere to begin a new game.'
};
