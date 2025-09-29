const fixtures = require('./mock-data');

class MockHelper {
  static getFixture(name) {
    return fixtures[name];
  }

  static getAllFixtures() {
    return fixtures;
  }

  static createCustomFixture(data) {
    return { ...fixtures, ...data };
  }
}

module.exports = MockHelper;
