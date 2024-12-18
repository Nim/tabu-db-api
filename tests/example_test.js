const { expect } = require('chai').expect;

describe('Example Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).to.equal(2);
  });

  it('should test a function', () => {
    function add(a, b) {
      return a + b;
    }
    expect(add(2, 3)).to.equal(5);
  });
});
