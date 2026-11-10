import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-mark">F</span> Find a Service Provider
      </Link>
      <div className="nav-links">
        <Link to="/categories">Categories</Link>
        <Link to="/search">Search</Link>
        <Link to="/track">Track Request</Link>
        {user ? (
          <>
            <Link to={
              user.role === 'provider' ? '/provider'
              : user.role === 'admin' ? '/admin'
              : '/security'
            }>Dashboard</Link>
            <button className="btn btn-ghost" onClick={() => { logout(); nav('/'); }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/provider/login">Provider Login</Link>
            <Link to="/provider/register"
                  className="btn btn-primary"
                  style={{ background: '#fff', color: '#000', borderColor: '#fff' }}>
              Become a Provider
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}