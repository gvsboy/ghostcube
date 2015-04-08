var STYLE = document.body.style,

    TRANSFORM = 'Transform',

    // Prefixes used for things like Transform.
    STYLE_PREFIXES = ['ms', 'O', 'Moz', 'Webkit'],

    // Animation end events. Not quite perfect as IE10+
    // actually uses 'animation' -> 'MSAnimationEnd'
    // I'll fix this later.
    // So ridiculous. Can't these be consistent?!
    // ...
    // Map format:
    // 'css-attribute':       [start, iteration, end]
    ANIMATION_EVENT_MAP = {
      'animation':            ['animationstart', 'animationiteration', 'animationend'],
      '-o-animation':         ['oAnimationStart', 'oAnimationIteration', 'oAnimationEnd'],
      '-moz-animation':       ['animationstart', 'animationiteration', 'animationend'],
      '-webkit-animation':    ['webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd']
    },

    msAnimationEnd = 'MSAnimationEnd',//TODO
    
    len = STYLE_PREFIXES.length,

    stylePrefix,

    animationProperty,

    eventTypes,

    // Objects to hold browser-specific settings.
    js = {},
    css = {},
    events = {};

// First, let's determine the style prefix.
while (len--) {
  if ((STYLE_PREFIXES[len] + TRANSFORM) in STYLE) {
    stylePrefix = STYLE_PREFIXES[len];
    break;
  }
}

// If there isn't a proper prefix, use the standard transform.
if (!stylePrefix) {
  stylePrefix = TRANSFORM.toLowerCase();
}

// Next, let's set some properties using the prefix.
js.transform = stylePrefix + TRANSFORM;
css.transform = stylePrefix ? '-' + stylePrefix.toLowerCase() + '-transform' : 'transform';

// Now, let's determine the event end name. So messed up.
for (animationProperty in ANIMATION_EVENT_MAP) {
  if (typeof STYLE[animationProperty] !== 'undefined') {
    eventTypes = ANIMATION_EVENT_MAP[animationProperty];
    events.animationStart = eventTypes[0];
    events.animationIteration = eventTypes[1];
    events.animationEnd = eventTypes[2];
    break;
  }
}

// Normalize requestAnimationFrame for cross-browser compatibility.
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

export {js, css, events};
