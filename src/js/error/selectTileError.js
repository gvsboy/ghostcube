function SelectTileError(message) {
  this.name = 'SelectTileError';
  this.message = message;
}

SelectTileError.CLAIMED = 'claimed';
SelectTileError.NOT_NEIGHBOR = 'notNeighbor';
SelectTileError.TARGET_CLAIMED = 'targetClaimed';

SelectTileError.prototype = Error.prototype;
