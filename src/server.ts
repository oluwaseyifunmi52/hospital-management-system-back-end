import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import connectDB from './config/db';
import { config } from './config/env';
import { initSocket } from './sockets/socket';
import { seedAdmin } from './utils/seed';

const server = http.createServer(app);

const start = async () => {
  try {
    await connectDB();
    await seedAdmin();
    initSocket(server);

    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
