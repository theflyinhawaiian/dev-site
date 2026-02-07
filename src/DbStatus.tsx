import { useState, useEffect } from 'react';

interface DbStatusData {
  connected: boolean;
  version?: string;
  host?: string;
  port?: number;
  currentDatabase?: string;
  uptime?: number;
  tableCount?: number;
  connectedThreads?: number;
  timestamp?: string;
  error?: string;
}

function DbStatus() {
  const [status, setStatus] = useState<DbStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db-status');
      const data: DbStatusData = await response.json();
      setStatus(data);
    } catch (error) {
      const err = error as Error;
      setStatus({ connected: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="db-status">
        <h2>Database Status</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="db-status">
      <h2>Database Status</h2>
      <div className="status-card">
        <div className={`status-indicator ${status.connected ? 'connected' : 'disconnected'}`}>
          {status.connected ? 'Connected' : 'Disconnected'}
        </div>

        {status.connected ? (
          <table className="status-table">
            <tbody>
              <tr>
                <td>MySQL Version</td>
                <td>{status.version}</td>
              </tr>
              <tr>
                <td>Host</td>
                <td>{status.host}:{status.port}</td>
              </tr>
              <tr>
                <td>Database</td>
                <td>{status.currentDatabase}</td>
              </tr>
              <tr>
                <td>Uptime</td>
                <td>{status.uptime !== undefined ? formatUptime(status.uptime) : 'N/A'}</td>
              </tr>
              <tr>
                <td>Tables</td>
                <td>{status.tableCount}</td>
              </tr>
              <tr>
                <td>Connected Threads</td>
                <td>{status.connectedThreads}</td>
              </tr>
              <tr>
                <td>Checked At</td>
                <td>{status.timestamp ? new Date(status.timestamp).toLocaleString() : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="error-message">
            <p>Error: {status.error}</p>
          </div>
        )}

        <button onClick={fetchStatus} className="refresh-btn">
          Refresh
        </button>
      </div>
    </div>
  );
}

export default DbStatus;
