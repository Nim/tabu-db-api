const { expect } = require('chai').expect;
const UserDTO = require('../src/dto/user');

describe('User DTO Test Suite', () => {
  it('should create a new user DTO', () => {
    const userDTO = new UserDTO({ name: 'John Doe', email: 'john.doe@example.com' });
    expect(userDTO.name).to.equal('John Doe');
    expect(userDTO.email).to.equal('john.doe@example.com');
  });

  it('should validate user DTO email', () => {
    const userDTO = new UserDTO({ name: 'John Doe', email: 'invalid-email' });
    expect(userDTO.validateEmail()).to.be.false;
  });
});
