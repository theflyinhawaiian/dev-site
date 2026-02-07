import express, { Request, Response } from 'express';
import { getDbStatus, getProjects } from './db';

const app = express();
const PORT = process.env.PORT || 3001;


app.get('/api/projects', async (_req: Request, res: Response) => {
  const result = await getProjects();
  if (result.success){
    res.json(result.data);
  }else{
    res.status(500).json(result.success);
  }
});

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
