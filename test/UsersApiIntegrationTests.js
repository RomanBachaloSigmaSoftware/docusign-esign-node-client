const docusign = require('../src/index');
const assert = require('assert');
const { JWTAuth } = require('./helpers');
const { USER_ID, apiClient } = require('./constants');

let ACCOUNT_ID = '';

describe('UsersApi tests:', () => {
  before((done) => {
    try {
      JWTAuth(done).then((response) => {
        ACCOUNT_ID = response.ACCOUNT_ID;
        done();
      });
    } catch (err) {
      console.error(err);
      return done(err);
    }
  });

  const usersApi = new docusign.UsersApi(apiClient);

  it('should return the list of users for the specified account', (done) => {
    usersApi.list(ACCOUNT_ID)
      .then((userInformationList) => {
        assert.notStrictEqual(userInformationList, undefined);
        assert.notStrictEqual(userInformationList.users, undefined);
        assert.notStrictEqual(userInformationList.users[0], undefined);
        assert.notStrictEqual(userInformationList.users[0].userId, undefined);
        done();
      })
      .catch((error) => {
        if (error) {
          console.error(error);
          return done(error);
        }
      });
  });

  it('getInformation returns the user information for a specified user', (done) => {
    usersApi.getInformation(ACCOUNT_ID, USER_ID)
      .then((data) => {
        assert.notStrictEqual(data, undefined);
        assert.notStrictEqual(data.groupList, undefined);
        assert.notStrictEqual(data.userSettings, undefined);
        assert.strictEqual(data.userId, USER_ID);
        done();
      })
      .catch((error) => {
        if (error) {
          console.error(error);
          return done(error);
        }
      });
  });
  it('should create and add new user to the specified account if newUsersDefinition option is provided with user data', (done) => {
    const newUser = new docusign.UserInformation();
    newUser.company = 'TestCompany';
    newUser.email = 'test@email.com';
    newUser.firstName = 'First';
    newUser.lastName = 'Last';
    newUser.userName = 'TestUserName';

    const newUsersDefinition = new docusign.NewUsersDefinition();
    newUsersDefinition.newUsers = [];
    newUsersDefinition.newUsers.push(newUser);

    usersApi.create(ACCOUNT_ID, { newUsersDefinition })
      .then((data) => {
        assert.notStrictEqual(data, undefined);
        assert.equal(data.newUsers[0].email, 'test@email.com');
        assert.equal(data.newUsers[0].userName, 'TestUserName');
        done();
      })
      .catch((error) => {
        if (error) {
          console.error(error);
          return done(error);
        }
      });
  });
});
