import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtPayload } from '../types';

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiry as string,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiry as string,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
};
