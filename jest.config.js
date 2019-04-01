module.exports = {
  testEnvironment: 'node',
  testRegex: '.*test.ts$',
  transform: { '^.+\\.ts?$': 'ts-jest' },
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: 'src',
};
