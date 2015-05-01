import TileSelectorResult from '../../src/js/selection/TileSelectorResult';

describe('TileSelectorResult', function() {

  it('exists', function() {
    expect(TileSelectorResult).to.exist;
  });

  it('should be created with a static success method', function() {
    var result = TileSelectorResult.success();
    expect(result).to.be.an.instanceof(TileSelectorResult);
    expect(result._success).to.be.ok;
  });

  it('should be created with a static failure method', function() {
    var result = TileSelectorResult.failure();
    expect(result).to.be.an.instanceof(TileSelectorResult);
    expect(result._success).to.not.be.ok;
  });

  describe('success()', function() {

    it('returns true if _success is true and no callback is provided', function() {
      var result = TileSelectorResult.success();
      expect(result.success()).to.be.ok;
    });

    it('returns false if _success is false and no callback is provided', function() {
      var result = TileSelectorResult.failure();
      expect(result.success()).to.not.be.ok;
    });

    it('returns itself if a callback was provided', function() {
      var result = TileSelectorResult.success(),
          callback = sinon.spy();
      expect(result.success(callback)).to.equal(result);
    });

    it('invokes the callback with the stored data if _success is true', function() {
      var data = {length: 3},
          result = TileSelectorResult.success(data),
          callback = sinon.spy();
      result.success(callback);
      expect(callback).to.have.been.calledWith(data);
    });

  });

  describe('failure()', function() {

    it('returns true if _success is false and no callback is provided', function() {
      var result = TileSelectorResult.failure();
      expect(result.failure()).to.be.ok;
    });

    it('returns false if _success is true and no callback is provided', function() {
      var result = TileSelectorResult.success();
      expect(result.failure()).to.not.be.ok;
    });

    it('returns itself if a callback was provided', function() {
      var result = TileSelectorResult.failure(),
          callback = sinon.spy();
      expect(result.failure(callback)).to.equal(result);
    });

    it('invokes the callback with the failure code if _success is false', function() {
      var code = 'claimed',
          result = TileSelectorResult.failure(code),
          callback = sinon.spy();
      result.failure(callback);
      expect(callback).to.have.been.calledWith(code);
    });

  });

});
