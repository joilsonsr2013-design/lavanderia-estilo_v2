import React, { useEffect, useState } from 'react';
import { Card, Button, Select, Modal, Alert, Badge, LoadingState } from '../components/ui';
import { productionApi, employeesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatCurrency } from '../utils/helpers';
import { STATUS_LABEL, STATUS_BG, STATUS_COLOR, WORKFLOW_STAGES } from '../constants';
import { OrderStatus } from '../types';
import { RefreshIcon, ProductionIcon } from '../components/icons';
import { PRODUCTION_STATUS_LABEL } from '../constants';

const PROD_COLORS: Record<string, string> = {
  PENDING:       'bg-gray-100 text-gray-700',
  IN_PROGRESS:   'bg-blue-100 text-blue-700',
  QUALITY_CHECK: 'bg-purple-100 text-purple-700',
  COMPLETED:     'bg-green-100 text-green-700',
  ON_HOLD:       'bg-amber-100 text-amber-700',
};

const ProductionView: React.FC = () => {
  const { canManage } = useAuth();
  const [productions, setProductions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ status: '', assignedTo: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');

  const load = async () => {
    setLoading(true);
    try {
      const [p, e] = await Promise.all([
        productionApi.list(),
        canManage ? employeesApi.list({ status: 'ACTIVE' }) : Promise.resolve([])
      ]);
      setProductions(p);
      setEmployees(e);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (prod: any) => {
    setEditing(prod);
    setForm({ status: prod.status, assignedTo: prod.assignedTo || '', notes: prod.notes || '' });
    setError(''); setEditModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await productionApi.update(editing.id, form);
      await load(); setEditModal(false);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Active (non-delivered/cancelled) productions
  const active = productions.filter(p =>
    p.order?.status && ![OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(p.order.status)
  );

  const grouped = WORKFLOW_STAGES.filter(s => s.id !== OrderStatus.CANCELLED && s.id !== OrderStatus.DELIVERED).reduce((acc, stage) => {
    acc[stage.id] = active.filter(p => p.order?.status === stage.id);
    return acc;
  }, {} as Record<string, any[]>);

  const statusOpts = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'IN_PROGRESS', label: 'Em Andamento' },
    { value: 'QUALITY_CHECK', label: 'Controle Qualidade' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'ON_HOLD', label: 'Pausado' },
  ];

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-600">{active.length} tarefa(s) ativa(s) em produção</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(v => v === 'list' ? 'kanban' : 'list')}>
              {viewMode === 'list' ? '🗂 Kanban' : '📋 Lista'}
            </Button>
            <Button variant="outline" size="sm" icon={RefreshIcon} onClick={load}>Atualizar</Button>
          </div>
        </div>
      </Card>

      {active.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-12 text-center">
            <ProductionIcon className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500">Nenhuma tarefa em produção no momento.</p>
          </div>
        </Card>
      ) : viewMode === 'list' ? (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Pedido', 'Cliente', 'Etapa do Pedido', 'Prod. Status', 'Responsável', 'Valor', canManage ? 'Ações' : ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {active.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-brand-600">
                        #{prod.order?.orderNumber?.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{prod.order?.customer?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge color={`${STATUS_BG[prod.order?.status as OrderStatus]} ${STATUS_COLOR[prod.order?.status as OrderStatus]}`}>
                        {STATUS_LABEL[prod.order?.status as OrderStatus] || prod.order?.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={PROD_COLORS[prod.status] || 'bg-gray-100 text-gray-600'}>
                        {PRODUCTION_STATUS_LABEL[prod.status] || prod.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{prod.employee?.name || <span className="text-slate-400 italic">Não atribuído</span>}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(prod.order?.totalAmount || 0)}</td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => openEdit(prod)}>Editar</Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        // Kanban view
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {WORKFLOW_STAGES.filter(s => s.id !== OrderStatus.CANCELLED && s.id !== OrderStatus.DELIVERED).map(stage => {
              const items = grouped[stage.id] || [];
              return (
                <div key={stage.id} className="w-72 shrink-0">
                  <div className={`rounded-xl p-3 mb-3 ${stage.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-bold ${stage.color}`}>{stage.label}</h3>
                      <Badge color={`${stage.bgColor} ${stage.color}`}>{items.length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {items.map(prod => (
                      <div key={prod.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-xs font-bold text-brand-600">
                            #{prod.order?.orderNumber?.slice(-8).toUpperCase()}
                          </span>
                          <Badge color={PROD_COLORS[prod.status]}>{PRODUCTION_STATUS_LABEL[prod.status]}</Badge>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">{prod.order?.customer?.name}</p>
                        <p className="text-xs text-slate-500 mb-2">{formatCurrency(prod.order?.totalAmount || 0)}</p>
                        {prod.employee && <p className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">👤 {prod.employee.name}</p>}
                        {prod.notes && <p className="text-xs text-slate-500 mt-2 italic">{prod.notes}</p>}
                        {canManage && (
                          <Button size="sm" variant="ghost" className="w-full mt-2" onClick={() => openEdit(prod)}>Editar</Button>
                        )}
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        Nenhum item aqui
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Production Modal */}
      {canManage && (
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Editar Produção"
          footer={<>
            <Button variant="outline" onClick={() => setEditModal(false)}>Cancelar</Button>
            <Button type="submit" form="prodForm" isLoading={saving}>Salvar</Button>
          </>}>
          {error && <Alert type="error" message={error} className="mb-4" />}
          {editing && (
            <div className="mb-4 p-3 bg-slate-50 rounded-xl text-sm">
              <p className="font-bold text-slate-700">Pedido #{editing.order?.orderNumber?.slice(-8).toUpperCase()}</p>
              <p className="text-slate-500">{editing.order?.customer?.name}</p>
            </div>
          )}
          <form id="prodForm" onSubmit={handleSave} className="space-y-4">
            <Select label="Status de Produção" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={statusOpts} />
            <Select label="Responsável" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
              options={employees.map(e => ({ value: e.id, label: `${e.name} (${e.department || e.role})` }))}
              placeholder="Não atribuído" />
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Observações</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3} placeholder="Notas sobre esta etapa..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProductionView;
