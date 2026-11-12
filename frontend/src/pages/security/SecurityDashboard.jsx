import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function SecurityDashboard() {
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/admin/activity').then((r) => setActivity(r.data)).catch(() => {});
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <h1>🛡️ Security Administration Module</h1>
      <p className="muted">Restricted Access Domain - Role-Based Access Control (RBAC) Active</p>
      
      <div className="stat-grid">
        <div className="stat"><div className="stat-num">{stats.providers || 0}</div><div>Accounts</div></div>
        <div className="stat"><div className="stat-num">{stats.messages || 0}</div><div>Messages</div></div>
        <div className="stat"><div className="stat-num">{stats.requests || 0}</div><div>Requests</div></div>
      </div>

      <h2>Read/Write Permissions Matrix</h2>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Module / Feature</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Admin</th>
              <th>Security Admin</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Browse Services</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read</td>
            </tr>
            <tr>
              <td>Manage Own Profile</td>
              <td style={{ color: 'red' }}>Denied</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read/Write</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read/Write</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read/Write</td>
            </tr>
            <tr>
              <td>Submit Requests</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Write</td>
              <td style={{ color: 'red' }}>Denied</td>
              <td style={{ color: 'red' }}>Denied</td>
              <td style={{ color: 'red' }}>Denied</td>
            </tr>
            <tr>
              <td>View System Logs</td>
              <td style={{ color: 'red' }}>Denied</td>
              <td style={{ color: 'red' }}>Denied</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read</td>
            </tr>
            <tr>
              <td>Manage Roles & Policies</td>
              <td style={{ color: 'red' }}>Denied</td>
              <td style={{ color: 'red' }}>Denied</td>
              <td style={{ color: 'red' }}>Denied</td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>Read/Write</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Recent System Activity (Audit Log)</h2>
      <p className="muted">All critical actions are logged for security auditing.</p>
      {activity.length === 0 ? <p>No records yet.</p> :
        <table className="table">
          <thead><tr><th>Action</th><th>Details</th><th>Timestamp</th></tr></thead>
          <tbody>
            {activity.map((a) => (
              <tr key={a.activity_id}>
                <td><strong>{a.action}</strong></td>
                <td>{a.details}</td>
                <td>{new Date(a.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  );
}