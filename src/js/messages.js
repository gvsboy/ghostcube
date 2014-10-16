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

  add: function(message, type) {
    var item = document.createElement('li');
    if (type) {
      item.className = type;
    }
    if (message.split(' ').length === 1) {
      message = Messages.LIST[message];
    }
    item.appendChild(document.createTextNode(message));
    this._enqueue(item);
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

  _remove: function(evt) {
    this.container.removeChild(evt.target);
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
  targetClaimed: 'The attack target is already claimed!',
  sameSide: 'Same side! Choose a tile on a different side.',
  notNeighbor: 'Not a neighboring side! Choose a tile different side.'
};
