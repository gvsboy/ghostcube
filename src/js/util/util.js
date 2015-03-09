(function(win) {

  win.UTIL = {

    listenOnce: function(target, type, callback) {
      var handler = evt => {
        target.removeEventListener(type, handler);
        callback(evt);
      };
      target.addEventListener(type, handler);
    }

  };

}(window));
