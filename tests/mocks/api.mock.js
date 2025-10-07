class ApiMock {
  constructor() {
    this.responses = {
      get: {
        status: 'success',
        data: [],
      },
      post: {
        status: 'success',
        data: {
          id: 1,
        },
      },
      put: {
        status: 'success',
        data: {
          updated: true,
        },
      },
      delete: {
        status: 'success',
        data: {
          deleted: true,
        },
      },
    };
    this.callHistory = [];
  }

  async get(endpoint, params = {}) {
    this.callHistory.push({ method: 'GET', endpoint, params });
    return this.responses.get || { data: 'mock-get-response' };
  }

  async post(endpoint, data = {}) {
    this.callHistory.push({ method: 'POST', endpoint, data });
    return this.responses.post || { data: 'mock-post-response' };
  }

  async put(endpoint, data = {}) {
    this.callHistory.push({ method: 'PUT', endpoint, data });
    return this.responses.put || { data: 'mock-put-response' };
  }

  async delete(endpoint) {
    this.callHistory.push({ method: 'DELETE', endpoint });
    return this.responses.delete || { data: 'mock-delete-response' };
  }

  getCallHistory() {
    return this.callHistory;
  }

  clearHistory() {
    this.callHistory = [];
  }

  setResponse(method, response) {
    this.responses[method.toLowerCase()] = response;
  }
}

module.exports = ApiMock;
