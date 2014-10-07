function Messages() {

}

Messages.prototype = {

  listenTo: function(source) {
    source.on('message', function(data) {
      console.log('message received!', data);
    });
  }

};
