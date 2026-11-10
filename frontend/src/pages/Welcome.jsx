import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div className="welcome">
      <section className="hero">
        <h1>Find trusted local services across Lesotho</h1>
        <p className="muted">
          Plumbing, electrical, carpentry, cleaning, mechanics and more — right in your district.
        </p>
        <div className="hero-cta">
          <Link to="/categories" className="btn btn-primary big">🔍 Find a Service</Link>
          <Link to="/provider/register" className="btn btn-outline big">💼 I'm a Service Provider</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature"><h3>10 districts</h3><p>Maseru, Berea, Leribe, Botha-Bothe, Mafeteng, Mohale's Hoek, Quthing, Qacha's Nek, Thaba-Tseka, Mokhotlong.</p></div>
        <div className="feature"><h3>Chat in-app</h3><p>Message providers, send photos of the job and get quotes — no account required.</p></div>
        <div className="feature"><h3>Track requests</h3><p>Submit a request, get a reference number and follow progress in real time.</p></div>
      </section>
    </div>
  );
}