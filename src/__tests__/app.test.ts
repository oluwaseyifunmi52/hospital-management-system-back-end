import request from 'supertest';
import express, { Express } from 'express';
import { errorHandler } from '../middleware/error.middleware';

/**
 * Creates an isolated Express test app with a /health route
 * and the real error handler middleware attached.
 */
const createHealthTestApp = (): Express => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(errorHandler);
  return app;
};

/**
 * Creates an isolated Express test app with a route that
 * deliberately throws, to verify errorHandler behavior.
 */
const createErrorTestApp = (): Express => {
  const app = express();
  app.use(express.json());

  app.get('/error', (_req, _res, next) => {
    next(new Error('Test error'));
  });

  app.get('/error-with-status', (_req, _res, next) => {
    const error = new Error('Not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    next(error);
  });

  app.use(errorHandler);
  return app;
};

describe('Health Check Endpoint', () => {
  let app: Express;

  beforeAll(() => {
    app = createHealthTestApp();
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
    app = createErrorTestApp();
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

  it('should respect a custom statusCode on the error object', async () => {
    const response = await request(app).get('/error-with-status').expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toMatch(/not found/i);
  });

  it('should return JSON content type on errors', async () => {
    const response = await request(app).get('/error');
    expect(response.headers['content-type']).toMatch(/json/);
  });
});