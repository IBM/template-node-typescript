module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    "node_modules/",
    "logs/.*",
    "dist/.*",
    "pacts/.*",
    "coverage/",
    "src/logger/*",
  ],
  watchPathIgnorePatterns: [
    "node_modules/",
    "logs/",
    "dist/",
    "pacts/",
    "coverage/"
  ],
  testResultsProcessor: "jest-sonar-reporter",
  testMatch: ["<rootDir>/test/**/*.spec.ts"],
  setupFiles: [
    "jest-plugin-context/setup"
  ],
};
