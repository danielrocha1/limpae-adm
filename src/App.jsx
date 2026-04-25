import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/Toast';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import UsersListPage from './pages/UsersListPage';
import ServicesListPage from './pages/ServicesListPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente de Rota Protegida
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin-token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
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
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
