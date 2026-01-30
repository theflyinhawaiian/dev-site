import { useState, useEffect } from 'react';

function DbStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db-status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ connected: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
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
                <td>{formatUptime(status.uptime)}</td>
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
                <td>{new Date(status.timestamp).toLocaleString()}</td>
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
