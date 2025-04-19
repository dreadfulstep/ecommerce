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
      syntax: 'typescript',
      tsx: false,
    },
    target: 'es2020',
  },
  module: {
    type: 'commonjs',
  },
};

process.env.NODE_ENV = 'development';

fs.writeFileSync('.swcrc', JSON.stringify(swcConfig, null, 2));

function loadEnv() {
  dotenv.config();
  return 'development';
}

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
    exec('tsc --build', (error, stdout, stderr) => {
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

  loadEnv();
  const serverArgs = [path.join(outDir, mainFile), ...args];

  server = spawn('node', serverArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      RESTART_COUNT: process.env.RESTART_COUNT || '0',
    },
  });

  server.on('error', (err) => {
    console.error('\x1b[31m%s\x1b[0m', `❌ Failed to start server: ${err.message}`);
  });

  server.on('exit', (code, signal) => {
    if (signal !== 'SIGTERM') {
      console.log('\x1b[31m%s\x1b[0m', `❌ Server process exited with code ${code}`);
    }
  });
}

const watcher = chokidar.watch(srcDir, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
});

compile().then(startServer).catch((err) => {
  console.error('\x1b[31m%s\x1b[0m', '❌ Initial compilation failed\n', err);
});

watcher.on('change', (changedPath) => {
  console.log('\x1b[90m%s\x1b[0m', `File changed: ${changedPath}`);
  
  compile().then(() => {
    if (!needsRestart) {
      startServer();
    }
  }).catch((err) => {
    console.error("Compilation error during file change", err);
  });
});

process.on('SIGINT', () => {
  if (server) server.kill('SIGTERM');
  process.exit(0);
});