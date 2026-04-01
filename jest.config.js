module.exports = {
  testEnvironment: 'node',
  testRegex: '.*test.ts$',
  transform: { '^.+\\.ts?$': '@swc/jest' },
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: 'src',
  collectCoverage: true,
  coverageDirectory: '<rootDir>/../coverage',
};
