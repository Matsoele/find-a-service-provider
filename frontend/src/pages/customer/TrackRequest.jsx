import { useState } from 'react';
import { api } from '../../services/api';

export default function TrackRequest() {
  const [form, setForm] = useState({ reference: '', phone: '' });
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const track = async (e) => {
    e.preventDefault();
    setErr(''); setData(null);
    try {
      const r = await api.post('/requests/track', form);
      setData(r.data);
    } catch (e2) { setErr(e2.response?.data?.error || 'Not found'); }
  };

  return (
    <div className="page">
      <h1>Track Your Request</h1>
      <form className="card" onSubmit={track}>
        <input placeholder="Reference (e.g. FSP-A1B2C3D4)" value={form.reference}
               onChange={(e) => setForm({ ...form, reference: e.target.value })} required />
        <input placeholder="Phone used when submitting" value={form.phone}
               onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <button className="btn btn-primary">Track</button>
      </form>
      {err && <p className="error">{err}</p>}
      {data && (
        <div className="card">
          <h3>{data.reference_number}</h3>
          <p>Status: <strong className={`status status-${data.status}`}>{data.status}</strong></p>
          <p>Provider: {data.provider_name}</p>
          <p>Service: {data.service_name}</p>
          <p>Location: {data.location}</p>
          <p>Preferred date: {data.preferred_date?.slice(0, 10)}</p>
          <p>{data.description}</p>
        </div>
      )}
    </div>
  );
}