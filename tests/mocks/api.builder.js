const ApiMock = require('./api.mock');

class ApiBuilder {
  constructor() {
    this.mock = new ApiMock();
  }

  withGetResponse(response) {
    this.mock.setResponse('GET', response);
    return this;
  }

  withPostResponse(response) {
    this.mock.setResponse('POST', response);
    return this;
  }

  withError(error) {
    this.mock.setResponse('GET', { error });
    this.mock.setResponse('POST', { error });
    return this;
  }

  build() {
    return this.mock;
  }
}

module.exports = ApiBuilder;
