function Cube(id) {
  this.container              = document.getElementById(id);
  this.el                     = this.container.getElementsByClassName('cube')[0];
  this.style                  = this.el.style;
  this.stylePrefix            = Util.getVendorPrefix();
  this.transformProperty      = this.stylePrefix + Const.TRANSFORM;

  this.init();
}

Cube.prototype = {

  init: function() {

    var container = this.container;

    this.tick = 0;
    this.timer = window.setInterval(this._rotateContinuously.bind(this), 10);

    this.el.addEventListener('click', function() {
      container.classList.add('game');
      container.addEventListener('animationend', function(evt) {

        // Every animated cube face will bubble up their animation events
        // so let's react to only one of them.
        if (evt.target === container) {
          console.log('done');
        }
      });
    });
  },

  rotate: function(x, y) {
    var C = Const;
    this.style[this.transformProperty] =
      C.ROTATE_X_PREFIX + x + C.ROTATE_UNIT_SUFFIX + ' ' + C.ROTATE_Y_PREFIX + y + C.ROTATE_UNIT_SUFFIX;
  },

  _rotateContinuously: function() {
    var tick = this.tick++;
    if (tick === Const.REVOLUTION) {
      this.tick = 0;
    }
    this.rotate(tick, tick);
  }

};
