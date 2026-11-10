import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ requests: 0, messages: 0, services: 0 });
  useEffect(() => {
    Promise.all([
      api.get('/requests/provider/mine'),
      api.get('/messages/conversations/provider'),
      api.get('/providers/me/services'),
    ]).then(([r, m, s]) => setStats({ requests: r.data.length, messages: m.data.length, services: s.data.length }));
  }, []);

  return (
    <div className="page">
      <h1>Provider Dashboard</h1>
      <div className="stat-grid">
        <div className="stat"><div className="stat-num">{stats.requests}</div><div>Requests</div></div>
        <div className="stat"><div className="stat-num">{stats.messages}</div><div>Conversations</div></div>
        <div className="stat"><div className="stat-num">{stats.services}</div><div>Services</div></div>
      </div>
      <div className="row">
        <Link className="btn btn-primary" to="/provider/profile">Edit Profile</Link>
        <Link className="btn btn-outline" to="/provider/services">Manage Services</Link>
        <Link className="btn btn-outline" to="/provider/requests">View Requests</Link>
        <Link className="btn btn-outline" to="/provider/messages">Messages</Link>
      </div>
    </div>
  );
}