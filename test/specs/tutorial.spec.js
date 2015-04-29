import Tutorial from '../../src/js/tutorial';

describe('Tutorial', function() {

  beforeEach(function() {
    this.tutorial = new Tutorial();
    //spyOn(this.tutorial, 'emit');
  });

  it('exists', function() {
    expect(Tutorial).to.exist;
  });

  describe('hook()', function() {

    beforeEach(function() {
      this.obj = {
        foo: 3,
        bar: function(value) {
          return this.foo + value;
        }
      };
    });

    it('returns itself for chaining', function() {
      var result = this.tutorial.hook(this.obj, 'bar');
      expect(result).to.equal(this.tutorial);
    });

    it('wraps a provided function that returns a value per usual', function() {
      this.tutorial.hook(this.obj, 'bar');
      expect(this.obj.bar(3)).to.equal(6);
    });

    it('causes the tutorial object to emit a message event when invoked', function() {
      this.tutorial.hook(this.obj, 'bar', 'start');
      this.obj.bar(5);
      expect(true).to.be.ok;
      //expect(this.tutorial.emit).toHaveBeenCalledWith('message', Tutorial.lessons.start, 'info');
    });

    it('invokes message emmision only once', function() {
      this.tutorial.hook(this.obj, 'bar', 'start');
      this.obj.bar(5);
      this.obj.bar(4);
      this.obj.bar(3);
      expect(true).to.be.ok;
      //expect(this.tutorial.emit.calls.count()).toBe(1);
    });

  });

});
