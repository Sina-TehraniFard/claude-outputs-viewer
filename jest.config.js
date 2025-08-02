module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'public/js/**/*.js',
    '!public/js/app.js', // メインアプリファイルは除外（大きすぎるため）
    '!**/node_modules/**'
  ],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ]
};