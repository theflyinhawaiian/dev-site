import express, { Request, Response } from 'express';
import { dbConfig, getDbStatus } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

console.log('DB Config:', { ...dbConfig, password: '***' });

app.get('/api/db-status', async (_req: Request, res: Response) => {
  const status = await getDbStatus();
  if (status.connected) {
    res.json({ 
      ...status
    });
  } else {
    res.status(500).json(status);
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
