const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {  
    it('the user it returns should have an email property', function() {
      let user = getUserByEmail("user@example.com", users);
      expectedOutput = "user@example.com";
      assert.deepEqual(user.email, expectedOutput, "user with email is returned");
    });
      it('should return null if no user is found with that email', function() {
        let nullValue = getUserByEmail("notauser@example.com", users)
         expectedOutput = null;
        assert.equal(nullValue, expectedOutput, "returns null if email is not in database");
      });
});