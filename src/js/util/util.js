export function listenOnce(target, type, callback) {
  var handler = evt => {
    target.removeEventListener(type, handler);
    callback(evt);
  };
  target.addEventListener(type, handler);
}
