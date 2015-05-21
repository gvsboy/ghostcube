import _ from 'lodash';
import {events} from '../util/vendor';
import {listenOnce} from '../util/util';

function Tile(side, index) {

  // Set properties.
  this.el = this.build(side.id + '-' + index);
  this.side = side;
  this.index = index;

  this.claimedBy = null;
  this.xLine = null;
  this.yLine = null;

  // Append the tile's element to the side.
  side.el.appendChild(this.el);
}

Tile.prototype = {

  /**
   * Outputs useful identifying information for troubleshooting.
   * @return {String} Tile information.
   */
  toString: function() {
    return this.el.id;
  },

  build: function(id) {

    // Create the tile element.
    var el = document.createElement('div');
    el.id = id;
    el.className = 'tile';

    // Initialize after a random time. This begins the tile drop animation.
    window.setTimeout(() => this.addClass('init'), Math.random() * 2000);

    // debug
    var idData = id.split('-');
    el.appendChild(document.createTextNode(idData[0].slice(0, 2) + idData[1]));

    return el;
  },

  claim: function(player) {
    this.claimedBy = player;
    this
      .removeClass('unclaimed')
      .addClass('preclaimed')
      .addClass(player.tileClass);

    listenOnce(this.el, events.animationEnd, () => {
      this.removeClass('preclaimed').addClass('claimed');
    });
  },

  release: function() {
    if (this.claimedBy) {
      this
        .addClass('unclaimed')
        .removeClass('claimed')
        .removeClass(this.claimedBy.tileClass)
        .removeClass('win');
      this.claimedBy = null;
    }
  },

  isNeighboringSide: function(tile) {
    return this.side.isNeighbor(tile.side);
  },

  addClass: function(name) {
    this.el.classList.add(name);
    return this;
  },

  removeClass: function(name) {
    this.el.classList.remove(name);
    return this;
  },

  updateLines: function(x, y) {
    this.xLine = x;
    this.yLine = y;
  },

  /**
   * @return {Array} All the tiles composing both lines.
   */
  getAllLineTiles: function() {
    return _.union(this.xLine.getTiles(), this.yLine.getTiles());
  },

  translate: function(toSide) {

    // A translation is a recipe for morphing one line into another.
    // It looks like this: [1, flip]
    // Where: The first index is the coordinate to use in a line pair
    //        The remaining indicies are methods to invoke on the line
    var translation = Tile.translationMap[this.side.id][toSide ? toSide.id : null],

        // The line from the line pair to use.
        line = _.first(translation) === 'x' ? this.xLine : this.yLine;

    if (translation) {

      // Run through each translation method (flip, rotate) and return the result.
      var newLine = _.reduce(_.rest(translation), function(transformedLine, method) {
        return transformedLine[method]();
      }, line);

      return toSide.getTiles(newLine.indicies());
    }

    return null;
  }

};

Tile.translationMap = (function() {

  var X = 'x',
      Y = 'y',
      FLIP = 'flip',
      ROTATE = 'rotate';

  // Line coordinate mapping to side id.
  // [coordinate, methods...]
  return {

    front: {
      top:      [Y],                // top
      bottom:   [Y],                // bottom
      left:     [X],                // left
      right:    [X]                 // right
    },

    back: {
      bottom:   [Y, FLIP],          // top
      top:      [Y, FLIP],          // bottom
      left:     [X],                // left
      right:    [X]                 // right
    },

    top: {
      back:     [Y, FLIP],          // top
      front:    [Y],                // bottom
      left:     [X, ROTATE],        // left
      right:    [X, FLIP, ROTATE],  // right
    },

    bottom: {
      front:    [Y],                // top
      back:     [Y, FLIP],          // bottom
      left:     [X, FLIP, ROTATE],  // left
      right:    [X, ROTATE]         // right
    },

    left: {
      top:      [Y, ROTATE],        // top
      bottom:   [Y, FLIP, ROTATE],  // bottom
      back:     [X],                // left
      front:    [X]                 // right
    },

    right: {
      top:      [Y, FLIP, ROTATE],  // top
      bottom:   [Y, ROTATE],        // bottom
      front:    [X],                // left
      back:     [X]                 // right
    }
  };

}());

export default Tile;