(function(win) {

  var ROTATE_X_PREFIX = 'rotateX(',
      ROTATE_Y_PREFIX = 'rotateY(',
      ROTATE_UNIT_SUFFIX = 'deg)',
      REVOLUTION = 360,
      doc = win.document,
      cube = doc.getElementById('cube'),
      cubeStyle = cube.style,
      tick = 0,
      timer;

  function rotate() {
    tick++;
    cubeStyle.transform = ROTATE_X_PREFIX + tick + ROTATE_UNIT_SUFFIX + ' ' + ROTATE_Y_PREFIX + tick + ROTATE_UNIT_SUFFIX;
    if (tick === REVOLUTION) {
      tick = 0;
    }
  }

  timer = win.setInterval(rotate, 10);

}(window));
