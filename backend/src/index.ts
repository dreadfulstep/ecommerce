import { createApp } from './server';
import { getLocalIpv4 } from './utils/ip';
import dotenv from 'dotenv';
import chokidar from 'chokidar';
import fs from 'fs';
import http from 'http';

const PORT = Number(process.env.PORT) || 5050;

let envName: string | null;

const loadEnv = () => {  
  const envFiles = [
    '.env',
    `.env.${process.env.NODE_ENV}`,
    `.env.local`,
    `.env.production`,
    `.env.development`
  ];

  const currentNodeEnv = process.env.NODE_ENV;
  Object.keys(process.env).forEach((key) => {
    if (key !== 'NODE_ENV') {
      delete process.env[key];
    }
  });

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile });
      envName = envFile;
      console.log(`⚡️ Loaded environment from ${envFile}`);
      break;
    }
  }

  process.env.NODE_ENV = currentNodeEnv;

  return process.env.NODE_ENV || 'development';
};

const envWatcher = process.env.NODE_ENV === 'development' 
  ? chokidar.watch(
      ['.env', `.env.${process.env.NODE_ENV}`, `.env.local`, `.env.production`],
      { persistent: true }
    ) 
  : null;

if (envWatcher) {
  envWatcher.on('change', () => {
    console.log('\x1b[33m%s\x1b[0m', '⚡️ .env file or related environment file changed. Reloading environment...');
    loadEnv();
  });
}

loadEnv();

const start = async () => {
  console.clear();
  const startTime = Date.now();
  let currentPort = Number(process.env.PORT) || 5050;
  let server: http.Server;

  const tryStartServer = async (port: number) => {
    return new Promise<void>((resolve, reject) => {
      const app = createApp();

      server = app.listen(port, async () => {
        const localIp = getLocalIpv4();
        const duration = Date.now() - startTime;

        console.log('\x1b[32m%s\x1b[0m', `\n🚀 Server ready in ${duration}ms:\n`);
        console.log(`   ➜ Local:   \x1b[36mhttp://127.0.0.1:${port}\x1b[0m`);
        console.log(`   ➜ Network: \x1b[36mhttp://${localIp}:${port}\x1b[0m`);
        console.log(`   ➜ Env:     ${envName ? `\x1b[36m${envName}` : `\x1b[31mNo .env file loaded`}\x1b[0m\n`);

        resolve();
      });

      server.on('error', (err: unknown) => {
        const error = err as Error;

        if (error.message && error.message.includes('EADDRINUSE')) {
          reject(error);
        } else {
          reject(err);
        }
      });
    });
  };

  const shutdown = () => {
    console.log('\x1b[31m\n✓ Shutting down gracefully...\x1b[0m');
    server.close(() => {
      console.log('💤 Closed all connections. Bye!\n');
      process.exit(0);
    });

    setTimeout(() => {
      console.warn('⏳ Forced shutdown after 5s');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  while (true) {
    try {
      await tryStartServer(currentPort);
      break;
    } catch (err) {
      if (err instanceof Error && err.message.includes('EADDRINUSE')) {
        console.log(`\x1b[33m⚠️ Port ${currentPort} is in use. Trying port ${currentPort + 1}...\x1b[0m`);
        currentPort += 1;
      } else {
        console.error('\x1b[31m%s\x1b[0m', 'Error starting server:', err);
        process.exit(1);
      }
    }
  }
};

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
