import request from 'supertest';
import express from 'express';
import { errorHandler } from '../middleware/error.middleware';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  app.use(errorHandler);
  return app;
};

describe('Health Check', () => {
  let app: express.Express;

  beforeAll(() => {
    app = createTestApp();
  });

  it('GET /health should return 200', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Error Handler', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.get('/error', (req, res, next) => {
      next(new Error('Test error'));
    });
    app.use(errorHandler);
  });

  it('should handle errors', async () => {
    const response = await request(app).get('/error').expect(500);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  });
});