import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import ProviderCard from '../../components/ProviderCard';

const DISTRICTS = [
  'Maseru','Berea','Leribe','Botha-Bothe','Mafeteng',
  "Mohale's Hoek",'Quthing',"Qacha's Nek",'Thaba-Tseka','Mokhotlong',
];

export default function SearchProviders() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    category: params.get('category') || '',
    district: params.get('district') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
  });

  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    setParams(query);
    api.get(`/providers?${query}`).then((r) => setProviders(r.data)).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="page">
      <h1>Find a Service Provider</h1>
      <div className="filter-bar">
        <input placeholder="Search name or description"
               value={filters.q}
               onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <select value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
        </select>
        <select value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}>
          <option value="">All districts</option>
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <input type="number" placeholder="Min M" value={filters.minPrice}
               onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        <input type="number" placeholder="Max M" value={filters.maxPrice}
               onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
      </div>

      {loading ? <p className="muted">Loading…</p> :
        providers.length === 0 ? <p className="muted">No providers match these filters.</p> :
        <div className="provider-grid">
          {providers.map((p) => <ProviderCard key={p.provider_id} p={p} />)}
        </div>
      }
    </div>
  );
}