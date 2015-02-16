function createSide(size) {
  var el = document.createElement('div');
  el.id = 'front';
  return new Side(el, size || 3);
}
