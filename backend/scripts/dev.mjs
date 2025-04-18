import { spawn } from 'child_process';
import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const srcDir = 'src';
const outDir = 'dist';
const mainFile = 'index.js';
const swcConfig = {
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: false
    },
    target: "es2020"
  },
  module: {
    type: "commonjs"
  }
};

process.env.NODE_ENV = 'development';

fs.writeFileSync('.swcrc', JSON.stringify(swcConfig, null, 2));

function loadEnv() {
  dotenv.config();
  return process.env.NODE_ENV || 'development';
}

const envWatcher = chokidar.watch('.env', { persistent: true });

envWatcher.on('change', () => {
  console.log('\x1b[33m%s\x1b[0m', '⚡️ .env file changed. Reloading environment...');
  process.env.NODE_ENV = loadEnv();
});

let server;
let isCompiling = false;
let needsRestart = false;
let isFirstStart = true;
const args = process.argv.slice(2);

function compile() {
  if (isCompiling) {
    needsRestart = true;
    return Promise.resolve();
  }

  console.log('\x1b[33m%s\x1b[0m', '⏳ Compiling...');
  isCompiling = true;
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    exec(`npx swc ${srcDir} -d ${outDir}`, (error, stdout, stderr) => {
      isCompiling = false;
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(0);

      if (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Compilation failed:');
        console.error(stderr);
        return reject(error);
      }

      console.log('\x1b[32m%s\x1b[0m', `✓ Compiled successfully in ${duration}ms`);
      resolve();

      if (needsRestart) {
        needsRestart = false;
        startServer();
      }
    });
  });
}

function startServer() {
  if (server) {
    console.log('\x1b[33m%s\x1b[0m', '🔄 Restarting server...');
    server.kill('SIGTERM');

    process.env.RESTART_COUNT = (parseInt(process.env.RESTART_COUNT || '0') + 1).toString();
  } else if (isFirstStart) {
    console.clear();
    console.log('\x1b[36m%s\x1b[0m', '🚀 Starting development server...');
    isFirstStart = false;

    process.env.RESTART_COUNT = '0';
  }

  const environment = loadEnv();
  const serverArgs = [path.join(outDir, mainFile), ...args];

  server = spawn('node', serverArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: environment,
      RESTART_COUNT: process.env.RESTART_COUNT || '0'
    }
  });

  server.on('error', (err) => {
    console.error('\x1b[31m%s\x1b[0m', `❌ Failed to start server: ${err.message}`);
  });

  server.on('exit', (code, signal) => {
    if (signal !== 'SIGTERM') {
      console.log(`\x1b[31m%s\x1b[0m`, `❌ Server process exited with code ${code}`);
    }
  });

  const duration = Date.now() - startTime;
  console.log('\x1b[32m%s\x1b[0m', `\n🚀 Server ready in ${duration}ms:\n`);
  console.log(`   ➜ Env:     \x1b[36m${environment}\x1b[0m`);
}

const watcher = chokidar.watch(srcDir, {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

compile().then(startServer).catch(err => {
  console.error('\x1b[31m%s\x1b[0m', '❌ Initial compilation failed');
});

const originalConsoleLog = console.log;
console.log = function() {
  const now = new Date();
  const timestamp = `[${now.toLocaleTimeString()}]`;
  originalConsoleLog('\x1b[90m%s\x1b[0m', timestamp, ...arguments);
};

watcher
  .on('change', path => {
    console.log('\x1b[90m%s\x1b[0m', `File changed: ${path}`);
    compile().then(() => {
      if (!needsRestart) {
        startServer();
      }
    }).catch(err => {
      // Error already logged in compile function
    });
});

process.on('SIGINT', () => {
  console.log('\x1b[36m%s\x1b[0m', '\n👋 Shutting down dev server');
  if (server) server.kill('SIGTERM');
  process.exit(0);
});
