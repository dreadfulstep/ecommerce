import { Request, Response } from 'express';

export const GET = (req: Request, res: Response) => {
  res.json({ message: 'GET all users' });
};

export const POST = (req: Request, res: Response) => {
  res.json({ message: 'User created', data: req.body });
};

export const WS = (ws: any, req: Request) => {  
  ws.on('message', (message: any) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch {
      data = message.toString();
    }
    
    ws.send(JSON.stringify({
      echo: data,
      timestamp: new Date().toISOString()
    }));
  });
};