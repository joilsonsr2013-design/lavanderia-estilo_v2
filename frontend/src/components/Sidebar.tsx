import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardIcon, UsersIcon, OrdersIcon, ProductionIcon, PackageIcon, FinanceIcon, ClockIcon, EmployeesIcon, SettingsIcon, DocsIcon, LogoutIcon, WashIcon, UserIcon } from './icons';
import { ROLE_LABEL } from '../constants';

const navItems = [
  { name: 'Dashboard',       path: '/dashboard',    icon: DashboardIcon,  roles: ['ADMIN', 'MANAGER'] },
  { name: 'Clientes',        path: '/customers',    icon: UsersIcon,       roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { name: 'Ordens de Serviço', path: '/orders',     icon: OrdersIcon,      roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { name: 'Produção',        path: '/production',   icon: ProductionIcon,  roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { name: 'Folha de Ponto',  path: '/timeclock',    icon: ClockIcon,       roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { name: 'Estoque',         path: '/inventory',    icon: PackageIcon,     roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { name: 'Financeiro',      path: '/finance',      icon: FinanceIcon,     roles: ['ADMIN', 'MANAGER'] },
  { name: 'Funcionários',    path: '/employees',    icon: EmployeesIcon,   roles: ['ADMIN', 'MANAGER'] },
  { name: 'Configurações',   path: '/settings',     icon: SettingsIcon,    roles: ['ADMIN'] },
  { name: 'Documentação',    path: '/documentation', icon: DocsIcon,       roles: ['ADMIN', 'MANAGER', 'STAFF'] },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user, logout, canManage } = useAuth();
  const location = useLocation();

  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(user?.role as any));

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-30 flex flex-col transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="bg-brand-600 p-2 rounded-xl">
            <WashIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Lavanderia</p>
            <p className="text-brand-400 text-xs font-semibold">Eficiente</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800">
            <div className="bg-brand-500 rounded-lg p-1.5">
              <UserIcon className="h-4 w-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs">{ROLE_LABEL[user?.role || ''] || user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all"
          >
            <LogoutIcon className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};
