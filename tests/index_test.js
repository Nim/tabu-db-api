const { expect } = require('chai').expect;
const index = require('../src/index');

describe('Index Test Suite', () => {
  it('should initialize the application', () => {
    expect(() => index.init()).to.not.throw();
  });

  it('should handle a sample request', () => {
    const req = {};
    const res = {
      send: function(response) {
        expect(response).to.equal('Hello, World!');
      }
    };
    index.handleRequest(req, res);
  });
});
