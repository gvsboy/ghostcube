(function(win) {

  var TRANSFORM = 'Transform',
      ROTATE_X_PREFIX = 'rotateX(',
      ROTATE_Y_PREFIX = 'rotateY(',
      ROTATE_UNIT_SUFFIX = 'deg)',
      REVOLUTION = 360,
      doc = win.document,
      cube = doc.getElementById('cube'),
      cubeStyle = cube.style,
      tick = 0,
      transformProperty,
      timer;

  function getVendorPrefix() {

    var style = document.body.style,
        prefixes = ['ms', 'O', 'Moz', 'Webkit', ''],
        prefix;

    while (prefixes.length) {
      prefix = prefixes.pop();
      if ((prefix + TRANSFORM) in style) {
        return prefix;
      }
    }

    return '';
  }

  function rotate() {
    tick++;
    cubeStyle[transformProperty] = ROTATE_X_PREFIX + tick + ROTATE_UNIT_SUFFIX + ' ' + ROTATE_Y_PREFIX + tick + ROTATE_UNIT_SUFFIX;
    if (tick === REVOLUTION) {
      tick = 0;
    }
  }

  transformProperty = getVendorPrefix() + TRANSFORM;
  timer = win.setInterval(rotate, 10);

}(window));
