const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  // Define files Jest should collect coverage from
  collectCoverageFrom: [
    "force-app/main/default/lwc/**/*.js",
    "!**/__tests__/**"
  ],
  // Enforce minimum threshold targets (fails the build if unmet)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Choose specific output report formats
  coverageReporters: ["clover", "json", "text", "lcov", "cobertura"]
};
