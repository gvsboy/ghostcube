import _ from 'lodash';
import CubeCache from '../../src/js/selection/CubeCache';
import Player from '../../src/js/player';
import {createCube, getTiles} from '../helpers/CubeHelpers';

describe('CubeCache', function() {

  /**
   * Add tiles using CubeCache's add method and the global getTiles method.
   * Claim them first to make add work properly.
   * @param {...String} Any number of strings representing tiles.
   */
  function add() {

    // Arguments to pass to getTiles.
    var args = [this.cube].concat(_.toArray(arguments)),
        tiles = getTiles.apply(this, args);

    // For each tile, claim it and then add it to the cache.
    _.forEach(tiles, function(tile) {
      tile.claim(this.player);
      this.cubeCache.add(tile);
    }, this);
  }

  /**
   * Remove tiles using CubeCache's remove method and the global getTiles method.
   * Release them afterwards to make add work properly.
   * @param {...String} Any number of strings representing tiles.
   */
  function remove() {

    // Arguments to pass to getTiles.
    var args = [this.cube].concat(_.toArray(arguments)),
        tiles = getTiles.apply(this, args);

    // For each tile, remove it from the cache and release it.
    _.forEach(tiles, function(tile) {
      this.cubeCache.remove(tile);
      tile.release();
    }, this);
  }

  /**
   * Helper function for return the current number of singles.
   * @return {Number} The number of singles.
   */
  function singlesLength() {
    return this.cubeCache._singles.length;
  }

  /**
   * Helper function for returning the current number of lines.
   * @return {Number} The number of lines.
   */
  function linesLength() {
    return this.cubeCache.getLines().length;
  }

  // Wish there was a better way to handle this binding...
  before(function() {
    this.add = _.bind(add, this);
    this.remove = _.bind(remove, this);
    this.singlesLength = _.bind(singlesLength, this);
    this.linesLength = _.bind(linesLength, this);
  });

  beforeEach(function() {

    // Create a new CubeCache instance.
    this.cubeCache = new CubeCache(createCube());

    // Reference the cube and player as some tests need it.
    this.cube = this.cubeCache._cube;
    this.player = new Player('Test', 'player1', this.cube);
  });

  it('exists', function() {
    expect(CubeCache).to.exist;
  });

  describe('initialize()', function() {

    it('creates a lineMap object of cube sides to cache lines', function() {
      var lineMap = this.cubeCache._lineMap;
      expect(_.isObject(lineMap)).to.be.ok;
      expect(_.keys(lineMap).length).to.equal(6);
      expect(_.isArray(lineMap.top)).to.exist;
    });

    it('creates a singles array to cache single tiles', function() {
      expect(this.cubeCache._singles).to.exist;
      expect(_.isArray(this.cubeCache._singles)).to.be.ok;
    });

  });

  describe('add and remove scenarios', function() {

    /* Scenario 1:
          ooo
          xox
          ooo
     */
    it('passes scenario 1', function() {
      this.add('top 3', 'top 5');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(1);
    });

    /* Scenario 2:
          ooo
          xoo
          oxo
     */
    it('passes scenario 2', function() {
      this.add('top 3', 'top 7');
      expect(this.singlesLength()).to.equal(2);
      expect(this.linesLength()).to.equal(0);
    });

    /* Scenario 3:
          oxx
          oox
          ooo
     */
    it('passes scenario 3', function() {
      this.add('top 1', 'top 2', 'top 5');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(2);
    });

    /* Scenario 4:
          xxo
          xxo
          ooo
     */
    it('passes scenario 4', function() {
      this.add('top 0', 'top 1', 'top 3', 'top 4');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(4);
    });

    /* Scenario 5:
          xxo
          xxo
          oxo
     */
    it('passes scenario 5', function() {
      this.add('top 0', 'top 1', 'top 3', 'top 4', 'top 7');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(4);
    });

    /* Scenario 6:
          xxo    oxo
          xoo -> xoo
          ooo    ooo
     */
    it('passes scenario 6', function() {
      this.add('top 0', 'top 1', 'top 3');
      this.remove('top 0')
      expect(this.singlesLength()).to.equal(2);
      expect(this.linesLength()).to.equal(0);
    });

    /* Scenario 7:
          xxo    oxo
          xxx -> oxo
          ooo    ooo
     */
    it('passes scenario 7', function() {
      this.add('top 0', 'top 1', 'top 3', 'top 4', 'top 5');
      this.remove('top 0', 'top 3', 'top 5')
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(1);
    });

    /* Scenario 8:
          xxo    ooo
          xxx -> oxx
          oxx    oxo
     */
    it('passes scenario 8', function() {
      this.add('top 0', 'top 1', 'top 3', 'top 4', 'top 5', 'top 7', 'top 8');
      this.remove('top 0', 'top 1', 'top 3', 'top 8');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(2);
    });

    /* Scenario 9:
          xxo    ooo
          xox -> ooo
          xxx    ooo
     */
    it('passes scenario 9', function() {
      this.add('top 0', 'top 1', 'top 3', 'top 5', 'top 6', 'top 7', 'top 8');
      this.remove('top 0', 'top 1', 'top 3', 'top 5', 'top 6', 'top 7', 'top 8');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(0);
    });

    /* Scenario 10:
          xxx    ooo
          xxx -> ooo
          xxx    xxx
     */
    it('passes scenario 10', function() {
      this.add('top 0', 'top 1', 'top 2', 'top 3', 'top 4', 'top 5', 'top 6', 'top 7', 'top 8');
      this.remove('top 0', 'top 1', 'top 2', 'top 3', 'top 4', 'top 5');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(1);
    });


    /* Scenario 11:
          oxo    ooo    xxx    ooo
          xox -> xox -> xxx -> ooo
          oxx    oxx    xxx    xxx
     */
    it('passes scenario 11', function() {

      this.add('top 1', 'top 3', 'top 5', 'top 7', 'top 8');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(4);

      this.remove('top 1');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(3);

      this.add('top 0', 'top 1', 'top 2', 'top 4', 'top 6');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(6);

      this.remove('top 0', 'top 1', 'top 2', 'top 3', 'top 4', 'top 5');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(1);
    });

    /* Scenario 12:
          oxo    ooo    xxx    ooo
          xox -> xox -> xxx -> ooo
          oxx    oxx    xxx    ooo
     */
    it('passes scenario 12', function() {

      this.add('top 1', 'top 3', 'top 5', 'top 7', 'top 8');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(4);

      this.remove('top 1');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(3);

      this.add('top 0', 'top 1', 'top 2', 'top 4', 'top 6');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(6);

      this.remove('top 0', 'top 1', 'top 2', 'top 3', 'top 4', 'top 5', 'top 6', 'top 7', 'top 8');
      expect(this.singlesLength()).to.equal(0);
      expect(this.linesLength()).to.equal(0);
    });

  });

});
