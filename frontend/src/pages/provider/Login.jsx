import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const { show } = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/auth/provider/login', form);
      login(r.data.token, r.data.user, r.data.provider);
      if (r.data.user.role === 'provider') nav('/provider');
      else if (r.data.user.role === 'admin') nav('/admin');
      else nav('/security');
    } catch (err) { show(err.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <div className="page narrow">
      <h1>Provider Login</h1>
      <form className="card" onSubmit={submit}>
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary">Login</button>
        <p className="muted">New here? <Link to="/provider/register">Register</Link></p>
      </form>
    </div>
  );
}