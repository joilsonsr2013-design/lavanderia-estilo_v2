import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, StatCard, LoadingState, Badge } from '../components/ui';
import { Button } from '../components/ui';
import { useAppContext } from '../contexts/AppContext';
import { dashboardApi } from '../services/api';
import { formatCurrency, formatDateTime, isOverdue } from '../utils/helpers';
import { OrdersIcon, UsersIcon, PackageIcon, FinanceIcon, PlusIcon, RefreshIcon, AlertIcon, ProductionIcon } from '../components/icons';
import { STATUS_LABEL, STATUS_BG, STATUS_COLOR, PRIORITY_LABEL, PRIORITY_COLOR } from '../constants';
import { OrderStatus, OrderPriority } from '../types';

const DashboardView: React.FC = () => {
  const { orders, customers, inventory } = useAppContext();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try { setStats(await dashboardApi.stats()); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const activeOrders = orders.filter(o => ![OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(o.status));
  const overdueOrders = activeOrders.filter(o => isOverdue(o.dueDate));
  const lowStock = inventory.filter(i => i.isLowStock);

  if (loading && !stats) return <LoadingState message="Carregando dashboard..." />;

  const totals = stats?.totals || {};
  const recentOrders = stats?.recentOrders || orders.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alerts */}
      {(overdueOrders.length > 0 || lowStock.length > 0) && (
        <div className="space-y-2">
          {overdueOrders.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertIcon className="h-4 w-4 shrink-0" />
              <span><strong>{overdueOrders.length}</strong> pedido(s) com prazo vencido!</span>
              <Link to="/orders?status=overdue" className="ml-auto font-semibold underline">Ver pedidos</Link>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <AlertIcon className="h-4 w-4 shrink-0" />
              <span><strong>{lowStock.length}</strong> item(ns) com estoque baixo.</span>
              <Link to="/inventory" className="ml-auto font-semibold underline">Ver estoque</Link>
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Clientes" value={totals.customers ?? customers.length} icon={UsersIcon} color="bg-blue-600" />
        <StatCard title="Ordens Ativas" value={totals.orders !== undefined ? stats.orders.inProduction : activeOrders.length} icon={OrdersIcon} color="bg-violet-600" />
        <StatCard title="Em Produção" value={stats?.production?.active ?? 0} icon={ProductionIcon} color="bg-orange-500" />
        <StatCard title="Receita 30d" value={formatCurrency(totals.revenue30Days ?? 0)} icon={FinanceIcon} color="bg-emerald-600" />
      </div>

      {/* Order by status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Pedidos por Etapa" className="lg:col-span-2">
          <div className="space-y-3">
            {[
              OrderStatus.PENDING, OrderStatus.CLASSIFICATION, OrderStatus.WASHING,
              OrderStatus.DRYING, OrderStatus.IRONING, OrderStatus.INSPECTION,
              OrderStatus.PACKAGING, OrderStatus.READY_FOR_DELIVERY
            ].map(status => {
              const count = orders.filter(o => o.status === status).length;
              if (count === 0) return null;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge color={`${STATUS_BG[status]} ${STATUS_COLOR[status]}`}>{STATUS_LABEL[status]}</Badge>
                  </div>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-brand-500"
                        style={{ width: `${Math.min(100, (count / Math.max(orders.length, 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhuma ordem registrada.</p>}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Ações Rápidas">
          <div className="space-y-2">
            {[
              { label: 'Nova Ordem de Serviço', to: '/orders', icon: PlusIcon, variant: 'primary' as const },
              { label: 'Novo Cliente', to: '/customers', icon: UsersIcon, variant: 'outline' as const },
              { label: 'Ver Estoque', to: '/inventory', icon: PackageIcon, variant: 'outline' as const },
              { label: 'Financeiro', to: '/finance', icon: FinanceIcon, variant: 'outline' as const },
            ].map(a => (
              <Link key={a.to} to={a.to}>
                <Button variant={a.variant} className="w-full justify-start" icon={a.icon} size="sm">{a.label}</Button>
              </Link>
            ))}
          </div>

          {lowStock.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-600 mb-2">Estoque Baixo</p>
              {lowStock.slice(0, 3).map(item => (
                <div key={item.id} className="flex justify-between items-center py-1.5 text-xs">
                  <span className="text-slate-700 truncate">{item.name}</span>
                  <Badge color="bg-red-100 text-red-700">{item.stock} {item.unit || 'un'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent orders */}
      <Card title="Atividade Recente" action={<Link to="/orders"><Button variant="ghost" size="sm">Ver todos →</Button></Link>}>
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    #{order.orderNumber?.slice(-8).toUpperCase()}
                    <span className="ml-2 text-slate-500 font-normal">{order.customer?.name}</span>
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(order.updatedAt || order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {order.priority && order.priority !== 'MEDIUM' && (
                    <Badge color={PRIORITY_COLOR[order.priority as OrderPriority]}>{PRIORITY_LABEL[order.priority as OrderPriority]}</Badge>
                  )}
                  <Badge color={`${STATUS_BG[order.status as OrderStatus]} ${STATUS_COLOR[order.status as OrderStatus]}`}>
                    {STATUS_LABEL[order.status as OrderStatus] || order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">Nenhuma atividade recente.</p>
        )}
      </Card>
    </div>
  );
};

export default DashboardView;
