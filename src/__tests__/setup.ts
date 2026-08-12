import { config } from '../config/env';

config.nodeEnv = 'test';
config.port = 0;
config.mongodbUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/smartcare_test';
config.jwtAccessSecret = 'test-access-secret-that-is-at-least-32-chars';
config.jwtRefreshSecret = 'test-refresh-secret-that-is-at-least-32-chars';
config.smtpUser = '';
config.smtpPass = '';

jest.setTimeout(10000);

// Dummy test to satisfy Jest requirement
describe('Test Setup', () => {
  it('should configure test environment', () => {
    expect(config.nodeEnv).toBe('test');
  });
});