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
      <h1>Security Administration</h1>
      <div className="stat-grid">
        <div className="stat"><div className="stat-num">{stats.providers || 0}</div><div>Accounts</div></div>
        <div className="stat"><div className="stat-num">{stats.messages || 0}</div><div>Messages</div></div>
        <div className="stat"><div className="stat-num">{stats.requests || 0}</div><div>Requests</div></div>
      </div>

      <h2>Recent system activity</h2>
      {activity.length === 0 ? <p className="muted">No records yet.</p> :
        <table className="table">
          <thead><tr><th>Action</th><th>Details</th><th>When</th></tr></thead>
          <tbody>
            {activity.map((a) => (
              <tr key={a.activity_id}>
                <td>{a.action}</td>
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