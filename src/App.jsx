import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/Toast';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import UsersListPage from './pages/UsersListPage';
import UserDetailPage from './pages/UserDetailPage';
import ServicesListPage from './pages/ServicesListPage';
import OffersListPage from './pages/OffersListPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente de Rota Protegida usando AuthContext
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, status } = useAuth();
  
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/clientes" element={<UsersListPage roleFilter="cliente" />} />
                  <Route path="/diaristas" element={<UsersListPage roleFilter="diarista" />} />
                  <Route path="/servicos" element={<ServicesListPage />} />
                  <Route path="/ofertas" element={<OffersListPage />} />
                  <Route path="/usuarios/:id" element={<UserDetailPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
