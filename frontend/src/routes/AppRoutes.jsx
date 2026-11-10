import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import Welcome from '../pages/Welcome';
import Home from '../pages/customer/Home';
import Categories from '../pages/customer/Categories';
import SearchProviders from '../pages/customer/SearchProviders';
import ProviderProfile from '../pages/customer/ProviderProfile';
import Messages from '../pages/customer/Messages';
import TrackRequest from '../pages/customer/TrackRequest';

import Register from '../pages/provider/Register';
import Login from '../pages/provider/Login';
import ProviderDashboard from '../pages/provider/Dashboard';
import MyServices from '../pages/provider/MyServices';
import Requests from '../pages/provider/Requests';
import Profile from '../pages/provider/Profile';
import ProviderMessages from '../pages/provider/Messages';

import AdminDashboard from '../pages/admin/AdminDashboard';
import SecurityDashboard from '../pages/security/SecurityDashboard';

const providerItems = [
  { to: '/provider', label: 'Overview'},
  { to: '/provider/profile', label: 'Profile'},
  { to: '/provider/services', label: 'My Services' },
  { to: '/provider/requests', label: 'Requests' },
  { to: '/provider/messages', label: 'Messages' },
];

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<SearchProviders />} />
        <Route path="/providers/:id" element={<ProviderProfile />} />
        <Route path="/messages/:conversationId?" element={<Messages />} />
        <Route path="/track" element={<TrackRequest />} />
        <Route path="/provider/register" element={<Register />} />
        <Route path="/provider/login" element={<Login />} />
      </Route>

      <Route path="/provider" element={
        <ProtectedRoute roles={['provider']}>
          <DashboardLayout items={providerItems} />
        </ProtectedRoute>
      }>
        <Route index element={<ProviderDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="services" element={<MyServices />} />
        <Route path="requests" element={<Requests />} />
        <Route path="messages" element={<ProviderMessages />} />
      </Route>

      <Route path="/admin" element={
        <ProtectedRoute roles={['admin','security_admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/security" element={
        <ProtectedRoute roles={['security_admin','admin']}>
          <SecurityDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}