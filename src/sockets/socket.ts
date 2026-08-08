import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtAccessSecret) as { id: string; role: string };
      (socket as any).userId = decoded.id;
      (socket as any).userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId}`);

    socket.join(userId);

    socket.on('join', (room: string) => {
      socket.join(room);
    });

    socket.on('message:send', (data: { to: string; message: string }) => {
      io.to(data.to).emit('message:receive', {
        from: userId,
        message: data.message,
        timestamp: new Date(),
      });
    });

    socket.on('typing:start', (data: { to: string }) => {
      io.to(data.to).emit('typing:start', { from: userId });
    });

    socket.on('typing:stop', (data: { to: string }) => {
      io.to(data.to).emit('typing:stop', { from: userId });
    });

    socket.on('message:read', (data: { to: string; messageId: string }) => {
      io.to(data.to).emit('message:read', { from: userId, messageId: data.messageId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
