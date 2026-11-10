import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [providers, setProviders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', description: '', icon: '' });
  const { show } = useToast();

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data));
    api.get('/admin/providers').then((r) => setProviders(r.data));
    api.get('/admin/requests').then((r) => setRequests(r.data));
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  const toggleStatus = async (id, current) => {
    const status = current === 'active' ? 'suspended' : 'active';
    await api.put(`/admin/providers/${id}/status`, { status });
    setProviders(providers.map((p) => p.provider_id === id ? { ...p, account_status: status } : p));
    show(`Provider ${status}`, 'success');
  };

  const addCategory = async () => {
    try {
      const r = await api.post('/categories', newCat);
      setCategories([...categories, r.data]);
      setNewCat({ name:'', description:'', icon:'' });
      show('Category added', 'success');
    } catch { show('Failed', 'error'); }
  };

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        {['overview','providers','requests','categories'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="stat-grid">
          <div className="stat"><div className="stat-num">{stats.providers || 0}</div><div>Providers</div></div>
          <div className="stat"><div className="stat-num">{stats.requests || 0}</div><div>Requests</div></div>
          <div className="stat"><div className="stat-num">{stats.reviews || 0}</div><div>Reviews</div></div>
          <div className="stat"><div className="stat-num">{stats.messages || 0}</div><div>Messages</div></div>
        </div>
      )}

      {tab === 'providers' && (
        <table className="table">
          <thead><tr><th>Business</th><th>Email</th><th>District</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.provider_id}>
                <td>{p.business_name}</td>
                <td>{p.email}</td>
                <td>{p.district}</td>
                <td><span className={`status status-${p.account_status}`}>{p.account_status}</span></td>
                <td><button className="btn btn-outline small" onClick={() => toggleStatus(p.provider_id, p.account_status)}>Toggle</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'requests' && (
        <table className="table">
          <thead><tr><th>Ref</th><th>Customer</th><th>Provider</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.request_id}>
                <td>{r.reference_number}</td>
                <td>{r.customer_name}</td>
                <td>{r.provider_name}</td>
                <td><span className={`status status-${r.status}`}>{r.status}</span></td>
                <td>{r.created_at?.slice(0,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'categories' && (
        <div>
          <div className="card">
            <h3>Add category</h3>
            <input placeholder="Name" value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
            <input placeholder="Description" value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} />
            <input placeholder="Icon (emoji)" value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} />
            <button className="btn btn-primary" onClick={addCategory}>Add</button>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <div key={c.category_id} className="category-card">
                <div className="cat-icon">{c.icon}</div>
                <h3>{c.name}</h3>
                <p className="muted small">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}