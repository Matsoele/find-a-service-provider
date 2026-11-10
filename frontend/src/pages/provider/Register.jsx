import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DISTRICTS = ['Maseru','Berea','Leribe','Botha-Bothe','Mafeteng',"Mohale's Hoek",'Quthing',"Qacha's Nek",'Thaba-Tseka','Mokhotlong'];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', business_name: '', district: 'Maseru', service_coverage: '', description: '',
  });
  const { login } = useAuth();
  const { show } = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/auth/provider/register', form);
      login(r.data.token, r.data.user, null);
      show('Welcome! Complete your profile.', 'success');
      nav('/provider');
    } catch (err) { show(err.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <div className="page narrow">
      <h1>Become a Service Provider</h1>
      <form className="card" onSubmit={submit}>
        <h3>Account</h3>
        <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />

        <h3>Business</h3>
        <input placeholder="Business name" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required />
        <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <input placeholder="Service coverage" value={form.service_coverage} onChange={(e) => setForm({ ...form, service_coverage: e.target.value })} />
        <textarea placeholder="Describe your business" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <button className="btn btn-primary">Register</button>
        <p className="muted">Already have an account? <Link to="/provider/login">Login</Link></p>
      </form>
    </div>
  );
}