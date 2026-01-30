import express from 'express';
import mysql from 'mysql2/promise';
import { readFileSync, existsSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

function getSecret(path, fallback) {
  if (existsSync(path)) {
    return readFileSync(path, 'utf8').trim();
  }
  return fallback;
}

const dbConfig = {
  host: process.env.MYSQL_HOST?.split(':')[0] || 'mysql',
  port: parseInt(process.env.MYSQL_HOST?.split(':')[1]) || 3306,
  user: process.env.MYSQL_USER || 'devsite_user',
  password: getSecret('/run/secrets/mysql_password', process.env.MYSQL_PASSWORD),
  database: process.env.MYSQL_DATABASE || 'devsite_db',
};

app.get('/api/db-status', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [versionRows] = await connection.query('SELECT VERSION() as version');
    const [uptimeRows] = await connection.query('SHOW STATUS LIKE "Uptime"');
    const [dbRows] = await connection.query('SELECT DATABASE() as current_db');
    const [tablesRows] = await connection.query('SHOW TABLES');
    const [statusRows] = await connection.query('SHOW STATUS LIKE "Threads_connected"');

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
    res.status(500).json({
      connected: false,
      error: error.message,
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
