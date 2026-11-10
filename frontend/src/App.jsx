import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CustomerProvider>
            <AppRoutes />
          </CustomerProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}