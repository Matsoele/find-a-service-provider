import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout({ items }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="dashboard-shell">
        <Sidebar items={items} />
        <main className="dashboard-main"><Outlet /></main>
      </div>
    </div>
  );
}