import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import CustomersView from './views/CustomersView';
import OrdersView from './views/OrdersView';
import ProductionView from './views/ProductionView';
import InventoryView from './views/InventoryView';
import FinanceView from './views/FinanceView';
import EmployeesView from './views/EmployeesView';
import TimeClockView from './views/TimeClockView';
import SettingsView from './views/SettingsView';
import DocumentationView from './views/DocumentationView';
import { Spinner } from './components/ui';

// Route guard that checks auth and optionally role
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  title: string;
  roles?: string[];
}> = ({ element, title, roles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate default page
    const defaultPath = user.role === 'STAFF' ? '/orders' : '/dashboard';
    return <Navigate to={defaultPath} replace />;
  }

  return (
    <Layout title={title}>
      {element}
    </Layout>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const defaultPath = user?.role === 'STAFF' ? '/orders' : '/dashboard';

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={defaultPath} replace /> : <LoginView />} />
      <Route path="/" element={<Navigate to={defaultPath} replace />} />

      {/* Admin + Manager routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute title="Dashboard" roles={['ADMIN', 'MANAGER']} element={<DashboardView />} />
      } />
      <Route path="/finance" element={
        <ProtectedRoute title="Financeiro" roles={['ADMIN', 'MANAGER']} element={<FinanceView />} />
      } />
      <Route path="/employees" element={
        <ProtectedRoute title="Funcionários" roles={['ADMIN', 'MANAGER']} element={<EmployeesView />} />
      } />

      {/* Admin only */}
      <Route path="/settings" element={
        <ProtectedRoute title="Configurações" roles={['ADMIN']} element={<SettingsView />} />
      } />

      {/* All roles */}
      <Route path="/customers" element={
        <ProtectedRoute title="Clientes" element={<CustomersView />} />
      } />
      <Route path="/orders" element={
        <ProtectedRoute title="Ordens de Serviço" element={<OrdersView />} />
      } />
      <Route path="/production" element={
        <ProtectedRoute title="Produção" element={<ProductionView />} />
      } />
      <Route path="/inventory" element={
        <ProtectedRoute title="Estoque" element={<InventoryView />} />
      } />
      <Route path="/timeclock" element={
        <ProtectedRoute title="Folha de Ponto" element={<TimeClockView />} />
      } />
      <Route path="/documentation" element={
        <ProtectedRoute title="Documentação" element={<DocumentationView />} />
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <HashRouter>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </HashRouter>
);

export default App;
