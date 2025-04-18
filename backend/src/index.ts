import { createApp } from './server';
import { getLocalIpv4 } from './utils/ip';

const PORT = Number(process.env.PORT) || 5050;

const start = async () => {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 5050;

  const server = app.listen(PORT, async () => {
    const localIp = getLocalIpv4();

    console.log('\x1b[32m%s\x1b[0m', '\n🚀 Server ready at:\n');
    console.log(` ➜ Local:   \x1b[36mhttp://127.0.0.1:${PORT}\x1b[0m`);
    console.log(` ➜ Network: \x1b[36mhttp://${localIp}:${PORT}\x1b[0m`);
  });

  const shutdown = () => {
    console.log('\x1b[31m\n✓ Shutting down...\x1b[0m');

    server.close(() => {
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
