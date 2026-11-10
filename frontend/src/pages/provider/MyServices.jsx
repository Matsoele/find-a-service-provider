import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MyServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name:'', description:'', price:'', category_id:'', availability:'' });
  const { show } = useToast();

  const load = () => api.get('/providers/me/services').then((r) => setServices(r.data));
  useEffect(() => {
    load();
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  const add = async () => {
    try { await api.post('/providers/me/services', form); setForm({ name:'', description:'', price:'', category_id:'', availability:'' }); load(); show('Added', 'success'); }
    catch { show('Failed', 'error'); }
  };
  const del = async (id) => {
    if (!confirm('Delete service?')) return;
    await api.delete(`/providers/me/services/${id}`); load();
  };

  return (
    <div className="page">
      <h1>My Services</h1>
      <div className="card">
        <h3>Add a service</h3>
        <input placeholder="Service name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="number" placeholder="Price M" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Choose category</option>
          {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
        </select>
        <input placeholder="Availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
        <button className="btn btn-primary" onClick={add}>Add Service</button>
      </div>
      <h3>My services</h3>
      {services.map((s) => (
        <div key={s.service_id} className="service-row">
          <div><strong>{s.name}</strong> · M{s.price} <span className="muted small">{s.category_name}</span></div>
          <button className="btn btn-danger small" onClick={() => del(s.service_id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}