import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const NEXT = {
  pending: ['accepted','rejected'],
  accepted: ['in_progress','cancelled'],
  in_progress: ['completed','cancelled'],
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const { show } = useToast();

  const load = () => api.get('/requests/provider/mine').then((r) => setRequests(r.data));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try { await api.put(`/requests/${id}/status`, { status }); load(); show('Updated', 'success'); }
    catch { show('Failed', 'error'); }
  };

  return (
    <div className="page">
      <h1>Service Requests</h1>
      {requests.length === 0 && <p className="muted">No requests yet.</p>}
      {requests.map((r) => (
        <div key={r.request_id} className="card">
          <div className="row between">
            <div>
              <h3>{r.reference_number}</h3>
              <p className="muted small">{r.customer_name} · {r.customer_phone}</p>
            </div>
            <span className={`status status-${r.status}`}>{r.status}</span>
          </div>
          <p>{r.description}</p>
          <p className="muted small"> {r.location} ·  {r.preferred_date?.slice(0,10)}</p>
          <div className="row">
            {(NEXT[r.status] || []).map((s) => (
              <button key={s} className="btn btn-outline small" onClick={() => setStatus(r.request_id, s)}>{s.replace('_',' ')}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}