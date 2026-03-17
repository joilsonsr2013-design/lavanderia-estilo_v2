import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MenuIcon, RefreshIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { ROLE_LABEL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { refreshAll } = useAppContext();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            {title && <h1 className="text-base font-bold text-slate-800 hidden sm:block">{title}</h1>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshAll}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
              title="Atualizar dados"
            >
              <RefreshIcon className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-semibold text-slate-600">{ROLE_LABEL[user?.role || '']}</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
