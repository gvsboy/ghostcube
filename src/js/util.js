var Util = {

  getVendorPrefix: function() {

    var style = document.body.style,
        prefixes = ['ms', 'O', 'Moz', 'Webkit', ''],
        prefix;

    while (prefixes.length) {
      prefix = prefixes.pop();
      if ((prefix + Const.TRANSFORM) in style) {
        return prefix;
      }
    }

    return '';
  },

  requestAnimationFrame: (function(win) {
    return win.requestAnimationFrame || win.mozRequestAnimationFrame || win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;
  }(window))

};
