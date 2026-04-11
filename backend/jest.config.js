export default {
  //Uses node environment
  testEnvironment: "node",

  //Directory for tests
  roots: ["<rootDir>/tests"],

  //Specifies test file naming scheme for easy identification
  testMatch: ["**/*.{test}.{js}"],

  //Calls environment variables
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  //Reloads modules between tests
  resetModules: true,
};
