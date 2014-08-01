(function(win) {

  var style = document.body.style,

      // Prefixes used for things like Transform.
      stylePrefixes = ['ms', 'O', 'Moz', 'Webkit', ''],

      // Animation end events. Not quite perfect as IE10+
      // actually uses 'animation' -> 'MSAnimationEnd'
      // I'll fix this later.
      // So ridiculous. Can't these be consistent?!
      // ...
      // Map format:
      // 'css-attribute':       [start, iteration, end]
      animationEventMap = {
        'animation':            ['animationstart', 'animationiteration', 'animationend'],
        '-o-animation':         ['oAnimationStart', 'oAnimationIteration', 'oAnimationEnd'],
        '-moz-animation':       ['animationstart', 'animationiteration', 'animationend'],
        '-webkit-animation':    ['webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd']
      },

      msAnimationEnd = 'MSAnimationEnd',//TODO
      
      len = stylePrefixes.length,

      animationProperty,

      eventTypes,

      vendor = {};

  // First, let's determine the style prefix.
  while (len--) {
    if ((stylePrefixes[len] + Const.TRANSFORM) in style) {
      vendor.stylePrefix = stylePrefixes[len];
      break;
    }
  }

  // Now, let's determine the event end name. So messed up.
  for (animationProperty in animationEventMap) {
    if (typeof style[animationProperty] !== 'undefined') {
      eventTypes = animationEventMap[animationProperty];
      vendor.animationStartEvent = eventTypes[0];
      vendor.animationIterationEvent = eventTypes[1];
      vendor.animationEndEvent = eventTypes[2];
      break;
    }
  }

  // Normalize requestAnimationFrame for cross-browser compatibility.
  win.requestAnimationFrame = win.requestAnimationFrame || win.mozRequestAnimationFrame || win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;    

  // Set the global Vendor variable.
  win.Vendor = vendor;

}(window));
