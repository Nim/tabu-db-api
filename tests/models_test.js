const { expect } = require('chai').expect;
const UserModel = require('../src/models/user');

describe('User Model Test Suite', () => {
  it('should create a new user', () => {
    const user = new UserModel({ name: 'John Doe', email: 'john.doe@example.com' });
    expect(user.name).to.equal('John Doe');
    expect(user.email).to.equal('john.doe@example.com');
  });

  it('should validate user email', () => {
    const user = new UserModel({ name: 'John Doe', email: 'invalid-email' });
    expect(user.validateEmail()).to.be.false;
  });
});
