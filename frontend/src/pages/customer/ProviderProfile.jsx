import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useCustomer } from '../../context/CustomerContext';
import { useToast } from '../../context/ToastContext';

export default function ProviderProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { customer, saveCustomer } = useCustomer();
  const { show } = useToast();
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('view');
  const [form, setForm] = useState({ name: '', phone: '', code: '' });
  const [requestForm, setRequestForm] = useState({ service_id: '', description: '', location: '', preferred_date: '' });

  useEffect(() => { api.get(`/providers/${id}`).then((r) => setData(r.data)); }, [id]);

  const requestOTP = async () => {
    try {
      await api.post('/auth/customer/otp/request', { phone: form.phone, name: form.name });
      setPhase('otp');
      show('OTP sent — check the browser console in dev mode', 'info');
    } catch (err) { show(err.response?.data?.error || 'Failed', 'error'); }
  };

  const verifyOTP = async () => {
    try {
      const r = await api.post('/auth/customer/otp/verify', { phone: form.phone, code: form.code });
      saveCustomer(r.data.token, r.data.customer);
      show('Verified!', 'success');
      setPhase('view');
    } catch (err) { show(err.response?.data?.error || 'Invalid code', 'error'); }
  };

  const startMessage = async () => {
    if (!customer) return setPhase('identify');
    try {
      const r = await api.post('/messages/conversations/start', { provider_id: id });
      nav(`/messages/${r.data.conversation_id}`);
    } catch { show('Failed', 'error'); }
  };

  const submitRequest = async () => {
    if (!customer) return setPhase('identify');
    try {
      const r = await api.post('/requests', { provider_id: id, ...requestForm });
      show(`Request submitted. Reference: ${r.data.reference_number}`, 'success');
      nav('/track');
    } catch (err) { show(err.response?.data?.error || 'Failed', 'error'); }
  };

  if (!data) return <div className="page-loading">Loading…</div>;
  const { provider, services, reviews } = data;

  return (
    <div className="page">
      <div className="profile-header">
        <div className="provider-avatar big">{provider.business_name?.[0]}</div>
        <div>
          <h1>{provider.business_name}</h1>
          <p className="muted">{provider.district} · Coverage: {provider.service_coverage}</p>
          <p>{provider.description}</p>
          <p className="muted">⭐ {provider.rating_avg} ({provider.rating_count} reviews)</p>
          <div className="row">
            <button className="btn btn-primary" onClick={startMessage}>💬 Message Provider</button>
            <button className="btn btn-outline" onClick={() => setPhase(customer ? 'request' : 'identify')}>
              📝 Request Service
            </button>
          </div>
        </div>
      </div>

      {phase === 'identify' && (
        <div className="card">
          <h3>Verify your phone to continue</h3>
          <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Phone (+266…)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button className="btn btn-primary" onClick={requestOTP}>Send OTP</button>
        </div>
      )}

      {phase === 'otp' && (
        <div className="card">
          <h3>Enter the 6-digit code</h3>
          <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <button className="btn btn-primary" onClick={verifyOTP}>Verify</button>
        </div>
      )}

      {phase === 'request' && (
        <div className="card">
          <h3>Submit Service Request</h3>
          <select value={requestForm.service_id}
                  onChange={(e) => setRequestForm({ ...requestForm, service_id: e.target.value })}>
            <option value="">Select service</option>
            {services.map((s) => <option key={s.service_id} value={s.service_id}>{s.name} — M{s.price}</option>)}
          </select>
          <textarea placeholder="Describe the work" value={requestForm.description}
                    onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} />
          <input placeholder="Your location" value={requestForm.location}
                 onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })} />
          <input type="date" value={requestForm.preferred_date}
                 onChange={(e) => setRequestForm({ ...requestForm, preferred_date: e.target.value })} />
          <button className="btn btn-primary" onClick={submitRequest}>Submit</button>
        </div>
      )}

      <h2>Services</h2>
      <div className="services-list">
        {services.map((s) => (
          <div key={s.service_id} className="service-row">
            <div><strong>{s.name}</strong> <span className="muted small">{s.category_name}</span></div>
            <div>M{s.price}</div>
          </div>
        ))}
      </div>

      <h2>Reviews</h2>
      {reviews.length === 0 ? <p className="muted">No reviews yet.</p> :
        reviews.map((r) => (
          <div key={r.review_id} className="review-card">
            <div><strong>{r.customer_name}</strong> · {'⭐'.repeat(r.rating)}</div>
            <p>{r.comment}</p>
          </div>
        ))}
    </div>
  );
}