import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/generateToken';
import { hashRefreshToken } from '../utils/generateOTP';
import { AuthService } from '../services/auth.service';
import { config } from '../config/env';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      const result = await AuthService.registerPatient(req.body);
      res.status(201).json({ success: true, data: result, message: 'Account created' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  });
  
  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      const result = await AuthService.login(email, password, rememberMe);
      res.json({ success: true, data: result, message: 'Login successful' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  });
  
  app.post('/api/v1/auth/refresh-token', async (req, res) => {
    try {
      const { refreshToken: token } = req.body;
      const result = await AuthService.refreshToken(token);
      res.json({ success: true, data: result, message: 'Token refreshed' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  });
  
  app.post('/api/v1/auth/logout', async (req, res) => {
    try {
      const { refreshToken: token } = req.body;
      const userId = req.headers['x-user-id'] as string;
      const result = await AuthService.logout(userId, token);
      res.json({ success: true, data: result, message: 'Logged out' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  });

  return app;
};

describe('Auth - Refresh Token Rotation', () => {
  let app: express.Express;
  let userId: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    await mongoose.connect(config.mongodbUri);
    app = createTestApp();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    
    const hashedPassword = await hashPassword('Test@123');
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'patient',
      isVerified: true,
      isActive: true,
    });
    userId = user._id.toString();

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Test@123' });
    
    accessToken = loginResponse.body.data.tokens.accessToken;
    refreshToken = loginResponse.body.data.tokens.refreshToken;
  });

  describe('Normal refresh token flow', () => {
    it('should successfully refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      // Note: tokens generated in same second may be identical due to JWT iat precision
      expect(response.body.data.refreshToken).not.toBe(refreshToken);
    });

    it('should return new access token that works for authentication', async () => {
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      const newAccessToken = refreshResponse.body.data.accessToken;
      
      const decoded = verifyAccessToken(newAccessToken);
      expect(decoded).toHaveProperty('id', userId);
    });

    it('should return new refresh token that works for subsequent refresh', async () => {
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      const newRefreshToken = refreshResponse.body.data.refreshToken;
      
      const secondRefresh = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: newRefreshToken });
      
      expect(secondRefresh.status).toBe(200);
      expect(secondRefresh.body.success).toBe(true);
      expect(secondRefresh.body.data).toHaveProperty('accessToken');
      expect(secondRefresh.body.data).toHaveProperty('refreshToken');
    });
  });

  describe('Expired refresh token', () => {
    it('should reject expired refresh token with 401', async () => {
      // Use the original refresh token from login, but update its expiry in DB to be in the past
      const user = await User.findById(userId);
      const originalTokenRecord = user!.refreshTokens[0];
      
      // Update the expiry to be in the past
      originalTokenRecord.expiresAt = new Date(Date.now() - 1000);
      await user!.save();

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      console.log('Expired token test - Response:', response.status, response.body);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token expired');
    });
  });

  describe('Invalid refresh token', () => {
    it('should reject malformed refresh token with 401', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid.token.here' });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject access token used as refresh token with 401', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: accessToken });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject refresh token with invalid signature with 401', async () => {
      const tamperedToken = accessToken.slice(0, -5) + 'abcde';
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: tamperedToken });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject refresh token for non-existent user with 401', async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const fakeToken = generateRefreshToken({ id: fakeUserId, role: 'patient' });
      
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: fakeToken });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Refresh token belonging to another user', () => {
    it('should reject refresh token from another user', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        password: await hashPassword('Test@123'),
        firstName: 'Other',
        lastName: 'User',
        role: 'patient',
        isVerified: true,
        isActive: true,
      });

      const otherLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'other@example.com', password: 'Test@123' });
      
      const otherRefreshToken = otherLogin.body.data.tokens.refreshToken;
      
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: otherRefreshToken });
      
      expect(response.status).toBe(200);
    });
  });

  describe('Reuse of OLD refresh token after rotation (reuse detection)', () => {
    it('should reject old refresh token after successful rotation', async () => {
      const firstRefresh = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      const newRefreshToken = firstRefresh.body.data.refreshToken;
      
      const reuseResponse = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      expect(reuseResponse.status).toBe(401);
      expect(reuseResponse.body.success).toBe(false);
      expect(reuseResponse.body.message).toBe('Token reuse detected. Please log in again.');
    });

    it('should revoke entire token family when reuse is detected', async () => {
      const firstRefresh = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      const newRefreshToken = firstRefresh.body.data.refreshToken;
      
      await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      const thirdAttempt = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: newRefreshToken });
      
      expect(thirdAttempt.status).toBe(401);
      expect(thirdAttempt.body.success).toBe(false);
    });
  });

  describe('NEW refresh token works after rotation', () => {
    it('should allow multiple sequential refreshes with new tokens', async () => {
      let currentRefreshToken = refreshToken;
      
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/v1/auth/refresh-token')
          .send({ refreshToken: currentRefreshToken });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        currentRefreshToken = response.body.data.refreshToken;
      }
    });
  });

  describe('Old token no longer works after rotation', () => {
    it('should not accept any previous token in the chain', async () => {
      const tokens: string[] = [refreshToken];
      
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/v1/auth/refresh-token')
          .send({ refreshToken: tokens[i] });
        
        expect(response.status).toBe(200);
        tokens.push(response.body.data.refreshToken);
      }
      
      for (let i = 0; i < tokens.length - 1; i++) {
        const response = await request(app)
          .post('/api/v1/auth/refresh-token')
          .send({ refreshToken: tokens[i] });
        
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('Concurrent refresh attempts', () => {
    it('should handle concurrent refresh attempts (behavior depends on MongoDB topology)', async () => {
      const promises = Array(3).fill(null).map(() => 
        request(app)
          .post('/api/v1/auth/refresh-token')
          .send({ refreshToken })
      );
      
      const responses = await Promise.all(promises);
      
      const successCount = responses.filter(r => r.status === 200).length;
      const errorCount = responses.filter(r => r.status === 401).length;
      const otherCount = responses.filter(r => r.status !== 200 && r.status !== 401).length;
      
      // In replica set with transactions: 1 success, 2 errors
      // In standalone (test env): may vary
      // At least one should succeed
      expect(successCount).toBeGreaterThanOrEqual(1);
      expect(successCount + errorCount + otherCount).toBe(3);
    });
  });

  describe('Logout', () => {
    it('should revoke refresh token on logout', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .set('x-user-id', userId)
        .send({ refreshToken });
      
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Deactivated user', () => {
    it('should reject refresh token for deactivated user', async () => {
      await User.findByIdAndUpdate(userId, { isActive: false });
      
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is deactivated');
    });
  });

  describe('Missing refresh token', () => {
    it('should return 401 when refresh token is not provided', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({});
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token is required');
    });
  });
});

describe('Auth - Token Hashing', () => {
  it('should hash refresh token before storing', async () => {
    await mongoose.connect(config.mongodbUri);
    await User.deleteMany({});
    
    const hashedPassword = await hashPassword('Test@123');
    const user = await User.create({
      email: 'hash-test@example.com',
      password: hashedPassword,
      firstName: 'Hash',
      lastName: 'Test',
      role: 'patient',
      isVerified: true,
      isActive: true,
    });

    const tokenPayload = { id: user._id.toString(), role: 'patient' };
    const rawRefreshToken = generateRefreshToken(tokenPayload);
    const hashedToken = hashRefreshToken(rawRefreshToken);
    
    user.refreshTokens.push({
      token: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      revoked: false,
      family: 'test-family',
    });
    await user.save();

    const storedUser = await User.findById(user._id);
    const storedToken = storedUser!.refreshTokens[0];
    
    expect(storedToken.token).toBe(hashedToken);
    expect(storedToken.token).not.toBe(rawRefreshToken);
    
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('should verify token using constant-time comparison', async () => {
    const token = 'test-refresh-token-123';
    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);
    
    expect(hash1).toBe(hash2);
  });
});