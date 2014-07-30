(function(win) {

  var style = document.body.style,

      // Prefixes used for things like Transform.
      stylePrefixes = ['ms', 'O', 'Moz', 'Webkit', ''],

      // Animation end events. Not quite perfect as IE10+
      // actually uses 'animation' -> 'MSAnimationEnd'
      // I'll fix this later.
      // So ridiculous. Can't these be consistent?!
      eventEndMap = {
        'animation': 'animationend',
        '-o-animation': 'oAnimationEnd',
        '-moz-animation': 'animationend',
        '-webkit-animation': 'webkitAnimationEnd'
      },

      msAnimationEnd = 'MSAnimationEnd',
      
      len = stylePrefixes.length,

      animationProperty,

      vendor = {};

  // First, let's determine the style prefix.
  while (len--) {
    if ((stylePrefixes[len] + Const.TRANSFORM) in style) {
      vendor.stylePrefix = stylePrefixes[len];
      break;
    }
  }

  // Now, let's determine the event end name. So messed up.
  for (animationProperty in eventEndMap) {
    if (typeof style[animationProperty] !== 'undefined') {
      vendor.animationEndEvent = eventEndMap[animationProperty];
      break;
    }
  }

  // Normalize requestAnimationFrame for cross-browser compatibility.
  win.requestAnimationFrame = win.requestAnimationFrame || win.mozRequestAnimationFrame || win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;    

  // Set the global Vendor variable.
  win.Vendor = vendor;

}(window));
