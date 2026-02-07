import express, { Request, Response } from 'express';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { readFileSync, existsSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

function getSecret(path: string | undefined, fallback: string): string {
  if (path && existsSync(path)) {
    return readFileSync(path, 'utf8').trim();
  }
  return fallback;
}

const dbConfig = {
  host: process.env.MYSQL_HOST?.split(':')[0] || 'mysql',
  port: parseInt(process.env.MYSQL_HOST?.split(':')[1] || '3306'),
  user: process.env.MYSQL_USER || 'devsite_user',
  password: getSecret(process.env.MYSQL_PASSWORD_FILE, ''),
  database: process.env.MYSQL_DATABASE || 'devsite_db',
  connectTimeout: 10000,
};

console.log('DB Config:', { ...dbConfig, password: '***' });

interface VersionRow extends RowDataPacket {
  version: string;
}

interface StatusRow extends RowDataPacket {
  Variable_name: string;
  Value: string;
}

interface DatabaseRow extends RowDataPacket {
  current_db: string;
}

app.get('/api/db-status', async (_req: Request, res: Response) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [versionRows] = await connection.query<VersionRow[]>('SELECT VERSION() as version');
    const [uptimeRows] = await connection.query<StatusRow[]>('SHOW STATUS LIKE "Uptime"');
    const [dbRows] = await connection.query<DatabaseRow[]>('SELECT DATABASE() as current_db');
    const [tablesRows] = await connection.query<RowDataPacket[]>('SHOW TABLES');
    const [statusRows] = await connection.query<StatusRow[]>('SHOW STATUS LIKE "Threads_connected"');

    res.json({
      connected: true,
      version: versionRows[0].version,
      uptime: parseInt(uptimeRows[0].Value),
      currentDatabase: dbRows[0].current_db,
      tableCount: tablesRows.length,
      connectedThreads: parseInt(statusRows[0].Value),
      host: dbConfig.host,
      port: dbConfig.port,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      connected: false,
      error: err.message,
      host: dbConfig.host,
      port: dbConfig.port,
      timestamp: new Date().toISOString(),
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
