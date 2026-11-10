import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import ProviderCard from '../../components/ProviderCard';

export default function Home() {
  const [providers, setProviders] = useState([]);
  useEffect(() => { api.get('/providers').then((r) => setProviders(r.data.slice(0, 6))); }, []);
  return (
    <div className="page">
      <h1>Top providers</h1>
      <p className="muted">Highest rated across Lesotho</p>
      <div className="provider-grid">
        {providers.map((p) => <ProviderCard key={p.provider_id} p={p} />)}
      </div>
      <Link to="/search" className="btn btn-primary">See all providers →</Link>
    </div>
  );
}