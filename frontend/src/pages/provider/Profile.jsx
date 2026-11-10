import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const DISTRICTS = ['Maseru','Berea','Leribe','Botha-Bothe','Mafeteng',"Mohale's Hoek",'Quthing',"Qacha's Nek",'Thaba-Tseka','Mokhotlong'];

export default function Profile() {
  const [form, setForm] = useState({ business_name:'', description:'', phone:'', district:'Maseru', service_coverage:'', availability:'' });
  const { show } = useToast();

  useEffect(() => { api.get('/providers/me').then((r) => setForm(r.data)); }, []);

  const save = async () => {
    try { await api.put('/providers/me', form); show('Saved', 'success'); }
    catch { show('Failed', 'error'); }
  };

  const upload = async (e) => {
    const fd = new FormData(); fd.append('image', e.target.files[0]);
    try {
      await api.post('/providers/me/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      show('Uploaded', 'success');
    } catch { show('Upload failed', 'error'); }
  };

  return (
    <div className="page narrow">
      <h1>My Profile</h1>
      <div className="card">
        <input placeholder="Business name" value={form.business_name || ''} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
        <textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select value={form.district || 'Maseru'} onChange={(e) => setForm({ ...form, district: e.target.value })}>
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <input placeholder="Service coverage" value={form.service_coverage || ''} onChange={(e) => setForm({ ...form, service_coverage: e.target.value })} />
        <input placeholder="Availability" value={form.availability || ''} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
        <label>Profile image: <input type="file" accept="image/*" onChange={upload} /></label>
        <button className="btn btn-primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}