import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main"><Outlet /></main>
      <Footer />
    </div>
  );
}