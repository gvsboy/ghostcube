function Tile(id) {
  this.el = this.build(id);
  this._classList = this.el.classList;
}

Tile.prototype = {

  build: function(id) {
    var el = document.createElement('div');
    el.id = id;
    el.className = 'tile';

    // debug
    var idData = id.split('-');
    el.appendChild(document.createTextNode(idData[0].slice(0, 2) + idData[1]));

    return el;
  },

  addClass: function(name) {
    this._classList.add(name);
  },

  removeClass: function(name) {
    this._classList.remove(name);
  },

  toggleClass: function(name) {
    this._classList.toggle(name);
  }

};
