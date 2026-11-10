import { NavLink } from 'react-router-dom';

export default function Sidebar({ items }) {
  return (
    <aside className="sidebar">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span>{i.icon}</span> {i.label}
        </NavLink>
      ))}
    </aside>
  );
}