import request from 'supertest';
import express, { Express } from 'express';
import { errorHandler } from '../middleware/error.middleware';
import { config } from '../config/env';

const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/error', (_req, _res, next) => {
    next(new Error('Test error'));
  });

  app.get('/error-validation', (_req, _res, next) => {
    const error = new Error('Validation failed') as Error & { name: string; errors: Record<string, { message: string }> };
    error.name = 'ValidationError';
    error.errors = {
      field1: { message: 'Field1 is required' },
      field2: { message: 'Field2 must be a string' },
    };
    next(error);
  });

  app.get('/error-duplicate', (_req, _res, next) => {
    const error = new Error('Duplicate key') as Error & { code: number; keyValue: Record<string, string> };
    error.code = 11000;
    error.keyValue = { email: 'test@example.com' };
    next(error);
  });

  app.get('/error-jwt', (_req, _res, next) => {
    const error = new Error('Invalid token') as Error & { name: string };
    error.name = 'JsonWebTokenError';
    next(error);
  });

  app.get('/error-jwt-expired', (_req, _res, next) => {
    const error = new Error('Token expired') as Error & { name: string };
    error.name = 'TokenExpiredError';
    next(error);
  });

  app.get('/error-cast', (_req, _res, next) => {
    const error = new Error('Invalid ID') as Error & { name: string; path: string; value: string };
    error.name = 'CastError';
    error.path = '_id';
    error.value = 'invalid-id';
    next(error);
  });

  app.get('/error-status', (_req, _res, next) => {
    const error = new Error('Not found') as Error & { statusCode: number };
    error.statusCode = 404;
    next(error);
  });

  app.use(errorHandler);
  return app;
};

describe('Health Check Endpoint', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  it('should return 200 status code', async () => {
    await request(app).get('/health').expect(200);
  });

  it('should return status "ok"', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('should return a valid ISO timestamp', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('timestamp');
    expect(() => new Date(response.body.timestamp)).not.toThrow();
    expect(new Date(response.body.timestamp).toISOString()).toBe(
      response.body.timestamp
    );
  });

  it('should return JSON content type', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['content-type']).toMatch(/json/);
  });
});

describe('Global Error Handler', () => {
  let app: Express;

  beforeAll(() => {
    const originalEnv = config.nodeEnv;
    config.nodeEnv = 'test';
    app = createTestApp();
    config.nodeEnv = originalEnv;
  });

  it('should return 500 for an unhandled generic error', async () => {
    const response = await request(app).get('/error').expect(500);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  });

  it('should not leak stack traces in the response body', async () => {
    const response = await request(app).get('/error').expect(500);
    expect(response.body).not.toHaveProperty('stack');
  });

  it('should return 400 for ValidationError with error details', async () => {
    const response = await request(app).get('/error-validation').expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe('Validation error');
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors).toContain('Field1 is required');
    expect(response.body.errors).toContain('Field2 must be a string');
  });

  it('should return 409 for duplicate key error', async () => {
    const response = await request(app).get('/error-duplicate').expect(409);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe('Duplicate value for email');
  });

  it('should return 401 for JsonWebTokenError', async () => {
    const response = await request(app).get('/error-jwt').expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe('Invalid token');
  });

  it('should return 401 for TokenExpiredError', async () => {
    const response = await request(app).get('/error-jwt-expired').expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe('Token expired');
  });

  it('should return 400 for CastError', async () => {
    const response = await request(app).get('/error-cast').expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe('Invalid _id: invalid-id');
  });

  it('should respect a custom statusCode on the error object', async () => {
    const response = await request(app).get('/error-status').expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toMatch(/not found/i);
  });

  it('should return JSON content type on errors', async () => {
    const response = await request(app).get('/error');
    expect(response.headers['content-type']).toMatch(/json/);
  });
});

describe('Actual App Health Endpoint', () => {
  let app: Express;

  beforeAll(async () => {
    const { default: actualApp } = await import('../app');
    app = actualApp;
  });

  it('should return 200 on /health', async () => {
    await request(app).get('/health').expect(200);
  });

  it('should return comprehensive health info', async () => {
    const response = await request(app).get('/health');

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('memory');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('environment');
    expect(typeof response.body.uptime).toBe('number');
    expect(typeof response.body.memory).toBe('object');
  });
});