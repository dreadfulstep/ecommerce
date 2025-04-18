import { createApp } from './server';
import { getLocalIpv4 } from './utils/ip';

const PORT = Number(process.env.PORT) || 5050;

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
    console.log(`   ➜ Env:     \x1b[36m${process.env.NODE_ENV || 'development'}\x1b[0m\n`);
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
