import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function Categories() {
  const [cats, setCats] = useState([]);
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);

  return (
    <div className="page">
      <h1>Service Categories</h1>
      <p className="muted">Choose a category to start browsing</p>
      <div className="category-grid">
        {cats.map((c) => (
          <Link key={c.category_id} to={`/search?category=${c.category_id}`} className="category-card">
            <div className="cat-icon">{c.icon || '🛠️'}</div>
            <h3>{c.name}</h3>
            <p className="small muted">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}