import { createApp } from './server';
import { getLocalIpv4 } from './utils/ip';
import dotenv from 'dotenv';
import chokidar from 'chokidar';
import fs from 'fs';

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

  Object.keys(process.env).forEach((key) => {
    delete process.env[key];
  });

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile });
      envName = envFile;
      console.log(`\x1b[33m%s\x1b[0m`, `⚡️ Loaded environment from ${envFile}`);
      break;
    }
  }

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
  const startTime = Date.now();
  const app = createApp();

  const server = app.listen(PORT, async () => {
    const localIp = getLocalIpv4();
    const duration = Date.now() - startTime;

    if (process.env.NODE_ENV !== 'development') {
      console.clear();
    }

    console.log('\x1b[32m%s\x1b[0m', `\n🚀 Server ready in ${duration}ms:\n`);
    console.log(`   ➜ Local:   \x1b[36mhttp://127.0.0.1:${PORT}\x1b[0m`);
    console.log(`   ➜ Network: \x1b[36mhttp://${localIp}:${PORT}\x1b[0m`);
    console.log(`   ➜ Env:     ${envName ? `\x1b[36m${envName}` : `\x1b[31mNo .env file loaded`}\x1b[0m\n`);
  });

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
};

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
