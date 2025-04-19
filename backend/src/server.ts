import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import chokidar from 'chokidar';
import { getLocalIpv4 } from './utils/ip';
import { jsonMiddleware } from './middleware/json';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

interface RouteModule {
  GET?: express.RequestHandler;
  POST?: express.RequestHandler;
  PUT?: express.RequestHandler;
  DELETE?: express.RequestHandler;
  PATCH?: express.RequestHandler;
  OPTIONS?: express.RequestHandler;
  HEAD?: express.RequestHandler;
  WS?: (ws: any, req: express.Request) => void;
}

const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m'
};

const symbols = {
  ready: '✓',
  info: 'ℹ',
  event: '●',
  wait: '◌',
  error: '⨯',
  warn: '⚠',
  ws: '⚡'
};

export const logger = {
  ready: (message: string) => console.log(`${c.green}${symbols.ready}${c.reset} ${message}`),
  error: (message: string, details?: any) => console.error(`${c.red}${symbols.error}${c.reset} ${message}`, details || ''),
  info: (message: string) => console.log(`${c.cyan}${symbols.info}${c.reset} ${message}`),
  warn: (message: string) => console.log(`${c.yellow}${symbols.warn}${c.reset} ${message}`),
  wait: (message: string) => console.log(`${c.cyan}${symbols.wait}${c.reset} ${message}`),
  event: (type: string, path: string, details: string) => {
    let color = c.gray;
    let symbol = symbols.event;
    
    switch (type) {
      case 'request':
        color = c.blue;
        break;
      case 'ws:connect':
        color = c.green;
        symbol = symbols.ws;
        break;
      case 'ws:message':
        color = c.cyan;
        symbol = symbols.ws;
        break;
      case 'ws:close':
        color = c.yellow;
        symbol = symbols.ws;
        break;
    }
    
    console.log(`${color}${symbol}${c.reset} ${c.dim}${path}${c.reset} ${details}`);
  }
};

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json());
  app.use(jsonMiddleware);
  
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  const wsHandlers = new Map<string, (ws: any, req: express.Request) => void>();
  
  let wsConnections = 0;
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  app.use((req, res, next) => {
    if (!isProduction) {
      const startTime = Date.now();
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: string | (() => void), callback?: () => void) {
        const duration = Date.now() - startTime;
        const status = res.statusCode;
        const statusColor = status >= 400 ? c.red : status >= 300 ? c.yellow : c.green;
        logger.event(
          'request',
          req.originalUrl || req.url,
          `${c.dim}${req.method}${c.reset} ${statusColor}${status}${c.reset} ${c.dim}${duration}ms${c.reset}`
        );
        if (typeof encoding === 'function') {
          return originalEnd.call(this, chunk, 'utf8', encoding);
        }
        return originalEnd.call(this, chunk, encoding as BufferEncoding, callback);
      };
    }
    next();
  });
  
  const registerRoutes = () => {
    const apiDir = path.join(__dirname, 'api');
    
    if (!fs.existsSync(apiDir)) {
      logger.warn(`API directory not found: ${apiDir}`);
      return;
    }
    
    const processDirectory = (dir: string, urlPath: string = '') => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const entryPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            let nextUrlPath = urlPath === '' ? entry.name : `${urlPath}/${entry.name}`;
            let expressPath = nextUrlPath;
            
            if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
              const paramName = entry.name.slice(1, -1);
              expressPath = urlPath === '' ? `:${paramName}` : `${urlPath}/:${paramName}`;
            }
            
            processDirectory(entryPath, expressPath);
          } else if (entry.isFile() && entry.name === 'route.js') {
            try {
              const routeModule = require(entryPath);
              const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
              
              const routePath = urlPath === '' ? '/' : `/${urlPath}`;
              
              for (const method of httpMethods) {
                if (routeModule[method]) {
                  app[method.toLowerCase() as Lowercase<HttpMethod>](
                    routePath,
                    routeModule[method] as express.RequestHandler
                  );
                  
                  logger.info(`${c.dim}${method}${c.reset} ${routePath}`);
                }
              }
              
              if (routeModule.WS) {
                wsHandlers.set(routePath, routeModule.WS);
                logger.info(`${c.magenta}WS${c.reset} ${routePath}`);
              }
            } catch (err) {
              logger.error(`Error loading route module ${entryPath}:`, err);
            }
          }
        }
      } catch (err) {
        logger.error(`Error accessing directory ${dir}:`, err);
      }
    };
    
    processDirectory(apiDir);
  };
  
  server.on('upgrade', (request, socket, head) => {
    try {
      const pathname = new URL(request.url as string, `http://${request.headers.host}`).pathname;
      
      if (wsHandlers.has(pathname)) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wsConnections++;
          const connectionId = wsConnections;
          
          logger.event('ws:connect', pathname, `${c.green}connection #${connectionId}${c.reset}`);
          
          const handler = wsHandlers.get(pathname);
          if (handler) {
            const originalSend = ws.send;
            ws.send = function(data: any, options?: any, callback?: any) {
              logger.event('ws:message', pathname, `${c.blue}outgoing #${connectionId}${c.reset}`);
              return originalSend.call(this, data, options, callback);
            };
            
            ws.on('close', () => {
              logger.event('ws:close', pathname, `${c.yellow}closed #${connectionId}${c.reset}`);
            });
            
            handler(ws, request as express.Request);
          }
        });
      } else {
        logger.error(`No WebSocket handler for ${pathname}`);
        socket.destroy();
      }
    } catch (err) {
      logger.error('WebSocket upgrade error:', err);
      socket.destroy();
    }
  });
  
  registerRoutes();
  
  return server;
};