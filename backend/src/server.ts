import express from 'express';
import cors from 'cors';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  app.use(cors());

  app.get('/', (req, res) => {
    res.json({ success: true, false: true });
  });

  return app;
};
