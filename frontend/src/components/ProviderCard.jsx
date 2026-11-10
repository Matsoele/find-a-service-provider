import { Link } from 'react-router-dom';

export default function ProviderCard({ p }) {
  const minPrice = p.services?.length ? Math.min(...p.services.map((s) => +s.price)) : null;
  return (
    <div className="provider-card">
      <div className="provider-avatar">{p.business_name?.[0] || '?'}</div>
      <div className="provider-info">
        <h3>{p.business_name}</h3>
        <p className="muted">{p.district}</p>
        <p className="small">{p.description?.slice(0, 90)}</p>
        <div className="row">
          <span className="badge">⭐ {p.rating_avg || 'New'}</span>
          {minPrice !== null && <span className="badge alt">from M{minPrice}</span>}
        </div>
      </div>
      <Link to={`/providers/${p.provider_id}`} className="btn btn-primary">View</Link>
    </div>
  );
}