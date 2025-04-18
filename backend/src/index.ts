import { createApp } from './server';
import { checkPublicIpAccessibility, getLocalIpv4, getPublicIp } from './utils/ip';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const app = createApp();
const argv = yargs(hideBin(process.argv))
  .option('public', {
    type: 'boolean',
    description: 'Enable public IP access'
  })
  .argv;

const PORT = Number(process.env.PORT) || 5050;

const start = async () => {
  const app = createApp();
  const argv = await yargs(hideBin(process.argv)).argv;
  const PORT = Number(process.env.PORT) || 5050;

  const server = app.listen(PORT, async () => {
    const localIp = getLocalIpv4();
    const publicIp = await getPublicIp();
    const publicFlag = argv.public;

    console.log('\x1b[32m%s\x1b[0m', '\n🚀 Server ready at:\n');
    console.log(` ➜ Local:   \x1b[36mhttp://127.0.0.1:${PORT}\x1b[0m`);
    console.log(` ➜ Network: \x1b[36mhttp://${localIp}:${PORT}\x1b[0m`);

    if (publicFlag) {
      const isAccessible = await checkPublicIpAccessibility(publicIp, PORT);
      if (isAccessible) {
        console.log(` ➜ Public:  \x1b[36mhttp://${publicIp}:${PORT}\x1b[0m`);
      } else {
        console.log(` ➜ Public IP is not accessible: \x1b[31mhttp://${publicIp}:${PORT}\x1b[0m`);
      }
    }
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

  process.on('SIGINT', shutdown);  // Ctrl+C
  process.on('SIGTERM', shutdown); // Kill / container stop
};


start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
