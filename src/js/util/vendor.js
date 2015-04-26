/**
 * This is a messy file containing vendor compatibility support logic.
 * Mostly, we're normalizing the a few CSS and JS methods and checking 
 * whether or not the user's browser can handle the modern CSS we're throwing at it.
 * But yeah, not very pretty stuff below.
 */

var STYLE = document.body.style,

    TRANSFORM = 'Transform',

    // Prefixes used for things like Transform.
    STYLE_PREFIXES = ['ms', 'O', 'Moz', 'Webkit'],

    // Animation end events. Not quite perfect as IE10+ actually uses:
    // 'animation' -> 'MSAnimationEnd'
    // So ridiculous. Can't these be consistent?!
    // Whatever. IE doesn't support preserve-3d anyways so no big deal.
    // Map format:
    // 'css-attribute':       [start, iteration, end]
    ANIMATION_EVENT_MAP = {
      'animation':            ['animationstart', 'animationiteration', 'animationend'],
      '-o-animation':         ['oAnimationStart', 'oAnimationIteration', 'oAnimationEnd'],
      '-moz-animation':       ['animationstart', 'animationiteration', 'animationend'],
      '-webkit-animation':    ['webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd']
    },
    
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

// Check to see if the browser supports preserve-3d. If not, place a
// special class on the body element.
(function() {

  var WEBKIT_TRANSFORM_STYLE = '-webkit-transform-style',
      MOZ_TRANSFORM_STYLE = '-moz-transform-style',
      MS_TRANSFORM_STYLE = '-ms-transform-style',
      TRANSFORM_STYLE = 'transform-style',

      element = document.createElement('p'),
      body = document.body,
      properties = {
        webkitTransformStyle: WEBKIT_TRANSFORM_STYLE,
        MozTransformStyle: MOZ_TRANSFORM_STYLE,
        msTransformStyle: MS_TRANSFORM_STYLE,
        transformStyle: TRANSFORM_STYLE
      }

  function has3D() {

    var PRESERVE_3D = 'preserve-3d',
        prop, computedStyle;

    for (prop in properties) {
      if (element.style[prop] !== undefined) {
        element.style[prop] = PRESERVE_3D;
      }
    }

    computedStyle = window.getComputedStyle(element);

    return (computedStyle.getPropertyValue(WEBKIT_TRANSFORM_STYLE) ||
      computedStyle.getPropertyValue(MOZ_TRANSFORM_STYLE) ||
      computedStyle.getPropertyValue(MS_TRANSFORM_STYLE) ||
      computedStyle.getPropertyValue(TRANSFORM_STYLE)) === PRESERVE_3D;
  }

  body.appendChild(element);

  if (!has3D()) {
    body.classList.add('no-3d');
  }

  body.removeChild(element);
}());

export {js, css, events};
