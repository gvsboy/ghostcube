function Player(name, tileClass) {
  this.name = name;
  this.tileClass = tileClass;
}

Player.prototype = {

  isBot: function() {
    return this instanceof Bot;
  }

};

// Assign Bot inheritence here because Bot is getting included first.
// Need to switch to modules next go-round. For reals.
_.assign(Bot.prototype, Player.prototype);
