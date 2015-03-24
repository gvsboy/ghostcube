describe('TileSelectorResult', function() {

  it('exists', function() {
    expect(TileSelectorResult).toBeDefined();
  });

  it('should be created with a static success method', function() {
    var result = TileSelectorResult.success();
    expect(result instanceof TileSelectorResult).toBeTruthy();
    expect(result._success).toBeTruthy();
  });

  it('should be created with a static failure method', function() {
    var result = TileSelectorResult.failure();
    expect(result instanceof TileSelectorResult).toBeTruthy();
    expect(result._success).not.toBeTruthy();
  });

  describe('success()', function() {

    it('returns true if _success is true and no callback is provided', function() {
      var result = TileSelectorResult.success();
      expect(result.success()).toBeTruthy();
    });

    it('returns false if _success is false and no callback is provided', function() {
      var result = TileSelectorResult.failure();
      expect(result.success()).not.toBeTruthy();
    });

    it('returns itself if a callback was provided', function() {
      var result = TileSelectorResult.success(),
          callback = jasmine.createSpy();
      expect(result.success(callback)).toBe(result);
    });

    it('invokes the callback with the stored data if _success is true', function() {
      var data = {length: 3},
          result = TileSelectorResult.success(data),
          callback = jasmine.createSpy();
      result.success(callback);
      expect(callback).toHaveBeenCalledWith(data);
    });

  });

  describe('failure()', function() {

    it('returns true if _success is false and no callback is provided', function() {
      var result = TileSelectorResult.failure();
      expect(result.failure()).toBeTruthy();
    });

    it('returns false if _success is true and no callback is provided', function() {
      var result = TileSelectorResult.success();
      expect(result.failure()).not.toBeTruthy();
    });

    it('returns itself if a callback was provided', function() {
      var result = TileSelectorResult.failure(),
          callback = jasmine.createSpy();
      expect(result.failure(callback)).toBe(result);
    });

    it('invokes the callback with the failure code if _success is false', function() {
      var code = 'claimed',
          result = TileSelectorResult.failure(code),
          callback = jasmine.createSpy();
      result.failure(callback);
      expect(callback).toHaveBeenCalledWith(code);
    });

  });

});
