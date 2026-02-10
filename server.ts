import express, { Request, Response } from 'express';
import { getProjects, getJobs } from './db';

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

app.get('/api/jobs', async (_req: Request, res: Response) => {
  const result = await getJobs();
  if (result.success){
    res.json(result.data);
  }else{
    res.status(500).json(result.success);
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
