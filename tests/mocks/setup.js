// Generated Jest mock setup

// Global mock setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Reset mock state after each test
  jest.resetAllMocks();
});

global.createMockPromise = (resolveValue, rejectValue) => {
  if (rejectValue) {
    return Promise.reject(rejectValue);
  }
  return Promise.resolve(resolveValue);
};

global.createMockFunction = (returnValue) => {
  return jest.fn().mockReturnValue(returnValue);
};

global.createAsyncMockFunction = (resolveValue) => {
  return jest.fn().mockResolvedValue(resolveValue);
};

module.exports = {
  createMockPromise: global.createMockPromise,
  createMockFunction: global.createMockFunction,
  createAsyncMockFunction: global.createAsyncMockFunction
};
